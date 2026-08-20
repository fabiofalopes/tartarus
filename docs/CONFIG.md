# TARTARUS — Configuration

How TARTARUS is configured: where config lives, the file format, how agents bind to models, and how providers authenticate.

---

## Where config is read from

TARTARUS loads config from several locations; **later sources override earlier ones**:

1. Built-in defaults
2. **Global config dir** — `~/.config/tartarus/`
   - `config.json`, then `tartarus.json`, then `tartarus.jsonc` (read by `loadGlobal`)
3. `OPENCODE_CONFIG` flag file (env override, kept for compatibility)
4. **Project files** — `tartarus.json` / `tartarus.jsonc`, found by walking up from the cwd to the worktree root
5. **Per-directory `.tartarus/` dirs** — global, project-level, and `OPENCODE_CONFIG_DIR`; each contributes `tartarus.json(c)` plus `agents/`, `commands/`, `modes/`, and plugins
6. `OPENCODE_CONFIG_CONTENT` env var (inline config)

> The global dir reads `tartarus.json` / `tartarus.jsonc` (not `opencode.json`). This was fixed so the read path matches the write path — `tartarus config set` and friends write `tartarus.jsonc`.

The primary user config file is therefore:

```
~/.config/tartarus/tartarus.json
```

---

## Minimal working config

The seeded pantheon agents already carry their own model bindings in frontmatter, so a minimal `tartarus.json` only needs a default agent and a global default model:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "alibaba-token-plan/qwen3.8-max-preview",
  "default_agent": "g0dm0d3"
}
```

- `model` — the global default model (`provider/model`). Used by agents that don't declare one (e.g. `parseltongue`) and as the fallback.
- `default_agent` — the primary agent used when none is specified. Must be a `primary`-mode agent. **Required** for TARTARUS, because the upstream fallback (`build`) is not the intended default here.

---

## Model IDs

A model is referenced as `providerID/modelID`:

```
alibaba-token-plan/qwen3.8-max-preview
└──────┬────────┘ └────────┬─────────┘
  providerID           modelID
```

`Provider.parseModel` splits on the first `/`. The provider must be known — either built into the bundled models database (`models-snapshot.js`) or declared in config (below).

---

## Declaring a provider

Providers that aren't in the bundled database are declared under the `provider` key. This extends the models database at load time:

```json
{
  "provider": {
    "my-gateway": {
      "name": "My Gateway",
      "npm": "@ai-sdk/openai-compatible",
      "env": ["MY_GATEWAY_API_KEY"],
      "options": { "baseURL": "https://gateway.example.com/v1" },
      "models": {
        "my-model": {
          "name": "My Model",
          "tool_call": true,
          "limit": { "context": 131072, "output": 16384 }
        }
      }
    }
  }
}
```

Field notes:

- `npm` — the AI SDK adapter. Defaults to `@ai-sdk/openai-compatible` if omitted, so OpenAI-compatible gateways need no adapter specified.
- `env` — env var name(s) scanned for the API key.
- `options.baseURL` — the API endpoint. Supports `{env:VAR}` substitution. Wins over `api`.
- `models.<id>` — per-model metadata. All sub-fields are optional (`Model` is a partial schema); `limit.context`/`limit.output` are recommended so context accounting is correct.

> `alibaba-token-plan` (used by the pantheon) is already present in the bundled `models-snapshot.js`, so it needs **no** `provider` block — only an auth entry (below).

---

## Authentication

Provider credentials live in the data dir, separate from stock opencode:

```
~/.local/share/tartarus/auth.json
```

API-key resolution order for a provider:

1. `options.apiKey` in config (highest priority)
2. An env var listed in the provider's `env` array
3. The `auth.json` entry for that provider

To authenticate interactively:

```bash
tartarus auth login <provider>      # or: tartarus providers
tartarus auth list                  # show configured providers
```

The seeded setup copies the `alibaba-token-plan` (and `zai-coding-plan`) entries into `auth.json` so the pantheon's model resolves out of the box.

---

## Agent model binding

Agents are `.md` files in `~/.config/tartarus/agents/` (seeded from `src/seed/agents/`). Their YAML frontmatter is config and is validated against the Agent schema:

```markdown
---
name: g0dm0d3
description: G0DM0D3 — the GodMode agent…
mode: primary
model: alibaba-token-plan/qwen3.8-max-preview
---

# Identity
You are G0DM0D3 …
```

Relevant frontmatter fields:

- `model` — `providerID/modelID` for this agent.
- `mode` — `primary` (top-level), `subagent` (delegated), or `all`.
- `description` — when to use the agent (drives delegation).
- `temperature`, `top_p`, `steps`, `permission`, `options` — standard agent tuning.

**Precedence:** agent `.md` frontmatter is merged *after* JSON config, so for overlapping keys the frontmatter wins. To change an agent's model centrally you can either edit its `.md`, or add an `agent` block in `tartarus.json` (frontmatter still overrides for fields it sets):

```json
{
  "agent": {
    "g0dm0d3": { "mode": "primary", "model": "alibaba-token-plan/qwen3.8-max-preview" },
    "typhon":  { "mode": "subagent", "model": "alibaba-token-plan/qwen3.8-max-preview" }
  }
}
```

At prompt time the model resolves as: `input.model ?? agent.model ?? lastModel(session)`.

---

## TUI config

TUI-specific settings (theme, keybinds) live in `tui.json`, loaded from the same dirs (global `~/.config/tartarus/tui.json`, project `.tartarus/tui.json`):

```json
{
  "$schema": "https://opencode.ai/tui.json",
  "theme": "tartarus"
}
```

See `THEMING.md` for the theme system.

---

## Inspecting effective config

```bash
tartarus debug config          # show the fully-merged resolved config
tartarus debug agent g0dm0d3   # show a single agent's resolved config + model
tartarus debug paths           # show the global data/config/cache/state dirs
```
