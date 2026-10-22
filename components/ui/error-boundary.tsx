"use client"

import { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Home } from "lucide-react"
import Link from "next/link"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 pb-8 px-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <RefreshCw className="size-6" />
              </div>
              <h2 className="mb-2 text-lg font-semibold">حدث خطأ غير متوقع</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                نعتذر عن الإزعاج. يرجى إعادة تحميل الصفحة أو المحاولة مرة أخرى.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={this.reset} className="gap-1.5">
                  <RefreshCw className="size-4" />
                  إعادة التحميل
                </Button>
                <Link href="/">
                  <Button variant="outline" className="gap-1.5">
                    <Home className="size-4" />
                    الرئيسية
                  </Button>
                </Link>
              </div>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-6 text-start text-xs text-muted-foreground">
                  <summary className="cursor-pointer mb-1">تفاصيل الخطأ (التطوير)</summary>
                  <pre className="rounded bg-muted p-2 overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}