import * as React from "react"

import { type ThemePreference } from "./core"
import { useTheme } from "./use-theme"

const STYLE_ID = "danfq-theme-toggle-style"
const CLASS_NAME = "danfq-theme-toggle"

/** self-contained styles so the package ships zero required css */
const STYLE_CONTENT = `
.${CLASS_NAME}{display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;background:transparent;border-radius:10px;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background-color .15s ease,color .15s ease}
.${CLASS_NAME}:hover{background:var(--tt-hover)}
.${CLASS_NAME}:focus-visible{outline:none;box-shadow:0 0 0 2px var(--tt-ring)}
.${CLASS_NAME}:disabled{cursor:default;opacity:.5}
.${CLASS_NAME} svg{display:block}
`

/** inject the toggle styles once per document */
function useToggleStyles(): void {
  React.useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) {
      return
    }
    const el = document.createElement("style")
    el.id = STYLE_ID
    el.textContent = STYLE_CONTENT
    document.head.appendChild(el)
  }, [])
}

interface IconProps {
  size: number
}

/** shared svg wrapper matching lucide defaults */
function Icon({ size, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      {children}
    </svg>
  )
}

// icons below are the lucide sun, moon and monitor glyphs, inlined so the
// package stays dependency free (lucide, isc license)

function SunIcon({ size }: IconProps) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </Icon>
  )
}

function MoonIcon({ size }: IconProps) {
  return (
    <Icon size={size}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Icon>
  )
}

function MonitorIcon({ size }: IconProps) {
  return (
    <Icon size={size}>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </Icon>
  )
}

/** props for {@link ThemeToggle} */
export interface ThemeToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  /** button and icon size in px, defaults to 36 */
  size?: number
  /** accessible label, defaults to "Switch theme" */
  label?: string
  /** override the icon shown for any preference */
  icons?: Partial<Record<ThemePreference, React.ReactNode>>
}

/**
 * icon button that cycles light to dark to system
 *
 * shows the icon for the current preference and is safe to render during ssr.
 * styles itself, so no stylesheet import is needed. pair it with the head
 * script (`THEME_SCRIPT` or `ThemeScript`) to avoid a flash on first paint
 */
export function ThemeToggle({ size = 36, label = "Switch theme", icons, className, style, ...rest }: ThemeToggleProps) {
  const { preference, theme, mounted, cycle } = useTheme()

  useToggleStyles()

  // before hydration render the neutral system icon so markup matches the
  // server, then swap to the real preference once mounted
  const shown = mounted ? preference : "system"
  const iconSize = Math.round(size * 0.55)

  const defaultIcon: Record<ThemePreference, React.ReactNode> = {
    light: <SunIcon size={iconSize} />,
    dark: <MoonIcon size={iconSize} />,
    system: <MonitorIcon size={iconSize} />,
  }

  const tokens =
    theme === "dark"
      ? { "--tt-hover": "rgba(255,255,255,.1)", "--tt-ring": "rgba(255,255,255,.4)" }
      : { "--tt-hover": "rgba(0,0,0,.06)", "--tt-ring": "rgba(0,0,0,.25)" }

  return (
    <button
      type="button"
      className={className ? `${CLASS_NAME} ${className}` : CLASS_NAME}
      style={{ width: size, height: size, ...(tokens as React.CSSProperties), ...style }}
      onClick={cycle}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      {...rest}>
      {icons?.[shown] ?? defaultIcon[shown]}
    </button>
  )
}
