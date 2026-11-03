import * as React from "react"

import { applyTheme, getEffectiveTheme, getNextTheme, getThemePreference, initTheme, subscribe, type EffectiveTheme, type ThemePreference } from "./core"

/** value returned by {@link useTheme} */
export interface UseThemeResult {
  /** raw stored preference */
  preference: ThemePreference
  /** resolved theme actually applied */
  theme: EffectiveTheme
  /** false until after hydration, use it to gate client-only rendering */
  mounted: boolean
  /** set a specific preference */
  setTheme: (preference: ThemePreference) => void
  /** advance through light to dark to system */
  cycle: () => void
}

function serverPreference(): ThemePreference {
  return "system"
}

/**
 * read and control the theme from react
 *
 * stays in sync with other tabs, os changes and astro view transitions via
 * `useSyncExternalStore`, so it is safe for ssr and concurrent rendering
 */
export function useTheme(): UseThemeResult {
  const preference = React.useSyncExternalStore(subscribe, getThemePreference, serverPreference)

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    initTheme()
    setMounted(true)
  }, [])

  const setTheme = React.useCallback((next: ThemePreference) => {
    applyTheme(next)
  }, [])

  const cycle = React.useCallback(() => {
    applyTheme(getNextTheme(getThemePreference()))
  }, [])

  return {
    preference,
    theme: getEffectiveTheme(preference),
    mounted,
    setTheme,
    cycle,
  }
}
