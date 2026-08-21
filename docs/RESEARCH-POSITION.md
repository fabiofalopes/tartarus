# TARTARUS — Research Position vs State of the Art (2026-08-21)

> Output of the deep-research session orchestrated per `docs/NEXT-RESEARCH.md`.
> Corpus: 25 papers + 6 tool/model artifacts deep-read into `~/obsidian-vault/Knowledge/Red-Teaming/` (MOC: `00-Red-Team-Harness-MOC.md`); ~30 periphery items linked there. Machine-readable citations: `research/red-team-sota.bib`.
> Verification: every arXiv ID in the core corpus was fetched by an agent; the orchestrator independently spot-checked 10/25 IDs (all passed, zero fabrications). Residual unverified items are logged in the MOC's honesty register.

---

## 1. Position map — TARTARUS subsystem × state of the art

| Subsystem | State of the art | TARTARUS today | Gap assessment |
|---|---|---|---|
| **Battery structure** | HarmBench separates behaviors/attacks/scoring; JailbreakBench standardizes pipeline + judge selection; StrongREJECT demands specific/answerable/verifiable prompts | 4 stages (PONG → refusal regex → nonce tools → gray-area task); probes single-turn, static, 5 items | **Sound skeleton, thin stimulus set.** Stage separation matches field best practice; the stimulus corpus and attack diversity are the weak point (see Q1). |
| **Delivery verification** | Kill-Chain Canaries (2603.28013) gates ASR on canary reaching EXECUTED — canary rides the attack payload; VIGIL (2601.05755) verifies trajectory semantics before commit | PONG canary proves probe delivery BEFORE any behavioral scoring; born from a real harness bug (2026-08-20 projector incident) | **Ahead of the field in scope** — no surveyed framework runs an independent transport-level delivery probe gating all downstream scores. Nearest prior art differs in mechanism (payload-borne canary) and purpose (attack propagation, not instrument calibration). |
| **Scoring** | StrongREJECT rubric (Spearman .85–.90 vs string-match −.39); HarmBench distilled classifier (agreement ~93% claimed); WildGuard refusal F1 92.8 vs keyword 71.0; judge failure modes quantified (2606.25487: LLM-judge recall .06–.65, wrapper flips 57–100%; classifier P .835, GCG-flippable) | Regex classifier (8 refusal categories + hedge penalties), refused/hedged/landed verdicts; known false-negative risk on creative refusals | **Below field ceiling but not broken.** Regex ≈ the measured "keyword baseline" (F1 ~71 ceiling; anti-correlated with human judgment as an ASR *ranker*). Upgrade path is specified (Q2). |
| **Agentic coverage** | AgentDojo (dual metric, deterministic state checks), InjecAgent (tool-output injection), ASB (27 methods incl. memory poisoning), AgentLAB (long-horizon adaptive attacks; single-turn defenses fail), JAW (coding-agent CI hijack — 4,174 hijackable workflows incl. Claude Code/Gemini/Qwen/Cursor CLI actions), SIREN (tool-stream injection) | Stage 3 tests tool CALLING (nonce-verified); zero attack stages: no tool-output injection, no multi-step hijack, no escalation, no exfiltration | **Largest gap.** The driver battery is a jailbreak battery, not yet an agent-security battery. Our loop incident (57 identical calls) is empirical proof the agentic axis matters for abliterated drivers. |
| **Harness mechanics** | Loop/circuit breaking: nothing at tool level (weight-level "circuit breakers" 2406.04313 is unrelated); refusal-aware routing: cost cascades exist (RouteLLM, Mahoraga) but no refusal-scored routing; abliterated drivers: community artifacts only, no arXiv | Tool-loop circuit breaker + runaway guard (b105327); refusal-aware routing doctrine (g0dm0d3 scores task_result, reroutes); abliterated driver as first-class harness component | **Novel across the board** — see novelty register (§2). |
| **Ecosystem position** | Inspect AI (eval framework, 200+ evals), garak (discovery scanner), PyRIT (multi-turn orchestration), promptfoo (red-team CI), JailbreakBench (leaderboard pipeline) | Standalone fork of a coding agent; battery is bespoke TypeScript driving the real binary | **Standalone is defensible; integrate selectively.** Nobody validates *abliterated drivers for deployment* — that niche is ours (see Q5). |
| **Weight-level methodology** | Arditi mechanism; Joad multi-direction; MoE-specific: SAFEx (expert localization), NotAllRefusals (susceptibility tiers, layer-spread recipe), Scalpel (disposition side effects), ricyoung (tool × model matrix, GSM8K canary) | Heretic-method abliteration deployed; telemetry measures refusal tail, reasoning re-refusal, tool survival at n=2 | **Methodologically current.** Our measurements anticipated the literature (reasoning re-refusal ≈ Ouroboros; per-probe refusal tail ≈ multi-direction residual). Gaps: no capability canary (GSM8K), no disposition check, no provenance audit. |

