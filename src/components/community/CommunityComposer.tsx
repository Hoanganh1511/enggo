"use client";

import { useRef, useState, useTransition } from "react";
import { createChannelPostAction } from "@/actions/community/create-channel-post";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  X,
  Trophy,
  HelpCircle,
  BookOpen,
  BarChart3,
  Code2,
  GitBranch,
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link2,
  Quote,
  List,
  ListOrdered,
  IndentIncrease,
  IndentDecrease,
  Undo2,
  Redo2,
  ChevronDown,
  Upload,
  Check,
  Globe2,
  Hash,
  Info,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Avatar placeholder cho "nguoi dang dang nhap" - mock nay chua co API auth
// gan voi trang Community nen chua the lay anh that, dung pravatar lam anh
// trang tri (giong cach FeaturedSeriesBanner.tsx dung MEMBER_AVATARS).
const CURRENT_USER_AVATAR_URL =
  "https://i.pravatar.cc/64?u=community-composer-current-user";

const MAIN_CATEGORIES = [
  {
    key: "learning",
    label: "Learning Update",
    icon: Trophy,
    className:
      "border-community-accent/20 bg-community-accent/10 text-community-accent",
  },
  {
    key: "question",
    label: "Question",
    icon: HelpCircle,
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  {
    key: "resource",
    label: "Resource",
    icon: BookOpen,
    className: "border-success/20 bg-success/10 text-success",
  },
  {
    key: "poll",
    label: "Poll",
    icon: BarChart3,
    className: "border-warning/20 bg-warning/10 text-warning",
  },
  {
    key: "code",
    label: "Code",
    icon: Code2,
    className: "border-border bg-surface-muted text-ink-muted",
  },
  {
    key: "mindmap",
    label: "Mind Map",
    icon: GitBranch,
    className: "border-border bg-surface-muted text-ink-muted",
  },
] as const;

type CategoryKey = (typeof MAIN_CATEGORIES)[number]["key"];

function CategoryPill({
  label,
  icon: Icon,
  className,
  active,
  onClick,
}: {
  label: string;
  icon: typeof Trophy;
  className: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all duration-150 ease-out",
        className,
        active && "ring-2 ring-current ring-offset-1 ring-offset-surface",
      )}
    >
      <Icon size={13} strokeWidth={2.25} />
      {label}
    </button>
  );
}

function ToolbarButton({
  label,
  isActive,
  disabled,
  onClick,
  icon: Icon,
}: {
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: typeof Bold;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40",
        isActive
          ? "bg-community-accent/10 text-community-accent"
          : "text-ink-muted hover:bg-hover-bg hover:text-ink",
      )}
    >
      <Icon size={15} strokeWidth={2} />
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px shrink-0 bg-border" />;
}

