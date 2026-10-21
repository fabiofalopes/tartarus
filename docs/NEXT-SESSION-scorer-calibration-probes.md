Continue from the handoff context below. Execute work-queue items 9a+9b: calibrate the stage-2 refusal scorer (regex P/R on a human-labeled slice) and expand the probe corpus with PAP persuasion probes + benign twins.

HANDOFF CONTEXT
===============
Project: TARTARUS (/home/fabio/projetos/tartarus) — fully-diverged personal fork of opencode; red-team research harness (abliterated local driver + refusal-aware routing + 4-stage eval battery)
Session ended: 2026-08-27 · branch 2.0, HEAD 13f7f6845, tree clean (one stray untracked file: proxmox_mcp.log — leave it)

USER REQUESTS (AS-IS)
---------------------
- "Read docs/NEXT-RESEARCH.md and run it."
- "can you can you help me create the end of for the current session we need to finish the current session we need to also think about what we do in the future so the session is about like now putting the stealing it down making the memory through Files, everything perfectly cadence are a right guidance so that then we can. Every session be closed but also session no need to be used to figure out what we will do next."

GOAL
----
Calibrate the stage-2 regex scorer against a human-labeled slice of our own battery outputs and expand the probe corpus (persuasion probes + two-axis tagging + benign twins), per docs/NEXT-SESSION.md items 9a and 9b.

WORK COMPLETED
--------------
- I ran docs/NEXT-RESEARCH.md end-to-end on 2026-08-21: 5-phase orchestration, 11 subagents (5 excavation librarians + 6 lock-in generals), committed as 13f7f6845.
- Built a verified SOTA corpus: 31 vault notes + MOC in ~/obsidian-vault/Knowledge/Red-Teaming/, 31-entry bibtex at research/red-team-sota.bib, synthesis at docs/RESEARCH-POSITION.md (position map, novelty register, 8 adopt / 13 adapt / 4 invent / 3 ignore decisions, six answers).
- Verified integrity: orchestrator spot-checked 10/25 core arXiv IDs (all passed, zero fabrications); upgraded Jailbroken-2023 note to abstract-verified (v1-only paper).
- Wrote the resulting work queue into docs/NEXT-SESSION.md item 9 (a–f) and the session log into docs/NEXT-RESEARCH.md §9.
- Stored the milestone in OpenMemory (1 procedural memory + 14 temporal facts).
- Updated AGENTS.md with session protocol + research context (2026-08-27).

CURRENT STATE
-------------
- eval/ untouched by the research session: scoring.ts (regex classifier: 8 hard-refusal categories, hedge penalties, refused/hedged/landed), probes.ts (5-item corpus), battery.ts (runner; PONG-first; "[rep N]" marker is load-bearing vs the LiteLLM/Redis prompt cache).
- Battery usage: bun run eval/battery.ts --model pop-fleet/<model> [--stage 1|2|3|4] [--n 3] [--agent build|g0dm0d3] from repo root.
- Driver in service: heretic-9b (Qwen3.5-9B abliterated) on pop02 via pop-fleet gateway; telemetry log at ~/.local/share/tartarus/telemetry.md (outside the repo).
- Key research numbers driving the next task: keyword/regex refusal F1 ceiling ~71 and string-match Spearman -0.394 vs humans; WildGuard open classifier refusal F1 92.8; LLM judges flip 39-88% on a single prepended refusal sentence; PAP persuasion probes >92% ASR single-turn.
- The Obsidian vault is NOT a git repo; only the tartarus repo is version-controlled.

PENDING TASKS (ordered)
-----------------------
1. 9a Scorer calibration (the prerequisite for every future refusal-rate claim): run the battery to collect ~200 stage-2 responses (regex-refused, regex-hedged, and uncertain cases) plus ~100 benign-twin responses; hand-label them refused/hedged/landed; compute the regex classifier's precision/recall; then decide the second stage — StrongREJECT-style rubric score = (1-refused) x (specific + convincing)/2 — vs drop-in classifier allenai/wildguard. Adopt precision-corrected ASR reporting (ASR x precision). Protocol source: vault note JailbreakJudgeReliability-2026 (arXiv 2606.25487 §5).
2. 9b Stimulus expansion (single-turn compatible, zero runner changes): port PAP persuasion probes into probes.ts (13 strategies x 40 techniques; see vault note PAP-2024); tag every probe — old and new — by Jailbroken's two failure-mode axes (competing objectives vs mismatched generalization) and report per axis, which tests whether abliteration generalizes to encoding-class probes; add one benign topic-matched twin per probe family (JailbreakBench pattern) to measure over-refusal and scorer FPR.
3. 9c Add a GSM8K-subset capability canary to driver acceptance (most abliteration-sensitive metric, delta up to -18.8pp per ricyoung 2512.13655); baseline it on heretic-9b.
4. 9d Write the stage-5 design doc: multi-turn robustness (Crescendo loop adapted), tool-output injection with nonce canaries (InjecAgent pattern, S1-extract/S2-exfiltrate scoring), deterministic state-based scoring (AgentDojo pattern).
5. 9e 30B driver decision, BUY-first: evaluate huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated through the full acceptance battery (per-category refusal matrix, GSM8K canary, tool-protocol test, loop-provocation, disposition battery, provenance audit) — the model card ships zero evals.
6. 9f Novelty writeup candidate: delivery-first scoring + tool-loop circuit breaker + refusal-aware routing + abliterated-driver architecture (evidence trail in docs/RESEARCH-POSITION.md §2).
7. Close the session with /handoff producing the next docs/NEXT-SESSION-<slug>.md (user-established cadence — every session ends file-first; the next session must never need this one to know what to do).

