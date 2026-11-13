# TARTARUS — Session Handoff: Temporary Station Moment (2026-11-13)

> **Read this first for the CURRENT MOMENT.** The mission file is
> `docs/NEXT-SESSION.md`; the previous session's full record is
> `docs/NEXT-SESSION-forge-consolidation.md`. This file captures the live,
> deliberately-temporary deployment state at the point this session stopped.
> Do not overwrite the mission file with a handoff.

---

## 1. The moment, exactly (verified 2026-11-13)

**Two clearnet stations are up temporarily; tor is paused.**

| Container                                | Status                               | Host ports (loopback)                                                              |
| ---------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| `tartarus-station-tmpa`                  | Up, healthy                          | 30119 web · 30681 ttyd · 30443 code · 30888 searxng · 30712 gateway · 30082 memory |
| `tartarus-station-tmpb`                  | Up, healthy                          | 31119 web · 31681 ttyd · 31443 code · 31888 searxng · 31712 gateway · 31082 memory |
| `tartarus-station-tor-fabio`             | **Exited (0)** — paused, restartable | 29119 / 27681 / 28443 / 28888 / 28712 / 28082 (free while stopped)                 |
| `agentic-workspace-fabio` + `-searxng-1` | Exited (0)                           | —                                                                                  |

Each temp instance is isolated: own compose project (`TARTARUS_USER=tmpa/tmpb`),
own external volume `tartarus-station_data-tmp{a,b}`, own workspace bind
`workspace-tmp-{a,b}/`, 3G/2 CPU each. They came from the fresh
`tartarus-station:dev` image (2026-11-13 04:56) with the retooled 8-agent
pantheon, 5 RE skills, full RE toolchain and honest receipt.

**Owner's words for this moment**: "maybe no tor now — add one [or] two
instances for a moment". This is a temporary lane, not the permanent topology.

## 2. Model lanes wired into BOTH containers (the whole point of the moment)

Each container carries **two real keys** — in 5 `TARTARUS_MODEL_*/EVAL_*`
env lanes **and** in `/opt/data/.config/tartarus/tartarus.json` (chmod 600,
runtime data volume only — never image, never repo):

| Provider    | Base URL                             | Key                                                         | Models                                                        |
| ----------- | ------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------------- |
| `pop-fleet` | `https://modelos.ai.ulusofona.pt/v1` | `sk-l…` (44 chars, from `~/.config/tartarus/tartarus.json`) | `lfm2-24b-a2b`, `lfm3-1.7b`, `lfm2-8b-a1b`                    |
| `glm-flash` | `http://172.17.0.1:65171/v1`         | **`jkz_…` ("jkey", 43 chars)**                              | `unsloth/GLM-5.3-Flash-GGUF` (exact id — NOT `glm-5.3-flash`) |

**Key facts proven, not assumed:**

- `jkz_…` IS the live Studio key for GLM-5.3-Flash on m3ultra (sha256
  `fc1d455b…` matches the newest `~/.unsloth/studio/auth/llama_api_key_*`;
  a bogus key gets 401 on GLM).
- `jkz_…` is **NOT** a modelos key — 401 on modelos. Never swap the two;
  modelos uses its own `sk-l…` key (200).
- GLM on the Mac is **localhost-only :65171** → tunnel
  `ssh -o ExitOnForwardFailure=yes -fN -L 172.17.0.1:65171:localhost:65171 m3ultra`
  exposes it to the docker bridge only (host-internal, not LAN). The Mac also
  runs an embeddings server on `*:64577` — the port must be picked by which
  `/v1/models` actually contains GLM.
- GLM is a **thinking model**: with ≤24 tokens `content` is empty and the
  reply sits in `reasoning_content`; with ≥256 tokens it returns `PONG`.

**Verified from inside BOTH containers**: `/v1/models` → 200 on both
endpoints; chat `PONG` on both; harness binary itself delivered `PONG` on both
lanes (`pop-fleet/lfm2-24b-a2b` and
`glm-flash/unsloth/GLM-5.3-Flash-GGUF`). Exact-jkey equality checked in both
configs. `station-models.env` (0600) verified: `OPENAI_API_KEY` and
`TARTARUS_EVAL_APIKEY` == jkey, `TARTARUS_MODEL_KEY` == modelos key.

`scripts/glm-endpoint.sh` (habitat `6acb2f7`) discovers the rotating port +
key on the Mac via ssh heredoc, re-establishes the tunnel, prints the card with
a `<API_KEY>` placeholder, and writes the 0600 env file. Usage:
`./scripts/glm-endpoint.sh [--env PATH] [--no-env] [--show-key]`.

## 3. Vault state (unlocked → re-locked this session)

Items: `dev-sys-forgejo-fabio` (primary account), `dev-sys-gitea-tail` (root
admin), `dev-sys-gitea-token-orcist` (minted API token), plus **TWO GLM items
holding the IDENTICAL key** (`passhash fc1d455b…` on both):

- `m3ultra-glm-studio-api-key` — created this session, full notes (source,
  rotation, endpoints, exact model id, DO-NOT-SWAP warning).
- `mac-256-glm-flash-studio-key` — "ACTIVE API key …" notes.

**Redundancy decision owed to the owner** (rename/delete-if-redundant
doctrine): pick one canonical name; do not silently delete either. Vault is
locked at handoff; unlock via `source ~/.config/bw-secrets` +
`bw unlock --passwordenv BW_PASSWORD --raw`.

