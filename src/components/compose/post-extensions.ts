import { Node, mergeAttributes, type Extensions } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { GlossaryHint } from "./glossary-hint-extension";
import { CuratedListView } from "./curated-list-view";

// tiptap-markdown khong ship .d.ts rieng (xem SeriesEntryEditor.tsx) - khai
// bao TOI THIEU 2 kieu nay (dung y het API cua prosemirror-markdown's
// MarkdownSerializerState) chi de addStorage() ben duoi co kieu ro rang thay
// vi `any` tran lan, KHONG phai import that (khong co goi de import).
type TiptapNode = { attrs: Record<string, unknown>; textContent: string };
type MarkdownSerializerState = {
  write: (content?: string) => void;
  ensureNewLine: () => void;
  closeBlock: (node: TiptapNode) => void;
  renderContent: (node: TiptapNode) => void;
  renderInline: (node: TiptapNode) => void;
  wrapBlock: (delim: string, firstDelim: string | null, node: TiptapNode, f: () => void) => void;
};

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
  // Serialize ve Markdown (dung khi SeriesEntryEditor.tsx - editor Entry
  // Series - luu ra STRING markdown qua tiptap-markdown, package KHONG tu
  // biet render 1 node LA cua app nhu Callout nen se BO QUA/loi neu khong
  // khai bao rieng o day. Composer.tsx (Post) KHONG dung Markdown extension
  // nen KHONG doc toi storage nay - hoan toan an toan them vao, chi la 1 lop
  // "du phong" khi node nay xuat hien trong 1 tai lieu co serialize markdown.
  // Xuong cap thanh 1 blockquote co nhan chu de o dong dau (mat rieng
  // mau/icon, giu lai NOI DUNG that).
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const variant =
            (node.attrs.variant as CalloutVariant) in CALLOUT_LABELS
              ? (node.attrs.variant as CalloutVariant)
              : "info";
          state.wrapBlock("> ", null, node, () => {
            state.write(`**${CALLOUT_LABELS[variant]}**`);
            state.ensureNewLine();
            state.renderContent(node);
          });
        },
      },
    };
  },
});

// "Go deeper" - 1 dong goi y doc them (dang the/card vien tron, icon vuong
// hoa van soc cheo + dau "*" ben trai, noi dung ben phai) - dua theo mockup
// nguoi dung gui. Content CHI la inline (text/link, xem yeu cau "Nội dung có
// thể gồm cả text cả link") - KHONG cho block con (khong giong Callout).
export const GoDeeper = Node.create({
  name: "goDeeper",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: "div[data-go-deeper]", contentElement: "div.go-deeper-body" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-go-deeper": "" }),
      ["div", { class: "go-deeper-icon", contenteditable: "false" }, "*"],
      ["div", { class: "go-deeper-body" }, 0],
    ];
  },
  // Markdown fallback (xem comment addStorage cua Callout o tren) - xuong
  // cap thanh 1 dong van ban thuong, mat icon "*" trang tri, giu lai
  // text/link that su.
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          state.renderInline(node);
          state.closeBlock(node);
        },
      },
    };
  },
});

