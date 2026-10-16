import { NextResponse } from "next/server"

/**
 * Digital Asset Links for Trusted Web Activity / Android App Links.
 * Populate TWA_SHA256_CERT_FINGERPRINTS after Bubblewrap / Play App Signing keys exist.
 *
 * @see https://developers.google.com/digital-asset-links/v1/getting-started
 */
export function GET() {
  const packageName =
    process.env.TWA_PACKAGE_NAME?.trim() || "com.agarati.app"
  const raw = process.env.TWA_SHA256_CERT_FINGERPRINTS?.trim() || ""
  const fingerprints = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)

  const body =
    fingerprints.length === 0
      ? []
      : [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: packageName,
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ]

  return NextResponse.json(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  })
}
