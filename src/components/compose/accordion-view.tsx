"use client";

import { useState } from "react";
import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { ChevronDown, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImagePickerModal } from "./ImagePickerModal";
import { BlockActionsMenu } from "./BlockActionsMenu";

// NodeView cua Accordion. [2026-09-16] Bam chevron gio AN/HIEN noi dung
// NGAY TRONG LUC SOAN (khac ban truoc - giu noi dung LUON hien, chi doi
// attrs `open` NGAM, khong thay doi gi tren man hinh) - yeu cau nguoi dung:
// "ấn đóng mở mà không thay đổi vậy? Nó lại chỉ thay đổi bên preview bên
// phải" (bam nut trong editor nhung KHONG thay gi, phai nhin sang Live
// preview moi thay hieu ung, gay kho hieu/tuong nut hong). Dung CSS "hidden"
// (display:none) len TREN <NodeViewContent> thay vi go han no khoi cay -
// NodeViewContent PHAI luon o lai trong DOM (ProseMirror can no de theo doi
// vi tri/selection cua content ben trong), chi AN DI bang CSS la an toan,
// khac voi that su unmount se lam mat theo doi noi dung do. Muon sua noi
// dung ben trong: bam chevron mo ra truoc (dung tinh than "mo accordion that
// de sua, dong lai khi xong" - khop voi cach nguoi doc trai nghiem).
export function AccordionView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const title = (node.attrs.title as string) ?? "";
  const open = node.attrs.open !== false;
  const mediaHeader = Boolean(node.attrs.mediaHeader);
  const mediaImage = (node.attrs.mediaImage as string | null) ?? null;
  const mediaDescription = (node.attrs.mediaDescription as string) ?? "";
  const canEdit = editor.isEditable;
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <NodeViewWrapper className="accordion-block group relative my-4 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center gap-2 px-3.5 py-2.5" contentEditable={false}>
        <button
          type="button"
          onClick={() => updateAttributes({ open: !open })}
          title={open ? "Mặc định: đang mở khi đọc" : "Mặc định: đang đóng khi đọc"}
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-ink"
        >
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={cn("transition-transform duration-150", !open && "-rotate-90")}
          />
        </button>
        {/* [2026-09-20] "Accordion với header dạng layout" - yeu cau nguoi
            dung kem anh mau (icon vuong + tieu de + mo ta): "cái tiếp theo
            là accordion với header có structure layout như trong ảnh: có
            ảnh vuông rồi tới title và mô tả" - chon o luc CHEN qua popover 2
            lua chon trong PostEditorToolbar.tsx (insertAccordion vs
            insertMediaAccordion), luu lai qua attrs `mediaHeader`. */}
        {mediaHeader ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {canEdit ? (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                title="Đổi ảnh"
                className="accordion-summary-icon flex shrink-0 cursor-pointer items-center justify-center overflow-hidden bg-surface-muted text-ink-faint hover:text-ink"
                style={
                  mediaImage
                    ? { backgroundImage: `url(${mediaImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : undefined
                }
              >
                {!mediaImage && <ImagePlus size={16} strokeWidth={1.8} aria-hidden="true" />}
              </button>
            ) : mediaImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL tuy y nguoi dung dan
              <img src={mediaImage} alt={title} className="accordion-summary-icon shrink-0" />
            ) : (
              <div className="accordion-summary-icon accordion-summary-icon-empty shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              {canEdit ? (
                <input
                  value={title}
                  onChange={(e) => updateAttributes({ title: e.target.value })}
                  placeholder="Tiêu đề..."
                  className="accordion-summary-title block w-full bg-transparent outline-none placeholder:text-ink-faint placeholder:font-normal"
                />
              ) : (
                <span className="accordion-summary-title block">{title}</span>
              )}
              {canEdit ? (
                <input
                  value={mediaDescription}
                  onChange={(e) => updateAttributes({ mediaDescription: e.target.value })}
                  placeholder="Mô tả..."
                  className="accordion-summary-desc block w-full bg-transparent outline-none placeholder:text-ink-faint"
                />
              ) : (
                mediaDescription && <p className="accordion-summary-desc">{mediaDescription}</p>
              )}
            </div>
            <ImagePickerModal
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              onSelect={(url) => updateAttributes({ mediaImage: url })}
            />
          </div>
        ) : canEdit ? (
          <input
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Tiêu đề accordion..."
            className="min-w-0 flex-1 bg-transparent text-[14.5px] font-semibold text-ink outline-none placeholder:text-ink-faint"
          />
        ) : (
          <span className="min-w-0 flex-1 text-[14.5px] font-semibold text-ink">{title}</span>
        )}
        {canEdit && <BlockActionsMenu editor={editor} getPos={getPos} node={node} />}
      </div>
      <div className={cn("border-t border-border", !open && "hidden")}>
        {/* min-h-16 - bug nguoi dung bao "click ra xung quanh phía ngoài nó
            mà không thể soạn tiếp bên trong accordion ngoài" (accordion
            THUONG long 1 Accordion Geographical/StatAccordion ben trong -
            node ATOM, contentEditable=false, chiem SAT het be rong/cao cua
            accordion-body vi khong co min-height rieng). Khi atom la con
            DUY NHAT va khong con khoang trong nao de bam vao, khong co vi
            tri hop le nao trong VUNG THAT CO THE SOAN (accordion-body) cho
            trinh duyet/ProseMirror dat con tro - nguoi dung "bấm ra xung
            quanh" thuc chat la bam TRUNG chinh atom (chon nguyen no) hoac ra
            NGOAI accordion-body luon. Them min-height tao 1 khoang trong
            THAT LUON con lai duoi atom (thuoc accordion-body that, van la
            vung contentEditable that) de co the bam vao do va tiep tuc go -
            khong can logic rieng, day la hanh vi mac dinh cua ProseMirror
            khi co du khong gian de nhan click. */}
        <NodeViewContent className="accordion-body min-h-16 px-3.5 py-3" />
      </div>
    </NodeViewWrapper>
  );
}
