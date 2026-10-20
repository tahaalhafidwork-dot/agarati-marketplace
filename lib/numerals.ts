const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩"
const EASTERN_ARABIC_INDIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹"

/** Arabic language and Iraqi conventions, with Latin (0-9) numerals. */
export const ARABIC_LATIN_DIGITS_LOCALE = "ar-IQ-u-nu-latn"

/** Convert Arabic-Indic and Eastern Arabic-Indic digits without changing text. */
export function toEnglishDigits(value: number | string): string {
  return String(value)
    .replace(/[٠-٩]/g, (digit) =>
      String(ARABIC_INDIC_DIGITS.indexOf(digit))
    )
    .replace(/[۰-۹]/g, (digit) =>
      String(EASTERN_ARABIC_INDIC_DIGITS.indexOf(digit))
    )
}

/** Format a number with Latin digits and English grouping separators. */
export function formatEnglishNumber(value: number | bigint): string {
  return new Intl.NumberFormat("en-US").format(value)
}
