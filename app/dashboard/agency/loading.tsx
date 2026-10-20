export default function AgencyLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="جارٍ تحميل مساحة العمل">
      <div className="h-14 animate-pulse rounded-2xl bg-muted" />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}
