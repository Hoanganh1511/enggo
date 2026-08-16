"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Khung modal DUNG CHUNG cho moi form don gian trong app (tao workspace/nhom/
// series, soan bai viet nhanh...) - dung token theme (bg-surface/border-border/
// text-ink...) nen TU DOI theo light/dark, khac han TransformModal cu (mau
// "vu tru Workspace" co dinh, khong doi theme - CHI con dung cho
// WorkspaceGatewayOverlay/ControlCenterReactor/StarfieldBackground, 1 lop
// tham my rieng biet co chu dich luon toi, khong phai modal). Co san
// max-h + 1 VUNG SCROLL DUY NHAT (children) de tu xu ly content vuot muc
// (form dai, editor nhieu chu...) ma khong lam vo bo cuc modal.
export function SimpleModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxWidthClassName = "max-w-sm",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  // Thanh hanh dong CO DINH duoi cung (khong cuon theo children) - dung cho
  // form dai (composer bai viet) can nut Luu/Xuat ban luon nhin thay duoc,
  // khong bi troi mat khi cuon noi dung dai. Bo trong (form ten don gian) thi
  // nut submit nam luon trong children, cuon chung binh thuong.
  footer?: React.ReactNode;
  // Tailwind max-w-* - form ten don gian dung mac dinh (max-w-sm), form dai
  // hon (composer bai viet...) truyen rong hon qua day.
  maxWidthClassName?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100%-3rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-border bg-surface shadow-xl focus:outline-none",
            maxWidthClassName,
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-2 p-5 pb-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-bold text-ink">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-xs text-ink-faint">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Đóng"
                className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-faint hover:bg-hover-bg hover:text-ink"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            {children}
          </div>
          {footer && (
            <div className="shrink-0 border-t border-border px-5 py-4">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
