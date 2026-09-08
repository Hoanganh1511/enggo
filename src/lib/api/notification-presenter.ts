import { MessageCircle, UserPlus, type LucideIcon } from "lucide-react";
import type { ApiNotification } from "./types";

// Domain logic cua Notification (dien giai text/icon/link tu 1 ApiNotification)
// - tach rieng khoi component hien thi (NotificationsPanel.tsx,
// home-dashboard/HomeActivityCard.tsx) de KHONG copy-paste lai moi lan co man
// hinh moi can render notification (truoc day 2 noi tu viet lai cung 1 logic
// nay).
export function notificationText(n: ApiNotification): string {
  const actorName = n.actor?.name ?? "Một người dùng";
  const groupName = n.group?.name ?? "1 nhóm kiến thức";
  switch (n.type) {
    case "GROUP_COLLAB_REQUESTED":
      return `${actorName} muốn cộng tác vào "${groupName}"`;
    case "GROUP_COLLAB_APPROVED":
      return `Yêu cầu cộng tác vào "${groupName}" đã được duyệt`;
    case "GROUP_COLLAB_REJECTED":
      return `Yêu cầu cộng tác vào "${groupName}" đã bị từ chối`;
    case "FOLLOW":
      return `${actorName} đã theo dõi bạn`;
    default:
      return "Bạn có 1 thông báo mới";
  }
}

export function notificationIcon(n: ApiNotification): LucideIcon {
  return n.type === "FOLLOW" ? UserPlus : MessageCircle;
}

export function notificationHref(n: ApiNotification): string | undefined {
  if (n.type === "FOLLOW") {
    return n.actor?.username ? `/u/${n.actor.username}` : undefined;
  }
  if (!n.group?.ownerUsername) return undefined;
  return `/workspace/${n.group.ownerUsername}/${n.group.workspaceId}`;
}
