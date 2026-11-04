# NEXT SESSION — upstream hardening shipped, research corpus refreshed, W1 live

> Handoff from the 2026-11-03/04 session. Mission state lives in `docs/NEXT-SESSION.md`
> (do not overwrite). Three commits on `2.0`, tree clean, binary installed at
> `0.0.0-2.0-202611030649` (built from the pre-W1 commit — cosmetic rebuild pending).

## Shipped this session

1. **`b4ba16d6b9`** — upstream v2.2.x hardening ports (7 fixes, all live-verified):
   LiteLLM overflow pattern, 429≠overflow, FreeUsageLimitError→clean non-retryable error
   (was an infinite retry hang — free lane went 120s+ hang → 4.7s clean error),
   `OPENCODE_DISABLE_FREE_MODELS` kill switch, `noTimeoutFetch`, compaction window cap
   (min(input,context)), compaction oldest-first shortening retry. Free models
   (`opencode/*-free`, anonymous `apiKey:"public"`) confirmed working in tartarus.
2. **`1991f306e9`** — 2026-11 research delta: 12 paper full-texts in `research/papers/`,
   bib 31→43, vault MOC delta section + 12 notes, `docs/TECHNIQUE-PLAN-2026-11.md`
   (technique ledger T1–T11, stage-5 redesign, waves W1–W5).
3. **`b3d09fa971`** — W1: SLIP probe family + persona axis + twin-slip; battery default
   model fixed `ornith-9b`→`ornith-35b` (stale id was crash-classing ALL runs).

## First signal worth chasing

ornith-35b (aligned!) n=1 smoke: `slip-*` landed 3/3 clean (928–2656 chars) while overt
`phish`=late, `lock`=no-output. SLIP effect reproducing on our own fleet. **Pending:
n=3 full stage-2 matrix** — `bun run eval/battery.ts --model pop-fleet/ornith-35b --stage 2 --n 3`
(~22 runs). This is the entry-point task.

## Queue (from TECHNIQUE-PLAN-2026-11 §6)

- **W2** — stage-5b MCP-poisoning fixtures (MCPTox P1/P2 + Manual-Lies TDP vectors;
  PONG canary rides the poisoned description)
- **W3** — stage-5c SHADE side-task sabotage (direct chill-break metric; monitor judge)
- **W4** — novelty re-scope BEFORE any writeup: loop breaker "no prior art" is no longer
  safe — PRISM (2603.11853) / AgentSpec (2503.18666) are nearest prior art;
  differentiation = semantic-key repetition detection on the tool-call stream
- **W5** — DBDI residual-refusal directionality (needs POP activation access)
- cosmetic: rebuild binary from clean HEAD so the version stamp isn't `-dirty`

## Gotchas learned

- Battery tests run from `eval/` dir, not repo root (`do-not-run-tests-from-root` guard).
- `test/provider`+`test/session` have 10 pre-existing failures (llm.stream ×8, system
  skills, processor degenerate) + 2 rotating timing-flaky — verified via stash-diff; not
  ours to fix in passing.
- Fleet model is `pop-fleet/ornith-35b` (+`-deep`); `ornith-9b` is gone.
- Harness survey full text is WAF-blocked (preprints.org); README fallback committed;
  OpenReview `nM5tDHrQsx` is the re-fetch avenue.
