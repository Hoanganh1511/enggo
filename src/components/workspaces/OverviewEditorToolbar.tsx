"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Btn({
  label,
  active,
  onClick,
  Icon,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  Icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out",
        active
          ? "bg-community-accent/10 text-community-accent"
          : "text-ink-muted hover:bg-hover-bg hover:text-ink",
      )}
    >
      <Icon size={14} strokeWidth={1.9} />
    </button>
  );
}

// Thanh cong cu HAN CHE cho editor "tong quan noi dung" - CHI 4 nut (dung
// getOverviewExtensions(), khong co heading/blockquote/code/link/... nen
// khong can toolbar day du nhu PostEditorToolbar).
export function OverviewEditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex items-center gap-0.5 border-b border-border px-1 py-1">
      <Btn label="Đậm" Icon={Bold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
      <Btn label="Nghiêng" Icon={Italic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <Btn label="Danh sách chấm" Icon={List} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <Btn label="Danh sách số" Icon={ListOrdered} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
    </div>
  );
}