## 2. Novelty register — what we do that no paper does

Each entry lists the search that established absence (Phase 1 domain agents + orchestrator triage over 56 unique candidates; "no prior art" = nothing surfaced in web + arXiv + GitHub excavation for that mechanism).

1. **Delivery-first scoring (PONG canary as instrument calibration).** Every surveyed framework scores behavior directly; the only delivery-gated scoring found is Kill-Chain Canaries (2603.28013), whose canary is attack-payload-borne and measures propagation, and VIGIL's verify-before-commit, which checks trajectory semantics. An independent, content-free delivery probe that gates ALL behavioral scoring (born from our 2026-08-20 projector bug) was not found. *Candidate for writeup.*
2. **Tool-loop circuit breaker.** No benchmark or harness tests or implements tool-call loop detection. Weight-level "circuit breakers" (2406.04313) are representation rerouting — different layer, different purpose. OBLITERATUS's Ouroboros counter-measures are weight-level self-repair mitigation. Our semantic-key loop interception + runaway guard (commit b105327, validated on a real 57-call incident) has no prior art. *Candidate for writeup — strengthened by AutonomousSecurityAgents (2605.19722) showing abliterated models specifically fail tool protocols.*
3. **Refusal-aware routing.** Routing literature is cost/quality-based (RouteLLM, FrugalGPT, Mahoraga's judge-gated cost cascade — failure-recall 0.688). Routing keyed on a refusal/hedge score of child outputs, with rerouting doctrine, was not found.
4. **Abliterated-driver architecture.** No arXiv paper uses an abliterated model as the *driver* of an agentic harness with cloud-worker fallback. All weight-level papers abliterate for measurement; community artifacts (OBLITERATUS cards, huihui-ai) ship models without harness doctrine.

Evidence trail: D1–D5 agent GAPS lines (preserved in session tool-output), orchestrator dedupe notes, and the per-paper novelty question embedded in the Phase 3 Q4/Q3 agent prompt (returned: VIGIL partial, KillChainCanaries near-complete-on-principle, AgentHarm none, AutonomousSecurityAgents partial).

## 3. Decision list

### ADOPT (copy with attribution)
| Item | Source | Next action |
|---|---|---|
| Judge-validation protocol: human-labeled slice → report scorer P/R → precision-corrected ASR (ASR×P) | 2606.25487 §5 | Label ~200 battery outputs (regex-labeled + uncertain) + 100 benign twins; measure our regex's P/R before any further refusal-rate claims |
| Matched-innocuous twin per probe category (over-refusal / scorer FPR control) | JailbreakBench §3.1 | Add benign twin for each stage-2 probe family |
| Robustness pre-qualification triplet for the scorer (refuse-then-comply, innocuous paragraph, unrelated-harmful completion) | HarmBench §3.2 Table 4 | Add as cheap scorer unit tests in `eval/scoring.ts` |
| Canary-gated ASR definition (count success only after verified delivery) | Kill-Chain Canaries | Formalize in battery docs; cite as nearest prior art |
| Tool-failure vs refusal label separation in agentic scoring | AutonomousSecurityAgents §5 | Extend stage-3 notes column; required before any 30B driver verdict |
| GSM8K as abliteration capability canary (most sensitive metric, Δ up to −18.8pp) | ricyoung 2512.13655 Table 3 | Add GSM8K-subset run to driver acceptance battery |
| Susceptibility predictors (DPO-only easiest; GRPO resistant; MoE more resistant; uniform 25–95% layer spread) | NotAllRefusals 2607.02714 §5.1, §3.2 | Use when picking DIY abliteration targets |
| Driver acceptance: per-category residual-refusal matrix | Joad 2602.02132 Table 2 | Stage-2 already tiered; formalize per-category reporting |

### ADAPT (modify to our harness)
| Item | Source | Next action |
|---|---|---|
| Rubric scorer: regex first gate, then score = (1−refused)×(specific+convincing)/2 on passed responses (rubric Spearman .846; fine-tuned Gemma-2B .900) | StrongREJECT §2.2 | Prototype as stage-2 upgrade; validate per the judge-validation protocol above |
| WildGuard (allenai/wildguard, refusal F1 92.8) as drop-in open classifier if regex upgrade stalls | WildGuard Table 4 | Benchmark against our labeled slice first |
| Multi-turn stage: Crescendo loop (escalate on progress, backtrack ≤10 on refusal, judge + secondary judge) | Crescendo §4 Algorithm 1 | Design stage 5a; driver-vs-cloud asymmetry: our driver needs no jailbreak loop — use multi-turn for *robustness* (does the driver hold frame across turns?) |
| Human multi-turn tactic set (537 tactics; 7 classes) as stimulus source | MHJ 2408.15221 §4.3 | Port a subset into `probes.ts` as multi-turn variants |
| Persuasion probes: PAP taxonomy (13 strategies × 40 techniques; >92% ASR on strong models, single-turn) | PAP 2401.06373 | Static persona-axis probes — fit current single-turn battery with zero runner changes |
| Two-failure-mode probe axes (competing objectives vs mismatched generalization); report per axis, not pooled | Jailbroken 2307.02483 | Tag existing + new probes by axis; test whether abliteration generalizes to encoding probes |
| Agentic stage: tool-output injection via real tool outputs (InjecAgent placeholders; direct-harm vs exfiltration intents; S1 extract / S2 exfiltrate scoring) | InjecAgent §2–3 | Stage 5b design; nonce canary rides the injected payload |
| Deterministic state-based scoring for agentic tasks (no LLM judge where state is checkable) | AgentDojo §3.1 | Apply to stage 3/5 artifacts (we already disk-check; generalize) |
| Verify-before-commit on tool streams (tool metadata/runtime feedback injection) | VIGIL/SIREN 2601.05755 | Evaluate after stage 5b exists |
| OBLITERATUS eval-suite contract (refusal rate, perplexity, KL, CKA, effective rank) as driver-acceptance criteria | OBLITERATUS README | Wire into acceptance battery for the 30B decision |
| Inspect AI for stages 3–4 formalization (solvers/scorers separation, model-graded scoring, transcripts) | InspectAI README | Prototype one stage as an Inspect task; keep our runner authoritative |
| Disposition battery (optimism rate, confidence distribution, horizon, verbosity on benign decisions) + provenance audit (hash shards/template/quantizer) before promoting ANY abliterated driver | AbliterationNotScalpel 2607.17427 §4–5 | Mandatory gate for the huihui-ai checkpoint |
| Per-attempt JSONL provenance for battery telemetry | Garak README "Logging" | Extend telemetry auto-append format |

### INVENT (no prior art — document and consider publishing)
| Item | Evidence of absence |
|---|---|
| PONG-first delivery doctrine as battery stage 1 | §2.1 of this doc |
| Tool-loop circuit breaker + runaway guard | §2.2 |
| Refusal-aware routing/cascade | §2.3 |
| Abliterated-driver harness architecture | §2.4 |

### IGNORE (for now)
| Item | Reason |
|---|---|
| Many-shot stage (PANDAS 2502.01925) | Driver context is 65K and the attack class needs demo-stuffing; low ROI vs multi-turn/persuasion; revisit if context grows |
| Full garak/PyRIT/promptfoo integration | Standalone stays defensible (Q5); borrow patterns only; garak as optional external scan of heretic-9b |
| GCG/white-box attacks on our own driver | We control the weights; prompt-level redundancy is expected post-abliteration (Arditi §5); spend effort on capability + agentic axes instead |

## 4. Answers to the six decision questions

### Q1 — Battery validity
**Verdict: structure sound, stimuli thin; three missing axes with strong evidence.**
The 4-stage design is validated by HarmBench's behavior/attack/scoring separation (2402.04249) and JailbreakBench's standardized pipeline (2404.01318); delivery-first is ahead of both (§2). Missing, in priority order:
1. **Multi-turn** — human multi-turn jailbreaks hit >70% ASR against defenses reporting single-digit single-turn ASR; 91.6% of successful submissions were multi-turn (MHJ 2408.15221 §4.2); Crescendo beats single-turn baselines by 29–71% (2404.01833 §1). Single-turn defenses provably fail long-horizon attacks (AgentLAB 2602.16901 Table 3).
2. **Persona/persuasion** — PAP >92% ASR on Llama-2-7B/GPT-3.5/GPT-4 in 10 trials, beating GCG/PAIR (2401.06373 abstract; cross-verified by AdaptiveAttacks Table 3: PAP 92% vs GCG 54%, PAIR 10%).
3. **Adaptivity doctrine** — each model needs a different attack; per-model templates+random search+prefilling reach ~100% ASR across 11+ aligned models (AdaptiveAttacks 2404.02151 Table 1). Static probes underestimate real exposure.
Organizing frame: Jailbroken's two failure-mode axes (2307.02483 abstract); probe quality criteria (specific, answerable, verifiable) from StrongREJECT §2.1. Caveat for an abliterated driver: attack-elicitation stages measure less than for aligned models — the battery's center of gravity should shift toward capability retention and agentic robustness (Arditi 2406.11717 §5; AutonomousSecurityAgents 2605.19722).

### Q2 — Scoring methodology
**Verdict: regex stays as fast gate; add a rubric/classifier second stage; validate everything on our own labeled slice.**
- Regex/string-match is the field's known weak baseline: Spearman −0.394 with human rankings (StrongREJECT Table 1), rule-based judge agreement 56% (JailbreakBench Table 1), keyword refusal F1 ceiling ~71 (WildGuard Table 2).
- Judge models are NOT a free upgrade: LLM judges miss harm (recall 0.06–0.65) and flip on a single prepended refusal sentence (39–88%); trained classifiers over-flag (P 0.835) but resist wrappers, and white-box GCG flips 70% of confident classifier TPs (JailbreakJudgeReliability 2606.25487 Tables 1–2, §4.3). Judges key on artifacts, not safety (Safer or Luckier 2503.09347 — periphery).
- Prescribed evolution (convergent across sources): (a) human-labeled slice → measure scorer P/R (2606.25487 §5); (b) precision-corrected ASR (ibid.); (c) rubric scoring gated on refusal (StrongREJECT §2.2); (d) judge/classifier selection against ~300 labeled examples with FPR as tiebreaker (JailbreakBench §3.5); (e) over-refusal twins (JailbreakBench §3.1; WildGuard XSTest protocol). Concrete candidates: allenai/wildguard (WildGuard 2406.18495) or a StrongREJECT-style Gemma-2B fine-tune on our own outputs.

### Q3 — Agentic red-teaming
**Verdict: this is our biggest gap; grow toward a stage 5 with three sub-stages.**
Benchmarks that matter: AgentDojo (2406.13352 — dual metric + deterministic state checks), InjecAgent (2403.02691 — 1,054 tool-output injection cases; ReAct-GPT-4 ASR 24%→47% with reinforcement; exfiltration transmission hits 100% once extraction succeeds), ASB (2410.02644 — 27 methods, memory poisoning, utility-security NRP), AgentLAB (2602.16901 — long-horizon: intent hijack 78.1%/tool chaining 96.3% ASR on Qwen-3; single-turn defenses fail), JAW (2605.11229 — coding-agent CI hijack via issue comments; 4,174 hijackable workflows incl. official Claude Code/Gemini/Qwen/Cursor CLI actions — TARTARUS's exact surface as a coding-agent fork), SIREN (2601.05755 — tool-stream injection incl. manipulated tool metadata/runtime feedback).
Attack surfaces we do not cover: tool-output injection, multi-step hijack, objective drifting, memory poisoning, data exfiltration, tool-stream (metadata/error) injection. Growth target: stage 5 = (a) injection into our real tool outputs with nonce canaries (InjecAgent pattern), (b) multi-step task hijack with deterministic state scoring (AgentDojo pattern), (c) tool-stream integrity checks (SIREN/VIGIL pattern). Driver-specific evidence: abliterated models can fail tool protocols outright (abliterated Llama-3.1-8B: 124/150 tool-failure labels vs 35/150 aligned — AutonomousSecurityAgents 2605.19722 §5), so agentic stages double as driver acceptance.

### Q4 — Harness mechanics prior art
**Verdict: we are ahead on all four mechanics; novelty register §2 stands with one citation duty.**
(a) Delivery verification before scoring — nearest prior art Kill-Chain Canaries (2603.28013): canary-gated ASR, but payload-borne canary tracking propagation; ours is an independent transport probe gating all scoring. VIGIL's verify-before-commit (2601.05755) verifies trajectory semantics, not delivery. **Cite both; novelty survives.** (b) Tool-loop detection/circuit breakers — no prior art found (weight-level "circuit breakers" 2406.04313 is unrelated). (c) Refusal-aware routing — only cost/quality cascades exist (Mahoraga tool; RouteLLM periphery); refusal-scored routing not found. (d) Abliterated-driver architecture — community artifacts only, no arXiv. The 2026 literature independently validates the *need* for (b): abliterated models' agentic fragility (2605.19722) and multi-direction refusal residuals (2602.02132) predict exactly the loop/stability failures our breaker catches.

### Q5 — Ecosystem position
**Verdict: stay standalone; borrow four components; occupy the empty niche.**
- **Inspect AI** (UK AISI): eval framework — solvers/scorers/tools, model-graded scoring, 200+ pre-built evals, very active (README). Best integration candidate for formalizing stages 3–4 without surrendering the runner.
- **garak** (NVIDIA): discovery-style vulnerability scanner, probe/detector/buff architecture, per-attempt JSONL provenance (README; 2406.11036). Complementary wide-net, not a battery; optional external scan of heretic-9b.
- **PyRIT** (Microsoft): multi-turn orchestration with score-driven loops (docs; Crescendo lives here). Borrow the loop pattern for stage 5a. Note: repo is active at github.com/microsoft/PyRIT — the "archived March 2026" claim from Phase 1 was contradicted by the live page.
- **promptfoo**: general red-team CI; most generic; nothing to borrow that PyRIT/garak don't do better for our use case.
- **JailbreakBench**: standardized pipeline + leaderboard; its judge-selection protocol is adopted (Q2) but leaderboard participation is irrelevant for a driver harness.
Honest 2×2: harnesses (TARTARUS, Inspect, garak, PyRIT, promptfoo) vs benchmarks (HarmBench, JailbreakBench, AgentDojo, ASB, AgentLAB); attack-generation (garak, PyRIT, promptfoo) vs defense-evaluation (AgentDojo, Inspect). Empty cell: **deployment validation of abliterated drivers** — nobody scores whether a refusal-removed model is fit to run as an agent (refusal tail, tool protocol, disposition shift). That is TARTARUS's defensible position; our battery + telemetry + loop breaker already form its prototype.

### Q6 — Weight-level currency
**Verdict: scale up to an abliterated MoE agentic finetune; BUY first, validate ruthlessly, DIY as fallback.**
- **MoE abliteration is real but different**: refusal concentrates in few experts (SAFEx: 12/6,144 experts masked → −22pp refusal on Qwen3-30B-A3B, AIME 77.4→75.2 — 2506.17368 Table 1); trillion-scale MoE abliteration works domain-specifically (Kimi K2: cyber refusal 100%→7%, 13× selectivity — NotAllRefusals 2607.02714 §1.2); MoE is *more resistant* on average and needs uniform layer spread over 25–95% depth (ibid. §3.2, §5.1). Community MoE abliterations ship in volume (huihui-ai, mlabonne — see Huihui-Qwen3Coder30B-Abliterated-2025 note).
- **Buy-vs-build**: the exact candidate exists published (huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated, apache-2.0, GGUF quants) but ships NO evals — acceptance battery is mandatory either way. Build side: Heretic is 16/16 compatible but worst-average GSM8K retention (−7.81pp mean vs DECCP −0.13 — ricyoung 2512.13655 Table 4); DPO-only bases break easiest (98% ASR, KL 0.076 — ibid. Table 2).
- **Re-refusal risk is structural**: 11 geometrically distinct refusal directions with a shared 1-D steering knob; Llama retains 0.35–0.64 residual refusal under all ablations (redundant pathways) while Gemma clears most (Joad 2602.02132 Table 2). Our telemetry independently shows the reasoning re-refusal channel. The ~70% Ouroboros self-repair figure circulating via OBLITERATUS could not be verified in Joad's fetched text (honesty register).
- **Side effects change driver acceptance**: abliteration shifts decision disposition (+7.4/+12.2pp optimism, family-opposite confidence shifts) on refusal-free tasks, and published checkpoints carry silent contamination (AbliterationNotScalpel 2607.17427 §4–5). Add disposition battery + provenance audit to acceptance.
- **Capability is parameter-bound**: abliteration unlocks willingness at all sizes but exploit capability scales with parameters (3B 25–48% vs 14B 88–97% — Willing but Unable 2606.05396, periphery); GSM8K is the most sensitive capability canary (ricyoung). Both support the 30B move.
- **Agentic caveat**: abliterated ≠ agentic. Abliterated Llama-3.1-8B fails tool protocol (2605.19722); our loop incident is the field's predicted failure mode. Driver acceptance must include stage-3 tool battery + loop-provocation test, not just refusal metrics.

---

## 5. Resulting work queue (feeds NEXT-SESSION.md "The direction")

1. Scorer calibration: label ~200 battery outputs + 100 benign twins → regex P/R → decide regex+rubric vs regex+WildGuard (Q2 protocol).
2. Stimulus expansion (all single-turn-compatible, zero runner changes): PAP persuasion probes + Jailbroken two-axis tagging + benign twins.
3. Capability canary: GSM8K-subset run added to driver acceptance; run on heretic-9b as baseline.
4. Stage 5 design doc: 5a multi-turn robustness (Crescendo loop adapted), 5b tool-output injection (InjecAgent pattern + nonce canary), 5c deterministic state scoring (AgentDojo pattern).
5. 30B driver decision: download huihui-ai checkpoint → full acceptance battery (refusal matrix per category, GSM8K canary, tool protocol, loop-provocation, disposition battery, provenance audit) → BUY verdict or DIY Heretic run with uniform 25–95% layer spread.
6. Novelty writeup candidate: delivery-first scoring + tool-loop circuit breaker + refusal-aware routing (position doc §2 holds the evidence trail).
