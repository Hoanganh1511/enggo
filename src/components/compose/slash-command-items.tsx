import type { Editor, Range } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
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
  Asterisk,
  ListTree,
  GalleryVerticalEnd,
  LayoutGrid,
  ListCollapse,
  LayoutPanelTop,
  CircleDot,
  Workflow,
  Grid3x3,
  IdCard,
  Columns2,
  Contact,
  BarChart3,
  Superscript,
  type LucideIcon,
} from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { normalizeCardGridItem, STATS_BAR_DEFAULT_ITEMS, type QuestionPickerItem } from "./post-extensions";
import { insertBlockWithSpacing } from "./insert-block-with-spacing";

// Danh sach lenh cho "/" (slash command, kieu Notion) - yeu cau nguoi dung:
// "gõ command "/...." ra các tính năng để insert vào trong editor giống
// kiểu notion". Moi item o day la 1 BAN SAO Y HET logic insert cua chinh
// nut tuong ung trong PostEditorToolbar.tsx (copy lai thay vi tai su dung
// truc tiep - toolbar dinh nghia cac ham nay lam closure BEN TRONG component
// React cua no, khong xuat ra ngoai duoc gon gang) - CHI khac o cho: MOI item
// o day nhan them `range` (vi tri "/query" nguoi dung vua go) va PHAI xoa no
// truoc khi chen noi dung that (deleteRange), dong bo trong CUNG 1 transaction
// voi buoc chen de undo 1 lan la het ca cum (khong phai 2 lan rieng biet).
//
// CHI liet ke cac lenh mang tinh CHEN 1 KHOI (giong dung y "/" cua Notion:
// tieu de, danh sach, trich dan, khoi code, bang, cac block tuy chinh...) -
// KHONG dua cac nut dinh dang INLINE thuan tuy (đậm/nghiêng/gạch chân/căn lề)
// vao day, vi Notion cung khong dat chung trong menu "/" (chung can 1 vung
// van ban BOI DEN de co y nghia, khac voi "/" luon go tai 1 VI TRI con tro
// dung yen).
export type SlashCommandItem = {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  Icon: LucideIcon;
  run: (editor: Editor, range: Range) => void;
};

function insertAt(editor: Editor, range: Range, content: Record<string, unknown>) {
  editor.chain().focus().deleteRange(range).insertContent(content).run();
}

