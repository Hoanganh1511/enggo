"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Search } from "lucide-react";
import {
  getServerSnapshot,
  getSidebarCollapsed,
  subscribeSidebarCollapsed,
} from "@/lib/career-tree/sidebar-collapsed-store";
import NotificationBell from "./notification-bell";

type TopHeaderBarProps = {
  // Nhan san <Suspense><CurrentUser/></Suspense> tu layout.tsx (Server
  // Component) thay vi tu import CurrentUser o day - vi day la "use client",
  // neu tu import va render 1 Server Component ngay trong JSX cua no thi
  // Server Component do MAT request context (headers()/cookies() ben trong
  // auth() se bao loi "outside a request scope"). Server Component chi duoc
  // compose vao Client Component qua props/children dung tu phia Server.
  accountSlot: ReactNode;
};

// Sidebar gio la "fixed inset-y-0 left-0" (cot doc full chieu cao, khong con
// nam trong luong flex chung voi header) - Header phai tu chua margin-left
// bang dung chieu rong hien tai cua Sidebar de khong bi de len, VA margin
// nay phai doi theo dung luc Sidebar thu gon/mo rong (cung doc chung 1
// isCollapsed tu sidebar-collapsed-store, dong bo voi MainContentArea.tsx -
// ca 3 noi deu doc chung 1 nguon de khong bao gio lech nhau).
const TopHeaderBar = ({ accountSlot }: TopHeaderBarProps) => {
  const isCollapsed = useSyncExternalStore(
    subscribeSidebarCollapsed,
    getSidebarCollapsed,
    getServerSnapshot,
  );

  return (
    <header
      className={`z-10 flex h-15 shrink-0 shadow-sm items-center px-6 transition-[margin] duration-200 bg-white ${
        isCollapsed ? "ml-16" : "ml-66"
      }`}
    >
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
        <NotificationBell />
        {accountSlot}
      </div>
    </header>
  );
};

export default TopHeaderBar;
