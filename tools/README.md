# Design extraction tools

Local tooling for design-system capture (not part of the Next.js app).

## design-md-extractor

```bash
cd tools/design-md-extractor
npm install
npx playwright install chromium
npm run build
node dist/cli.js extract https://example.com --out ../../docs/references/<name>/raw
```

Sahibinden live capture hits a bot wall; curated IA lives in
`docs/references/sahibinden/DESIGN.md`.

## Optional fast fallback

```bash
npx @designmdcc/cli https://example.com --out DESIGN.md
```
