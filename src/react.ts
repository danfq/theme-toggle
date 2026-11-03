// client react bindings
//
// the "use client" boundary is injected at build time (see tsup.config.ts)
// so the hooks and toggle can be imported straight into a react server
// component tree

export { useTheme, type UseThemeResult } from "./use-theme"
export { ThemeToggle, type ThemeToggleProps } from "./theme-toggle"
export { type EffectiveTheme, type ThemePreference } from "./core"
