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
import { QuestionPickerView } from "./question-picker-view";
import { AccordionView } from "./accordion-view";
import { StatAccordionView } from "./stat-accordion-view";

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

export type QuestionPickerItem = { question: string; description: string };

// Fallback CHI dung khi bam nut nhung KHONG con H2 nao trong bai (hiem gap -
// insertQuestionPicker() trong PostEditorToolbar.tsx bao loi truoc, khong
// cho chen rong - xem duoi).
const DEFAULT_QUESTION_PICKER_ITEMS: QuestionPickerItem[] = [
  { question: "Câu hỏi 1", description: "" },
];

// "TOC dang box theo H2" - bien the KHAC voi TocBlock (list so 01/02/03), o
// day la 1 GRID cau hoi/card dang <details> co the bam mo/dong. Item TU
// DONG QUET tu heading H2 trong bai (giong TocBlock, xem insertQuestionPicker()
// trong PostEditorToolbar.tsx) - yeu cau nguoi dung sau khi so sanh voi "On
// this page": "chỉ bắt theo h2 thôi nhé" (truoc do nguoi soan phai TU GO tay
// tung cau hoi, khong lien quan gi heading that trong bai). Ban RENDER TINH
// (renderHTML, khi Post doc qua renderTiptapHTML - xem ArticleBody.tsx/
// docs/engineering-log.md 2026-09-10) van "bam mo/dong" duoc BANG HTML/CSS
// THUAN, KHONG can JS/NodeView nao chay (giu dung tinh than TocBlock/
// CuratedList: NodeView React CHI phuc vu luc SOAN, ban doc tinh phai tu
// hoat dong doc lap). Danh doi da chon: noi dung mo ra NAM NGAY DUOI cau
// hoi cua chinh no (trong long the), khac anh mau tham khao ban dau co 1
// panel rieng ben duoi CA grid dung chung - don gian hon nhieu ma van dung
// dung tinh nang "bam 1 muc de xem noi dung tuong ung".
export const QuestionPicker = Node.create({
  name: "questionPicker",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      items: {
        default: DEFAULT_QUESTION_PICKER_ITEMS,
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-items") ?? "[]") as QuestionPickerItem[];
          } catch {
            return DEFAULT_QUESTION_PICKER_ITEMS;
          }
        },
        renderHTML: (attrs) => ({ "data-items": JSON.stringify(attrs.items ?? []) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-question-picker]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const items = (node.attrs.items ?? []) as QuestionPickerItem[];
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-question-picker": "", contenteditable: "false" }),
      ...items.map((item, i) => [
        "details",
        { class: "question-picker-item", ...(i === 0 ? { open: "" } : {}) },
        [
          "summary",
          { class: "question-picker-summary" },
          ["span", { class: "question-picker-index" }, String(i + 1).padStart(2, "0")],
          ["span", { class: "question-picker-question" }, item.question],
          [
            "svg",
            {
              class: "question-picker-chevron",
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
        ],
        ...(item.description
          ? [["p", { class: "question-picker-description" }, item.description]]
          : []),
      ]),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(QuestionPickerView);
  },
  // Markdown serialize - KHAC HAN cach lam cua Callout/GoDeeper/TocBlock o
  // tren (xuong cap thanh text thuong): o day ghi THANG doan HTML <details>
  // (giong het renderHTML ben tren) vao chuoi markdown, vi Series Entry
  // (contentMarkdown) doc qua DocsMarkdown.tsx (react-markdown +
  // rehype-raw) - CAN giu nguyen giao dien grid/collapse THAT su tren ca 2
  // pipeline (Post qua renderTiptapHTML() LAN Series qua DocsMarkdown), yeu
  // cau nguoi dung sau khi thay ban dau chi xuong cap con text ("Vẫn chưa
  // thấy cái TOC dạng box... Tôi bảo 2 lần rồi"). An toan de nhung HTML tho
  // vi noi dung Series/docs CHI admin moi soan duoc (AdminGuard ben
  // content-series.service.ts), khong phai input nguoi dung thuong.
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const items = (node.attrs.items ?? []) as QuestionPickerItem[];
          const escapeHtml = (s: string) =>
            s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
          const cardsHtml = items
            .map((item, i) => {
              const openAttr = i === 0 ? " open" : "";
              const description = item.description
                ? `<p class="question-picker-description">${escapeHtml(item.description)}</p>`
                : "";
              return (
                `<details class="question-picker-item"${openAttr}>` +
                `<summary class="question-picker-summary">` +
                `<span class="question-picker-index">${String(i + 1).padStart(2, "0")}</span>` +
                `<span class="question-picker-question">${escapeHtml(item.question)}</span>` +
                `<svg class="question-picker-chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>` +
                `</summary>${description}</details>`
              );
            })
            .join("");
          // Blank dong truoc/sau (ensureNewLine x2 + closeBlock) - BAT BUOC de
          // CommonMark nhan dien day la 1 "HTML block" doc lap (type 6), khong
          // bi gop lan vao 1 paragraph van ban ben canh roi bi escape mat.
          state.ensureNewLine();
          state.write(`<div data-question-picker>${cardsHtml}</div>`);
          state.ensureNewLine();
          state.closeBlock(node);
        },
      },
    };
  },
});

