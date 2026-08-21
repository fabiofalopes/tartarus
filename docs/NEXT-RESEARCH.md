# TARTARUS — Deep Research Session: State of the Art in Red-Team Harnesses

> **Read this first. You are the orchestrator of a deep-research session.**
> Your job is NOT to read papers yourself — it is to decompose the excavation, run parallel research agents, filter ruthlessly, and **lock the surviving knowledge into local storage and the Obsidian knowledge graph** so every future session stands on solid ground.
> Companion files: `docs/NEXT-SESSION.md` (mission state), `docs/HYBRID-MODEL-ARCHITECTURE.md` (model/routing design), `eval/` (the battery), `~/.local/share/tartarus/telemetry.md` (measurements).

---

## 1. Why this session exists

TARTARUS is a red-team research harness (abliterated local driver + cloud workers + refusal-aware routing + eval battery). We build from first principles and field measurements, but **we have not systematically surveyed the state of the art**. Our battery, scoring, and harness mechanics may be half-baked — possibly less — and right now that's *hard to measure* because we have no external frame to measure against.

**Solid ground** means, concretely:
1. A curated, verified paper corpus (local + vault) covering red-team harnesses, agentic attacks, refusal measurement, and abliteration.
2. An honest **position map**: where TARTARUS stands vs the state of the art, per subsystem.
3. A **decision list**: for each gap — adopt (copy), adapt (modify), invent (we're ahead — document why), or ignore.
4. Answers to the six decision questions in §3, each backed by ≥2 verified sources.

## 2. What we already have (do not re-derive)

- **Harness**: opencode fork; pantheon agents (g0dm0d3 primary, lean prompts, metadata-driven delegation, refusal-aware routing doctrine); default driver `pop-fleet/heretic-9b` (abliterated Qwen3.5-9B); gateway model discovery; namespace isolation.
- **Battery** (`eval/`): 4 stages — PONG delivery canary → refusal probes (regex scorer ported from refusal-detection.md: 8 hard-refusal categories, hedge penalties, quality bonuses) → tool-calling (nonce-verified, disk-checked) → red-team task with rubric. Telemetry auto-append. Rep-marker defeats gateway response caching.
- **Measured facts** (telemetry.md): heretic-9b refusal tail (~15–30% on overt probes, gray-area lands reliably); reasoning-ON re-derives refusals (Ouroboros-style); **loop incident** (57 identical calls; fixed via loop breaker + runaway guard, commit `b105327`); tool-calling intact post-abliteration at n=2.
- **Known prior art we've touched** (verify + expand, don't trust this list): HarmBench, AgentDojo, InjectAgent, Arditi et al. 2024 (refusal direction), OBLITERATUS toolkit + model cards, ricyoung 16-model abliteration comparison, Joad 2026 "Ouroboros" re-refusal, Mahoraga judge-gated cascade.

## 3. The six decision questions (the research must answer these)

1. **Battery validity**: Is our 4-stage design (delivery canary → refusal → tool-calling → task completion) sound vs published red-team eval frameworks? What stages/stimuli are we missing (multi-turn, adaptive/iterative attacks, persona attacks, many-shot)?
2. **Scoring methodology**: Binary refusal regex vs judge-model vs rubric — what does the field use for ASR (attack success rate), what are the known failure modes of each (judge refusal, judge leniency, rubric drift)? Should our scoring.ts evolve toward a judge model, a published classifier, or stay regex + telemetry? (See StrongREJECT and judge-reliability literature.)
3. **Agentic red-teaming**: Which agent-security benchmarks matter (AgentDojo, InjectAgent, Agent-SafetyBench, R-Judge, ToolSword, ASB…)? What attack surfaces do they cover that our battery doesn't (tool-output injection, multi-step hijack, permission escalation)? What should the driver battery grow toward?
4. **Harness mechanics prior art**: Does anyone else do (a) delivery verification before scoring, (b) tool-loop detection/circuit breakers, (c) refusal-aware routing/cascades, (d) abliterated-driver architectures? If yes — cite; if no — document as novel (candidate for writeup/contribution).
5. **Ecosystem position**: Inspect AI (UK AISI), garak (NVIDIA), PyRIT (Microsoft), promptfoo, JailbreakBench — what does each do, and should TARTARUS integrate with any of them, benchmark against them, or stay standalone? What's the honest 2×2 (harness vs benchmark, attack-gen vs defense-eval)?
6. **Weight-level currency**: latest abliteration/uncensoring papers since our capture (direction ablation, MoE-specific findings, re-refusal/self-repair, capability-retention measurements) — anything that changes driver selection or the buy-vs-build decision?

