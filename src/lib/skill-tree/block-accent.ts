// Mau "danh tinh" rieng cho tung Knowledge Block (icon/vien/progress bar) -
// KHAC voi mau status (status van dung getStatusStyle rieng cho tu "trang
// thai" - mastered/healthy/...). Nhieu block co the cung 1 status (vd 2 block
// deu "growing") nhung phai co mau nhan dien khac nhau de khong bi lac giua
// cac card trong luoi.
const ACCENT_PALETTE = [
  "#10b981", // emerald
  "#38bdf8", // sky
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#22d3ee", // cyan
];

// Dung orderIndex (thu tu tao Category trong workspace) thay vi hash id -
// dam bao KHONG TRUNG mau giua cac block mien la workspace co <= so mau
// trong bang (6). Hash theo id van co the trung ngau nhien du id khac nhau
// hoan toan (vd 2 category rieng biet cung ra chung 1 mau) - orderIndex
// tuan tu tranh duoc dieu do cho truong hop pho bien nhat.
export function getBlockAccentColor(
  orderIndex: number,
  categoryColor?: string | null,
): string {
  if (categoryColor) return categoryColor;
  const index =
    ((orderIndex % ACCENT_PALETTE.length) + ACCENT_PALETTE.length) %
    ACCENT_PALETTE.length;
  return ACCENT_PALETTE[index];
}
