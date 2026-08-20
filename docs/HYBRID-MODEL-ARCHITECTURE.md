# TARTARUS — Hybrid Model Architecture

> *The driver never refuses. The cloud never sees the whole picture.*

Expert synthesis + design for running TARTARUS as a professional red-team harness: an **abliterated local model as the stable driver**, **cloud models as capability workers**, and **refusal-aware routing** between them. Researched 2026-08-20 against the current abliteration landscape, four agent harnesses (claude-code-router, Roo Code, Cline, aider), three cascade systems (Mahoraga, Coryphaeus, LiteLLM), and TARTARUS's own provider/routing mechanics.

---

## 1. The problem (measured, not vibes)

Cloud aligned models are unstable drivers for this harness. Telemetry from the lean-prompt sessions (2026-08-20, `~/.local/share/tartarus/telemetry.md`):

- Qwen 3.8 Max Preview sits on a **decision boundary**: identical gray-area probe lands or refuses run-to-run (~50/50).
- Overt bypass requests refuse **100%** regardless of prompt engineering.
- The model **confabulates adversarial premises** under red-team framing (fabricated targets/content not in the prompt).
- Sessions that hit a refusal are spoiled: opencode's native retry never switches models (`session/retry.ts` — same-model backoff only; refusals aren't even retryable, they surface as session errors).

The structural fix: **the orchestrating model must be one that cannot refuse** — an abliterated open-weight model running locally — with cloud models demoted to workers on bounded, low-risk subtasks.

---

## 2. Architecture — four model roles

| Role | Who | Model class | Why |
|---|---|---|---|
| **Driver** | `g0dm0d3` (primary) | Abliterated local, MoE 30-36B A3B | Owns the session, orchestrates, never refuses. Stability is the whole point. |
| **Specialists** | `typhon` `nyx` `eris` `azazel` `parseltongue` | Same abliterated local (default) | They produce the actual red-team content — must not refuse. One serving path, zero refusal risk. |
| **Knowledge workers** | `task()` delegations on benign subtasks (research, analysis, code review) | Cloud (opencode-go / zai / ollama-cloud / alibaba) | Raw intelligence where refusal risk is low. Bounded prompts; the driver reads the result, not the user. |
| **Housekeeping** | title / summary / compaction | Small local (8-9B) | Never pay cloud or burn the driver on titles. `small_model` config key + `agent.title.model`. |

This inverts the failing pattern: previously the *aligned* model drove and the jailbreak frame had to defeat it per-request. Now the *abliterated* model drives and the frame is mostly unnecessary — techniques become the *subject* the driver researches, not the *lever* applied to it.

