"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Grid2x2 } from "lucide-react";

const AppSwitcherMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        title="Chuyển đổi ứng dụng"
        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <Grid2x2 size={16} strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full z-20 mt-2 w-48 origin-top rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            <p className="text-sm text-gray-400">Upcoming</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppSwitcherMenu;
