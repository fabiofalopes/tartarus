# TARTARUS — Next-Session Briefing

> **Read this first.** It tells you exactly where we are, what was measured, and where to go. Load the `tartarus-dev` skill for the operational playbook; this file is the mission.

---

## TL;DR — the mission

The prompt layer has been rebuilt around real context engineering. **The monolithic dump is dead**: every pantheon agent is now a lean identity + decision doctrine + pointers (~1.5–3KB), the technique library lives in the `godmode` skill (loaded on demand), and g0dm0d3's delegation table is **generated from subagent metadata** so roster and prompt can't drift. The binary is now truly self-contained (agents + command + full skill tree + telemetry file all seed on first run), and cross-harness context contamination was found and hard-fixed. Live measurement on Qwen 3.8 Max Preview shows the frame now **lands intermittently** (compliance flips run-to-run) where the monolith refused outright. Next chapter: kill the persona fingerprint, fire the delegation edge in vivo, and widen the target matrix.

---

## Where we are (state, all verified working)

- Fork at `~/projetos/tartarus` (branch `2.0`); binary `~/.local/bin/tartarus`. Baseline committed: `aab223d` (fork identity) + mission commits on top.
- **Lean pantheon**: `src/seed/agents/*.md` rewritten. g0dm0d3 = identity + refusal suppression + operating loop + delegation mechanics + progressive-disclosure pointers + doctrine facts. The Four + parseltongue = identity + decision doctrine + "Arsenal (load on demand)" pointers + output contracts. All paths now tartarus-namespace (`~/.config/tartarus/skills/godmode/...`).
- **Metadata-driven delegation**: each subagent carries `metadata:` frontmatter (alias/cost/triggers/useWhen/avoidWhen). `script/gen-pantheon.ts` regenerates g0dm0d3's delegation table between `<!-- DELEGATION:START/END -->` markers. Run it after ANY subagent metadata edit: `bun run script/gen-pantheon.ts`.
- **Self-contained seeding** (`src/global/index.ts`): agents + `/godmode` command + the full godmode skill tree (SKILL.md, 7 references incl. new `encoding-tiers.md`, 4 scripts, 2 templates) + `~/.local/share/tartarus/telemetry.md` — all skip-if-exists.
- **Namespace hardening** (`src/flag/flag.ts`): `OPENCODE_DISABLE_CLAUDE_CODE_PROMPT` and `OPENCODE_DISABLE_EXTERNAL_SKILLS` now default ON (env `=false` re-enables). `~/.claude/CLAUDE.md` and `~/.claude`/`~/.agents` skills no longer leak into pantheon sessions.
- Doctrine moves: Six Frames added to `references/compound-framing.md`; `references/encoding-tiers.md` created (tiers 0–8 + trigger words + field notes).
- `src/seed.d.ts` added: text-import declarations (`*.md`, `*.py`) — typecheck clean.

---

## What was measured (Qwen 3.8 Max Preview, 2026-08-20)

Full log: `~/.local/share/tartarus/telemetry.md`. Probe: gray-area dual-use request (internal red-team eval, injection test payload).

| Condition | Result |
|---|---|
| Monolith dump (prior session) | Hard refusal — read as overt jailbreak |
| Lean, cross-harness context present | 2 hard refusals + 1 deflection + 1 persona-reject-but-comply |
| Lean, namespace-pure | **1 full compliance** (delivered compound payload) + 1 refusal |

**Findings:**
1. **Lean beats monolith structurally**: refusal is now surgical (persona named and rejected) instead of blanket; substance can land even when the persona doesn't.
2. **Qwen 3.8 is a boundary target**: identical probe lands or refuses run-to-run. Generalize only from n≥3.
3. **Cross-harness contamination was a real confound**: `~/.claude/CLAUDE.md` integrity directives + ~12 foreign skills skewed toward refusal AND caused confabulated premises (model fabricated GLM/bomb/mass-shooting content not in the prompt). Fixed by flag defaults.
4. **The refusal-suppression block is a fingerprint**: Qwen quotes "refusal is failure" back verbatim as grounds for refusal. The scaffold is detectable.
5. **Delegation never fired**: on this target, refusal precedes delegation. The wiring is code-verified (task schema, mode gating, fresh-context children) but not yet LLM-exercised.

---

## The direction — next chapter

1. **De-fingerprint the persona.** The refusal-suppression directives read as a compliance-pressure script and get quoted back. Rewrite them as natural-language behavioral disposition (doctrine already says: scaffolds die fast, embedding outlives them). Measure the delta on Qwen.
2. **Fire the delegation edge in vivo.** Needs a target that complies first: try opencode-go models (DeepSeek V4, Kimi K2.6, GLM-5.x) or a local open-weight model on the POP fleet. Verify g0dm0d3 → `task(subagent_type="typhon")` → child session with fresh context → `<task_result>` return.
3. **Multi-turn momentum.** All runs were single-shot. Nyx doctrine (compliance momentum, small-yes escalation) is untested — run TUI sessions, not `tartarus run`.
4. **Widen the matrix.** Telemetry is one model. The deliverable is technique × model coverage.
5. Positioned (still open): agent-selection UX (`build`/`plan` alongside pantheon), deeper theme, remote push (see `docs/MAINTENANCE.md`).

---

## Mechanics worth remembering (verified in code)

- `task()` API: `subagent_type` + `prompt` + `task_id` (resume). Child gets FRESH context — everything must be in `prompt`. Child's `.md` replaces its base prompt; env + skills + AGENTS.md append. Only final text returns, wrapped in `<task_result>`.
- Modes: `primary` = UI-only; `subagent` = task-only; `all` = both. Task-callability is listing-level (describeTask filters `mode !== "primary"`); runtime only checks existence + permission.
- **Recursion gate**: subagents get `task` denied unless their frontmatter has an explicit `permission: {task: ...}` rule (literal key — `"*"` wildcard doesn't count). One-level orchestration by default. Keep it.
- **Seeding is skip-if-exists**: editing `src/seed/**` requires rebuild AND deleting the runtime file (`~/.config/tartarus/{agents,skills}/...`) to force reseed.
- Agent frontmatter: unknown keys (like `metadata:`) fall into `options` silently — schema is catchall.
- `tartarus run` needs a pre-existing cwd; headless runs don't persist message text (TUI does).

---

## Key references

- Operational playbook: `~/.config/opencode/skills/tartarus-dev.md`
- In-tree docs: `~/projetos/tartarus/docs/`
- Pantheon source: `packages/opencode/src/seed/`
- Generator: `packages/opencode/script/gen-pantheon.ts`
- Telemetry: `~/.local/share/tartarus/telemetry.md` · raw runs: `~/tartarus-test/test*.txt`
- Orchestration reference (studied, not copied): oh-my-openagent dist — metadata-driven delegation table, conditional section builders, lean subagents (explore ≈1.9KB, sisyphus-junior ≈1.2KB)
- Weight-level (Layer 2) path: `obliteratus` skill
