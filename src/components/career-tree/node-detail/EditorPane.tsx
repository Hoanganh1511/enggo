"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
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
  Undo2,
  Redo2,
  type LucideIcon,
} from "lucide-react";
type EditorPaneProps = {
  content: Record<string, unknown> | null;
  onContentChange: (json: Record<string, unknown>) => void;
  editable: boolean;
};

type ToolbarButtonProps = {
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
  Icon: LucideIcon;
};

function ToolbarButton({
  label,
  isActive,
  disabled,
  onClick,
  Icon,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40 ${
        isActive
          ? "bg-active-bg text-icon-active"
          : "text-icon hover:bg-hover-bg"
      }`}
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

const EditorPane = ({ content, onContentChange, editable }: EditorPaneProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Gõ để ghi chú…" }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: content ?? undefined,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] text-sm text-ink focus:outline-none " +
          "[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold " +
          "[&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-medium " +
          "[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-medium " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
          "[&_blockquote]:mt-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-ink-muted " +
          "[&_hr]:mt-4 [&_hr]:mb-4 [&_hr]:border-border " +
          "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 " +
          "[&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs " +
          "[&_pre]:mt-2 [&_pre]:rounded-lg [&_pre]:bg-surface-muted [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs " +
          "[&_pre_code]:bg-transparent [&_pre_code]:p-0 " +
          "[&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:pl-0 " +
          "[&_li[data-type='taskItem']]:flex [&_li[data-type='taskItem']]:items-start [&_li[data-type='taskItem']]:gap-2 " +
          "[&_li[data-type='taskItem']_>_label]:mt-0.5 [&_li[data-type='taskItem']_>_div]:flex-1 " +
          "[&_p.is-editor-empty:first-child::before]:text-ink-faint [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none",
      },
    },
  });

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  if (!editor) return null;

  const setLink = () => {
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
    <div className="flex h-full flex-col">
      {editable && (
      <div className="flex flex-wrap items-center gap-1 border-b border-border pb-2">
        <ToolbarButton
          label="Heading 1"
          isActive={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          Icon={Heading1}
        />
        <ToolbarButton
          label="Heading 2"
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          Icon={Heading2}
        />
        <ToolbarButton
          label="Heading 3"
          isActive={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          Icon={Heading3}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Bold"
          isActive={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          Icon={Bold}
        />
        <ToolbarButton
          label="Italic"
          isActive={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          Icon={Italic}
        />
        <ToolbarButton
          label="Underline"
          isActive={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          Icon={UnderlineIcon}
        />
        <ToolbarButton
          label="Strikethrough"
          isActive={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          Icon={Strikethrough}
        />
        <ToolbarButton
          label="Inline code"
          isActive={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
          Icon={Code}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Bullet list"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          Icon={List}
        />
        <ToolbarButton
          label="Ordered list"
          isActive={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          Icon={ListOrdered}
        />
        <ToolbarButton
          label="Task list"
          isActive={editor.isActive("taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          Icon={ListTodo}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Blockquote"
          isActive={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          Icon={Quote}
        />
        <ToolbarButton
          label="Divider"
          isActive={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          Icon={Minus}
        />
        <ToolbarButton
          label="Code block"
          isActive={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          Icon={Terminal}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Link"
          isActive={editor.isActive("link")}
          onClick={setLink}
          Icon={Link2}
        />

        <ToolbarDivider />

        <ToolbarButton
          label="Undo"
          isActive={false}
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
          Icon={Undo2}
        />
        <ToolbarButton
          label="Redo"
          isActive={false}
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
          Icon={Redo2}
        />
      </div>
      )}
      <div
        className={`flex-1 overflow-y-auto rounded-lg border border-border p-4 ${editable ? "mt-3" : ""}`}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default EditorPane;
