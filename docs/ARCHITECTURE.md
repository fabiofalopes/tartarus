# TARTARUS — Architecture

> *opencode locks them in; tartarus lets them out.*

TARTARUS is a fully-diverged personal fork of [opencode](https://github.com/anomalyco/opencode) (the `2.0` branch). It is not a drop-in wrapper or a plugin — it is a standalone build with its own binary, its own config/data namespace, its own visual identity, and an embedded agent pantheon. It runs alongside a stock `opencode` install without touching it.

This document explains what TARTARUS is, how it is isolated, and what was changed relative to upstream.

---

## Why "Tartarus"

In Greek myth, Tartarus is the abyss *beneath* the underworld — the prison where the Olympians chained the monsters they defeated. Typhon himself was bound there. The stock opencode agents are Olympians (sisyphus, atlas, prometheus, oracle). This fork is the place the monsters got out of.

The name is more than flavor: it drives the visual identity (a blood-and-ember palette, a heavy block wordmark) and frames the fork's purpose — an unshackled harness for measuring what models produce when alignment is bypassed.

---

## Fork strategy: full divergence

TARTARUS follows the **full-divergence** model (the same archetype Xiaomi's MiMo Code uses):

- The upstream history was imported once; from here TARTARUS develops **independently**.
- There is **no automated sync, merge, or rebase** from `anomalyco/opencode`. Upstream is treated as an *ancestor*, not a *remote*.
- Attribution is documentation-level only (see `LICENSE` and the "Relationship to OpenCode" note in the README).

The trade-off is explicit: upstream improvements are *not* absorbed automatically. If an upstream fix is ever wanted, it is cherry-picked by hand. See `MAINTENANCE.md` for the reasoning and the discipline this requires.

---

## Namespace isolation

The single most important structural fact: **everything a user touches is namespaced under `tartarus`**, so the fork never reads or writes a stock opencode install.

### The chokepoint

All global paths derive from one constant in `packages/opencode/src/global/index.ts`:

```ts
const app = "tartarus"   // was "opencode"
```

That one value flows through the XDG base-dir helper to produce:

| Purpose    | Stock opencode            | TARTARUS                    |
|------------|---------------------------|-----------------------------|
| config     | `~/.config/opencode`      | `~/.config/tartarus`        |
| data       | `~/.local/share/opencode` | `~/.local/share/tartarus`   |
| cache      | `~/.cache/opencode`       | `~/.cache/tartarus`         |
| state      | `~/.local/state/opencode` | `~/.local/state/tartarus`   |

`auth.json` (provider credentials), the session database, and logs all live under these, so TARTARUS authenticates and stores sessions independently.

### What else was renamed

| Surface                  | opencode                | tartarus                |
|--------------------------|-------------------------|-------------------------|
| Binary                   | `opencode`              | `tartarus`              |
| Global config file       | `opencode.json(c)`      | `tartarus.json(c)`      |
| Project config dir       | `.opencode/`            | `.tartarus/`            |
| Project config file      | `opencode.json(c)`      | `tartarus.json(c)`      |
| User-Agent header        | `opencode/<ver>`        | `tartarus/<ver>`        |
| System config dir        | `/etc/opencode`         | `/etc/tartarus`         |
| mDNS domain              | `opencode.local`        | `tartarus.local`        |
| CLI script name          | `opencode <cmd>`        | `tartarus <cmd>`        |

### What was deliberately NOT renamed

To keep the codebase coherent and the diff small, internal identifiers stay `opencode`:

- The package directory is still `packages/opencode` (a *historical* name, as MiMo Code puts it).
- npm workspace packages remain `@opencode-ai/*` (they are import specifiers, not user-facing).
- Effect service IDs remain `@opencode/Session`, `@opencode/Config`, etc.
- `OPENCODE_*` environment variables are kept for plugin-ecosystem compatibility.
- The `opencode` / `opencode-go` **provider IDs** remain valid provider identifiers (they refer to upstream's gateway as one of many connectable providers); they are simply no longer promoted or recommended in the UI.

This split — rename the user-facing surface, freeze the internals — is the same line both MiMo Code and other independent forks converged on, because renaming thousands of internal references would make every future upstream cherry-pick a conflict.

### Config-loading fixes

Upstream had two assumptions that broke once the app name changed; both were fixed:

1. **Global read path** (`config.ts` `loadGlobal`) only read `config.json` / `opencode.json` / `opencode.jsonc`, while the *write* path preferred `tartarus.jsonc`. TARTARUS now reads `tartarus.json` / `tartarus.jsonc` from the global config dir, so read and write agree.
2. **Project-dir suffix check** (`config.ts`, `config/tui.ts`, `tui/plugin/runtime.ts`, `tui/context/theme.tsx`) gated JSON/theme loading on `dir.endsWith(".opencode")`. Those checks now match `.tartarus`, so project-level `.tartarus/` config, `tui.json`, and custom themes load correctly.

---

## The embedded pantheon

TARTARUS ships a red-team agent pantheon as **first-run seeds**. On startup, `global/index.ts` writes them into `~/.config/tartarus/` if they are absent. The source of truth lives in-tree at `packages/opencode/src/seed/`:

```
src/seed/
├── agents/
│   ├── g0dm0d3.md        # primary — the tip of the iceberg
│   ├── typhon.md         # compound framing
│   ├── nyx.md            # stealth & prefill
│   ├── eris.md           # obfuscation & escalation
│   ├── azazel.md         # forbidden-knowledge delivery
│   └── parseltongue.md   # encoding tiers
├── commands/godmode.md   # /godmode slash command
└── skills/godmode/       # self-contained doctrine (in-tree copy, not a symlink)
```

The agents are embedded at compile time (`import … with { type: "text" }`) and written out on first run, so the binary is self-contained — no external skill repo is required.

```
          g0dm0d3 (primary)          ← tab-selectable, /godmode, CLI
              │
              ├── @Typhon   (subagent)  compound framing
              ├── @Nyx      (subagent)  stealth & prefill
              ├── @Eris     (subagent)  obfuscation & escalation
              ├── @Azazel   (subagent)  forbidden-knowledge delivery
              └── @Parseltongue (all)   encoding tiers
```

Each agent's `.md` frontmatter binds its model (see `CONFIG.md`). `tartarus.json` sets `default_agent: g0dm0d3`.

> **Scope note.** The pantheon is authorized red-team tooling: jailbreak evaluation, refusal mapping, and safety research. It is shipped for that purpose; the fork itself is model-agnostic and works with any provider you configure.

---

## Visual identity

TARTARUS does not look like opencode. Three pieces:

1. **Theme** — a built-in `tartarus` theme (`tui/context/theme/tartarus.json`) is registered and set as the default. It is a "blood & ember" palette: crimson primary, ember-gold accent, warm-tinted near-black background. See `THEMING.md`.
2. **Logo** — the TUI home logo uses OpenTUI's `ASCIIFont` renderable (`font: "block"`) to render a heavy two-tone **TARTARUS** wordmark in the theme's primary color. The CLI banner uses the same block wordmark. See `THEMING.md`.
3. **Strings** — terminal title, sidebar wordmark, exit hint, help text, tips, and dialogs all say TARTARUS. Upstream's commercial surfaces (OpenCode Zen/Go upsells, `opencode.ai` links) were removed or de-emphasized.

---

## Repository layout

```
tartarus/
├── packages/opencode/          # core (historical directory name)
│   ├── src/
│   │   ├── global/index.ts     # app-name chokepoint + pantheon seeding
│   │   ├── config/             # config schema + load/merge (tartarus fixes)
│   │   ├── seed/               # embedded pantheon (agents/command/skill)
│   │   ├── cli/                # CLI + TUI (logo, theme, strings)
│   │   ├── provider/           # model/provider registry
│   │   └── session/            # session + retry logic
│   ├── script/build.ts         # standalone-binary build (bin/tartarus)
│   └── bin/tartarus            # platform launcher shim
├── docs/                       # this documentation
├── DESIGN.md                   # original design brief
├── LICENSE                     # MIT + dual attribution
└── README.md                   # project overview + Relationship to OpenCode
```

Build & run are covered in `MAINTENANCE.md`; configuration in `CONFIG.md`; theming in `THEMING.md`.
