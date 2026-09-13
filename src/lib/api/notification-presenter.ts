import { UserPlus, type LucideIcon } from "lucide-react";
import type { ApiNotification } from "./types";

// Domain logic cua Notification (dien giai text/icon/link tu 1 ApiNotification)
// - tach rieng khoi component hien thi (NotificationsPanel.tsx,
// home-dashboard/HomeActivityCard.tsx) de KHONG copy-paste lai moi lan co man
// hinh moi can render notification. Truoc day con 3 loai GROUP_COLLAB_* (yeu
// cau cong tac nhom kien thuc) - da bo cung tinh nang Workspace/KnowledgeGroup
// (2026-09-14), gio chi con FOLLOW.
export function notificationText(n: ApiNotification): string {
  const actorName = n.actor?.name ?? "Một người dùng";
  switch (n.type) {
    case "FOLLOW":
      return `${actorName} đã theo dõi bạn`;
    default:
      return "Bạn có 1 thông báo mới";
  }
}

export function notificationIcon(_n: ApiNotification): LucideIcon {
  return UserPlus;
}

export function notificationHref(n: ApiNotification): string | undefined {
  return n.actor?.username ? `/u/${n.actor.username}` : undefined;
}
