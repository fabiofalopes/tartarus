# TARTARUS — Theming & Visual Identity

How TARTARUS looks, how the theme system works, and how to customize the logo and colors.

---

## Key fact: the theme layer is opencode code, not OpenTUI

OpenTUI (`@opentui/core` / `@opentui/solid`) is a low-level terminal renderer. It has **no theme registry and no design tokens** — colors are passed per-component as `fg`/`bg`/`backgroundColor` props. What it does provide:

- `RGBA` color type (`fromHex`, `fromInts`, …) and `parseColor` (hex, CSS names, `"transparent"`)
- `TextAttributes` bitmask (`BOLD`, `DIM`, `UNDERLINE`, …)
- terminal dark/light detection, palette detection, background control
- `SyntaxStyle` for tree-sitter code highlighting

The entire theme system you see — named themes, dark/light variants, semantic tokens — is **opencode's own layer** built on top of OpenTUI, in `src/cli/cmd/tui/context/theme.tsx` plus JSON theme files. That means rebranding is done entirely in opencode code; no framework patching is needed.

---

## Theme JSON format

A theme is a JSON file with an optional `defs` palette and a `theme` block of semantic tokens. Tokens can be:

- a hex color: `"#e5484d"`
- an ANSI index: `3` (0–255)
- a reference to a `defs` entry: `"darkStep9"`
- dark/light variants: `{ "dark": "…", "light": "…" }`
- `"none"` — inherit the terminal default

```json
{
  "$schema": "https://opencode.ai/theme.json",
  "defs": {
    "darkStep9": "#e5484d",
    "darkAccent": "#e0a458"
  },
  "theme": {
    "primary":  { "dark": "darkStep9",  "light": "#c93038" },
    "accent":   { "dark": "darkAccent", "light": "#b07d2a" },
    "background": { "dark": "#0b0808",  "light": "#ffffff" },
    "text":     { "dark": "#f2ecec",    "light": "#1c1414" }
  }
}
```

Semantic token groups: **core** (`primary`, `secondary`, `accent`, `error`, `warning`, `success`, `info`, `text`, `textMuted`, `background`, `backgroundPanel`, `backgroundElement`, `border`, `borderActive`, `borderSubtle`), **diff** (`diffAdded`, `diffRemoved`, `diffContext`, `diffHunkHeader`, `diffHighlight*`, `diff*Bg`, `diffLineNumber`, …), **markdown** (`markdownHeading`, `markdownLink`, `markdownCode`, …), and **syntax** (`syntaxComment`, `syntaxKeyword`, `syntaxFunction`, `syntaxVariable`, `syntaxString`, `syntaxNumber`, `syntaxType`, `syntaxOperator`, `syntaxPunctuation`).

`resolveTheme()` resolves refs/variants to `RGBA` per mode; the terminal background is set from `theme.background`, and a `SyntaxStyle` is generated from the tokens for code blocks and diffs.

---

## Where themes load from (precedence, later wins)

1. **Built-in themes** — embedded in the binary (`DEFAULT_THEMES` in `theme.tsx`)
2. **User config dir** — `~/.config/tartarus/themes/*.json`
3. **Project dir** — `<project>/.tartarus/themes/*.json`
4. **cwd** — `./.tartarus/themes/*.json`

A same-named theme in a higher-priority dir overrides a lower one. This is the easiest way to override the built-in `tartarus` theme without rebuilding: drop a `tartarus.json` in `~/.config/tartarus/themes/`.

> The project-dir scan was fixed to look for `.tartarus/` (upstream scanned `.opencode/`).

Select a theme with `/theme` (or `Ctrl+X T`), or set it in `tui.json`:

```json
{ "theme": "tartarus" }
```

---

## The TARTARUS theme

`src/cli/cmd/tui/context/theme/tartarus.json` is registered in `DEFAULT_THEMES` and set as the **default active theme** (`active: "tartarus"`, plus the KV/error fallbacks in `theme.tsx`).

**Concept — "Blood & Ember."** Tartarus is the fiery abyss; the palette is crimson (blood) + ember-gold (hellfire) on a warm-tinted near-black background, deliberately distinct from opencode's orange+purple.

| Token        | Dark       | Light      | Role                       |
|--------------|------------|------------|----------------------------|
| `primary`    | `#e5484d`  | `#c93038`  | crimson — brand, functions |
| `accent`     | `#e0a458`  | `#b07d2a`  | ember-gold — keywords      |
| `secondary`  | `#6b8afd`  | `#4a63c9`  | cold steel blue            |
| `background` | `#0b0808`  | `#ffffff`  | warm near-black            |
| `text`       | `#f2ecec`  | `#1c1414`  | warm off-white             |
| `textMuted`  | `#8f7f7f`  | `#8a7d7d`  | warm gray                  |

The background steps (`darkStep1`–`darkStep8`) are warm-tinted grays (a faint red cast) rather than neutral, to reinforce the abyss feel. The functional colors (`error`/`warning`/`success`/`info` and the diff/syntax sets) stay vivid and distinguishable for readability.

---

## The logo

### TUI home logo

`src/cli/cmd/tui/component/logo.tsx` renders the wordmark with OpenTUI's **`ASCIIFont`** renderable (documented in OpenTUI's `components/ascii-font` docs) rather than hand-drawn glyphs:

```tsx
import { useTheme, tint } from "@tui/context/theme"

export function Logo() {
  const { theme } = useTheme()
  const edge = tint(theme.background, theme.primary, 0.3)
  return <ascii_font text="TARTARUS" font="block" color={[theme.primary, edge]} selectable={false} />
}
```

- `font: "block"` — a heavy, 3D box-drawn font (one of OpenTUI's built-ins: `tiny`, `block`, `shade`, `slick`, `huge`, `grid`, `pallet`). It reads as carved stone — fitting for the prison of the monsters.
- `color={[face, edge]}` — the `block` font is two-tone (`c1` face + `c2` 3D edge). Passing two colors maps face → `theme.primary` (crimson) and edge → a darker `tint(...)` for depth.

To change the logo: swap `text`, pick another `font`, or change the two colors. `ascii_font` is a registered JSX element in `@opentui/solid` at the pinned version.

### CLI banner / non-TTY wordmark

`src/cli/logo.ts` exports a plain block wordmark (`wordmark` array) that `src/cli/ui.ts` renders for CLI banners and piped output, colored with the crimson truecolor `#e5484d`. This is independent of the TUI logo but visually matches it.

---

## Customizing

**Change the palette without rebuilding:** create `~/.config/tartarus/themes/tartarus.json` overriding the tokens you care about (it shadows the built-in by name).

**Add a new theme:** drop `my-theme.json` in `~/.config/tartarus/themes/` and select it with `/theme`.

**Rebuild-in a new default theme:** add the JSON under `src/cli/cmd/tui/context/theme/`, import it in `theme.tsx`, add it to `DEFAULT_THEMES`, and set `active:` to its name.

**Truecolor requirement:** themes need 24-bit color to render correctly. Check `echo $COLORTERM` (should be `truecolor`/`24bit`); otherwise colors fall back to the nearest 256-color approximation.

**Crash screen:** `error-component.tsx` uses hardcoded fallback colors (theme context may be unavailable during a crash). These were re-tinted to the tartarus palette; update them there if you change the brand colors.