// Accordion - hop "bam de mo/dong" (yeu cau nguoi dung: "Editor chưa có
// accordion"), content la block+ THAT (khac Callout/GoDeeper deu KHONG cho
// nguoi dung dat tieu de rieng) - tieu de la 1 attr string sua duoc qua o
// input trong AccordionView (NodeView CHI phuc vu soan, xem comment file do),
// content THAT su dung ProseMirror children (khong phai attrs JSON nhu
// QuestionPicker/CuratedList) nen cho phep bat ky block nao ben trong (list/
// anh/bang...). Ban render TINH (renderHTML) dung <details>/<summary> THUAN -
// trinh duyet tu lo mo/dong bang HTML/CSS, khong can JS (giong tinh than
// QuestionPicker) - attrs `open` la trang thai MAC DINH luc doc (nguoi doc
// van bam mo/dong lai duoc binh thuong sau do, day chi la gia tri khoi tao).
export const Accordion = Node.create({
  name: "accordion",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      // parseHTML doc TRUC TIEP tu DOM con (summary/thuoc tinh open) thay vi
      // 1 data-attribute rieng ("data-title") - FIX bug that su: markdown
      // serializer o duoi ghi title vao NOI DUNG <summary> va `open` vao
      // thuoc tinh BOOLEAN THAT (khong phai "data-open") de trinh duyet tu
      // hoat dong duoc luc DOC (khong JS), nhung ban dau parseHTML lai doc
      // "data-title"/"data-open" - 2 thuoc tinh CHUA BAO GIO duoc ghi - nen
      // MOI LAN mo lai 1 Entry da luu (vd bai "AWS Architecture Map") thi
      // Accordion reset ve mac dinh/mat noi dung, phat sinh loi that su khi
      // 0 content nao khop duoc content:"block+" bat buoc (RangeError tu
      // ProseMirror, sap trang quan ly Entry - nguoi dung bao "F5 trang bị
      // lỗi").
      title: {
        default: "Tiêu đề",
        parseHTML: (el) => el.querySelector(":scope > summary")?.textContent?.trim() || "Tiêu đề",
        renderHTML: (attrs) => ({ "data-title": attrs.title as string }),
      },
      open: {
        default: true,
        parseHTML: (el) => el.hasAttribute("open"),
        renderHTML: (attrs) => ({ "data-open": attrs.open === false ? "false" : "true" }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "details[data-accordion]", contentElement: ":scope > div.accordion-body" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const title = (node.attrs.title as string) || "Tiêu đề";
    const open = node.attrs.open !== false;
    return [
      "details",
      mergeAttributes(HTMLAttributes, { "data-accordion": "", ...(open ? { open: "" } : {}) }),
      ["summary", { class: "accordion-summary" }, title],
      ["div", { class: "accordion-body" }, 0],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(AccordionView);
  },
  // Markdown fallback (xem comment addStorage cua Callout o tren) - KHAC
  // Callout/GoDeeper/TocBlock (xuong cap thanh text thuong): nhung THANG the
  // <details>/<summary> tho vao markdown, chua NOI DUNG THAT o giua duoi dang
  // markdown that (khong phai HTML). PHAI boc noi dung trong 1
  // <div class="accordion-body"> KHOP DUNG voi contentElement khai bao o
  // parseHTML ben tren - THIEU div nay la bug that su da xay ra (xem comment
  // addAttributes ve ly do): ProseMirror parse lai markdown da luu se KHONG
  // tim thay noi dung nao khop content:"block+" bat buoc -> nem loi crash
  // ca trang luc mo lai Entry. Can dong trong TRUOC/SAU moi doan markdown
  // long trong HTML (ca quanh <details> LAN quanh <div class="accordion-body">
  // - CommonMark coi "div" cung la 1 tag HTML-block type-6, tu ket thuc o
  // dong trong dau tien) de CommonMark/rehype-raw (DocsMarkdown.tsx) nhan
  // dung day la markdown long trong HTML tho, khong bi nuot lam text.
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const title = (node.attrs.title as string) || "Tiêu đề";
          const open = node.attrs.open !== false;
          const escapeHtml = (s: string) =>
            s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
          state.ensureNewLine();
          state.write(
            `<details class="accordion-block" data-accordion${open ? " open" : ""}>\n` +
              `<summary class="accordion-summary">${escapeHtml(title)}</summary>\n` +
              `<div class="accordion-body">\n\n`,
          );
          state.renderContent(node);
          state.ensureNewLine();
          state.write("\n</div>\n</details>");
          state.closeBlock(node);
        },
      },
    };
  },
});

