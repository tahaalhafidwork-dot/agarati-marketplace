import { Camera } from "lucide-react"

import { listingImagePublicUrl } from "@/lib/supabase/config"

export type GalleryPhoto = {
  id: string
  url: string
  contributorName: string
  createdAtLabel: string
}

/** Approved community photos only (no stock / curated stand-ins). */
export function ProjectPhotoGallery({
  photos,
  projectName,
}: {
  photos: GalleryPhoto[]
  projectName: string
}) {
  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-5 text-center">
        <Camera className="mx-auto size-5 text-muted-foreground/60" />
        <p className="mt-2 text-xs font-medium text-[#0F2744]">
          لا صور من الموقع بعد
        </p>
        <p className="mt-1 text-[0.65rem] leading-5 text-muted-foreground">
          المعرض يعرض صوراً حقيقية من زوار المشروع بعد موافقة الإدارة فقط.
        </p>
      </div>
    )
  }

  return (
    <ul className="-mx-0.5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
      {photos.map((p) => (
        <li
          key={p.id}
          className="w-[7.5rem] shrink-0 overflow-hidden rounded-lg border border-border bg-card sm:w-[8.5rem]"
        >
          <div className="relative aspect-[4/3] bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.url}
              alt={`${projectName} — ${p.contributorName}`}
              className="size-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="space-y-0 px-2 py-1.5">
            <p className="truncate text-[0.65rem] font-medium text-[#0F2744]">
              {p.contributorName}
            </p>
            {p.createdAtLabel ? (
              <p
                className="truncate text-[0.6rem] text-muted-foreground"
                dir="ltr"
              >
                {p.createdAtLabel}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function toGalleryPhoto(row: {
  id: string
  storagePath: string
  contributorName: string
  createdAt: Date
}): GalleryPhoto {
  return {
    id: row.id,
    url: listingImagePublicUrl(row.storagePath),
    contributorName: row.contributorName,
    createdAtLabel: new Intl.DateTimeFormat("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(row.createdAt),
  }
}
