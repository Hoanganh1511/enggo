"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import type { ApiWorkspace } from "@/lib/api/types";

type WorkspaceSwitcherProps = {
  workspace: ApiWorkspace;
  workspaces: ApiWorkspace[];
};

const WorkspaceSwitcher = ({ workspace, workspaces }: WorkspaceSwitcherProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (id: string) => {
    setOpen(false);
    if (id === workspace.id) return;
    startTransition(() => {
      router.push(`/w/${id}`);
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-wait dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {isPending && <Spinner size={14} />}
        <span className="max-w-40 truncate font-medium">{workspace.name}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.75}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full z-20 mt-2 w-56 origin-top rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
          >
            {workspaces.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => handleSelect(w.id)}
                className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-gray-900 transition-colors hover:bg-gray-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <span className="truncate">{w.name}</span>
                {w.id === workspace.id && (
                  <Check size={14} className="shrink-0 text-gray-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkspaceSwitcher;