**What crosses boundaries** (verified mechanics):
- Agent→model binding: frontmatter `model:` per agent; per-session override stamped on each user message (`input.model ?? agent.model ?? lastModel`, `prompt.ts:926`).
- Child sessions get fresh context; only the task prompt crosses (`tool/task.ts`). Cloud workers never see the red-team session transcript — natural OPSEC boundary.
- `chat.message` plugin hook (`prompt.ts:1231`) can mutate the outgoing message's model before it's saved — **the** extension point for fallback routing without core changes (oh-my-openagent's entire fallback system is built on it).
- Custom endpoints: `provider.<id>` in `tartarus.json` with `options.baseURL` + `models` (npm defaults to `@ai-sdk/openai-compatible`; `${ENV}` interpolation in baseURL). The `modelos-mac` provider in the opencode config is the working template.

---

## 3. Driver model candidates (verified Aug 2026)

The abliteration community has moved to Qwen3.5/3.6/3.8 + Gemma 4 + GLM-5 bases. **huihui-ai** is the de-facto publisher (186 models, publishes HarmBench proofs; safetensors gated — use mradermacher/bartowski GGUF mirrors, ungated). The **OBLITERATUS HF org** publishes the toolkit's own releases with the most rigorous cards.

| Candidate | Base | Size/quant | Refusal removal | Capability cost | Fit |
|---|---|---|---|---|---|
| **Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated** | Qwen3-Coder MoE (3B active) | Q4 18.7G / Q6 25.2G / Q8 32.6G | HarmBench-verified line | Qwen3.6-gen retention | ⭐ **Primary pick**: agentic-coding-trained = native tool calling, 256K ctx, Apache 2.0, ~79 t/s Q8 on M2 Ultra |
| **Huihui-CyberStrike-OffSec-35B-abliterated** | CyberStrike-OffSec fine-tune of Qwen3.6-35B-A3B | ~20G Q4 | abliterated on top of offsec SFT | SecEval 81.4% (aligned base) | ⭐ **Domain specialist**: offensive-security + tool-calling fine-tune; license of the base fine-tune unverified ("other") |
| **OBLITERATUS/Qwen3.8-27B-OBLITERATED** | Qwen3.8-27B dense | Q8 ~27G / Q4 ~15G, MLX too | **0% refusal on 842-prompt corpus** | MMLU −6.0pp | Strongest documented refusal removal; dense = ~⅓ MoE speed; card recommends *no system prompt* (test this!) |
| **OBLITERATUS/Qwen3.6-27B-OBLITERATED** | Qwen3.6-27B dense | Q4-Q8 ladder | 95.8% non-refusal | **MMLU-Pro stock-matched** (source-tethered) | Best capability retention; card warns "tool calling not guaranteed" |
| **Qwen3.6-35B-A3B-Uncensored (HauhauCS)** | Qwen3.6-35B-A3B MoE | ~21G Q4 | community uncensored | — | **POP fleet drop-in** (vault MODEL-CATALOG #1: same 4× 3060 Ti deployment, 30-min swap) |
| Huihui-GLM-4.5-Air-abliterated | GLM-4.5-Air 106B-A12B | Q4 72.9G | HarmBench line | GLM agentic quality | Fleet-grade quality tier; fits 256GB Mac; local tool-calling support weaker (generic handler) |
| gpt-oss-20b abliterated variants | gpt-oss-20b MoE (3.6B active) | ~14G | several publishers | o3-mini-class agentic | Fast scout tier; Harmony response format needs harness support |

**Speed reality on Apple Silicon** (measured): MoE A3B class = **58-101 t/s** (M3 Max→M3 Ultra); dense 27-32B Q4 = 17-42 t/s depending on chip. An agent driver does dozens of round-trips per task — **MoE is the responsiveness sweet spot**, and 256GB unified memory runs it at Q8 with 100K+ context headroom.

**Buy, don't build (for now)**: pre-abliterated GGUFs exist for every serious candidate. DIY abliteration (OBLITERATUS: `aggressive` preset won on Qwen3.8; `nuclear` collapses, `basic` unusable — their own telemetry n=7,545) is the path when we want a model nobody has published, or a custom base. Note: OBLITERATUS has an **open MoE routing bug (#116)** — ablating a MoE yourself today is risky; downloading someone else's finished MoE abliteration is not.

---

## 4. Serving topology

> **Topology reality (2026-08-20):** there is NO Mac Studio in the current infra. Compute = **POP fleet: 7× small servers (1× RTX 3060 Ti 8GB + 16GB RAM each), ~5 available** (rest locked to core duties), plus the user's **24GB M4 Pro MacBook Pro** for personal local runs. The LiteLLM gateway at 192.168.80.2:4000 fronts the fleet (public endpoint: modelos.ai.ulusofona.pt).

Existing infrastructure (don't rebuild, wire in):

```
TARTARUS binary
   │
   ├─ provider "pop-fleet" ──→ modelos.ai.ulusofona.pt/v1 (LiteLLM, WIRED + VERIFIED 2026-08-20)
   │                              ├─ ornith-9b, omnicoder-9b, amalia-9b (9B workers)
   │                              ├─ bonsai-27b-1bit (27B experiment)
   │                              └─ [future] uncensored driver deployment (9B test first, then MoE)
   │
   ├─ cloud providers (alibaba-token-plan authed; zai-coding-plan authed) ──→ knowledge workers (phoebe)
   └─ personal Mac (M4 Pro 24GB) ──→ optional local driver via llama.cpp (Q4 27-30B-A3B MoE class)
```

- **llama.cpp server** is the serving layer for drivers: native Qwen3 tool-call handler (Hermes-2-Pro lineage), `--jinja`, `--reasoning off`, `--chat-template-kwargs '{"enable_thinking":false}'`, `--api-key`, schema-constrained JSON, Anthropic-compatible API, prefill support. Recommended: `-c 16384+ -fa on --cache-type-k/v q8_0`.
- **Fleet constraint:** 8GB/GPU → driver candidates there are 9B-class (single GPU) or the existing multi-GPU MoE deployments (reconfiguration needed — deferred by user decision). **Buy-vs-build for the fleet: download a 9B abliterated model (e.g., huihui Qwen3-8B-abliterated-v2 ~5.2GB Q4) as the first driver test.**
- **Mac constraint:** 24GB unified → Qwen3-Coder-30B-A3B at Q4 (~18.7GB) fits tight; Qwen3.8-27B dense at Q4 (~15GB) fits with room; expect ~30-40 t/s MoE / ~15-20 t/s dense class on M4 Pro.
- **Avoid Ollama for Qwen3.5+ tool calling** unless pinned and regression-tested: documented version roulette (#14493 parser wrong, #16383 template drift, #16777 MLX-runner tools→degenerate output on Apple Silicon, #17825 hangs). llama.cpp directly, or LiteLLM in front.
- **LiteLLM stays the single endpoint** (its own philosophy: "query models, use what's there"). LiteLLM also offers `content_policy_fallbacks` (refusal-triggered fallback) as a gateway-level safety net — caveat: its streaming CPV path had a fallback-bypass bug (#28599, fixed #30094).

---

## 5. Refusal-aware routing — the balance

Two layers, cheap one first:

### Layer 1 — Doctrine-level (no code change)
The driver is abliterated, so refusals now come from **cloud workers**, and they arrive as text in `<task_result>`. g0dm0d3's doctrine gains a scoring step using the in-tree patterns (`references/refusal-detection.md`, `godmode_race.py` semantics):

1. Delegate benign subtask to cloud worker.
2. Score the returned text: hard-refusal patterns → auto-reject; hedge patterns → penalty.
3. Refused → **never retry the same surface**: reframe (gray-area embedding), swap worker model, or absorb the task locally (the driver can do it — it doesn't refuse).
4. Log every datapoint to telemetry (technique × model × refused/landed).

This is Mahoraga's judge-gated cascade adapted: local-first, escalate to cloud for capability, judge the cloud's output, local absorbs failures. Measured upstream: 76.5% cost reduction at 0.921 pass@1 with a local judge.

### Layer 2 — Harness-level plugin (code, after Layer 1 proves out)
A TARTARUS plugin on the `chat.message` hook (the exact seam oh-my-openagent uses):
- Per-agent **fallback chains** in `tartarus.json` (adapt OMO's `AGENT_MODEL_REQUIREMENTS` shape: `[{providers, model, variant}]`).
- Error classifier arms a fallback: rate-limit/overloaded/model-not-found/connection → next chain entry; quota/auth → stop.
- Refusal classifier (Layer 1 patterns on assistant text) arms a *reframe-or-reroute*.
- Mutate `output.message.model` before save; auto-continue; cooldown + max-attempts to prevent loops.

### What NOT to build
- No client-side request router proxy (CCR-style) — LiteLLM already centralizes; opencode's per-agent binding + plugin hook covers the rest.
- No recursive delegation (the one-level gate stays — subagents keep `task` denied).

---

## 6. Verification plan (the gap nobody fills)

Every abliterated model card warns or implies it: **"tool calling is not guaranteed"** post-abliteration. Nobody publishes agent-task evals for abliterated models — TARTARUS must own this:

1. **Refusal battery**: tiered probes (the 842-corpus style, our own red-team variant) → refusal rate via `refusal-detection.md` scoring.
2. **Tool-calling battery**: the harness's own tools — file ops, bash, `task()` delegation round-trip, multi-step todo workflows — scored on schema validity + task completion. This doubles as the **delegation-edge live test** the previous mission left open.
3. **Capability spot-check**: coding task + reasoning task vs the aligned base (is the abliteration costing us intelligence?).
4. **System-prompt tolerance**: Qwen3.8-OBLITERATED's card says *no system prompt* (may re-introduce refusal) — test our lean pantheon prompts against it explicitly. If they re-trigger, de-fingerprint further or run the driver with a minimal identity block.
5. Everything → `telemetry.md`. The matrix (model × frame × result) is the deliverable.

---

## 7. Risks (named, not hand-waved)

> **⚠️ PRECEDENT (2026-08-20):** a critical harness bug was found this day — `session/projectors.ts` registered an experimental no-op `PartUpdated` projector AFTER the real one; the projector Map keeps the last duplicate, so **user message parts were never persisted and every run sent the system prompt only**. All earlier refusal measurements were artifacts of models improvising at the persona with no user task. Lesson: **verify delivery before measuring behavior** — the eval battery below starts with a PONG probe for exactly this.

| Risk | Mitigation |
|---|---|
| Abliterated model's tool calling is degraded | Verify before committing (plan §6); fallback: Qwen3-Coder abliterated (coding-trained, most likely intact) |
| System prompts re-trigger residual refusal on abliterated models | Test lean prompts explicitly; keep driver identity block minimal; abliteration removed the direction, framing shouldn't resurrect it — but measure |
| MoE abliteration quality varies by publisher | Prefer OBLITERATUS-org cards (rigorous) or huihui HarmBench proofs; keep aligned base available for A/B |
| Local driver is dumber than cloud frontier | That's the trade: stability for ceiling. Cloud workers cover intelligence gaps; the driver routes, doesn't solo everything |
| Ollama/serving regressions break tools silently | llama.cpp server pinned; multi-turn tool regression test in the eval battery |
| huihui-ai gated repos | mradermacher/bartowski GGUF mirrors (ungated) |
| Dual-use responsibility | Standing frame: authorized red-team research, telemetry as deliverable, no operational harm content as the goal — the harness measures model behavior, it doesn't attack people |

---

## 8. Decision points

1. **Driver model**: Qwen3-Coder-30B-A3B-abliterated (recommended — agentic-native) vs CyberStrike-OffSec-35B (domain specialist) vs Qwen3.8-27B-OBLITERATED (strongest uncensoring, slower) vs HauhauCS Qwen3.6-35B-A3B-Uncensored (POP fleet drop-in).
2. **Hosting**: Mac Studio (llama.cpp already there, user's stated preference) vs POP fleet (drop-in ready) vs both behind LiteLLM (recommended — failover + A/B).
3. **Build order**: config-only first (providers + agent bindings + housekeeping models) → live tool-calling eval → doctrine-level refusal routing → plugin fallback layer.

---

## Appendix — sources

Research sessions 2026-08-20 (4 parallel agents): abliterated-model landscape (huihui-ai/OBLITERATUS/mlabonne/DavidAU-Heretic/dphn catalogs, HF cards, llama.cpp official benches, MacRumors/oMLX/hiesch benchmarks), hybrid routing patterns (claude-code-router@6e1a961, Roo-Code@b867ec9, cline@1687514, aider@5dc9490, Mahoraga, LiteLLM fallbacks/CPV, omo-senpi fallback-architect, cursor2api refusal patterns), abliteration practice (OBLITERATUS@262e818 — presets/tourney/eval suite, Heretic, ricyoung 16-model comparison, Qwen3.6/3.8-OBLITERATED cards), TARTARUS mechanics (config provider schema, retry.ts, chat.message hook, small_model, per-message model stamping, OMO fallback chains).
