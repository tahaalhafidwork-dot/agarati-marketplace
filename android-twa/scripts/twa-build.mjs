/**
 * Loads .env.twa.local then runs `bubblewrap build` non-interactively.
 */
import { createHash } from "node:crypto"
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const twaRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const envFile = join(twaRoot, ".env.twa.local")
const manifestPath = join(twaRoot, "twa-manifest.json")
const checksumPath = join(twaRoot, "manifest-checksum.txt")

if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!(key in process.env)) process.env[key] = val
  }
}

if (!process.env.BUBBLEWRAP_KEYSTORE_PASSWORD || !process.env.BUBBLEWRAP_KEY_PASSWORD) {
  console.error(
    "[twa:build] Set BUBBLEWRAP_KEYSTORE_PASSWORD and BUBBLEWRAP_KEY_PASSWORD (or create .env.twa.local)."
  )
  process.exit(1)
}

if (!existsSync(manifestPath) || !existsSync(join(twaRoot, "app"))) {
  console.error("[twa:build] Missing project — run npm run twa:generate first.")
  process.exit(1)
}

// Bubblewrap uses sha1 of file bytes — keep checksum in sync to skip interactive prompts.
const checksum = createHash("sha1").update(readFileSync(manifestPath)).digest("hex")
writeFileSync(checksumPath, checksum, "utf8")
console.log(`[twa:build] checksum=${checksum}`)

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["bubblewrap", "build", "--skipPwaValidation"],
  { cwd: twaRoot, stdio: "inherit", shell: true, env: process.env }
)

process.exit(result.status ?? 1)
