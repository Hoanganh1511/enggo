const AVATAR_PALETTE = [
  "#10b981",
  "#38bdf8",
  "#8b5cf6",
  "#f59e0b",
  "#f43f5e",
  "#22d3ee",
];

// Mau avatar-chu-cai on dinh theo ten (khong co anh that) - cung 1 nguoi
// luon ra cung 1 mau moi lan render, khac nguoi khac phan lon thoi gian.
export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
