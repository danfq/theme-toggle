import { readFile, writeFile } from "node:fs/promises"

import { defineConfig, type Options } from "tsup"

const shared: Options = {
  format: ["esm", "cjs"],
  dts: true,
  treeshake: true,
  // keep each entry self-contained, no shared chunks, so the directive we add
  // to the react entry below covers all of its client code
  splitting: false,
  external: ["react", "react-dom"],
}

/**
 * prepend the "use client" boundary to the react outputs
 *
 * esbuild strips module-level directives when bundling, so we add it back
 * after the build for react server component consumers
 */
async function addUseClient() {
  for (const file of ["dist/react.js", "dist/react.cjs"]) {
    const source = await readFile(file, "utf8")
    if (!source.startsWith('"use client"')) {
      await writeFile(file, `"use client"\n${source}`)
    }
  }
}

export default defineConfig([
  // server-safe core entry
  { ...shared, entry: { index: "src/index.ts" }, clean: true },
  // client entry
  { ...shared, entry: { react: "src/react.ts" }, clean: false, onSuccess: addUseClient },
])
