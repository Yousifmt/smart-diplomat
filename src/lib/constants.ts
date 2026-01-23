// src/lib/constants.ts

export const ROLES = ["Envoy", "Analyst", "Admin"] as const;

// ✅ دول (مع أسماء عربية)
// الأكواد ISO-3166-1 Alpha-2
export const COUNTRIES = [
  { code: "SA", name: "السعودية" },
  { code: "AE", name: "الإمارات" },
  { code: "QA", name: "قطر" },
  { code: "KW", name: "الكويت" },
  { code: "BH", name: "البحرين" },
  { code: "OM", name: "عُمان" },

  { code: "EG", name: "مصر" },
  { code: "JO", name: "الأردن" },
  { code: "LB", name: "لبنان" },
  { code: "SY", name: "سوريا" },
  { code: "IQ", name: "العراق" },

  { code: "PS", name: "فلسطين" },
  { code: "YE", name: "اليمن" },

  { code: "LY", name: "ليبيا" },
  { code: "TN", name: "تونس" },
  { code: "DZ", name: "الجزائر" },
  { code: "MA", name: "المغرب" },
  { code: "SD", name: "السودان" },
  { code: "SO", name: "الصومال" },
  { code: "DJ", name: "جيبوتي" },
  { code: "MR", name: "موريتانيا" },

  // (اختياري) دول غير عربية إذا تبغاها تظل موجودة
  { code: "US", name: "الولايات المتحدة" },
  { code: "GB", name: "المملكة المتحدة" },
  { code: "FR", name: "فرنسا" },
  { code: "DE", name: "ألمانيا" },
  { code: "CA", name: "كندا" },
  { code: "JP", name: "اليابان" },
];

// ✅ لغات (أسماء عربية)
export const LANGUAGES = [
  { code: "ar", name: "العربية" },
  { code: "en", name: "الإنجليزية" },
  { code: "fr", name: "الفرنسية" },
  { code: "de", name: "الألمانية" },
  { code: "ja", name: "اليابانية" },
];
