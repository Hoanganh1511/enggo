"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
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
  CircleHelp,
  Table as TableIcon,
  TriangleAlert,
  OctagonAlert,
  Lightbulb,
  Undo2,
  Redo2,
  Asterisk,
  ListTree,
  GalleryVerticalEnd,
  LayoutGrid,
  ListCollapse,
  CircleDot,
  Workflow,
  Grid3x3,
  IdCard,
  Columns2,
  Contact,
  LayoutPanelTop,
  AlignLeft,
  AlignCenter,
  AlignRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast/toast-store";
import { normalizeCardGridItem, type CalloutVariant, type QuestionPickerItem } from "./post-extensions";

function Btn({
  label,
  active,
  disabled,
  onClick,
  Icon,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  Icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? "bg-community-accent/10 text-community-accent"
          : "text-ink-muted hover:bg-hover-bg hover:text-ink",
      )}
    >
      <Icon size={16} strokeWidth={1.9} />
    </button>
  );
}

// Nut popover 2 lua chon cho "Accordion" - yeu cau nguoi dung: "khi click để
// nó insert vào, nó sẽ hiện ra 2 options để chọn". Trigger CUNG kieu voi Btn
// (size-8, cung mau hover) de khong lech giao dien voi cac nut xung quanh.
function AccordionPickerBtn({
  onInsertPlain,
  onInsertMedia,
}: {
  onInsertPlain: () => void;
  onInsertMedia: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Accordion (bấm để mở/đóng)"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
        >
          <ListCollapse size={16} strokeWidth={1.9} />
        </button>
      </PopoverTrigger>
      <PopoverContent open={open} align="start" sideOffset={6} className="z-50 w-60 rounded-lg border border-border bg-surface p-1 shadow-dropdown">
        <button
          type="button"
          onClick={() => {
            onInsertPlain();
            setOpen(false);
          }}
          className="flex w-full cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-hover-bg"
        >
          <ListCollapse size={16} strokeWidth={1.9} className="mt-0.5 shrink-0 text-ink-faint" />
          <span>
            <span className="block text-[13px] font-medium text-ink">Accordion thường</span>
            <span className="block text-[11.5px] text-ink-faint">Chỉ có tiêu đề văn bản</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            onInsertMedia();
            setOpen(false);
          }}
          className="flex w-full cursor-pointer items-start gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-hover-bg"
        >
          <LayoutPanelTop size={16} strokeWidth={1.9} className="mt-0.5 shrink-0 text-ink-faint" />
          <span>
            <span className="block text-[13px] font-medium text-ink">Accordion (ảnh + tiêu đề + mô tả)</span>
            <span className="block text-[11.5px] text-ink-faint">Header dạng icon vuông kèm mô tả</span>
          </span>
        </button>
      </PopoverContent>
    </PopoverRoot>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

// [2026-09-20 fix #2] Thay 1 lan boc "[paragraph, block, paragraph]" CO
// DINH (fix truoc) bang ham nay - bug nguoi dung bao: "giờ nó thừa khoảng
// trống ở trên, tôi không làm sao để xóa dòng thừa mà tôi ko cần điền đó
// đi được": boc CO DINH tao ra 1 doan van MOI o truoc du CON TRO DANG DUNG
// SAN o 1 doan van RONG co san (vd vua bam Enter, hoac accordion/o Grid moi
// tao san 1 dong rong de go) - ket qua la 2 dong rong chong nhau (1 cu +
// 1 moi), thay vi 1. Ham nay tu KIEM TRA: neu con tro dang o 1 doan van
// RONG, dung LUON doan van do lam "khoang trong phia truoc" (khong tao them
// dong moi) va CHI chen [block, doan van rong sau] NGAY SAU no bang 1
// transaction THAT (khong qua insertContent - insertContent co the "nuot"
// mat doan van rong do thay vi giu lai, day chinh la nguyen nhan bug GOC
// truoc do "click vào không thể trỏ vào được"). Neu con tro dang o giua/cuoi
// 1 doan van CO CHU (khong rong), moi that su can boc CA 2 dau nhu cu.
function insertBlockWithSpacing(editor: Editor, blockJson: Record<string, unknown>) {
  editor
    .chain()
    .focus()
    .command(({ tr, state }) => {
      const { $from, empty } = state.selection;
      const parent = $from.parent;
      const cursorOnEmptyParagraph = empty && parent.type.name === "paragraph" && parent.content.size === 0;
      const paragraphType = state.schema.nodes.paragraph;
      const blockNode = state.schema.nodeFromJSON(blockJson);
      if (cursorOnEmptyParagraph) {
        tr.insert($from.after(), [blockNode, paragraphType.create()]);
      } else {
        tr.insert($from.pos, [paragraphType.create(), blockNode, paragraphType.create()]);
      }
      return true;
    })
    .run();
}

