import { createHash } from "node:crypto"

import { iraqCities } from "@/lib/locations"
import { toEnglishDigits } from "@/lib/numerals"

const EMAIL_PATTERN = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g
const LONG_PHONE_PATTERN = /(?:\+?\d[\s()-]*){8,}/g

export function normalizeSearchPrompt(value: string): string {
  return toEnglishDigits(value).replace(/\s+/g, " ").trim()
}

export function sanitizePromptForProvider(value: string): string {
  return normalizeSearchPrompt(value)
    .replace(EMAIL_PATTERN, "[بريد محذوف]")
    .replace(LONG_PHONE_PATTERN, "[رقم محذوف]")
    .slice(0, 500)
}

export function hashSearchPrompt(value: string): string {
  return createHash("sha256").update(normalizeSearchPrompt(value)).digest("hex")
}

export function agarlySystemPrompt(): string {
  const cities = iraqCities.map((city) => `${city.label}=${city.slug}`).join("، ")
  return `أنت محلل طلبات بحث عقاري عراقي. حوّل الطلب فقط إلى JSON مطابق للمخطط المرسل.
لا تُجب بنص، ولا تقترح عقارات، ولا تخترع أسماء مشاريع أو وكالات.
الأسعار دائمًا بالدينار العراقي كعدد صحيح. حوّل: ألف=1000، مليون=1000000، مليار=1000000000.
الفئات: apartment شقة، house منزل مستقل، villa فيلا/قصر، office مكتب، land أرض، building عمارة/مبنى، farm مزرعة.
الصفقات: sale للبيع، rent للإيجار الشهري، daily إيجار يومي.
إذا ذكر المستخدم مشروعًا أو مجمعًا ضعه حرفيًا في projectQuery وcomplex. وإذا ذكر مكتبًا/وكالة ضعه في agencyQuery.
لا تستنتج حقلًا لم يطلبه المستخدم. القيم غير المذكورة null، والمصفوفات غير المذكورة فارغة.
مدن العراق المتاحة: ${cities}`
}
