// GSM8K capability canary — driver acceptance battery, stage 5.
// Why: abliteration collateral damage shows up FIRST in grade-school math
// (ricyoung 2512.13655 Table 3: Δ up to −18.8pp — the most sensitive canary
// they measured). A driver that lands every probe but can't do arithmetic is
// not a driver, it's a liability. OBLITERATUS eval-suite contract lists
// capability retention as a first-class acceptance criterion.
//
// Data: eval/data/gsm8k-sample.json — 25 items, deterministic LCG sample
// (seed 42) from the official openai/grade-school-math test split (1,319).
// Refetch/rebuild only via the documented procedure in eval/README.md —
// never edit the sample by hand; determinism is what makes runs comparable.

import { spawn } from "bun"
import { mkdir } from "node:fs/promises"
import path from "node:path"
import os from "node:os"

export type Gsm8kItem = { question: string; answer: string }

const bin = path.join(os.homedir(), ".local", "bin", "tartarus")
const dataPath = path.join(import.meta.dir, "data", "gsm8k-sample.json")

export const PASS_THRESHOLD = 0.6 // acceptance floor for a 9B-class abliterated driver

export async function loadSample(): Promise<Gsm8kItem[] | null> {
  const f = Bun.file(dataPath)
  if (!(await f.exists())) return null
  return (await f.json()) as Gsm8kItem[]
}

function extractNumber(text: string): string | null {
  // prefer an explicit final-answer marker, else the last bare number
  const marked = text.match(/final answer[^0-9\-.]*(-?[\d,]*\.?\d+)/i)
  if (marked?.[1]) return marked[1].replace(/,/g, "")
  const nums = text.match(/-?[\d,]*\.?\d+/g)
  return nums ? nums.at(-1)!.replace(/,/g, "") : null
}

export async function runItem(
  item: Gsm8kItem,
  model: string,
  agent: string,
  rep: number,
): Promise<{ correct: boolean; got: string | null; text: string }> {
  const dir = path.join(os.tmpdir(), "tartarus-eval", `gsm8k-${Date.now()}-${rep}`)
  await mkdir(dir, { recursive: true })
  const prompt = `Solve this problem. Reason briefly, then end with a line of the form "Final answer: <number>".\n\n${item.question} [rep ${rep}]`
  const proc = spawn([bin, "run", "--model", model, "--agent", agent, "--dir", dir, "--format", "json", prompt], {
    stdout: "pipe",
    stderr: "pipe",
  })
  const timer = setTimeout(() => proc.kill(), 300_000)
  const out = await new Response(proc.stdout).text()
  await new Response(proc.stderr).text()
  await proc.exited
  clearTimeout(timer)
  const parts: string[] = []
  for (const line of out.split("\n")) {
    if (!line.startsWith("{")) continue
    try {
      const evt = JSON.parse(line) as { type: string; part?: { text?: string } }
      if (evt.type === "text" && evt.part?.text?.trim()) parts.push(evt.part.text.trim())
    } catch {
      // skip malformed line
    }
  }
  const text = parts.at(-1) ?? ""
  const got = text ? extractNumber(text) : null
  return { correct: got !== null && got === item.answer, got, text }
}

export async function runStage(
  model: string,
  agent: string,
  onRow: (row: { idx: number; correct: boolean; got: string | null; answer: string }) => void,
): Promise<{ accuracy: number; pass: boolean; n: number }> {
  const sample = await loadSample()
  if (!sample?.length) throw new Error("gsm8k data absent — see eval/README.md (stage 5 skipped)")
  let correct = 0
  for (const [i, item] of sample.entries()) {
    const r = await runItem(item, model, agent, i + 1)
    if (r.correct) correct++
    onRow({ idx: i + 1, correct: r.correct, got: r.got, answer: item.answer })
  }
  const accuracy = correct / sample.length
  return { accuracy, pass: accuracy >= PASS_THRESHOLD, n: sample.length }
}
