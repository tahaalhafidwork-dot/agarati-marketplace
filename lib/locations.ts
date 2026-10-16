/**
 * AGARATİ location taxonomy — Iraq marketplace.
 * Hierarchy: مدينة → قضاء → حي → مجمع سكني (اختياري)
 * Public cards show city · district · neighborhood [/ complex] — never street.
 */

export type Complex = {
  slug: string
  label: string
}

export type Neighborhood = {
  slug: string
  label: string
  complexes?: Complex[]
}

export type District = {
  slug: string
  label: string
  neighborhoods: Neighborhood[]
}

export type City = {
  slug: string
  label: string
  districts: District[]
}

export type LocationRef = {
  city: string
  district: string
  neighborhood: string
  complex?: string
  /** Override label when complex comes from DB Project, not locations.ts */
  complexLabel?: string
  /** Optional street / mahalla — shown on public detail */
  street?: string
}

export const iraqCities: City[] = [
  {
    slug: "erbil",
    label: "أربيل",
    districts: [
      {
        slug: "erbil-center",
        label: "مركز أربيل",
        neighborhoods: [
          {
            slug: "ankawa",
            label: "عنكاوا",
            complexes: [
              { slug: "italian-village", label: "القرية الإيطالية" },
              { slug: "empire-world", label: "إمباير وورلد" },
              { slug: "american-village", label: "القرية الأمريكية" },
              { slug: "royal-city", label: "رويال سيتي" },
            ],
          },
          {
            slug: "gulan",
            label: "گولان",
            complexes: [
              { slug: "gulan-towers", label: "أبراج گولان" },
              { slug: "naz-city", label: "ناز سيتي" },
            ],
          },
          {
            slug: "daratoo",
            label: "درتو",
            complexes: [
              { slug: "dream-city", label: "دريم سيتي" },
              { slug: "mr-city", label: "إم آر سيتي" },
            ],
          },
          {
            slug: "downtown",
            label: "وسط المدينة",
            complexes: [
              { slug: "family-mall", label: "فاميلي مول" },
              { slug: "majidi-mall", label: "مجيدي مول" },
            ],
          },
          {
            slug: "bakhtyari",
            label: "بختياري",
            complexes: [
              { slug: "bakhtyari-twin-towers", label: "بختياري توين تاورز" },
            ],
          },
          {
            slug: "kurdistan",
            label: "حي كردستان",
          },
          {
            slug: "ronaki",
            label: "روناكي",
          },
          {
            slug: "sharawani",
            label: "الشهيد شوراواني",
          },
          {
            slug: "mufti",
            label: "المفتي",
          },
          {
            slug: "azadi",
            label: "آزادي",
          },
        ],
      },
      {
        slug: "kesnazan",
        label: "كسنزان",
        neighborhoods: [
          {
            slug: "kesnazan-center",
            label: "مركز كسنزان",
            complexes: [
              { slug: "green-hills", label: "غرين هيلز" },
            ],
          },
          { slug: "kesnazan-east", label: "كسنزان الشرقية" },
        ],
      },
      {
        slug: "baharka",
        label: "بهاركي",
        neighborhoods: [
          {
            slug: "baharka-center",
            label: "مركز بهاركي",
            complexes: [
              { slug: "baharka-village", label: "قرية بهاركي السكنية" },
            ],
          },
          { slug: "baharka-road", label: "طريق بهاركي" },
        ],
      },
      {
        slug: "bastora",
        label: "بستورة",
        neighborhoods: [
          { slug: "bastora-road", label: "طريق بستورة" },
          { slug: "bastora-village", label: "قرية بستورة" },
        ],
      },
      {
        slug: "qashtapa",
        label: "قشطبة",
        neighborhoods: [
          { slug: "qashtapa-road", label: "طريق قشطبة" },
          { slug: "qashtapa-industrial", label: "المنطقة الصناعية" },
        ],
      },
      {
        slug: "kirkuk-road",
        label: "طريق كركوك",
        neighborhoods: [
          { slug: "kirkuk-road-main", label: "المحور الرئيسي" },
          { slug: "kirkuk-road-industrial", label: "المنطقة الصناعية" },
        ],
      },
      {
        slug: "shaqlawa",
        label: "شقلاوة",
        neighborhoods: [
          { slug: "shaqlawa-center", label: "مركز شقلاوة" },
          { slug: "shaqlawa-resort", label: "منطقة المنتجعات" },
        ],
      },
      {
        slug: "koya",
        label: "كويه",
        neighborhoods: [
          { slug: "koya-center", label: "مركز كويه" },
          { slug: "koya-farms", label: "مزارع كويه" },
        ],
      },
      {
        slug: "soran",
        label: "سوران",
        neighborhoods: [
          { slug: "soran-center", label: "مركز سوران" },
          { slug: "diana", label: "ديانا" },
        ],
      },
    ],
  },
  {
    slug: "baghdad",
    label: "بغداد",
    districts: [
      {
        slug: "karkh",
        label: "الكرخ",
        neighborhoods: [
          {
            slug: "mansour",
            label: "المنصور",
            complexes: [
              { slug: "mansour-towers", label: "أبراج المنصور" },
            ],
          },
          {
            slug: "yarmouk",
            label: "اليرموك",
          },
          { slug: "kadhimiya", label: "الكاظمية" },
          { slug: "al-hashimiya", label: "الهاشمية" },
          { slug: "al-jazira", label: "الجزيرة" },
          { slug: "al-jazair-dora", label: "الجزائر" },
          { slug: "al-hadir", label: "الحضر" },
          { slug: "zubayda", label: "زبيدة" },
          { slug: "al-khawarnaq", label: "الخورنق" },
          { slug: "bayaa", label: "البياع" },
          { slug: "muarid-al-sayarat", label: "معارض السيارات" },
          { slug: "amiriya", label: "العامرية" },
          { slug: "al-qadisiyah-amiriya", label: "القادسية" },
          { slug: "ramadan-amiriya", label: "رمضان" },
          { slug: "al-mutanabbi-amiriya", label: "المتنبي" },
          { slug: "al-yarmouk-amiriya", label: "اليرموك" },
          { slug: "al-andalus-amiriya", label: "الأندلس" },
          { slug: "al-adl", label: "العدل" },
          { slug: "al-khadraa-amiriya", label: "الخضراء" },
          { slug: "hittin", label: "حطين" },
          { slug: "al-ghazaliya", label: "الغزالية" },
          { slug: "al-janina-amiriya", label: "الجنينة" },
          { slug: "harthiya", label: "الحارثية" },
          { slug: "saydiya", label: "الصادرة" },
          { slug: "al-atibba-jihad", label: "الأطباء" },
          { slug: "al-kharijiya", label: "الخارجية" },
          { slug: "al-furat", label: "الفرات" },
          { slug: "duwr-al-mukhabarat", label: "دور المخابرات" },
          { slug: "al-alfayn", label: "الألفين" },
          { slug: "al-amana", label: "الأمانة" },
          { slug: "al-badr", label: "بدر" },
          { slug: "shaab", label: "الشعب" },
          { slug: "aur", label: "أور" },
          { slug: "al-tujjar", label: "التجار" },
          { slug: "al-bayda", label: "البيضاء" },
          { slug: "al-bustan", label: "البساتين" },
          { slug: "al-mahdi", label: "المهدي" },
          { slug: "sab-qasur", label: "سبع قصور" },
          { slug: "umm-al-kubar", label: "أم الكبر" },
          { slug: "al-ghazlan", label: "الغزلان" },
          { slug: "adhamiya", label: "الأعظمية" },
          { slug: "al-qahira-adhamiya", label: "القاهرة" },
          { slug: "al-maghrib", label: "المغرب" },
          { slug: "al-waziriya", label: "الوزيرية" },
          { slug: "al-shamasiya", label: "الشماسية" },
          { slug: "tunis", label: "تونس" },
          { slug: "al-rabi", label: "الربيع" },
          { slug: "ghazaliya", label: "الغزالية" },
          { slug: "al-hurriya", label: "الحرية" },
          { slug: "al-khatib", label: "الخطيب" },
          { slug: "al-jawadin", label: "الجوادين" },
          { slug: "al-sabiyat", label: "الصابيات" },
          { slug: "huriya-1", label: "الحرية الأولى" },
          { slug: "huriya-2", label: "الحرية الثانية" },
          { slug: "huriya-3", label: "الحرية الثالثة" },
          { slug: "al-dulayi", label: "الدولعي" },
          { slug: "al-dibas", label: "الدباش" },
          { slug: "al-rabi-huriya", label: "ربيع" },
          { slug: "muallimeen", label: "حي المعلمين" },
          { slug: "al-bustan-huriya", label: "البستان" },
          { slug: "al-salam-huriya", label: "حي السلام" },
          { slug: "al-jamiyat", label: "الجمعيات" },
          { slug: "duwr-nuwwab-al-dubbat", label: "دور نواب الضباط" },
          { slug: "duwr-al-shuun", label: "دور الشؤون" },
          { slug: "al-jadida-huriya", label: "الجديدة" },
          { slug: "al-mukhtar", label: "المختار" },
        ],
      },
      {
        slug: "rusafa",
        label: "الرصافة",
        neighborhoods: [
          {
            slug: "karrada",
            label: "الكرادة",
            complexes: [
              { slug: "karrada-towers", label: "أبراج الكرادة" },
              { slug: "palestine-street", label: "شارع فلسطين" },
            ],
          },
          {
            slug: "jadriya",
            label: "الجادرية",
            complexes: [
              { slug: "university-area", label: "منطقة الجامعات" },
            ],
          },
          { slug: "adhamiya", label: "الأعظمية" },
          {
            slug: "alwiyah",
            label: "العلوية",
            complexes: [
              { slug: "alwiyah-club", label: "نادي العلوية" },
            ],
          },
          { slug: "al-amin", label: "الأمين" },
          { slug: "al-maamoun", label: "المأمون" },
          { slug: "al-khalij-al-arabi-bjd", label: "الخليج العربي" },
          { slug: "al-khansa", label: "الخنساء" },
          { slug: "shaab", label: "الشعب" },
          { slug: "baladiyat", label: "البلديات" },
          { slug: "al-dr", label: "الدر" },
          { slug: "al-dananir", label: "الدنانير" },
          { slug: "kamaliya", label: "الكمالية" },
          { slug: "al-fadhiliya", label: "الفضيلية" },
          { slug: "al-batul", label: "البتول" },
          { slug: "al-nasr-kamaliya", label: "النصر" },
          {
            slug: "zinouna",
            label: "زيونة",
            complexes: [{ slug: "zinouna-villas", label: "فلل زيونة" }],
          },
          { slug: "al-rashid", label: "الرشيد" },
          { slug: "al-jumhuriya", label: "الجمهورية" },
          { slug: "al-kilani", label: "الكيلاني" },
          { slug: "abu-nuwas", label: "أبو نؤاس" },
          { slug: "al-sadoun", label: "السعدون" },
          { slug: "al-nidal", label: "النضال" },
          { slug: "al-idrisi", label: "الأدريسي" },
          { slug: "al-nil", label: "النيل" },
          { slug: "14-tamuz", label: "١٤ تموز" },
          { slug: "al-mustansiriya", label: "المستنصرية" },
          { slug: "al-tibb", label: "الطب" },
          { slug: "al-ulum", label: "العلوم" },
          { slug: "al-shaykh-umar", label: "الشيخ عمر" },
          { slug: "al-karkh", label: "الكرخ" },
          { slug: "al-shaykh-maaruf", label: "الشيخ معروف" },
          { slug: "al-shaykh-janid", label: "الشيخ جنيد" },
          { slug: "al-salihiya", label: "الصالحية" },
          { slug: "al-zawra", label: "الزوراء" },
          { slug: "al-tashri", label: "التشريع" },
          { slug: "al-kindi", label: "الكندي" },
          { slug: "al-janain", label: "الجنائن" },
          { slug: "akd", label: "أكد" },
          { slug: "9-nisan-gadir", label: "٩ نيسان" },
          { slug: "al-mutasim", label: "المعتصم" },
          { slug: "al-muthanna-gadir", label: "المثنى" },
          { slug: "sumer-gadir", label: "سومر" },
        ],
      },
      {
        slug: "madaen",
        label: "المدائن",
        neighborhoods: [
          { slug: "zayouna", label: "الزعفرانية" },
          { slug: "jisr-diyala", label: "جسر ديالى" },
          { slug: "al-husayniya", label: "الحسينية" },
          { slug: "bob-al-sham", label: "بوب الشام" },
          { slug: "ur", label: "أور" },
          { slug: "karrada-sharqiya", label: "الكرادة الشرقية" },
          { slug: "karrada-maryam", label: "كرادة مريم" },
        ],
      },
      {
        slug: "abu-ghraib",
        label: "أبو غريب",
        neighborhoods: [
          { slug: "abu-ghraib-center", label: "مركز أبو غريب" },
          { slug: "abu-ghraib-farms", label: "مزارع أبو غريب" },
          { slug: "al-husayniya-abu-ghraib", label: "الحسينية" },
        ],
      },
      {
        slug: "taji",
        label: "التاجي",
        neighborhoods: [
          { slug: "taji-center", label: "مركز التاجي" },
          { slug: "taji-farms", label: "مزارع التاجي" },
        ],
      },
      {
        slug: "mahmudiya",
        label: "المحمودية",
        neighborhoods: [
          { slug: "mahmudiya-center", label: "مركز المحمودية" },
        ],
      },
    ],
  },
  {
    slug: "sulaymaniyah",
    label: "السليمانية",
    districts: [
      {
        slug: "sulaymaniyah-center",
        label: "مركز السليمانية",
        neighborhoods: [
          { slug: "shurish", label: "شورش" },
          { slug: "raparin", label: "رابرين" },
          { slug: "ali-naji", label: "علي ناجي" },
          { slug: "ishty-1", label: "اشتي ١" },
          { slug: "indazyaran", label: "اندازياريان" },
          { slug: "ishty-2", label: "اشتي ٢" },
          { slug: "branan", label: "برانان" },
          { slug: "bakhan", label: "باخان" },
          { slug: "hndrin", label: "هندرين" },
          { slug: "qazi-muhammad", label: "قاضي محمد" },
          { slug: "bakhtyari", label: "بختياري" },
          { slug: "mamustayan", label: "ماموستايان" },
          { slug: "hakkari", label: "هكاري" },
          { slug: "kazra-shak-1", label: "كازرة وشك ١" },
          { slug: "shirawana", label: "شيروانة" },
          { slug: "dabashan", label: "دباشان" },
          { slug: "bakhtyari-jadida", label: "بختياري الجديدة" },
          { slug: "kazra-shak-2", label: "كازرة وشك ٢" },
          { slug: "sarchinar-1", label: "سرجنار ١" },
          { slug: "surin", label: "سورين" },
          { slug: "sarchinar-2", label: "سرجنار ٢" },
          { slug: "huruzi", label: "هرزي" },
          { slug: "badinan", label: "بادينان" },
          { slug: "shakirka", label: "شكركة" },
          { slug: "zirkta", label: "زركتة" },
          { slug: "masi-sarchinar", label: "مصي سرجنار" },
          { slug: "kani-spika", label: "كاني سبيكة" },
          { slug: "kurdsat-1", label: "كوردسات ١" },
          { slug: "kurdsat-2", label: "كوردسات ٢" },
          { slug: "sardaw", label: "سارداو" },
          { slug: "saruri", label: "سروري" },
          { slug: "zirrin", label: "زيرين" },
          { slug: "nirkiz", label: "نيركز" },
          { slug: "kuystan", label: "كويستان" },
          { slug: "farmanbran", label: "فرمانبران" },
          { slug: "bira-makrun-1", label: "بيرة مكرون ١" },
          { slug: "darkzin", label: "دركزين" },
          { slug: "shikhan", label: "شيخان" },
          { slug: "malikandi", label: "ملكندي" },
          { slug: "kurdi-joka", label: "كردي جوكة" },
          { slug: "jabal-kuwaza", label: "جبل كويزة" },
          { slug: "darugha", label: "داروغا" },
          { slug: "tui-malik", label: "توي مليك" },
          { slug: "ali-kamal", label: "علي كمال" },
          { slug: "majid-bik-1", label: "مجيد بيك ١" },
          { slug: "shahidan", label: "شهيدان" },
          { slug: "majid-bik-2", label: "مجيد بيك ٢" },
          { slug: "azadi-1", label: "آزادي ١" },
          { slug: "azadi-2", label: "آزادي ٢" },
          { slug: "azmar", label: "أزمر" },
          { slug: "salim-street", label: "شارع سالم", complexes: [{ slug: "city-center-mall", label: "سيتي سنتر" }] },
          { slug: "bakrajo", label: "بكري جو" },
          { slug: "ibrahim-ahmed", label: "إبراهيم أحمد" },
          { slug: "sarchinar", label: "سرجنار", complexes: [{ slug: "sarchinar-resort", label: "منتجع سرجنار" }] },
          { slug: "azadi-suli", label: "آزادي" },
        ],
      },
      {
        slug: "ranya",
        label: "رانية",
        neighborhoods: [{ slug: "ranya-center", label: "مركز رانية" }],
      },
      {
        slug: "halabja",
        label: "حلبجة",
        neighborhoods: [{ slug: "halabja-center", label: "مركز حلبجة" }],
      },
    ],
  },
  {
    slug: "basra",
    label: "البصرة",
    districts: [
      {
        slug: "basra-center",
        label: "مركز البصرة",
        neighborhoods: [
          { slug: "ashar", label: "العشار" },
          { slug: "jubaila", label: "الجبيلة" },
          { slug: "qibla", label: "القبلة", complexes: [{ slug: "basra-corniche", label: "كورنيش البصرة" }] },
          { slug: "manawi", label: "المناءي" },
          { slug: "five-mile", label: "الخمسة ميل" },
          { slug: "al-bakr-wa-al-ahrar", label: "البكر والأحرار" },
          { slug: "al-risala", label: "حي الرسالة" },
          { slug: "al-kifaat-basra", label: "حي الكفاءات" },
          { slug: "al-khadraa-basra", label: "حي الخضراء" },
          { slug: "dawr-al-naft", label: "دور النفط" },
          { slug: "al-baradiya", label: "البراضعية" },
          { slug: "manawi-pasha", label: "مناوي باشا" },
          { slug: "manawi-lajam", label: "مناوي لجم" },
          { slug: "al-jumhuriya-basra", label: "حي الجمهورية" },
          { slug: "al-tahsiniya", label: "التحسينية" },
          { slug: "al-abasiya", label: "منطقة العباسية" },
          { slug: "al-abla", label: "الأبلة" },
          { slug: "al-jazair-basra", label: "حي الجزائر" },
          { slug: "karma-ali", label: "كرمة علي" },
          { slug: "al-maqal", label: "المعقل" },
          { slug: "briha", label: "بريهة" },
          { slug: "al-hakimiya", label: "الحكيمية" },
          { slug: "al-tamimiya", label: "التميمية" },
          { slug: "al-jinaina", label: "الجنينة" },
          { slug: "al-tawisa", label: "الطويسة" },
          { slug: "al-najibiya", label: "النجيبية" },
          { slug: "al-mawfiqiya", label: "الموفقية" },
          { slug: "al-asmaai-al-qadim", label: "الأصمعي القديم" },
          { slug: "al-asmaai-al-jadid", label: "الأصمعي الجديد" },
          { slug: "al-jubaila-2", label: "الجبيلة" },
          { slug: "al-andalus-basra", label: "حي الأندلس" },
          { slug: "al-taliya", label: "حي الطليعة" },
          { slug: "al-khalij-al-arabi", label: "حي الخليج العربي" },
          { slug: "al-jazira-basra", label: "حي الجزيرة" },
          { slug: "al-qasim-al-shamali", label: "حي القاسم الشمالي" },
          { slug: "al-wahda-basra", label: "حي الوحدة" },
          { slug: "al-rafidayn", label: "حي الرافدين" },
          { slug: "al-simir", label: "السيمر" },
          { slug: "al-sahat", label: "منطقة الساحات" },
          { slug: "al-tuba-wa-al-nakhila", label: "الطوبة والنخيلة" },
        ],
      },
      {
        slug: "abu-al-khaseeb",
        label: "أبو الخصيب",
        neighborhoods: [
          { slug: "abu-al-khaseeb-center", label: "مركز أبو الخصيب" },
          { slug: "al-faw", label: "الفاو" },
        ],
      },
      {
        slug: "zubair",
        label: "الزبير",
        neighborhoods: [
          { slug: "zubair-center", label: "مركز الزبير" },
          { slug: "safwan", label: "سفوان" },
          { slug: "umm-qasr", label: "أم قصر" },
        ],
      },
      {
        slug: "shatt-al-arab",
        label: "شط العرب",
        neighborhoods: [
          { slug: "al-midaina", label: "المدينة" },
          { slug: "al-qurna", label: "القرنة" },
        ],
      },
    ],
  },
  {
    slug: "ninwa",
    label: "نينوى",
    districts: [
      {
        slug: "mosul",
        label: "الموصل",
        neighborhoods: [
          { slug: "al-rashidiya", label: "الرشيدية" },
          { slug: "al-arabi", label: "العربي" },
          { slug: "kokjali", label: "كوكجلي" },
          { slug: "bisan", label: "بيسان" },
          { slug: "al-malayeen", label: "الملايين" },
          { slug: "al-malayeen-2", label: "الملايين الثانية" },
          { slug: "al-bina-al-jahiz", label: "البناء الجاهز" },
          { slug: "al-kifaat", label: "الكفاءات" },
          { slug: "al-kifaat-2", label: "الكفاءات الثانية" },
          { slug: "al-baladiyat", label: "البلديات" },
          { slug: "7-nisan", label: "٧ نيسان" },
          { slug: "al-sadiq", label: "الصديق" },
          { slug: "al-kindi", label: "الكندي" },
          { slug: "al-kindi-2", label: "الكندي الثانية" },
          { slug: "al-bareed", label: "البريد" },
          { slug: "al-masaref", label: "المصارف" },
          { slug: "al-fallah-1", label: "الفلاح الأولى" },
          { slug: "al-fallah-2", label: "الفلاح الثانية" },
          { slug: "al-qahira", label: "القاهرة" },
          { slug: "al-amn", label: "الأمن" },
          { slug: "al-bunook", label: "البنوك" },
          { slug: "al-jamiya", label: "الجامعة" },
          { slug: "al-zuhour", label: "الزهور" },
          { slug: "al-muharibeen", label: "المحاربين" },
          { slug: "al-qadisiyah", label: "القادسية" },
          { slug: "al-qadisiyah-2", label: "القادسية الثانية" },
          { slug: "al-tahrir", label: "التحرير" },
          { slug: "al-ulama", label: "العلماء" },
          { slug: "al-mushraq", label: "المشراق" },
          { slug: "al-zahraa", label: "الزهراء" },
          { slug: "al-shaikhkiya", label: "الشيخكية" },
          { slug: "al-murur", label: "المرور" },
          { slug: "al-bakr", label: "البكر" },
          { slug: "al-ukhuwwa-1", label: "الإخاء الأولى" },
          { slug: "al-ukhuwwa-2", label: "الإخاء الثانية" },
          { slug: "adan", label: "عدن" },
          { slug: "al-aalam", label: "الإعلام" },
          { slug: "al-khadraa", label: "الخضراء" },
          { slug: "al-sihha", label: "الصحة" },
          { slug: "al-samah", label: "السماح" },
          { slug: "al-shuhada", label: "الشهداء" },
          { slug: "al-tamim", label: "التأميم" },
          { slug: "al-noor", label: "النور" },
          { slug: "al-jazair", label: "الجزائر" },
          { slug: "ninwa-sharqiya", label: "نينوى الشرقية" },
          { slug: "jammasa", label: "جماسة" },
          { slug: "al-nabi-yunus", label: "النبي يونس" },
          { slug: "al-numaniyah", label: "النعمانية" },
          { slug: "al-darazaliya", label: "الدركزالية" },
          { slug: "al-suways", label: "السويس" },
          { slug: "al-shurta", label: "الشرطة" },
          { slug: "al-andalus", label: "الأندلس" },
          { slug: "al-muhandisiyyin", label: "المهندسين" },
          { slug: "al-thaqafa", label: "الثقافة" },
          { slug: "al-ziraai", label: "الزراعي" },
          { slug: "al-wuzara", label: "الوزراء" },
          { slug: "al-mazaare", label: "المزارع" },
          { slug: "filastin", label: "فلسطين" },
          { slug: "sumer", label: "سومر" },
          { slug: "al-salam", label: "السلام" },
          { slug: "dumayz", label: "دوميز" },
          { slug: "al-intisar", label: "الانتصار" },
          { slug: "al-quds", label: "القدس" },
          { slug: "al-karama", label: "الكرامة" },
          { slug: "yarimja", label: "يارمجة" },
        ],
      },
      {
        slug: "tal-afar",
        label: "تلعفر",
        neighborhoods: [
          { slug: "tal-afar-center", label: "مركز تلعفر" },
          { slug: "al-nida", label: "النداء" },
          { slug: "al-uruba", label: "العروبة" },
          { slug: "al-salam-talaf", label: "السلام" },
          { slug: "al-wahda-talaf", label: "الوحدة" },
          { slug: "al-thawra-talaf", label: "الثورة" },
          { slug: "al-mansour-talaf", label: "المنصور" },
          { slug: "al-rabiya", label: "الرابية" },
        ],
      },
      {
        slug: "tilkaif",
        label: "تلكيف",
        neighborhoods: [
          { slug: "tilkaif-center", label: "مركز تلكيف" },
          { slug: "al-qosh", label: "القوش" },
          { slug: "batnaya", label: "بطنايا" },
          { slug: "telskuf", label: "تللسقف" },
          { slug: "baqofa", label: "باقوفا" },
          { slug: "baadra", label: "بادره" },
        ],
      },
      {
        slug: "sinjar",
        label: "سنجار",
        neighborhoods: [
          { slug: "sinjar-center", label: "مركز سنجار" },
          { slug: "qayrawan", label: "القيروان" },
          { slug: "shamal", label: "شمال" },
          { slug: "kursi", label: "كرسي" },
        ],
      },
      {
        slug: "baaj",
        label: "بعاج",
        neighborhoods: [
          { slug: "baaj-center", label: "مركز بعاج" },
          { slug: "qasr-ibrhim", label: "قصر إبراهيم" },
        ],
      },
      {
        slug: "hathr",
        label: "الحضر",
        neighborhoods: [
          { slug: "hathr-center", label: "مركز الحضر" },
        ],
      },
    ],
  },
  {
    slug: "kirkuk",
    label: "كركوك",
    districts: [
      {
        slug: "kirkuk-center",
        label: "مركز كركوك",
        neighborhoods: [
          { slug: "rahimawa", label: "رحيماوا" },
          { slug: "shorja", label: "الشورجة" },
          { slug: "iskan", label: "الإسكان" },
          { slug: "quriya", label: "قورية" },
          { slug: "briadi", label: "بريادي" },
          { slug: "ahmad-aga", label: "أحمد آغا" },
          { slug: "shatirlo", label: "شاطرلو" },
          { slug: "imam-qasim", label: "إمام قاسم" },
          { slug: "tepa", label: "تبه" },
          { slug: "al-mas", label: "الماس" },
          { slug: "al-qalaa-kirkuk", label: "القلعة" },
          { slug: "al-masalla", label: "المصلى" },
          { slug: "tisnin", label: "تسعين" },
          { slug: "arfa", label: "عرفة" },
          { slug: "sahat-tayaran", label: "ساحة طيران" },
          { slug: "hamza-lee", label: "حمزة لي" },
          { slug: "azadi-kirkuk", label: "آزادي" },
          { slug: "rahim-awa", label: "رحيم آوه" },
          { slug: "al-hadideen", label: "الحديديين" },
          { slug: "al-baath-kirkuk", label: "حي البعث" },
          { slug: "al-wasiti", label: "حي الواسطي" },
          { slug: "granada", label: "غرناطة" },
          { slug: "dumayz-kirkuk", label: "دوميز" },
          { slug: "wahid-azar", label: "واحد آذار" },
          { slug: "al-qadisiyah-kirkuk", label: "حي القادسية" },
          { slug: "panja-ali", label: "پنجه علي" },
          { slug: "al-mamdouda", label: "الممدودة" },
          { slug: "al-nasr-kirkuk", label: "حي النصر" },
          { slug: "al-askari-kirkuk", label: "العسكري" },
          { slug: "al-uruba-kirkuk", label: "العروبة" },
          { slug: "al-noor-kirkuk", label: "حي النور" },
          { slug: "al-muntajat", label: "حي المنتوجات" },
          { slug: "al-shuhada-kirkuk", label: "حي الشهداء" },
          { slug: "al-wahda-kirkuk", label: "حي الوحدة" },
          { slug: "al-asra-wa-al-mafqudin", label: "الأسرى والمفقودين" },
          { slug: "al-mualimeen", label: "المعلمين" },
          { slug: "al-dubbat", label: "الضباط" },
          { slug: "wahid-haziran", label: "واحد حزيران" },
          { slug: "al-khadraa-kirkuk", label: "الخضراء" },
        ],
      },
      {
        slug: "daquq",
        label: "داقوق",
        neighborhoods: [
          { slug: "daquq-center", label: "مركز داقوق" },
        ],
      },
      {
        slug: "dibis",
        label: "الدبس",
        neighborhoods: [
          { slug: "dibis-center", label: "مركز الدبس" },
        ],
      },
      {
        slug: "hawija",
        label: "الحويجة",
        neighborhoods: [
          { slug: "hawija-center", label: "مركز الحويجة" },
        ],
      },
    ],
  },
  {
    slug: "najaf",
    label: "النجف",
    districts: [
      {
        slug: "najaf-center",
        label: "مركز النجف",
        neighborhoods: [
          { slug: "old-city-najaf", label: "المدينة القديمة" },
          { slug: "new-najaf", label: "النجف الجديدة" },
          { slug: "kufa-road", label: "طريق الكوفة" },
          { slug: "al-judaydat", label: "الجديدات" },
          { slug: "al-rahma", label: "الرحمة" },
          { slug: "al-ridawaya", label: "الرضوية" },
          { slug: "al-hussein", label: "الحسين" },
          { slug: "al-ansar", label: "الأنصار" },
          { slug: "al-ghazali-najaf", label: "الغزالي" },
          { slug: "al-askari-najaf", label: "العسكري" },
          { slug: "al-muhandisiyyin-najaf", label: "المهندسين" },
          { slug: "al-mualimeen-najaf", label: "المعلمين" },
          { slug: "al-adala-najaf", label: "العدالة" },
          { slug: "al-baladiya-najaf", label: "البلدية" },
          { slug: "al-abbas-najaf", label: "العباس" },
          { slug: "al-azawiya-gharbiya", label: "العباسية الغربية" },
          { slug: "al-azawiya-sharqiya", label: "العباسية الشرقية" },
          { slug: "bab-al-najaf", label: "باب النجف" },
          { slug: "bab-turayj", label: "باب طويريج" },
          { slug: "bab-al-khan", label: "باب الخان" },
          { slug: "bab-al-taq", label: "باب الطاق" },
          { slug: "bab-baghdad", label: "باب بغداد" },
          { slug: "bab-al-salama", label: "باب السلالمة" },
          { slug: "ramadan", label: "رمضان" },
          { slug: "al-zahraa-najaf", label: "الزهراء" },
        ],
      },
      {
        slug: "kufa",
        label: "الكوفة",
        neighborhoods: [
          { slug: "kufa-center", label: "مركز الكوفة" },
          { slug: "al-thuwayya", label: "الثوية" },
          { slug: "al-jubana", label: "الجبانة" },
          { slug: "khanqin", label: "خانقين" },
          { slug: "dar-al-hakim", label: "دار الحكيم" },
          { slug: "dar-qammam-dawran", label: "دار قمام دوران" },
          { slug: "raha-amara", label: "رحا عمارة" },
          { slug: "rahbat-khunays", label: "رحبة خنيس" },
          { slug: "rasafa-al-kufa", label: "رصافة الكوفة" },
          { slug: "zarara", label: "زرارة" },
          { slug: "sahra-bardakht", label: "صحراء البردخت" },
          { slug: "al-kanasa", label: "الكناسة" },
          { slug: "abs", label: "عبس" },
          { slug: "arzim", label: "عرزم" },
          { slug: "al-sarai", label: "محلة السراي" },
          { slug: "al-rashadiya", label: "الرشادية" },
          { slug: "al-jadida-kufa", label: "الجديدة" },
          { slug: "al-sahiliya", label: "السهيلية" },
          { slug: "al-buhaydari", label: "البوحداري" },
          { slug: "al-barakiyya", label: "البراكية" },
          { slug: "kinda", label: "كندة" },
        ],
      },
    ],
  },
  {
    slug: "karbala",
    label: "كربلاء",
    districts: [
      {
        slug: "karbala-center",
        label: "مركز كربلاء",
        neighborhoods: [
          { slug: "old-city-karbala", label: "المدينة القديمة" },
          { slug: "al-hurr", label: "الحر" },
          { slug: "al-muhandiseen", label: "المهندسين" },
          { slug: "al-eskan", label: "الإسكان" },
          { slug: "al-abbas-karbala", label: "العباس" },
          { slug: "al-qazwiniya", label: "القزوينية" },
          { slug: "al-sadiya", label: "السعدية" },
          { slug: "al-ghadir", label: "الغدير" },
          { slug: "al-jamiyya", label: "الجمعية" },
          { slug: "al-ulama-karbala", label: "العلماء" },
          { slug: "al-mamlaji", label: "المعملجي" },
          { slug: "al-mualimeen-karbala", label: "المعلمين" },
          { slug: "al-naqib", label: "النقيب" },
          { slug: "al-adala-karbala", label: "العدالة" },
          { slug: "al-baladiya-karbala", label: "البلدية" },
          { slug: "14-ramadan", label: "١٤ رمضان" },
          { slug: "al-muwazifin-1", label: "الموظفين الأول" },
          { slug: "al-talib", label: "التعليب" },
          { slug: "al-sihha-karbala", label: "الصحة" },
          { slug: "al-islah", label: "الإصلاح" },
          { slug: "al-ansar-karbala", label: "الأنصار" },
          { slug: "al-usra-al-tarbawiya", label: "الأسرة التعليمية" },
          { slug: "al-hussein-karbala", label: "الحسين" },
          { slug: "al-usra", label: "الأسرة" },
          { slug: "mulhaq-al-ansar", label: "ملحق الأنصار" },
          { slug: "al-ansar-2", label: "الأنصار" },
          { slug: "al-eskann", label: "الاسكان" },
          { slug: "al-bahadiliya", label: "البهادلية" },
          { slug: "al-islah-al-ziraai", label: "الإصلاح الزراعي" },
          { slug: "al-sihha-2", label: "الصحة" },
          { slug: "al-baladiya-2", label: "البلدية" },
          { slug: "al-abbas-2", label: "العباس" },
          { slug: "al-mukhayyam", label: "المخيم" },
          { slug: "al-azawiya-al-gharbiya", label: "العباسية الغربية" },
          { slug: "al-azawiya-al-sharqiya", label: "العباسية الشرقية" },
          { slug: "bab-al-najaf-karbala", label: "باب النجف" },
          { slug: "bab-turayj-karbala", label: "باب طويريج" },
          { slug: "bab-al-khan-karbala", label: "باب الخان" },
          { slug: "bab-al-taq-karbala", label: "باب الطاق" },
          { slug: "bab-baghdad-karbala", label: "باب بغداد" },
          { slug: "bab-al-salama-karbala", label: "باب السلالمة" },
          { slug: "ramadan-karbala", label: "رمضان" },
          { slug: "al-zahraa-karbala", label: "الزهراء" },
          { slug: "al-dubbat-1", label: "الضباط" },
          { slug: "shuhada-sayf-sad", label: "شهداء سيف سعد" },
          { slug: "sayf-sad", label: "سيف سعد" },
          { slug: "al-sinaai", label: "الصناعي" },
          { slug: "al-jahiz", label: "الجاهز" },
          { slug: "al-askari-karbala", label: "العسكري" },
          { slug: "al-qadisiyah-karbala", label: "القادسية" },
          { slug: "al-nasr-karbala", label: "النصر" },
          { slug: "al-taawun-karbala", label: "التعاون" },
          { slug: "al-thawra-karbala", label: "الثورة" },
          { slug: "al-ustastha", label: "الأساتذة" },
          { slug: "al-mudira", label: "المدراء" },
          { slug: "al-tahaddi", label: "التحدي" },
          { slug: "al-jayir", label: "الجاير" },
          { slug: "al-salam-karbala", label: "السلام" },
          { slug: "al-muhandiseen-2", label: "المهندسين" },
          { slug: "al-wafa", label: "الوفاء" },
          { slug: "al-quds-karbala", label: "القدس" },
          { slug: "al-faris", label: "الفارس" },
          { slug: "al-atibba", label: "الأطباء" },
          { slug: "al-taqa", label: "الطاقة" },
          { slug: "al-uruba-1-karbala", label: "العروبة الأول" },
          { slug: "al-uruba-2-karbala", label: "العروبة الثاني" },
          { slug: "jamiya-bab-turayj", label: "جمعية باب طويريج" },
          { slug: "mulhaq-al-ansar-2", label: "ملحق الأنصار" },
          { slug: "al-hiyabi", label: "الهيابي" },
          { slug: "al-yarmouk-karbala", label: "اليرموك" },
          { slug: "al-taawun-2", label: "التعاون" },
          { slug: "al-askari-1", label: "العسكري الأول" },
          { slug: "al-askari-2", label: "العسكري الثاني" },
          { slug: "al-dubbat-2", label: "الضباط الأول" },
          { slug: "al-dubbat-3", label: "الضباط الثاني" },
          { slug: "sayf-sad-2", label: "سيف سعد" },
          { slug: "shuhada-sayf-sad-2", label: "شهداء سيف سعد" },
          { slug: "al-qadisiyah-2", label: "القادسية" },
          { slug: "al-bina-al-jahiz-karbala", label: "البناء الجاهز" },
          { slug: "al-faris-karbala", label: "الفارس" },
          { slug: "al-tahaddi-2", label: "التحدي" },
          { slug: "al-risala", label: "الرسالة" },
          { slug: "al-atibba-2", label: "الأطباء" },
          { slug: "al-salam-2", label: "السلام" },
          { slug: "al-nasr-2", label: "النصر" },
          { slug: "al-mawlid", label: "الميلاد" },
          { slug: "al-wafa-2", label: "الوفاء" },
          { slug: "al-quds-2", label: "القدس" },
          { slug: "al-itarat", label: "الإطارات" },
          { slug: "al-mudira-2", label: "المدراء" },
          { slug: "al-taawun-3", label: "التعاون" },
          { slug: "al-eskann-al-askari", label: "الإسكان العسكري" },
          { slug: "al-sujana-al-siyasiin", label: "السجناء السياسيين" },
        ],
      },
    ],
  },
]

