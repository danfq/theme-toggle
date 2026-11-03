# @danfq/theme-toggle

A tiny, SSR-safe light / dark / system theme toggle for React.

- **Zero runtime dependencies.** The icons (lucide sun, moon, monitor) are inlined and the toggle styles itself, so there is no stylesheet to import.
- **No flash.** A small head script resolves the theme before first paint.
- **SSR and view-transition friendly.** Built on `useSyncExternalStore`, it stays in sync across tabs, OS changes, and Astro view transitions.
- **Framework-agnostic core.** The server-safe core lives at `@danfq/theme-toggle`; the React pieces at `@danfq/theme-toggle/react`. Use the React bindings, or wire the plain functions into anything.

## How it works

The preference (`light`, `dark`, or `system`) is stored in `localStorage`. On every change the library updates the `<html>` element:

- toggles the `light` / `dark` class
- sets `data-theme` and `data-theme-preference`
- sets `color-scheme`

Your CSS drives the actual colors off `.dark` (or `[data-theme="dark"]`), exactly like Tailwind's dark mode.

## Install

```bash
npm install @danfq/theme-toggle
```

`react` and `react-dom` (v18 or v19) are peer dependencies.

## Usage

### 1. Add the head script

Render the script once, as high in the document as possible, so the theme is applied before the page paints.

**React / Next.js**

```tsx
import { ThemeScript } from "@danfq/theme-toggle"

export default function Document() {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
      </head>
      <body>{/* ... */}</body>
    </html>
  )
}
```

**Astro** (or anywhere you only have the string)

```astro
---
import { THEME_SCRIPT } from "@danfq/theme-toggle"
---

<script is:inline set:html={THEME_SCRIPT} />
```

### 2. Drop in the toggle

The React bindings live under the `/react` subpath (they carry the `"use client"` boundary, so the head script above stays server-safe).

```tsx
import { ThemeToggle } from "@danfq/theme-toggle/react"

export function Header() {
  return <ThemeToggle />
}
```

In Astro, hydrate it like any React island:

```astro
<ThemeToggle client:load />
```

### 3. Or build your own, using the hook

```tsx
import { useTheme } from "@danfq/theme-toggle/react"

export function ThemePicker() {
  const { preference, theme, setTheme } = useTheme()

  return (
    <select value={preference} onChange={(e) => setTheme(e.target.value as any)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  )
}
```

## API

Two entry points: `@danfq/theme-toggle` (server-safe core and the head script) and `@danfq/theme-toggle/react` (the client hooks and toggle).

### Components

| Export | Entry | Description |
| --- | --- | --- |
| `ThemeToggle` | `/react` | Styled icon button that cycles light to dark to system. |
| `ThemeScript` | main | Renders the no-flash head `<script>`. |

#### `ThemeToggle` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `number` | `36` | Button and icon size in px. |
| `label` | `string` | `"Switch theme"` | Accessible label. |
| `icons` | `Partial<Record<ThemePreference, ReactNode>>` | lucide icons | Override the icon per preference. |

All other `<button>` attributes (`className`, `style`, `disabled`, ...) are forwarded. A `className` is merged, so you can restyle it with Tailwind or your own CSS.

### Hook

`useTheme()` (from `@danfq/theme-toggle/react`) returns:

| Field | Type | Description |
| --- | --- | --- |
| `preference` | `ThemePreference` | Stored preference (`light` \| `dark` \| `system`). |
| `theme` | `EffectiveTheme` | Resolved theme (`light` \| `dark`). |
| `mounted` | `boolean` | `false` until after hydration. |
| `setTheme` | `(p: ThemePreference) => void` | Set a specific preference. |
| `cycle` | `() => void` | Advance light to dark to system. |

### Core functions

From the main entry, for non-React usage or custom wiring: `getThemePreference`, `applyTheme`, `getEffectiveTheme`, `resolveSystemTheme`, `getNextTheme`, `syncDocument`, `subscribe`, `initTheme`, plus the `THEME_SCRIPT`, `STORAGE_KEY`, and `THEME_CHANGE_EVENT` constants.

## License

MIT
