/**
 * Print SHA-256 fingerprint of the TWA upload keystore (for assetlinks.json).
 * Usage: node ./scripts/print-fingerprint.mjs [path-to-keystore] [alias]
 */
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const keystore = process.argv[2] || join(root, "android.keystore")
const alias = process.argv[3] || "android"

if (!existsSync(keystore)) {
  console.error(`[fingerprint] Keystore not found: ${keystore}`)
  console.error("Run npm run twa:init first (or pass the keystore path).")
  process.exit(1)
}

const result = spawnSync(
  "keytool",
  [
    "-list",
    "-v",
    "-keystore",
    keystore,
    "-alias",
    alias,
  ],
  { encoding: "utf8", shell: true }
)

const out = `${result.stdout || ""}\n${result.stderr || ""}`
const match = out.match(/SHA256:\s*([0-9A-F:]+)/i)
if (!match) {
  console.error(out)
  console.error("[fingerprint] Could not parse SHA256 (keytool may prompt for password).")
  process.exit(1)
}

console.log(match[1])
console.log("\nAdd to web env:")
console.log(`TWA_PACKAGE_NAME=com.agarati.app`)
console.log(`TWA_SHA256_CERT_FINGERPRINTS=${match[1]}`)
