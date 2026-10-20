import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Building2,
  Camera,
  ChevronLeft,
  ExternalLink,
  Globe2,
  Map,
  MapPinned,
} from "lucide-react"

import { AppSubHeader } from "@/components/layout/app-sub-header"
import { ProjectPhotoContributeForm } from "@/components/projects/project-photo-contribute-form"
import {
  ProjectPhotoGallery,
  toGalleryPhoto,
} from "@/components/projects/project-photo-gallery"
import {
  countApprovedProjectPhotos,
  fetchApprovedAgencies,
  fetchProjectBySlug,
  listApprovedProjectPhotos,
} from "@/lib/agency-directory"
import { getSessionUser } from "@/lib/auth"
import { formatShortArea } from "@/lib/locations"
import { projectMapsLinks, PROJECT_GALLERY_MAX } from "@/lib/project-gallery"
import {
  projectHeroCover,
  projectHeroCredit,
} from "@/lib/project-images"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await fetchProjectBySlug(decodeURIComponent(slug))
  return {
    title: project ? `${project.name} · مشروع سكني` : "مشروع سكني",
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug: raw } = await params
  const slug = decodeURIComponent(raw)
  const project = await fetchProjectBySlug(slug)
  if (!project) notFound()

  const [agencies, galleryRows, approvedCount, session] = await Promise.all([
    fetchApprovedAgencies({ projectSlug: project.slug }, 24),
    listApprovedProjectPhotos(project.id),
    countApprovedProjectPhotos(project.id),
    getSessionUser(),
  ])

  const gallery = galleryRows.map(toGalleryPhoto)
  const cover = projectHeroCover(project, project.slug)
  const heroCredit = projectHeroCredit(project.slug)
  const maps = projectMapsLinks({
    name: project.name,
    citySlug: project.citySlug,
    districtSlug: project.districtSlug,
    neighborhoodSlug: project.neighborhoodSlug,
  })
  const areaLabel =
    project.citySlug != null
      ? formatShortArea({
          city: project.citySlug,
          district: project.districtSlug || project.citySlug,
          neighborhood:
            project.neighborhoodSlug ||
            project.districtSlug ||
            project.citySlug,
        })
      : maps?.label ?? null

  return (
    <div className="mx-auto w-full max-w-7xl pb-10">
      <AppSubHeader title="مشروع سكني" backHref="/projects" />

      <div className="relative aspect-[2/1] w-full overflow-hidden bg-[#0F2744] sm:aspect-[21/9]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="size-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2744]/92 via-[#0F2744]/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
          <h1 className="text-lg font-semibold text-[#f8f1e6] sm:text-xl">
            {project.name}
          </h1>
          {areaLabel ? (
            <p className="mt-0.5 text-[0.7rem] text-[#f8f1e6]/75">{areaLabel}</p>
          ) : null}
          {heroCredit ? (
            <p className="mt-1 text-[0.55rem] text-[#f8f1e6]/55">{heroCredit}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 px-3 py-4 md:px-4 md:py-5">
        <section className="rounded-2xl border border-border/80 bg-card p-4 shadow-[0_6px_24px_rgba(15,39,68,0.04)] md:p-5">
          <h2 className="text-base font-semibold text-[#0F2744]">نبذة عن المشروع</h2>
          {project.summary ? (
            <p className="mt-2 text-sm leading-7 text-[#0F2744]/85">
              {project.summary}
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ستُضاف نبذة أوضح عن المشروع بعد استكمال بيانات الإدارة.
            </p>
          )}

          <div className="mt-4 border-t border-border/70 pt-4">
            {maps ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0F2744] text-[#f8f1e6] shadow-sm">
                    <MapPinned className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#0F2744]">عنوان المشروع</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      {maps.label}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a
                    href={maps.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[color:var(--brand-gold)]/25 bg-[#faf6ef] px-2 text-[0.7rem] font-semibold text-[#0F2744] shadow-sm transition hover:border-[color:var(--brand-gold)]/50 hover:bg-[#f7f0e5]"
                  >
                    <Map className="size-4 text-[color:var(--brand-gold)]" aria-hidden />
                    خرائط Google
                    <ExternalLink className="size-3 text-muted-foreground" aria-hidden />
                  </a>
                  <a
                    href={maps.openStreetMap}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[color:var(--brand-gold)]/25 bg-[#faf6ef] px-2 text-[0.7rem] font-semibold text-[#0F2744] shadow-sm transition hover:border-[color:var(--brand-gold)]/50 hover:bg-[#f7f0e5]"
                  >
                    <MapPinned className="size-4 text-[color:var(--brand-gold)]" aria-hidden />
                    OpenStreetMap
                    <ExternalLink className="size-3 text-muted-foreground" aria-hidden />
                  </a>
                </div>
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-5 text-center text-xs text-muted-foreground">
                لم يُستكمل عنوان المشروع على الخريطة بعد.
              </p>
            )}

            {project.websiteUrl ? (
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-2.5 flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border border-border/80 bg-background px-3 text-xs font-semibold text-[#0F2744] transition hover:bg-[#f7f3ec]"
              >
                <span className="inline-flex items-center gap-2">
                  <Globe2 className="size-4 text-[color:var(--brand-gold)]" aria-hidden />
                  موقع المشروع الرسمي
                </span>
                <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden />
              </a>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_8px_28px_rgba(15,39,68,0.05)]">
          <div className="flex items-start gap-3 border-b border-border/70 p-4 md:p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-gold)]/12 text-[#70583d]">
              <Building2 className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#0F2744]">
                  الوكالات العقارية المسوّقة
                </h2>
                <span className="rounded-full bg-[#0F2744] px-2.5 py-1 text-[0.65rem] font-semibold text-white tabular-nums">
                  {agencies.length}
                </span>
              </div>
              <p className="mt-1 text-[0.68rem] leading-5 text-muted-foreground">
                الجهات المعتمدة لتسويق وحدات هذا المشروع والتواصل حولها.
              </p>
            </div>
          </div>

          <div className="p-3 md:p-4">
            {agencies.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-7 text-center text-xs leading-5 text-muted-foreground">
                لا توجد وكالة عقارية مرتبطة بهذا المشروع بعد.
              </p>
            ) : (
              <ul className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/80 bg-background/60">
                {agencies.map((agency) => (
                  <li key={agency.id}>
                    <Link
                      href={`/agencies/${encodeURIComponent(agency.slug)}`}
                      className="group flex items-center gap-3 px-3 py-3 transition hover:bg-[#f7f3ec]/80"
                    >
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-border/70 bg-muted">
                        {agency.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={agency.logoUrl} alt="" className="size-full object-cover" />
                        ) : (
                          <div className="flex size-full items-center justify-center">
                            <Building2 className="size-4 text-[color:var(--brand-gold)]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#0F2744]">
                          {agency.officeName}
                        </p>
                        <p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground">
                          {agency.locationLabel}
                        </p>
                      </div>
                      <ChevronLeft className="size-4 shrink-0 text-muted-foreground transition group-hover:-translate-x-0.5 group-hover:text-[#0F2744]" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={`/agencies?mode=project&project=${encodeURIComponent(project.slug)}`}
              className="mt-3 flex min-h-10 w-full items-center justify-center gap-1 rounded-xl border border-border/80 bg-[#faf6ef] px-3 text-xs font-semibold text-[#0F2744] transition hover:border-[color:var(--brand-gold)]/45 hover:bg-[#f7f0e5]"
            >
              عرض دليل الوكالات
              <ChevronLeft className="size-3.5" aria-hidden />
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_8px_28px_rgba(15,39,68,0.05)]">
          <div className="flex items-start gap-3 border-b border-border/70 p-4 md:p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--brand-gold)]/12 text-[#70583d]">
              <Camera className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#0F2744]">مشاركات الصور</h2>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[0.65rem] font-semibold text-muted-foreground tabular-nums">
                  {Math.min(approvedCount, PROJECT_GALLERY_MAX)}/{PROJECT_GALLERY_MAX}
                </span>
              </div>
              <p className="mt-1 text-[0.68rem] leading-5 text-muted-foreground">
                صور حقيقية يشاركها المستخدمون وتظهر بعد مراجعة الإدارة.
              </p>
            </div>
          </div>
          <div className="space-y-3 p-3 md:p-4">
            <ProjectPhotoGallery photos={gallery} projectName={project.name} />
            <ProjectPhotoContributeForm
              projectId={project.id}
              approvedCount={approvedCount}
              isSignedIn={Boolean(session)}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
