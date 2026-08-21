"use client";

import * as RadixPopover from "@radix-ui/react-popover";
import { AnimatePresence, motion } from "framer-motion";

export const PopoverRoot = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverClose = RadixPopover.Close;
// Dung khi trigger THAT (vd 1 input dang go) can tu quan ly hanh vi mo/dong
// rieng (focus, go chu...) thay vi hanh vi click-toggle mac dinh cua
// PopoverTrigger - Anchor CHI lam moc dinh vi cho PopoverContent, khong gan
// listener click/toggle nao ca.
export const PopoverAnchor = RadixPopover.Anchor;

type PopoverContentProps = React.ComponentProps<typeof RadixPopover.Content> & {
  open: boolean;
};

// Dropdown/popover kiểu click-to-open dùng chung component này để luôn đồng bộ
// animation + hành vi (anchor theo trigger, tự đóng khi click ra ngoài/nhấn Esc)
// thay vì mỗi nơi tự viết getBoundingClientRect/createPortal/mousedown listener riêng.
export function PopoverContent({
  open,
  children,
  sideOffset = 8,
  ...props
}: PopoverContentProps) {
  return (
    <AnimatePresence>
      {open && (
        <RadixPopover.Portal forceMount>
          <RadixPopover.Content forceMount sideOffset={sideOffset} asChild {...props}>
            <motion.div
              // z-50 - Portal day ra document.body nhung KHONG tu dong noi
              // len tren cac phan tu `position: relative/fixed` co z-index
              // rieng trong luong trang thuong (vd header chat dung z-10 de
              // shadow khong bi che, xem MessagesShell.tsx) - thieu z-index
              // o day khien popover bi header do "de" mat phan dau.
              className="z-50"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </RadixPopover.Content>
        </RadixPopover.Portal>
      )}
    </AnimatePresence>
  );
}
