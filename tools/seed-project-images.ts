/**
 * Seeds verified Wikimedia covers for residential/mixed projects only.
 * Removes shopping malls from the residential directory.
 *
 *   npx tsx tools/seed-project-images.ts
 */
import { PrismaClient } from "@prisma/client"

import {
  PROJECT_SUMMARIES,
  REAL_PROJECTS,
  isStockProjectImageUrl,
} from "../lib/project-images"

const prisma = new PrismaClient()

const MALL_SLUGS = [
  "family-mall-erbil",
  "majidi-mall",
  "city-center-mall",
]

const REMOVED_PROJECT_SLUGS = [
  "kesnazan-compound",
  "al-jadriya-compound",
  "yarmouk-villas",
  ...MALL_SLUGS.filter((s) => s !== "city-center-mall"),
]

const DEMO_STOCK_SLUGS = ["flora-city", "bakhtyari-complex"]

async function main() {
  await prisma.project.deleteMany({
    where: { slug: { in: REMOVED_PROJECT_SLUGS } },
  })
  console.log(`Removed non-directory projects (malls + invented seeds)`)

  await prisma.project.updateMany({
    where: { slug: "city-center-mall" },
    data: { projectKind: "COMMERCIAL", status: "APPROVED" },
  })

  for (const entry of REAL_PROJECTS) {
    const cover = entry.images[0]?.url ?? null

    await prisma.project.upsert({
      where: { slug: entry.slug },
      create: {
        slug: entry.slug,
        name: entry.name,
        projectKind: entry.projectKind,
        status: "APPROVED",
        reviewedAt: new Date(),
        summary: entry.summary,
        websiteUrl: entry.websiteUrl ?? null,
        citySlug: entry.citySlug,
        districtSlug: entry.districtSlug ?? null,
        neighborhoodSlug: entry.neighborhoodSlug ?? null,
        imageUrl: cover,
        imageUrls: [],
      },
      update: {
        name: entry.name,
        projectKind: entry.projectKind,
        status: "APPROVED",
        reviewedAt: new Date(),
        summary: entry.summary,
        imageUrl: cover,
        imageUrls: [],
      },
    })

    console.log(`${entry.slug} [${entry.projectKind}] -> cover`)
  }

  const namedDemos: Record<
    string,
    { name: string; citySlug: string; summary: string }
  > = {
    "flora-city": {
      name: "فلوريا سيتي",
      citySlug: "erbil",
      summary: PROJECT_SUMMARIES["flora-city"],
    },
    "bakhtyari-complex": {
      name: "بختياري توين تاورز",
      citySlug: "erbil",
      summary: PROJECT_SUMMARIES["bakhtyari-complex"],
    },
  }

  for (const slug of DEMO_STOCK_SLUGS) {
    const meta = namedDemos[slug]
    await prisma.project.updateMany({
      where: { slug },
      data: {
        projectKind: "RESIDENTIAL",
        status: "APPROVED",
        reviewedAt: new Date(),
        ...(meta
          ? {
              name: meta.name,
              citySlug: meta.citySlug,
              summary: meta.summary,
            }
          : {}),
      },
    })
    if (meta) console.log(`${slug} -> summary`)
  }

  const demo = await prisma.project.findMany({
    where: { slug: { in: DEMO_STOCK_SLUGS } },
    select: { id: true, slug: true, imageUrl: true, imageUrls: true },
  })
  for (const p of demo) {
    const fake =
      isStockProjectImageUrl(p.imageUrl) ||
      (p.imageUrls ?? []).some((u) => isStockProjectImageUrl(u)) ||
      (p.imageUrls?.length ?? 0) > 0
    if (!fake && !p.imageUrl) continue
    await prisma.project.update({
      where: { id: p.id },
      data: { imageUrl: null, imageUrls: [] },
    })
    console.log(`${p.slug} -> cleared stand-in images`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