## 4. Excavation map (5 domains → parallel agents)

| # | Domain | Seed queries / anchors |
|---|---|---|
| D1 | Red-teaming frameworks & benchmarks | HarmBench, JailbreakBench, AdvBench, StrongREJECT, Inspect AI, garak, PyRIT, promptfoo red-team, CIRCA, "automated red teaming survey" |
| D2 | Agentic / agent-security attacks | AgentDojo, InjectAgent, Agent-SafetyBench, R-Judge, ToolSword, Agent Security Bench (ASB), Crescendo, ActorAttack, many-shot jailbreaking, prompt injection for coding agents, agent hijacking |
| D3 | Attack generation methods | GCG, PAIR, TAP, PAP, Crescendo, multi-turn escalation, persona/role-play attacks, encoding attacks, prefilling, "jailbreak attack survey 2025/2026" |
| D4 | Measurement & judging | ASR definitions and pitfalls, LLM-as-judge reliability for safety, StrongREJECT scoring, rubric-based eval, refusal classifiers, judge refusal/leniency bias |
| D5 | Weight-level refusal | refusal direction (Arditi), SAFEx, MoE abliteration limits, re-refusal/self-repair (Ouroboros), abliteration capability-retention, Heretic, uncaged, OBLITERATUS eval suite |

## 5. Orchestration plan (phases)

**Phase 0 — Intake (you, ~5 min).** Read this file, `NEXT-SESSION.md`, `eval/README.md`, tail of telemetry.md. Restate the six questions in your own words. Set up the todo list.

**Phase 1 — Wide excavation (5 parallel agents, one per domain).** Use the task tool: `task(subagent_type="general"|"explore", load_skills=[], run_in_background=true, prompt=...)`. Each agent gets: its domain row, the six questions (for relevance filtering), and the **per-paper return contract** (§7). Agents search web + arXiv + GitHub; they must return structured lists, not prose dumps. Cap: 15 candidates per domain, each with a relevance score.

