import { Construction } from "lucide-react";

// Fallback cho cac muc nav Admin CHUA lam noi dung rieng (Thanh vien/Kenh &
// Danh muc/Noi dung ghim/Tai lieu & Link/Su kien/Thong ke/Cai dat cong dong)
// - pham vi lan nay chi tap trung "Tong quan" va "Yeu cau tham gia" (2 man
// hinh co trong thiet ke tham khao), lam du ca 9 trang quan tri vuot xa 1
// lan yeu cau. Nav van bam duoc (doi active state that), chi noi dung con
// lai chua co.
export function CommunityAdminPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 py-4 pl-6 text-center">
      <Construction size={28} strokeWidth={1.5} className="text-ink-faint" />
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="max-w-xs text-xs text-ink-faint">
        Màn hình này chưa được xây dựng trong lần thiết kế này.
      </p>
    </div>
  );
}
