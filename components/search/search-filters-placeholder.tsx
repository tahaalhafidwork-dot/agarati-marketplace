const chips = ["للبيع", "شقة", "إسطنبول", "فلاتر الرابط"]

export function SearchFiltersPlaceholder() {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip}
          className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground"
        >
          {chip}
        </span>
      ))}
    </div>
  )
}
