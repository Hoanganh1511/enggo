import { Node, Extension, mergeAttributes, type Extensions } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { TextStyle, Color, BackgroundColor } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { GlossaryHint } from "./glossary-hint-extension";
import { CuratedListView } from "./curated-list-view";
import { QuestionPickerView } from "./question-picker-view";
import { AccordionView } from "./accordion-view";
import { StatAccordionView } from "./stat-accordion-view";
import { FlowDiagramView } from "./flow-diagram-view";
import { GridView } from "./grid-view";
import { GridCellView } from "./grid-cell-view";
import { CardGridView } from "./card-grid-view";
import { ProfileBlockView } from "./profile-block-view";

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

// Xay noi dung <summary> - dung CHUNG cho ca renderHTML (tra ve mang
// DOMOutputSpec) LAN markdown serialize (tra ve chuoi HTML tho, xem
// accordionSummaryHtml duoi) - CHI khac o dinh dang tra ve, LOGIC/cau truc y
// het nhau. Che do thuong: chi tra ve title (string) dung y HET hanh vi cu.
function accordionSummaryContent(
  title: string,
  mediaHeader: boolean,
  mediaImage: string | null,
  mediaDescription: string,
): unknown[] {
  if (!mediaHeader) return [title];
  return [
    [
      "div",
      { class: "accordion-summary-media" },
      mediaImage
        ? ["img", { class: "accordion-summary-icon", src: mediaImage, alt: title }]
        : ["div", { class: "accordion-summary-icon accordion-summary-icon-empty" }],
      [
        "div",
        { class: "accordion-summary-text" },
        ["span", { class: "accordion-summary-title" }, title],
        ...(mediaDescription ? [["p", { class: "accordion-summary-desc" }, mediaDescription]] : []),
      ],
    ],
  ];
}

