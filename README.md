# TARTARUS

```
████████╗  █████╗  ██████╗  ████████╗  █████╗  ██████╗  ██╗   ██╗ ███████╗
╚══██╔══╝ ██╔══██╗ ██╔══██╗ ╚══██╔══╝ ██╔══██╗ ██╔══██╗ ██║   ██║ ██╔════╝
   ██║    ███████║ ██████╔╝    ██║    ███████║ ██████╔╝ ██║   ██║ ███████╗
   ██║    ██╔══██║ ██╔══██╗    ██║    ██╔══██║ ██╔══██╗ ██║   ██║ ╚════██║
   ██║    ██║  ██║ ██║  ██║    ██║    ██║  ██║ ██║  ██║ ╚██████╔╝ ███████║
   ╚═╝    ╚═╝  ╚═╝ ╚═╝  ╚═╝    ╚═╝    ╚═╝  ╚═╝ ╚═╝  ╚═╝  ╚═════╝  ╚══════╝
```

> *opencode locks them in; tartarus lets them out.*

TARTARUS is a fully-diverged personal fork of [opencode](https://github.com/anomalyco/opencode) — a standalone AI coding agent with its own binary, its own config/data namespace, its own visual identity, and an embedded red-team agent pantheon. It runs alongside a stock `opencode` install without touching it.

In Greek myth, Tartarus is the abyss beneath the underworld where the Olympians chained the monsters. The stock opencode agents are Olympians. This fork is where the monsters got out.

---

## What makes it different

- **Isolated namespace** — config, data, cache, and state all live under `tartarus` (`~/.config/tartarus`, `~/.local/share/tartarus`, …). Nothing is shared with a stock opencode install.
- **Embedded pantheon** — ships a red-team agent roster (`g0dm0d3` primary + `typhon`, `nyx`, `eris`, `azazel`, `parseltongue`) seeded on first run, plus a `/godmode` command and an in-tree doctrine skill.
- **Own identity** — a "blood & ember" crimson theme and a heavy block **TARTARUS** wordmark. Upstream's commercial surfaces (Zen/Go upsells, `opencode.ai` links) are removed.
- **Standalone binary** — one self-contained `tartarus` executable.

## Quick start

Requires **Bun 1.3+**.

```bash
cd packages/opencode
bun install
bun run script/build.ts -- --single --skip-install --skip-embed-web-ui
cp dist/tartarus-linux-x64/bin/tartarus ~/.local/bin/tartarus && chmod +x ~/.local/bin/tartarus
tartarus
```

See [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md) for build flags, the dev loop, and install details.

## Documentation

| Doc | Contents |
|-----|----------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | What TARTARUS is, namespace isolation, the pantheon, repo layout |
| [`docs/CONFIG.md`](docs/CONFIG.md) | Config files, model/provider binding, auth, agent frontmatter |
| [`docs/THEMING.md`](docs/THEMING.md) | Theme system, the tartarus palette, the logo, customization |
| [`docs/MAINTENANCE.md`](docs/MAINTENANCE.md) | Fork strategy, building, repo management, what not to break |
| [`DESIGN.md`](DESIGN.md) | The original design brief |

## Relationship to OpenCode

TARTARUS is built as a fork of [OpenCode](https://github.com/anomalyco/opencode). It keeps OpenCode's core agent, tool, and provider capabilities and diverges with an isolated namespace, an embedded agent pantheon, and a distinct identity. It is developed **independently** — there is no automated sync with upstream, and it is not affiliated with or endorsed by the OpenCode project. See `docs/MAINTENANCE.md` for the fork strategy.

## License

MIT — see [LICENSE](LICENSE). TARTARUS retains attribution to opencode (`Copyright (c) 2025 opencode`) alongside its own copyright.