// lat/lng KHONG bat buoc - yeu cau nguoi dung: "tôi có một list các region
// aws trên thế giới, tôi muốn khi click vào chúng sẽ hiện modal có quả địa
// cầu 3d rồi quay tới, xong focus vào đúng vị trí đó" (xem RegionGlobeModal.tsx
// + EntryContentWithGlobe.tsx ve phan xu ly click/globe). Chi dong nao co CA
// 2 gia tri nay moi duoc hien nhu 1 muc BAM DUOC luc doc (xem CSS
// [&_.stat-accordion-item[data-lat]] o duoi) - dong khong co toa do van hien
// binh thuong, khong bam duoc.
export type StatAccordionItem = { text: string; color: string; lat?: number; lng?: number };
export type StatAccordionLegendItem = { color: string; label: string };

// Mau mac dinh cho 1 dot moi tao (chua tuy chinh) - cam AWS, khop tinh than
// mockup nguoi dung gui (khoi "Geographic Regions"/"Edge Locations").
export const STAT_ACCORDION_DEFAULT_COLOR = "#f97316";

// Attrs dung chung cho 1 dong item (renderHTML LAN markdown serialize duoi -
// chi item nao co CA lat/lng moi gan them "data-lat"/"data-lng" + class rieng
// de CSS bao hieu bam duoc (xem POST_PROSE_CLASS) - EntryContentWithGlobe.tsx
// doc lai 2 data-* nay qua 1 click handler UY QUYEN (delegated), KHONG can
// hydrate rieng tung dong (item van la HTML tho thuan tuy, xem comment
// StatAccordion.addStorage o duoi).
function statAccordionItemAttrs(item: StatAccordionItem): Record<string, string> {
  const hasCoords = typeof item.lat === "number" && typeof item.lng === "number";
  return {
    class: hasCoords ? "stat-accordion-item stat-accordion-item-clickable" : "stat-accordion-item",
    ...(hasCoords ? { "data-lat": String(item.lat), "data-lng": String(item.lng) } : {}),
  };
}

