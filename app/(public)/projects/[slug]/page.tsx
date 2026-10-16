import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Building2,
  ChevronLeft,
  ExternalLink,
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

      <div className="space-y-0 px-3 md:px-4">
        {/* نبذة + روابط عملية */}
        <section className="space-y-3 border-b border-border py-4">
          <h2 className="text-sm font-semibold text-[#0F2744]">نبذة عن المشروع</h2>
          {project.summary ? (
            <p className="text-sm leading-7 text-[#0F2744]/90">{project.summary}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              ستُضاف نبذة أوضح عن المشروع بعد استكمال بيانات الإدارة.
            </p>
          )}

          {(maps || project.websiteUrl) && (
            <div className="space-y-2 rounded-lg border border-border bg-card px-2.5 py-2">
              {maps ? (
                <p className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-[#0F2744]">
                  <MapPinned
                    className="size-3.5 shrink-0 text-[color:var(--brand-gold)]"
                    aria-hidden
                  />
                  <span className="truncate">{maps.label}</span>
                  <span className="shrink-0 font-normal text-muted-foreground">
                    · موقع تقريبي
                  </span>
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {maps ? (
                  <>
                    <a
                      href={maps.googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-[#0F2744] transition hover:bg-[#f7f3ec]"
                    >
                      خرائط Google
                    </a>
                    <a
                      href={maps.openStreetMap}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-[#0F2744] transition hover:bg-[#f7f3ec]"
                    >
                      OpenStreetMap
                    </a>
                  </>
                ) : null}
                {project.websiteUrl ? (
                  <a
                    href={project.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium text-[#0F2744] transition hover:bg-[#f7f3ec]"
                  >
                    <ExternalLink className="size-3.5 shrink-0 text-[color:var(--brand-gold)]" />
                    موقع المشروع الرسمي
                  </a>
                ) : null}
              </div>
            </div>
          )}
        </section>

        {/* معرض — مساهمات حقيقية فقط */}
        <section className="space-y-2.5 border-b border-border py-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[#0F2744]">
                صور من الموقع
              </h2>
              <p className="mt-0.5 text-[0.65rem] leading-4 text-muted-foreground">
                مساهمات المستخدمين بعد موافقة الإدارة
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[0.65rem] tabular-nums text-muted-foreground">
              {Math.min(approvedCount, PROJECT_GALLERY_MAX)}/{PROJECT_GALLERY_MAX}
            </span>
          </div>
          <ProjectPhotoGallery photos={gallery} projectName={project.name} />
          <ProjectPhotoContributeForm
            projectId={project.id}
            approvedCount={approvedCount}
            isSignedIn={Boolean(session)}
          />
        </section>

        {/* وكالات */}
        <section className="space-y-3 py-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#0F2744]">
              وكالات المشروع
              <span className="ms-1.5 font-normal text-muted-foreground">
                ({agencies.length})
              </span>
            </h2>
            <Link
              href={`/agencies?mode=project&project=${encodeURIComponent(project.slug)}`}
              className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline"
            >
              الدليل
              <ChevronLeft className="size-3.5" />
            </Link>
          </div>

          {agencies.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              لا وكالات مربوطة بهذا المشروع بعد.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {agencies.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/agencies/${encodeURIComponent(a.slug)}`}
                    className="flex items-center gap-2.5 px-2.5 py-2.5 transition hover:bg-[#f7f3ec]/80"
                  >
                    <div className="relative size-9 shrink-0 overflow-hidden rounded-md bg-muted">
                      {a.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.logoUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <Building2 className="size-3.5 text-[color:var(--brand-gold)]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#0F2744]">
                        {a.officeName}
                      </p>
                      <p className="truncate text-[0.65rem] text-muted-foreground">
                        {a.locationLabel}
                      </p>
                    </div>
                    <ChevronLeft className="size-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
