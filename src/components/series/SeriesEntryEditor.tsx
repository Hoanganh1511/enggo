"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Terminal,
  Link2,
  ImageIcon,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { getSeriesEntryExtensions } from "./series-entry-extensions";
import { POST_PROSE_CLASS } from "@/components/compose/post-extensions";
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
        active ? "bg-primary-soft text-primary" : "text-ink-muted hover:bg-hover-bg hover:text-ink",
      )}
    >
      <Icon size={14} strokeWidth={1.9} />
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
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

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-muted px-1.5 py-1">
      <Btn label="Tiêu đề 2" Icon={Heading2} active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <Btn label="Tiêu đề 3" Icon={Heading3} active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <div className="mx-1 h-4.5 w-px shrink-0 bg-border" />
      <Btn label="Đậm" Icon={Bold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
      <Btn label="Nghiêng" Icon={Italic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <Btn label="Code inline" Icon={Code} active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} />
      <div className="mx-1 h-4.5 w-px shrink-0 bg-border" />
      <Btn label="Danh sách chấm" Icon={List} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <Btn label="Danh sách số" Icon={ListOrdered} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <Btn label="Trích dẫn" Icon={Quote} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <Btn label="Khối code" Icon={Terminal} active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
      <Btn label="Đường kẻ" Icon={Minus} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      <div className="mx-1 h-4.5 w-px shrink-0 bg-border" />
      <Btn label="Liên kết" Icon={Link2} active={editor.isActive("link")} onClick={setLink} />
      <Btn label="Ảnh (URL)" Icon={ImageIcon} onClick={addImage} />
    </div>
  );
}

// Editor RICH cho Nội dung Entry - THAY textarea markdown tho truoc day (yeu
// cau nguoi dung: "chuyển về editor như compose bài viết"). Van luu ra
// STRING markdown (khop cot contentMarkdown that + DocsMarkdown.tsx o trang
// doc, xem series-entry-extensions.ts) qua tiptap-markdown - KHONG chuyen
// sang luu JSON Tiptap nhu Post (se phai doi ca cach Entry duoc doc/render,
// ngoai pham vi yeu cau lan nay). `value` CHI dung de KHOI TAO 1 LAN (uncontrolled
// sau do, dung Tiptap thay vi state React dieu khien tung ky tu) - doi `value`
// tu ben ngoai SAU khi mount (vd nguoi dung go) se KHONG ep lai noi dung editor.
export function SeriesEntryEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (markdown: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      ...getSeriesEntryExtensions(),
      Placeholder.configure({ placeholder: "Viết nội dung bài học tại đây..." }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: POST_PROSE_CLASS + " min-h-64 px-3 py-2.5" },
    },
    onUpdate: ({ editor }) => {
      // tiptap-markdown khong ship type khai bao (.d.ts) rieng - "markdown" o
      // day la storage do CHINH extension Markdown dang ky luc runtime, ep
      // kieu tai cho thay vi module augmentation toan cuc (chi 1 noi dung).
      const markdownStorage = editor.storage as unknown as { markdown: { getMarkdown: () => string } };
      onChange(markdownStorage.markdown.getMarkdown());
    },
  });

  if (!editor) {
    return <div className="min-h-64 rounded-lg border border-border bg-surface" />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
