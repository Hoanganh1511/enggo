import { LoaderCircle } from "lucide-react";
import { WorkspaceAsideSkeleton } from "@/components/workspaces/WorkspaceAsideSkeleton";

// Suspense boundary tu dong cua Next.js trong luc page.tsx (Server
// Component) fetch bai viet. Dung DUNG khung card (rounded-[13px] +
// backdrop-blur-md + gap-3 giua 2 cot) nhu ArticleReaderPane.tsx that su -
// truoc day chi la spinner tran giua man hinh (khong card), khien luc dieu
// huong (vd tu dong mo bai moi nhat sau khi chon 1 nhom) card cua
// WorkspaceMain/GroupArticleToc "tat" roi spinner tran nay "bat" roi card
// that cua ArticleReaderPane lai "bat" tiep - 3 trang thai nhin khac han
// nhau lien tiep, gay cam giac nhay/flicker. Giu cung khung ca 3 buoc de chi
// con NOI DUNG ben trong doi (loading -> that), khung card khong doi vi tri/
// hinh dang.
export default function Loading() {
  return (
    <div className="relative flex min-h-0 flex-1 gap-3">
      <div
        className="shadow-panel relative flex min-w-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden rounded-[13px] backdrop-blur-md"
        style={{
          border: "1px solid var(--border)",
          background: "color-mix(in srgb, var(--surface) 82%, transparent)",
        }}
      >
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

      <WorkspaceAsideSkeleton />
    </div>
  );
}