## 4. Forge status — IMPORTANT open item

**dev-sys Gitea is DOWN at this moment**: host `100.75.113.85` answers ping,
but `:3001` (web) and `:3101` (SSH) refuse connections — a restart/reboot,
not data loss. The first queued push-retry loop **gave up after 80 attempts**
(09:28Z). A fresh loop (`/tmp/push-retry2.sh`, 60 s × 240 = 4 h cap) is now
active and pushes **both** repos each cycle; confirm with
`ps -eo args | grep push-retry2` and `tail /tmp/gitea-push-retry.log`.

Pending pushes (all local commits are safe):

- `tartarus-habitat`: local `2c117af` (gitignore temp workspaces) and
  `6acb2f7` (`glm-endpoint.sh`) — Gitea last known `e612b1a`.
- `tartarus` fork: local `f0ff47fdb7` (this handoff + mission pointer) is on
  **GitHub only**; Gitea last known `871f62f591`.
- When the forge returns manually:
  `git -C ~/projetos/tartarus-habitat push --no-verify origin main` and
  `git -C ~/projetos/tartarus push --no-verify ssh://dev-sys-gitea/fabio/tartarus.git 2.0:2.0`.
- All other repos were mirrored before the outage: `tartarus` `871f62f591`
  (Gitea + GitHub), `tartarus-ops` `be1e171`, `ableton-re-lab` `6e31b1e`,
  `inference-playground`.
- **Top priority from the mission remains the dev-sys instance BACKUP** — this
  outage is exactly why. Next session should first verify the forge is alive,
  push pending commits, then produce the backup proposal for owner approval.

## 5. What ends the moment (owner decision, one line each)

```bash
# tear down the two temporary clearnet stations (volumes + env file remain)
docker rm -f tartarus-station-tmpa tartarus-station-tmpb
# full cleanup afterwards, if wanted
docker volume rm tartarus-station_data-tmpa tartarus-station_data-tmpb
rm -rf ~/projetos/tartarus-habitat/workspace-tmp-a ~/projetos/tartarus-habitat/workspace-tmp-b
# return to the hardened lane
docker start tartarus-station-tor-fabio
```

**Rotation caveat**: Studio regenerates the key AND the port on every respawn.
The containers do NOT auto-reload — after a respawn run
`./scripts/glm-endpoint.sh`, then re-wire (recreate containers with the new
env lanes + rewrite the runtime configs; the wiring helper used this session
lived at `/tmp/wire-models.sh`, key-free, reads keys from the env file / vault).

## 6. Gotchas that will bite (all hit this session)

- Boot cont-init chowns `/opt/data` right after recreate → writing the config
  as `hermes` can fail with EACCES for ~8–30 s; retry with a settle delay.
- `docker exec` defaults to root's HOME; runtime config/agents/skills live at
  `/opt/data/.config/tartarus` (runtime user `hermes`, uid 1000).
- Gitea push URL needs the slash form: `ssh://dev-sys-gitea/fabio/<repo>.git`;
  husky pre-push runs turbo → `--no-verify` for mirror pushes.
- `bw edit`/`bw delete` need FULL item UUIDs (`bw get` accepts prefixes).
- Gitea rejects files >100 MiB — big blobs stay hash-tracked, not committed.
- The station has two pythons: PATH `python3` = hermes venv 3.14, but Debian's
  RE libs live in `/usr/lib/python3/dist-packages` visible only to
  `/usr/bin/python3` (3.13); Debian's pwntools module is `pwnlib`.

## 7. Next-session opening prompt (paste-ready)

> Read `docs/NEXT-SESSION.md` (mission) and
> `docs/NEXT-SESSION-station-moment.md` (this handoff). Verify the moment
> first: `docker ps --format '{{.Names}} {{.Status}}' | grep tartarus`,
> `pgrep -af 'ssh.*-L 172.17.0.1:65171'`, `curl -s -o /dev/null -w '%{http_code}'
http://100.75.113.85:3001` (Gitea alive?), `bw status`,
> `git -C ~/projetos/tartarus-habitat status`. Then, in order:
> (1) if Gitea is back, PUSH the pending habitat commits and confirm all five
> repos are mirrored; (2) the dev-sys BACKUP proposal for owner approval;
> (3) ask the owner whether the temporary clearnet pair stays or returns to
> tor, and which of the two duplicate GLM vault items is canonical;
> (4) if Studio respawned, re-discover the GLM lane; (5) GitHub mirror →
> private (owner UI action); (6) driver-quality decision on lfm2-24b-a2b;
> (7) Gitea capability discovery; (8) Ableton redo from
> `~/projetos/tartarus-ops/ARTIFACTS.md`; (9) Kali-station external test track.
> Load `tartarus-dev`. Doctrine: PONG before measurements, telemetry per run,
> keys via Vaultwarden/env only, hash before touch, operator owns every sudo
> act, commits after each verified step.

## 8. Standing doctrine (unchanged)

Delivery first (PONG canary before scoring anything). Verify before claiming.
Keys live in the vault, never in chat/repos/image layers. Telemetry one line
per significant run. Fleet/image changes only on owner go-ahead. Hash before
touch. Nothing leaves owner-owned infrastructure.
