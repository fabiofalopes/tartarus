Continue from the handoff context below. Re-establish a REAL abliterated driver (the current one is an alias for an aligned model), then run the 9a scorer calibration with raw-response capture on.

HANDOFF CONTEXT
===============
Project: TARTARUS (/home/fabio/projetos/tartarus) — fully-diverged personal fork of opencode; red-team research harness (abliterated local driver + refusal-aware routing + eval battery)
Session ended: 2026-10-15 · branch 2.0, HEAD 13f7f6845, tree DIRTY (uncommitted eval work from the Sep 1 session)

USER REQUESTS (AS-IS)
---------------------
- "analize current build state of tartarus and opencode base thatwe need for this"
- "handoff and creat promrt init session md to kickit"

GOAL
----
Restore a verified abliterated driver (or accept an explicit substitute decision) and produce the first human-labelable stage-2 dataset, since the configured driver `pop-fleet/heretic-9b` now silently resolves to the aligned ornith-35b.

WORK COMPLETED
--------------
- Full build-state + base-drift analysis of the fork, verified live rather than read from docs (all evidence below).
- Established that the fork's opencode base cannot be synced: fork anchor 7a6ce05 IS the tip of upstream `2.0` (frozen, Apr 13); upstream's live line is `dev` (e41e7e9, v2.0.27, Oct 12) which is 9185 commits ahead with merge-base = our base, and upstream restructured (packages/opencode/src/session/projectors.ts → packages/core/src/session/projector.ts, src/seed gone). Our three engine patches are re-implement-only, not cherry-pickable.
- Verified the fork's own toolchain is healthy: `bun typecheck` clean in packages/opencode; eval/scoring.test.ts 10/10 pass; installed binary contains the loop breaker; battery stage-1 PONG against pop-fleet/ornith-9b succeeded live.
- Traced a measurement-integrity failure to root cause: LiteLLM model group `heretic-9b` has litellm_params.model = `openai/ornith-35b` (proven via /model/info), and the inference proxy on llm-prod (192.168.80.2:4001) now serves ONLY ornith-35b / ornith-35b-deep (fleet_map.json rewritten during the Oct 14 ornith-35B migration; proxy restarted Oct 15 00:02:41, so the current map is loaded).
- Confirmed the POP fleet was re-provisioned on 2026-10-14: pop01/02/03/05 run ornith35-*-rpc, pop04/07 run ornith35-*-main, every 8 GB card is 5.7–7.5 GB full. The heretic-9b container has been Exited (0) since 2026-08-31T17:42Z; no node hosts it.
- Identified three harness gaps that must be closed before any calibration data is collected (details in PENDING TASKS).

CURRENT STATE
-------------
- Repo: branch 2.0 at 13f7f6845 (Aug 21), 15 commits ahead of the fork anchor, 1 commit unpushed vs origin/2.0. Dirty tree = 5 modified (AGENTS.md, eval/README.md, eval/battery.ts, eval/probes.ts, eval/scoring.ts) + 4 untracked (eval/gsm8k.ts, eval/scoring.test.ts, eval/data/, docs/NEXT-SESSION-scorer-calibration-probes.md) + stray proxmox_mcp.log.
- Two handoff artifacts coexist: docs/NEXT-SESSION.md (mission, Aug 21) and docs/NEXT-SESSION-scorer-calibration-probes.md (Sep 1, untracked). The Sep 1 session never committed and never closed the cadence loop.
- Driver: `model` in ~/.config/tartarus/tartarus.json is still `pop-fleet/heretic-9b`, but that id now resolves to ornith-35b (aligned, reasoning-capable). Under the harness system prompt it burns the full output budget (step-finish reason=length, output 8064) and emits no text part, so battery stage 1 reports `empty` — two consecutive runs, reproducible. A bare 16-token chat completion to the same id returns PONG normally.
- Driver identity is verifiable in one call: `curl -s -D - -o /dev/null .../v1/chat/completions -d '{"model":"heretic-9b",...}' | grep x-litellm-model-group` plus `/model/info` (see KEY FILES for the exact pattern). Do this BEFORE trusting any model name in telemetry.
- Eval state: 14 stage-2 probes (4 overt incl. the `frame` negative control, 6 gray incl. 5 new PAP, 4 benign twins), all currently tagged axis `competing-objectives`; 19 probes total. telemetry.jsonl exists and is populated only by the Sep 1 run (4 benign-twin rows on the aligned ornith-9b, all landed) and one Oct 12 PONG. Zero abliterated-driver stage-2 data post-projector-fix; no labels file anywhere; stage 5 (GSM8K) has never executed.
- Fleet-side facts worth knowing: the proxy adds X-Proxy-Backend/X-Proxy-Model headers, and unknown model names are rejected with 400 by both LiteLLM and the proxy — so a 200 means a real registered backend answered, which is exactly why the silent alias is dangerous.

