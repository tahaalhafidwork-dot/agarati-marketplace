import { formatShortArea, type LocationRef } from "@/lib/locations"
import { demoServicesForSlug } from "@/lib/listing-services"

export type PropertyCategory =
  | "apartment"
  | "house"
  | "villa"
  | "office"
  | "land"
  | "building"
  | "farm"

export type DealType = "sale" | "rent" | "daily"

export type SampleListing = {
  slug: string
  title: string
  location: LocationRef
  /** Public line: مدينة · حي [/ مجمع] */
  area: string
  price: string
  meta: string
  rooms: string
  areaM2: string
  floor?: string
  deal: DealType
  /** Machine category — matches ?type= in /properties */
  category: PropertyCategory
  /** Arabic display label */
  type: string
  date: string
  image: string
  images: string[]
  description: string
  heating?: string
  furnished?: string
  /** Amenities / nearby services */
  services?: string[]
  /** Unique sequential listing number for search/share: 00001, 00043, etc. */
  listingNumber: string
}

/** Demo listing photos — relevant Unsplash photos by category with stable seeds. */
const apartmentImgs = [
  "photo-1560448204-e02f11c3d0e2",
  "photo-1502672260266-1c1ef2d93688",
  "photo-1522708323590-d24dbb6b0267",
  "photo-1560185893-a55cbc8c57e5",
  "photo-1560448204-603b3fc33ddc",
  "photo-1505693416388-ac5ce068fe85",
]

const houseImgs = [
  "photo-1600585154340-be6161a56a0c",
  "photo-1600566753190-17f0baa2a6c3",
  "photo-1600210492486-724fe5c67fb0",
  "photo-1600047509807-ba8f99d2cd00",
  "photo-1512917774080-9991f1c4c750",
  "photo-1564013799919-ab600027ffc6",
]

const villaImgs = [
  "photo-1600596542815-ffad4c1539a9",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1613490493576-7fde63acd811",
  "photo-1600585154340-be6161a56a0c",
  "photo-1613977257592-4878e2c3b607",
  "photo-1564013799919-ab600027ffc6",
]

const officeImgs = [
  "photo-1497366216548-37526070297c",
  "photo-1497366811353-6870744d04b2",
  "photo-1486406146926-c627a92ad1ab",
  "photo-1504384308090-c894fccde654",
  "photo-1441986300917-64674bd600d8",
  "photo-1472851294608-062f824d29cc",
]

const landImgs = [
  "photo-1500382017468-9049fed747ef",
  "photo-1464146072230-91cabc968266",
  "photo-1628624747186-a941c476b7ef",
  "photo-1500382017468-9049fed747ef",
  "photo-1464226184884-fa280b87c399",
  "photo-1500382017468-9049fed747ef",
]

const buildingImgs = [
  "photo-1486406146926-c627a92ad1ab",
  "photo-1479839672679-c595a4925106",
  "photo-1493809842364-78817add7ffb",
  "photo-1560448204-e02f11c3d0e2",
  "photo-1460317442991-0ec209397118",
  "photo-1479839672679-c595a4925106",
]

const farmImgs = [
  "photo-1500382017468-9049fed747ef",
  "photo-1464226184884-fa280b87c399",
  "photo-1625246333195-78d9c38ad449",
  "photo-1500382017468-9049fed747ef",
  "photo-1625246333195-78d9c38ad449",
  "photo-1464226184884-fa280b87c399",
]

function pickImg(category: PropertyCategory, index: number): string {
  const pool = {
    apartment: apartmentImgs,
    house: houseImgs,
    villa: villaImgs,
    office: officeImgs,
    land: landImgs,
    building: buildingImgs,
    farm: farmImgs,
  }[category]
  return pool[index % pool.length]
}

/** Supports both new (category, index) and legacy (photoId) signatures. */
const img = (arg1: PropertyCategory | string, arg2?: number) => {
  // New signature: img(category, index) — arg2 is provided
  if (arg2 !== undefined) {
    return `https://images.unsplash.com/${pickImg(arg1 as PropertyCategory, arg2)}?auto=format&fit=crop&w=1200&h=900&q=80`
  }
  // Legacy signature: img("photo-xxx") — hash the ID to pick a stable apartment image
  const legacyId = String(arg1)
  const hash = legacyId.split("").reduce((h, c) => h * 31 + c.charCodeAt(0), 0)
  return `https://images.unsplash.com/${apartmentImgs[Math.abs(hash) % apartmentImgs.length]}?auto=format&fit=crop&w=1200&h=900&q=80`
}

export const categoryLabels: Record<PropertyCategory, string> = {
  apartment: "شقة",
  house: "منزل مستقل",
  villa: "فيلا",
  office: "مكتب تجاري",
  land: "قطعة أرض",
  building: "عمارة",
  farm: "مزرعة",
}

/** Plural / menu labels — elevated marketplace tone */
export const categoryMenuLabels: Record<PropertyCategory, string> = {
  apartment: "شقق سكنية",
  house: "منازل مستقلة",
  villa: "فلل وقصور",
  office: "مكاتب تجارية",
  land: "قطع أراضٍ",
  building: "عمارات ومبانٍ",
  farm: "مزارع سياحية",
}

/** With definite article — for «كل إعلانات …» */
export const categoryPluralDefinite: Record<PropertyCategory, string> = {
  apartment: "الشقق السكنية",
  house: "المنازل المستقلة",
  villa: "الفلل والقصور",
  office: "المكاتب التجارية",
  land: "قطع الأراضي",
  building: "العمائر والمباني",
  farm: "المزارع السياحية",
}

export const categorySlugs: Record<PropertyCategory, string> = {
  apartment: "apartments",
  house: "houses",
  villa: "villas",
  office: "offices",
  land: "lands",
  building: "buildings",
  farm: "farms",
}

export const dealLabels: Record<DealType, string> = {
  sale: "للبيع",
  rent: "للإيجار",
  daily: "إيجار يومي",
}

/** Categories that support daily / short-stay rental. */
export const CATEGORIES_WITH_DAILY: readonly PropertyCategory[] = [
  "apartment",
  "house",
  "villa",
  "farm",
] as const

export function categoryAllowsDaily(category: PropertyCategory): boolean {
  return (CATEGORIES_WITH_DAILY as readonly string[]).includes(category)
}

export function toEnglishDigits(value: number | string): string {
  return String(value).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
}

