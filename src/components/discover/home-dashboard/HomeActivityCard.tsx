import Link from "next/link";
import type { ApiNotification } from "@/lib/api/types";
import {
  notificationText,
  notificationIcon,
  notificationHref,
} from "@/lib/api/notification-presenter";
import { formatRelativeTime } from "@/lib/format-time";
import { EmptyState } from "./EmptyState";

// Server Component thuan - chi Link dieu huong, khong can click-handler nao
// o client (khac ban truoc dung "use client" cho ca /home chi vi 1 khoi nay).
// formatRelativeTime chay TREN SERVER (khong con nguy co hydration mismatch
// giua gio server/client vi component nay khong hydrate).
export function HomeActivityCard({ notifications }: { notifications: ApiNotification[] }) {
  return (
    <div className="rounded-xl border border-[#edf0f4] bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold">Recent activity</h2>
      </div>
      <div className="mt-4 space-y-4">
        {notifications.length === 0 ? (
          <EmptyState message="Chưa có hoạt động nào." />
        ) : (
          notifications.slice(0, 5).map((n) => {
            const Icon = notificationIcon(n);
            const href = notificationHref(n);
            const body = (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                  <Icon size={15} aria-hidden="true" />
                </div>
                <div className="font-content min-w-0">
                  <div className="text-[12px] font-medium">{notificationText(n)}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    {formatRelativeTime(n.createdAt)}
                  </div>
                </div>
              </div>
            );
            return href ? (
              <Link key={n.id} href={href} className="block hover:opacity-80">
                {body}
              </Link>
            ) : (
              <div key={n.id}>{body}</div>
            );
          })
        )}
      </div>
    </div>
  );
}
