const STORAGE_KEY = "enggo:recent-colors";
const MAX_RECENT = 8;

// Danh sach mau "gan day da chon" DUNG CHUNG cho moi color picker tuy chinh
// trong app (GridCellHead, Callout, CardGrid...) - yeu cau nguoi dung: "giờ
// muốn chọn theo cái vừa xong mà phải mò lại không tiện". Luu localStorage
// (rieng tung trinh duyet, khong can dong bo server) - day la 1 tien ich
// UI/thao tac ca nhan, khac voi viec cache DU LIEU API de bo qua fetch.
export function getRecentColors(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === "string") : [];
  } catch {
    return [];
  }
}

export function addRecentColor(color: string): string[] {
  const trimmed = color.trim();
  if (typeof window === "undefined" || !trimmed) return getRecentColors();
  const next = [trimmed, ...getRecentColors().filter((c) => c.toLowerCase() !== trimmed.toLowerCase())].slice(
    0,
    MAX_RECENT,
  );
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage khong kha dung (private mode, het quota...) - bo qua, khong chan viec chon mau
  }
  return next;
}