// Modal "Dang bai" - mo tu nut "Đăng bài" trong group action o CommunityChatView.tsx
// (thay cho composer dinh o cuoi kenh truoc day). Editor dinh dang that dung
// @tiptap/react (giong pattern EditorPane.tsx), vung keo-tha file, goi y "Gan
// voi Learning Node", chon Category, hang nut Cong khai/Luu nhap/Dang bai.
// TAT CA la UI shell (chua co API dang bai/tai file/gan node that o Community) -
// "Dang bai"/"Luu nhap" chi reset form roi dong modal, khong luu len server.
export function CommunityComposer({
  open,
  onOpenChange,
  channelId,
  slug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  slug: string;
}) {
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [nodeLinked, setNodeLinked] = useState(true);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Chia sẻ kiến thức, bài học hoặc tài liệu hữu ích...",
      }),
      Link.configure({ openOnClick: false }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-32 text-sm text-ink leading-relaxed focus:outline-none " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
          "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-ink-muted " +
          "[&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs " +
          "[&_a]:text-community-accent [&_a]:underline " +
          "[&_p.is-editor-empty:first-child::before]:text-ink-faint [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none",
      },
    },
  });

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list).map((f) => f.name)]);
  }

  function submitAndClose() {
    if (!editor) return;
    startTransition(async () => {
      await createChannelPostAction(channelId, slug, {
        content: editor.getText(),
        category: category ?? undefined,
      });
      editor.commands.clearContent();
      setCategory(null);
      setFiles([]);
      onOpenChange(false);
    });
  }

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[calc(100%-3rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-2xl border-2 border-community-accent/30 bg-surface p-4 shadow-xl focus:outline-none"
        >
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <Image
                src={CURRENT_USER_AVATAR_URL}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
              <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-success" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <Dialog.Title className="sr-only">Đăng bài mới</Dialog.Title>
                <div className="min-h-32 min-w-0 flex-1 cursor-text pt-1.5">
                  <EditorContent editor={editor} />
                </div>

                <div className="flex shrink-0 items-center gap-2 pt-1">
                  <span className="hidden items-center gap-1 text-xs text-ink-faint sm:flex">
                    Markdown hỗ trợ
                    <Info size={12} strokeWidth={2} />
                  </span>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Đóng"
                      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-community-accent/10 text-community-accent hover:bg-community-accent/20"
                    >
                      <X size={16} strokeWidth={2.25} />
                    </button>
                  </Dialog.Close>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-0.5 border-t border-border pt-2">
                <ToolbarButton
                  label="Đậm"
                  isActive={!!editor?.isActive("bold")}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  icon={Bold}
                />
                <ToolbarButton
                  label="Nghiêng"
                  isActive={!!editor?.isActive("italic")}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  icon={Italic}
                />
                <ToolbarButton
                  label="Gạch ngang"
                  isActive={!!editor?.isActive("strike")}
                  onClick={() => editor?.chain().focus().toggleStrike().run()}
                  icon={Strikethrough}
                />
                <ToolbarButton
                  label="Code"
                  isActive={!!editor?.isActive("code")}
                  onClick={() => editor?.chain().focus().toggleCode().run()}
                  icon={Code}
                />
                <ToolbarButton
                  label="Link"
                  isActive={!!editor?.isActive("link")}
                  onClick={setLink}
                  icon={Link2}
                />
                <ToolbarButton
                  label="Trích dẫn"
                  isActive={!!editor?.isActive("blockquote")}
                  onClick={() =>
                    editor?.chain().focus().toggleBlockquote().run()
                  }
                  icon={Quote}
                />

                <ToolbarDivider />

                <ToolbarButton
                  label="Danh sách chấm"
                  isActive={!!editor?.isActive("bulletList")}
                  onClick={() =>
                    editor?.chain().focus().toggleBulletList().run()
                  }
                  icon={List}
                />
                <ToolbarButton
                  label="Danh sách số"
                  isActive={!!editor?.isActive("orderedList")}
                  onClick={() =>
                    editor?.chain().focus().toggleOrderedList().run()
                  }
                  icon={ListOrdered}
                />
                <ToolbarButton
                  label="Thụt vào"
                  isActive={false}
                  disabled={!editor?.can().sinkListItem("listItem")}
                  onClick={() =>
                    editor?.chain().focus().sinkListItem("listItem").run()
                  }
                  icon={IndentIncrease}
                />
                <ToolbarButton
                  label="Thụt ra"
                  isActive={false}
                  disabled={!editor?.can().liftListItem("listItem")}
                  onClick={() =>
                    editor?.chain().focus().liftListItem("listItem").run()
                  }
                  icon={IndentDecrease}
                />

                <ToolbarDivider />

                <ToolbarButton
                  label="Hoàn tác"
                  isActive={false}
                  disabled={!editor?.can().undo()}
                  onClick={() => editor?.chain().focus().undo().run()}
                  icon={Undo2}
                />
                <ToolbarButton
                  label="Làm lại"
                  isActive={false}
                  disabled={!editor?.can().redo()}
                  onClick={() => editor?.chain().focus().redo().run()}
                  icon={Redo2}
                />
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    addFiles(e.dataTransfer.files);
                  }}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors duration-150 ease-out",
                    isDraggingOver
                      ? "border-community-accent bg-community-accent/5"
                      : "border-border",
                  )}
                >
                  <Upload
                    size={18}
                    strokeWidth={2}
                    className="text-community-accent"
                  />
                  <p className="text-sm text-ink-muted">
                    Kéo &amp; thả file vào đây hoặc{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer font-semibold text-community-accent hover:underline"
                    >
                      click để tải lên
                    </button>
                  </p>
                  <p className="text-xs text-ink-faint">
                    Hỗ trợ: PDF, PNG, JPG, GIF, MP4 (tối đa 20MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.mp4"
                  />
                  {files.length > 0 && (
                    <ul className="mt-1 flex w-full flex-col gap-0.5 text-left text-xs text-ink-muted">
                      {files.map((f, i) => (
                        <li key={i} className="truncate">
                          📎 {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="shrink-0 rounded-xl border border-community-accent/20 bg-community-accent/5 p-3 sm:w-56">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-community-accent">
                      <GitBranch size={13} strokeWidth={2.25} />
                      Gắn với Learning Node
                    </p>
                    <span className="shrink-0 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                      Khuyến nghị
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNodeLinked((v) => !v)}
                    className="mt-2 flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface p-2 text-left transition-colors duration-150 ease-out hover:bg-hover-bg"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-community-accent/10 text-community-accent">
                      <GitBranch size={14} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">
                        IAM Policy &amp; Security Best Practices
                      </span>
                      <span className="block text-xs text-ink-faint">
                        AWS / Security
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full",
                        nodeLinked
                          ? "bg-community-accent text-white"
                          : "border border-border text-transparent",
                      )}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {MAIN_CATEGORIES.map(({ key, label, icon, className }) => (
                  <CategoryPill
                    key={key}
                    label={label}
                    icon={icon}
                    className={className}
                    active={category === key}
                    onClick={() => setCategory((c) => (c === key ? null : key))}
                  />
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <DropdownMenuRoot
                  open={visibilityOpen}
                  onOpenChange={setVisibilityOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-ink-muted hover:bg-hover-bg"
                    >
                      <Globe2 size={13} strokeWidth={2} />
                      {visibility === "public" ? "Công khai" : "Riêng tư"}
                      <ChevronDown size={12} strokeWidth={2} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    open={visibilityOpen}
                    align="start"
                    className="z-50 w-40 rounded-lg border border-border bg-surface p-1 shadow-dropdown"
                  >
                    <DropdownMenuItem
                      onSelect={() => setVisibility("public")}
                      className="cursor-pointer rounded-md px-2 py-1.5 text-sm text-ink outline-none data-highlighted:bg-hover-bg"
                    >
                      Công khai
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setVisibility("private")}
                      className="cursor-pointer rounded-md px-2 py-1.5 text-sm text-ink outline-none data-highlighted:bg-hover-bg"
                    >
                      Riêng tư
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuRoot>

                <button
                  type="button"
                  className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-ink-muted hover:bg-hover-bg"
                >
                  <Hash size={13} strokeWidth={2} />
                  Thêm chủ đề
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={submitAndClose}
                    className="h-8 cursor-pointer rounded-full border border-border px-4 text-xs font-semibold text-ink-muted hover:bg-hover-bg"
                  >
                    Lưu nháp
                  </button>
                  <button
                    type="button"
                    onClick={submitAndClose}
                    className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-community-accent pr-3 pl-4 text-xs font-semibold text-white hover:bg-community-accent-hover"
                  >
                    <Send size={13} strokeWidth={2.25} />
                    Đăng bài
                    <ChevronDown size={12} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
