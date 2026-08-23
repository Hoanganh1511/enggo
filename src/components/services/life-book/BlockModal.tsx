"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useBookStore } from "@/lib/life-book/book-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CanvasToolbar } from "./CanvasToolbar";
import { PropertiesPanel } from "./PropertiesPanel";
import {
  createElementFromTool,
  type ToolKey,
} from "@/lib/life-book/create-canvas-element";
import { toast } from "@/lib/toast/toast-store";
import type { CanvasElementData } from "@/lib/life-book/canvas-elements";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/life-book/image-constraints";

type BasicToolKey = Exclude<ToolKey, "sticker">;

// Vi tri mac dinh cho "bam tool -> tao giua canvas" (spec) - Toolbar nam
// NGOAI KonvaCanvas.tsx nen khong biet pan/zoom HIEN TAI cua Stage (state
// noi bo cua component do); dung 1 toa do THE GIOI co dinh, hop ly voi trang
// thai Stage MAC DINH luc modal vua mo (scale=1, stagePos=0,0) thay vi phai
// keo state pan/zoom len tan day chi de tinh "tam nhin hien tai".
const DEFAULT_CREATE_POSITION = { x: 260, y: 220 };

// react-konva/konva dung truc tiep <canvas>/window - KHONG the render o
// server (Next.js van SSR component "use client" cho lan render dau, xem
// CommunityCampus3DLoader.tsx da lam dieu tuong tu voi PlayCanvas). BlockModal
// nay DA la "use client" san nen goi dynamic({ssr:false}) truc tiep duoc,
// khong can file wrapper rieng nhu truong hop kia (truong hop do bi goi tu
// 1 Server Component).
const KonvaCanvas = dynamic(
  () => import("./KonvaCanvas").then((m) => m.KonvaCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner size={20} className="text-ink-faint" />
      </div>
    ),
  },
);

