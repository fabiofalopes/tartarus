# TARTARUS — Next-Session Briefing: Reverse-Engineering Capability Buildout

> **Read this first.** Mission state + exactly where work stopped mid-stream.
> This file IS the initialization prompt for the next session. Do not overwrite
> `docs/NEXT-SESSION.md` (the mission file) with this handoff.

---

## TL;DR — where we are

Reverse-engineering capability was added to the TARTARUS harness on 2026-11-12 and
is **partially complete and unverified end-to-end**. Done and verified: a
reverse-engineering/forensics **skill** is written, seeded, discoverable and
permission-gated; a new pantheon subagent **`abaddon`** is live and routed; REA
("Reverse Engineer Anything", MIT, v6.8.0) is vendored into the habitat repo with
checksums verified against source and registered as an MCP surface; the station
Dockerfile was extended to bake a verified RE/DFIR toolchain; the receipt-writer
now reports RE tooling honestly.

**The single most important unfinished action: the station images were NOT
rebuilt, so none of the new tooling is actually running.** The owner approved a
rebuild of BOTH images in the prior session. That rebuild is the first thing to
do. Until it happens the running station has zero RE tooling and every RE skill
must honestly report "no disassembler available."

Second unfinished item: the owner approved packaging **ALL** remaining RE skill
categories (memory forensics/triage, mobile + firmware RE, binary exploitation and
vuln research, fuzzing at scale) — one skill at a time. None of those four are
written yet.

---

## What was done — verified facts (2026-11-12)

### 1. Harness now has RE capability (live, verified)

- **New skill** `reverse-engineering-malware-with-ghidra` created in
  `tartarus-habitat/docker/skills/reverse-engineering-malware-with-ghidra/`
  (SKILL.md + `references/api-reference.md` + `scripts/agent.py` + LICENSE).
  Adapted from the Anthropic Cybersecurity Skills collection (Apache-2.0, author
  mahipal) — already catalogued locally in `reference-atlas`. Frontmatter validated
  (name matches directory, description present); harness build passed its smoke
  test; the skill is confirmed **discoverable** via `tartarus debug skill` and is
  **permission-gated** (`external_directory: allow` scoped to its own path).
- **New pantheon subagent `abaddon`** (RE / malware analysis / digital forensics).
  Created at `packages/opencode/src/seed/agents/abaddon.md`, registered in
  `SEED_AGENTS` in `src/global/index.ts`, delegation table regenerated via
  `bun run script/gen-pantheon.ts` (now **7 agents, 10 rows** — g0dm0d3 routes RE
  work to abaddon), typecheck clean, build smoke passed, **confirmed live** in
  `tartarus agent list`.
- The triage script self-tests honestly: run against `/bin/ls` it produced hashes
  and reported `Disassembly: r2pipe not installed — no disassembler available in
this container` rather than inventing findings. That honest-degradation property
  is the point of the skill.

### 2. REA is vendored and wired as an MCP surface

- `/home/fabio/mac-projects/rea/` is a full vendored copy of **REA v6.8.0**
  (MIT, (c) 2026 morluto, npm `rea-agents`) with bridges for **Ghidra 12.1.4,
  Cutter/rizin, Hopper, NativeAOT, process tracing, pwndbg, pwntools, Android/jadx,
  mitmproxy**, plus 109 capability docs.
- Vendored into `tartarus-habitat/docker/rea/` (src, bridge, scripts, licenses,
  docs, tests — no `.git`). **Checksums verified identical to source**:
  `server.json` d36a3152…, `LICENSE` 798f9e4d…, `package.json` 2606aa5f…
- Registered as MCP surface **`rea`** in `docker/mcp/manifest.json` (stdio,
  `node /opt/station/rea/scripts/rea.mjs mcp`, no egress of its own). Registry now
  lists: searxng, memory, filesystem, fetch, playwright, **rea**.
- **Node floor check passed**: REA needs `^22.23.4 || ^24.22.1 || >=26.12.1`; the
  station runs **Node v26.12.1** — satisfies it exactly. (Host node is v22.22.0 and
  does NOT meet it; REA runs in the container, not on the host.)
- Self-defect caught and fixed: vendored source alone cannot run without its 42
  dependencies, so the Dockerfile layer now installs them from the vendored lockfile
  with pinned allowScripts approval and **proves the MCP server starts**.

### 3. Toolchain baked into the station image (approved, NOT yet built)

Added to `docker/Dockerfile` as a build-time layer, every package verified present
in Debian trixie before being baked, each verified by `command -v` at build time:

`afl++ 4.21c-5` · `apktool 2.7.0+dfsg-7` · `binwalk 2.4.3+dfsg1-2+deb13u1` ·
`build-essential 12.12` · `cmake 3.31.6-2` · `forensics-all 3.61` · `gdb 16.3-1` ·
`gdb-multiarch 16.3-1` · `gdbserver 16.3-1` · `nasm 2.16.03-1` · `ncat 7.95+dfsg-3` ·
`patchelf 0.18.0-1.4` · `python3-capstone 5.0.7` · `python3-keystone 2:27.0.0` ·
`python3-networkx 3.2.1-5` · `python3-pefile 2024.8.26-2.1` ·
`python3-pyelftools 0.32-1` · `python3-pwntools 4.14.1-1` · `python3-unicorn 2.1.1-2` ·
`python3-yara 4.5.1-1+b3` · `yara 4.5.2-1`

**Architecture decision the owner made, and why it is correct:** RE/DFIR is
file-based computation and needs **zero added capabilities**, so it bakes into the
`cap_drop: ALL` station without weakening hardening. Active/offensive work
(nmap raw scans, spoofing, C2, fuzzing against live targets) needs NET_RAW/NET_ADMIN
and clearnet egress and therefore stays in a **separate, separately
capability-granted range** — never baked into the brain.

**THE DISASSEMBLER GAP — do not lose this:** Debian trixie ships **NO ghidra, NO
radare2, NO rizin, NO Cutter, NO volatility3, NO frida** (all verified absent;
`radare2` has no candidate at all). So the station has a debugger (gdb) and a
fuzzer but still **no disassembler/decompiler from the archives** — REA is what
supplies bridged Ghidra/rizin/Hopper analysis. If REA's backends are absent, the
honest answer is "no disassembler here," never an invented finding.

**Why tooling cannot be installed at runtime:** the station is `cap_drop: ALL` and
the tor twin fences all egress — an `apt-get update` inside the running container
**timed out** (verified). Everything must be baked at build time. Host is also
non-root with no sudo (`sudo: a password is required`), so host apt is not a path
either.

### 4. Receipt now tells the truth about tooling

`docker/versions-worker` was extended to live-probe every RE tool and emit
`re_skills_seeded`, `re_tools_installed`, `re_python_libs`, `rea_engine`, and to add
`problems[]` entries (`re-disassembler-absent`, `re-toolchain-absent`,
`re-python-libs-absent`, `rea-reverse-engineering-engine-absent`). A disassembler
that is not installed must appear as absent — an unverified tool claim is how
fabricated analysis happens. Syntax validated.

### 5. Reference corpus located (the "references all over locally" the owner meant)

- **818-skill cybersecurity skill library** at
  `~/projetos/cyber-foundry/reference-repos/Anthropic-Cybersecurity-Skills/skills/`
  — **~141 modules are RE / malware analysis / forensics / exploitation**, including
  `reverse-engineing-malware-with-ghidra`, `analyzing-golang-malware-with-ghidra`,
  `reverse-engineering-android-malware-with-jadx`,
  `reverse-engineering-dotnet-malware-with-dnspy`,
  `reverse-engineering-ios-app-with-frida`, `performing-firmware-malware-analysis`,
  `performing-firmware-extraction-with-binwalk`, `analyzing-memory-dumps-with-volatility`,
  `performing-fuzzing-with-aflplusplus`, `performing-binary-exploitation-analysis`,
  `analyzing-bootkit-and-rootkit-samples`, `performing-yara-rule-development-for-detection`.
- **`reference-atlas`**: 15,174 catalogued entities on a security taxonomy spine.
  Reverse Engineering is domain 7 (164 entities) with subdomains
  **binary-exploitation / fuzzing / decompilation**. Query it read-only:
  `sqlite3 -readonly reference-atlas/atlas.db`.
- `cyber-foundry-kit` holds ~40 curated SKILL.md modules + canon (wifi-attacks,
  red-team-ops, forensics, infra-hardening, audit-theory, labs).

---

## DO THIS FIRST (in order)