// "Accordion Geographical" - bien the KHAC voi Accordion thuong o tren (yeu cau
// nguoi dung sau khi xem mockup AWS Global Infrastructure: "cũng là 1 biến
// thể khác của accordion, nhưng có số lượng, có button + - để collapse, bên
// trong nó có thể có description hoặc không tùy, bên dưới là list dạng dot,
// có thể tùy chỉnh màu sắc của dot, và dưới cuối cùng là chú thích mục đích
// của dot màu đấy"). La node ATOM (khac Accordion co content THAT block+) -
// toan bo du lieu (items/legend) la 1 SNAPSHOT attrs JSON, giong tinh than
// QuestionPicker/CuratedList/TocBlock o tren (danh sach CO CAU TRUC text+mau,
// khong phai noi dung tu do can rich text nen khong dung ProseMirror children
// that). Ban render TINH dung <details>/<summary> THUAN (giong Accordion) -
// "button +/-" chi la 1 CHI BAO truc quan (giong chevron cua Accordion),
// click dau tren <summary> deu toggle native, khong can JS rieng.
export const StatAccordion = Node.create({
  name: "statAccordion",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      title: {
        default: "Tiêu đề",
        parseHTML: (el) => el.getAttribute("data-title") ?? "Tiêu đề",
        renderHTML: (attrs) => ({ "data-title": attrs.title as string }),
      },
      count: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-count") ?? "",
        renderHTML: (attrs) => ({ "data-count": (attrs.count as string) ?? "" }),
      },
      description: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-description") ?? "",
        renderHTML: (attrs) => ({ "data-description": (attrs.description as string) ?? "" }),
      },
      // parseHTML doc thuoc tinh BOOLEAN THAT "open" (khop dung markdown
      // serializer o duoi ghi native `open`, KHONG phai "data-open") - cung
      // loi voi Accordion o tren neu de lech.
      open: {
        default: true,
        parseHTML: (el) => el.hasAttribute("open"),
        renderHTML: (attrs) => ({ "data-open": attrs.open === false ? "false" : "true" }),
      },
      items: {
        default: [] as StatAccordionItem[],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-items") ?? "[]") as StatAccordionItem[];
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-items": JSON.stringify(attrs.items ?? []) }),
      },
      legend: {
        default: [] as StatAccordionLegendItem[],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-legend") ?? "[]") as StatAccordionLegendItem[];
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-legend": JSON.stringify(attrs.legend ?? []) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "details[data-stat-accordion]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const title = (node.attrs.title as string) || "Tiêu đề";
    const description = (node.attrs.description as string) ?? "";
    const open = node.attrs.open !== false;
    const items = (node.attrs.items ?? []) as StatAccordionItem[];
    const legend = (node.attrs.legend ?? []) as StatAccordionLegendItem[];
    // Badge so luong TU TINH tu items.length (KHONG con doc node.attrs.count -
    // yeu cau nguoi dung: "phần số lượng trong accordion geographic thì bạn
    // tự cho ra theo đúng số lượng được add vào chứ" - go tay de sai/quen cap
    // nhat khi them/bot dong, xem StatAccordionView.tsx da bo han o nhap tay).
    const count = items.length;
    return [
      "details",
      mergeAttributes(HTMLAttributes, { "data-stat-accordion": "", ...(open ? { open: "" } : {}) }),
      [
        "summary",
        { class: "stat-accordion-summary" },
        ["span", { class: "stat-accordion-title" }, title],
        ...(count > 0 ? [["span", { class: "stat-accordion-badge" }, String(count)]] : []),
      ],
      [
        "div",
        { class: "stat-accordion-body" },
        ...(description ? [["p", { class: "stat-accordion-description" }, description]] : []),
        [
          "div",
          { class: "stat-accordion-list" },
          ...items.map((item) => [
            "div",
            statAccordionItemAttrs(item),
            [
              "span",
              { class: "stat-accordion-dot", style: `background-color:${item.color || STAT_ACCORDION_DEFAULT_COLOR}` },
            ],
            ["span", { class: "stat-accordion-item-text" }, item.text],
          ]),
        ],
        ...(legend.length
          ? [
              [
                "div",
                { class: "stat-accordion-legend" },
                ...legend.map((l) => [
                  "div",
                  { class: "stat-accordion-legend-item" },
                  [
                    "span",
                    { class: "stat-accordion-dot", style: `background-color:${l.color || STAT_ACCORDION_DEFAULT_COLOR}` },
                  ],
                  ["span", {}, l.label],
                ]),
              ],
            ]
          : []),
      ],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(StatAccordionView);
  },
  // Markdown fallback - toan bo 1 khoi HTML tho (giong QuestionPicker/
  // CuratedList/TocBlock: du lieu la SNAPSHOT attrs, khong phai ProseMirror
  // children that nen khong the state.renderContent() nhu Accordion thuong).
  // PHAI ghi LAI title/count/description/items/legend duoi dang data-*
  // attribute tren <details> (escape dung chuan HTML attribute) - bug that
  // su neu bo qua (giong Accordion o tren): parseHTML cua node nay doc cac
  // attrs TU CHINH cac data-* nay (xem addAttributes), thieu se khien MOI
  // Entry da luu bi RESET het items/legend/title ve rong/mac dinh moi lan mo
  // lai (khong crash nhu Accordion vi node nay la atom/content rong, nhung
  // van la MAT DU LIEU that su).
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const title = (node.attrs.title as string) || "Tiêu đề";
          const description = (node.attrs.description as string) ?? "";
          const open = node.attrs.open !== false;
          const items = (node.attrs.items ?? []) as StatAccordionItem[];
          const legend = (node.attrs.legend ?? []) as StatAccordionLegendItem[];
          // Badge so luong TU TINH tu items.length (xem comment renderHTML o
          // tren) - `data-count` van duoc GHI de tuong thich nguoc parseHTML
          // cua entry cu (attrs.count khong con dung de HIEN THI nua).
          const count = items.length;
          const escapeHtml = (s: string) =>
            s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
          const dot = (color: string) =>
            `<span class="stat-accordion-dot" style="background-color:${color || STAT_ACCORDION_DEFAULT_COLOR}"></span>`;
          const itemAttrsHtml = (item: StatAccordionItem) => {
            const attrs = statAccordionItemAttrs(item);
            return Object.entries(attrs)
              .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
              .join(" ");
          };
          const itemsHtml = items
            .map(
              (item) =>
                `<div ${itemAttrsHtml(item)}>${dot(item.color)}<span class="stat-accordion-item-text">${escapeHtml(item.text)}</span></div>`,
            )
            .join("");
          const legendHtml = legend.length
            ? `<div class="stat-accordion-legend">${legend
                .map((l) => `<div class="stat-accordion-legend-item">${dot(l.color)}<span>${escapeHtml(l.label)}</span></div>`)
                .join("")}</div>`
            : "";
          const descriptionHtml = description
            ? `<p class="stat-accordion-description">${escapeHtml(description)}</p>`
            : "";
          // data-* la NGUON THAT SU parseHTML doc lai luc mo Entry (xem
          // addAttributes) - phan HTML con lai (summary/list/legend) chi la
          // BAN HIEN THI cho nguoi doc, khong duoc parseHTML dung toi.
          const html =
            `<details class="stat-accordion" data-stat-accordion` +
            ` data-title="${escapeHtml(title)}"` +
            ` data-description="${escapeHtml(description)}"` +
            ` data-items="${escapeHtml(JSON.stringify(items))}"` +
            ` data-legend="${escapeHtml(JSON.stringify(legend))}"` +
            `${open ? " open" : ""}>` +
            `<summary class="stat-accordion-summary"><span class="stat-accordion-title">${escapeHtml(title)}</span>` +
            (count > 0 ? `<span class="stat-accordion-badge">${count}</span>` : "") +
            `</summary>` +
            `<div class="stat-accordion-body">${descriptionHtml}<div class="stat-accordion-list">${itemsHtml}</div>${legendHtml}</div>` +
            `</details>`;
          state.ensureNewLine();
          state.write(html);
          state.ensureNewLine();
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
    QuestionPicker,
    Accordion,
    StatAccordion,
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
  "[&_.curated-list-excerpt]:text-[12.5px] [&_.curated-list-excerpt]:text-ink-faint [&_.curated-list-excerpt]:no-underline " +
  // "TOC 4-box cau hoi" (QuestionPicker) - ban render TINH (<details> thuan,
  // khong NodeView, xem comment QuestionPicker) - grid 2 cot, moi o tu
  // bam mo/dong qua <summary>, ::-webkit-details-marker an di de dung rieng
  // chevron SVG (xoay 180deg khi [open]).
  "[&_div[data-question-picker]]:my-5 [&_div[data-question-picker]]:grid [&_div[data-question-picker]]:grid-cols-1 [&_div[data-question-picker]]:gap-2 sm:[&_div[data-question-picker]]:grid-cols-2 " +
  "[&_.question-picker-item]:rounded-xl [&_.question-picker-item]:border [&_.question-picker-item]:border-border [&_.question-picker-item]:px-3.5 " +
  "[&_.question-picker-item[open]]:bg-surface-muted " +
  "[&_.question-picker-summary]:flex [&_.question-picker-summary]:cursor-pointer [&_.question-picker-summary]:list-none [&_.question-picker-summary]:items-center [&_.question-picker-summary]:gap-2.5 [&_.question-picker-summary]:py-3 [&_.question-picker-summary]:select-none " +
  "[&_.question-picker-summary::-webkit-details-marker]:hidden [&_.question-picker-summary::marker]:content-none " +
  "[&_.question-picker-index]:font-mono [&_.question-picker-index]:text-[12px] [&_.question-picker-index]:text-ink-faint " +
  "[&_.question-picker-question]:flex-1 [&_.question-picker-question]:text-[14.5px] [&_.question-picker-question]:font-semibold [&_.question-picker-question]:text-ink " +
  "[&_.question-picker-chevron]:shrink-0 [&_.question-picker-chevron]:text-ink-faint [&_.question-picker-chevron]:transition-transform [&_.question-picker-chevron]:duration-150 " +
  "[&_.question-picker-item[open]_.question-picker-chevron]:rotate-180 " +
  "[&_.question-picker-description]:mb-3.5 [&_.question-picker-description]:text-[13.5px] [&_.question-picker-description]:text-ink-muted " +
  // Accordion - <details>/<summary> THUAN (trinh duyet tu lo mo/dong, xem
  // comment Accordion trong node o tren). ::-webkit-details-marker/::marker
  // an di de dung rieng chevron SVG (xoay -90deg khi DONG, khac
  // QuestionPicker xoay 180deg khi MO - huong nguoc lai vi Accordion mac
  // dinh MO con QuestionPicker mac dinh DONG).
  //
  // [2026-09-16 FIX] Selector goc dung "div[data-accordion]"/
  // "div[data-stat-accordion]" nhung THE THAT su la <details> (khong phai
  // <div>) - CSS nay CHUA BAO GIO khop, khien toan bo khung/border/padding
  // KHONG AP DUNG (chi may class thuan nhu .accordion-summary la con chay) -
  // bug that su nguoi dung phat hien khi long StatAccordion vao trong
  // Accordion ("2 loại accordion lồng nhau... không phân biệt được cấp nào").
  // Doi sang class ".accordion-block"/".stat-accordion" (co san tren chinh
  // <details>, khong phu thuoc ten the) + THEM 1 lop rieng cho truong hop
  // LONG NHAU (".accordion-body .accordion-block"/".accordion-body
  // .stat-accordion") - nen MO hon (bg-surface-muted) + margin nho hon de
  // TUONG PHAN ro voi khung ngoai, giup phan biet cap do long thay vi ca 2
  // cap trong y HET nhau.
  "[&_.accordion-block]:my-4 [&_.accordion-block]:overflow-hidden [&_.accordion-block]:rounded-xl [&_.accordion-block]:border [&_.accordion-block]:border-border [&_.accordion-block]:bg-surface " +
  "[&_.accordion-body_.accordion-block]:my-3 [&_.accordion-body_.accordion-block]:rounded-lg [&_.accordion-body_.accordion-block]:bg-surface-muted " +
  "[&_.accordion-summary]:flex [&_.accordion-summary]:cursor-pointer [&_.accordion-summary]:list-none [&_.accordion-summary]:items-center [&_.accordion-summary]:gap-2 [&_.accordion-summary]:px-3.5 [&_.accordion-summary]:py-2.5 [&_.accordion-summary]:text-[14.5px] [&_.accordion-summary]:font-semibold [&_.accordion-summary]:text-ink [&_.accordion-summary]:select-none " +
  "[&_.accordion-summary::-webkit-details-marker]:hidden [&_.accordion-summary::marker]:content-none " +
  "[&_.accordion-summary]:before:content-['▾'] [&_.accordion-summary]:before:inline-block [&_.accordion-summary]:before:text-ink-faint [&_.accordion-summary]:before:transition-transform [&_.accordion-summary]:before:duration-150 " +
  "[&_.accordion-block:not([open])_.accordion-summary]:before:-rotate-90 " +
  "[&_.accordion-body]:border-t [&_.accordion-body]:border-border [&_.accordion-body]:px-3.5 [&_.accordion-body]:py-3 [&_.accordion-body_p]:my-1 " +
  // Accordion thong ke (StatAccordion) - cung <details>/<summary> THUAN nhu
  // Accordion o tren, nhung marker "+"/"-" thay vi tam giac (dung y mockup
  // AWS Global Infrastructure nguoi dung gui) + 1 badge so luong canh tieu
  // de. Danh sach dang GRID 2 cot dam cham mau (giong tinh than
  // SeriesQuestionPickerToc.tsx), gioi han chieu cao + tu cuon khi qua dai
  // (dung mockup co thanh cuon rieng cho phan list).
  "[&_.stat-accordion]:my-4 [&_.stat-accordion]:overflow-hidden [&_.stat-accordion]:rounded-xl [&_.stat-accordion]:border [&_.stat-accordion]:border-border [&_.stat-accordion]:bg-surface " +
  "[&_.accordion-body_.stat-accordion]:my-3 [&_.accordion-body_.stat-accordion]:rounded-lg [&_.accordion-body_.stat-accordion]:bg-surface-muted " +
  "[&_.stat-accordion-summary]:flex [&_.stat-accordion-summary]:cursor-pointer [&_.stat-accordion-summary]:list-none [&_.stat-accordion-summary]:items-center [&_.stat-accordion-summary]:gap-2.5 [&_.stat-accordion-summary]:px-3.5 [&_.stat-accordion-summary]:py-2.5 [&_.stat-accordion-summary]:select-none " +
  "[&_.stat-accordion-summary::-webkit-details-marker]:hidden [&_.stat-accordion-summary::marker]:content-none " +
  "[&_.stat-accordion-title]:flex-1 [&_.stat-accordion-title]:text-[14.5px] [&_.stat-accordion-title]:font-semibold [&_.stat-accordion-title]:text-ink " +
  // bg-ink/8 (khong phai bg-surface-muted co dinh) - badge nam tren NEN CO
  // THE la bg-surface (cap ngoai) HOAC bg-surface-muted (cap long nhau, xem
  // ".accordion-body .stat-accordion" o tren), 1 lop toi mo 8% tren CA 2 nen
  // do deu tao du tuong phan thay vi co dinh 1 mau de bi "chim" khi trung mau
  // nen.
  "[&_.stat-accordion-badge]:rounded-md [&_.stat-accordion-badge]:bg-ink/8 [&_.stat-accordion-badge]:px-2 [&_.stat-accordion-badge]:py-1 [&_.stat-accordion-badge]:text-[12.5px] [&_.stat-accordion-badge]:font-semibold [&_.stat-accordion-badge]:text-ink " +
  "[&_.stat-accordion-summary]:after:ml-1 [&_.stat-accordion-summary]:after:flex [&_.stat-accordion-summary]:after:size-5 [&_.stat-accordion-summary]:after:shrink-0 [&_.stat-accordion-summary]:after:items-center [&_.stat-accordion-summary]:after:justify-center [&_.stat-accordion-summary]:after:text-[15px] [&_.stat-accordion-summary]:after:leading-none [&_.stat-accordion-summary]:after:text-ink-faint [&_.stat-accordion-summary]:after:content-['+'] " +
  "[&_.stat-accordion[open]_.stat-accordion-summary]:after:content-['−'] " +
  "[&_.stat-accordion-body]:border-t [&_.stat-accordion-body]:border-border [&_.stat-accordion-body]:px-3.5 [&_.stat-accordion-body]:py-3 " +
  "[&_.stat-accordion-description]:mb-3 [&_.stat-accordion-description]:text-[13.5px] [&_.stat-accordion-description]:text-ink-muted " +
  "[&_.stat-accordion-list]:grid [&_.stat-accordion-list]:max-h-64 [&_.stat-accordion-list]:grid-cols-1 [&_.stat-accordion-list]:gap-x-4 [&_.stat-accordion-list]:gap-y-1.5 [&_.stat-accordion-list]:overflow-y-auto sm:[&_.stat-accordion-list]:grid-cols-2 " +
  "[&_.stat-accordion-item]:flex [&_.stat-accordion-item]:items-center [&_.stat-accordion-item]:gap-2 [&_.stat-accordion-item]:rounded-md [&_.stat-accordion-item]:py-0.5 [&_.stat-accordion-item-text]:text-[13.5px] [&_.stat-accordion-item-text]:text-ink " +
  // Dong co toa do (lat/lng) - bam duoc de mo modal globe 3D (xem
  // RegionGlobeModal.tsx/EntryContentWithGlobe.tsx) - chi bao truc quan bang
  // cursor + gach chan luc hover, KHONG doi mau (giu dung tinh than "hover
  // nhe nhang" da ap dung cho SeriesQuestionPickerToc.tsx).
  "[&_.stat-accordion-item-clickable]:-mx-1.5 [&_.stat-accordion-item-clickable]:cursor-pointer [&_.stat-accordion-item-clickable]:px-1.5 [&_.stat-accordion-item-clickable]:transition-colors [&_.stat-accordion-item-clickable]:duration-150 [&_.stat-accordion-item-clickable]:hover:bg-hover-bg " +
  "[&_.stat-accordion-item-clickable_.stat-accordion-item-text]:hover:underline [&_.stat-accordion-item-clickable_.stat-accordion-item-text]:underline-offset-2 " +
  "[&_.stat-accordion-dot]:inline-block [&_.stat-accordion-dot]:size-2 [&_.stat-accordion-dot]:shrink-0 [&_.stat-accordion-dot]:rounded-full " +
  "[&_.stat-accordion-legend]:mt-3 [&_.stat-accordion-legend]:flex [&_.stat-accordion-legend]:flex-col [&_.stat-accordion-legend]:gap-1.5 [&_.stat-accordion-legend]:border-t [&_.stat-accordion-legend]:border-border [&_.stat-accordion-legend]:pt-3 " +
  "[&_.stat-accordion-legend-item]:flex [&_.stat-accordion-legend-item]:items-center [&_.stat-accordion-legend-item]:gap-2 [&_.stat-accordion-legend-item]:text-[12.5px] [&_.stat-accordion-legend-item]:text-ink-faint";