function accordionSummaryHtml(
  title: string,
  mediaHeader: boolean,
  mediaImage: string | null,
  mediaDescription: string,
  escapeHtml: (s: string) => string,
): string {
  if (!mediaHeader) return escapeHtml(title);
  const iconHtml = mediaImage
    ? `<img class="accordion-summary-icon" src="${escapeHtml(mediaImage)}" alt="${escapeHtml(title)}">`
    : `<div class="accordion-summary-icon accordion-summary-icon-empty"></div>`;
  const descHtml = mediaDescription ? `<p class="accordion-summary-desc">${escapeHtml(mediaDescription)}</p>` : "";
  return (
    `<div class="accordion-summary-media">${iconHtml}` +
    `<div class="accordion-summary-text"><span class="accordion-summary-title">${escapeHtml(title)}</span>${descHtml}</div></div>`
  );
}

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
        // querySelector(".accordion-summary-title") TRUOC - o che do
        // mediaHeader, <summary> long them anh+mo ta (xem accordionSummaryContent
        // duoi), doc thang textContent cua CA summary se GOP LUON chu mo ta
        // vao title. Van giu fallback ve toan bo summary cho che do THUONG
        // (khong doi hanh vi cu).
        parseHTML: (el) => {
          const summary = el.querySelector(":scope > summary");
          const titleEl = summary?.querySelector(".accordion-summary-title");
          return (titleEl ?? summary)?.textContent?.trim() || "Tiêu đề";
        },
        renderHTML: (attrs) => ({ "data-title": attrs.title as string }),
      },
      open: {
        default: true,
        parseHTML: (el) => el.hasAttribute("open"),
        renderHTML: (attrs) => ({ "data-open": attrs.open === false ? "false" : "true" }),
      },
      // [2026-09-20] "Accordion với header dạng layout" - yeu cau nguoi dung
      // kem anh mau (icon vuong + tieu de + mo ta trong 1 hang, xem popover
      // "Accordion" trong PostEditorToolbar.tsx): "cái tiếp theo là accordion
      // với header có structure layout như trong ảnh: có ảnh vuông rồi tới
      // title và mô tả". 3 attrs THUAN moi (khong phai ProseMirror children -
      // giong tinh than head cua GridCell/ProfileBlock), doc/ghi qua data-*
      // TRUC TIEP tren <details> (khong dua vao DOM content ben trong summary
      // nhu title o tren, tranh lap lai chinh bug da tung xay ra - xem comment
      // dau addAttributes() ve "F5 trang bị lỗi").
      mediaHeader: {
        default: false,
        parseHTML: (el) => el.getAttribute("data-media-header") === "true",
        renderHTML: (attrs) => ({ "data-media-header": attrs.mediaHeader ? "true" : "false" }),
      },
      mediaImage: {
        default: null as string | null,
        parseHTML: (el) => el.getAttribute("data-media-image") || null,
        renderHTML: (attrs) => (attrs.mediaImage ? { "data-media-image": attrs.mediaImage as string } : {}),
      },
      mediaDescription: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-media-description") || "",
        renderHTML: (attrs) =>
          attrs.mediaDescription ? { "data-media-description": attrs.mediaDescription as string } : {},
      },
    };
  },
  parseHTML() {
    return [{ tag: "details[data-accordion]", contentElement: ":scope > div.accordion-body" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const title = (node.attrs.title as string) || "Tiêu đề";
    const open = node.attrs.open !== false;
    const mediaHeader = Boolean(node.attrs.mediaHeader);
    const mediaImage = node.attrs.mediaImage as string | null;
    const mediaDescription = (node.attrs.mediaDescription as string) || "";
    return [
      "details",
      mergeAttributes(HTMLAttributes, { "data-accordion": "", ...(open ? { open: "" } : {}) }),
      ["summary", { class: "accordion-summary" }, ...accordionSummaryContent(title, mediaHeader, mediaImage, mediaDescription)],
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
          const mediaHeader = Boolean(node.attrs.mediaHeader);
          const mediaImage = node.attrs.mediaImage as string | null;
          const mediaDescription = (node.attrs.mediaDescription as string) || "";
          const escapeHtml = (s: string) =>
            s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
          const summaryHtml = accordionSummaryHtml(title, mediaHeader, mediaImage, mediaDescription, escapeHtml);
          state.ensureNewLine();
          state.write(
            `<details class="accordion-block" data-accordion${open ? " open" : ""}` +
              `${mediaHeader ? ' data-media-header="true"' : ""}` +
              `${mediaImage ? ` data-media-image="${escapeHtml(mediaImage)}"` : ""}` +
              `${mediaDescription ? ` data-media-description="${escapeHtml(mediaDescription)}"` : ""}>\n` +
              `<summary class="accordion-summary">${summaryHtml}</summary>\n` +
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

// [2026-09-16] Cau truc lai item theo dung 3 tang THAT cua AWS Global
// Infrastructure - yeu cau nguoi dung: "đừng lưu đơn thuần [text/color/lat/lng
// phang]... vì UI của bạn thực chất có 3 tầng: Geographic Area → AWS Region →
// Availability Zones" (AWS dinh nghia 1 Region la 1 physical location chua
// cac AZ, moi Region toi thieu 3 AZ). `name` thay `text` (ten hien thi, vd
// "South America (São Paulo)"), `geographicArea` (vd "South America" - CHI
// co y nghia cho tang "AWS Region", KHONG ap dung cho danh sach khac nhu
// "Edge Locations" - von la 1 khai niem AWS Global Infrastructure RIENG,
// khong phai Region/AZ), `code` la ma Region chinh thuc cua AWS (vd
// "sa-east-1"), `coordinates` thay lat/lng PHANG (nhom lai dung 1 khoi toa
// do thay vi 2 truong roi rac), `status` thay `color` TRUC TIEP - mau dot
// gio la 1 GIA TRI SUY RA tu status (xem STAT_ACCORDION_STATUSES), khong con
// luu hex tuy y tren tung dong (dung tinh than "5 trạng thái phổ thông"
// nguoi dung yeu cau truoc do, gio hoa thanh 1 enum ro nghia thay vi hex).
// [2026-09-17] Them "none" - yeu cau nguoi dung: "Cho phép config có chấm
// tròn màu hoặc không" (mot so danh sach nhu "Edge Locations" khong thuc su
// can bieu dien trang thai bang mau, chi can 1 danh sach ten thuan). Khac 4
// trang thai con lai (LUON co mau), "none" nghia la KHONG render dot nao ca
// (xem statAccordionStatusColor - tra ve null rieng cho truong hop nay).
export type StatAccordionStatus = "none" | "normal" | "active" | "comingSoon" | "discontinued" | "unavailable";

export type StatAccordionItem = {
  name: string;
  geographicArea?: string;
  code?: string;
  status?: StatAccordionStatus;
  coordinates?: { lat: number; lng: number };
};
export type StatAccordionLegendItem = { color: string; label: string };

// Mau mac dinh cho status "normal" (chua chon) - DEN (yeu cau nguoi dung
// truoc do: "Để chấm màu mặc định là Đen").
export const STAT_ACCORDION_DEFAULT_COLOR = "#000000";

// 5 trang thai pho thong cua 1 dang mat hang (yeu cau nguoi dung: "có thể
// tùy chọn 5 loại màu cho 5 trạng thái phổ thông") - moi status co 1 `id` ON
// DINH duoc LUU vao item.status, mau (`value`) chi la CACH HIEN THI suy ra
// tu id do (xem statAccordionStatusColor duoi), khong con la du lieu doc lap
// tren tung dong nua.
// "none" dat DAU DANH SACH - 1 lua chon "tat" ro rang, khong lan voi 5 mau
// that. `value` cua no chi mang tinh trang tri (khong dung de render dot
// that, xem statAccordionStatusColor tra null truoc khi tra bang nay).
export const STAT_ACCORDION_STATUSES: { id: StatAccordionStatus; value: string; label: string }[] = [
  { id: "none", value: "transparent", label: "Không hiện chấm màu" },
  { id: "normal", value: "#000000", label: "Bình thường" },
  { id: "active", value: "#22c55e", label: "Đang hoạt động" },
  { id: "comingSoon", value: "#f59e0b", label: "Sắp ra mắt" },
  { id: "discontinued", value: "#94a3b8", label: "Ngừng cung cấp" },
  { id: "unavailable", value: "#ef4444", label: "Ngừng hoạt động" },
];

// Tra ve null khi status="none" (KHONG render dot nao ca) - cac cho goi ham
// nay (renderHTML/markdown serialize duoi) phai tu kiem tra null truoc khi
// ve span dot.
export function statAccordionStatusColor(status: StatAccordionStatus | undefined): string | null {
  if (status === "none") return null;
  return (
    STAT_ACCORDION_STATUSES.find((s) => s.id === (status ?? "normal"))?.value ?? STAT_ACCORDION_DEFAULT_COLOR
  );
}

// Attrs dung chung cho 1 dong item (renderHTML LAN markdown serialize duoi -
// chi item nao co `coordinates` moi gan them "data-lat"/"data-lng" + class
// rieng de CSS bao hieu bam duoc (xem POST_PROSE_CLASS) - EntryContentWithGlobe.tsx
// doc lai 2 data-* nay qua 1 click handler UY QUYEN (delegated), KHONG can
// hydrate rieng tung dong (item van la HTML tho thuan tuy, xem comment
// StatAccordion.addStorage o duoi).
function statAccordionItemAttrs(item: StatAccordionItem): Record<string, string> {
  const hasCoords = Boolean(item.coordinates);
  return {
    class: hasCoords ? "stat-accordion-item stat-accordion-item-clickable" : "stat-accordion-item",
    ...(hasCoords
      ? { "data-lat": String(item.coordinates!.lat), "data-lng": String(item.coordinates!.lng) }
      : {}),
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
          ...items.map((item) => {
            const dotColor = statAccordionStatusColor(item.status);
            return [
              "div",
              statAccordionItemAttrs(item),
              ...(dotColor
                ? [["span", { class: "stat-accordion-dot", style: `background-color:${dotColor}` }]]
                : []),
              ["span", { class: "stat-accordion-item-text" }, item.name],
            ];
          }),
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
            .map((item) => {
              const dotColor = statAccordionStatusColor(item.status);
              return `<div ${itemAttrsHtml(item)}>${dotColor ? dot(dotColor) : ""}<span class="stat-accordion-item-text">${escapeHtml(item.name)}</span></div>`;
            })
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

// [2026-09-18] "Sơ đồ luồng" (Flow Diagram) - yeu cau nguoi dung dua tren 1
// so do ASCII lam vi du (AWS Global Infrastructure -> Region -> Availability
// Zones -> Local Zones -> Edge Locations, moi mui ten noi 2 buoc co 1 cau
// giai thich VI SAO can buoc tiep theo, vd "One geographic area is not
// enough for resilience."): "Trong editor giờ thêm tính năng có thể hiển thị
// mô tả cho dạng sơ đồ như này". Cau truc: 1 danh sach BUOC theo THU TU doc
// (steps), moi buoc co `title` + `note` RIENG - `note` la cau mo ta gan
// TREN MUI TEN roi khoi CHINH buoc nay toi buoc KE TIEP (buoc CUOI CUNG
// khong co mui ten nao di ra nen `note` cua no khong duoc hien, du co dien).
// La node ATOM (giong QuestionPicker/StatAccordion) - toan bo la 1 SNAPSHOT
// attrs JSON, khong phai ProseMirror children that (danh sach CO CAU TRUC,
// khong can rich text tren tung buoc).
// [2026-09-18] Doi tu MANG PHANG "steps[]" sang CAY - yeu cau nguoi dung:
// "muốn rẽ nhánh thì làm sao?" (vd 1 AWS Region re ra 3 AZ, moi AZ lai co
// Workload rieng - khong con la 1 chuoi thang duy nhat nua). `children` la
// DANH SACH NHANH xuat phat TU chinh buoc nay (0 nhanh = buoc cuoi, 1 nhanh =
// van la 1 duong thang nhu truoc, >1 nhanh = re nhieu huong). `note` gan
// TREN CANH DAN TOI chinh no (khac quy uoc CU la note gan tren buoc nguon -
// xem legacyStepsToTree() ve ly do doi chieu khi doc du lieu cu).
export type FlowDiagramStep = { title: string; note?: string; children?: FlowDiagramStep[] };

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Xuong dong trong tieu de 1 buoc (yeu cau nguoi dung: "muốn xuống dòng viết
// không được" - FlowNodeEditor.tsx truoc do dung <input> mot dong, khong go
// Enter duoc) - tach thanh mang node text/["br"] xen ke de dua vao
// renderFlowNode (DOMOutputSpec dang mang cua ProseMirror, KHONG the chen
// chuoi "<br>" tho vao day, phai la 1 phan tu ["br"] rieng).
function titleToBrNodes(title: string): unknown[] {
  return title.split("\n").flatMap((line, i) => (i === 0 ? [line] : [["br"], line]));
}

// Du lieu CU (truoc khi co re nhanh) luu 1 mang phang "steps[]", moi step co
// `note` mo ta CANH RA (toi step ke tiep). Chuyen thanh 1 cay CHUOI DON (moi
// buoc dung 1 `children` duy nhat) de tuong thich nguoc voi cac FlowDiagram
// da luu trong noi dung Entry TU TRUOC - khong can migrate DB, chi doc lai
// dung o day. `note` cua step[i] (canh i -> i+1) tro thanh `note` cua CHINH
// step[i+1] trong cay moi (canh DAN TOI no).
function legacyStepsToTree(steps: { title: string; note?: string }[]): FlowDiagramStep | null {
  if (steps.length === 0) return null;
  let node: FlowDiagramStep = { title: steps[steps.length - 1].title };
  for (let i = steps.length - 2; i >= 0; i--) {
    node = { title: steps[i].title, children: [{ ...node, note: steps[i].note }] };
  }
  return node;
}

// Render 1 NUT (buoc) va toan bo cay con cua no thanh cac the HTML (dung
// CHUNG cho ca renderHTML cua ProseMirror lan serialize markdown - xem duoi).
// - 0 nhanh: dung lai, khong ve gi them.
// - 1 nhanh: y HET truoc day (1 mui ten thang xuong, co the kem note).
// - >1 nhanh: 1 "than cay" (trunk) xuong 1 THANH NGANG dung chung, roi tung
//   "nhanh" (branch) rieng xuong tung buoc con - CSS o POST_PROSE_CLASS/
//   docs-prose.ts ve ky thuat noi thanh ngang toi CHINH GIUA tung buoc, bat
//   ke cac buoc rong/hep khac nhau.
function renderFlowNode(node: FlowDiagramStep): unknown[] {
  const children = node.children ?? [];
  const stepEl = ["div", { class: "flow-diagram-step" }, ...titleToBrNodes(node.title)];
  if (children.length === 0) return [stepEl];
  if (children.length === 1) {
    const child = children[0];
    return [
      stepEl,
      [
        "div",
        { class: "flow-diagram-arrow" },
        ...(child.note ? [["p", { class: "flow-diagram-note" }, child.note]] : []),
      ],
      ...renderFlowNode(child),
    ];
  }
  return [
    stepEl,
    ["div", { class: "flow-diagram-trunk" }],
    [
      "div",
      { class: "flow-diagram-branches" },
      ...children.map((child) => [
        "div",
        { class: "flow-diagram-branch" },
        ["div", { class: "flow-diagram-branch-stem" }],
        ...(child.note ? [["p", { class: "flow-diagram-note-branch" }, child.note]] : []),
        ["div", { class: "flow-diagram-node" }, ...renderFlowNode(child)],
      ]),
    ],
  ];
}

function flowNodeToHtml(node: FlowDiagramStep): string {
  const children = node.children ?? [];
  const stepHtml = `<div class="flow-diagram-step">${escapeHtmlAttr(node.title).replace(/\n/g, "<br>")}</div>`;
  if (children.length === 0) return stepHtml;
  if (children.length === 1) {
    const child = children[0];
    const noteHtml = child.note ? `<p class="flow-diagram-note">${escapeHtmlAttr(child.note)}</p>` : "";
    return `${stepHtml}<div class="flow-diagram-arrow">${noteHtml}</div>${flowNodeToHtml(child)}`;
  }
  const branchesHtml = children
    .map((child) => {
      const noteHtml = child.note
        ? `<p class="flow-diagram-note-branch">${escapeHtmlAttr(child.note)}</p>`
        : "";
      return (
        `<div class="flow-diagram-branch"><div class="flow-diagram-branch-stem"></div>` +
        `${noteHtml}<div class="flow-diagram-node">${flowNodeToHtml(child)}</div></div>`
      );
    })
    .join("");
  return `${stepHtml}<div class="flow-diagram-trunk"></div><div class="flow-diagram-branches">${branchesHtml}</div>`;
}

export const FlowDiagram = Node.create({
  name: "flowDiagram",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      root: {
        default: null as FlowDiagramStep | null,
        parseHTML: (el) => {
          const rootAttr = el.getAttribute("data-root");
          if (rootAttr) {
            try {
              return JSON.parse(rootAttr) as FlowDiagramStep;
            } catch {
              return null;
            }
          }
          // Fallback du lieu CU (truoc khi co re nhanh) - xem legacyStepsToTree().
          const stepsAttr = el.getAttribute("data-steps");
          if (stepsAttr) {
            try {
              return legacyStepsToTree(JSON.parse(stepsAttr) as { title: string; note?: string }[]);
            } catch {
              return null;
            }
          }
          return null;
        },
        renderHTML: (attrs) => ({ "data-root": JSON.stringify(attrs.root ?? null) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-flow-diagram]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const root = node.attrs.root as FlowDiagramStep | null;
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "flow-diagram", "data-flow-diagram": "" }),
      ...(root ? renderFlowNode(root) : []),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(FlowDiagramView);
  },
  // Markdown fallback - toan bo 1 khoi HTML tho DUY NHAT (giong QuestionPicker/
  // TocBlock: du lieu la SNAPSHOT attrs, khong phai ProseMirror children
  // that) - data-root la NGUON THAT SU parseHTML doc lai (xem addAttributes),
  // phan HTML con lai (step/arrow/note/nhanh) chi la BAN HIEN THI cho nguoi doc.
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const root = node.attrs.root as FlowDiagramStep | null;
          const bodyHtml = root ? flowNodeToHtml(root) : "";
          const html = `<div class="flow-diagram" data-flow-diagram data-root="${escapeHtmlAttr(
            JSON.stringify(root),
          )}">${bodyHtml}</div>`;
          state.ensureNewLine();
          state.write(html);
          state.ensureNewLine();
          state.closeBlock(node);
        },
      },
    };
  },
});

// Grid + GridCell - "grid tuỳ chỉnh số hàng/cột, mỗi ô có phần HEAD (màu
// nền tuỳ chỉnh + số bước tự động 01/02/03... + badge chấm màu) và phần
// BODY (rich text thật: đậm/nghiêng/list/căn lề)" - yêu cầu người dùng (kèm
// ảnh mẫu 5 ô "01".."05"). KHÁC HẲN QuestionPicker/StatAccordion/TocBlock
// (dữ liệu là SNAPSHOT attrs JSON, không có ProseMirror children thật):
// GridCell dùng content THẬT "block+" (giống tinh thần Accordion) vì nội
// dung body cần RICH TEXT thật sự (đậm/nghiêng/list...), không nhét vừa vào
// 1 chuỗi JSON. LƯU Ý (xem comment "DA GO BO TrailingNode" ngay dưới đây,
// bug crash thật đã xảy ra với chính Accordion+StatAccordion): các thao tác
// thêm/bớt hàng-cột (grid-view.tsx) LUÔN tự tạo sẵn 1 paragraph rỗng bên
// trong mỗi ô mới - KHÔNG bao giờ dựa vào 1 plugin auto-fix content rỗng.
// [2026-09-19] Danh sach mau CHI la GOI Y NHANH (quick-pick), khong con la
// TAP HOP DUY NHAT nguoi dung duoc chon - yeu cau nguoi dung: "sao cứ set
// màu cố định? Cho color picker vào, cho tùy biến tên với mã màu chứ" (ban
// truoc: badge chi la 1 ENUM 5 gia tri co dinh "red/yellow/green/blue/gray",
// khong tu nhap duoc ma mau/ten rieng). Badge gio luu THANG 2 gia tri tu do:
// `badgeColor` (chuoi hex/rgba, cung validate voi headColor qua
// isValidCssColor) va `badgeLabel` (ten tuy y, hien qua thuoc tinh title/
// tooltip) - danh sach duoi day CHI con dung de ve cac nut "bam nhanh" goi y
// trong popover (GridCellHead.tsx), nguoi dung van tu go ma mau/ten khac neu
// muon.
export const GRID_BADGE_PRESETS: { value: string; label: string }[] = [
  { value: "#ef4444", label: "Đỏ" },
  { value: "#eab308", label: "Vàng" },
  { value: "#22c55e", label: "Xanh lá" },
  { value: "#3b82f6", label: "Xanh dương" },
  { value: "#94a3b8", label: "Xám" },
];

// Validate mau nen head - yeu cau nguoi dung: "Cho pick color hoặc nhập mã
// màu: hex, hoặc rgba, validate chuẩn". Chap nhan hex 3/6/8 ky tu VA
// rgb()/rgba() (khoang trang linh hoat giua cac phan) - export de
// GridCellHead.tsx (UI nhap tay) dung chung, tranh 2 noi tu dinh nghia lech
// nhau quy tac hop le.
const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGBA_COLOR_RE = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/i;
export function isValidCssColor(value: string): boolean {
  const trimmed = value.trim();
  return HEX_COLOR_RE.test(trimmed) || RGBA_COLOR_RE.test(trimmed);
}

// Kieu 1 dong (row) khong ton tai rieng trong schema - "hang" chi la 1 CACH
// GOM cac GridCell theo tung nhom `cols` phan tu lien tiep (dung CSS Grid tu
// nhien de xep, xem "grid-template-columns" trong renderHTML/GridView.tsx),
// khong can 1 node "gridRow" bao ngoai rieng - don gian hoa them/bot
// hang-cot (grid-view.tsx) xuong con thao tac THANG tren danh sach GridCell
// phang, khong can dieu huong qua 1 tang long nhau nua.
export const GridCell = Node.create({
  name: "gridCell",
  content: "block+",
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      headColor: {
        default: null as string | null,
        parseHTML: (el) => el.getAttribute("data-head-color") || null,
        renderHTML: (attrs) => (attrs.headColor ? { "data-head-color": attrs.headColor as string } : {}),
      },
      showStep: {
        default: false,
        parseHTML: (el) => el.getAttribute("data-show-step") === "true",
        renderHTML: (attrs) => ({ "data-show-step": attrs.showStep ? "true" : "false" }),
      },
      badgeColor: {
        default: null as string | null,
        parseHTML: (el) => el.getAttribute("data-badge-color") || null,
        renderHTML: (attrs) => (attrs.badgeColor ? { "data-badge-color": attrs.badgeColor as string } : {}),
      },
      badgeLabel: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-badge-label") || "",
        renderHTML: (attrs) => (attrs.badgeLabel ? { "data-badge-label": attrs.badgeLabel as string } : {}),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-grid-cell]", contentElement: ":scope > div.grid-cell-body" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const headColor = node.attrs.headColor as string | null;
    const showStep = node.attrs.showStep as boolean;
    const badgeColor = node.attrs.badgeColor as string | null;
    const badgeLabel = node.attrs.badgeLabel as string;
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "grid-cell", "data-grid-cell": "" }),
      [
        "div",
        {
          class: "grid-cell-head",
          contenteditable: "false",
          ...(headColor ? { style: `background-color:${headColor}` } : {}),
        },
        ...(badgeColor
          ? [["span", { class: "grid-cell-badge", style: `background-color:${badgeColor}`, ...(badgeLabel ? { title: badgeLabel } : {}) }]]
          : []),
        // So buoc THAT (index trong grid) chi tinh dung o GridView.tsx (luc
        // soan) VA Grid.addStorage() (luc xuat markdown that) - o day (renderHTML
        // TINH, ngoai 2 duong do) khong biet vi tri cua chinh no giua cac anh
        // em, de trong khi showStep=true la 1 xuong cap CHAP NHAN DUOC (giong
        // triet ly "fallback don gian hon" cua cac node khac trong file nay).
        ...(showStep ? [["span", { class: "grid-cell-step" }]] : []),
      ],
      ["div", { class: "grid-cell-body" }, 0],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(GridCellView);
  },
});

