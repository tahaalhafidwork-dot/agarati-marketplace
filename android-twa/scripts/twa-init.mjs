/**
 * Non-interactive Bubblewrap init helper.
 *
 * Requires TWA_HOST_URL (HTTPS production origin that already serves the PWA manifest).
 * Example: $env:TWA_HOST_URL="https://agarati.com"; npm run twa:init
 */
import { spawnSync } from "node:child_process"
import { existsSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(fileURLToPath(import.meta.url))
const twaRoot = join(root, "..")
const host = (process.env.TWA_HOST_URL || "").replace(/\/$/, "")

if (!host || !/^https:\/\//i.test(host)) {
  console.error(
    "[twa:init] Set TWA_HOST_URL to your HTTPS production origin, e.g.\n" +
      '  $env:TWA_HOST_URL="https://your-domain.com"; npm run twa:init'
  )
  process.exit(1)
}

const manifestUrl = `${host}/manifest.webmanifest`
const packageId = process.env.TWA_PACKAGE_NAME || "com.agarati.app"
const name = process.env.TWA_APP_NAME || "أغاراتي"
const launcherName = process.env.TWA_LAUNCHER_NAME || "أغاراتي"

const twaManifestPath = join(twaRoot, "twa-manifest.json")

/** Seed Bubblewrap inputs; `bubblewrap init` still validates the live manifest. */
const seed = {
  packageId,
  host: new URL(host).host,
  name,
  launcherName,
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
  iconUrl: `${host}/icons/icon-512.png`,
  maskableIconUrl: `${host}/icons/icon-512.png`,
  splashScreenFadeOutDuration: 300,
  signingKey: {
    path: "./android.keystore",
    alias: "android",
  },
  appVersionName: "1",
  appVersionCode: 1,
  shortcuts: [],
  generatorApp: "bubblewrap-cli",
  webManifestUrl: manifestUrl,
  fallbackType: "customtabs",
  features: {},
  alphaDependencies: {
    enabled: false,
  },
  enableSiteSettingsShortcut: true,
  isChromeOSOnly: false,
  isMetaQuest: false,
  fullScopeUrl: `${host}/`,
  minSdkVersion: 21,
  orientation: "portrait",
  fingerprints: [],
  additionalTrustedOrigins: [],
  retainedBundles: [],
  protocolHandlers: [],
  fileHandlers: [],
  launchHandlerClientMode: "auto",
}

if (!existsSync(twaManifestPath)) {
  writeFileSync(twaManifestPath, JSON.stringify(seed, null, 2) + "\n")
  console.log(`[twa:init] Wrote seed ${twaManifestPath}`)
}

console.log(`[twa:init] Manifest URL: ${manifestUrl}`)
console.log("[twa:init] Running bubblewrap init (follow prompts for keystore if asked)…")

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  [
    "bubblewrap",
    "init",
    `--manifest=${manifestUrl}`,
    `--directory=${twaRoot}`,
  ],
  { cwd: twaRoot, stdio: "inherit", shell: true, env: process.env }
)

process.exit(result.status ?? 1)
