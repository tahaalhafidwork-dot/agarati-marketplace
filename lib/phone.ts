/** Iraq phone helpers — normalize local 07… to international 964… for tel/WhatsApp. */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "")
}

/**
 * Returns digits suitable for `wa.me` / storage (country code, no +).
 * Accepts: 07xxxxxxxx, 7xxxxxxxx, +9647…, 009647…
 */
export function normalizeIraqPhone(input: string): string | null {
  let digits = digitsOnly(input)
  if (!digits) return null

  if (digits.startsWith("00964")) digits = digits.slice(2)
  if (digits.startsWith("9640") && digits.length >= 13) {
    digits = `964${digits.slice(4)}`
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    digits = `964${digits.slice(1)}`
  }
  if (digits.startsWith("7") && digits.length === 10) {
    digits = `964${digits}`
  }
  if (!digits.startsWith("964") && digits.length >= 10 && digits.length <= 12) {
    digits = `964${digits.replace(/^0+/, "")}`
  }

  // Iraq mobile: 964 + 7xxxxxxxx (12–13 digits typical)
  if (digits.startsWith("964") && digits.length >= 12 && digits.length <= 15) {
    return digits
  }
  return digits.length >= 10 ? digits : null
}

export function formatPhoneDisplay(input: string): string {
  const n = normalizeIraqPhone(input)
  if (!n) return input.trim()
  if (n.startsWith("964") && n.length >= 12) {
    const local = `0${n.slice(3)}`
    return local.replace(/(\d{4})(\d{3})(\d+)/, "$1 $2 $3")
  }
  return n
}

export function whatsappUrl(phone: string, text?: string): string {
  const n = normalizeIraqPhone(phone) ?? digitsOnly(phone)
  const q = text ? `?text=${encodeURIComponent(text)}` : ""
  return `https://wa.me/${n}${q}`
}

export function telUrl(phone: string): string {
  const n = normalizeIraqPhone(phone) ?? digitsOnly(phone)
  return `tel:+${n}`
}