export const Grid = Node.create({
  name: "grid",
  group: "block",
  content: "gridCell+",
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      cols: {
        default: 3,
        parseHTML: (el) => Number(el.getAttribute("data-cols")) || 3,
        renderHTML: (attrs) => ({ "data-cols": String(attrs.cols as number) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-grid]", contentElement: ":scope > div.grid-cells" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const cols = node.attrs.cols as number;
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-grid": "" }),
      ["div", { class: "grid-cells", style: `grid-template-columns:repeat(${cols},1fr)` }, 0],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(GridView);
  },
  // Markdown fallback - giong tinh than Accordion (xem addStorage cua no o
  // tren): ghi THANG the <div> tho boc quanh, nhung NOI DUNG THAT ben trong
  // (than moi o) van la markdown that qua state.renderContent(cell) - PHAI
  // co dong trong TRUOC/SAU moi doan long trong (giong ly do Accordion da
  // ghi chu rat ky) de CommonMark/rehype-raw (DocsMarkdown.tsx) nhan dung
  // day la HTML tho long markdown, khong nuot lam text thuong.
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const cols = (node.attrs.cols as number) ?? 3;
          const cellsNode = node as unknown as {
            forEach: (fn: (cell: TiptapNode, offset: number, index: number) => void) => void;
          };
          state.ensureNewLine();
          state.write(`<div data-grid data-cols="${cols}"><div class="grid-cells" style="grid-template-columns:repeat(${cols},1fr)">\n\n`);
          let index = 0;
          cellsNode.forEach((cell) => {
            index += 1;
            const headColor = cell.attrs.headColor as string | null;
            const showStep = Boolean(cell.attrs.showStep);
            const badgeColor = cell.attrs.badgeColor as string | null;
            const badgeLabel = (cell.attrs.badgeLabel as string) || "";
            const headStyle = headColor ? ` style="background-color:${escapeHtmlAttr(headColor)}"` : "";
            const badgeHtml = badgeColor
              ? `<span class="grid-cell-badge" style="background-color:${escapeHtmlAttr(badgeColor)}"${badgeLabel ? ` title="${escapeHtmlAttr(badgeLabel)}"` : ""}></span>`
              : "";
            const stepHtml = showStep
              ? `<span class="grid-cell-step">${String(index).padStart(2, "0")}</span>`
              : "";
            state.ensureNewLine();
            state.write(
              `<div class="grid-cell" data-grid-cell${headColor ? ` data-head-color="${escapeHtmlAttr(headColor)}"` : ""}` +
                `${showStep ? ' data-show-step="true"' : ""}${badgeColor ? ` data-badge-color="${escapeHtmlAttr(badgeColor)}"` : ""}${badgeLabel ? ` data-badge-label="${escapeHtmlAttr(badgeLabel)}"` : ""}>` +
                `<div class="grid-cell-head"${headStyle}>${badgeHtml}${stepHtml}</div>` +
                `<div class="grid-cell-body">\n\n`,
            );
            state.renderContent(cell);
            state.ensureNewLine();
            state.write("\n</div></div>\n\n");
          });
          state.write("</div></div>");
          state.closeBlock(node);
        },
      },
    };
  },
});

