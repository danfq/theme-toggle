import * as React from "react"

import { THEME_SCRIPT } from "./core"

/**
 * head script that applies the theme before first paint
 *
 * render it once inside the document head, above the app, to avoid a flash
 * of the wrong theme. server safe
 */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
}
