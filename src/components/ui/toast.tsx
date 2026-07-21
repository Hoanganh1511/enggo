"use client";

import { useSyncExternalStore } from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import {
  dismissToast,
  getServerSnapshot,
  getToastsSnapshot,
  subscribeToasts,
  type ToastItem,
  type ToastVariant,
} from "@/lib/toast/toast-store";

const VARIANT_ICON: Record<ToastVariant, typeof Info> = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

const VARIANT_ACCENT: Record<ToastVariant, string> = {
  default: "text-ink-muted border-l-border",
  info: "text-primary border-l-primary",
  success: "text-success border-l-success",
  warning: "text-warning border-l-warning",
  danger: "text-danger border-l-danger",
};

function ToastCard({ item }: { item: ToastItem }) {
  const Icon = VARIANT_ICON[item.variant];
  const accent = VARIANT_ACCENT[item.variant];

  return (
    <RadixToast.Root
      duration={item.duration}
      onOpenChange={(open) => {
        if (!open) dismissToast(item.id);
      }}
      asChild
    >
      <motion.li
        layout
        initial={{ opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: 40, scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={`w-full overflow-hidden rounded-lg border border-border border-l-2 bg-surface shadow-dropdown sm:w-96 ${accent}`}
      >
        <div className="flex items-start gap-2.5 p-3">
          <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <div className="min-w-0 flex-1">
            {item.title && (
              <RadixToast.Title className="text-sm font-medium text-ink">
                {item.title}
              </RadixToast.Title>
            )}
            <RadixToast.Description className="text-xs text-ink-muted">
              {item.description}
            </RadixToast.Description>
          </div>
          <RadixToast.Close
            aria-label="Đóng thông báo"
            className="shrink-0 cursor-pointer rounded-md p-1 text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
          </RadixToast.Close>
        </div>

        {item.actions && item.actions.length > 0 && (
          <div className="flex items-center justify-end gap-2 border-t border-border px-3 py-2">
            {item.actions.map((action) => (
              <RadixToast.Action
                key={action.label}
                altText={action.label}
                asChild
                onClick={action.onClick}
              >
                <button
                  type="button"
                  className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors duration-150 ease-out hover:bg-hover-bg"
                >
                  {action.label}
                </button>
              </RadixToast.Action>
            ))}
          </div>
        )}
      </motion.li>
    </RadixToast.Root>
  );
}

export function Toaster() {
  const items = useSyncExternalStore(
    subscribeToasts,
    getToastsSnapshot,
    getServerSnapshot,
  );

  return (
    <RadixToast.Provider swipeDirection="right">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </AnimatePresence>
      <RadixToast.Viewport className="fixed bottom-0 right-0 z-100 flex w-full flex-col gap-2 p-4 sm:w-auto" />
    </RadixToast.Provider>
  );
}
