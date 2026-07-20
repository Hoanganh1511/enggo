"use server";

import { markNotificationRead } from "@/lib/api/notifications";

// Không revalidatePath: trạng thái đã đọc chỉ ảnh hưởng riêng popover thông
// báo (tự quản lý state phía client), không liên quan gì đến canvas/cây node.
export async function markNotificationReadAction(
  notificationId: string,
  read: boolean,
) {
  return markNotificationRead(notificationId, read);
}
