import { Rocket } from "lucide-react";

// Dat o "/home" chu khong phai "/" - "/" da la landing page cong khai
// (marketing, khong yeu cau dang nhap, xem proxy.ts PUBLIC_PATHS). Day la
// placeholder cho "Trang chu" that su sau khi Career Tree canvas duoc tach
// ra route rieng ("/career-tree").
export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-icon-active">
        <Rocket size={22} strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">Trang chủ</p>
        <p className="mt-1 text-sm text-ink-faint">Sắp ra mắt.</p>
      </div>
    </div>
  );
}
