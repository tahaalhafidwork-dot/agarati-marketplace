import type { ReactNode } from "react"

type PlaceholderPageProps = {
  title: string
  description: string
  eyebrow?: string
  children?: ReactNode
}

export function PlaceholderPage({
  title,
  description,
  eyebrow,
  children,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
      <div className="rounded-md border border-border bg-card p-6 md:p-8">
        {eyebrow ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </div>
  )
}
