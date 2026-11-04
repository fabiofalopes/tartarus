import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import z from "zod"
import { Config } from "../../config/config"
import { Provider } from "../../provider/provider"
import { ModelsDev } from "../../provider/models"
import { Session } from "../../session"
import { SessionPrompt } from "../../session/prompt"
import { Agent } from "../../agent/agent"
import { mapValues } from "remeda"
import { errors } from "../error"
import { lazy } from "../../util/lazy"

const OpenAIModel = z.object({
  id: z.string(),
  object: z.literal("model"),
  created: z.number(),
  owned_by: z.string(),
})

const ChatMessage = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.union([z.string(), z.array(z.any())]).optional(),
  name: z.string().optional(),
})

const ChatCompletionRequest = z.object({
  model: z.string(),
  messages: z.array(ChatMessage),
  stream: z.boolean().optional(),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  tools: z.array(z.any()).optional(),
})

export const OpenAIRoutes = lazy(() =>
  new Hono()
    .get(
      "/models",
      describeRoute({
        summary: "List models (OpenAI-compatible)",
        operationId: "openai.models",
        responses: { 200: { description: "Model list" } },
      }),
      async (c) => {
        const all = await ModelsDev.get()
        const out: { id: string; owned_by: string }[] = []
        for (const [key, value] of Object.entries(all)) {
          for (const mid of Object.keys((value as any).models ?? {})) {
            out.push({ id: `${key}/${mid}`, owned_by: key })
          }
        }
        return c.json({
          object: "list",
          data: out.map((m) => ({ id: m.id, object: "model", created: 0, owned_by: m.owned_by })),
        })
      },
    )
    .post(
      "/chat/completions",
      describeRoute({
        summary: "Chat completions (OpenAI-compatible)",
        operationId: "openai.chat.completions",
        responses: { 200: { description: "Completion" } },
      }),
      validator("json", ChatCompletionRequest),
      async (c) => {
        const body = c.req.valid("json")
        const [providerID, ...rest] = body.model.split("/")
        const modelID = rest.join("/")
        if (!providerID || !modelID) return c.json({ error: { message: "model must be provider/model" } }, 400)

        const messages = body.messages ?? []
        const system = messages.filter((m) => m.role === "system").map((m) => (typeof m.content === "string" ? m.content : "")).join("\n")
        const lastUser = [...messages].reverse().find((m) => m.role === "user")
        const text = typeof lastUser?.content === "string" ? lastUser.content : JSON.stringify(lastUser?.content ?? "")

        const id = `chatcmpl-${crypto.randomUUID()}`
        const created = Math.floor(Date.now() / 1000)

        const session = await Session.create({ title: "openai-gateway" })
        const agent = await Agent.get("build").catch(() => undefined)
        await SessionPrompt.prompt({
          sessionID: session.id,
          agent: agent?.name,
          model: { providerID: providerID as any, modelID: modelID as any },
          system: system || undefined,
          parts: [{ type: "text", text }],
        })

        const msgs = await Session.messages({ sessionID: session.id })
        const lastAssistant = [...msgs].reverse().find((m: any) => m.info.role === "assistant")
        const content = (lastAssistant?.parts ?? [])
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text)
          .join("")

        if (body.stream) {
          // Single-chunk SSE for now; true token streaming is a follow-up.
          const chunk = {
            id,
            object: "chat.completion.chunk",
            created,
            model: body.model,
            choices: [{ index: 0, delta: { role: "assistant", content }, finish_reason: "stop" }],
          }
          c.header("Content-Type", "text/event-stream")
          c.header("Cache-Control", "no-cache")
          return c.text(`data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`)
        }

        return c.json({
          id,
          object: "chat.completion",
          created,
          model: body.model,
          choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        })
      },
    )

)
