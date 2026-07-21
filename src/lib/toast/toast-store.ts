export type ToastVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastItem = {
  id: string;
  title?: string;
  description: string;
  variant: ToastVariant;
  duration: number;
  actions?: ToastAction[];
};

type ToastInput = {
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
  actions?: ToastAction[];
};

let toasts: ToastItem[] = [];
let listeners: Array<() => void> = [];
const EMPTY_TOASTS: ToastItem[] = [];

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeToasts(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function getToastsSnapshot(): ToastItem[] {
  return toasts;
}

export function getServerSnapshot(): ToastItem[] {
  return EMPTY_TOASTS;
}

function pushToast(input: ToastInput): string {
  const id = crypto.randomUUID();
  toasts = [
    ...toasts,
    {
      id,
      variant: "default",
      duration: 5000,
      ...input,
    },
  ];
  emit();
  return id;
}

export function dismissToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

type ToastFn = {
  (input: ToastInput): string;
  info: (
    description: string,
    opts?: Omit<ToastInput, "description" | "variant">,
  ) => string;
  success: (
    description: string,
    opts?: Omit<ToastInput, "description" | "variant">,
  ) => string;
  warning: (
    description: string,
    opts?: Omit<ToastInput, "description" | "variant">,
  ) => string;
  danger: (
    description: string,
    opts?: Omit<ToastInput, "description" | "variant">,
  ) => string;
};

export const toast = pushToast as ToastFn;
toast.info = (description, opts) =>
  pushToast({ ...opts, description, variant: "info" });
toast.success = (description, opts) =>
  pushToast({ ...opts, description, variant: "success" });
toast.warning = (description, opts) =>
  pushToast({ ...opts, description, variant: "warning" });
toast.danger = (description, opts) =>
  pushToast({ ...opts, description, variant: "danger" });
