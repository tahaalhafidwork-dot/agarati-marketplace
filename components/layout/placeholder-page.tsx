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
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      {eyebrow ? (
        <p className="mb-2 text-sm text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {description}
      </p>
      {children}
    </div>
  )
}
