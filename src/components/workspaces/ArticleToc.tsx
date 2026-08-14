"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { TocItem } from "./toc";
import { sidebarStagger, sidebarFadeUp, SidebarSectionLabel } from "./article-tab-shared";

type TocNode = TocItem & { children: TocNode[] };

function buildTocTree(flat: TocItem[]): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  for (const item of flat) {
    const node: TocNode = { ...item, children: [] };
    while (stack.length && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    if (stack.length === 0) roots.push(node);
    else stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return roots;
}

function containsActive(node: TocNode, activeId: string): boolean {
  if (node.id === activeId) return true;
  return node.children.some((c) => containsActive(c, activeId));
}

function scrollToHeading(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ArticleToc({ toc, activeId }: { toc: TocItem[]; activeId: string }) {
  const tree = useMemo(() => buildTocTree(toc), [toc]);
  const [manualOpenIds, setManualOpenIds] = useState<Record<string, boolean>>(
    {},
  );

  function toggleSection(id: string, currentlyOpen: boolean) {
    setManualOpenIds((v) => ({ ...v, [id]: !currentlyOpen }));
  }

  return (
    <div className="p-4">
      <SidebarSectionLabel>MỤC LỤC BÀI VIẾT</SidebarSectionLabel>
      {tree.length === 0 ? (
        <p
          className="py-8 text-center text-[12px]"
          style={{ color: "var(--ink-faint)" }}
        >
          Bài viết không có mục lục.
        </p>
      ) : (
        <motion.div variants={sidebarStagger} initial="hidden" animate="show">
          {tree.map((node, i) => (
            <motion.div key={node.id} variants={sidebarFadeUp}>
              <OutlineRow
                node={node}
                index={i}
                depth={0}
                activeId={activeId}
                manualOpenIds={manualOpenIds}
                onToggle={toggleSection}
                onNodeClick={scrollToHeading}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function OutlineRow({
  node,
  index,
  depth,
  activeId,
  manualOpenIds,
  onToggle,
  onNodeClick,
}: {
  node: TocNode;
  index: number;
  depth: number;
  activeId: string;
  manualOpenIds: Record<string, boolean>;
  onToggle: (id: string, currentlyOpen: boolean) => void;
  onNodeClick: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const defaultOpen = containsActive(node, activeId);
  const open = manualOpenIds[node.id] ?? defaultOpen;
  const isActive = node.id === activeId || containsActive(node, activeId);
  // Rieng thanh chi bao doc (vertical indicator, dung layoutId de truot muot
  // giua cac hang) chi gan cho dung 1 hang KHOP CHINH XAC activeId - dung
  // "isActive" (bao gom ca to tien dang mo rong chua muc active) se co the
  // co NHIEU hang cung isActive=true cung luc, vi pham yeu cau layoutId chi
  // duoc ton tai o DUY NHAT 1 phan tu tren cay tai 1 thoi diem.
  const isExactActive = node.id === activeId;
  const isTop = depth === 0;

  return (
    <div className="relative">
      {isExactActive && (
        <motion.div
          layoutId="outlineActiveBar"
          className="absolute top-1 bottom-1 left-0 w-0.75 rounded-full"
          style={{ background: "var(--primary)" }}
          transition={{ type: "spring", stiffness: 500, damping: 38 }}
        />
      )}
      <button
        type="button"
        onClick={() => {
          onNodeClick(node.id);
          if (hasChildren) onToggle(node.id, open);
        }}
        style={{
          paddingLeft: depth * 18,
          background: isActive ? "var(--active-bg)" : undefined,
          color: isActive ? "var(--primary)" : "var(--ink-faint)",
        }}
        className="group flex w-full cursor-pointer items-center gap-2.5 rounded-[9px] py-2 pr-2 text-left transition-colors duration-150 ease-out"
      >
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{
            background: isActive ? "var(--primary)" : "var(--border-strong)",
          }}
        />
        <span
          className={`min-w-0 flex-1 truncate ${isTop ? "text-[11px]" : "text-[10px]"}`}
        >
          {isTop ? `${index + 1}. ${node.text}` : node.text}
        </span>
        {hasChildren && isTop && (
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            style={{ color: "var(--ink-faint)" }}
          >
            <ChevronDown size={12} strokeWidth={1.9} />
          </motion.span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map((child, j) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: j * 0.03, duration: 0.18 }}
              >
                <OutlineRow
                  node={child}
                  index={j}
                  depth={depth + 1}
                  activeId={activeId}
                  manualOpenIds={manualOpenIds}
                  onToggle={onToggle}
                  onNodeClick={onNodeClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
