export function isArabic(): boolean {
  try {
    const lang =
      localStorage.getItem("lang") ||
      (typeof navigator !== "undefined" ? navigator.language : "en") ||
      "en";
    return lang.startsWith("ar");
  } catch {
    return false;
  }
}

export function trailerLabels() {
  const ar = isArabic();
  return {
    watch: ar ? "شاهد الإعلان" : "Watch Trailer",
    loading: ar ? "جاري التحميل..." : "Loading...",
    unavailable: ar ? "الإعلان غير متوفر" : "Trailer unavailable",
    search: ar ? "ابحث في يوتيوب" : "Search on YouTube",
    close: ar ? "إغلاق" : "Close",
  };
}
