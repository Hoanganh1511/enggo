"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Grid2x2 } from "lucide-react";

const AppSwitcherMenu = () => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!open) {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setPosition({ top: rect.bottom + 8, left: rect.left });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={triggerRef} className="relative">
      <button
        type="button"
        title="Chuyển đổi ứng dụng"
        onClick={handleToggle}
        className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-icon transition-colors duration-150 ease-out
           ${open ? "ring ring-primary bg-primary/15" : "hover:bg-hover-bg hover:text-icon-hover"}
          `}
      >
        <Grid2x2
          size={18}
          strokeWidth={1.75}
          className={`${open ? "text-primary" : ""}`}
        />
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  position: "fixed",
                  top: position.top,
                  left: position.left,
                }}
                className="z-50 w-48 origin-top rounded-sm border border-border bg-surface p-3 shadow-dropdown"
              >
                <p className="text-sm text-ink-faint">Upcoming</p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
};

export default AppSwitcherMenu;
