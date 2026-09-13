type PropertyCardPlaceholderProps = {
  title: string
  area: string
}

export function PropertyCardPlaceholder({
  title,
  area,
}: PropertyCardPlaceholderProps) {
  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <div className="aspect-[4/3] bg-muted" />
      <div className="space-y-1 p-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-muted-foreground">{area} · بدون عنوان دقيق</p>
      </div>
    </article>
  )
}
