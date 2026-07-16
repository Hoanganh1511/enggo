"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, Code, Heading2, type LucideIcon } from "lucide-react";
import SectionLabel from "./SectionLabel";

type EditorPaneProps = {
  content: Record<string, unknown> | null;
  onContentChange: (json: Record<string, unknown>) => void;
};

type ToolbarButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
  Icon: LucideIcon;
};

function ToolbarButton({ label, isActive, onClick, Icon }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg transition-colors ${
        isActive ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      <Icon size={16} strokeWidth={1.75} />
    </button>
  );
}

const EditorPane = ({ content, onContentChange }: EditorPaneProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Gõ để ghi chú…" }),
    ],
    content: content ?? undefined,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[300px] text-sm text-gray-900 focus:outline-none " +
          "[&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-medium " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
          "[&_pre]:mt-2 [&_pre]:rounded-lg [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs " +
          "[&_p.is-editor-empty:first-child::before]:text-gray-400 [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex h-full flex-col">
      <SectionLabel>Chi tiết node</SectionLabel>
      <div className="mt-2 flex items-center gap-1 border-b border-gray-100 pb-2">
        <ToolbarButton
          label="Heading"
          isActive={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          Icon={Heading2}
        />
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
          label="Bullet list"
          isActive={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          Icon={List}
        />
        <ToolbarButton
          label="Code block"
          isActive={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          Icon={Code}
        />
      </div>
      <div className="mt-3 flex-1 overflow-y-auto rounded-lg border border-gray-200 p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default EditorPane;
