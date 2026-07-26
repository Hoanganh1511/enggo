import type { ReactNode } from "react";
import Link from "next/link";
import { MessageCircle, Plus, Search } from "lucide-react";
import NotificationBell from "./notification-bell";
import Logo from "../ui/logo";

const headerIconButtonClass =
  "relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover";

type TopHeaderBarProps = {
  // Nhan san <Suspense><CurrentUser/></Suspense> tu layout.tsx (Server
  // Component) thay vi tu import CurrentUser o day - vi day la "use client",
  // neu tu import va render 1 Server Component ngay trong JSX cua no thi
  // Server Component do MAT request context (headers()/cookies() ben trong
  // auth() se bao loi "outside a request scope"). Server Component chi duoc
  // compose vao Client Component qua props/children dung tu phia Server.
  accountSlot: ReactNode;
};

// Cum logo + AppSwitcherMenu chuyen tu Sidebar len day - Sidebar gio nam
// trong luong binh thuong duoi header (khong con "fixed" full-height) nen
// header khong can dong bo margin-left voi trang thai collapse cua Sidebar
// nua (da bo hoan toan logic collapse).
const TopHeaderBar = ({ accountSlot }: TopHeaderBarProps) => {
  return (
    <header className="z-10 flex h-15 shrink-0 shadow-sm items-center gap-4 px-6 bg-surface-header">
      <div className="flex shrink-0 items-center gap-1">
        <div className="flex items-center">
          <Logo orientation="icon-only" className="size-6 shrink-0" />
          <span className="ml-1 text-sm font-bold text-ink">Tree Career</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-start">
        <div className="flex h-10 w-full max-w-lg items-center gap-2 rounded-lg border border-border bg-surface px-3 text-ink-faint">
          <Search size={15} strokeWidth={1.75} className="shrink-0" />
          <input
            placeholder="Tìm kiếm các kỹ năng, con người..."
            className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-ink-faint">
            ⌘K
          </span>
        </div>
      </div>
      <div className="flex w-80 items-center justify-end gap-2">
        {/* Chat: chua co he thong nhan tin that trong app, dat placeholder de
            header co du 3 icon dung cam giac social network thay vi dashboard
            admin - noi lai vao trang /messages khi tinh nang do duoc xay. */}
        <button
          type="button"
          title="Tin nhắn (sắp ra mắt)"
          className={headerIconButtonClass}
        >
          <MessageCircle strokeWidth={1.75} className="size-4.5 2xl:size-5" />
        </button>
        <Link
          href="/home"
          title="Tạo bài viết mới"
          className={headerIconButtonClass}
        >
          <Plus strokeWidth={1.75} className="size-4.5 2xl:size-5" />
        </Link>
        <NotificationBell />
        {accountSlot}
      </div>
    </header>
  );
};

export default TopHeaderBar;
