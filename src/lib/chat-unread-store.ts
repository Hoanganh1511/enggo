// External store (cung pattern useSyncExternalStore voi chat-toast-store.ts)
// dong bo tong so tin nhan CHUA DOC giua MessagesShell.tsx (nguon tinh CHINH
// XAC nhat - da co san REST + socket cap nhat real-time moi lan doc/nhan tin)
// va TopHeaderBar.tsx (chi hien badge). Ly do can store nay: header truoc
// day CHI fetch lai qua pathname doi - nhung mo/doc 1 hoi thoai khac trong
// /messages chi doi query param "?c=" (KHONG doi pathname), nen badge header
// bi "dung hinh" o so cu cho toi khi roi trang roi quay lai. MessagesShell
// bao cao gia tri moi nhat vao day moi lan unreadTotal doi, header uu tien
// dung gia tri nay (khi khac null) thay vi tu dem rieng.
let value: number | null = null; // null = chua co MessagesShell nao dang mount/bao cao
let listeners: Array<() => void> = [];

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeUnreadChatTotal(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function getUnreadChatTotalSnapshot(): number | null {
  return value;
}

export function getServerSnapshot(): number | null {
  return null;
}

export function setUnreadChatTotal(next: number) {
  if (value === next) return;
  value = next;
  emit();
}

// MessagesShell roi khoi man hinh (unmount) - tra lai quyen kiem soat cho
// header tu fetch/tang qua socket nhu binh thuong, tranh gia tri cu ket lai
// mai neu sau do co tin nhan moi ma khong con MessagesShell nao cap nhat store.
export function clearUnreadChatTotal() {
  value = null;
  emit();
}
