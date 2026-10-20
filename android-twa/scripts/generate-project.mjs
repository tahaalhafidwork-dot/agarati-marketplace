/**
 * Non-interactive TWA Android project generation using @bubblewrap/core.
 * Serves local PWA icons over HTTP so Bubblewrap can fetch them.
 *
 * Host (Digital Asset Links domain) comes from TWA_HOST_URL or defaults to a
 * placeholder that must be replaced before Play production.
 *
 * Usage:
 *   node ./scripts/generate-project.mjs
 *   $env:TWA_HOST_URL="https://your-domain.com"; node ./scripts/generate-project.mjs
 */
import http from "node:http"
import { createHash } from "node:crypto"
import { createReadStream, existsSync, promises as fs } from "node:fs"
import { dirname, extname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { pathToFileURL } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const twaRoot = join(__dirname, "..")
const repoRoot = join(twaRoot, "..")
const publicDir = join(repoRoot, "public")

const core = await import(
  pathToFileURL(join(twaRoot, "node_modules/@bubblewrap/core/dist/index.js")).href
)

const {
  ConsoleLog,
  TwaGenerator,
  TwaManifest,
} = core

function contentType(filePath) {
  switch (extname(filePath).toLowerCase()) {
    case ".png":
      return "image/png"
    case ".webmanifest":
    case ".json":
      return "application/manifest+json"
    case ".js":
      return "application/javascript"
    default:
      return "application/octet-stream"
  }
}

function startStaticServer(root) {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || "/").split("?")[0])
        const safe = urlPath.replace(/\.\./g, "")
        const filePath = join(root, safe === "/" ? "icons/icon-512.png" : safe)
        if (!existsSync(filePath)) {
          res.writeHead(404)
          res.end("not found")
          return
        }
        res.writeHead(200, { "Content-Type": contentType(filePath) })
        createReadStream(filePath).pipe(res)
      } catch {
        res.writeHead(500)
        res.end("error")
      }
    })
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address()
      resolve({ server, port })
    })
  })
}

const hostEnv = (process.env.TWA_HOST_URL || "").replace(/\/$/, "")
const host = hostEnv
  ? new URL(hostEnv).host
  : process.env.TWA_HOST || "agarati.example"
const packageId = process.env.TWA_PACKAGE_NAME || "com.agarati.app"
const isPlaceholder = !hostEnv

if (isPlaceholder) {
  console.warn(
    "[generate] WARNING: placeholder host. Re-run with TWA_HOST_URL=https://… before Play production."
  )
}

const keystorePath = join(twaRoot, "android.keystore")
if (!existsSync(keystorePath)) {
  console.error("[generate] Missing android.keystore — run keytool first (see docs/ANDROID_TWA.md).")
  process.exit(1)
}

const { server, port } = await startStaticServer(publicDir)
const iconBase = `http://127.0.0.1:${port}`
const iconUrl = `${iconBase}/icons/icon-512.png`

console.log(`[generate] Serving icons at ${iconBase}`)
console.log(`[generate] TWA host=${host} package=${packageId}`)

const manifestJson = {
  packageId,
  host,
  name: "أغاراتي",
  launcherName: "أغاراتي",
  display: "standalone",
  themeColor: "#0F2744",
  themeColorDark: "#0F2744",
  navigationColor: "#0F2744",
  navigationColorDark: "#0F2744",
  navigationDividerColor: "#0F2744",
  navigationDividerColorDark: "#0F2744",
  backgroundColor: "#0F2744",
  enableNotifications: true,
  startUrl: "/",
  iconUrl,
  maskableIconUrl: iconUrl,
  splashScreenFadeOutDuration: 300,
  signingKey: {
    path: "./android.keystore",
    alias: "android",
  },
  // Bubblewrap TwaManifest maps JSON `appVersion` → gradle versionName
  appVersion: process.env.TWA_APP_VERSION || "1.0.0",
  appVersionCode: Number(process.env.TWA_APP_VERSION_CODE || 1) || 1,
  shortcuts: [],
  generatorApp: "agarati-generate-project",
  // Omit webManifestUrl so generation does not fetch a remote HTTPS origin.
  fallbackType: "customtabs",
  features: {},
  alphaDependencies: { enabled: false },
  enableSiteSettingsShortcut: true,
  isChromeOSOnly: false,
  isMetaQuest: false,
  fullScopeUrl: hostEnv ? `${hostEnv}/` : `https://${host}/`,
  minSdkVersion: 21,
  orientation: "portrait",
  fingerprints: [],
  additionalTrustedOrigins: [],
  retainedBundles: [],
  protocolHandlers: [],
  fileHandlers: [],
  launchHandlerClientMode: "auto",
}

const twaManifest = new TwaManifest(manifestJson)
const validationError = twaManifest.validate()
if (validationError) {
  server.close()
  console.error("[generate] Invalid TwaManifest:", validationError)
  process.exit(1)
}

const log = new ConsoleLog("generate")
const generator = new TwaGenerator()

console.log("[generate] Creating Android project in", twaRoot)
await generator.createTwaProject(twaRoot, twaManifest, log)

await twaManifest.saveToFile(join(twaRoot, "twa-manifest.json"))

// After saveToFile, rewrite stable production icon / manifest URLs (not ephemeral local server).
const saved = JSON.parse(await fs.readFile(join(twaRoot, "twa-manifest.json"), "utf8"))
saved.iconUrl = hostEnv
  ? `${hostEnv}/icons/icon-512.png`
  : `https://${host}/icons/icon-512.png`
saved.maskableIconUrl = saved.iconUrl
saved.webManifestUrl = hostEnv
  ? `${hostEnv}/manifest.webmanifest`
  : `https://${host}/manifest.webmanifest`
await fs.writeFile(
  join(twaRoot, "twa-manifest.json"),
  JSON.stringify(saved, null, 2) + "\n",
  "utf8"
)

const checksum = createHash("sha1")
  .update(await fs.readFile(join(twaRoot, "twa-manifest.json")))
  .digest("hex")
await fs.writeFile(join(twaRoot, "manifest-checksum.txt"), checksum, "utf8")

server.close()
console.log("[generate] Done. Next: npm run twa:build")
