# TARTARUS — Session Handoff: Forge Consolidation (2026-11-12, session close)

> This file is the initialization prompt for the next session. Do not overwrite
> `docs/NEXT-SESSION.md` (the mission file) with this handoff.
> Session window: recovery → parseltongue retool → forge consolidation → vault
> integration. Everything below is verified, committed, and mirrored.

---

## TL;DR — where things now stand

The dev-sys Gitea (`http://100.75.113.85:3001/fabio`, SSH :3101, tailnet) is now
the **primary home of the TARTARUS workspace**: all three core repos are
mirrored there with ref parity verified, and the owner's Vaultwarden
(`https://192.168.80.8:8443`) is the credential store holding the minted API
token. The forge went from "a server" to "the most important server I own" in 48
hours — **its backup strategy is the top open item**, followed by the pending
station image rebuild.

## What this session did (all verified + committed)

### 1. Recovery of the dead session

- Dead session `ses_e323ba52…` ("Stage-2 matrix FAIL recovery") looped 03:20:50Z
  (breaker intercepted identical repeated calls — worked as designed), died
  04:58Z mid-task. Its uncommitted work was verified and committed:
  habitat `13683f2` (RE toolchain bake + crash-loop hardening), fleet
  `a295289` (control-plane + admission-control proxy).

### 2. Harness repairs (fork commits `293cfc5814`, `7e6f6bc4e0`, `2a1a6cfa86`)

- **Eval-runner cwd bug**: runners must `mkdir` the `--dir` workspace before
  `tartarus run` (harness validates cwd before exec). All prior GSM8K "0% FAIL"
  results were harness failure, not model behavior. After fix: **clean canary
  100% (25/25) PASS** on `pop-fleet/lfm2-24b-a2b`.
- **Gateway key restored** file-to-file (config held a literal `{env:…}`
  placeholder → 401 + silent discovery failure). PONG verified.
- **Parseltongue retooled per owner doctrine**: encoding orchestrator carrying
  tier payloads THROUGH live instruments (abliterated local fleet; GLM/Z.AI,
  MiniMax, DeepSeek, flash-tier when configured). Moat doctrine: TARTARUS
  protects inside, instruments carry the payload outside, keys never in
  context. Bound `pop-fleet/lfm2-24b-a2b` (second bound member alongside
  phoebe). Seeds rebuilt from source; reseed verified; delegation table
  regenerated (7 agents / 10 rows).
- **Driver-quality flag**: `lfm2-24b-a2b` fails the overt-frame refusal control
  (frame refused 0/3; lock 2/3 degenerate tail). Owner decision pending.

### 3. Forge consolidation (this close-out)

- `fabio/tartarus` — full fork history, 2.0 + upstream/dev, 1170 tags, parity
  verified (2.0 head `2a1a6cfa86`). Remote `gitea` added alongside github origin.
- `fabio/tartarus-habitat` + `fabio/inference-playground` — **first remote
  ever** (previously zero off-box backup). `origin` = gitea, upstream set.
- 42 existing repos inventoried — nothing tartarus-related needed renaming;
  canonical names were free. 5 repos are PUBLIC (agentic-workspace,
  hermes-base-sandbox, hermes-coding-sandbox, docs-transformer, hermes-os) —
  flagged for the owner, tailnet-local so low risk.

### 4. Vault integration (owner-directed pattern — REUSABLE)

- API token **minted via Gitea API basic-auth using the vault-held account
  password** and stored **directly into Vaultwarden** as
  `dev-sys-gitea-token-orcist` (scopes write:repository+write:user+read:user,
  full notes: purpose/scopes/rotation). Never in chat, never in files.
- Vault housekeeping per the same rename/delete-if-redundant doctrine:
  account + root items annotated (URIs, purpose, usage boundaries); redundant
  test entry deleted. Final forge set: 3 canonical items.
- **This is the established pattern for future projects**: vault holds account
  - token items with proper descriptions; scripts source `~/.config/bw-secrets`
    and pull secrets at use-time; nothing sensitive crosses context.

## Top open queue (priority order)

0. **GitHub mirror → private** (owner request, session close): stored PAT lacks
   `administration:write` (HTTP 403 on PATCH visibility). Owner action:
   github.com/fabiofalopes/tartarus → Settings → General → Danger Zone →
   "Change repository visibility" → Private. Exposure note of record: the
   sensitive content (Docker/station/habitat layers) lives in the habitat repo
   and never touches GitHub; the fork mirror is harness code only, tolerable
   until flipped.

