import { describe, expect, test } from "bun:test"
import { APICallError } from "ai"
import { ProviderError } from "@/provider/error"
import { ProviderID } from "@/provider/schema"

function error(input: { message?: string; statusCode?: number; responseBody?: string }) {
  return new APICallError({
    message: input.message ?? "",
    url: "https://example.test",
    requestBodyValues: {},
    statusCode: input.statusCode,
    responseBody: input.responseBody,
  })
}

const id = (s: string) => s as ProviderID

describe("ProviderError.parseAPICallError", () => {
  test("LiteLLM context window exceeded text classifies as overflow", () => {
    const parsed = ProviderError.parseAPICallError({
      providerID: id("opencode"),
      error: error({ message: "ContextWindowExceededError: context window exceeded", statusCode: 400 }),
    })
    expect(parsed.type).toBe("context_overflow")
  })

  test("429 with overflow wording is a throttle, not context overflow (upstream #59649)", () => {
    const parsed = ProviderError.parseAPICallError({
      providerID: id("opencode"),
      error: error({ message: "context window exceeded", statusCode: 429 }),
    })
    expect(parsed.type).toBe("api_error")
  })

  test("FreeUsageLimitError body maps to a non-retryable friendly error", () => {
    const parsed = ProviderError.parseAPICallError({
      providerID: id("opencode"),
      error: error({
        message: "429",
        statusCode: 429,
        responseBody: JSON.stringify({
          type: "error",
          error: {
            type: "FreeUsageLimitError",
            message: "Free usage limit reached. Free models work in OpenCode (https://opencode.ai)",
          },
        }),
      }),
    })
    expect(parsed.type).toBe("api_error")
    if (parsed.type !== "api_error") return
    expect(parsed.isRetryable).toBe(false)
    expect(parsed.message).toContain("Free usage limit reached")
  })

  test("context_length_exceeded code still classifies as overflow on 400", () => {
    const parsed = ProviderError.parseAPICallError({
      providerID: id("openai"),
      error: error({
        message: "400",
        statusCode: 400,
        responseBody: JSON.stringify({ error: { code: "context_length_exceeded" } }),
      }),
    })
    expect(parsed.type).toBe("context_overflow")
  })
})
