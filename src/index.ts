// public api, server-safe core
//
// the react bindings (useTheme, ThemeToggle) live in "@danfq/theme-toggle/react"
// so this entry stays free of any client-only code

export {
  STORAGE_KEY,
  THEME_CHANGE_EVENT,
  THEME_SCRIPT,
  applyTheme,
  getEffectiveTheme,
  getNextTheme,
  getThemePreference,
  initTheme,
  resolveSystemTheme,
  subscribe,
  syncDocument,
  type EffectiveTheme,
  type ThemePreference,
} from "./core"

export { ThemeScript } from "./theme-script"
