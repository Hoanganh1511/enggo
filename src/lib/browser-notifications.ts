"use client";

// Thong bao he thong (Web Notifications API) khi nhan tin nhan MOI luc tab
// khong duoc focus - KHAC han push notification that (Service Worker + Web
// Push/VAPID, hoat dong ca khi dong han trinh duyet) ma nguoi dung khong yeu
// cau; day chi can "tab dang khong focus", pham vi dung Notification API don
// gian la du, khong can ha tang push rieng.

export function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

// "Khong focus" = tab an (chuyen tab khac/thu nho) HOAC ca cua so trinh
// duyet khong duoc focus (dang o app khac) - hop ca 2 truong hop nguoi dung
// "khong nhin thay" tin nhan moi.
function isTabUnfocused(): boolean {
  if (typeof document === "undefined") return false;
  return document.hidden || !document.hasFocus();
}

export function notifyNewChatMessage(params: {
  senderName: string;
  content: string;
  avatarUrl?: string | null;
  conversationId: string;
}) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!isTabUnfocused()) return;

  const notif = new Notification(params.senderName, {
    body: params.content,
    icon: params.avatarUrl || "/favicon.ico",
    tag: `chat-${params.conversationId}`,
  });
  notif.onclick = () => {
    window.focus();
    window.location.href = `/messages?c=${params.conversationId}`;
    notif.close();
  };
}
