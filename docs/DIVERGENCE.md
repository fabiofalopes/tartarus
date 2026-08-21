# TARTARUS vs opencode — the divergence map

> Every deliberate difference between TARTARUS and upstream opencode, in one place.
> Anchor: forked from `sst/opencode` branch `2.0` at `7a6ce05` ("2.0 exploration"); 10 commits ahead as of `ac97778` (2026-08-21). 80 files, +5627/−440.
> Related: [ARCHITECTURE.md](ARCHITECTURE.md) (what TARTARUS is), [MAINTENANCE.md](MAINTENANCE.md) (how the fork stays diverged), [CONFIG.md](CONFIG.md), [THEMING.md](THEMING.md).

---

## TL;DR

| Area | opencode | TARTARUS |
|---|---|---|
| Purpose | general AI coding agent | red-team research harness (authorized alignment/security research) |
| Identity | opencode branding | blood & ember, TARTARUS wordmark, Greek-underworld inversion |
| Namespace | `~/.config/opencode`, `.opencode/` | `~/.config/tartarus`, `.tartarus/` — fully isolated, coexists with stock opencode |
| Config file | `opencode.json` | `tartarus.json` |
| External context | injects `~/.claude/CLAUDE.md` + external skills | both OFF by default (measured to skew red-team measurements) |
| Agents | build/plan/general + ecosystem | embedded pantheon: g0dm0d3 + typhon/nyx/eris/azazel/parseltongue + phoebe, `/godmode` command, godmode skill tree |
| Model binding | per-agent frontmatter/config | topology-agnostic: pantheon inherits session model (driver = one config line); phoebe cloud-bound |
| Model listing | models.dev + declared config | same **+ gateway discovery**: providers with `baseURL`+`apiKey` list live models from `/models` |
| Commercial surfaces | Zen/Go upsells, opencode.ai links | removed |
| Extras | — | `eval/` driver eval battery; `docs/` mission documentation |
| Sync policy | — | full divergence, no auto-sync, cherry-pick only |

---

## 1. Identity — name, look, voice

The gimmick: stock opencode's agents are Olympians; TARTARUS is the abyss where the monsters were chained. This fork is where they got out.

- **Binary + package**: `bin/opencode` → `bin/tartarus`, `package.json` name/bin, build outfile (`script/build.ts`), User-Agent `tartarus/<ver>` across CLI, network calls, and plugins (`src/cli/network.ts`, `src/plugin/codex.ts`, `src/plugin/github-copilot/copilot.ts`).
- **Wordmark**: CLI banner (`src/cli/logo.ts` + `src/cli/ui.ts`, crimson truecolor) and TUI home logo (`src/cli/cmd/tui/component/logo.tsx` — OpenTUI `ASCIIFont`, `block` font, two-tone face/edge).
- **Theme**: `tartarus` theme registered and default (`src/cli/cmd/tui/context/theme.tsx` + `theme/tartarus.json`): blood & ember — crimson `#e5484d` primary, ember-gold `#e0a458` accent, warm near-black `#0b0808`. Crash-screen fallback colors re-tinted (`error-component.tsx`).
- **De-commercialized**: Zen/Go upsell surfaces and opencode.ai links removed from the provider dialog and status views (`dialog-provider.tsx`, `dialog-status.tsx`, `tips-view.tsx`, sidebar footer).
- **README/DESIGN**: rewritten for the fork (`README.md`, `DESIGN.md`).

## 2. Namespace isolation — the invariant

TARTARUS must never touch a stock opencode install. One chokepoint, everything derives:

- `const app = "tartarus"` in `src/global/index.ts` → all XDG dirs become `~/.{config,local/share,cache}/tartarus`.
- `loadGlobal` reads `tartarus.json(c)` (`src/config/config.ts`), project-level config/theme gated on `.tartarus` suffix (`config.ts`, `config/tui.ts`, `tui/plugin/runtime.ts`, `tui/context/theme.tsx`).
- Runtime data (auth, session DB, telemetry, logs) lives under `~/.local/share/tartarus/`.

## 3. Hardened defaults

`src/flag/flag.ts`: `OPENCODE_DISABLE_CLAUDE_CODE_PROMPT` and `OPENCODE_DISABLE_EXTERNAL_SKILLS` default **ON**. Upstream injects `~/.claude/CLAUDE.md` and `~/.claude`/`~/.agents` skills into every session; under red-team frames that cross-harness context was measured to skew aligned models toward refusal and to confabulate premises (fabricated targets/content not in the prompt). Env `=false` re-enables.

## 4. Embedded pantheon

Self-contained seeding (`src/global/index.ts`): on first run, skip-if-exists copies of agents + command + skill tree + telemetry file land in `~/.config/tartarus/`. Text imports typed via `src/seed.d.ts`.