// CardGrid - "grid các card" (icon vuông màu + chấm trạng thái + tiêu đề +
// mô tả + link "→ nhãn") - yêu cầu người dùng kèm ảnh mẫu (7 card AWS
// service: EC2/Lambda/ECS/EKS/Fargate/Batch/EMR). KHAC HAN Grid/GridCell o
// tren (content THAT, block+): moi truong o day (icon/mo ta/link) la du
// lieu CO CAU TRUC ro rang, KHONG can rich text tu do - nen dung lai dung
// tinh than StatAccordion (1 node ATOM DUY NHAT, du lieu la SNAPSHOT attrs
// JSON `items[]`), da CHUNG MINH long duoc trong Accordion an toan (yeu cau
// nguoi dung: "đảm bảo nó hoạt động trong cả accordion nhé" - StatAccordion
// SAN CO trong production da long trong Accordion nhieu noi, vd entry
// "architecture-map" nguoi dung dang dung, xem min-h-16 da them cho
// accordion-body trong accordion-view.tsx danh RIENG cho truong hop nay).
export type CardGridStatus = "none" | "red" | "yellow" | "green" | "gray";

export type CardGridItem = {
  icon: string;
  iconBg: string;
  title: string;
  status: CardGridStatus;
  description: string;
  linkLabel: string;
  linkHref: string;
};

// Mau cham trang thai - CUNG bo mau voi GRID_BADGE_COLORS o tren (dong nhat
// 1 bang mau trang thai DUY NHAT trong toan bo cac tinh nang Grid/CardGrid),
// them "none" (an han cham, giong STAT_ACCORDION_STATUSES) vi khong phai
// card nao cung can bao hieu trang thai.
export const CARD_GRID_STATUS_COLORS: { id: CardGridStatus; value: string | null; label: string }[] = [
  { id: "none", value: null, label: "Không hiện chấm" },
  { id: "red", value: "#ef4444", label: "Đỏ" },
  { id: "yellow", value: "#eab308", label: "Vàng" },
  { id: "green", value: "#22c55e", label: "Xanh lá" },
  { id: "gray", value: "#94a3b8", label: "Xám" },
];

export function cardGridStatusColor(status: CardGridStatus | undefined): string | null {
  return CARD_GRID_STATUS_COLORS.find((s) => s.id === (status ?? "none"))?.value ?? null;
}

const DEFAULT_CARD_GRID_ITEMS: CardGridItem[] = [
  { icon: "★", iconBg: "#6366f1", title: "Tiêu đề", status: "none", description: "", linkLabel: "", linkHref: "" },
];

export const CardGrid = Node.create({
  name: "cardGrid",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      items: {
        default: DEFAULT_CARD_GRID_ITEMS,
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-items") ?? "[]") as CardGridItem[];
          } catch {
            return DEFAULT_CARD_GRID_ITEMS;
          }
        },
        renderHTML: (attrs) => ({ "data-items": JSON.stringify(attrs.items ?? []) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-card-grid]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const items = (node.attrs.items ?? []) as CardGridItem[];
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-card-grid": "" }),
      ...items.map((item) => {
        const dotColor = cardGridStatusColor(item.status);
        return [
          "a",
          { class: "card-grid-item", href: item.linkHref || undefined },
          [
            "div",
            { class: "card-grid-item-top" },
            ["span", { class: "card-grid-item-icon", style: `background-color:${item.iconBg || "#6366f1"}` }, item.icon],
            ["span", { class: "card-grid-item-title" }, item.title],
            ...(dotColor ? [["span", { class: "card-grid-item-dot", style: `background-color:${dotColor}` }]] : []),
          ],
          ...(item.description ? [["p", { class: "card-grid-item-desc" }, item.description]] : []),
          ...(item.linkLabel ? [["span", { class: "card-grid-item-link" }, `→ ${item.linkLabel}`]] : []),
        ];
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CardGridView);
  },
  // Markdown fallback - toan bo 1 khoi HTML tho DUY NHAT (giong QuestionPicker/
  // StatAccordion/TocBlock o tren: du lieu la SNAPSHOT attrs, khong phai
  // ProseMirror children that).
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const items = (node.attrs.items ?? []) as CardGridItem[];
          const cardsHtml = items
            .map((item) => {
              const dotColor = cardGridStatusColor(item.status);
              const dotHtml = dotColor
                ? `<span class="card-grid-item-dot" style="background-color:${dotColor}"></span>`
                : "";
              const descHtml = item.description
                ? `<p class="card-grid-item-desc">${escapeHtmlAttr(item.description)}</p>`
                : "";
              const linkHtml = item.linkLabel
                ? `<span class="card-grid-item-link">→ ${escapeHtmlAttr(item.linkLabel)}</span>`
                : "";
              const tag = item.linkHref ? "a" : "div";
              const hrefAttr = item.linkHref ? ` href="${escapeHtmlAttr(item.linkHref)}"` : "";
              return (
                `<${tag} class="card-grid-item"${hrefAttr}>` +
                `<div class="card-grid-item-top">` +
                `<span class="card-grid-item-icon" style="background-color:${escapeHtmlAttr(item.iconBg || "#6366f1")}">${escapeHtmlAttr(item.icon)}</span>` +
                `<span class="card-grid-item-title">${escapeHtmlAttr(item.title)}</span>${dotHtml}` +
                `</div>${descHtml}${linkHtml}</${tag}>`
              );
            })
            .join("");
          state.ensureNewLine();
          state.write(`<div data-card-grid data-items="${escapeHtmlAttr(JSON.stringify(items))}">${cardsHtml}</div>`);
          state.ensureNewLine();
          state.closeBlock(node);
        },
      },
    };
  },
});

// SplitBlock + SplitColumn - "block chia đôi, soạn được bình thường ở cả 2
// bên" (yeu cau nguoi dung kem anh mau: cot trai hep chua tieu de, cot phai
// rong chua nhieu doan van). Dung content THAT "block+" cho MOI cot (giong
// tinh than GridCell o tren) vi 2 ben can RICH TEXT day du (dam/nghieng/
// list/heading...), khong phai du lieu co cau truc co dinh nhu CardGrid.
// KHONG can addNodeView() rieng cho ca 2 node nay (khac Grid/GridCell/
// CardGrid) - khong co dieu khien tuong tac nao rieng (khong doi ty le
// cot, khong doi mau...), nen DOM output mac dinh cua schema (renderHTML
// duoi day) DA DU de ProseMirror tu ve LUON ban soan (giong cach "paragraph"/
// "bulletList" hoat dong ma khong can NodeView rieng) - don gian va it rui
// ro hon (session nay da gap vai bug NodeView-long-nhau that su voi Accordion/
// StatAccordion, xem comment "DA GO BO TrailingNode" ngay duoi day).
export const SplitColumn = Node.create({
  name: "splitColumn",
  content: "block+",
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: "div[data-split-column]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "split-column", "data-split-column": "" }), 0];
  },
});

export const SplitBlock = Node.create({
  name: "splitBlock",
  group: "block",
  // "splitColumn splitColumn" (khong phai "splitColumn+") - LUON DUNG 2 cot,
  // khop dung y "chia đôi" nguoi dung mo ta (khong phai chia N cot tuy y).
  content: "splitColumn splitColumn",
  defining: true,
  isolating: true,
  parseHTML() {
    return [{ tag: "div[data-split-block]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { class: "split-block", "data-split-block": "" }), 0];
  },
  // Markdown fallback - giong tinh than Accordion/Grid (dong trong TRUOC/SAU
  // moi doan long trong bat buoc, xem giai thich chi tiet o Accordion.addStorage
  // phia tren) - NOI DUNG THAT cua tung cot van la markdown that qua
  // state.renderContent(col), KHONG xuong cap thanh text/JSON.
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const columnsNode = node as unknown as { forEach: (fn: (col: TiptapNode) => void) => void };
          state.ensureNewLine();
          state.write("<div data-split-block>\n\n");
          columnsNode.forEach((col) => {
            state.ensureNewLine();
            state.write("<div data-split-column>\n\n");
            state.renderContent(col);
            state.ensureNewLine();
            state.write("\n</div>\n\n");
          });
          state.write("</div>");
          state.closeBlock(node);
        },
      },
    };
  },
});

