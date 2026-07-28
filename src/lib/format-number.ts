// Rut gon so lon: 12400 -> "12.4K". Dung cho follower/following/post count
// tren profile va cac card gioi thieu nguoi dung.
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