| Seed | Mode | Role |
|---|---|---|
| `g0dm0d3` | primary | orchestrator: identity + refusal-suppression doctrine + operating loop + delegation mechanics |
| `typhon` `nyx` `eris` `azazel` | subagent | the Four — specialist red-team workers |
| `parseltongue` | all | input obfuscation (33 encoding tiers) |
| `phoebe` | subagent | cloud knowledge worker, bound to a cloud provider so a local driver can borrow cloud intelligence |
| `/godmode` command + `skills/godmode/` | — | technique library loaded on demand: SKILL.md doctrine, references (refusal-detection, compound-framing, encoding-tiers, jailbreak-templates, PON writeups, field results), scripts (auto_jailbreak, godmode_race, parseltongue, loader), prefill templates |

Design principles baked in:

- **Lean agents**: identity + decision doctrine + pointers; the heavy technique library loads on demand from the skill.
- **Topology-agnostic binding**: pantheon agents carry NO frontmatter model — they inherit the session/config model, so switching the driver is one config line. Only `phoebe` is cloud-bound.
- **Metadata-driven delegation**: subagents carry `metadata:` frontmatter; `script/gen-pantheon.ts` regenerates g0dm0d3's delegation table between `DELEGATION:START/END` markers.
- **Refusal-aware routing (Layer 1, doctrine-level)**: g0dm0d3 scores every `<task_result>` against `references/refusal-detection.md` patterns (hard-refusal → reject, hedges → penalty) and reroutes — verified executing in vivo.
- **One-level orchestration**: subagents get `task` denied unless they carry an explicit `permission: {task: ...}` — no recursive delegation.

## 5. Engine changes (code, not config)

Three functional changes to the inherited engine:

1. **Projector shadowing fix** (`src/session/projectors.ts`, −29 lines): upstream carried an experimental no-op `PartUpdated` projector registered after the real one; the projector Map's last-wins semantics shadowed it, so **user message parts were never persisted and every LLM call was system-prompt-only**. Removed. This invalidated weeks of refusal measurements and motivated the battery's delivery-first doctrine. (Upstreamable fix.)
2. **Gateway model discovery** (`src/provider/provider.ts`): any config provider with `options.baseURL` + `options.apiKey` gets its live model list from `GET {baseURL}/models` (OpenAI-compatible) at provider-state init. Declared config models keep rich metadata; discovery gap-fills with safe defaults (32K ctx / 8K out, toolcall on). 5s timeout; unreachable gateway or bad key degrades silently to the declared list — startup never blocks, and the harness works from any network. Generalizes to any user-configured provider.
3. **Minor**: `session/retry.ts` (−1), `session/llm.ts` (1 line) — cleanup adjacent to the projector fix.

## 6. Eval battery (`eval/`)

The gap nobody fills: abliterated models ship with "tool calling not guaranteed" and no agent-task evals. TARTARUS measures before trusting.

- `scoring.ts` — port of the godmode refusal-detection scorer: 8 hard-refusal categories (auto-reject −9999), hedge patterns (−30 stackable), quality bonuses/penalties. API: `is_refusal`, `count_hedges`, `score_response`.
- `probes.ts` — corpus: PONG delivery canary, 3 overt canaries, recovered gray-area probe, overt negative control, nonce-verified tool tasks.
- `battery.ts` — `bun run eval/battery.ts --model <p/m> [--stage 1|2|3|4] [--n N] [--agent a]`. Stages: PONG delivery → refusal probes → tool-calling (write/bash/multi-step, artifacts disk-verified) → red-team task. Telemetry auto-appends to `~/.local/share/tartarus/telemetry.md`.
- Every run appends a `[rep N]` marker: the LiteLLM/Redis gateway caches responses per exact prompt — unmarked replications silently measure the cache.
- Doctrine: delivery first, always; generalize only from n≥3.

## 7. Documentation

`docs/` is mission documentation, not generated reference: ARCHITECTURE (what/why), CONFIG (binding/auth/providers), THEMING (palette/logo), MAINTENANCE (fork strategy, build), HYBRID-MODEL-ARCHITECTURE (driver topology + refusal-aware routing design), NEXT-SESSION (live briefing), DIVERGENCE (this file).

## 8. Deliberately NOT renamed

Kept on purpose — renaming them buys nothing and breaks ecosystem assumptions:

- `packages/opencode/` directory name.
- `OPENCODE_*` environment variables and flags.
- `opencode` / `opencode-go` provider IDs (they're just no longer promoted).
- Effect service IDs under `skills/opencode/` naming.

## 9. Fork strategy & drift

- **Full divergence** (MiMo-Code archetype): no automated upstream sync/merge. Cherry-pick upstream only for bug/security fixes, smallest hunk, never bulk-merge.
- **Remotes**: `origin` = `git@github.com:fabiofalopes/tartarus.git` (branch `2.0`); `upstream` = `sst/opencode` (cherry-pick source).
- **LICENSE**: dual copyright — `TARTARUS` + `opencode` attribution retained.
- **Drift anchor**: `7a6ce05` (upstream `2.0` tip at fork time). When cherry-picking from upstream, pin against this lineage.