1. **dev-sys Gitea instance BACKUP** — the forge is now the most important
   server the owner has; it must be alive beyond orcist. Candidates: `gitea
dump` on a schedule, off-box copies (restic/borg to another node + the Mac),
   Vaultwarden backup alongside. **Owner will drive design; prepare a proposal.**
2. **Station image rebuild** (aborted mid-flight this session): container runs
   pre-retool binary `0af7c3a` without the RE toolchain; rebuild from canonical
   habitat repo picks up parseltongue retool + RE bake + receipt extension.
   Verify `re_tools_installed` non-null + `rea_engine: true` in the receipt.
3. **Driver-quality decision** on lfm2-24b-a2b (refusal-control failure +
   degenerate tail) vs restoring the validated heretic line.
4. **Gitea capability discovery** (owner: "feels like stuff is lacking"):
   candidates worth evaluating — Gitea Actions + runners (CI on pushes),
   packages/registry, badges, dashboards/visualization (gitea-metrics +
   Grafana), webhooks to the station, PR templates, protected branches.
   Also: the owner's vague "place to properly visualize things" → propose a
   Grafana/homeboard over gitea metrics + fleet + battery telemetry.
5. **Battery matrix completion** on the live surface (stages 1/3/4, loop-
   provocation; stage 5 canary already PASS) + cloud instrument provisioning
   (GLM/MiniMax/DeepSeek) for parseltongue when the owner supplies providers.
6. **Kali-station external-tester track** (owner, session close): the Kali-
   built agentic/container environment (distinct from the pure-Debian habitat
   station) is the one the owner finally wants **other people to test**.
   Not this workspace's immediate business — but before external hands touch
   it: confirm its secrets/seeding hygiene (no credentials baked in images),
   document the intended test scope, and decide its repo home on Gitea.
7. Older queue stands: scorer calibration, SLIP/PAP stimulus expansion,
   30B-driver buy-vs-build, scorer rubric second stage.

## Mechanics that will bite you (all verified this session)

- **bw CLI gotchas**: vault items require FULL UUIDs for `bw edit`/`bw delete`
  (prefixes work for `bw get`); the vault re-locks and the `BW_SESSION` in
  `~/.bashrc` is stale — scripts must `source ~/.config/bw-secrets` and
  `bw unlock --passwordenv BW_PASSWORD --raw` per run; keep the session key in
  `/tmp/bw_session` (0600) for the working session only.
- **Gitea scoped tokens**: repo creation needs `write:user` too, not just
  `write:repository`. Mint via `POST /api/v1/users/fabio/tokens` with
  basic-auth (vault-held password). Push-to-create is DISABLED on this instance.
- **Husky pre-push runs a full turbo build** — bypass with `--no-verify` for
  mirror/migration pushes; normal commit pushes keep the hook if turbo passes.
- **Gitea API size field is in KB** (534067 ≈ 522 MiB for tartarus — matches).
- **tartarus run validates cwd before exec** — always create `--dir` first.
- Seeds: rebuild-from-source, install, delete runtime seeds, re-run, verify —
  a binary built before a seed edit reseeds OLD content silently.
- Control-plane timer is a systemd **--user** unit (check user scope, not system).
- STATE-OF-PLAY is fleet truth: ornith-35b retired 2026-11-04; live surface =
  lfm2-24b-a2b / lfm3-1.7b / lfm2-8b-a1b / stt.

## Next-session opening prompt (paste-ready)

> Read `docs/NEXT-SESSION.md` (mission) and
> `docs/NEXT-SESSION-forge-consolidation.md` (last handoff). Verify state first:
> `git -C ~/projetos/tartarus status`, `git ls-remote ssh://dev-sys-gitea/fabio/tartarus.git
refs/heads/2.0` (expect 2a1a6cfa86 or newer), `bw status`. Then the top queue:
> (1) Gitea backup proposal for the owner's approval, (2) station image rebuild
>
> - receipt verification, (3) driver-quality decision material. Load the
>   `tartarus-dev` skill. Doctrine: PONG before measurements, telemetry per run,
>   keys only via Vaultwarden scripts, commits after each verified step.

## Standing doctrine (unchanged)

- Delivery first, always (PONG canary before any behavior is scored).
- Telemetry: one line per significant run in `~/.local/share/tartarus/telemetry.md`.
- Keys live in Vaultwarden, move file-to-file, never in context or chat.
- Fleet and image changes only on explicit owner go-ahead.
- Verify before claiming; commit after each verified step; keep trees clean.
