export default function AgenciesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-3 px-3 py-5" aria-busy="true">
      <div className="h-12 animate-pulse rounded-xl bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}
