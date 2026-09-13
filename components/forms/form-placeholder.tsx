export function FormPlaceholder({ note }: { note: string }) {
  return (
    <div className="mt-6 rounded-xl border border-dashed p-4 text-sm leading-6 text-muted-foreground">
      {note}
    </div>
  )
}