const _rawListings = [
  // —— شقق ——
  {
    slug: "erbil-apartment-ankawa",
    location: { city: "erbil", district: "erbil-center", neighborhood: "ankawa" },
    title: "شقة حديثة للبيع في عنكاوا",
    area: "أربيل · عنكاوا",
    price: "١٨٥٫٠٠٠٫٠٠٠ د.ع",
    meta: "٣+١ · ١٣٥ م² · الطابق ٦",
    rooms: "٣+١",
    areaM2: "١٣٥",
    floor: "٦ / ١٢",
    deal: "sale",
    category: "apartment",
    type: "شقة",
    date: "اليوم",
    listingNumber: "00001",
    image: img("photo-1560448204-e02f11c3d0e2"),
    images: [
      img("photo-1560448204-e02f11c3d0e2"),
      img("photo-1502672260266-1c1ef2d93688"),
      img("photo-1522708323590-d24dbb6b0267"),
    ],
    description:
      "شقة نموذجية واسعة بإطلالة مفتوحة في عنكاوا. قريبة من الخدمات والمطاعم. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "فارغ",
  },
  {
    slug: "baghdad-apartment-mansour",
    location: { city: "baghdad", district: "karkh", neighborhood: "mansour" },
    title: "شقة عائلية في المنصور قرب الخدمات",
    area: "بغداد · المنصور",
    price: "٢١٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٤+١ · ١٦٠ م² · الطابق ٣",
    rooms: "٤+١",
    areaM2: "١٦٠",
    floor: "٣ / ٨",
    deal: "sale",
    category: "apartment",
    type: "شقة",
    date: "اليوم",
    listingNumber: "00002",
    image: img("photo-1493809842364-78817add7ffb"),
    images: [
      img("photo-1493809842364-78817add7ffb"),
      img("photo-1560448204-603b3fc33ddc"),
      img("photo-1505693416388-ac5ce068fe85"),
    ],
    description:
      "شقة عائلية في حي المنصور، مناسبة للسكن الطويل. واجهة مشمسة وتشطيب نظيف. العنوان الدقيق لا يظهر للعامة.",
    heating: "وحدات منفصلة",
    furnished: "فارغ",
  },
  {
    slug: "baghdad-apartment-jadriya",
    location: { city: "baghdad", district: "rusafa", neighborhood: "jadriya" },
    title: "شقة مطلة على الجامعة في الجادرية",
    area: "بغداد · الجادرية",
    price: "١٦٥٫٠٠٠٫٠٠٠ د.ع",
    meta: "٢+١ · ١٠٥ م² · الطابق ٧",
    rooms: "٢+١",
    areaM2: "١٠٥",
    floor: "٧ / ١٤",
    deal: "sale",
    category: "apartment",
    type: "شقة",
    date: "منذ يومين",
    listingNumber: "00003",
    image: img("photo-1522708323590-d24dbb6b0267"),
    images: [
      img("photo-1522708323590-d24dbb6b0267"),
      img("photo-1560448204-e02f11c3d0e2"),
      img("photo-1560185893-a55cbc8c57e5"),
    ],
    description:
      "شقة بإطلالة مريحة في الجادرية، قريبة من الجامعات والخدمات. العنوان الدقيق لا يظهر للعامة.",
    heating: "تكييف",
    furnished: "فارغ",
  },
  {
    slug: "baghdad-apartment-saydiya",
    location: { city: "baghdad", district: "karkh", neighborhood: "saydiya" },
    title: "شقة للبيع في الصادرة مطلة على الشارع الرئيسي",
    area: "بغداد · الصادرة",
    price: "١٤٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٣+١ · ١٢٥ م² · الطابق ٨",
    rooms: "٣+١",
    areaM2: "١٢٥",
    floor: "٨ / ١٥",
    deal: "sale",
    category: "apartment",
    type: "شقة",
    date: "أمس",
    listingNumber: "00004",
    image: img("photo-1560185893-a55cbc8c57e5"),
    images: [
      img("photo-1560185893-a55cbc8c57e5"),
      img("photo-1560448204-e02f11c3d0e2"),
      img("photo-1522708323590-d24dbb6b0267"),
    ],
    description:
      "شقة بإطلالة مباشرة على الشارع الرئيسي في الصادرة. تهوية جيدة. العنوان الدقيق لا يظهر للعامة.",
    heating: "تكييف",
    furnished: "فارغ",
  },
  {
    slug: "baghdad-rent-karrada",
    location: { city: "baghdad", district: "rusafa", neighborhood: "karrada" },
    title: "شقة للإيجار في الكرادة مفروشة جزئياً",
    area: "بغداد · الكرادة",
    price: "٨٥٠٫٠٠٠ د.ع / شهر",
    meta: "٢+١ · ٩٥ م² · الطابق ٤",
    rooms: "٢+١",
    areaM2: "٩٥",
    floor: "٤ / ١٠",
    deal: "rent",
    category: "apartment",
    type: "شقة",
    date: "أمس",
    listingNumber: "00005",
    image: img("photo-1502672260266-1c1ef2d93688"),
    images: [
      img("photo-1502672260266-1c1ef2d93688"),
      img("photo-1522708323590-d24dbb6b0267"),
      img("photo-1560185127-6ed189bf02f4"),
    ],
    description:
      "إيجار طويل في الكرادة، قريبة من المحال والخدمات. مفروشة جزئياً وجاهزة للسكن. العنوان الدقيق لا يظهر للعامة.",
    heating: "تكييف",
    furnished: "مفروش جزئياً",
  },
  {
    slug: "erbil-apartment-daratoo",
    location: { city: "erbil", district: "erbil-center", neighborhood: "daratoo", complex: "dream-city" },
    title: "شقة جديدة للإيجار في درتو",
    area: "أربيل · درتو",
    price: "١٫٥٠٠٫٠٠٠ د.ع / شهر",
    meta: "٣+١ · ١٤٠ م² · الطابق ٥",
    rooms: "٣+١",
    areaM2: "١٤٠",
    floor: "٥ / ١٠",
    deal: "rent",
    category: "apartment",
    type: "شقة",
    date: "اليوم",
    listingNumber: "00006",
    image: img("photo-1560448204-603b3fc33ddc"),
    images: [
      img("photo-1560448204-603b3fc33ddc"),
      img("photo-1502672260266-1c1ef2d93688"),
      img("photo-1522708323590-d24dbb6b0267"),
    ],
    description:
      "شقة حديثة في مجمع سكني راقٍ بدرتو. قريبة من المدارس الدولية والأسواق. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "مفروش جزئياً",
  },
  {
    slug: "baghdad-apartment-adhamiya",
    location: { city: "baghdad", district: "rusafa", neighborhood: "adhamiya" },
    title: "شقة للإيجار في الأعظمية بالقرب من الجسر",
    area: "بغداد · الأعظمية",
    price: "٧٥٠٫٠٠٠ د.ع / شهر",
    meta: "٢+١ · ٨٥ م² · الطابق ٢",
    rooms: "٢+١",
    areaM2: "٨٥",
    floor: "٢ / ٦",
    deal: "rent",
    category: "apartment",
    type: "شقة",
    date: "أمس",
    listingNumber: "00007",
    image: img("photo-1560185127-6ed189bf02f4"),
    images: [
      img("photo-1560185127-6ed189bf02f4"),
      img("photo-1502672260266-1c1ef2d93688"),
      img("photo-1560448204-e02f11c3d0e2"),
    ],
    description:
      "شقة في قلب الأعظمية، قريبة من جسر الأعظمية والأسواق الشعبية. مناسبة للطلبة أو الموظفين. العنوان الدقيق لا يظهر للعامة.",
    heating: "تكييف",
    furnished: "مفروش",
  },
  {
    slug: "erbil-apartment-daily-italian",
    location: { city: "erbil", district: "erbil-center", neighborhood: "ankawa", complex: "italian-village" },
    title: "شقة إيجار يومي مفروشة في القرية الإيطالية",
    area: "أربيل · القرية الإيطالية",
    price: "١٢٥٫٠٠٠ د.ع / ليلة",
    meta: "٢+١ · ٩٠ م² · مفروش",
    rooms: "٢+١",
    areaM2: "٩٠",
    floor: "٢ / ٦",
    deal: "daily",
    category: "apartment",
    type: "شقة",
    date: "اليوم",
    listingNumber: "00008",
    image: img("photo-1505693416388-ac5ce068fe85"),
    images: [
      img("photo-1505693416388-ac5ce068fe85"),
      img("photo-1560448204-e02f11c3d0e2"),
      img("photo-1522708323590-d24dbb6b0267"),
    ],
    description:
      "شقة مفروشة بالكامل للإيجار اليومي، مناسبة للعوائل والزوار. واي فاي وموقف. العنوان الدقيق لا يظهر للعامة.",
    heating: "تكييف",
    furnished: "مفروش بالكامل",
  },

  // —— بيوت مستقلة ——
  {
    slug: "erbil-house-gulan",
    location: { city: "erbil", district: "erbil-center", neighborhood: "gulan" },
    title: "بيت مستقل بحديقة في حي گولان",
    area: "أربيل · گولان",
    price: "٢٧٥٫٠٠٠٫٠٠٠ د.ع",
    meta: "٤+١ · ٢٢٠ م² · مستقل",
    rooms: "٤+١",
    areaM2: "٢٢٠",
    floor: "مستقل",
    deal: "sale",
    category: "house",
    type: "بيت مستقل",
    date: "اليوم",
    listingNumber: "00009",
    image: img("photo-1600585154340-be6161a56a0c"),
    images: [
      img("photo-1600585154340-be6161a56a0c"),
      img("photo-1600566753190-17f0baa2a6c3"),
      img("photo-1600210492486-724fe5c67fb0"),
    ],
    description:
      "بيت مستقل مع حديقة أمامية وموقف سيارتين في گولان. مناسب لعائلة متوسطة. العنوان الدقيق لا يظهر للعامة.",
    heating: "وحدات منفصلة",
    furnished: "فارغ",
  },
  {
    slug: "baghdad-house-kadhimiya",
    location: { city: "baghdad", district: "karkh", neighborhood: "kadhimiya" },
    title: "بيت تراثي محدّث في الكاظمية",
    area: "بغداد · الكاظمية",
    price: "١٩٥٫٠٠٠٫٠٠٠ د.ع",
    meta: "٣+١ · ١٨٠ م² · مستقل",
    rooms: "٣+١",
    areaM2: "١٨٠",
    floor: "مستقل",
    deal: "sale",
    category: "house",
    type: "بيت مستقل",
    date: "منذ يومين",
    listingNumber: "00010",
    image: img("photo-1600047509807-ba8f99d2cd00"),
    images: [
      img("photo-1600047509807-ba8f99d2cd00"),
      img("photo-1600585154526-990dced4db0d"),
      img("photo-1564013799919-ab600027ffc6"),
    ],
    description:
      "بيت مستقل بطابع تراثي مع ترميم حديث في الكاظمية. فناء داخلي هادئ. العنوان الدقيق لا يظهر للعامة.",
    heating: "تكييف",
    furnished: "فارغ",
  },
  {
    slug: "erbil-duplex-baharka",
    location: { city: "erbil", district: "baharka", neighborhood: "baharka-center" },
    title: "دوبلكس حديث في بهاركي",
    area: "أربيل · بهاركي",
    price: "٢٨٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٤+١ · ١٩٠ م² · دوبلكس",
    rooms: "٤+١",
    areaM2: "١٩٠",
    floor: "دوبلكس",
    deal: "sale",
    category: "house",
    type: "بيت مستقل",
    date: "منذ يومين",
    listingNumber: "00011",
    image: img("photo-1512917774080-9991f1c4c750"),
    images: [
      img("photo-1512917774080-9991f1c4c750"),
      img("photo-1600566753190-17f0baa2a6c3"),
      img("photo-1600210492486-724fe5c67fb0"),
    ],
    description:
      "دوبلكس حديث في مجمع سكني هادئ ببهاركي. حديقة صغيرة، موقف سيارتين، تشطيب ممتاز. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "فارغ",
  },
  {
    slug: "baghdad-house-rent-zayouna",
    location: { city: "baghdad", district: "madaen", neighborhood: "zayouna" },
    title: "بيت للإيجار في الزعفرانية",
    area: "بغداد · الزعفرانية",
    price: "١٫٨٠٠٫٠٠٠ د.ع / شهر",
    meta: "٤+١ · ٢٠٠ م² · مستقل",
    rooms: "٤+١",
    areaM2: "٢٠٠",
    floor: "مستقل",
    deal: "rent",
    category: "house",
    type: "بيت مستقل",
    date: "أمس",
    listingNumber: "00012",
    image: img("photo-1600585154526-990dced4db0d"),
    images: [
      img("photo-1600585154526-990dced4db0d"),
      img("photo-1600047509807-ba8f99d2cd00"),
      img("photo-1564013799919-ab600027ffc6"),
    ],
    description:
      "بيت مستقل للإيجار الشهري في الزعفرانية، حديقة وموقف. مناسب للعوائل. العنوان الدقيق لا يظهر للعامة.",
    heating: "وحدات منفصلة",
    furnished: "فارغ",
  },

  // —— قصور وفلل ——
  {
    slug: "erbil-villa-italian-village",
    location: { city: "erbil", district: "erbil-center", neighborhood: "ankawa", complex: "italian-village" },
    title: "فيلا مستقلة بحديقة في القرية الإيطالية",
    area: "أربيل · القرية الإيطالية",
    price: "٤٢٥٫٠٠٠٫٠٠٠ د.ع",
    meta: "٥+١ · ٢٨٠ م² · مستقل",
    rooms: "٥+١",
    areaM2: "٢٨٠",
    floor: "مستقل",
    deal: "sale",
    category: "villa",
    type: "فيلا",
    date: "أمس",
    listingNumber: "00013",
    image: img("photo-1600596542815-ffad4c1539a9"),
    images: [
      img("photo-1600596542815-ffad4c1539a9"),
      img("photo-1600585154340-be6161a56a0c"),
      img("photo-1600607687939-ce8a6c25118c"),
    ],
    description:
      "فيلا مستقلة مع حديقة خاصة في مجمع سكني هادئ. مواقف ومساحات خارجية. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "نصف مفروش",
  },
  {
    slug: "erbil-villa-kesnazan",
    location: { city: "erbil", district: "kesnazan", neighborhood: "kesnazan-center", complex: "green-hills" },
    title: "فيلا فاخرة في قضاء كسنزان",
    area: "أربيل · كسنزان",
    price: "٥٥٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٦+٢ · ٣٨٠ م² · مستقل",
    rooms: "٦+٢",
    areaM2: "٣٨٠",
    floor: "مستقل",
    deal: "sale",
    category: "villa",
    type: "فيلا",
    date: "منذ أسبوع",
    listingNumber: "00014",
    image: img("photo-1600607687939-ce8a6c25118c"),
    images: [
      img("photo-1600607687939-ce8a6c25118c"),
      img("photo-1600596542815-ffad4c1539a9"),
      img("photo-1600585154340-be6161a56a0c"),
    ],
    description:
      "فيلا فاخرة في مجمع سكني مغلق بكسنزان. حدائق واسعة، مسبح، مواقف متعددة. تشطيب سوبر لوكس. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "مفروش بالكامل",
  },
  {
    slug: "baghdad-villa-alwiyah",
    location: { city: "baghdad", district: "rusafa", neighborhood: "alwiyah" },
    title: "فيلا في العلوية مع مسبح وحديقة",
    area: "بغداد · العلوية",
    price: "٦٥٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٧+٢ · ٤٥٠ م² · مستقل",
    rooms: "٧+٢",
    areaM2: "٤٥٠",
    floor: "مستقل",
    deal: "sale",
    category: "villa",
    type: "فيلا",
    date: "منذ ٣ أيام",
    listingNumber: "00015",
    image: img("photo-1564013799919-ab600027ffc6"),
    images: [
      img("photo-1564013799919-ab600027ffc6"),
      img("photo-1600047509807-ba8f99d2cd00"),
      img("photo-1600585154526-990dced4db0d"),
    ],
    description:
      "فيلا فاخرة في العلوية، مسبح خاص، حديقة واسعة، غرف خدم، موقف ٣ سيارات. تشطيب إيطالي. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "نصف مفروش",
  },
  {
    slug: "baghdad-villa-zayouna",
    location: { city: "baghdad", district: "madaen", neighborhood: "zayouna" },
    title: "فيلا بطابقين في الزعفرانية",
    area: "بغداد · الزعفرانية",
    price: "٣٨٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٦+١ · ٣٢٠ م² · مستقل",
    rooms: "٦+١",
    areaM2: "٣٢٠",
    floor: "مستقل",
    deal: "sale",
    category: "villa",
    type: "فيلا",
    date: "منذ ٤ أيام",
    listingNumber: "00016",
    image: img("photo-1600566753086-00f18fb6b3ea"),
    images: [
      img("photo-1600566753086-00f18fb6b3ea"),
      img("photo-1564013799919-ab600027ffc6"),
      img("photo-1600585154340-be6161a56a0c"),
    ],
    description:
      "فيلا واسعة بطابقين مع حديقة وموقف سيارات. مناسبة لعائلة كبيرة. العنوان الدقيق لا يظهر للعامة.",
    heating: "وحدات منفصلة",
    furnished: "فارغ",
  },
  {
    slug: "erbil-villa-rent-daily",
    location: { city: "erbil", district: "kesnazan", neighborhood: "kesnazan-center", complex: "green-hills" },
    title: "فيلا إيجار يومي مع مسبح في كسنزان",
    area: "أربيل · كسنزان",
    price: "٣٥٠٫٠٠٠ د.ع / ليلة",
    meta: "٥+١ · ٣٠٠ م² · مسبح",
    rooms: "٥+١",
    areaM2: "٣٠٠",
    floor: "مستقل",
    deal: "daily",
    category: "villa",
    type: "فيلا",
    date: "اليوم",
    listingNumber: "00017",
    image: img("photo-1613490493576-7fde63acd811"),
    images: [
      img("photo-1613490493576-7fde63acd811"),
      img("photo-1600596542815-ffad4c1539a9"),
      img("photo-1600607687939-ce8a6c25118c"),
    ],
    description:
      "فيلا مفروشة للإيجار اليومي مع مسبح خاص وحديقة. مناسبة للمناسبات والعوائل. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "مفروش بالكامل",
  },

  // —— مكاتب ——
  {
    slug: "erbil-office-downtown",
    location: { city: "erbil", district: "erbil-center", neighborhood: "downtown" },
    title: "مكتب مفروش في مركز أربيل",
    area: "أربيل · وسط المدينة",
    price: "١٫٢٠٠٫٠٠٠ د.ع / شهر",
    meta: "مفتوح · ١١٠ م² · برج",
    rooms: "—",
    areaM2: "١١٠",
    floor: "٩ / ١٨",
    deal: "rent",
    category: "office",
    type: "مكتب",
    date: "منذ يومين",
    listingNumber: "00018",
    image: img("photo-1497366216548-37526070297c"),
    images: [
      img("photo-1497366216548-37526070297c"),
      img("photo-1497366811353-6870744d04b2"),
      img("photo-1486406146926-c627a92ad1ab"),
    ],
    description:
      "مكتب بمساحة مفتوحة في برج تجاري بوسط أربيل. مناسب لشركات صغيرة ومتوسطة. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "مفروش",
  },
  {
    slug: "baghdad-office-mansour",
    location: { city: "baghdad", district: "karkh", neighborhood: "mansour" },
    title: "مكتب إداري للإيجار في المنصور",
    area: "بغداد · المنصور",
    price: "٢٫٥٠٠٫٠٠٠ د.ع / شهر",
    meta: "مفتوح · ١٥٠ م² · الطابق ٤",
    rooms: "—",
    areaM2: "١٥٠",
    floor: "٤ / ٨",
    deal: "rent",
    category: "office",
    type: "مكتب",
    date: "منذ ٣ أيام",
    listingNumber: "00019",
    image: img("photo-1497366811353-6870744d04b2"),
    images: [
      img("photo-1497366811353-6870744d04b2"),
      img("photo-1497366216548-37526070297c"),
      img("photo-1486406146926-c627a92ad1ab"),
    ],
    description:
      "مكتب إداري بمساحة مفتوحة في برج المنصور التجاري. تكييف مركزي، مواقف، أمن ٢٤ ساعة. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "نصف مفروش",
  },
  {
    slug: "baghdad-office-sale-karrada",
    location: { city: "baghdad", district: "rusafa", neighborhood: "karrada", complex: "karrada-towers" },
    title: "مكتب للبيع في برج الكرادة",
    area: "بغداد · الكرادة",
    price: "٩٥٫٠٠٠٫٠٠٠ د.ع",
    meta: "مفتوح · ٨٥ م² · الطابق ١١",
    rooms: "—",
    areaM2: "٨٥",
    floor: "١١ / ٢٠",
    deal: "sale",
    category: "office",
    type: "مكتب",
    date: "منذ ٥ أيام",
    listingNumber: "00020",
    image: img("photo-1486406146926-c627a92ad1ab"),
    images: [
      img("photo-1486406146926-c627a92ad1ab"),
      img("photo-1497366216548-37526070297c"),
      img("photo-1497366811353-6870744d04b2"),
    ],
    description:
      "مكتب للتمليك في برج حديث بالكرادة. إطلالة على الشارع العام، جاهز للتسليم. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "فارغ",
  },
  {
    slug: "erbil-shop-family-mall",
    location: { city: "erbil", district: "erbil-center", neighborhood: "downtown", complex: "family-mall" },
    title: "محل تجاري في فاميلي مول أربيل",
    area: "أربيل · فاميلي مول",
    price: "٣٫٥٠٠٫٠٠٠ د.ع / شهر",
    meta: "محل · ٦٠ م² · أرضي",
    rooms: "—",
    areaM2: "٦٠",
    floor: "أرضي",
    deal: "rent",
    category: "office",
    type: "مكتب",
    date: "اليوم",
    listingNumber: "00021",
    image: img("photo-1441986300917-64674bd600d8"),
    images: [
      img("photo-1441986300917-64674bd600d8"),
      img("photo-1472851294608-062f824d29cc"),
      img("photo-1560472355-536de3962603"),
    ],
    description:
      "محل في موقع متميز داخل فاميلي مول، حركة تسوق عالية. مناسب للملابس أو الخدمات. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "فارغ",
  },

  // —— أراضي ——
  {
    slug: "erbil-land-bastora",
    location: { city: "erbil", district: "bastora", neighborhood: "bastora-road" },
    title: "أرض سكنية في طريق بستورة",
    area: "أربيل · بستورة",
    price: "٩٥٫٠٠٠٫٠٠٠ د.ع",
    meta: "أرض · ٤٠٠ م²",
    rooms: "—",
    areaM2: "٤٠٠",
    floor: "—",
    deal: "sale",
    category: "land",
    type: "أرض",
    date: "منذ أسبوع",
    listingNumber: "00022",
    image: img("photo-1500382017468-9049fed747ef"),
    images: [
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1464146072230-91cabc968266"),
      img("photo-1628624747186-a941c476b7ef"),
    ],
    description:
      "قطعة أرض سكنية على طريق بستورة، مناسبة للبناء الخاص. الموقع تقريبي للعامة فقط.",
    heating: "—",
    furnished: "—",
  },
  {
    slug: "baghdad-land-dora",
    location: { city: "baghdad", district: "karkh", neighborhood: "dora" },
    title: "أرض سكنية في الدورة قريبة من الخدمات",
    area: "بغداد · الدورة",
    price: "١٢٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "أرض · ٥٠٠ م²",
    rooms: "—",
    areaM2: "٥٠٠",
    floor: "—",
    deal: "sale",
    category: "land",
    type: "أرض",
    date: "منذ ٥ أيام",
    listingNumber: "00023",
    image: img("photo-1464146072230-91cabc968266"),
    images: [
      img("photo-1464146072230-91cabc968266"),
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1628624747186-a941c476b7ef"),
    ],
    description:
      "قطعة أرض سكنية زاوية في الدورة، واجهتان، قريبة من الطريق الرئيسي والخدمات. الموقع تقريبي للعامة فقط.",
    heating: "—",
    furnished: "—",
  },
  {
    slug: "erbil-land-qashtapa",
    location: { city: "erbil", district: "qashtapa", neighborhood: "qashtapa-road" },
    title: "أرض استثمارية على طريق قشطبة",
    area: "أربيل · قشطبة",
    price: "٢٠٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "أرض · ٦٠٠ م²",
    rooms: "—",
    areaM2: "٦٠٠",
    floor: "—",
    deal: "sale",
    category: "land",
    type: "أرض",
    date: "منذ أسبوع",
    listingNumber: "00024",
    image: img("photo-1628624747186-a941c476b7ef"),
    images: [
      img("photo-1628624747186-a941c476b7ef"),
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1464146072230-91cabc968266"),
    ],
    description:
      "أرض استثمارية على طريق قشطبة السريع، مناسبة لمشروع تجاري أو سكني. واجهة واسعة. الموقع تقريبي للعامة فقط.",
    heating: "—",
    furnished: "—",
  },
  {
    slug: "baghdad-land-abu-ghraib",
    location: { city: "baghdad", district: "abu-ghraib", neighborhood: "abu-ghraib-farms" },
    title: "أرض زراعية محوّلة في أبو غريب",
    area: "بغداد · أبو غريب",
    price: "٧٥٫٠٠٠٫٠٠٠ د.ع",
    meta: "أرض · ١٫٠٠٠ م²",
    rooms: "—",
    areaM2: "١٠٠٠",
    floor: "—",
    deal: "sale",
    category: "land",
    type: "أرض",
    date: "منذ ٤ أيام",
    listingNumber: "00025",
    image: img("photo-1500382017468-9049fed747ef"),
    images: [
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1628624747186-a941c476b7ef"),
      img("photo-1464146072230-91cabc968266"),
    ],
    description:
      "قطعة أرض واسعة في أبو غريب، مناسبة للبناء أو مشروع صغير. الموقع تقريبي للعامة فقط.",
    heating: "—",
    furnished: "—",
  },
  {
    slug: "erbil-land-rent-industrial",
    location: { city: "erbil", district: "kirkuk-road", neighborhood: "kirkuk-road-industrial" },
    title: "أرض صناعية للإيجار قرب طريق كركوك",
    area: "أربيل · طريق كركوك",
    price: "٢٫٠٠٠٫٠٠٠ د.ع / شهر",
    meta: "أرض · ٨٠٠ م²",
    rooms: "—",
    areaM2: "٨٠٠",
    floor: "—",
    deal: "rent",
    category: "land",
    type: "أرض",
    date: "منذ ٣ أيام",
    listingNumber: "00026",
    image: img("photo-1464146072230-91cabc968266"),
    images: [
      img("photo-1464146072230-91cabc968266"),
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1628624747186-a941c476b7ef"),
    ],
    description:
      "أرض صناعية للإيجار الشهري، مناسبة لمستودع أو ورشة. وصول شاحنات ميسّر. الموقع تقريبي للعامة فقط.",
    heating: "—",
    furnished: "—",
  },

  // —— بنايات ——
  {
    slug: "baghdad-building-mansour",
    location: { city: "baghdad", district: "karkh", neighborhood: "mansour" },
    title: "بناية سكنية كاملة للبيع في المنصور",
    area: "بغداد · المنصور",
    price: "١٫٢٠٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "بناية · ٨ وحدات · ٣ طوابق",
    rooms: "—",
    areaM2: "٦٠٠",
    floor: "٣ طوابق",
    deal: "sale",
    category: "building",
    type: "بناية",
    date: "منذ أسبوع",
    listingNumber: "00027",
    image: img("photo-1486406146926-c627a92ad1ab"),
    images: [
      img("photo-1486406146926-c627a92ad1ab"),
      img("photo-1493809842364-78817add7ffb"),
      img("photo-1560448204-e02f11c3d0e2"),
    ],
    description:
      "بناية سكنية مكتملة من ٣ طوابق و٨ شقق في المنصور. دخل إيجاري قائم. العنوان الدقيق لا يظهر للعامة.",
    heating: "وحدات منفصلة",
    furnished: "—",
  },
  {
    slug: "erbil-building-ankawa",
    location: { city: "erbil", district: "erbil-center", neighborhood: "ankawa" },
    title: "بناية تجارية في عنكاوا",
    area: "أربيل · عنكاوا",
    price: "٩٥٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "بناية · محال + مكاتب · ٤ طوابق",
    rooms: "—",
    areaM2: "٤٨٠",
    floor: "٤ طوابق",
    deal: "sale",
    category: "building",
    type: "بناية",
    date: "منذ ٥ أيام",
    listingNumber: "00028",
    image: img("photo-1479839672679-c595a4925106"),
    images: [
      img("photo-1479839672679-c595a4925106"),
      img("photo-1486406146926-c627a92ad1ab"),
      img("photo-1497366216548-37526070297c"),
    ],
    description:
      "بناية تجارية مختلطة في عنكاوا: محال أرضية ومكاتب في الطوابق العليا. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "—",
  },
  {
    slug: "baghdad-building-rent-karrada",
    location: { city: "baghdad", district: "rusafa", neighborhood: "karrada" },
    title: "بناية للإيجار بالكامل في الكرادة",
    area: "بغداد · الكرادة",
    price: "١٢٫٠٠٠٫٠٠٠ د.ع / شهر",
    meta: "بناية · ٥ وحدات · طابقان",
    rooms: "—",
    areaM2: "٣٥٠",
    floor: "طابقان",
    deal: "rent",
    category: "building",
    type: "بناية",
    date: "أمس",
    listingNumber: "00029",
    image: img("photo-1460317442991-0ec209397118"),
    images: [
      img("photo-1460317442991-0ec209397118"),
      img("photo-1486406146926-c627a92ad1ab"),
      img("photo-1479839672679-c595a4925106"),
    ],
    description:
      "بناية كاملة للإيجار الشهري في الكرادة، مناسبة لشركة أو مؤسسة. العنوان الدقيق لا يظهر للعامة.",
    heating: "وحدات منفصلة",
    furnished: "فارغ",
  },

  // —— مزارع ——
  {
    slug: "erbil-farm-shaqlawa",
    location: { city: "erbil", district: "shaqlawa", neighborhood: "shaqlawa-resort" },
    title: "مزرعة مثمرة قرب شقلاوة",
    area: "أربيل · شقلاوة",
    price: "٣٢٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "مزرعة · ٥ دونم · بستان",
    rooms: "—",
    areaM2: "١٢٥٠٠",
    floor: "—",
    deal: "sale",
    category: "farm",
    type: "مزرعة",
    date: "منذ أسبوع",
    listingNumber: "00030",
    image: img("photo-1500382017468-9049fed747ef"),
    images: [
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1464226184884-fa280b87c399"),
      img("photo-1625246333195-78d9c38ad449"),
    ],
    description:
      "مزرعة مثمرة قرب شقلاوة مع بيت صغير ومصدر مياه. مناسبة للاستثمار الزراعي. الموقع تقريبي للعامة فقط.",
    heating: "—",
    furnished: "—",
  },
  {
    slug: "baghdad-farm-taji",
    location: { city: "baghdad", district: "taji", neighborhood: "taji-farms" },
    title: "مزرعة دواجن ومزروعات في التاجي",
    area: "بغداد · التاجي",
    price: "١٨٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "مزرعة · ٣ دونم · منشآت",
    rooms: "—",
    areaM2: "٧٥٠٠",
    floor: "—",
    deal: "sale",
    category: "farm",
    type: "مزرعة",
    date: "منذ ٤ أيام",
    listingNumber: "00031",
    image: img("photo-1464226184884-fa280b87c399"),
    images: [
      img("photo-1464226184884-fa280b87c399"),
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1625246333195-78d9c38ad449"),
    ],
    description:
      "مزرعة جاهزة في التاجي مع حظائر ومنشآت بسيطة. مناسبة للدواجن أو الزراعة الموسمية. الموقع تقريبي للعامة فقط.",
    heating: "—",
    furnished: "—",
  },
  {
    slug: "erbil-farm-rent-koya",
    location: { city: "erbil", district: "koya", neighborhood: "koya-farms" },
    title: "مزرعة للإيجار الموسمي قرب كويه",
    area: "أربيل · كويه",
    price: "١٫٥٠٠٫٠٠٠ د.ع / شهر",
    meta: "مزرعة · ٢ دونم · بستان",
    rooms: "—",
    areaM2: "٥٠٠٠",
    floor: "—",
    deal: "rent",
    category: "farm",
    type: "مزرعة",
    date: "منذ يومين",
    listingNumber: "00032",
    image: img("photo-1625246333195-78d9c38ad449"),
    images: [
      img("photo-1625246333195-78d9c38ad449"),
      img("photo-1464226184884-fa280b87c399"),
      img("photo-1500382017468-9049fed747ef"),
    ],
    description:
      "مزرعة للإيجار الشهري قرب كويه، مناسبة للموسم الزراعي أو الاستراحات. الموقع تقريبي للعامة فقط.",
    heating: "—",
    furnished: "—",
  },

  // —— شقق إضافية ——
  {
    slug: "basra-apartment-hartha",
    location: { city: "basra", district: "basra-center", neighborhood: "hartha" },
    title: "شقة للبيع في الحرثة مطلة على شط العرب",
    area: "البصرة · الحرثة",
    price: "١٥٥٫٠٠٠٫٠٠٠ د.ع",
    meta: "٣+١ · ١٢٠ م² · الطابق ٢",
    rooms: "٣+١",
    areaM2: "١٢٠",
    floor: "٢ / ٨",
    deal: "sale",
    category: "apartment",
    type: "شقة",
    date: "اليوم",
    listingNumber: "00033",
    image: img("photo-1512917774080-9991f1c4c750"),
    images: [
      img("photo-1512917774080-9991f1c4c750"),
      img("photo-1560448204-603b3fc33ddc"),
    ],
    description:
      "شقة بإطلالة رائعة على شط العرب في الحرثة. تشطيب فاخر وموقع هادئ. العنوان الدقيق لا يظهر للعامة.",
    heating: "تكييف مركزي",
    furnished: "نصف مفروش",
  },
  {
    slug: "najaf-apartment-hay-alamal",
    location: { city: "najaf", district: "najaf-center", neighborhood: "hay-alamal" },
    title: "شقة عائلية في حي الأمل قرب الجامعات",
    area: "النجف · حي الأمل",
    price: "٩٥٫٠٠٠٫٠٠٠ د.ع",
    meta: "٢+١ · ٩٥ م² · الطابق ٤",
    rooms: "٢+١",
    areaM2: "٩٥",
    floor: "٤ / ١٠",
    deal: "sale",
    category: "apartment",
    type: "شقة",
    date: "منذ ٣ أيام",
    listingNumber: "00034",
    image: img("photo-1502672260266-1c1ef2d93688"),
    images: [
      img("photo-1502672260266-1c1ef2d93688"),
      img("photo-1522708323590-d24dbb6b0267"),
    ],
    description:
      "شقة مناسبة للعائلات في حي الأمل، قريبة من جامعة الكوفة والمستشفيات. العنوان الدقيق لا يظهر للعامة.",
    heating: "تدفئة كهربائية",
    furnished: "فارغ",
  },
  {
    slug: "karbala-apartment-alhur",
    location: { city: "karbala", district: "karbala-center", neighborhood: "alhur" },
    title: "شقة للإيجار في الحرية مطلة على الحرم",
    area: "كربلاء · الحرية",
    price: "٨٠٠٫٠٠٠ د.ع / شهر",
    meta: "٣+١ · ١٣٠ م² · الطابق ٥",
    rooms: "٣+١",
    areaM2: "١٣٠",
    floor: "٥ / ١٢",
    deal: "rent",
    category: "apartment",
    type: "شقة",
    date: "أمس",
    listingNumber: "00035",
    image: img("photo-1560448204-e02f11c3d0e2"),
    images: [
      img("photo-1560448204-e02f11c3d0e2"),
      img("photo-1493809842364-78817add7ffb"),
    ],
    description:
      "شقة فسيحة للإيجار في حي الحرية مع إطلالة جزئية على الحرم الحسيني. العنوان الدقيق لا يظهر للعامة.",
    heating: "وحدات منفصلة",
    furnished: "مفروش",
  },
  {
    slug: "kirkuk-apartment-rahmaniya",
    location: { city: "kirkuk", district: "kirkuk-center", neighborhood: "rahmaniya" },
    title: "شقة للبيع في الرحمانية بمنطقة هادئة",
    area: "كركوك · الرحمانية",
    price: "١١٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٣+١ · ١١٠ م² · الطابق ١",
    rooms: "٣+١",
    areaM2: "١١٠",
    floor: "١ / ٥",
    deal: "sale",
    category: "apartment",
    type: "شقة",
    date: "منذ أسبوع",
    listingNumber: "00036",
    image: img("photo-1493809842364-78817add7ffb"),
    images: [
      img("photo-1493809842364-78817add7ffb"),
      img("photo-1560448204-603b3fc33ddc"),
    ],
    description:
      "شقة أرضية مع حديقة صغيرة في الرحمانية. مناسبة لكبار السن أو العائلات ذات الأطفال. العنوان الدقيق لا يظهر للعامة.",
    heating: "سخانات مركزية",
    furnished: "نصف مفروش",
  },

  // —— منازل مستقلة إضافية ——
  {
    slug: "sulaymaniyah-house-sulaymaniyah-center",
    location: { city: "sulaymaniyah", district: "sulaymaniyah-center", neighborhood: "mala-rash" },
    title: "منزل تراثي للبيع في ملاراش",
    area: "السليمانية · ملاراش",
    price: "٢٨٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٥+١ · ٣٠٠ م² · طابقان",
    rooms: "٥+١",
    areaM2: "٣٠٠",
    floor: "طابقان",
    deal: "sale",
    category: "house",
    type: "منزل مستقل",
    date: "اليوم",
    listingNumber: "00037",
    image: img("photo-1518780664697-55e3ad937233"),
    images: [
      img("photo-1518780664697-55e3ad937233"),
      img("photo-1564014240135-4e9f47576c90"),
    ],
    description:
      "منزل تراثي كردي أصيل في حي ملاراش العريق. يتميز بالطراز المعماري التقليدي والحديقة الداخلية. العنوان الدقيق لا يظهر للعامة.",
    heating: "مدفأة حطب + وحدات",
    furnished: "فارغ",
  },
  {
    slug: "basra-house-alzahra",
    location: { city: "basra", district: "basra-center", neighborhood: "alzahra" },
    title: "منزل واسع للبيع في الزهراء",
    area: "البصرة · الزهراء",
    price: "٢٢٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٦+١ · ٤٠٠ م² · طابق واحد",
    rooms: "٦+١",
    areaM2: "٤٠٠",
    floor: "أرضي",
    deal: "sale",
    category: "house",
    type: "منزل مستقل",
    date: "منذ يومين",
    listingNumber: "00038",
    image: img("photo-1564014240135-4e9f47576c90"),
    images: [
      img("photo-1564014240135-4e9f47576c90"),
      img("photo-1600596542815-ffad4c1539a9"),
    ],
    description:
      "منزل عائلي واسع في حي الزهراء الراقي. حديقة أمامية وخلفية وموقف سيارات مغطى. العنوان الدقيق لا يظهر للعامة.",
    heating: "تكييف مركزي",
    furnished: "نصف مفروش",
  },
  {
    slug: "najaf-house-almishraq",
    location: { city: "najaf", district: "najaf-center", neighborhood: "almishraq" },
    title: "منزل للإيجار في المشراق للعائلات",
    area: "النجف · المشراق",
    price: "١٫٥٠٠٫٠٠٠ د.ع / شهر",
    meta: "٤+١ · ٢٠٠ م² · طابقان",
    rooms: "٤+١",
    areaM2: "٢٠٠",
    floor: "طابقان",
    deal: "rent",
    category: "house",
    type: "منزل مستقل",
    date: "أمس",
    listingNumber: "00039",
    image: img("photo-1600596542815-ffad4c1539a9"),
    images: [
      img("photo-1600596542815-ffad4c1539a9"),
      img("photo-1518780664697-55e3ad937233"),
    ],
    description:
      "منزل للإيجار الشهري في حي المشراق، مناسب للعائلات الكبيرة. ملحق خارجي ومطبخ واسع. العنوان الدقيق لا يظهر للعامة.",
    heating: "تدفئة غازية",
    furnished: "مفروش",
  },

  // —— فلل إضافية ——
  {
    slug: "erbil-villa-koya",
    location: { city: "erbil", district: "koya", neighborhood: "koya-resort" },
    title: "فيلا سياحية للبيع في كويه بإطلالة جبلية",
    area: "أربيل · كويه",
    price: "٤٥٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٤+١ · ٢٥٠ م² · طابقان + سطح",
    rooms: "٤+١",
    areaM2: "٢٥٠",
    floor: "طابقان + سطح",
    deal: "sale",
    category: "villa",
    type: "فيلا",
    date: "اليوم",
    listingNumber: "00040",
    image: img("photo-1613490493576-7fde63acd811"),
    images: [
      img("photo-1613490493576-7fde63acd811"),
      img("photo-1600585154340-be6161a56a0c"),
    ],
    description:
      "فيلا سياحية فاخرة في منتجع كويه، إطلالة بانورامية على الجبال. مسبح خاص وحديقة. العنوان الدقيق لا يظهر للعامة.",
    heating: "تدفئة أرضية",
    furnished: "مفروش بالكامل",
  },
  {
    slug: "baghdad-villa-almansour-rent",
    location: { city: "baghdad", district: "karkh", neighborhood: "mansour" },
    title: "فيلا للإيجار في المنصور - حي السفارات",
    area: "بغداد · المنصور",
    price: "٣٫٠٠٠٫٠٠٠ د.ع / شهر",
    meta: "٥+١ · ٣٥٠ م² · طابقان + قبو",
    rooms: "٥+١",
    areaM2: "٣٥٠",
    floor: "طابقان + قبو",
    deal: "rent",
    category: "villa",
    type: "فيلا",
    date: "منذ ٣ أيام",
    listingNumber: "00041",
    image: img("photo-1600585154340-be6161a56a0c"),
    images: [
      img("photo-1600585154340-be6161a56a0c"),
      img("photo-1613490493576-7fde63acd811"),
    ],
    description:
      "فيلا دبلوماسية للإيجار في حي السفارات بالمنصور. أمن عالي، مسبح، صالة رياضية. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "مفروش فاخر",
  },
  {
    slug: "sulaymaniyah-villa-qalachwalan",
    location: { city: "sulaymaniyah", district: "sulaymaniyah-center", neighborhood: "qalachwalan" },
    title: "فيلا للبيع في قلاتشوان السكني",
    area: "السليمانية · قلاتشوان",
    price: "٣٨٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "٤+١ · ٢٨٠ م² · طابقان + حديقة",
    rooms: "٤+١",
    areaM2: "٢٨٠",
    floor: "طابقان",
    deal: "sale",
    category: "villa",
    type: "فيلا",
    date: "منذ أسبوع",
    listingNumber: "00042",
    image: img("photo-1613977257592-4878e2c3b607"),
    images: [
      img("photo-1613977257592-4878e2c3b607"),
      img("photo-1600585154340-be6161a56a0c"),
    ],
    description:
      "فيلا حديثة في مجمع قلاتشوان السكني الراقي. تصميم عصري، عزل حراري ممتاز. العنوان الدقيق لا يظهر للعامة.",
    heating: "تدفئة أرضية + مكيفات",
    furnished: "نصف مفروش",
  },

  // —— مكاتب تجارية إضافية ——
  {
    slug: "basra-office-almawkil",
    location: { city: "basra", district: "basra-center", neighborhood: "almawkil" },
    title: "مكتب للبيع في الموكيل - قلب التجاري",
    area: "البصرة · الموكيل",
    price: "١٨٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "مكتب · ٨٠ م² · الطابق ٣",
    rooms: "مكتب واحد",
    areaM2: "٨٠",
    floor: "٣ / ٧",
    deal: "sale",
    category: "office",
    type: "مكتب تجاري",
    date: "اليوم",
    listingNumber: "00043",
    image: img("photo-1497366216548-37526070297c"),
    images: [
      img("photo-1497366216548-37526070297c"),
      img("photo-1504384308090-c894fccde654"),
    ],
    description:
      "مكتب تجاري في منطقة الموكيل الحيوية، مناسب لشركات الاستيراد والتصدير. العنوان الدقيق لا يظهر للعامة.",
    heating: "تكييف مركزي",
    furnished: "مفروش (مكاتب + كراسي)",
  },
  {
    slug: "kirkuk-office-alwasiti",
    location: { city: "kirkuk", district: "kirkuk-center", neighborhood: "alwasiti" },
    title: "مكتب للإيجار في الواسطي قرب الدوائر الحكومية",
    area: "كركوك · الواسطي",
    price: "٦٠٠٫٠٠٠ د.ع / شهر",
    meta: "مفتوح · ٦٠ م² · الطابق ٢",
    rooms: "مفتوح",
    areaM2: "٦٠",
    floor: "٢ / ٥",
    deal: "rent",
    category: "office",
    type: "مكتب تجاري",
    date: "أمس",
    listingNumber: "00044",
    image: img("photo-1504384308090-c894fccde654"),
    images: [
      img("photo-1504384308090-c894fccde654"),
      img("photo-1497366216548-37526070297c"),
    ],
    description:
      "مكتب مفتوح (أوبن سبيس) في منطقة الواسطي التجارية، قريب من مديرية البلدية. العنوان الدقيق لا يظهر للعامة.",
    heating: "وحدات منفصلة",
    furnished: "نصف مفروش",
  },
  {
    slug: "najaf-office-alhawish",
    location: { city: "najaf", district: "najaf-center", neighborhood: "alhawish" },
    title: "مكتب للبيع في الحويش - شارع رئيسي",
    area: "النجف · الحويش",
    price: "١٤٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "مكتبين · ١٠٠ م² · الطابق ١",
    rooms: "مكتبين",
    areaM2: "١٠٠",
    floor: "١ / ٤",
    deal: "sale",
    category: "office",
    type: "مكتب تجاري",
    date: "منذ يومين",
    listingNumber: "00045",
    image: img("photo-1497366216548-37526070297c"),
    images: [
      img("photo-1497366216548-37526070297c"),
      img("photo-1504384308090-c894fccde654"),
    ],
    description:
      "مكتبان متجاوران في الحويش على الشارع الرئيسي، واجهة زجاجية ممتازة للعرض. العنوان الدقيق لا يظهر للعامة.",
    heating: "مكيفات سبليت",
    furnished: "فارغ",
  },

  // —— أراضٍ إضافية ——
  {
    slug: "erbil-land-shaqlawa-investment",
    location: { city: "erbil", district: "shaqlawa", neighborhood: "shaqlawa-investment" },
    title: "قطعة أرض استثمارية في شقلاوة",
    area: "أربيل · شقلاوة",
    price: "٥٠٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "أرض · ٢ دونم · واجهة رئيسية",
    rooms: "—",
    areaM2: "٢٠٠٠",
    floor: "—",
    deal: "sale",
    category: "land",
    type: "قطعة أرض",
    date: "اليوم",
    listingNumber: "00046",
    image: img("photo-1500382017468-9049fed747ef"),
    images: [
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1464226184884-fa280b87c399"),
    ],
    description:
      "أرض استثمارية ممتازة في شقلاوة السياحية، واجهة على شارع رئيسي. مناسبة لمشروع سياحي أو سكني. العنوان الدقيق لا يظهر للعامة.",
    heating: "—",
    furnished: "—",
  },
  {
    slug: "baghdad-land-alradhwania",
    location: { city: "baghdad", district: "karkh", neighborhood: "alradhwania" },
    title: "أرض سكنية للبيع في الرضوانية",
    area: "بغداد · الرضوانية",
    price: "١٢٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "أرض · ٥٠٠ م² · زاوية",
    rooms: "—",
    areaM2: "٥٠٠",
    floor: "—",
    deal: "sale",
    category: "land",
    type: "قطعة أرض",
    date: "منذ ٤ أيام",
    listingNumber: "00047",
    image: img("photo-1464226184884-fa280b87c399"),
    images: [
      img("photo-1464226184884-fa280b87c399"),
      img("photo-1500382017468-9049fed747ef"),
    ],
    description:
      "قطعة أرض سكنية زاوية في الرضوانية، الخدمات متوفرة (ماء، كهرباء، مجاري). العنوان الدقيق لا يظهر للعامة.",
    heating: "—",
    furnished: "—",
  },
  {
    slug: "basra-land-alfaw",
    location: { city: "basra", district: "alfaw", neighborhood: "alfaw-industrial" },
    title: "أرض صناعية للإيجار في الفاو",
    area: "البصرة · الفاو",
    price: "٨٠٠٫٠٠٠ د.ع / شهر",
    meta: "أرض · ٥ دونم · قريبة من الميناء",
    rooms: "—",
    areaM2: "٥٠٠٠",
    floor: "—",
    deal: "rent",
    category: "land",
    type: "قطعة أرض",
    date: "أمس",
    listingNumber: "00048",
    image: img("photo-1500382017468-9049fed747ef"),
    images: [
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1464226184884-fa280b87c399"),
    ],
    description:
      "أرض صناعية للإيجار الشهري في قضاء الفاو، قريبة من ميناء أم قصر. مناسبة للمستودعات. العنوان الدقيق لا يظهر للعامة.",
    heating: "—",
    furnished: "—",
  },
  {
    slug: "sulaymaniyah-land-bakhtiar",
    location: { city: "sulaymaniyah", district: "sulaymaniyah-center", neighborhood: "bakhtiar" },
    title: "أرض للبيع في بختيار - إطلالة جبال",
    area: "السليمانية · بختيار",
    price: "٢٠٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "أرض · ١ دونم · مرتفع",
    rooms: "—",
    areaM2: "١٠٠٠",
    floor: "—",
    deal: "sale",
    category: "land",
    type: "قطعة أرض",
    date: "منذ أسبوع",
    listingNumber: "00049",
    image: img("photo-1500382017468-9049fed747ef"),
    images: [
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1464226184884-fa280b87c399"),
    ],
    description:
      "أرض سكنية في منطقة بختيار المرتفعة، إطلالة رائعة على جبال السليمانية. مخدومة بالكامل. العنوان الدقيق لا يظهر للعامة.",
    heating: "—",
    furnished: "—",
  },

  // —— عمارات إضافية ——
  {
    slug: "baghdad-building-sale-almansour",
    location: { city: "baghdad", district: "karkh", neighborhood: "mansour" },
    title: "عمارة للبيع في المنصور - استثمار مضمون",
    area: "بغداد · المنصور",
    price: "١٫٢٠٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "عمارة · ١٢ وحدة · ٤ طوابق",
    rooms: "—",
    areaM2: "٨٠٠",
    floor: "٤ طوابق",
    deal: "sale",
    category: "building",
    type: "عمارة",
    date: "اليوم",
    listingNumber: "00050",
    image: img("photo-1479839672679-c595a4925106"),
    images: [
      img("photo-1479839672679-c595a4925106"),
      img("photo-1486406146926-c627a92ad1ab"),
    ],
    description:
      "عمارة سكنية مكتملة في المنصور، ١٢ شقة مؤجرة بعقود طويلة الأجل. دخل سنوي ممتاز. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "—",
  },
  {
    slug: "erbil-building-rent-ankawa",
    location: { city: "erbil", district: "erbil-center", neighborhood: "ankawa" },
    title: "عمارة مكاتب للإيجار في عنكاوا",
    area: "أربيل · عنكاوا",
    price: "٢٠٫٠٠٠٫٠٠٠ د.ع / شهر",
    meta: "عمارة · ٨ مكاتب · ٣ طوابق",
    rooms: "—",
    areaM2: "٦٠٠",
    floor: "٣ طوابق",
    deal: "rent",
    category: "building",
    type: "عمارة",
    date: "منذ يومين",
    listingNumber: "00051",
    image: img("photo-1486406146926-c627a92ad1ab"),
    images: [
      img("photo-1486406146926-c627a92ad1ab"),
      img("photo-1479839672679-c595a4925106"),
    ],
    description:
      "عمارة مكاتب تجارية للإيجار الكامل في عنكاوا السياحية. مواقف سيارات ومصعد. العنوان الدقيق لا يظهر للعامة.",
    heating: "مركزي",
    furnished: "نصف مفروش",
  },

  // —— مزارع إضافية ——
  {
    slug: "karbala-farm-alhusayniya",
    location: { city: "karbala", district: "alhusayniya", neighborhood: "alhusayniya-farms" },
    title: "مزرعة نخيل للبيع في الحسينية",
    area: "كربلاء · الحسينية",
    price: "٣٥٠٫٠٠٠٫٠٠٠ د.ع",
    meta: "مزرعة · ١٠ دونم · بستان نخيل",
    rooms: "—",
    areaM2: "٢٥٠٠٠",
    floor: "—",
    deal: "sale",
    category: "farm",
    type: "مزرعة",
    date: "اليوم",
    listingNumber: "00052",
    image: img("photo-1625246333195-78d9c38ad449"),
    images: [
      img("photo-1625246333195-78d9c38ad449"),
      img("photo-1500382017468-9049fed747ef"),
    ],
    description:
      "مزرعة نخيل مثمرة في قضاء الحسينية، نظام ري حديث، بئر ارتوازي، بيت حارس. العنوان الدقيق لا يظهر للعامة.",
    heating: "—",
    furnished: "—",
  },
  {
    slug: "najaf-farm-kufa-rent",
    location: { city: "najaf", district: "kufa", neighborhood: "kufa-farms" },
    title: "مزرعة للإيجار الموسمي قرب الكوفة",
    area: "النجف · الكوفة",
    price: "٢٫٠٠٠٫٠٠٠ د.ع / شهر",
    meta: "مزرعة · ٤ دونم · مزروعات شتوية",
    rooms: "—",
    areaM2: "١٠٠٠٠",
    floor: "—",
    deal: "rent",
    category: "farm",
    type: "مزرعة",
    date: "منذ ٣ أيام",
    listingNumber: "00053",
    image: img("photo-1464226184884-fa280b87c399"),
    images: [
      img("photo-1464226184884-fa280b87c399"),
      img("photo-1625246333195-78d9c38ad449"),
    ],
    description:
      "مزرعة للإيجار الموسم الزراعي قرب الكوفة، تربة خصبة ومصدر مياه مضمون. العنوان الدقيق لا يظهر للعامة.",
    heating: "—",
    furnished: "—",
  },

  // —— مزارع للإيجار اليومي ——
  {
    slug: "erbil-farm-daily-shaqlawa",
    location: { city: "erbil", district: "shaqlawa", neighborhood: "shaqlawa-resort" },
    title: "مزرعة استراحة إيجار يومي في شقلاوة مع مسبح",
    area: "أربيل · شقلاوة",
    price: "٤٥٠٫٠٠٠ د.ع / ليلة",
    meta: "مزرعة · ٣ دونم · مسبح + جلسة خارجية",
    rooms: "٣+١",
    areaM2: "٧٥٠٠",
    floor: "مستقل",
    deal: "daily",
    category: "farm",
    type: "مزرعة",
    date: "اليوم",
    listingNumber: "00054",
    image: img("photo-1625246333195-78d9c38ad449"),
    images: [
      img("photo-1625246333195-78d9c38ad449"),
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1464226184884-fa280b87c399"),
    ],
    description:
      "مزرعة استراحة فاخرة للإيجار اليومي في شقلاوة السياحية. مسبح خاص، جلسة خارجية مكيفة، مطبخ مجهز، غرف نوم ٣. مناسبة للعوائل والمناسبات. موقع هادئ مع إطلالة جبلية. العنوان الدقيق لا يظهر للعامة.",
    heating: "مكيفات سبليت",
    furnished: "مفروش بالكامل",
    services: ["مسبح", "جلسة خارجية", "مطبخ مجهز", "مكيفات", "موقف سيارات", "حديقة", "حارس"],
  },
  {
    slug: "baghdad-farm-daily-abu-ghraib",
    location: { city: "baghdad", district: "abu-ghraib", neighborhood: "abu-ghraib-farms" },
    title: "مزرعة يومية للايجار في أبو غريب - استراحة عائلية",
    area: "بغداد · أبو غريب",
    price: "٣٠٠٫٠٠٠ د.ع / ليلة",
    meta: "مزرعة · ٢ دونم · مسبح + بيت ضيافة",
    rooms: "٤+١",
    areaM2: "٥٠٠٠",
    floor: "مستقل",
    deal: "daily",
    category: "farm",
    type: "مزرعة",
    date: "أمس",
    listingNumber: "00055",
    image: img("photo-1500382017468-9049fed747ef"),
    images: [
      img("photo-1500382017468-9049fed747ef"),
      img("photo-1625246333195-78d9c38ad449"),
      img("photo-1464226184884-fa280b87c399"),
    ],
    description:
      "مزرعة استراحة عائلية للإيجار اليومي في منطقة أبو غريب. مسبح خاص، بيت ضيافة بغرف ٤، مطبخ خارجي، مجلس رجال، حديقة واسعة. مناسبة للمناسبات والجلسات العائلية. قريبة من طريق بغداد - الفلوجة. العنوان الدقيق لا يظهر للعامة.",
    heating: "مكيفات",
    furnished: "مفروش بالكامل",
    services: ["مسبح", "مطبخ خارجي", "مجلس رجال", "غرف نوم", "حديقة", "موقف سيارات", "حارس"],
  },
  {
    slug: "karbala-farm-daily-alhusayniya",
    location: { city: "karbala", district: "alhusayniya", neighborhood: "alhusayniya-farms" },
    title: "مزرعة نخيل للإيجار اليومي في الحسينية - كربلاء",
    area: "كربلاء · الحسينية",
    price: "٢٥٠٫٠٠٠ د.ع / ليلة",
    meta: "مزرعة · ٥ دونم · بستان نخيل + استراحة",
    rooms: "٢+١",
    areaM2: "١٢٥٠٠",
    floor: "مستقل",
    deal: "daily",
    category: "farm",
    type: "مزرعة",
    date: "اليوم",
    listingNumber: "00056",
    image: img("photo-1464226184884-fa280b87c399"),
    images: [
      img("photo-1464226184884-fa280b87c399"),
      img("photo-1625246333195-78d9c38ad449"),
      img("photo-1500382017468-9049fed747ef"),
    ],
    description:
      "مزرعة نخيل مثمرة مع استراحة للإيجار اليومي في قضاء الحسينية قرب كربلاء. بستان نخيل واسع، استراحة بغرفتين وصالة، مطبخ، مسبح صغير، جلسة خارجية تحت النخيل. أجواء روحانية هادئة قريبة من المراقد المقدسة. مناسبة للزوار والعوائل. العنوان الدقيق لا يظهر للعامة.",
    heating: "مكيفات",
    furnished: "مفروش بالكامل",
    services: ["بستان نخيل", "مسبح", "استراحة", "مطبخ", "جلسة خارجية", "موقف سيارات", "قرب المراقد"],
  },
] as Array<Omit<SampleListing, "area"> & { area?: string }>

