import Image from "next/image";
import { ImageIcon, FileText, BarChart3, CalendarDays } from "lucide-react";

const ACTIONS = [
  { icon: ImageIcon, label: "Ảnh / Video" },
  { icon: FileText, label: "Tài liệu" },
  { icon: BarChart3, label: "Thăm dò ý kiến" },
  { icon: CalendarDays, label: "Sự kiện" },
];

// Composer tinh (chua mo modal/dieu huong that - UI shell dong bo voi
// PostComposer.tsx cua feed chinh nhung KHONG dung chung component do, vi
// Community la 1 domain rieng voi bo "loai bai" khac (Tai lieu/Su kien thay
// vi Resource/Project cua feed chinh).
export function CommunityComposer({
  currentUserAvatarUrl,
}: {
  currentUserAvatarUrl: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        <Image
          src={currentUserAvatarUrl}
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover"
        />
        <button
          type="button"
          className="h-10 flex-1 cursor-pointer rounded-md bg-surface-muted px-3.5 text-left text-sm text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          Bạn đang ôn chứng chỉ nào? Hỏi gì hôm nay?
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-2.5">
        {ACTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
          >
            <Icon size={14} strokeWidth={1.75} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
