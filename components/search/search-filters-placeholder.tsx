import type { ReactNode } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { buildingAgeOptions, roomOptions } from "@/lib/sample-listings"
import { cn } from "@/lib/utils"

const propertyTypes = [
  "شقة",
  "فيلا",
  "مكتب تجاري",
  "عمارة",
  "قطعة أرض",
] as const

type SearchFiltersPlaceholderProps = {
  variant?: "panel" | "rail" | "chips" | "header"
  className?: string
}

export function SearchFiltersPlaceholder({
  variant = "panel",
  className,
}: SearchFiltersPlaceholderProps) {
  if (variant === "header") {
    return (
      <div className={cn("hidden flex-1 items-center gap-2 lg:flex", className)}>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="ps-8"
            placeholder="مدينة، حي، أو نوع عقار…"
            disabled
          />
        </div>
        <Link
          href="/properties"
          className={buttonVariants({ size: "sm" })}
        >
          بحث
        </Link>
      </div>
    )
  }

  if (variant === "chips") {
    const chips = ["للبيع", "شقة", "أربيل", "3 غرف", "م²"]
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
    )
  }

  if (variant === "rail") {
    return (
      <Card size="sm" className={cn("gap-0 py-0", className)}>
        <CardHeader className="border-b bg-muted/40 py-3">
          <CardTitle className="text-sm">تصفية مفصّلة</CardTitle>
          <CardDescription className="text-[0.7rem]">
            تُحفظ في الرابط لاحقاً
          </CardDescription>
        </CardHeader>
        <ScrollArea className="max-h-[70vh]">
          <CardContent className="space-y-4 py-3">
            <RailBlock title="نوع الصفقة">
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" type="button" disabled>
                  للبيع
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  type="button"
                  disabled
                >
                  للإيجار
                </Button>
              </div>
            </RailBlock>

            <RailBlock title="نوع العقار">
              <CheckList options={[...propertyTypes]} />
            </RailBlock>

            <RailBlock title="العنوان">
              <div className="space-y-2">
                <FieldStack label="المدينة">
                  <Select disabled>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="أربيل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="erbil">أربيل</SelectItem>
                      <SelectItem value="baghdad">بغداد</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldStack>
                <FieldStack label="القضاء">
                  <Input placeholder="أي قضاء" disabled />
                </FieldStack>
                <FieldStack label="الحي">
                  <Input placeholder="أي حي" disabled />
                </FieldStack>
              </div>
            </RailBlock>

            <RailBlock title="السعر (د.ع)">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="من" disabled />
                <Input placeholder="إلى" disabled />
              </div>
            </RailBlock>

            <RailBlock title="المساحة م²">
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="من" disabled />
                <Input placeholder="إلى" disabled />
              </div>
            </RailBlock>

            <RailBlock title="عدد الغرف">
              <CheckList options={[...roomOptions]} />
            </RailBlock>

            <RailBlock title="عمر البناء">
              <CheckList options={[...buildingAgeOptions]} />
            </RailBlock>
          </CardContent>
        </ScrollArea>
        <CardFooter className="flex-col gap-2 border-t">
          <Link
            href="/properties"
            className={cn(buttonVariants(), "w-full")}
          >
            <Search className="size-4" />
            تطبيق الفلاتر
          </Link>
          <p className="text-[0.7rem] text-muted-foreground">
            واجهة فقط — بلا نتائج حقيقية في سبرنت 0.
          </p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="border-b pb-(--card-spacing)">
        <Tabs defaultValue="sale">
          <TabsList>
            <TabsTrigger value="sale">للبيع</TabsTrigger>
            <TabsTrigger value="rent">للإيجار</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-(--card-spacing)">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
          <FieldStack label="المدينة / الحي">
            <Input defaultValue="أربيل · عنكاوا" disabled />
          </FieldStack>
          <FieldStack label="نوع العقار">
            <Select disabled defaultValue="apartment">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">شقة</SelectItem>
                <SelectItem value="villa">فيلا</SelectItem>
                <SelectItem value="office">مكتب تجاري</SelectItem>
                <SelectItem value="building">عمارة</SelectItem>
                <SelectItem value="land">قطعة أرض</SelectItem>
              </SelectContent>
            </Select>
          </FieldStack>
          <FieldStack label="الغرف">
            <Select disabled defaultValue="3">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
              </SelectContent>
            </Select>
          </FieldStack>
          <FieldStack label="السعر">
            <Input placeholder="أي سعر" disabled />
          </FieldStack>
          <Link
            href="/properties"
            className={cn(
              buttonVariants(),
              "inline-flex h-auto min-h-10 w-full items-center justify-center sm:col-span-2 lg:col-span-1"
            )}
          >
            <Search className="size-4" />
            بحث
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function RailBlock({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold">{title}</p>
      {children}
      <Separator />
    </div>
  )
}

function FieldStack({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function CheckList({ options }: { options: string[] }) {
  return (
    <ul className="max-h-32 space-y-2 overflow-y-auto">
      {options.map((option) => (
        <li key={option} className="flex items-center gap-2">
          <Checkbox id={`f-${option}`} disabled />
          <Label
            htmlFor={`f-${option}`}
            className="text-xs font-normal text-muted-foreground"
          >
            {option}
          </Label>
        </li>
      ))}
    </ul>
  )
}
