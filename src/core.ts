/**
 * framework-agnostic theme core
 *
 * handles the stored preference, resolving the effective theme and
 * syncing it onto the document. no react, no dom assumptions beyond
 * guarded access so it is safe to import on the server
 */

/** user preference, system follows the os setting */
export type ThemePreference = "light" | "dark" | "system"

/** resolved theme actually applied to the document */
export type EffectiveTheme = "light" | "dark"

/** localStorage key holding the preference */
export const STORAGE_KEY = "theme"

/** window event dispatched whenever the preference changes */
export const THEME_CHANGE_EVENT = "danfq:theme-change"

const PREFERENCES: readonly ThemePreference[] = ["light", "dark", "system"]

function isPreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && (PREFERENCES as readonly string[]).includes(value)
}

/**
 * read the stored preference
 *
 * @returns the saved preference or "system" when missing or on the server
 */
export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system"
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)?.trim()
    if (isPreference(raw)) {
      return raw
    }
  } catch {
    // storage can throw in private mode, fall through to default
  }

  return "system"
}

/**
 * resolve what the os currently prefers
 *
 * @returns "dark" when the os asks for dark, otherwise "light"
 */
export function resolveSystemTheme(): EffectiveTheme {
  if (typeof window === "undefined") {
    return "light"
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/**
 * resolve a preference to the theme that should be applied
 *
 * @param preference the preference to resolve
 */
export function getEffectiveTheme(preference: ThemePreference): EffectiveTheme {
  return preference === "system" ? resolveSystemTheme() : preference
}

/**
 * next preference in the light to dark to system cycle
 *
 * @param current the current preference
 */
export function getNextTheme(current: ThemePreference): ThemePreference {
  if (current === "light") {
    return "dark"
  }
  if (current === "dark") {
    return "system"
  }
  return "light"
}

/**
 * apply a preference onto the document element
 *
 * sets the class, data attributes and color-scheme so css variables and
 * native controls follow along. does not persist anything
 *
 * @param preference the preference to render
 */
export function syncDocument(preference: ThemePreference): void {
  if (typeof document === "undefined") {
    return
  }

  const effective = getEffectiveTheme(preference)
  const root = document.documentElement

  root.classList.remove("light", "dark")
  root.classList.add(effective)
  root.setAttribute("data-theme", effective)
  root.setAttribute("data-theme-preference", preference)
  root.style.colorScheme = effective
}

/**
 * persist a preference, sync the document and notify subscribers
 *
 * @param preference the preference to set
 */
export function applyTheme(preference: ThemePreference): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // ignore storage failures, still apply for this session
  }

  syncDocument(preference)
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
}

/**
 * subscribe to preference changes from any tab or source
 *
 * reacts to storage writes, in-page changes and astro view transitions
 *
 * @param onChange called whenever the preference may have changed
 * @returns an unsubscribe function
 */
export function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {}
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onChange()
    }
  }

  window.addEventListener("storage", onStorage)
  window.addEventListener(THEME_CHANGE_EVENT, onChange)
  document.addEventListener("astro:after-swap", onChange)

  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(THEME_CHANGE_EVENT, onChange)
    document.removeEventListener("astro:after-swap", onChange)
  }
}

let systemListenerAttached = false

/**
 * sync the document from storage and start tracking os changes
 *
 * keeps the document in step with the os while the preference is "system".
 * safe to call repeatedly, the os listener is attached only once
 */
export function initTheme(): void {
  if (typeof window === "undefined") {
    return
  }

  syncDocument(getThemePreference())

  if (systemListenerAttached) {
    return
  }
  systemListenerAttached = true

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (getThemePreference() !== "system") {
      return
    }
    syncDocument("system")
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  })
}

/**
 * inline script to drop in the document head before first paint
 *
 * resolves and applies the theme synchronously so there is no flash of the
 * wrong theme. render it with astro `set:html`, next `dangerouslySetInnerHTML`
 * or the exported `ThemeScript` component
 */
export const THEME_SCRIPT = `(()=>{try{var k="${STORAGE_KEY}";var r=(localStorage.getItem(k)||"").trim();var p=r==="light"||r==="dark"||r==="system"?r:"system";var e=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";var d=document.documentElement;d.classList.remove("light","dark");d.classList.add(e);d.setAttribute("data-theme",e);d.setAttribute("data-theme-preference",p);d.style.colorScheme=e}catch(_){}})()`