function finalizeListings(
  items: Array<Omit<SampleListing, "area"> & { area?: string }>
): SampleListing[] {
  return items.map((item) => {
    const rest = { ...item }
    delete rest.area
    return {
      ...rest,
      type: categoryLabels[rest.category],
      area: formatShortArea(rest.location),
      services: rest.services?.length
        ? rest.services
        : demoServicesForSlug(rest.slug),
    }
  })
}

export const sampleListings: SampleListing[] = finalizeListings(_rawListings)

export function getListingBySlug(slug: string): SampleListing | undefined {
  return sampleListings.find((item) => item.slug === slug)
}

export function isPropertyCategory(value: string): value is PropertyCategory {
  return value in categoryLabels
}

export function isDealType(value: string): value is DealType {
  return value === "sale" || value === "rent" || value === "daily"
}

export function filterListings(opts?: {
  category?: string
  deal?: string
}): SampleListing[] {
  const category =
    opts?.category && isPropertyCategory(opts.category) ? opts.category : undefined
  const deal = opts?.deal && isDealType(opts.deal) ? opts.deal : undefined

  return sampleListings.filter((item) => {
    if (category && item.category !== category) return false
    if (deal && item.deal !== deal) return false
    return true
  })
}

export function countListings(opts?: {
  category?: PropertyCategory
  deal?: DealType
}): number {
  return filterListings(opts).length
}

