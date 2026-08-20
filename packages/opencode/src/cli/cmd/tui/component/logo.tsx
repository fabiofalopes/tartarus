import { useTheme, tint } from "@tui/context/theme"

export function Logo() {
  const { theme } = useTheme()
  const edge = tint(theme.background, theme.primary, 0.3)
  return <ascii_font text="TARTARUS" font="block" color={[theme.primary, edge]} selectable={false} />
}