// Muc luc dang so (bien the cua "table of contents") - danh so 01/02/03...
// THEO DUNG THU TU xuat hien cua cac heading H2 trong bai, TAI THOI DIEM
// CHEN (xem insertToc() trong PostEditorToolbar.tsx) - luu lai thanh SNAPSHOT
// trong attrs `items` thay vi tinh lai "song" moi lan render. Chon huong nay
// (khac GlossaryHint dung ReactNodeViewRenderer) vi node nay can hien THAT
// GIONG NHAU o ca luc soan LAN luc doc tinh qua renderTiptapHTML() (xem
// ArticleBody.tsx/docs/engineering-log.md 2026-09-10) - 1 NodeView React se
// KHONG chay trong duong render tinh do, gay lech giao dien 2 noi. Danh doi:
// neu sua tieu de H2 sau khi da chen muc luc, phai xoa chen lai moi cap nhat
// (khong tu dong "song" theo noi dung) - chap nhan duoc cho 1 khoi tham khao
// nhanh, dung tinh than "chup nhanh luc chen" nhu OG-image tinh cua ArticleCard.
export const TocBlock = Node.create({
  name: "tocBlock",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      items: {
        default: [] as { text: string }[],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-items") ?? "[]") as { text: string }[];
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-items": JSON.stringify(attrs.items ?? []) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-toc-block]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const items = (node.attrs.items ?? []) as { text: string }[];
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-toc-block": "", contenteditable: "false" }),
      ["p", { class: "toc-block-title" }, "Mục lục"],
      ...items.map((item, i) => [
        "div",
        { class: "toc-block-item" },
        ["span", { class: "toc-block-index" }, String(i + 1).padStart(2, "0")],
        ["span", { class: "toc-block-text" }, item.text],
        [
          "svg",
          {
            class: "toc-block-chevron",
            viewBox: "0 0 24 24",
            width: "14",
            height: "14",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          ["path", { d: "m6 9 6 6 6-6" }],
        ],
      ]),
    ];
  },
  // Markdown fallback (xem comment addStorage cua Callout o tren) - xuong
  // cap thanh 1 danh sach so (khong con giao dien chevron/khung rieng).
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const items = (node.attrs.items ?? []) as { text: string }[];
          state.write("**Mục lục**");
          state.ensureNewLine();
          items.forEach((item, i) => {
            state.write(`${i + 1}. ${item.text}`);
            state.ensureNewLine();
          });
          state.closeBlock(node);
        },
      },
    };
  },
});

export type CuratedListItem = {
  postId: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  kind: "article" | "video";
};

// "Đọc thêm" dang 4 the ngang (mockup nguoi dung gui) - moi o luu SNAPSHOT
// (postId/title/excerpt/imageUrl/kind) cua 1 Post THAT tai thoi diem chon,
// khong fetch lai luc render (giong tinh than TocBlock o tren) - vua tranh
// phai goi API luc doc bai, vua bao dam hien dung y het luc tac gia da thay
// khi chon (neu bai goc bi sua/xoa sau nay, the van hien snapshot cu thay vi
// vo/loi). Rieng luc SOAN (NodeView, editable=true) moi can tuong tac chon
// bai qua modal - xem CuratedItemPickerModal.tsx.
export const CuratedList = Node.create({
  name: "curatedList",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      items: {
        default: [null, null, null, null] as (CuratedListItem | null)[],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-items") ?? "[]") as (CuratedListItem | null)[];
          } catch {
            return [null, null, null, null];
          }
        },
        renderHTML: (attrs) => ({ "data-items": JSON.stringify(attrs.items ?? []) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-curated-list]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const items = ((node.attrs.items ?? []) as (CuratedListItem | null)[]).filter(
      (i): i is CuratedListItem => Boolean(i),
    );
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-curated-list": "", contenteditable: "false" }),
      ...items.map((item) => [
        "a",
        { class: "curated-list-item", href: `/p/${item.postId}` },
        [
          "div",
          { class: "curated-list-thumb" },
          ...(item.imageUrl ? [["img", { src: item.imageUrl, alt: "" }]] : []),
        ],
        [
          "div",
          { class: "curated-list-body" },
          ["span", { class: "curated-list-badge" }, item.kind === "video" ? "VIDEO" : "ARTICLE"],
          ["p", { class: "curated-list-title" }, item.title],
          ["p", { class: "curated-list-excerpt" }, item.excerpt],
        ],
      ]),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CuratedListView);
  },
  // Markdown fallback (xem comment addStorage cua Callout o tren) - xuong
  // cap thanh danh sach link, mat the/anh/badge trang tri.
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const items = ((node.attrs.items ?? []) as (CuratedListItem | null)[]).filter(
            (i): i is CuratedListItem => Boolean(i),
          );
          items.forEach((item) => {
            state.write(`- [${item.title}](/p/${item.postId})`);
            state.ensureNewLine();
          });
          state.closeBlock(node);
        },
      },
    };
  },
});

