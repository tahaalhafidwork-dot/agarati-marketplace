const fs = require("fs")
const path = require("path")

const src = process.argv[2]
const outDir = process.argv[3] || "docs/references/sahibinden/live"
const label = process.argv[4] || "page"

fs.mkdirSync(outDir, { recursive: true })
let raw = fs.readFileSync(src, "utf8").trim()
const end = raw.lastIndexOf("}")
if (end !== -1) raw = raw.slice(0, end + 1)
const data = JSON.parse(raw)
const item = data.items ? data.items[0] : data
const html = item.html || ""
const md = item.markdown || ""

fs.writeFileSync(path.join(outDir, `${label}.html`), html)
if (md) fs.writeFileSync(path.join(outDir, `${label}.md`), md)

const colors = [...html.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) =>
  m[0].toLowerCase()
)
const freq = {}
for (const c of colors) freq[c] = (freq[c] || 0) + 1
const topColors = Object.entries(freq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25)

const css = [...html.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((m) => m[1])
const classes = [...html.matchAll(/class="([^"]+)"/g)]
  .flatMap((m) => m[1].split(/\s+/))
  .filter(Boolean)
const classFreq = {}
for (const c of classes) classFreq[c] = (classFreq[c] || 0) + 1
const topClasses = Object.entries(classFreq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40)

const blob = html + md
const summary = {
  label,
  title: item.metadata?.title || item["metadata.title"] || null,
  proxy:
    item.metadata?.headers?.["x-proxy"] ||
    item["metadata.headers.x-proxy"] ||
    null,
  htmlBytes: html.length,
  markdownBytes: md.length,
  topColors,
  css: css.slice(0, 20),
  topClasses,
  hasShowcase: /vitrin|Anasayfa Vitrini/i.test(blob),
  hasCategories: /Emlak|Vasıta|Kategori/i.test(blob),
  isLoginWall: /Türkiye dışından erişmek|Giriş yapmanız gerekmektedir/i.test(
    blob
  ),
}
fs.writeFileSync(
  path.join(outDir, `${label}-signals.json`),
  JSON.stringify(summary, null, 2)
)
console.log(JSON.stringify(summary, null, 2))
