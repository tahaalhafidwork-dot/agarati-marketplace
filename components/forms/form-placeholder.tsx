export function FormPlaceholder({ note }: { note: string }) {
  return (
    <div className="mt-4 rounded-md border border-dashed border-border bg-muted/40 p-3 text-sm leading-6 text-muted-foreground">
      {note}
    </div>
  )
}
