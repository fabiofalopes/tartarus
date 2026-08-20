# TARTARUS — Maintenance

How to develop, build, and maintain TARTARUS as an independent fork over time. Read this before making structural changes.

---

## The maintenance model: full divergence

TARTARUS is maintained like Xiaomi's **MiMo Code**: an independent repo that diverged from opencode and does **not** track upstream mechanically.

- **No `upstream` remote, no scheduled sync, no merges/rebases** from `anomalyco/opencode`.
- Upstream is an *ancestor*. Its improvements are **not** absorbed automatically.
- If an upstream fix is genuinely needed, it is **cherry-picked by hand** and conflicts resolved deliberately.

### Why this model

- TARTARUS carries deep, intentional differences (namespace rename, embedded pantheon, removed commercial surfaces, rebrand). Continuous merging would fight those changes on every sync and produce a conflict treadmill.
- A personal fork's velocity and priorities differ from upstream's; divergence keeps the fork focused.

### The cost (be honest about it)

Divergence **compounds**. Every upstream improvement you don't absorb is a growing gap. MiMo Code, two months in, already had hundreds of stale internal references and simply stopped absorbing upstream. Accept this: TARTARUS will drift from opencode, and that is the point. The discipline is to drift *deliberately*, not accidentally.

**Rules of thumb:**
- Cherry-pick upstream only for *bug fixes or security issues* that affect you, never for features (features would re-introduce the surfaces you removed).
- When you cherry-pick, prefer the smallest possible hunk.
- Never bulk-merge an upstream branch.

---

## Building

Requirements: **Bun 1.3+**.

```bash
cd packages/opencode

# install deps (first time / after dependency changes)
bun install

# build a standalone binary for the current platform
bun run script/build.ts -- --single --skip-install --skip-embed-web-ui
```

Output: `packages/opencode/dist/tartarus-linux-x64/bin/tartarus`.

Build flags:
- `--single` — build only the current platform/arch (otherwise all 12 targets).
- `--skip-install` — skip the cross-platform dependency install.
- `--skip-embed-web-ui` — skip building/embedding the web UI (faster; the TUI is unaffected).

The build runs a smoke test (`tartarus --version`) automatically.

### Installing

```bash
cp packages/opencode/dist/tartarus-linux-x64/bin/tartarus ~/.local/bin/tartarus
chmod +x ~/.local/bin/tartarus
```

`~/.local/bin` should be on your `PATH`. The binary is self-contained (the pantheon is embedded), so this is all that's needed.

### Dev loop

```bash
bun dev              # run from source against packages/opencode
bun dev <dir>        # run against a specific project dir
```

---

## Repository management

TARTARUS lives in its own repo with its own history.

- The working branch is `2.0` (imported from opencode's `2.0` branch). Commit directly to it, or create your own branch layout.
- `origin` currently points at `sst/opencode` (the clone source). **Repoint or add your own remote** for the fork:

  ```bash
  git remote rename origin upstream          # keep upstream read-only, for reference
  git remote add origin <your-tartarus-repo> # your own remote
  git push -u origin 2.0
  ```

  Keeping `upstream` as a read-only remote is optional but useful for `git log upstream/…` comparisons and manual cherry-picks. **Do not merge from it.**

- Commit messages follow the repo's conventional-commit style (see `AGENTS.md`).

---

## Licensing & attribution

TARTARUS is MIT, derived from opencode (MIT). Keep attribution honest:

- `LICENSE` carries a **dual copyright**: `Copyright (c) 2026 TARTARUS` and `Copyright (c) 2025 opencode`. Preserve the opencode line.
- The README has a short **"Relationship to OpenCode"** note stating TARTARUS is a diverged fork.
- Do not imply upstream endorsement, and don't use opencode's trademarks (name/logo) as your own identity — TARTARUS has its own.

If you distribute TARTARUS publicly, the MIT terms (and the retained opencode copyright notice) must travel with it.

---

## What NOT to change (isolation invariants)

These keep TARTARUS from colliding with a stock opencode install. Don't revert them:

1. `const app = "tartarus"` in `src/global/index.ts` — the path chokepoint.
2. The `tartarus.json(c)` read candidates in `loadGlobal` (`config.ts`).
3. The `.tartarus` suffix checks (`config.ts`, `config/tui.ts`, `tui/plugin/runtime.ts`, `tui/context/theme.tsx`).
4. The binary name `tartarus` (`package.json` `bin`, `script/build.ts` outfile, `bin/tartarus`).
5. The `tartarus/<ver>` User-Agent.

If you add a feature that reads/writes a global path, route it through `Global.Path.*` — never hardcode `~/.config/opencode` or `.opencode/`.

---

## Extending TARTARUS

**Add/change an agent:** edit or add `.md` files in `packages/opencode/src/seed/agents/` (then rebuild) for the embedded set, or drop them in `~/.config/tartarus/agents/` for user-level agents. See `CONFIG.md` for frontmatter fields.

**Change the theme:** see `THEMING.md`. The built-in default is `tartarus`; override it via `~/.config/tartarus/themes/tartarus.json` without rebuilding, or edit `src/cli/cmd/tui/context/theme/tartarus.json` and rebuild.

**Change the logo:** edit `src/cli/cmd/tui/component/logo.tsx` (TUI, `ascii_font`) and `src/cli/logo.ts` (CLI wordmark). See `THEMING.md`.

**Add a provider:** declare it under `provider` in `tartarus.json`, or add it to the bundled models snapshot. See `CONFIG.md`.

---

## Health checks

After any structural change, verify the isolation and identity hold:

```bash
tartarus debug paths           # all dirs must be ~/.…/tartarus
tartarus debug config          # merged config loads tartarus.json
tartarus debug agent g0dm0d3   # model resolves (providerID/modelID)
tartarus --help                # no 'opencode' branding in help
tartarus                        # TUI: TARTARUS logo, crimson theme, terminal title
```

If `debug paths` ever shows an `opencode` directory, an isolation invariant was broken — find and restore it before continuing.
