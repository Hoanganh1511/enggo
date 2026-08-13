import { Node, mergeAttributes, type Extensions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";

// Callout node - hop "luu y" kieu Notion/GitBook. Wrap block content, co 1
// attribute `variant` (info | warn | success). Dung toggleWrap("callout")
// san co cua Tiptap (khong can custom command nen khong phai augment type).
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: "info",
        parseHTML: (el) => el.getAttribute("data-variant") ?? "info",
        renderHTML: (attrs) => ({ "data-variant": attrs.variant as string }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-callout]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-callout": "" }),
      0,
    ];
  },
});

// Bo extension DUNG CHUNG giua editor (soan) va viewer (doc read-only) - render
// giong het nhau vi cung 1 schema. Placeholder KHONG o day (chi can khi soan,
// them rieng trong PostEditor).
export function getPostExtensions(): Extensions {
  return [
    StarterKit,
    Underline,
    TaskList,
    TaskItem.configure({ nested: true }),
    Link.configure({ openOnClick: false }),
    Image.configure({ inline: false, allowBase64: false }),
    TableKit.configure({ table: { resizable: true } }),
    Callout,
  ];
}

// Class prose dung chung - style cho moi loai block (heading/list/table/
// callout/code/image...). Ap cho ca EditorContent (soan) va vung render doc.
export const POST_PROSE_CLASS =
  "max-w-none text-[15px] leading-[1.75] text-ink focus:outline-none " +
  "[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-[30px] [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:tracking-tight " +
  "[&_h2]:mt-7 [&_h2]:mb-2.5 [&_h2]:text-[23px] [&_h2]:font-bold [&_h2]:leading-snug " +
  "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[18px] [&_h3]:font-semibold " +
  "[&_p]:my-3 " +
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 " +
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-community-accent/40 [&_blockquote]:pl-4 [&_blockquote]:text-ink-muted [&_blockquote]:italic " +
  "[&_hr]:my-8 [&_hr]:border-border " +
  "[&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] " +
  // Code block: mau toi CO DINH (#0d1117 kieu GitHub) cho ca light & dark -
  // KHONG dung bg-ink vi --ink dao thanh mau sang o dark mode se lam nen sang
  // + chu sang = mat chu.
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#0d1117] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:text-[#e6edf3] " +
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#e6edf3] " +
  "[&_img]:my-4 [&_img]:rounded-xl [&_img]:border [&_img]:border-border [&_img]:max-w-full " +
  // Table
  "[&_table]:my-5 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:text-[14px] " +
  "[&_th]:border [&_th]:border-border [&_th]:bg-surface-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold " +
  "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top " +
  // Task list
  "[&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:pl-0 " +
  "[&_li[data-type='taskItem']]:flex [&_li[data-type='taskItem']]:items-start [&_li[data-type='taskItem']]:gap-2 " +
  "[&_li[data-type='taskItem']_>_label]:mt-1 [&_li[data-type='taskItem']_>_div]:flex-1 " +
  // Callout (mau theo data-variant)
  "[&_div[data-callout]]:my-4 [&_div[data-callout]]:rounded-lg [&_div[data-callout]]:border-l-4 [&_div[data-callout]]:px-4 [&_div[data-callout]]:py-3 " +
  "[&_div[data-callout]_p]:my-1 " +
  "[&_div[data-callout][data-variant='info']]:border-primary [&_div[data-callout][data-variant='info']]:bg-primary/8 " +
  "[&_div[data-callout][data-variant='warn']]:border-warning [&_div[data-callout][data-variant='warn']]:bg-warning/10 " +
  "[&_div[data-callout][data-variant='success']]:border-success [&_div[data-callout][data-variant='success']]:bg-success/10 " +
  // Placeholder (khi soan, block dau rong)
  "[&_p.is-editor-empty:first-child::before]:text-ink-faint [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none";