export function getSlashCommandItems(): SlashCommandItem[] {
  return [
    {
      id: "heading1",
      label: "Tiêu đề 1",
      description: "Tiêu đề lớn nhất",
      keywords: ["h1", "heading", "tieu de 1"],
      Icon: Heading1,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
    },
    {
      id: "heading2",
      label: "Tiêu đề 2",
      description: "Mục chính",
      keywords: ["h2", "heading", "tieu de 2"],
      Icon: Heading2,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
    },
    {
      id: "heading3",
      label: "Tiêu đề 3",
      description: "Mục con",
      keywords: ["h3", "heading", "tieu de 3"],
      Icon: Heading3,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
    },
    {
      id: "heading4",
      label: "Tiêu đề 4",
      description: "Mục con nhỏ hơn",
      keywords: ["h4", "heading", "tieu de 4"],
      Icon: Heading4,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 4 }).run(),
    },
    {
      id: "bulletList",
      label: "Danh sách chấm",
      description: "Danh sách không đánh số",
      keywords: ["bullet", "list", "danh sach", "cham"],
      Icon: List,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      id: "orderedList",
      label: "Danh sách số",
      description: "Danh sách đánh số tự động",
      keywords: ["ordered", "list", "so", "1.", "danh sach so"],
      Icon: ListOrdered,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      id: "taskList",
      label: "Checklist",
      description: "Danh sách việc cần làm, có ô tick",
      keywords: ["task", "todo", "checklist", "checkbox"],
      Icon: ListTodo,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
    },
    {
      id: "blockquote",
      label: "Trích dẫn",
      description: "Đoạn trích dẫn có viền trái",
      keywords: ["quote", "blockquote", "trich dan"],
      Icon: Quote,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      id: "codeBlock",
      label: "Khối code",
      description: "Đoạn code nhiều dòng",
      keywords: ["code", "codeblock", "khoi code"],
      Icon: Terminal,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      id: "horizontalRule",
      label: "Đường kẻ ngang",
      description: "Phân tách các phần trong bài",
      keywords: ["hr", "divider", "duong ke", "phan cach"],
      Icon: Minus,
      run: (editor, range) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      id: "calloutWarn",
      label: "Callout Warning",
      description: "Khối cảnh báo màu vàng",
      keywords: ["callout", "warning", "canh bao"],
      Icon: TriangleAlert,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleWrap("callout", { variant: "warn" }).run(),
    },
    {
      id: "calloutDanger",
      label: "Callout Danger",
      description: "Khối cảnh báo màu đỏ",
      keywords: ["callout", "danger", "nguy hiem"],
      Icon: OctagonAlert,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleWrap("callout", { variant: "danger" }).run(),
    },
    {
      id: "calloutSuccess",
      label: "Callout Good tips",
      description: "Khối mẹo hay màu xanh",
      keywords: ["callout", "tips", "meo", "goodtips"],
      Icon: Lightbulb,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).toggleWrap("callout", { variant: "success" }).run(),
    },
    {
      id: "link",
      label: "Liên kết",
      description: "Chèn 1 đường link",
      keywords: ["link", "url", "lien ket"],
      Icon: Link2,
      run: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        const url = window.prompt("Nhập URL liên kết");
        if (!url) return;
        const title = window.prompt("Tooltip khi hover vào link (không bắt buộc)");
        editor.chain().focus().insertContent({ type: "text", text: url, marks: [{ type: "link", attrs: { href: url, title: title || null } }] }).run();
      },
    },
    {
      id: "image",
      label: "Ảnh (URL)",
      description: "Chèn ảnh qua URL",
      keywords: ["image", "img", "anh", "picture"],
      Icon: ImageIcon,
      run: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        const url = window.prompt("Dán URL ảnh (https://...)");
        if (!url) return;
        const alt = window.prompt("Alt text mô tả ảnh (không bắt buộc)") || undefined;
        const title = window.prompt("Caption/tooltip khi hover vào ảnh (không bắt buộc)") || undefined;
        editor.chain().focus().setImage({ src: url, alt, title }).run();
      },
    },
    {
      id: "table",
      label: "Bảng",
      description: "Bảng 3x3, chỉnh sau khi chèn",
      keywords: ["table", "bang"],
      Icon: TableIcon,
      run: (editor, range) =>
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      id: "footnote",
      label: "Chú thích cuối trang",
      description: "Số nhỏ dạng superscript, hover để xem",
      keywords: ["footnote", "chu thich", "^"],
      Icon: Superscript,
      run: (editor, range) => insertAt(editor, range, { type: "footnote", attrs: { content: "" } }),
    },
    {
      id: "goDeeper",
      label: "Go deeper",
      description: "1 dòng gợi ý đọc thêm/liên kết",
      keywords: ["go deeper", "sao"],
      Icon: Asterisk,
      run: (editor, range) =>
        insertAt(editor, range, { type: "goDeeper", content: [{ type: "text", text: "Go deeper: " }] }),
    },
    {
      id: "toc",
      label: "Mục lục đánh số",
      description: "Tự quét các Heading 2 trong bài",
      keywords: ["toc", "muc luc", "table of contents"],
      Icon: ListTree,
      run: (editor, range) => {
        const items: { text: string }[] = [];
        editor.state.doc.descendants((node) => {
          if (node.type.name === "heading" && node.attrs.level === 2) items.push({ text: node.textContent });
        });
        if (items.length === 0) {
          toast.danger("Chưa có tiêu đề Heading 2 nào trong bài để tạo mục lục.");
          return;
        }
        insertAt(editor, range, { type: "tocBlock", attrs: { items } });
      },
    },
    {
      id: "curatedList",
      label: "Đọc thêm",
      description: "4 ô chọn bài viết liên quan",
      keywords: ["doc them", "curated", "related"],
      Icon: GalleryVerticalEnd,
      run: (editor, range) =>
        insertAt(editor, range, { type: "curatedList", attrs: { items: [null, null, null, null] } }),
    },
    {
      id: "questionPicker",
      label: "TOC dạng box",
      description: "Mỗi Heading 2 thành 1 ô câu hỏi",
      keywords: ["toc box", "question", "cau hoi"],
      Icon: LayoutGrid,
      run: (editor, range) => {
        const items: QuestionPickerItem[] = [];
        let pendingQuestion: string | null = null;
        editor.state.doc.forEach((node) => {
          if (node.type.name === "heading" && node.attrs.level === 2) {
            if (pendingQuestion !== null) items.push({ question: pendingQuestion, description: "" });
            pendingQuestion = node.textContent;
          } else if (pendingQuestion !== null && node.textContent.trim()) {
            items.push({ question: pendingQuestion, description: node.textContent.trim() });
            pendingQuestion = null;
          }
        });
        if (pendingQuestion !== null) items.push({ question: pendingQuestion, description: "" });
        if (items.length === 0) {
          toast.danger("Chưa có tiêu đề Heading 2 nào trong bài để tạo TOC dạng box.");
          return;
        }
        insertAt(editor, range, { type: "questionPicker", attrs: { items } });
      },
    },
    {
      id: "accordion",
      label: "Accordion",
      description: "Khối bấm để mở/đóng",
      keywords: ["accordion", "collapse", "toggle"],
      Icon: ListCollapse,
      run: (editor, range) =>
        insertAt(editor, range, {
          type: "accordion",
          attrs: { title: "Tiêu đề", open: true },
          content: [{ type: "paragraph", content: [{ type: "text", text: "Nội dung..." }] }],
        }),
    },
    {
      id: "accordionMedia",
      label: "Accordion (ảnh + tiêu đề + mô tả)",
      description: "Header dạng icon vuông kèm mô tả",
      keywords: ["accordion", "media", "anh"],
      Icon: LayoutPanelTop,
      run: (editor, range) =>
        insertAt(editor, range, {
          type: "accordion",
          attrs: { title: "Tiêu đề", open: true, mediaHeader: true, mediaImage: null, mediaDescription: "" },
          content: [{ type: "paragraph", content: [{ type: "text", text: "Nội dung..." }] }],
        }),
    },
    {
      id: "statAccordion",
      label: "Accordion Geographical",
      description: "Số lượng + danh sách chấm màu",
      keywords: ["stat accordion", "geographical", "dot mau"],
      Icon: CircleDot,
      run: (editor, range) =>
        insertAt(editor, range, {
          type: "statAccordion",
          attrs: {
            title: "Tiêu đề",
            count: "",
            description: "",
            open: true,
            items: [{ name: "", status: "normal" }],
            legend: [],
          },
        }),
    },
    {
      id: "flowDiagram",
      label: "Sơ đồ luồng",
      description: "Các bước nối tiếp, có thể rẽ nhánh",
      keywords: ["flow", "diagram", "so do", "luong"],
      Icon: Workflow,
      run: (editor, range) =>
        insertAt(editor, range, { type: "flowDiagram", attrs: { root: { title: "", children: [{ title: "" }] } } }),
    },
    {
      id: "grid",
      label: "Grid",
      description: "Lưới tuỳ chỉnh số hàng/cột",
      keywords: ["grid", "luoi"],
      Icon: Grid3x3,
      run: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        const cols = 3;
        const rows = 2;
        const cells = Array.from({ length: cols * rows }, () => ({
          type: "gridCell",
          attrs: { headColor: null, showStep: false },
          content: [{ type: "paragraph" }],
        }));
        insertBlockWithSpacing(editor, { type: "grid", attrs: { cols }, content: cells });
      },
    },
    {
      id: "cardGrid",
      label: "Grid card",
      description: "Icon + trạng thái + mô tả + link",
      keywords: ["card grid", "cards"],
      Icon: IdCard,
      run: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        insertBlockWithSpacing(editor, {
          type: "cardGrid",
          attrs: { items: [normalizeCardGridItem({ title: "Tiêu đề", linkLabel: "Tìm hiểu thêm" })] },
        });
      },
    },
    {
      id: "splitBlock",
      label: "Chia đôi",
      description: "2 cột, soạn được cả 2 bên",
      keywords: ["split", "chia doi", "2 cot"],
      Icon: Columns2,
      run: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        insertBlockWithSpacing(editor, {
          type: "splitBlock",
          content: [
            { type: "splitColumn", content: [{ type: "paragraph" }] },
            { type: "splitColumn", content: [{ type: "paragraph" }] },
          ],
        });
      },
    },
    {
      id: "profileBlock",
      label: "Block Hồ sơ",
      description: "Ảnh vuông + tên + nội dung",
      keywords: ["profile", "ho so"],
      Icon: Contact,
      run: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        insertBlockWithSpacing(editor, {
          type: "profileBlock",
          attrs: { avatarUrl: null, name: "" },
          content: [{ type: "paragraph" }],
        });
      },
    },
    {
      id: "statsBar",
      label: "Thanh thống kê",
      description: "5 ô số liệu ngang",
      keywords: ["stats", "thong ke", "so lieu"],
      Icon: BarChart3,
      run: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        insertBlockWithSpacing(editor, { type: "statsBar", attrs: { items: STATS_BAR_DEFAULT_ITEMS } });
      },
    },
  ];
}

// So khop don gian: chuoi go vao (bo dau ưu tiên khop label/keywords chua
// no, khong phan biet hoa/thuong). Khong dua vao thu vien fuzzy-search rieng
// (vd fuse.js) - danh sach chi ~28 muc, includes() la du nhanh va du dung.
export function filterSlashCommandItems(items: SlashCommandItem[], query: string): SlashCommandItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q)),
  );
}
