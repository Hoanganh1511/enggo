// Bang mau accent theo-tung-item (hash tu id) - GIU HARDCODE co chu dich,
// giong nhom "Knowledge category colors" trong spec: can vivid/on-brand va
// KHONG doi theo theme (khac voi text/border/surface phai theo token). Rut
// ra tu WorkspaceSwitcher.tsx de KnowledgeUniverseCanvas.tsx (Pixi) dung
// chung, khong lap lai thuat toan hash.
const NODE_COLORS = [
  "#8c6cff",
  "#31d9d1",
  "#f5a442",
  "#54d28d",
  "#b676ff",
  "#f0b542",
  "#34c7d8",
  "#5b9cff",
];

export function colorOf(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 997;
  return NODE_COLORS[h % NODE_COLORS.length];
}
