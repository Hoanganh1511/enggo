// Mau dung chung cho MOI hashtag + vien the o phan "Chủ đề & Cuộc thi".
// Truoc day moi contest mang mot `accent` rieng (van con trong DB, xem
// Contest.accent) nen luoi the ra nhieu mau khac nhau - gio thong nhat 1 mau
// de danh sach nhin lien mach. Field `accent` giu lai trong schema/seed
// nhung KHONG con duoc doc de to mau nua.
export const CONTEST_ACCENT = "#5193c6";

// Dung chung giua ContestCard va FeaturedContestBanner - tranh dinh nghia lai
// 2 lan cung 1 cong thuc format.
export function formatDeadline(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} tháng ${d.getMonth() + 1}`;
}
