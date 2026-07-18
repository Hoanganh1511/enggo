// Fallback bắt buộc của Next.js Parallel Routes: nếu 1 route con nào đó chưa
// có page riêng cho slot @topbar (vd trong lúc soft-navigation ở 1 vài edge
// case), Next.js cần default.tsx này để không báo 404 cho cả slot.
export default function TopbarDefault() {
  return null;
}
