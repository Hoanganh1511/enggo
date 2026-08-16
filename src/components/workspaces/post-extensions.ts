import { Node, mergeAttributes, type Extensions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { GlossaryHint } from "./glossary-hint-extension";

export type CalloutVariant = "info" | "warn" | "danger" | "success";

// Nhan hien thi cho tung chu de callout - 3 chu de CHINH nguoi dung tao duoc
// tu toolbar (warn/danger/success), "info" la gia tri mac dinh CU giu lai de
// tuong thich nguoc voi noi dung da luu truoc khi co 3 chu de nay (khong con
// nut rieng tren toolbar, xem PostEditorToolbar.tsx).
const CALLOUT_LABELS: Record<CalloutVariant, string> = {
  info: "Lưu ý",
  warn: "Warning",
  danger: "Danger",
  success: "Good tips",
};

// Icon (path data COPY tu lucide-react: Info/TriangleAlert/OctagonAlert/
// Lightbulb) - Callout la 1 Node THUAN Tiptap (dung chung schema giua editor
// soan VA generateHTML() tinh trong ArticleCard/OG render sau nay), khong
// dung component React duoc nen phai nhung thang SVG path vao renderHTML.
const CALLOUT_ICONS: Record<
  CalloutVariant,
  Array<["path" | "circle", Record<string, string>]>
> = {
  info: [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["path", { d: "M12 16v-4" }],
    ["path", { d: "M12 8h.01" }],
  ],
  warn: [
    [
      "path",
      {
        d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      },
    ],
    ["path", { d: "M12 9v4" }],
    ["path", { d: "M12 17h.01" }],
  ],
  danger: [
    ["path", { d: "M12 16h.01" }],
    ["path", { d: "M12 8v4" }],
    [
      "path",
      {
        d: "M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z",
      },
    ],
  ],
  success: [
    [
      "path",
      {
        d: "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
      },
    ],
    ["path", { d: "M9 18h6" }],
    ["path", { d: "M10 22h4" }],
  ],
};

// Callout node - hop "luu y" kieu Notion/GitBook, 3 chu de Warning/Danger/
// Good tips (+ "info" cu, xem CALLOUT_LABELS). Content THAT nam trong
// div.callout-body (contentElement o parseHTML) - div.callout-header (icon +
// nhan) la trang tri TINH, khong phai vung soan duoc (contenteditable=false).
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
    return [{ tag: "div[data-callout]", contentElement: "div.callout-body" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const variant =
      (node.attrs.variant as CalloutVariant) in CALLOUT_LABELS
        ? (node.attrs.variant as CalloutVariant)
        : "info";
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-callout": "" }),
      [
        "div",
        { class: "callout-header", contenteditable: "false" },
        [
          "svg",
          {
            viewBox: "0 0 24 24",
            width: "14",
            height: "14",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          ...CALLOUT_ICONS[variant],
        ],
        ["span", {}, CALLOUT_LABELS[variant]],
      ],
      ["div", { class: "callout-body" }, 0],
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
    GlossaryHint,
  ];
}

// Extension set HAN CHE cho "tong quan noi dung" (Document.overview) - chi
// cho phep in dam/in nghieng/danh sach cham/danh sach so (+ paragraph/enter/
// undo mac dinh cua StarterKit). Dung CHUNG giua editor mini (PostEditor) va
// generateHTML luc render read-only trong ArticleCard - phai cung 1 schema
// thi generateHTML moi doc dung JSON da luu.
export function getOverviewExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      code: false,
      link: false,
      underline: false,
    }),
  ];
}

// Prose gon cho box tong quan (nho hon POST_PROSE_CLASS, chi can style cho
// dung 4 loai duoc phep: bold/italic/bulletList/orderedList).
export const OVERVIEW_PROSE_CLASS =
  "text-[13px] leading-relaxed focus:outline-none " +
  "[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 " +
  "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 " +
  "[&_strong]:font-semibold [&_em]:italic " +
  "[&_p.is-editor-empty:first-child::before]:text-ink-faint [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none";

// Class prose dung chung - style cho moi loai block (heading/list/table/
// callout/code/image...). Ap cho ca EditorContent (soan) va vung render doc.
export const POST_PROSE_CLASS =
  "max-w-none text-[15px] leading-[1.75] text-ink focus:outline-none " +
  "[&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:text-[30px] [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:tracking-tight " +
  "[&_h2]:mt-7 [&_h2]:mb-2.5 [&_h2]:text-[23px] [&_h2]:font-bold [&_h2]:leading-snug " +
  "[&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[18px] [&_h3]:font-semibold " +
  "[&_p]:my-1 " +
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-2 [&_li_p]:my-0 " +
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
  // Callout (mau theo data-variant) - box vien tron ca 4 canh (khac blockquote
  // chi vien trai) + hang header rieng (icon + nhan chu de) phia tren noi
  // dung, dung CSS var --warning/--danger/--success/--primary cho tung chu de.
  "[&_div[data-callout]]:my-4 [&_div[data-callout]]:overflow-hidden [&_div[data-callout]]:rounded-lg [&_div[data-callout]]:border [&_div[data-callout]]:px-4 [&_div[data-callout]]:py-3 " +
  "[&_div[data-callout]_.callout-header]:mb-1.5 [&_div[data-callout]_.callout-header]:flex [&_div[data-callout]_.callout-header]:items-center [&_div[data-callout]_.callout-header]:gap-1.5 [&_div[data-callout]_.callout-header]:text-[13px] [&_div[data-callout]_.callout-header]:font-semibold " +
  "[&_div[data-callout]_.callout-body_p]:my-1 [&_div[data-callout]_.callout-body_p]:text-ink-muted " +
  "[&_div[data-callout][data-variant='info']]:border-primary/40 [&_div[data-callout][data-variant='info']]:bg-primary/8 [&_div[data-callout][data-variant='info']_.callout-header]:text-primary " +
  "[&_div[data-callout][data-variant='warn']]:border-warning/40 [&_div[data-callout][data-variant='warn']]:bg-warning/10 [&_div[data-callout][data-variant='warn']_.callout-header]:text-warning " +
  "[&_div[data-callout][data-variant='danger']]:border-danger/40 [&_div[data-callout][data-variant='danger']]:bg-danger/10 [&_div[data-callout][data-variant='danger']_.callout-header]:text-danger " +
  "[&_div[data-callout][data-variant='success']]:border-success/40 [&_div[data-callout][data-variant='success']]:bg-success/10 [&_div[data-callout][data-variant='success']_.callout-header]:text-success " +
  // Placeholder (khi soan, block dau rong)
  "[&_p.is-editor-empty:first-child::before]:text-ink-faint [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none";
