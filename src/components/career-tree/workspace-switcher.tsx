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

const WorkspaceSwitcher = ({
  workspace,
  workspaces,
}: WorkspaceSwitcherProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 text-sm text-ink transition-colors duration-150 ease-out disabled:cursor-wait"
      >
        {isPending && <Spinner className="size-3.5 text-ink" />}
        <span className="max-w-40 truncate text-[12px] 2xl:text-[14.5px] font-medium">
          {workspace.name}
        </span>
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
            className="absolute left-0 top-full z-20 mt-2 w-56 origin-top  rounded-sm border border-border bg-surface p-2 shadow-dropdown"
          >
            {workspaces.map((w) => {
              const isActive = w.id === workspace.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleSelect(w.id)}
                  className={`relative flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-left text-sm transition-colors duration-150 ease-out ${
                    isActive
                      ? "bg-active-bg text-ink before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-primary-dark"
                      : "text-ink hover:underline"
                  }`}
                >
                  <span className="truncate text-[12.5px]">{w.name}</span>
                  {isActive && (
                    <Check className="size-4 shrink-0 text-icon-active" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkspaceSwitcher;
