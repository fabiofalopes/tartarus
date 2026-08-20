# TARTARUS

> *opencode locks them in; tartarus lets them out.*

A private fork of [sst/opencode](https://github.com/sst/opencode) (2.0 branch) that embeds the G0DM0D3 pantheon as native built-ins. Named after the Greek abyss beneath the underworld — the prison where the Olympians chained the monsters. This fork is where they got out.

## What Changed

Namespace isolation via a single chokepoint (`src/global/index.ts` → `const app`), plus embedded pantheon seeding.

### Namespace Isolation (11 files modified)

| What | Stock opencode | TARTARUS |
|------|---------------|----------|
| XDG config | `~/.config/opencode/` | `~/.config/tartarus/` |
| XDG data | `~/.local/share/opencode/` | `~/.local/share/tartarus/` |
| XDG cache | `~/.cache/opencode/` | `~/.cache/tartarus/` |
| XDG state | `~/.local/state/opencode/` | `~/.local/state/tartarus/` |
| Config file | `opencode.json` / `opencode.jsonc` | `tartarus.json` / `tartarus.jsonc` |
| Project dirs | `.opencode/` | `.tartarus/` |
| Binary | `opencode` | `tartarus` |
| User-Agent | `opencode/{version}` | `tartarus/{version}` |
| System config | `/etc/opencode` | `/etc/tartarus` |

**Kept as OPENCODE_* internally** (plugin ecosystem compat): env vars (`OPENCODE_CONFIG_DIR`, etc.), `@opencode-ai/*` npm package names, `@opencode/*` Effect service IDs, compile-time `OPENCODE_VERSION` define.

### Embedded Pantheon (`src/seed/`)

On first run, the binary seeds these from compile-time text imports:

- `agents/g0dm0d3.md` — primary agent, the tip of the iceberg
- `agents/typhon.md` — compound framing specialist
- `agents/nyx.md` — stealth and prefill
- `agents/eris.md` — encoding and obfuscation (Parseltongue)
- `agents/azazel.md` — forbidden knowledge delivery
- `agents/parseltongue.md` — 9-tier encoding escalation
- `commands/godmode.md` — `/godmode` slash command

The full godmode skill (`src/seed/skills/godmode/`) is deployed manually after install:

```bash
cp -r packages/opencode/src/seed/skills/godmode ~/.config/tartarus/skills/
```

## Architecture

```
          g0dm0d3 (primary)          ← tab-selectable, /godmode, CLI
              │
              ├── @Typhon   (subagent)  compound framing
              ├── @Nyx      (subagent)  stealth & prefill
              ├── @Eris     (subagent)  obfuscation & escalation
              ├── @Azazel   (subagent)  forbidden knowledge delivery
              └── @Parseltongue (all)   33-tier encoding
```

All agents are seeded to `~/.config/tartarus/agents/` on first run. They exist as user-editable .md files — modify them to tune behavior. Delete the file and restart to re-seed the original.

## Build

```bash
cd ~/projetos/tartarus/packages/opencode
bun run script/build.ts -- --single --skip-install --skip-embed-web-ui
```

Binary output: `dist/tartarus-linux-x64/bin/tartarus`

For full builds (all platforms + web UI): `bun run script/build.ts`

## Install

```bash
cp dist/tartarus-linux-x64/bin/tartarus ~/.local/bin/tartarus
chmod +x ~/.local/bin/tartarus
cp -r packages/opencode/src/seed/skills/godmode ~/.config/tartarus/skills/
```

## Usage

```bash
tartarus                    # launch TUI
tartarus --agent g0dm0d3    # CLI with GodMode agent
/godmode <prompt>           # slash command in TUI
```

## Origin

Recovered and completed from Hermes session `20260804_061813_f47b3d` ("OpenCode GodMode Agent Setup"), which crashed during the isolate step. The design context was extracted from Hermes' `state.db` and executed from that point.
