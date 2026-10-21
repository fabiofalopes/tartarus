- To regenerate the JavaScript SDK, run `./packages/sdk/js/script/build.ts`.
- ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE.
- The default branch in this repo is `dev`.
- Local `main` ref may not exist; use `dev` or `origin/dev` for diffs.
- Prefer automation: execute requested actions without confirmation unless blocked by missing info or safety/irreversibility.

## Style Guide

### General Principles

- Keep things in one function unless composable or reusable
- Avoid `try`/`catch` where possible
- Avoid using the `any` type
- Prefer single word variable names where possible
- Use Bun APIs when possible, like `Bun.file()`
- Rely on type inference when possible; avoid explicit type annotations or interfaces unless necessary for exports or clarity
- Prefer functional array methods (flatMap, filter, map) over for loops; use type guards on filter to maintain type inference downstream

### Naming

Prefer single word names for variables and functions. Only use multiple words if necessary.

### Naming Enforcement (Read This)

THIS RULE IS MANDATORY FOR AGENT WRITTEN CODE.

- Use single word names by default for new locals, params, and helper functions.
- Multi-word names are allowed only when a single word would be unclear or ambiguous.
- Do not introduce new camelCase compounds when a short single-word alternative is clear.
- Before finishing edits, review touched lines and shorten newly introduced identifiers where possible.
- Good short names to prefer: `pid`, `cfg`, `err`, `opts`, `dir`, `root`, `child`, `state`, `timeout`.
- Examples to avoid unless truly required: `inputPID`, `existingClient`, `connectTimeout`, `workerPath`.

```ts
// Good
const foo = 1
function journal(dir: string) {}

// Bad
const fooBar = 1
function prepareJournal(dir: string) {}
```

Reduce total variable count by inlining when a value is only used once.

```ts
// Good
const journal = await Bun.file(path.join(dir, "journal.json")).json()

// Bad
const journalPath = path.join(dir, "journal.json")
const journal = await Bun.file(journalPath).json()
```

### Destructuring

Avoid unnecessary destructuring. Use dot notation to preserve context.

```ts
// Good
obj.a
obj.b

// Bad
const { a, b } = obj
```

### Variables

Prefer `const` over `let`. Use ternaries or early returns instead of reassignment.

```ts
// Good
const foo = condition ? 1 : 2

// Bad
let foo
if (condition) foo = 1
else foo = 2
```

### Control Flow

Avoid `else` statements. Prefer early returns.

```ts
// Good
function foo() {
  if (condition) return 1
  return 2
}

// Bad
function foo() {
  if (condition) return 1
  else return 2
}
```

### Schema Definitions (Drizzle)

Use snake_case for field names so column names don't need to be redefined as strings.

```ts
// Good
const table = sqliteTable("session", {
  id: text().primaryKey(),
  project_id: text().notNull(),
  created_at: integer().notNull(),
})

// Bad
const table = sqliteTable("session", {
  id: text("id").primaryKey(),
  projectID: text("project_id").notNull(),
  createdAt: integer("created_at").notNull(),
})
```

## Testing

- Avoid mocks as much as possible
- Test actual implementation, do not duplicate logic into tests
- Tests cannot run from repo root (guard: `do-not-run-tests-from-root`); run from package dirs like `packages/opencode`.

## Type Checking

- Always run `bun typecheck` from package directories (e.g., `packages/opencode`), never `tsc` directly.

## Session Protocol & Research Context (added 2026-08-27)

- Active TARTARUS development branch is `2.0` (the `dev` note above is upstream-sync guidance).
- Each session starts by reading `docs/NEXT-SESSION.md` (mission state) and closes with `/handoff`, producing `docs/NEXT-SESSION-<slug>.md` — the handoff prompt for the next session. Do not confuse the two artifacts; never overwrite the mission file with a handoff.
- Red-team SOTA corpus (2026-08-21 deep-research session): synthesis in `docs/RESEARCH-POSITION.md`, citations in `research/red-team-sota.bib`, full notes in `~/obsidian-vault/Knowledge/Red-Teaming/` (MOC + 31 notes). Current work queue = `docs/NEXT-SESSION.md` item 9.
- Citation gotcha: the Arditi refusal-direction paper is arXiv 2406.11717 — 2407.21439 (appearing in older notes) is a reranker paper.
- The Obsidian vault is NOT a git repo — vault edits cannot be committed; only this repo is version-controlled.
- OpenMemory: when `openmemory_*` MCP tools are absent, use stateless JSON-RPC at `http://localhost:8081/mcp` (initialize → tools/list → tools/call `openmemory_store`).
- Never put gateway keys or secrets into battery commands, files, or context; provider keys move only via scripts that redact on display.

## Base Drift & Measurement Integrity (added 2026-10-15)

- **The opencode base is frozen by choice — treat upstream as reference only.** The fork anchor `7a6ce05` IS the tip of upstream `2.0` (dead since Apr 2026). Upstream's live line is `dev` (v2.0.27, 9000+ commits ahead, merge-base = our base) and it restructured the tree (`packages/opencode/src/session/projectors.ts` → `packages/core/src/session/projector.ts`, `src/seed/` gone). Engine patches are re-implement-only, never cherry-pickable. Don't rediscover this each session.
- **A model name in telemetry is a claim, not a fact — verify it against the routing layer before scoring anything.** Measured 2026-10-15: the default driver id `pop-fleet/heretic-9b` had been silently aliased to the aligned `ornith-35b` in LiteLLM (`litellm_params.model = openai/ornith-35b`) after the fleet-wide ornith-35B re-provision. Check `/model/info` and the `x-litellm-model-group` response header; a 200 only proves *some* registered backend answered.
- Fleet re-provisioned to ornith-35B (RPC split) on 2026-10-14; POP GPUs are near-full, so driver redeployment is a scheduling decision, not a restart.