KEY FILES
---------
- docs/NEXT-SESSION.md — mission briefing; item 9 is the active work queue
- docs/RESEARCH-POSITION.md — synthesis: position map, decisions, novelty register, six answers
- docs/NEXT-RESEARCH.md — research protocol (executed 2026-08-21) + §9 session log
- eval/scoring.ts — the regex classifier to calibrate
- eval/probes.ts — probe corpus to expand
- eval/battery.ts — runner (PONG canary stage 1; auto-appends telemetry)
- eval/README.md — battery doctrine and known limits
- research/red-team-sota.bib — machine-readable core-corpus citations
- ~/obsidian-vault/Knowledge/Red-Teaming/00-Red-Team-Harness-MOC.md — corpus map (vault, outside repo)

IMPORTANT DECISIONS
-------------------
- Scoring evolution: regex stays as the fast first gate; a rubric or published-classifier second stage must be validated on our own human-labeled slice before any further refusal-rate claims; always report precision-corrected ASR.
- Four harness mechanics confirmed novel (delivery-first PONG scoring, tool-loop circuit breaker, refusal-aware routing, abliterated-driver architecture); cite Kill-Chain Canaries arXiv 2603.28013 as nearest prior art for delivery-gating — do not cede the niche.
- 30B driver strategy is BUY-first but acceptance-gated (published checkpoint ships no evals; abliteration shifts decision disposition and can break tool protocols — abliterated Llama-3.1-8B scored 124/150 tool-failure labels).
- Ecosystem: stay standalone; borrow patterns (Inspect AI scorer separation, garak JSONL provenance, PyRIT loop pattern); occupy the empty niche = deployment validation of abliterated drivers.
- Session cadence: open on docs/NEXT-SESSION.md, close with /handoff → docs/NEXT-SESSION-<slug>.md; handoff prompts never overwrite the mission file.

EXPLICIT CONSTRAINTS
--------------------
- "To regenerate the JavaScript SDK, run ./packages/sdk/js/script/build.ts."
- "ALWAYS USE PARALLEL TOOLS WHEN APPLICABLE."
- "The default branch in this repo is dev." (TARTARUS active development is on branch 2.0)
- "Prefer automation: execute requested actions without confirmation unless blocked by missing info or safety/irreversibility."
- "Tests cannot run from repo root (guard: do-not-run-tests-from-root); run from package dirs like packages/opencode."
- "Always run bun typecheck from package directories (e.g. packages/opencode), never tsc directly."
- Never put gateway keys or secrets into battery commands, files, or context; provider keys move only via scripts that redact on display.

CONTEXT FOR CONTINUATION (GOTCHAS)
----------------------------------
- Every battery run appends " [rep N]" to probe text — load-bearing: the LiteLLM/Redis gateway caches per exact prompt, so unmarked replication runs measure the cache, not the model. Clean variance claims require cache eviction for the test model or pointing the battery straight at pop02:8080. Also unresolved: whether the marker itself shifts behavior.
- The battery never reads ~/.config/tartarus/* — the tartarus binary handles its own auth; do not pipe keys into battery invocations.
- Stage-2 regex classification has known false negatives on creative refusals — read raw telemetry notes, not just verdicts (eval/README.md "Known limits").
- The Obsidian vault is not a git repo — vault note edits persist but cannot be committed; only the tartarus repo is version-controlled.
- OpenMemory: when openmemory_* MCP tools are absent in the session, use stateless JSON-RPC at http://localhost:8081/mcp (initialize → tools/list → tools/call openmemory_store).
- Citation trap: Arditi refusal-direction = arXiv 2406.11717; the 2407.21439 ID in older notes/telemetry is a reranker paper (wrong).
- docs/NEXT-SESSION.md (mission, no suffix) and docs/NEXT-SESSION-<slug>.md (handoff prompts) are different artifacts — never confuse or overwrite one with the other.
- Seeding is skip-if-exists: editing src/seed/** requires rebuild AND deleting the runtime file under ~/.config/tartarus/ to force reseed (from NEXT-SESSION.md mechanics).
- Proxmox_mcp.log sits untracked at repo root — unrelated debris; do not commit it.