export function listingsPageTitle(opts?: {
  category?: string
  deal?: string
}): string {
  const category =
    opts?.category && isPropertyCategory(opts.category) ? opts.category : undefined
  const deal = opts?.deal && isDealType(opts.deal) ? opts.deal : undefined

  const typePart = category ? categoryLabels[category] : "العقارات"
  if (!deal) return category ? `${categoryMenuLabels[category]}` : "كل الإعلانات"
  if (deal === "sale") return `${typePart} للبيع`
  if (deal === "rent") return `${typePart} للإيجار`
  return `${typePart} · إيجار يومي`
}

export const categoryTree = [
  {
    label: "العقارات",
    children: (
      Object.keys(categoryMenuLabels) as PropertyCategory[]
    ).map((key) => ({
      label: categoryMenuLabels[key],
      href: `/categories/${categorySlugs[key]}`,
      count: toEnglishDigits(countListings({ category: key })),
    })),
  },
  {
    label: "خدمات",
    children: [
      { label: "كل الخدمات", href: "/services", count: "—" },
      { label: "البحث عن الوكالات", href: "/agencies", count: "—" },
      {
        label: "طلب عقار",
        href: "/dashboard/property-requests",
        count: "—",
      },
      { label: "تواصل معنا", href: "/contact", count: "—" },
    ],
  },
] as const

export const roomOptions = [
  "استوديو",
  "١+١",
  "٢+١",
  "٣+١",
  "٤+١",
  "٥+١ فأكثر",
] as const

export const buildingAgeOptions = [
  "٠ (جاهز)",
  "١–٥",
  "٦–١٠",
  "١١–١٥",
  "١٦ فأكثر",
] as const