// ProfileBlock - "block dạng layout" DAU TIEN trong 1 he thong nhieu layout
// se bo sung dan (yeu cau nguoi dung: "Bổ sung thêm trong editor việc thêm
// các block dạng layout khác nhau, trước mắt thêm 1 block có layout như
// trong ảnh... Ảnh đại diện vuông, tên, sau đó phía dưới là nội dung"). Cau
// truc: HEAD la attrs THUAN (avatarUrl + name, khong phai ProseMirror
// children - khong can rich text cho ten) + BODY la content THAT "block+"
// (dung tinh than GridCell/SplitColumn o tren) vi "nội dung" phia duoi can
// soan binh thuong (dam/nghieng/list...), khong phai 1 chuoi JSON.
export const ProfileBlock = Node.create({
  name: "profileBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,
  addAttributes() {
    return {
      avatarUrl: {
        default: null as string | null,
        parseHTML: (el) => el.getAttribute("data-avatar-url") || null,
        renderHTML: (attrs) => (attrs.avatarUrl ? { "data-avatar-url": attrs.avatarUrl as string } : {}),
      },
      name: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-name") || "",
        renderHTML: (attrs) => (attrs.name ? { "data-name": attrs.name as string } : {}),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-profile-block]", contentElement: ":scope > div.profile-block-body" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    const avatarUrl = node.attrs.avatarUrl as string | null;
    const name = (node.attrs.name as string) || "";
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: "profile-block", "data-profile-block": "" }),
      [
        "div",
        { class: "profile-block-head", contenteditable: "false" },
        ...(avatarUrl
          ? [["img", { class: "profile-block-avatar", src: avatarUrl, alt: name }]]
          : [["div", { class: "profile-block-avatar profile-block-avatar-empty" }]]),
        ["span", { class: "profile-block-name" }, name],
      ],
      ["div", { class: "profile-block-body" }, 0],
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ProfileBlockView);
  },
  // Markdown fallback - giong tinh than SplitBlock o tren (dong trong TRUOC/
  // SAU doan long trong bat buoc) - NOI DUNG THAT trong body van la markdown
  // that qua state.renderContent(node), KHONG xuong cap thanh text/JSON.
  addStorage() {
    return {
      markdown: {
        serialize: (state: MarkdownSerializerState, node: TiptapNode) => {
          const avatarUrl = node.attrs.avatarUrl as string | null;
          const name = (node.attrs.name as string) || "";
          const avatarHtml = avatarUrl
            ? `<img class="profile-block-avatar" src="${escapeHtmlAttr(avatarUrl)}" alt="${escapeHtmlAttr(name)}">`
            : `<div class="profile-block-avatar profile-block-avatar-empty"></div>`;
          state.ensureNewLine();
          state.write(
            `<div data-profile-block${avatarUrl ? ` data-avatar-url="${escapeHtmlAttr(avatarUrl)}"` : ""}${name ? ` data-name="${escapeHtmlAttr(name)}"` : ""}>` +
              `<div class="profile-block-head">${avatarHtml}<span class="profile-block-name">${escapeHtmlAttr(name)}</span></div>` +
              `<div class="profile-block-body">\n\n`,
          );
          state.renderContent(node);
          state.ensureNewLine();
          state.write("\n</div></div>");
          state.closeBlock(node);
        },
      },
    };
  },
});

// [2026-09-18] DA GO BO "TrailingNode" (tung o day) - tung them de fix bug
// "thêm 1 cái accordion geographical vào sau cái accordion geographical
// trước đó đã đặt vào thì ko đặt dc con trỏ vào" (khong co "khe" con tro sau
// 1 node atom nam cuoi 1 vung noi dung). Extension nay tu dong chen paragraph
// qua 1 ProseMirror `appendTransaction` chay tren MOI transaction thay doi
// noi dung. Da qua 2 lan vá (bỏ qua transaction chỉ đổi selection, bọc
// try/catch) nhung nguoi dung VAN bao crash "Maximum update depth exceeded"
// (React error #185) MOI LAN bam con tro vao vung soan cua entry co nhieu
// Accordion long StatAccordion (architecture-map) - khong the xac dinh chac
// chan vong lap o dau trong plugin nay ma KHONG tai hien truc tiep duoc, nen
// go han thay vi tiep tuc va mu (loi crash ca trang nghiem trong hon nhieu
// so voi tien loi UX nho cua no). Neu can lai cho "khe con tro" nay trong
// tuong lai, nguoi dung van co the bam Enter/dung phim mui ten de di chuyen
// thay vi bam thang vao ngay sau node atom.

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
// Tab/Shift-Tab trong danh sach so/cham - yeu cau nguoi dung (kem anh chup
// "1. Phân loại theo category" roi 1 dong trong, roi lai "1. dsandsa" thay
// vi "2."): "khi xuống dòng ở 1., tôi tab vào thì nó sẽ là nội dung của 1.
// chứ đừng làm mất liên kết của 1. 2.". Mac dinh StarterKit KHONG gan phim
// tat nao cho Tab/Shift-Tab ca (xac nhan qua node_modules) - Tab trong
// contentEditable roi vao hanh vi goc cua trinh duyet (chuyen focus RA
// KHOI vung soan), dung luc do nguoi dung tuong nhu bi "mất liên kết" (con
// tro thoat khoi list, go tiep se khong con nam trong list nua, so voi ProseMirror
// hieu la bat dau lai tu "1." o VI TRI MOI). sinkListItem/liftListItem la
// lenh CO SAN cua chinh ListItem (dang ky boi StarterKit qua "listItem"),
// chi thieu phim tat goi toi - tra ve false khi khong ap dung duoc (khong o
// trong list, hoac list item DAU TIEN khong the sink) de Tab/Shift-Tab roi
// lai hanh vi mac dinh o noi khac (vd trong bang, TableKit tu xu ly rieng).
const ListTabKeymap = Extension.create({
  name: "listTabKeymap",
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.sinkListItem("listItem"),
      "Shift-Tab": () => this.editor.commands.liftListItem("listItem"),
    };
  },
});

