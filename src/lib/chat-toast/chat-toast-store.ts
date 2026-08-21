// External store rieng cho "chong toast" tin nhan den (khac han toast-store.ts
// thuong - toast chat can GIU LAI cho den khi nguoi dung tuong tac, khong tu
// bien mat sau vai giay nhu toast binh thuong, va co the "xoe" thanh danh sach).
// Cung 1 pattern useSyncExternalStore voi toast-store.ts.
export type ChatToastItem = {
  id: string; // = Message.id, dung de dedupe
  conversationId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  preview: string;
  createdAt: string;
};

let items: ChatToastItem[] = [];
let listeners: Array<() => void> = [];
const EMPTY: ChatToastItem[] = [];
// Gioi han so item giu trong store - tranh phinh vo han neu nguoi dung
// khong tuong tac voi stack trong thoi gian dai. UI chi hien 5 item moi
// nhat trong che do "xem tat ca" du sao.
const MAX_ITEMS = 20;

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeChatToasts(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function getChatToastsSnapshot(): ChatToastItem[] {
  return items;
}

export function getServerSnapshot(): ChatToastItem[] {
  return EMPTY;
}

export function pushChatToast(item: ChatToastItem) {
  if (items.some((i) => i.id === item.id)) return;
  items = [item, ...items].slice(0, MAX_ITEMS);
  emit();
}

export function dismissChatToast(id: string) {
  items = items.filter((i) => i.id !== id);
  emit();
}

export function clearChatToasts() {
  items = [];
  emit();
}
