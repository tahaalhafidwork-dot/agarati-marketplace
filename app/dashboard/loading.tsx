export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}