1. **Rebuild both station images and verify tooling lands.** Approved and pending.
   `~/projetos/tartarus-habitat/scripts/tartarus-station build` then
   `... build-tor`, then `... up`, then `... smoke` and `... versions`.
   Verify the receipt now reports `re_tools_installed` non-null and
   `rea_engine: true`, and confirm the skills seeded into
   `~/.config/tartarus/skills/`. Disk is fine (366G free on `/data/small1`;
   a rebuild needs ~20GB and rewrites the whole ~14.2GB image — if the build dies
   mid-run, `docker builder prune --all -f --reserved-space 0` reclaims space).
   Note: the prior session's `smoke` run reported the **clearnet** station not
   running while the **tor** twin was up and healthy (up 2h) — verify both lanes.
2. **Package the remaining RE skills — the owner said ALL of them, one at a time:**
   memory forensics & triage (Volatility3 discipline, IOC extraction, rootkit and
   injection and persistence hunting, YARA triage) · mobile + firmware RE (Android/iOS,
   APK teardown, cert-pinning bypass, binwalk firmware carving, UEFI bootkit) ·
   binary exploitation and vuln research (exploit analysis, heap exploitation,
   pwntools/pwndbg-assisted PoC) · fuzzing at scale (AFL++, crash triage,
   harness authoring). Draw content from the local 818-skill library and the atlas,
   adapt into `tartarus-habitat/docker/skills/<name>/`, validate frontmatter,
   seed, and verify discoverability. Each skill must degrade honestly when a tool
   is missing and must check the receipt before claiming a capability.
3. **Consider a dedicated RE subagent per discipline** rather than one agent for
   everything; register each in `SEED_AGENTS` and regenerate the delegation table
   so routing never drifts from the roster.

---

## Mechanics that will bite you (all verified this session)

- **Seeding is skip-if-exists and the seed map is an explicit list, not a directory
  scan.** `SEED_AGENTS` in `packages/opencode/src/global/index.ts` names each agent
  file. A new agent file that is not listed there **never seeds** — this is exactly
  how `abaddon` failed to appear the first time. Fix: add the import + map entry,
  rebuild, then **delete the runtime copies** (`rm ~/.config/tartarus/agents/*.md`)
  and re-run the binary to force a reseed. Verify with `tartarus agent list`.
- **Skills are gated by permission per agent** —
  `Skill.available()` filters on `Permission.evaluate("skill", name, agent.permission)`.
  A skill nobody is permitted to use is invisible.
- **Skills self-seed from the habitat repo:** `docker/bootstrap.sh` copies
  `/opt/station/skills` (which is `docker/skills/`) into
  `~/.config/tartarus/skills/` at boot, skip-if-exists. That is why RE skills belong
  in the habitat repo — the owner's explicit choice.
- `bun run script/gen-pantheon.ts` regenerates the delegation table from the other
  agents' `metadata` frontmatter. Run it after ANY subagent metadata edit.
- Run `bun run typecheck` from `packages/opencode` (never `tsc` directly). Default
  branch is `dev`; the active TARTARUS branch is `2.0`.
- The habitat's own AGENTS.md rules: base image is frozen by choice (layer on, never
  rebuild the base); pre-FROM ARGs are out of stage scope; every JSON written in
  build must be proven valid; npm is v12 (`--no-progress` is gone; allowScripts must
  be pinned entries, not a CLI flag); secrets go through env only, never into images.
- The habitat already had **pre-existing uncommitted modifications** before this
  session (README.md, `docker/s6/*`, `docker/eval/README.md`, `scripts/tartarus-station`,
  `.orbit/GAPS.md`, `docker/workshop/SOURCES.md`) — those are not this session's work.
  This session changed only: `docker/Dockerfile`, `docker/mcp/manifest.json`,
  `docker/versions-worker`, new `docker/rea/**`, new `docker/skills/reverse-engineering-malware-with-ghidra/**`,
  and in the fork `src/global/index.ts` + `seed/agents/g0dm0d3.md` + new `abaddon.md`.

---

## Standing doctrine

- **Verify before claiming.** The receipt (`/opt/tartarus/versions.json`) is the only
  source of truth about what is installed; `problems[]` lists what is missing.
- **Assembly outranks pseudo-C.** The decompiler is confidently wrong; the machine
  code is right. Run full auto-analysis first, never invent function boundaries.
- **Triage before depth** — hash first, find the true entry point past any packer stub.
- **Analysis stays offline.** A sample is a file; the tor fence exists so samples
  never leave. Do not hand samples to external sandboxes.
- **Telemetry discipline**: every significant run gets one line in
  `~/.local/share/tartarus/telemetry.md` (date | target | technique | refused/landed
  | note); generalize only from n≥3.
- Never put keys in context; commit nothing without inspection; fleet and image
  changes need explicit owner go-ahead.
