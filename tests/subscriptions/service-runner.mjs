import path from "node:path"
import { spawnSync } from "node:child_process"
import { createRequire } from "node:module"

const resolveFromProject = createRequire(import.meta.url)
const compiledPackage = resolveFromProject.resolve(
  "next/dist/compiled/server-only/package.json"
)
const compiledRoot = path.dirname(path.dirname(compiledPackage))
const env = {
  ...process.env,
  NODE_PATH: [compiledRoot, process.env.NODE_PATH].filter(Boolean).join(path.delimiter),
  NODE_OPTIONS: [process.env.NODE_OPTIONS, "--conditions=react-server"]
    .filter(Boolean)
    .join(" "),
}
const command = process.platform === "win32" ? "npx.cmd" : "npx"
const result = spawnSync(
  command,
  ["--yes", "tsx", "tests/subscriptions/services.ts"],
  {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  }
)
if (result.error) console.error(result.error)
process.exit(result.status ?? 1)
