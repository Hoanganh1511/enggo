"use client";

import * as RadixHoverCard from "@radix-ui/react-hover-card";
import { AnimatePresence, motion } from "framer-motion";

export const HoverCardRoot = RadixHoverCard.Root;
export const HoverCardTrigger = RadixHoverCard.Trigger;

type HoverCardContentProps = React.ComponentProps<
  typeof RadixHoverCard.Content
> & {
  open: boolean;
};

// Cung 1 animation dropdown/popover dung chung toan app (xem CLAUDE.md) - chi
// khac Popover o cach mo (hover thay vi click), dung khi can "xem truoc nhanh"
// thay vi 1 hanh dong bam ro rang.
export function HoverCardContent({
  open,
  children,
  sideOffset = 8,
  ...props
}: HoverCardContentProps) {
  return (
    <AnimatePresence>
      {open && (
        <RadixHoverCard.Portal forceMount>
          <RadixHoverCard.Content
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
          </RadixHoverCard.Content>
        </RadixHoverCard.Portal>
      )}
    </AnimatePresence>
  );
}
