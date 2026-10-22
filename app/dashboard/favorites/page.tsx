import type { Metadata } from "next"
import Link from "next/link"
import { Bookmark, Heart, Search } from "lucide-react"

import { FavoritesListingsSection } from "@/components/property/favorites-listings-section"
import { buttonVariants } from "@/components/ui/button"
import { removeSavedSearchAction } from "@/lib/actions/saved-searches"
import { getSessionUser } from "@/lib/auth"
import { isDatabaseConfigured, prisma } from "@/lib/db"
import { toPublicListingCard } from "@/lib/listings"
import { cn } from "@/lib/utils"
import { publicListingVisibilityWhere } from "@/lib/listing-quota"

export const metadata: Metadata = {
  title: "المفضلة",
}

export default async function FavoritesPage() {
  const user = await getSessionUser()
  const favorites =
    user && isDatabaseConfigured()
      ? await prisma.favorite.findMany({
          where: {
            userId: user.id,
            listing: publicListingVisibilityWhere(),
          },
          orderBy: { createdAt: "desc" },
          include: {
            listing: {
              include: {
                images: true,
                owner: {
                  select: { id: true, name: true, phone: true, whatsapp: true },
                },
                agency: {
                  select: {
                    slug: true,
                    name: true,
                    phone: true,
                    whatsapp: true,
                    createdById: true,
                  },
                },
                assignedAgent: { select: { id: true, name: true } },
              },
            },
          },
        })
      : []

  const savedSearches =
    user && isDatabaseConfigured()
      ? await prisma.savedSearch.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        })
      : []

  const cards = favorites.map((f) => toPublicListingCard(f.listing))

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Heart className="size-5 fill-primary text-primary" />
            المفضلة
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إعلانات محفوظة، وقوائم بحث تريد الرجوع إليها لاحقاً
          </p>
        </div>
        <Link
          href="/properties"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          تصفح العقارات
        </Link>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="size-4 text-primary" />
          <h2 className="text-base font-semibold">الإعلانات المحفوظة</h2>
        </div>
        <FavoritesListingsSection
          serverCards={cards}
          signedIn={Boolean(user)}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Bookmark className="size-4 text-brand-gold" />
          <h2 className="text-base font-semibold">قوائم البحث المحفوظة</h2>
          <span className="text-xs text-muted-foreground">
            ({savedSearches.length})
          </span>
        </div>
        {!isDatabaseConfigured() ? (
          <p className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            اربط قاعدة البيانات أولاً — docs/SUPABASE_SETUP.md
          </p>
        ) : !user ? (
          <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            <Link
              href="/login?next=/dashboard/favorites"
              className="font-semibold text-primary hover:underline"
            >
              سجّل الدخول
            </Link>{" "}
            لحفظ قوائم البحث ومزامنة المفضلة بين الأجهزة.
          </p>
        ) : savedSearches.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            من صفحة نتائج التصفح اضغط أيقونة الإشارة لحفظ القائمة الحالية.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {savedSearches.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-b-0 sm:px-4"
              >
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <Link href={row.href} className="min-w-0 flex-1 hover:underline">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {row.title}
                  </p>
                  <p
                    className="truncate text-[0.65rem] text-muted-foreground"
                    dir="ltr"
                  >
                    {row.href}
                  </p>
                </Link>
                <form action={removeSavedSearchAction.bind(null, row.id)}>
                  <button
                    type="submit"
                    className="text-xs font-medium text-muted-foreground hover:text-destructive"
                  >
                    إزالة
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