// Bo extension DUNG CHUNG giua editor (soan) va viewer (doc read-only) - render
// giong het nhau vi cung 1 schema. Placeholder KHONG o day (chi can khi soan,
// them rieng trong PostEditor).
//
// StarterKit (Tiptap v3) tu mang san Link + Underline (khac v2, luc file nay
// duoc viet) - de nguyen StarterKit tran + khai bao rieng Link/Underline ben
// duoi nhu cu se tao ra 2 extension CUNG TEN "link"/"underline" trong 1
// schema. Khong chi la warning suong: da tai hien duoc crash that
// ("RangeError: Adding different instances of a keyed plugin") khi mount 1
// Editor voi DOM that, VA du khong crash thi mark "link" ap dung qua
// setLink() bi luu THIEU HAN attrs (href/target/rel rong) - xem
// docs/engineering-log.md 2026-09-11. Phai tat 2 cai StarterKit tu mang theo
// (link:false, underline:false) de CHI CON 1 ban duy nhat (ban .configure()
// rieng ben duoi, giu dung { openOnClick: false }) - dung y het cach
// getOverviewExtensions() ben duoi da lam voi heading/blockquote/codeBlock...
export function getPostExtensions(): Extensions {
  return [
    StarterKit.configure({ link: false, underline: false }),
    Underline,
    TaskList,
    TaskItem.configure({ nested: true }),
    Link.configure({ openOnClick: false }),
    Image.configure({ inline: false, allowBase64: false }),
    TableKit.configure({ table: { resizable: true } }),
    Callout,
    GlossaryHint,
    GoDeeper,
    TocBlock,
    CuratedList,
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
  "font-content text-[13px] leading-relaxed focus:outline-none " +
  "[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 " +
  "[&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 " +
  "[&_strong]:font-semibold [&_em]:italic " +
  "[&_p.is-editor-empty:first-child::before]:text-ink-faint [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none";

// Class prose dung chung - style cho moi loai block (heading/list/table/
// callout/code/image...). Ap cho ca EditorContent (soan) va vung render doc.
export const POST_PROSE_CLASS =
  // font-content: noi dung tai lieu/bai viet dung Be Vietnam Pro thay --font-sans
  // mac dinh (UI/dieu huong) - [&_code]/[&_pre] ben duoi van font-mono rieng.
  "font-content max-w-none text-[15px] leading-[1.75] text-ink focus:outline-none " +
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
  "[&_p.is-editor-empty:first-child::before]:text-ink-faint [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:pointer-events-none " +
  // "Go deeper" - icon vuong hoa van soc cheo (repeating-linear-gradient) +
  // dau "*" o giua, noi dung ben phai. CHI ap dung cho ban render TINH
  // (renderHTML cua GoDeeper) - luc soan node nay KHONG co NodeView rieng nen
  // dung THANG 1 schema/style nay ca 2 noi (khac Callout deu la div thuan).
  "[&_div[data-go-deeper]]:my-4 [&_div[data-go-deeper]]:flex [&_div[data-go-deeper]]:items-center [&_div[data-go-deeper]]:gap-3 [&_div[data-go-deeper]]:rounded-xl [&_div[data-go-deeper]]:border [&_div[data-go-deeper]]:border-border [&_div[data-go-deeper]]:p-3 " +
  "[&_.go-deeper-icon]:flex [&_.go-deeper-icon]:size-10 [&_.go-deeper-icon]:shrink-0 [&_.go-deeper-icon]:items-center [&_.go-deeper-icon]:justify-center [&_.go-deeper-icon]:rounded-lg [&_.go-deeper-icon]:bg-[repeating-linear-gradient(45deg,var(--border)_0,var(--border)_1px,transparent_1px,transparent_6px)] [&_.go-deeper-icon]:text-[18px] [&_.go-deeper-icon]:font-bold [&_.go-deeper-icon]:text-ink-faint " +
  "[&_.go-deeper-body]:text-[14px] [&_.go-deeper-body]:text-ink " +
  // TOC dang so - 01/02/03 muted mono + tieu de + chevron trang tri (khong
  // tuong tac, xem comment TocBlock ve ly do chon snapshot tinh).
  "[&_div[data-toc-block]]:my-5 [&_div[data-toc-block]]:rounded-xl [&_div[data-toc-block]]:border [&_div[data-toc-block]]:border-border [&_div[data-toc-block]]:p-1.5 " +
  "[&_.toc-block-title]:px-3 [&_.toc-block-title]:py-1.5 [&_.toc-block-title]:text-[11px] [&_.toc-block-title]:font-semibold [&_.toc-block-title]:tracking-wide [&_.toc-block-title]:text-ink-faint [&_.toc-block-title]:uppercase " +
  "[&_.toc-block-item]:flex [&_.toc-block-item]:items-center [&_.toc-block-item]:gap-3 [&_.toc-block-item]:rounded-lg [&_.toc-block-item]:border [&_.toc-block-item]:border-border [&_.toc-block-item]:px-3 [&_.toc-block-item]:py-2.5 [&_.toc-block-item+.toc-block-item]:mt-1.5 " +
  "[&_.toc-block-index]:font-mono [&_.toc-block-index]:text-[12px] [&_.toc-block-index]:text-ink-faint " +
  "[&_.toc-block-text]:flex-1 [&_.toc-block-text]:text-[14px] [&_.toc-block-text]:font-semibold [&_.toc-block-text]:text-ink " +
  "[&_.toc-block-chevron]:shrink-0 [&_.toc-block-chevron]:text-ink-faint " +
  // "Đọc thêm" (CuratedList) - ban render TINH (luc doc, khong co NodeView) -
  // moi item la 1 the <a> that, khac ban soan (curated-list-view.tsx dung
  // Tailwind rieng qua className, khong qua cac class nay).
  "[&_a.curated-list-item]:my-2.5 [&_a.curated-list-item]:flex [&_a.curated-list-item]:items-center [&_a.curated-list-item]:gap-3 [&_a.curated-list-item]:rounded-xl [&_a.curated-list-item]:border [&_a.curated-list-item]:border-border [&_a.curated-list-item]:p-3 [&_a.curated-list-item]:no-underline [&_a.curated-list-item]:hover:border-border-strong " +
  "[&_.curated-list-thumb]:size-14 [&_.curated-list-thumb]:shrink-0 [&_.curated-list-thumb]:overflow-hidden [&_.curated-list-thumb]:rounded-lg [&_.curated-list-thumb]:bg-surface-muted [&_.curated-list-thumb_img]:size-full [&_.curated-list-thumb_img]:object-cover " +
  "[&_.curated-list-badge]:inline-block [&_.curated-list-badge]:rounded [&_.curated-list-badge]:border [&_.curated-list-badge]:border-border [&_.curated-list-badge]:px-1.5 [&_.curated-list-badge]:py-0.5 [&_.curated-list-badge]:font-mono [&_.curated-list-badge]:text-[10px] [&_.curated-list-badge]:font-semibold [&_.curated-list-badge]:tracking-wide [&_.curated-list-badge]:text-ink-faint " +
  "[&_.curated-list-title]:mt-1 [&_.curated-list-title]:text-[14px] [&_.curated-list-title]:font-bold [&_.curated-list-title]:text-ink [&_.curated-list-title]:no-underline " +
  "[&_.curated-list-excerpt]:text-[12.5px] [&_.curated-list-excerpt]:text-ink-faint [&_.curated-list-excerpt]:no-underline";
