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
};

export function DropdownMenuContent({
  open,
  children,
  sideOffset = 6,
  ...props
}: DropdownMenuContentProps) {
  return (
    <AnimatePresence>
      {open && (
        <RadixDropdownMenu.Portal forceMount>
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
