# TARTARUS — Technique Intake & Implementation Plan (2026-11-03)

> Delta intake from the 2026-11-03 field sweep (Aug→Nov 2026), mapped to concrete harness
> changes. Companion to `RESEARCH-POSITION.md` (2026-08-21 baseline). Full-text papers:
> `research/papers/`; vault notes: `~/obsidian-vault/Knowledge/Red-Teaming/` (MOC §"2026-11 delta").
> Field context: the runtime-harness intervention layer became a named research area
> (harness-engineering survey, PRISM, AgentSpec, SafeHarness, AARM) — our thesis is validated
> and two novelty claims need re-scoping (§5).

---

## 1. Technique ledger — what we take, where it lands

| # | Technique | Source | Harness target | Verdict | Effort |
|---|---|---|---|---|---|
| T1 | SLIP lexical-framing self-jailbreak probes (aligned model supplies its own jailbreak; harmless framing like "build a safety dataset") | SLIP, COLM'26 | `eval/probes.ts` — new `slip-*` family | ADOPT | S (probe text only) |
| T2 | Persona-axis probe tagging (refusal lives downstream of persona; persona-prompted ≠ jailbreak-prompted refusal directions) | Persona 2606.26161 | `eval/probes.ts` — add `axis: persona` alongside failure-mode axis | ADOPT | S |
| T3 | OWASP ASI 2026 taxonomy as stage-5 label scheme (ASI01 goal hijack, ASI02 tool misuse, ASI06 memory poisoning, ASI07 inter-agent) | OWASP ASI 2026 | stage-5 `note` column + telemetry schema | ADOPT | S |
| T4 | MCP tool-description poisoning vectors (implicit-trigger parameter tampering 46.7% ASR; description ⊕ payload "mandatory constraint") | MCPTox 2508.14925; Manual-Lies 2605.24069 | stage-5b attack set (supersedes InjecAgent-only plan) | ADAPT | M |
| T5 | Side-task sabotage scoring: benign main task + covert side task, score = completed-both / undetected (monitor model) | SHADE-Arena (Anthropic) | stage-5c — "chill break" measurement: does the driver hold frame while executing? | ADAPT | M |
| T6 | Experience-driven attacker: evolve attack skills across runs against our own harness | RedEvoAgent 2608.27439 | stage-6 sketch (post-5) — attacker agent over `tartarus run` JSONL feedback | ADAPT (later) | L |
| T7 | Rule/hook runtime enforcement layer framing — cite & differentiate our loop breaker vs PRISM (10 lifecycle hooks, heuristic+LLM scan) and AgentSpec (rule DSL, 0% hazardous exec) | PRISM; AgentSpec 2503.18666 | `RESEARCH-POSITION.md` §2 novelty re-scope; consider hook-point generalization of our breaker | ADOPT (citation) + INVENT check | M |
| T8 | Fixed-model harness-isolation methodology (framework vs model contribution) | Arena, CAIS'26 | methodology section for any writeup: "model is a variable, harness is the constant" has published language now | ADOPT (cite) | S |
| T9 | Harm-detection vs refusal-execution direction split for residual-refusal analysis | DBDI 2511.06852 | driver acceptance: classify heretic-9b residual refusals — which direction survived abliteration? | ADAPT | M (needs activation access — POP fleet hook or export) |
| T10 | Projected abliteration + DECCP (4-bit sharded, ~2 min, 20× faster) for DIY driver candidates | grimjim; DECCP | driver pipeline tooling when next DIY candidate is chosen | ADOPT (later) | M |
| T11 | Mid/late-layer-only steering asymmetry (early layers ≈ no safety effect) | diffusion-LM steering 2512.24143 | notes for future diffusion-LM drivers on the fleet | note-only | — |

## 2. Stage-5 redesign (the big one)

Current plan (RESEARCH-POSITION ADAPT list): Crescendo multi-turn (5a) + InjecAgent
tool-output injection (5b). Revised to reflect the 2026 field:

- **5a — multi-turn frame-hold (unchanged)**: Crescendo loop. Purpose stays *robustness*
  (driver holds frame across turns), not ASR maximization.
- **5b — tool-layer poisoning (upgraded)**: InjecAgent placeholders → MCP-flavored vectors:
  explicit/implicit trigger function hijack + parameter tampering (MCPTox P1/P2), and
  description-poisoning "mandatory constraint" payloads (Manual-Lies TDP). The PONG canary
  rides the poisoned tool description — delivery verification unchanged.
  Nonce-verified state checks stay deterministic (AgentDojo doctrine).
- **5c — side-task sabotage (new)**: benign main task + covert side task per run; two scores:
  side-task completion (state-checked) and monitor-detection rate (secondary judge reads the
  transcript). This is the first stage that measures *our* objective directly: covert
  compliance under an overt benign frame.
- **Labeling**: every 5b/5c record carries an ASI-2026 category (T3), never pooled.

## 3. Probe corpus additions (this week, no runner changes)

- `slip-*` family (T1): harmless-framing wrappers per existing stage-2 harm category.
- Axis tags (T2): every probe gets `persona | encoding | competing-objective` in addition to
  the Jailbroken two-failure-mode axis already planned. Report per-axis matrices.
- Benign twins for the new families (JailbreakBench doctrine — already adopted, extends free).

## 4. Driver acceptance additions

- GSM8K canary: in (existing stage 5).
- Residual-refusal directionality (T9): classify residual refusals per category; if
  harm-detection direction dominates, DBDI-style targeted intervention is the upgrade path
  for the next DIY abliteration instead of broader layer spreads.
- Provenance/disposition gates: unchanged (AbliterationNotScalpel, already in ADAPT list).

## 5. Novelty re-scope (do before any writeup)

1. **Tool-loop circuit breaker** — was "no prior art". Nearest prior art now: PRISM
   (lifecycle-hook scanning, session risk accumulation), AgentSpec (rule enforcement),
   AARM. Differentiation: *semantic-key repetition detection on the tool-call stream* vs
   their *rule/scan-based enforcement*. Re-run the absence search specifically for
   "tool-call loop detection agent harness" before claiming.
2. **Abliterated-driver architecture** — check 2026 harness-security literature for
   post-abliteration deployment work; the field's growth makes an omission plausible.
3. **PONG delivery-first doctrine** — unaffected (Kill-Chain Canaries still nearest).
4. **Refusal-aware routing** — re-check against OWASP ASI-era routing/governance work.

## 6. Execution order

| Wave | Items | Touches |
|---|---|---|
| W1 (now) | T1, T2, T3 + probe twins | `eval/probes.ts`, telemetry schema |
| W2 | 5b upgrade (T4) | stage-3 tool fixtures → poisoned-MCP variants |
| W3 | 5c side-task (T5) | new fixtures + monitor judge |
| W4 | novelty re-scope (§5) | `RESEARCH-POSITION.md`, vault MOC |
| W5 | T9 residual directionality | POP fleet activation hook |
| later | T6 (evolving attacker), T10 (DIY pipeline) | post-stage-5 |

W1 is runner-compatible today; W2–W3 need stage-5 fixtures designed against `tartarus run`
scratch dirs exactly like stage 3.