// Thanh cong cu cua editor bai viet - dinh (sticky) o dau vung soan. Nhom
// theo chuc nang: heading / inline / list / block / chen (link, anh, bang,
// callout) / undo-redo.
export function PostEditorToolbar({
  editor,
  // true khi nhung vao 1 khung CHA da tu lo sticky/nen/vien rieng (xem
  // FloatingEditorToolbar trong PostEditor.tsx) - tranh 2 lop sticky/nen
  // chong nhau (truoc day gay nhin roi mat, mau nen cha bi nen rieng cua
  // toolbar nay de len tren, khong dong nhat).
  bare = false,
}: {
  editor: Editor;
  bare?: boolean;
}) {
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

  // Chen 1 icon "?" NGAY SAU cum tu dang chon (khong boc quanh cum tu - xem
  // glossary-hint-extension.tsx) - can 1 vung chon THAT (khong phai chi 1
  // con tro dung yen), nen disable khi selection rong.
  const addGlossaryHint = () => {
    const { to, empty } = editor.state.selection;
    if (empty) return;
    editor
      .chain()
      .focus()
      .insertContentAt(to, { type: "glossaryHint", attrs: { explanation: "" } })
      .run();
  };

  // 3 chu de callout (Warning/Danger/Good tips - xem CALLOUT_LABELS trong
  // post-extensions.ts). Dang la callout NHUNG khac chu de -> doi variant tai
  // cho (khong lift roi wrap lai, tranh nhap nhay/mat vi tri con tro).
  const toggleCallout = (variant: CalloutVariant) => {
    if (editor.isActive("callout", { variant })) {
      editor.chain().focus().lift("callout").run();
    } else if (editor.isActive("callout")) {
      editor.chain().focus().updateAttributes("callout", { variant }).run();
    } else {
      editor.chain().focus().toggleWrap("callout", { variant }).run();
    }
  };

  // Chen "Go deeper" - luon chen MOI (khong toggle/wrap nhu Callout, vi
  // content la inline khong phai block nen khong the toggleWrap len tren).
  // Dien san chu "Go deeper: " de nguoi dung go tiep/chen link ngay sau.
  const insertGoDeeper = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "goDeeper",
        content: [{ type: "text", text: "Go deeper: " }],
      })
      .run();
  };

  // Chen Muc luc dang so - quet TOAN BO doc de lay heading H2 THEO DUNG THU
  // TU xuat hien, luu lai thanh snapshot (xem TocBlock trong post-extensions.ts
  // ve ly do khong tinh "song"). Bao loi ro rang neu chua co H2 nao, tranh
  // chen 1 khoi rong vo nghia.
  const insertToc = () => {
    const items: { text: string }[] = [];
    editor.state.doc.descendants((node) => {
      if (node.type.name === "heading" && node.attrs.level === 2) {
        items.push({ text: node.textContent });
      }
    });
    if (items.length === 0) {
      toast.danger("Chưa có tiêu đề Heading 2 nào trong bài để tạo mục lục.");
      return;
    }
    editor.chain().focus().insertContent({ type: "tocBlock", attrs: { items } }).run();
  };

  // Chen "Đọc thêm" - 4 o trong, tung o tu chon bai qua modal (xem
  // curated-list-view.tsx).
  const insertCuratedList = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "curatedList",
        attrs: { items: [null, null, null, null] },
      })
      .run();
  };

  // Chen "TOC 4-box cau hoi" - quet H2 GIONG insertToc() o tren (yeu cau
  // nguoi dung sau khi so sanh voi "On this page": "chỉ bắt theo h2 thôi
  // nhé" - moi box = 1 heading H2, khong con go tay tu do nua). Khac
  // insertToc o cho: MOI box con lay them doan VAN BAN NGAY SAU heading do
  // (block ke tiep, thuong la 1 paragraph) lam "description" hien ra khi mo
  // box - neu khong co doan van nao theo sau (2 heading H2 lien tiep, hoac
  // H2 cuoi cung khong co gi phia sau) thi description de trong.
  const insertQuestionPicker = () => {
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
    editor.chain().focus().insertContent({ type: "questionPicker", attrs: { items } }).run();
  };

  // Chen Accordion - luon chen MOI (khac Callout khong toggleWrap duoc vi
  // content ben trong can them 1 paragraph mac dinh de co cho go ngay, xem
  // AccordionView.tsx ve ly do NodeView giu content LUON hien du dong/mo).
  // [2026-09-20] Tach lam 2 lua chon (popover, xem <AccordionPickerBtn>
  // duoi) - yeu cau nguoi dung: "khi click để nó insert vào, nó sẽ hiện ra
  // 2 options để chọn, cái đầu tiên sẽ là accordion bình thường, cái tiếp
  // theo là accordion với header có structure layout... ảnh vuông rồi tới
  // title và mô tả".
  const insertAccordion = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "accordion",
        attrs: { title: "Tiêu đề", open: true },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Nội dung..." }] }],
      })
      .run();
  };

  // Accordion voi header dang layout (icon vuong + tieu de + mo ta, xem anh
  // mau nguoi dung gui) - attrs `mediaHeader:true` (xem post-extensions.ts).
  const insertMediaAccordion = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "accordion",
        attrs: { title: "Tiêu đề", open: true, mediaHeader: true, mediaImage: null, mediaDescription: "" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Nội dung..." }] }],
      })
      .run();
  };

  // Chen "Accordion Geographical" - bien the co so luong/dot mau/chu thich (xem
  // StatAccordion trong post-extensions.ts). La atom nen chi can insertContent
  // 1 lan voi attrs mac dinh, khong can content con nhu Accordion thuong.
  const insertStatAccordion = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "statAccordion",
        attrs: {
          title: "Tiêu đề",
          count: "",
          description: "",
          open: true,
          items: [{ name: "", status: "normal" }],
          legend: [],
        },
      })
      .run();
  };

  // Chen "Sơ đồ luồng" (FlowDiagram) - yeu cau nguoi dung dua tren 1 so do
  // ASCII: cac buoc noi tiep bang mui ten, moi mui ten co the co 1 cau giai
  // thich VI SAO can buoc tiep theo, sau do mo rong them RE NHANH (xem
  // FlowDiagram trong post-extensions.ts - du lieu la 1 CAY `root`, khong
  // con la mang phang `steps` nua). La atom nen chi can insertContent 1 lan
  // voi 1 buoc dau + 1 buoc ke tiep mac dinh de co san 1 mui ten de sua ngay.
  const insertFlowDiagram = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "flowDiagram",
        attrs: { root: { title: "", children: [{ title: "" }] } },
      })
      .run();
  };

  // Chen Grid - yeu cau nguoi dung: "grid, grid sau khi thêm vào trong biên
  // soạn có thể tùy chỉnh số lượng cột, hàng... Trong mỗi grid sẽ có một
  // phần head và phần body". Mac dinh 3 cot x 2 hang (6 o) - du de thay ro
  // hinh dang luoi ngay, chinh sua so luong sau qua GridView.tsx. Moi o can
  // 1 paragraph rong san (giong Accordion) - KHONG dua vao plugin auto-fix.
  const insertGrid = () => {
    const cols = 3;
    const rows = 2;
    const cells = Array.from({ length: cols * rows }, () => ({
      type: "gridCell",
      attrs: { headColor: null, showStep: false },
      content: [{ type: "paragraph" }],
    }));
    // Chen + tu dam bao khong gian click truoc/sau - xem insertBlockWithSpacing().
    insertBlockWithSpacing(editor, { type: "grid", attrs: { cols }, content: cells });
  };

  // Chen CardGrid - yeu cau nguoi dung kem anh mau (7 card AWS service:
  // icon vuong mau + cham trang thai + tieu de + mo ta + link "→ nhãn").
  // La atom (xem CardGrid trong post-extensions.ts) - chi can 1 lan
  // insertContent voi 1 item mac dinh de co san 1 card sua ngay, dung nut
  // "+" trong CardGridView.tsx de them tiep.
  const insertCardGrid = () => {
    insertBlockWithSpacing(editor, {
      type: "cardGrid",
      attrs: { items: [normalizeCardGridItem({ title: "Tiêu đề" })] },
    });
  };

  // Chen block chia doi - yeu cau nguoi dung kem anh mau (cot trai tieu de,
  // cot phai nhieu doan van) - "Vẫn soạn được bình thường mọi thứ ở cả 2
  // bên" - moi cot can 1 paragraph rong san (giong Accordion/Grid).
  const insertSplitBlock = () => {
    insertBlockWithSpacing(editor, {
      type: "splitBlock",
      content: [
        { type: "splitColumn", content: [{ type: "paragraph" }] },
        { type: "splitColumn", content: [{ type: "paragraph" }] },
      ],
    });
  };

  // Chen ProfileBlock - "block dạng layout" DAU TIEN (yeu cau nguoi dung:
  // "Bổ sung thêm trong editor việc thêm các block dạng layout khác nhau,
  // trước mắt thêm 1 block có layout như trong ảnh... Ảnh đại diện vuông,
  // tên, sau đó phía dưới là nội dung"). 1 paragraph rong san trong body
  // (giong Accordion/Grid/SplitBlock).
  const insertProfileBlock = () => {
    insertBlockWithSpacing(editor, {
      type: "profileBlock",
      attrs: { avatarUrl: null, name: "" },
      content: [{ type: "paragraph" }],
    });
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-0.5",
        bare
          ? "px-0 py-0"
          : // rounded-t-lg them vao - to tien (SeriesEntryEditor.tsx) da bo
            // overflow-hidden (pha sticky), nen goc tren cua toolbar khong
            // con duoc "cat" ho boi cha nua, phai tu bo tron lay chinh no.
            "sticky top-0 z-10 rounded-t-lg border-b border-border bg-surface/95 px-1 py-1.5 backdrop-blur-sm",
      )}
    >
      <Btn label="Tiêu đề 1" Icon={Heading1} active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
      <Btn label="Tiêu đề 2" Icon={Heading2} active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <Btn label="Tiêu đề 3" Icon={Heading3} active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <Btn label="Tiêu đề 4" Icon={Heading4} active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} />
      <Divider />
      <Btn label="Đậm" Icon={Bold} active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
      <Btn label="Nghiêng" Icon={Italic} active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <Btn label="Gạch chân" Icon={UnderlineIcon} active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} />
      <Btn label="Gạch ngang" Icon={Strikethrough} active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} />
      <Btn label="Code inline" Icon={Code} active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} />
      <Divider />
      <Btn label="Danh sách chấm" Icon={List} active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <Btn label="Danh sách số" Icon={ListOrdered} active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <Btn label="Checklist" Icon={ListTodo} active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()} />
      <Divider />
      <Btn label="Trích dẫn" Icon={Quote} active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <Btn label="Khối code" Icon={Terminal} active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
      <Btn label="Warning" Icon={TriangleAlert} active={editor.isActive("callout", { variant: "warn" })} onClick={() => toggleCallout("warn")} />
      <Btn label="Danger" Icon={OctagonAlert} active={editor.isActive("callout", { variant: "danger" })} onClick={() => toggleCallout("danger")} />
      <Btn label="Good tips" Icon={Lightbulb} active={editor.isActive("callout", { variant: "success" })} onClick={() => toggleCallout("success")} />
      <Btn label="Đường kẻ" Icon={Minus} onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      <Divider />
      <Btn label="Liên kết" Icon={Link2} active={editor.isActive("link")} onClick={setLink} />
      <Btn label="Ảnh (URL)" Icon={ImageIcon} onClick={addImage} />
      <Btn
        label="Thêm chú thích cho cụm từ đang chọn"
        Icon={CircleHelp}
        disabled={editor.state.selection.empty}
        onClick={addGlossaryHint}
      />
      {/* Chen/xoa hang-cot sau khi da co bang: xem TableControlsMenu.tsx -
          mot bubble menu rieng hien NGAY CANH bang dang sua (yeu cau nguoi
          dung: "Table trong này chưa có các button bố trí hợp lý để tăng
          giảm số lượng cột, hàng, chèn, xóa"), thay cho 2 nut "Thêm hàng"/
          "Thêm cột" co dinh truoc day (luon hien tren toolbar chinh du chi
          dung duoc khi con tro o trong bang, va thieu han thao tac xoa). */}
      <Btn label="Bảng" Icon={TableIcon} active={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
      <Divider />
      <Btn label="Go deeper" Icon={Asterisk} onClick={insertGoDeeper} />
      <Btn label="Mục lục đánh số (theo H2)" Icon={ListTree} onClick={insertToc} />
      <Btn label="Đọc thêm (chọn bài viết)" Icon={GalleryVerticalEnd} onClick={insertCuratedList} />
      <Btn label="TOC dạng box (theo H2)" Icon={LayoutGrid} onClick={insertQuestionPicker} />
      <AccordionPickerBtn onInsertPlain={insertAccordion} onInsertMedia={insertMediaAccordion} />
      <Btn label="Accordion Geographical (số lượng + list dot màu)" Icon={CircleDot} onClick={insertStatAccordion} />
      <Btn label="Sơ đồ luồng (các bước nối tiếp, có mô tả trên mũi tên)" Icon={Workflow} onClick={insertFlowDiagram} />
      <Btn label="Grid (tuỳ chỉnh số hàng/cột)" Icon={Grid3x3} onClick={insertGrid} />
      <Btn label="Grid card (icon + trạng thái + mô tả + link)" Icon={IdCard} onClick={insertCardGrid} />
      <Btn label="Chia đôi (soạn được cả 2 bên)" Icon={Columns2} onClick={insertSplitBlock} />
      <Btn label="Block Hồ sơ (ảnh vuông + tên + nội dung)" Icon={Contact} onClick={insertProfileBlock} />
      <Divider />
      <Btn label="Căn trái" Icon={AlignLeft} active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} />
      <Btn label="Căn giữa" Icon={AlignCenter} active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} />
      <Btn label="Căn phải" Icon={AlignRight} active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} />
      <Divider />
      <Btn label="Hoàn tác" Icon={Undo2} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
      <Btn label="Làm lại" Icon={Redo2} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
    </div>
  );
}
