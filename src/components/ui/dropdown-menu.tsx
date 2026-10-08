"use client";

import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";

export const DropdownMenuRoot = RadixDropdownMenu.Root;
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger;
export const DropdownMenuItem = RadixDropdownMenu.Item;

type DropdownMenuContentProps = React.ComponentProps<
  typeof RadixDropdownMenu.Content
> & {
  open: boolean;
  // [2026-10-08] "container" - xem comment chi tiet o PopoverContent
  // (ui/popover.tsx): can khi dropdown nay nam LONG trong 1 Radix Dialog
  // khac (vd EventForm, PlannerSettingsModal) - Dialog modal dung FocusScope
  // "trapped" giut focus ve lai dialog bat ky luc nao 1 phan tu NGOAI
  // subtree cua no duoc focus; Portal mac dinh (document.body) nam NGOAI
  // subtree do nen item trong dropdown khong con bam duoc nua. Truyen
  // `container` = DOM node cua Dialog.Content de dropdown mount LAM CON cua
  // dialog thay vi document.body.
  container?: HTMLElement | null;
};

export function DropdownMenuContent({
  open,
  children,
  sideOffset = 6,
  container,
  ...props
}: DropdownMenuContentProps) {
  return (
    <AnimatePresence>
      {open && (
        <RadixDropdownMenu.Portal forceMount container={container ?? undefined}>
          <RadixDropdownMenu.Content
            forceMount
            sideOffset={sideOffset}
            asChild
            {...props}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </RadixDropdownMenu.Content>
        </RadixDropdownMenu.Portal>
      )}
    </AnimatePresence>
  );
}
