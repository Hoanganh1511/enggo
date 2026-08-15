"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  Terminal,
  Link2,
  ImageIcon,
  Table as TableIcon,
  TriangleAlert,
  OctagonAlert,
  Lightbulb,
  Undo2,
  Redo2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalloutVariant } from "./post-extensions";

function Btn({
  label,
  active,
  disabled,
  onClick,
  Icon,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  Icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-community-accent/10 text-community-accent"
          : "text-ink-muted hover:bg-hover-bg hover:text-ink",
      )}
    >
      <Icon size={16} strokeWidth={1.9} />
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

// Thanh cong cu cua editor bai viet - dinh (sticky) o dau vung soan. Nhom
// theo chuc nang: heading / inline / list / block / chen (link, anh, bang,
// callout) / undo-redo.
export function PostEditorToolbar({ editor }: { editor: Editor }) {
  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL liên kết", prev ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Dán URL ảnh (https://...)");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  // 3 chu de callout (Warning/Danger/Good tips - xem CALLOUT_LABELS trong
  // post-extensions.ts). Dang la callout NHUNG khac chu de -> doi variant tai
  // cho (khong lift roi wrap lai, tranh nhap nhay/mat vi tri con tro).
  const toggleCallout = (variant: CalloutVariant) => {
    if (editor.isActive("callout", { variant })) {
      editor.chain().focus().lift("callout").run();
    } else if (editor.isActive("callout")) {
      editor.chain().focus().updateAttributes("callout", { variant }).run();
    } else {
      editor.chain().focus().toggleWrap("callout", { variant }).run();
    }
  };

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-surface/95 px-1 py-1.5 backdrop-blur-sm">
      <Btn label="Tiêu đề 1" Icon={Heading1} active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <Btn label="Tiêu đề 2" Icon={Heading2} active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <Btn label="Tiêu đề 3" Icon={Heading3} active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <Divider />
      <Btn label="Đậm" Icon={Bold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
      <Btn label="Nghiêng" Icon={Italic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <Btn label="Gạch chân" Icon={UnderlineIcon} active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
      <Btn label="Gạch ngang" Icon={Strikethrough} active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
      <Btn label="Code inline" Icon={Code} active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} />
      <Divider />
      <Btn label="Danh sách chấm" Icon={List} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <Btn label="Danh sách số" Icon={ListOrdered} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <Btn label="Checklist" Icon={ListTodo} active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} />
      <Divider />
      <Btn label="Trích dẫn" Icon={Quote} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <Btn label="Khối code" Icon={Terminal} active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
      <Btn label="Warning" Icon={TriangleAlert} active={editor.isActive("callout", { variant: "warn" })} onClick={() => toggleCallout("warn")} />
      <Btn label="Danger" Icon={OctagonAlert} active={editor.isActive("callout", { variant: "danger" })} onClick={() => toggleCallout("danger")} />
      <Btn label="Good tips" Icon={Lightbulb} active={editor.isActive("callout", { variant: "success" })} onClick={() => toggleCallout("success")} />
      <Btn label="Đường kẻ" Icon={Minus} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      <Divider />
      <Btn label="Liên kết" Icon={Link2} active={editor.isActive("link")} onClick={setLink} />
      <Btn label="Ảnh (URL)" Icon={ImageIcon} onClick={addImage} />
      <Btn label="Bảng" Icon={TableIcon} active={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
      <Divider />
      <Btn label="Hoàn tác" Icon={Undo2} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
      <Btn label="Làm lại" Icon={Redo2} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
    </div>
  );
}