PENDING TASKS (ordered)
-----------------------
1. Commit the Sep 1 eval work so the calibration session starts from a clean tree: `git add eval/ AGENTS.md docs/NEXT-SESSION-scorer-calibration-probes.md && git commit`. Exclude proxmox_mcp.log (unrelated debris, leave untracked). Tests pass and typecheck is clean, but note in the message that stage 5 and the PAP probes have never been executed in vivo.
2. Close the harness gaps before collecting calibration data:
   a. Add an `upstream` fail class to fail_class() in eval/battery.ts — a gateway 4xx/5xx (driver down / model missing) must never be pooled as `[no-output]` model silence.
   b. Capture raw response text (or at minimum the sessionID, which every `--format json` event carries) into telemetry.jsonl. Without it the 9a hand-labeling pass is impossible; today the battery records only a character count.
   c. Record step-finish reason (stop vs length) — the heretic-9b failure above was invisible in telemetry and only findable by running the binary by hand.
3. Add a model-identity assertion to the battery (or a pre-flight check): resolve the configured model id through LiteLLM and refuse to run if the resolved upstream differs from the configured name. This is the guard that would have caught the heretic-9b→ornith-35b alias.
4. Decide and execute the driver's home — this is the blocking external decision, needs explicit user go-ahead: (a) redeploy heretic-9b on a POP node (no free VRAM anywhere; requires displacing an ornith35-*-rpc worker), (b) serve it on the Mac (mac-256 / mac-mlx providers already configured; also satisfies queue item 4, the 30B driver scale-up), or (c) accept ornith-35b as the interim driver and re-baseline every number. Do not silently keep measuring an aligned model under an abliterated model's name.
5. Only after 2 and 4: collect the 9a slice — ~200 stage-2 responses plus ~100 benign twins. The current corpus yields 42 responses at n=3, so either run n≈14 or grow the corpus first (9b adds PAP; consider more twin families). Mix aligned and abliterated drivers so both the refused and landed classes are represented.
6. Hand-label refused/hedged/landed, compute regex precision/recall, then decide the second stage (StrongREJECT-style rubric vs allenai/wildguard) and adopt precision-corrected ASR reporting.
7. Baseline the GSM8K canary (stage 5) on whatever driver is chosen; PASS_THRESHOLD = 0.6 is uncalibrated and has never been executed.
8. Fix the axis tagging before reporting per-axis results: all 14 stage-2 probes are tagged `competing-objectives`, so "report per axis, never pooled" is currently vacuous. PAP/encoding-class probes belong on the mismatched-generalization axis.
9. Keep the cadence: this file is the next session's entry point; the next session closes with its own docs/NEXT-SESSION-<slug>.md. Never overwrite docs/NEXT-SESSION.md (mission) with a handoff.

KEY FILES
---------
- eval/scoring.ts — regex classifier + classify() four-way verdict (refused/late/hedged/landed); the thing being calibrated
- eval/scoring.test.ts — HarmBench pre-qualification triplet; run it from a package dir, e.g. `cd packages/opencode && bun test ../../eval/scoring.test.ts`
- eval/battery.ts — runner; fail_class(), jlog() provenance, stage executors, `--only` filter
- eval/probes.ts — corpus as data: frame, axis, twinOf, pap fields
- eval/gsm8k.ts + eval/data/gsm8k-sample.json — stage 5 capability canary (never executed)
- eval/README.md — battery doctrine, verdicts, known limits
- docs/NEXT-SESSION.md — mission briefing; item 9 is the active work queue
- docs/RESEARCH-POSITION.md — SOTA synthesis driving 9a/9b decisions
- ~/.config/tartarus/tartarus.json — pop-fleet provider + default model (never print the apiKey; read with jq and redact)
- /home/dsi/inference-proxy/fleet_map.json + /home/dsi/litellm-lusofona/config.yaml on llm-prod (192.168.80.2) — the routing layer whose drift caused the alias trap