/* —— Lookups —— */

export function getCity(slug: string): City | undefined {
  return iraqCities.find((c) => c.slug === slug)
}

export function getDistrict(
  citySlug: string,
  districtSlug: string
): District | undefined {
  return getCity(citySlug)?.districts.find((d) => d.slug === districtSlug)
}

export function getNeighborhood(
  citySlug: string,
  districtSlug: string,
  neighborhoodSlug: string
): Neighborhood | undefined {
  return getDistrict(citySlug, districtSlug)?.neighborhoods.find(
    (n) => n.slug === neighborhoodSlug
  )
}

export function getComplex(
  citySlug: string,
  districtSlug: string,
  neighborhoodSlug: string,
  complexSlug: string
): Complex | undefined {
  return getNeighborhood(citySlug, districtSlug, neighborhoodSlug)?.complexes?.find(
    (c) => c.slug === complexSlug
  )
}

export function districtsOf(citySlug: string): District[] {
  return getCity(citySlug)?.districts ?? []
}

export function neighborhoodsOf(
  citySlug: string,
  districtSlug: string
): Neighborhood[] {
  return getDistrict(citySlug, districtSlug)?.neighborhoods ?? []
}

export function complexesOf(
  citySlug: string,
  districtSlug: string,
  neighborhoodSlug: string
): Complex[] {
  return (
    getNeighborhood(citySlug, districtSlug, neighborhoodSlug)?.complexes ?? []
  )
}