// Modal chinh sua 1 block - Dialog (Radix) lam nen accessibility THAT (focus
// trap/ESC/click-ra-ngoai/ARIA, dung DUNG pattern SimpleModal.tsx/popover.tsx
// da dung trong app, khong tu viet lai focus-trap tay), motion.div BEN TRONG
// lam animation. `forceMount` + AnimatePresence de choi hoat hinh MO/DONG
// (Radix mac dinh unmount ngay, khong co exit animation - xem PopoverContent
// trong components/ui/popover.tsx, CUNG 1 cong thuc).
//
// Hoat hinh "scale tu vi tri block": THU CONG tu openBlockOrigin (toa do
// getBoundingClientRect() cua block LUC CLICK, xem GridBlock.tsx) thay vi
// layoutId - da THU layoutId truoc nhung block nam trong cay 3D transform
// (perspective/preserve-3d/rotateY) cua Book.tsx, khien he thong "layout
// projection" tu dong cua framer-motion tinh SAI kich thuoc (khong loi
// console, chi lam block "bien mat" ngay sau khi animation lat trang xong -
// bug that da gap va sua). Cach thu cong nay khong dua vao do FLIP tu dong
// nen tranh han loi do.
export function BlockModal() {
  const openBlockId = useBookStore((s) => s.openBlockId);
  const openBlockOrigin = useBookStore((s) => s.openBlockOrigin);
  const closeBlock = useBookStore((s) => s.closeBlock);
  const book = useBookStore((s) => s.book);

  // Phase 5 CHUA co Konva editor that (se them o Phase 6) nen KHONG co gi de
  // "chua luu" ca luc nay - co flag san (luon false) de Phase 6 chi can set
  // true khi nguoi dung thuc su sua noi dung, khong phai bia du lieu gia de
  // demo confirm dialog.
  const [hasUnsavedChanges] = useState(false);

  // Sub-phase 6.3 - `elements` la state THAT (chua noi voi Block.content
  // that, Sub-phase 6.7 moi lam serialize/save qua stage.toJSON()). Reset ve
  // rong moi lan MO modal (dong mo lai voi 1 block khac khong con giu element
  // cua block truoc) - dat trong requestClose/onOpenChange (event handler
  // that) thay vi useEffect, tranh vi pham react-hooks/set-state-in-effect.
  const [elements, setElements] = useState<CanvasElementData[]>([]);
  // Sub-phase 6.5 - chon (KonvaCanvas.tsx: click/Shift+click/rubber-band) can
  // nam O DAY (khong con o KonvaCanvas.tsx nhu Sub-phase 6.4) vi PropertiesPanel
  // (ben duoi) cung can biet dang chon gi de hien dung field - lifted state
  // len chu so huu chung la BlockModal.tsx, giong cach `elements` da lifted o
  // Sub-phase 6.3.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const pendingImagePosRef = useRef<{ x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tool "image": mo file picker THAT (input file an) thay vi tao element
  // rong ngay - giu vi tri (drop/click) trong ref de dung lai SAU KHI nguoi
  // dung chon xong file (handleImageFileSelected ben duoi). "sticker" khong
  // con nam trong nhom nay tu Sub-phase 6.6 - luon di qua addStickerElement
  // ben duoi voi 1 `src` cu the (chon tu StickerLibraryPopover.tsx), khong
  // con 1 sticker MAC DINH chung nua.
  function addElementFromTool(tool: BasicToolKey, worldPos: { x: number; y: number }) {
    if (tool === "image") {
      pendingImagePosRef.current = worldPos;
      fileInputRef.current?.click();
      return;
    }
    setElements((prev) => [...prev, createElementFromTool(tool, worldPos)]);
  }

  // Sub-phase 6.6 - tao 1 sticker CU THE (preset hoac tuy chinh, xem
  // StickerLibraryPopover.tsx) tai vi tri cho truoc.
  function addStickerElement(src: string, worldPos: { x: number; y: number }) {
    setElements((prev) => [...prev, createElementFromTool("sticker", worldPos, src)]);
  }

  // Sub-phase 6.4 - commit thay doi vi tri/kich thuoc/goc xoay tu
  // KonvaCanvas.tsx (Transformer/keo tha). Sub-phase 6.5 - CUNG ham nay nhan
  // them patch tu PropertiesPanel.tsx (font/mau/can le/opacity/hang-cot...).
  // `patch` la Partial<CanvasElementData> (hop nhat ca 4 variant) - ep kieu
  // co chu dich NGAY TAI diem merge 1 PHAN TU cu the (khong phai toan mang)
  // vi nguoi goi (PropertiesPanel) da tu dam bao patch khop dung field cua
  // CHINH element do (xem cac nhanh theo `element.type` trong PropertiesPanel.tsx).
  function handleUpdateElement(id: string, patch: Partial<CanvasElementData>) {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? ({ ...el, ...patch } as CanvasElementData) : el)),
    );
  }

  // Dua 1 nhom element (co the chi 1) len tren cung / xuong duoi cung - thu
  // tu trong `elements` chinh la z-index (phan tu cuoi mang ve SAU cung =
  // tren cung, xem Layer trong KonvaCanvas.tsx).
  function handleReorderElements(ids: Set<string>, direction: "front" | "back") {
    setElements((prev) => {
      const picked = prev.filter((el) => ids.has(el.id));
      const rest = prev.filter((el) => !ids.has(el.id));
      return direction === "front" ? [...rest, ...picked] : [...picked, ...rest];
    });
  }

  function handleImageFileSelected(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.warning("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.warning("Ảnh vượt quá giới hạn 5MB.");
      return;
    }
    const pos = pendingImagePosRef.current ?? DEFAULT_CREATE_POSITION;
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      if (!src) return;
      setElements((prev) => [...prev, createElementFromTool("image", pos, src)]);
    };
    reader.readAsDataURL(file);
  }

  const block = openBlockId
    ? (book?.pages.flatMap((p) => p.blocks).find((b) => b.id === openBlockId) ?? null)
    : null;
  const open = block !== null;

  // Reset `elements` moi lan modal DONG (khong phai luc MO) - chi co 1 modal
  // mo tai 1 thoi diem nen tuong duong voi "reset luc mo block ke tiep",
  // nhung tranh duoc viec phai ghi ref/state trong luc render de phat hien
  // "block vua doi" (vi pham react-hooks/refs cua repo nay, da gap truoc do).
  function closeAndReset() {
    setElements([]);
    setSelectedIds(new Set());
    closeBlock();
  }

  function requestClose() {
    if (
      hasUnsavedChanges &&
      !window.confirm("Bạn có thay đổi chưa lưu. Đóng mà không lưu?")
    ) {
      return;
    }
    closeAndReset();
  }

  // Khoa cuon vung noi dung CHINH cua app (KHONG phai <body> - body da
  // overflow-hidden toan app san, vung cuon THAT su la MainContentArea qua
  // [data-scroll-root], xem main-content-area.tsx).
  useEffect(() => {
    if (!open) return;
    const scrollRoot = document.querySelector<HTMLElement>("[data-scroll-root]");
    if (!scrollRoot) return;
    const previousOverflow = scrollRoot.style.overflow;
    scrollRoot.style.overflow = "hidden";
    return () => {
      scrollRoot.style.overflow = previousOverflow;
    };
  }, [open]);

  const collapsedState = openBlockOrigin
    ? {
        top: openBlockOrigin.y,
        left: openBlockOrigin.x,
        width: openBlockOrigin.width,
        height: openBlockOrigin.height,
        borderRadius: 8,
        opacity: 0.5,
      }
    : { top: "40vh", left: "40vw", width: "20vw", height: "20vh", opacity: 0 };

  const expandedState = {
    top: "5vh",
    left: "5vw",
    width: "90vw",
    height: "90vh",
    borderRadius: 8,
    opacity: 1,
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) requestClose();
      }}
    >
      <AnimatePresence>
        {open && block && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
              <motion.div
                initial={collapsedState}
                animate={expandedState}
                exit={collapsedState}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ position: "fixed" }}
                className="z-50 flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl"
              >
                <Dialog.Title className="sr-only">Chỉnh sửa block</Dialog.Title>

                <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-3.5">
                  <span className="text-sm font-semibold text-ink">
                    Chỉnh sửa block
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={closeAndReset}
                      className="cursor-pointer rounded-lg bg-black px-4 py-1.5 text-xs font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-85"
                    >
                      Save
                    </button>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Đóng"
                        className="grid size-7 cursor-pointer place-items-center rounded-full text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
                      >
                        <X size={16} />
                      </button>
                    </Dialog.Close>
                  </div>
                </header>

                <div className="flex min-h-0 flex-1">
                  <aside className="w-50 shrink-0 overflow-y-auto border-r border-border p-3">
                    <CanvasToolbar
                      onToolClick={(tool) => addElementFromTool(tool, DEFAULT_CREATE_POSITION)}
                      onPickSticker={(src) => addStickerElement(src, DEFAULT_CREATE_POSITION)}
                    />
                  </aside>

                  <div className="min-w-0 flex-1 bg-surface-muted p-3">
                    <div className="h-full w-full overflow-hidden rounded-lg border border-dashed border-border bg-white">
                      <KonvaCanvas
                        elements={elements}
                        onDropTool={addElementFromTool}
                        onDropSticker={addStickerElement}
                        onUpdateElement={handleUpdateElement}
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                      />
                    </div>
                  </div>

                  <aside className="w-70 shrink-0 overflow-y-auto border-l border-border p-4">
                    <PropertiesPanel
                      elements={elements}
                      selectedIds={selectedIds}
                      onUpdateElement={handleUpdateElement}
                      onReorder={handleReorderElements}
                    />
                  </aside>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    handleImageFileSelected(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