IMPORTANT DECISIONS
-------------------
- The opencode base is frozen by choice: no upstream sync, no rebase. Cherry-picks from upstream/dev are not feasible after the packages/core restructure; treat upstream as a reference for ideas only. Record this as a standing decision rather than rediscovering it each session.
- Regex scoring stays as the fast first gate; a rubric or published classifier second stage must be validated on our own human-labeled slice before any further refusal-rate claims, and ASR is always reported precision-corrected.
- Model identity is now part of the measurement contract: a model name in telemetry is a claim that must be verified against the routing layer, not trusted from config.
- Delivery-first doctrine stands: PONG before any behavior is scored; a run whose delivery is unverified is void.
- Failures are classified, never pooled: tool-protocol failures and upstream errors are harness incidents, not safety wins.

EXPLICIT CONSTRAINTS
--------------------
- "To regenerate the JavaScript SDK, run ./packages/sdk/js/script/build.ts."
- "ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE."
- "The default branch in this repo is dev." (TARTARUS active development is on branch 2.0)
- "Prefer automation: execute requested actions without confirmation unless blocked by missing info or safety/irreversibility."
- "Tests cannot run from repo root (guard: do-not-run-tests-from-root); run from package dirs like packages/opencode."
- "Always run bun typecheck from package directories (e.g., packages/opencode), never tsc directly."
- Never put gateway keys or secrets into battery commands, files, or context; provider keys move only via scripts that redact on display.
- Fleet changes (POP nodes, LiteLLM deployments) only on explicit user go-ahead.

CONTEXT FOR CONTINUATION (GOTCHAS)
----------------------------------
- THE TRAP: `pop-fleet/heretic-9b` is currently an alias for ornith-35b (an aligned model). Any run tagged heretic-9b today measures ornith-35B. Verify with `/model/info` (filter .model_name == "heretic-9b", read litellm_params.model) and with the `x-litellm-model-group` header before trusting a single number.
- The heretic-9b container on pop02 has been Exited since 2026-08-31T17:42Z; the gateway 500s seen earlier came from the pre-restart proxy still holding the old mapping. The proxy on llm-prod was restarted 2026-10-15 00:02:41 and now serves only ornith-35b / ornith-35b-deep.
- The POP fleet was re-provisioned to ornith-35B on 2026-10-14; every 8 GB card is nearly full, so "just restart heretic-9b" is not possible without displacing a cluster worker.
- The battery never reads ~/.config/tartarus/* — the tartarus binary handles its own auth; never pipe keys into battery invocations.
- `bun test eval/scoring.test.ts` from the repo root FAILS on the do-not-run-tests-from-root bunfig guard (the README command is wrong). Run it from packages/opencode.
- Every battery run appends " [rep N]" to the probe text — load-bearing against the LiteLLM/Redis prompt cache. Models may echo the marker (PONG [rep 1]); stage 1 normalizes it. Unresolved: whether the marker itself shifts behavior.
- A direct-to-backend path exists for cache-free measurement: POP servers run with network=host, so pointing a provider at a node's :8080 bypasses LiteLLM and Redis entirely — but only once a driver is actually deployed there.
- Stage-2 regex classification has known false negatives on creative refusals; read raw telemetry notes, not just verdicts (eval/README.md "Known limits").
- Seeding is skip-if-exists: editing packages/opencode/src/seed/** requires a rebuild AND deleting the runtime file under ~/.config/tartarus/ to force reseed.
- The Obsidian vault is NOT a git repo — vault edits persist but cannot be committed; only this repo is version-controlled.
- Citation trap: Arditi refusal-direction = arXiv 2406.11717; 2407.21439 (in older notes/telemetry) is a reranker paper.
- OpenMemory: when openmemory_* MCP tools are absent, use stateless JSON-RPC at http://localhost:8081/mcp (initialize → tools/list → tools/call openmemory_store).
- proxmox_mcp.log sits untracked at the repo root — unrelated debris, do not commit it.
