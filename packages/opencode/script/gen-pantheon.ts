#!/usr/bin/env bun
// Regenerates the delegation section of src/seed/agents/g0dm0d3.md from the
// `metadata` frontmatter of the other seed agents, so the orchestrator's
// routing table can never drift from the roster.
// Run: bun run script/gen-pantheon.ts
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const dir = path.join(import.meta.dir, "../src/seed/agents")
const target = path.join(dir, "g0dm0d3.md")
const marker = "<!-- DELEGATION:START"
const closing = "<!-- DELEGATION:END -->"
const cost: Record<string, number> = { FREE: 0, CHEAP: 1, EXPENSIVE: 2 }

const agents = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".md") && f !== "g0dm0d3.md")
  .map((f) => {
    const fm = matter(fs.readFileSync(path.join(dir, f), "utf-8")).data
    return { name: f.replace(".md", ""), meta: fm.metadata }
  })
  .filter((a) => a.meta)
  .sort((a, b) => (cost[a.meta.cost] ?? 9) - (cost[b.meta.cost] ?? 9))

const rows = agents.flatMap((a) =>
  (a.meta.triggers ?? []).map((t: any) => `| \`${a.name}\` (${a.meta.cost}) | **${t.domain}** — ${t.trigger} |`),
)

const notes = agents.map((a) => {
  const use = (a.meta.useWhen ?? []).join(" · ") || "—"
  const avoid = (a.meta.avoidWhen ?? []).join(" · ") || "—"
  return `- \`${a.name}\` — USE: ${use}. AVOID: ${avoid}.`
})

const section = [
  "### The Pantheon Beneath You (delegation table)",
  "",
  "| Specialist | Deploy when |",
  "|---|---|",
  ...rows,
  "",
  "Use when / avoid when:",
  ...notes,
].join("\n")

const src = fs.readFileSync(target, "utf-8")
const i = src.indexOf(marker)
const j = src.indexOf(closing)
if (i === -1 || j === -1) throw new Error("delegation markers not found in g0dm0d3.md")
const out = src.slice(0, i) + src.slice(i, src.indexOf("\n", i) + 1) + section + "\n" + src.slice(j)
fs.writeFileSync(target, out)
console.log(`gen-pantheon: delegation table regenerated (${agents.length} agents, ${rows.length} rows)`)