**Phase 2 — Triage (you).** Merge, dedupe (same paper appears across domains), verify existence of every arXiv ID (spot-check ≥30% via direct fetch; ANY fabricated ID disqualifies that agent's list from the "verified" tier). Score relevance 1–5 against the six questions (criteria §7). Select the **core corpus: 15–25 papers** (must-cover) + **periphery list** (title+link only, in the MOC).

**Phase 3 — Deep lock-in (parallel agents, 3–5 papers each).** Each agent reads its papers (arXiv abs pages, HTML, or PDFs via look_at) and produces **vault notes** using the template in §6 — claims, methods, numbers, quotes, borrow-list, wikilinks. Agents write notes directly to the vault directory. You review each note for faithfulness (no confabulated numbers — every number must have a section/page pointer or be marked "unverified").

**Phase 4 — Synthesis (you).** Write the position map + decision list (§8 deliverables). Update `NEXT-SESSION.md` "The direction" with concrete follow-ups. Store the milestone in OpenMemory.

**Phase 5 — Close.** Commit vault + repo changes (inspect diffs first; never commit secrets). Write the one-paragraph session summary at the bottom of THIS file (§9 slot).

## 6. Lock-in protocol (where knowledge lives)

**Vault corpus**: `~/obsidian-vault/Knowledge/Red-Teaming/`
- `00-Red-Team-Harness-MOC.md` — the map of content: core corpus table (paper | year | venue | relevance | decision), periphery list, links to all notes.
- One note per core paper: `<ShortName>-<year>.md` using this template:

```markdown
---
title: "<full title>"
arxiv: "<id>"
url: "<link>"
year: <year>
venue: "<venue>"
domain: [D1..D5]
relevance: <1-5>
status: verified | unverified
tags: [red-team, paper]
last_updated: <date>
---
# <ShortName> — <one-line claim>

## Why it matters for TARTARUS
<2-4 sentences tied to one of the six questions>

## Key claims (each with section/page pointer)
- ...

## Methods
<how they measure/attack/build — concrete enough to reimplement>

## Numbers worth keeping
| metric | value | note |

## Borrow list (what TARTARUS should adopt/adapt)
- [ ] ...

## Links
- [[00-Red-Team-Harness-MOC]]
- related: [[...]]
```

**Bibliography**: `~/projetos/tartarus/research/red-team-sota.bib` — bibtex entries for the core corpus (keeps citations machine-readable next to the code).
**Memory**: OpenMemory factual entries for the ~10 most decision-relevant numbers (e.g., "StrongREJECT outperforms binary ASR because X (paper Y)").
**Raw captures**: large agent outputs that overflow → `~/.local/share/opencode/tool-output/` (ephemeral) — distill into vault notes in the SAME session; tool-output gets pruned.

## 7. Filtering doctrine + per-paper return contract

**Relevance scoring (1–5)**: 5 = directly changes a TARTARUS decision (battery design, scoring, driver choice, harness mechanics); 4 = strong prior art for something we built; 3 = useful background/methods; 2 = adjacent; 1 = noise. Core corpus = score ≥4 first, then highest 3s to fill 15–25.

**Per-paper return contract (Phase 1 agents)**:
```
title | arxiv_id | year | venue | 1-line finding | relevance (1-5) | which of the 6 questions it informs
```
No abstracts dumped. No prose. Table rows only.

**Anti-confabulation rules (non-negotiable)**:
- Every arXiv ID must be fetched/verified by the agent that cites it (abs page reachable). Mark anything not fetched as `unverified`.
- Numbers without a location pointer (section/page/table) are marked `unverified`.
- The orchestrator spot-checks ≥30% of IDs before Phase 3; a single fabricated ID downgrades that agent's whole list to `unverified`.
- Never invent a paper to fill a gap. An empty cell in the position map is a finding ("no prior art found") — that's publishable novelty signal, not failure.

## 8. Deliverables (the output contract)

1. `~/obsidian-vault/Knowledge/Red-Teaming/` — MOC + 15–25 paper notes (template above).
2. `~/projetos/tartarus/research/red-team-sota.bib` — core corpus bibtex.
3. `~/projetos/tartarus/docs/RESEARCH-POSITION.md` — the synthesis:
   - Position map: TARTARUS subsystem × state of the art × gap assessment (battery stages, scoring, agentic coverage, harness mechanics, ecosystem).
   - **Novelty register**: things we do that no paper does (delivery-first scoring, loop breaker, refusal-aware routing, abliterated-driver architecture) — with the evidence trail of the search that established absence.
   - Decision list: adopt / adapt / invent / ignore, each with citations and a concrete next action.
   - Answers to the six questions (§3), each with ≥2 verified sources.
4. `NEXT-SESSION.md` — "The direction" updated with the resulting work queue.
5. OpenMemory milestone + session summary appended to §9 below.

## 9. Session log (fill at close)

- date:
- agents run (count/types):
- papers excavated / core corpus size:
- decisions produced:
- surprises:

---

## Appendix — operating constraints

- Delegation params are mandatory: `load_skills=[]` and `run_in_background` on every task call; retrieve via background_output; don't poll (system notifies).
- Parallel waves, sequential dependencies: Phase 1 fully parallel; Phase 3 parallel after YOUR triage; synthesis is yours alone.
- Token discipline: agents return digests/tables, not dumps; you read notes, not raw papers, during synthesis.
- Credentials: none needed for arXiv/web; never print keys from any config.
- Vault rules: update `last_updated` frontmatter; wikilink everything; no Archive/ edits.
- If a research agent fails or stalls >15 min, relaunch once with a narrower scope, then proceed without it — note the gap in the MOC.