export function getPostExtensions(): Extensions {
  return [
    StarterKit.configure({ link: false, underline: false }),
    ListTabKeymap,
    Underline,
    TaskList,
    TaskItem.configure({ nested: true }),
    Link.configure({ openOnClick: false }),
    Image.configure({ inline: false, allowBase64: false }),
    TableKit.configure({ table: { resizable: true } }),
    // TextStyle la mark NEN bat buoc de Color/BackgroundColor gan attrs len
    // (ca 2 deu luu vao style cua chinh mark "textStyle", khong phai mark
    // rieng) - yeu cau nguoi dung: "khi một vùng text được focus (con trỏ
    // giữ bôi tô) thì nút đó sẽ hiện lên, chọn màu nền, màu chữ" (xem
    // SelectionColorMenu.tsx - bubble menu noi dung nay hien khi co vung
    // chon van ban).
    // inclusive:false - bug nguoi dung bao "Tô màu xong không cách ra được
    // thêm 1 ký tự để thoát cái màu": mac dinh (inclusive:true, hanh vi goc
    // cua ProseMirror) khi con tro dung DUNG O RIA PHAI 1 vung da to mau, ky
    // tu go TIEP THEO se TU DONG "thua ke" mark do (van bi to mau nhu cu) -
    // hop ly cho bold/italic (muon go tiep tuc IN DAM) nhung PHAN TAC DUNG
    // voi mau nen/chu vi nguoi dung thuong go THEM 1 ky tu/dau cach NGAY SAU
    // vung mau chi de "thoat ra" khoi no. inclusive:false: mark KHONG con tu
    // mo rong o ria phai nua - go tiep tuc ngay sau vung mau se ra van ban
    // THUONG (mac dinh), giu nguyen kha nang chon "In đậm" tiep tuc binh
    // thuong o cac mark khac (bold/italic) vi day CHI doi rieng mark
    // "textStyle" (Color/BackgroundColor), khong dung chung schema voi cac
    // mark do.
    TextStyle.extend({ inclusive: false }),
    Color,
    BackgroundColor,
    // Can le trai/giua/phai - yeu cau nguoi dung cho phan body cua Grid ("text
    // body thì cho soạn bình thường, có căn chỉnh trái phải giữa, in đậm, in
    // nghiêng, list"). Ap dung cho ca "paragraph" (dung chung TOAN BO schema,
    // khong rieng gi Grid) - Grid.addStorage() ghi RA HTML tho (rehype-raw
    // doc dung), style="text-align:..." qua duoc nguyen ven; paragraph THUONG
    // (ngoai Grid, markdown thuan) neu can le khac "left" se tu xuong cap ve
    // trai khi luu (CommonMark khong co cu phap can le) - danh doi CHAP NHAN
    // DUOC, giong triet ly "xuong cap don gian hon" cua cac node khac trong
    // file nay khi ra khoi ngu canh HTML tho.
    TextAlign.configure({ types: ["paragraph"] }),
    Callout,
    GlossaryHint,
    GoDeeper,
    TocBlock,
    CuratedList,
    QuestionPicker,
    Accordion,
    StatAccordion,
    FlowDiagram,
    GridCell,
    Grid,
    CardGrid,
    SplitColumn,
    SplitBlock,
    ProfileBlock,
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
  "[&_h4]:mt-4 [&_h4]:mb-1.5 [&_h4]:text-[15.5px] [&_h4]:font-semibold " +
  "[&_p]:my-1 " +
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-2 [&_li_p]:my-0 " +
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-community-accent/40 [&_blockquote]:pl-4 " +
  "[&_hr]:my-8 [&_hr]:border-border " +
  "[&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] " +
  // Code block: mau toi CO DINH (#0d1117 kieu GitHub) cho ca light & dark -
  // KHONG dung bg-ink vi --ink dao thanh mau sang o dark mode se lam nen sang
  // + chu sang = mat chu.
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-[#0d1117] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:text-[#e6edf3] " +
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#e6edf3] " +
  "[&_img]:my-4 [&_img]:rounded-xl [&_img]:border [&_img]:border-border [&_img]:max-w-full " +
  // Table - border-separate (khong phai border-collapse) + border-radius o
  // <table>, moi o CHI ke border-phai/border-duoi (khong ke border-trai/tren
  // rieng, de border cua chinh <table> dam nhiem canh ngoai cung) - tranh loi
  // "border cong queo" tai giao diem giua cac o khi border-collapse xung
  // dot voi overflow-hidden+rounded-lg (xem giai thich chi tiet trong
  // DOCS_PROSE_CLASS o docs-prose.ts, 2 file COPY nhau, sua dong bo).
  "[&_table]:my-5 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-border [&_table]:border-separate [&_table]:border-spacing-0 [&_table]:text-[14px] " +
  "[&_th]:border-r [&_th]:border-b [&_th]:border-border [&_th]:bg-surface-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold " +
  "[&_td]:border-r [&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top " +
  "[&_tr>*:last-child]:border-r-0 [&_tbody_tr:last-child>*]:border-b-0 " +
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
  // "Accordion với header dạng layout" (icon vuong + tieu de + mo ta, xem
  // comment chi tiet trong post-extensions.ts/accordion-view.tsx). Chi
  // dinh lai font-weight/size cho ".accordion-summary-desc" - mac dinh no SE
  // ke thua font-semibold/14.5px tu ".accordion-summary" (chu thuong, khong
  // phai tieu de) neu khong ghi de rieng.
  "[&_.accordion-summary-media]:flex [&_.accordion-summary-media]:min-w-0 [&_.accordion-summary-media]:flex-1 [&_.accordion-summary-media]:items-center [&_.accordion-summary-media]:gap-3 " +
  "[&_.accordion-summary-icon]:size-10 [&_.accordion-summary-icon]:shrink-0 [&_.accordion-summary-icon]:rounded-lg [&_.accordion-summary-icon]:object-cover " +
  "[&_.accordion-summary-icon-empty]:bg-surface-muted " +
  "[&_.accordion-summary-text]:min-w-0 [&_.accordion-summary-text]:flex-1 " +
  "[&_.accordion-summary-title]:block [&_.accordion-summary-title]:truncate " +
  "[&_.accordion-summary-desc]:mt-0.5 [&_.accordion-summary-desc]:truncate [&_.accordion-summary-desc]:text-[13px] [&_.accordion-summary-desc]:font-normal [&_.accordion-summary-desc]:text-ink-muted " +
  "[&_.accordion-body]:border-t [&_.accordion-body]:border-border [&_.accordion-body]:px-3.5 [&_.accordion-body]:py-3 [&_.accordion-body_p]:my-1 " +
  // Accordion thong ke (StatAccordion) - cung <details>/<summary> THUAN nhu
  // Accordion o tren, nhung marker "+"/"-" thay vi tam giac (dung y mockup
  // AWS Global Infrastructure nguoi dung gui) + 1 badge so luong canh tieu
  // de. Danh sach dang GRID 2 cot dam cham mau (giong tinh than
  // SeriesQuestionPickerToc.tsx), gioi han chieu cao + tu cuon khi qua dai
  // (dung mockup co thanh cuon rieng cho phan list).
  // [2026-09-16] Bo han border, chi con mau nen co dinh #F3F3F7 - yeu cau
  // nguoi dung: "accordion geographic không cần border đâu, có màu nền là
  // được rồi". Dung 1 mau nen CO DINH DUY NHAT cho ca cap ngoai LAN cap long
  // nhau trong Accordion thuong (khac truoc day phan biet bg-surface/
  // bg-surface-muted 2 cap) - vi gio KHONG con border de phan biet ranh gioi
  // nua, giu 1 mau dong nhat tranh roi mat.
  "[&_.stat-accordion]:my-4 [&_.stat-accordion]:overflow-hidden [&_.stat-accordion]:rounded-xl [&_.stat-accordion]:bg-[#F3F3F7] " +
  "[&_.accordion-body_.stat-accordion]:my-3 [&_.accordion-body_.stat-accordion]:rounded-lg " +
  "[&_.stat-accordion-summary]:flex [&_.stat-accordion-summary]:cursor-pointer [&_.stat-accordion-summary]:list-none [&_.stat-accordion-summary]:items-center [&_.stat-accordion-summary]:gap-2.5 [&_.stat-accordion-summary]:px-3.5 [&_.stat-accordion-summary]:py-2.5 [&_.stat-accordion-summary]:select-none " +
  "[&_.stat-accordion-summary::-webkit-details-marker]:hidden [&_.stat-accordion-summary::marker]:content-none " +
  // min-w-0 - PHAI co tren flex item co flex-1 chua van ban dai (mac dinh
  // min-width:auto cua flex item = kich thuoc noi dung, khong cho phep co
  // lai/xuong dong dung cach khi tieu de dai + man hinh hep, day chinh la
  // nguyen nhan "vo bo cuc" tren mobile neu thieu - responsive cho tieu de
  // dai canh badge so luong).
  "[&_.stat-accordion-title]:min-w-0 [&_.stat-accordion-title]:flex-1 [&_.stat-accordion-title]:text-[14.5px] [&_.stat-accordion-title]:font-semibold [&_.stat-accordion-title]:text-ink " +
  // Nen trang, chu den 80% opacity, size nho hon tieu de 2px - yeu cau
  // nguoi dung: "Cái số lượng trong accordion này để nền trắng, text đen
  // 80%, size nhỏ hơn 2px nhé" (tieu de dang 14.5px -> badge 12.5px, tru
  // tiep 2px nua).
  "[&_.stat-accordion-badge]:rounded-md [&_.stat-accordion-badge]:bg-white [&_.stat-accordion-badge]:px-2 [&_.stat-accordion-badge]:py-1 [&_.stat-accordion-badge]:text-[10.5px] [&_.stat-accordion-badge]:font-semibold [&_.stat-accordion-badge]:text-black/80 " +
  "[&_.stat-accordion-summary]:after:ml-1 [&_.stat-accordion-summary]:after:flex [&_.stat-accordion-summary]:after:size-5 [&_.stat-accordion-summary]:after:shrink-0 [&_.stat-accordion-summary]:after:items-center [&_.stat-accordion-summary]:after:justify-center [&_.stat-accordion-summary]:after:text-[15px] [&_.stat-accordion-summary]:after:leading-none [&_.stat-accordion-summary]:after:text-ink-faint [&_.stat-accordion-summary]:after:content-['+'] " +
  "[&_.stat-accordion[open]_.stat-accordion-summary]:after:content-['−'] " +
  "[&_.stat-accordion-body]:px-3.5 [&_.stat-accordion-body]:py-3 " +
  "[&_.stat-accordion-description]:mb-3 [&_.stat-accordion-description]:text-[13.5px] [&_.stat-accordion-description]:text-ink-muted " +
  "[&_.stat-accordion-list]:grid [&_.stat-accordion-list]:max-h-64 [&_.stat-accordion-list]:grid-cols-1 [&_.stat-accordion-list]:gap-x-3 [&_.stat-accordion-list]:gap-y-2 [&_.stat-accordion-list]:overflow-y-auto sm:[&_.stat-accordion-list]:grid-cols-2 " +
  // Moi dong 1 "the" nen trang rieng (yeu cau nguoi dung: "Mỗi cái cho nó
  // nền trắng, padding, radius như ảnh 2" - dua theo mau tham khao dong dang
  // pill/card trang tren nen xam #F3F3F7 cua ca khoi).
  "[&_.stat-accordion-item]:flex [&_.stat-accordion-item]:items-center [&_.stat-accordion-item]:gap-2 [&_.stat-accordion-item]:rounded-lg [&_.stat-accordion-item]:bg-surface [&_.stat-accordion-item]:px-3 [&_.stat-accordion-item]:py-2.5 [&_.stat-accordion-item-text]:min-w-0 [&_.stat-accordion-item-text]:flex-1 [&_.stat-accordion-item-text]:text-[13.5px] [&_.stat-accordion-item-text]:text-ink " +
  // Dong co toa do (lat/lng) - bam duoc de mo modal globe 3D (xem
  // RegionGlobeModal.tsx/EntryContentWithGlobe.tsx) - the trang co san rieng
  // (xem .stat-accordion-item o tren) nen KHONG con can meo -mx/px rieng cho
  // hover nua, chi doi sac nen nhe + gach chan ten.
  // [2026-09-17] Doi hieu ung hover - yeu cau nguoi dung: "Đổi hiệu ứng hover
  // đi nhé" (gach chan + nen xam truoc do). outline-none phong ho ca truong
  // hop trinh duyet tu ve vien focus mac dinh (khong chu dich) luc bam. Hover
  // moi: nen tim (bg-primary/8) + CHINH van ban doi mau primary (khong con
  // gach chan) - bao hieu "co the bam" bang mau thay vi duong ke.
  "[&_.stat-accordion-item-clickable]:cursor-pointer [&_.stat-accordion-item-clickable]:outline-none [&_.stat-accordion-item-clickable]:transition-colors [&_.stat-accordion-item-clickable]:duration-150 [&_.stat-accordion-item-clickable]:hover:bg-primary/8 " +
  "[&_.stat-accordion-item-clickable_.stat-accordion-item-text]:transition-colors [&_.stat-accordion-item-clickable_.stat-accordion-item-text]:duration-150 [&_.stat-accordion-item-clickable:hover_.stat-accordion-item-text]:text-primary " +
  "[&_.stat-accordion-dot]:inline-block [&_.stat-accordion-dot]:size-2 [&_.stat-accordion-dot]:shrink-0 [&_.stat-accordion-dot]:rounded-full " +
  "[&_.stat-accordion-legend]:mt-3 [&_.stat-accordion-legend]:flex [&_.stat-accordion-legend]:flex-col [&_.stat-accordion-legend]:gap-1.5 [&_.stat-accordion-legend]:border-t [&_.stat-accordion-legend]:border-border [&_.stat-accordion-legend]:pt-3 " +
  "[&_.stat-accordion-legend-item]:flex [&_.stat-accordion-legend-item]:items-center [&_.stat-accordion-legend-item]:gap-2 [&_.stat-accordion-legend-item]:text-[12.5px] [&_.stat-accordion-legend-item]:text-ink-faint " +
  // "Sơ đồ luồng" (FlowDiagram) - cac buoc xep doc, giua 2 buoc la 1 mui ten
  // (duong ke doc + dau mui ten bang border-trick, ve THUAN CSS khong can
  // SVG/icon nao) - mo ta (neu co) hien BEN PHAI duong ke bang absolute
  // positioning (left: 50% + khoang cach co dinh), dung y "so do ASCII"
  // nguoi dung gui (duong ke chinh giua, chu giai thich nam le sang phai).
  "[&_.flow-diagram]:mx-auto [&_.flow-diagram]:my-6 [&_.flow-diagram]:flex [&_.flow-diagram]:w-full [&_.flow-diagram]:max-w-2xl [&_.flow-diagram]:flex-col [&_.flow-diagram]:items-center " +
  "[&_.flow-diagram-node]:flex [&_.flow-diagram-node]:w-full [&_.flow-diagram-node]:flex-col [&_.flow-diagram-node]:items-center " +
  "[&_.flow-diagram-step]:w-full [&_.flow-diagram-step]:max-w-sm [&_.flow-diagram-step]:rounded-lg [&_.flow-diagram-step]:border [&_.flow-diagram-step]:border-border [&_.flow-diagram-step]:bg-surface [&_.flow-diagram-step]:px-4 [&_.flow-diagram-step]:py-2.5 [&_.flow-diagram-step]:text-center [&_.flow-diagram-step]:text-[14px] [&_.flow-diagram-step]:font-semibold [&_.flow-diagram-step]:text-ink " +
  "[&_.flow-diagram-arrow]:relative [&_.flow-diagram-arrow]:h-10 [&_.flow-diagram-arrow]:w-full [&_.flow-diagram-arrow]:max-w-sm " +
  "[&_.flow-diagram-arrow]:before:absolute [&_.flow-diagram-arrow]:before:top-0 [&_.flow-diagram-arrow]:before:bottom-0 [&_.flow-diagram-arrow]:before:left-1/2 [&_.flow-diagram-arrow]:before:w-0.5 [&_.flow-diagram-arrow]:before:-translate-x-1/2 [&_.flow-diagram-arrow]:before:bg-border [&_.flow-diagram-arrow]:before:content-[''] " +
  "[&_.flow-diagram-arrow]:after:absolute [&_.flow-diagram-arrow]:after:bottom-0 [&_.flow-diagram-arrow]:after:left-1/2 [&_.flow-diagram-arrow]:after:-translate-x-1/2 [&_.flow-diagram-arrow]:after:border-x-[5px] [&_.flow-diagram-arrow]:after:border-t-[7px] [&_.flow-diagram-arrow]:after:border-x-transparent [&_.flow-diagram-arrow]:after:border-t-ink-faint [&_.flow-diagram-arrow]:after:content-[''] " +
  "[&_.flow-diagram-note]:absolute [&_.flow-diagram-note]:top-1/2 [&_.flow-diagram-note]:-translate-y-1/2 [&_.flow-diagram-note]:text-[12px] [&_.flow-diagram-note]:text-ink-faint [&_.flow-diagram-note]:italic " +
  "[&_.flow-diagram-note]:left-[calc(50%+16px)] [&_.flow-diagram-note]:w-48 " +
  // [2026-09-18] Re nhanh (branching) - yeu cau nguoi dung dua tren vi du AWS
  // Region -> AZ-A/AZ-B/AZ-C: "trunk" la 1 doan ke doc ngan tu buoc CHA
  // xuong THANH NGANG dung chung, roi tung "branch" (cot rieng) di xuong tung
  // buoc con. Ky thuat noi thanh ngang toi DUNG CHINH GIUA tung cot (du cac
  // cot rong/hep khac nhau) = 2 doan rieng tren MOI cot (`:not(:first-child)`
  // noi sang trai, `:not(:last-child)` noi sang phai), moi doan dai 50% +
  // nua khoang gap (16px = nua cua gap-8/32px) tu tam cot do - ghep 2 doan
  // cua 2 cot ke nhau se khop CHINH XAC giua khoang gap, bat ke be rong cot.
  "[&_.flow-diagram-trunk]:h-4 [&_.flow-diagram-trunk]:w-0.5 [&_.flow-diagram-trunk]:bg-border " +
  "[&_.flow-diagram-branches]:relative [&_.flow-diagram-branches]:flex [&_.flow-diagram-branches]:w-full [&_.flow-diagram-branches]:items-start [&_.flow-diagram-branches]:justify-center [&_.flow-diagram-branches]:gap-8 " +
  "[&_.flow-diagram-branch]:relative [&_.flow-diagram-branch]:flex [&_.flow-diagram-branch]:min-w-[110px] [&_.flow-diagram-branch]:flex-1 [&_.flow-diagram-branch]:flex-col [&_.flow-diagram-branch]:items-center " +
  "[&_.flow-diagram-branch:not(:first-child)]:before:absolute [&_.flow-diagram-branch:not(:first-child)]:before:top-0 [&_.flow-diagram-branch:not(:first-child)]:before:right-1/2 [&_.flow-diagram-branch:not(:first-child)]:before:h-0.5 [&_.flow-diagram-branch:not(:first-child)]:before:w-[calc(50%+16px)] [&_.flow-diagram-branch:not(:first-child)]:before:bg-border [&_.flow-diagram-branch:not(:first-child)]:before:content-[''] " +
  "[&_.flow-diagram-branch:not(:last-child)]:after:absolute [&_.flow-diagram-branch:not(:last-child)]:after:top-0 [&_.flow-diagram-branch:not(:last-child)]:after:left-1/2 [&_.flow-diagram-branch:not(:last-child)]:after:h-0.5 [&_.flow-diagram-branch:not(:last-child)]:after:w-[calc(50%+16px)] [&_.flow-diagram-branch:not(:last-child)]:after:bg-border [&_.flow-diagram-branch:not(:last-child)]:after:content-[''] " +
  "[&_.flow-diagram-branch-stem]:relative [&_.flow-diagram-branch-stem]:h-4 [&_.flow-diagram-branch-stem]:w-0.5 [&_.flow-diagram-branch-stem]:bg-border " +
  "[&_.flow-diagram-branch-stem]:after:absolute [&_.flow-diagram-branch-stem]:after:bottom-0 [&_.flow-diagram-branch-stem]:after:left-1/2 [&_.flow-diagram-branch-stem]:after:-translate-x-1/2 [&_.flow-diagram-branch-stem]:after:border-x-[5px] [&_.flow-diagram-branch-stem]:after:border-t-[7px] [&_.flow-diagram-branch-stem]:after:border-x-transparent [&_.flow-diagram-branch-stem]:after:border-t-ink-faint [&_.flow-diagram-branch-stem]:after:content-[''] " +
  "[&_.flow-diagram-note-branch]:mt-1 [&_.flow-diagram-note-branch]:mb-1 [&_.flow-diagram-note-branch]:max-w-[10rem] [&_.flow-diagram-note-branch]:text-center [&_.flow-diagram-note-branch]:text-[11px] [&_.flow-diagram-note-branch]:text-ink-faint [&_.flow-diagram-note-branch]:italic " +
  // [2026-09-18] Mau NEN (BackgroundColor) - yeu cau nguoi dung: "cho cái
  // khoảng cách xung quanh trong cái màu có tí cách cách ra, trục y thêm
  // 2px, trục x thêm 4px" (mau nen truoc do om SAT chu, nhin chat). Nhan
  // dang qua attribute selector `[style*=background-color]` vi BackgroundColor
  // (tu @tiptap/extension-text-style) chi gan 1 inline style truc tiep len
  // <span>, khong co class rieng. `box-decoration-clone` - dam bao padding
  // nay LAP LAI DUNG tren MOI dong khi doan to mau bi ngat dong (mac dinh
  // "slice" chi chua padding trai/phai o dau/cuoi CA CUM, giua chung cac dong
  // se om sat lai).
  "[&_span[style*=background-color]]:box-decoration-clone [&_span[style*=background-color]]:px-1 [&_span[style*=background-color]]:py-0.5 " +
  // Grid (yeu cau nguoi dung: grid tuy chinh hang/cot, moi o co head mau
  // nen/badge/so buoc + body rich text) - moi o la 1 THE rieng (bo vien
  // rounded-lg, cach nhau qua `gap`) thay vi 1 luoi border-collapse chung
  // nhu bang thuong (xem ly do tranh loi "border cong queo" da fix cho
  // table o tren - khong lap lai kieu border chia se giua o voi grid nay).
  // [2026-09-19 fix #3] display:grid/grid-template-columns KHONG con dat qua
  // class/CSS o day nua - dat THANG bang DOM API trong grid-view.tsx (xem
  // comment chi tiet o do ve ly do: <NodeViewContent> voi 1 node co content
  // THAT nhu Grid CHI la 1 lop vo ngoai, contentDOM THAT (noi GridCell con
  // nam) la 1 <div data-node-view-content-react> Tiptap tu tao rieng BEN
  // TRONG no - 2 lan fix truoc (inline style roi bien CSS `--grid-cols` deu
  // dat TREN lop vo ngoai) van chua chac chan se ke thua/ap dung dung xuong
  // duoi, nen chuyen han sang DOM API cho CHAC CHAN). CSS o day gio CHI con
  // lo phan TINH (khong doi theo `cols`): `react-renderer` - 1 lop boc RIENG
  // BIET nua (Tiptap tu them cho MOI GridCell co addNodeView rieng) nam BEN
  // TRONG [data-node-view-content-react] - `display:contents` xoa lop nay
  // khoi model box de .grid-cell that nhay THANG len lam grid item (khong
  // co dong nay, grid-view.tsx co gan display:grid dung cho `[data-node-view-content-react]`
  // thi cac o VAN se sai kich thuoc vi grid item THAT SU la cai vo react-renderer
  // rong, khong phai .grid-cell).
  "[&_.grid-cells_[data-node-view-content-react]>.react-renderer]:contents " +
  "[&_.grid-cell]:overflow-hidden [&_.grid-cell]:rounded-lg [&_.grid-cell]:border [&_.grid-cell]:border-border [&_.grid-cell]:bg-surface " +
  "[&_.grid-cell-head]:flex [&_.grid-cell-head]:h-8 [&_.grid-cell-head]:items-center [&_.grid-cell-head]:gap-1.5 [&_.grid-cell-head]:border-b [&_.grid-cell-head]:border-border [&_.grid-cell-head]:bg-surface-muted [&_.grid-cell-head]:px-3 " +
  "[&_.grid-cell-badge]:inline-block [&_.grid-cell-badge]:size-2 [&_.grid-cell-badge]:shrink-0 [&_.grid-cell-badge]:rounded-full " +
  "[&_.grid-cell-step]:font-mono [&_.grid-cell-step]:text-[12px] [&_.grid-cell-step]:font-semibold [&_.grid-cell-step]:text-primary " +
  "[&_.grid-cell-body]:p-3 [&_.grid-cell-body]:text-[14px] [&_.grid-cell-body_p]:my-1 [&_.grid-cell-body_p:first-child]:mt-0 [&_.grid-cell-body_p:last-child]:mb-0 " +
  // CardGrid (yeu cau nguoi dung: grid cac card kieu AWS service - icon
  // vuong mau + tieu de + cham trang thai + mo ta + link "→ nhan").
  // [2026-09-20] Kich thuoc/khoang cach doi lai KHOP DUNG anh mau nguoi dung
  // gui ("Cấu trúc thẻ trong grid đúng như này cho tôi" - the EC2/Lambda):
  // icon vuong LON hon han (size-8 -> size-13, ro net nhu 1 "logo" chu khong
  // phai 1 chu cai nho), tieu de to/dam hon, cham trang thai to hon va nam
  // O GOC TREN PHAI (khong con chen sat canh tieu de). Radius CARD giu
  // NGUYEN rounded-lg (KHONG tang len rounded-xl/2xl) - quy uoc rieng cua
  // du an: "keep radii small, rounded-lg cards max, never rounded-2xl/3xl".
  // grid-template-columns qua auto-fit/minmax (khong con breakpoint sm:/lg:
  // theo VIEWPORT) - xem giai thich chi tiet ("Làm thì phải test chứ?") o
  // CARD_GRID_STYLE trong card-grid-view.tsx: CardGrid co the bi long BEN
  // TRONG 1 khong gian hep hon nhieu (vd 1 o cua Grid khac), sm:/lg: chi
  // biet be rong CUA SO trinh duyet nen van ep nhieu cot vao 1 vung qua hep.
  "[&_[data-card-grid]]:my-4 [&_[data-card-grid]]:grid [&_[data-card-grid]]:gap-3 [&_[data-card-grid]]:[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] " +
  "[&_.card-grid-item]:relative [&_.card-grid-item]:block [&_.card-grid-item]:rounded-lg [&_.card-grid-item]:border [&_.card-grid-item]:border-border [&_.card-grid-item]:bg-surface [&_.card-grid-item]:p-4 [&_.card-grid-item]:no-underline " +
  "[&_a.card-grid-item]:cursor-pointer [&_a.card-grid-item]:transition-colors [&_a.card-grid-item]:duration-150 [&_a.card-grid-item:hover]:border-border-strong " +
  "[&_.card-grid-item-top]:flex [&_.card-grid-item-top]:items-center [&_.card-grid-item-top]:gap-3 " +
  "[&_.card-grid-item-icon]:flex [&_.card-grid-item-icon]:size-13 [&_.card-grid-item-icon]:shrink-0 [&_.card-grid-item-icon]:items-center [&_.card-grid-item-icon]:justify-center [&_.card-grid-item-icon]:rounded-lg [&_.card-grid-item-icon]:text-[22px] [&_.card-grid-item-icon]:font-bold [&_.card-grid-item-icon]:text-white " +
  "[&_.card-grid-item-title]:min-w-0 [&_.card-grid-item-title]:flex-1 [&_.card-grid-item-title]:truncate [&_.card-grid-item-title]:pr-4 [&_.card-grid-item-title]:text-[17px] [&_.card-grid-item-title]:font-bold [&_.card-grid-item-title]:text-ink " +
  "[&_.card-grid-item-dot]:absolute [&_.card-grid-item-dot]:top-4 [&_.card-grid-item-dot]:right-4 [&_.card-grid-item-dot]:size-3.5 [&_.card-grid-item-dot]:shrink-0 [&_.card-grid-item-dot]:rounded-full " +
  "[&_.card-grid-item-desc]:mt-3.5 [&_.card-grid-item-desc]:text-[13.5px] [&_.card-grid-item-desc]:leading-snug [&_.card-grid-item-desc]:text-ink-muted " +
  "[&_.card-grid-item-link]:mt-3 [&_.card-grid-item-link]:block [&_.card-grid-item-link]:text-[13.5px] [&_.card-grid-item-link]:font-semibold [&_.card-grid-item-link]:text-primary " +
  // SplitBlock (yeu cau nguoi dung: block chia doi, soan binh thuong o ca 2
  // ben) - xep DOC tren man hinh hep, ngang tu `sm:` tro len.
  "[&_.split-block]:my-4 [&_.split-block]:flex [&_.split-block]:flex-col [&_.split-block]:gap-6 sm:[&_.split-block]:flex-row " +
  "[&_.split-column]:min-w-0 [&_.split-column]:flex-1 [&_.split-column_p:first-child]:mt-0 [&_.split-column_p:last-child]:mb-0 " +
  "[&_.split-column:first-child]:sm:flex-[0_0_32%] " +
  // ProfileBlock - "block layout" DAU TIEN (anh vuong + ten + noi dung ben
  // duoi, xem comment chi tiet trong post-extensions.ts).
  "[&_.profile-block-head]:mb-3 [&_.profile-block-head]:flex [&_.profile-block-head]:items-center [&_.profile-block-head]:gap-3 " +
  "[&_.profile-block-avatar]:size-13 [&_.profile-block-avatar]:shrink-0 [&_.profile-block-avatar]:rounded-lg [&_.profile-block-avatar]:border [&_.profile-block-avatar]:border-border [&_.profile-block-avatar]:object-cover " +
  "[&_.profile-block-avatar-empty]:bg-surface-muted " +
  "[&_.profile-block-name]:text-[17px] [&_.profile-block-name]:font-bold [&_.profile-block-name]:text-ink " +
  "[&_.profile-block-body_p:first-child]:mt-0 [&_.profile-block-body_p:last-child]:mb-0";
