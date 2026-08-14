import { LoaderCircle } from "lucide-react";

// Suspense boundary tu dong cua Next.js trong luc page.tsx (Server
// Component) fetch bai viet - thay cho LoadingStages 2-giai-doan cu (gan
// voi readerPhase client-state, khong con phu hop khi day la 1 route That).
export default function Loading() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-3">
      <LoaderCircle
        size={22}
        strokeWidth={1.9}
        className="animate-spin"
        style={{ color: "var(--primary)" }}
      />
      <span className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
        Đang tải bài viết…
      </span>
    </div>
  );
}
