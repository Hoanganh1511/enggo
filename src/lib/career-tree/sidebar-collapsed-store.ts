const SIDEBAR_COLLAPSED_KEY = "career-tree-sidebar-collapsed";

let listeners: Array<() => void> = [];

export function getSidebarCollapsed() {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

export function setSidebarCollapsed(value: boolean) {
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value));
  listeners.forEach((listener) => listener());
}

export function subscribeSidebarCollapsed(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function getServerSnapshot() {
  return false; // luôn mở rộng lúc SSR
}