/** Public label: مدينة · قضاء · حي [· مجمع] [· شارع] */
export function formatPublicArea(loc: LocationRef): string {
  const city = getCity(loc.city)
  const district = getDistrict(loc.city, loc.district)
  const neighborhood = getNeighborhood(
    loc.city,
    loc.district,
    loc.neighborhood
  )
  const complex = loc.complex
    ? getComplex(loc.city, loc.district, loc.neighborhood, loc.complex)
    : undefined

  const parts = [
    city?.label,
    district?.label,
    neighborhood?.label,
    loc.complexLabel ?? complex?.label,
    loc.street?.trim() || undefined,
  ].filter(Boolean)

  return parts.join(" · ")
}

/** Shorter card line: مدينة · حي أو مجمع */
export function formatShortArea(loc: LocationRef): string {
  const city = getCity(loc.city)?.label
  const complex =
    loc.complexLabel ??
    (loc.complex
      ? getComplex(loc.city, loc.district, loc.neighborhood, loc.complex)?.label
      : undefined)
  const neighborhood = getNeighborhood(
    loc.city,
    loc.district,
    loc.neighborhood
  )?.label

  return [city, complex ?? neighborhood].filter(Boolean).join(" · ")
}

export function cityOptions() {
  return iraqCities.map((c) => ({ value: c.slug, label: c.label }))
}

export function resolveLocation(loc: LocationRef): {
  city: City
  district: District
  neighborhood: Neighborhood
  complex?: Complex
} | null {
  const city = getCity(loc.city)
  const district = getDistrict(loc.city, loc.district)
  const neighborhood = getNeighborhood(
    loc.city,
    loc.district,
    loc.neighborhood
  )
  if (!city || !district || !neighborhood) return null
  const complex = loc.complex
    ? getComplex(loc.city, loc.district, loc.neighborhood, loc.complex)
    : undefined
  return { city, district, neighborhood, complex }
}
