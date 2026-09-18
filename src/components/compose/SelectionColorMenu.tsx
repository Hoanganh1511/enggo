"use client";

import { BubbleMenu } from "@tiptap/react/menus";
import { NodeSelection, type EditorState } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

// Bang mau CO SAN cho ca 2 hang (chu/nen) - "Mặc định"/"Không nền" (value
// null) luon la lua chon DAU TIEN de xoa mau ve trang thai goc.
const TEXT_COLORS: { label: string; value: string | null }[] = [
  { label: "Mặc định", value: null },
  { label: "Đỏ", value: "#ef4444" },
  { label: "Cam", value: "#f97316" },
  { label: "Vàng", value: "#eab308" },
  { label: "Xanh lá", value: "#22c55e" },
  { label: "Xanh dương", value: "#3b82f6" },
  { label: "Tím", value: "#a855f7" },
];

const BG_COLORS: { label: string; value: string | null }[] = [
  { label: "Không nền", value: null },
  { label: "Vàng", value: "#fef9c3" },
  { label: "Xanh lá", value: "#dcfce7" },
  { label: "Xanh dương", value: "#dbeafe" },
  { label: "Đỏ", value: "#fee2e2" },
  { label: "Tím", value: "#f3e8ff" },
  { label: "Cam", value: "#ffedd5" },
];

function ColorSwatchRow({
  colors,
  activeValue,
  onPick,
}: {
  colors: { label: string; value: string | null }[];
  activeValue: string | null;
  onPick: (value: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {colors.map((c) => (
        <button
          key={c.label}
          type="button"
          title={c.label}
          onClick={() => onPick(c.value)}
          className={cn(
            "flex size-5 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-border ring-offset-1 ring-offset-surface transition-shadow duration-100 ease-out",
            activeValue === c.value && "ring-2 ring-ink",
          )}
          style={{ backgroundColor: c.value ?? "transparent" }}
        >
          {/* value=null ("Mặc định"/"Không nền") - vach cheo trang tri thay
              vi 1 mau that, bao hieu "xoá về gốc". */}
          {c.value === null && (
            <span
              className="block size-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, var(--border) 0, var(--border) 1px, transparent 1px, transparent 4px)",
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// Bubble menu chon MAU CHU/MAU NEN cho vung van ban dang chon - yeu cau
// nguoi dung: "khi một vùng text được focus (con trỏ giữ bôi tô) thì nút đó
// sẽ hiện lên, chọn màu nền, màu chữ". `BubbleMenu` (tu @tiptap/react/menus)
// mac dinh CHI hien khi co 1 vung chon van ban KHONG RONG (shouldShow mac
// dinh kiem tra `!selection.empty`), dung y "con trỏ giữ bôi tô" nguoi dung
// mo ta - khong can tu viet dieu kien hien/an.
export function SelectionColorMenu({ editor }: { editor: Editor }) {
  // Boc try/catch - tinh nang phu (mau chu/nen) TUYET DOI khong duoc phep
  // lam SAP CA TRANG soan (bug that su nguoi dung bao: "Vưa đặt con trỏ vào
  // trong vùng soạn, thì lỗi trang như này luôn" - dung luc tao 1 selection
  // MOI, xem them shouldShow duoi ve ly do chinh xac hon).
  let currentColor: string | null = null;
  let currentBg: string | null = null;
  try {
    currentColor = (editor.getAttributes("textStyle").color as string | undefined) ?? null;
    currentBg = (editor.getAttributes("textStyle").backgroundColor as string | undefined) ?? null;
  } catch {
    // bo qua, giu mac dinh null
  }

  return (
    // appendTo: document.body - BUG THAT SU nguoi dung bao "sao không thấy":
    // mac dinh (khong khai bao gi) BubbleMenuPlugin gan phan tu noi cua no
    // vao NGAY view.dom.parentElement (trong long chinh editor), roi dinh
    // vi bang position:absolute (floating-ui strategy="absolute" mac dinh) -
    // toa do do TINH THEO to tien GAN NHAT co position khac static. Trang
    // soan Entry (SeriesEntryForm.tsx) co 1 wrapper ngoai cung dat
    // "position: relative" (LayoutSpinnerOverlay can no) NAM PHIA TREN
    // editor trong cay DOM - bubble menu vo tinh bam toa do theo GOC cua
    // wrapper do (thuong nam tren cao, ngoai vung nhin thuc te cua doan van
    // ban dang chon) thay vi theo vi tri THAT cua vung chon, nen luon bi
    // day ra ngoai man hinh/khong the thay duoc. Chi dinh appendTo THANG ve
    // document.body de thoat het moi anh huong tu to tien, bat ke trang nao
    // nhung editor nay duoc dat vao trong tuong lai.
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      options={{ placement: "top" }}
      // shouldShow RIENG - mac dinh cua thu vien chi kiem tra "selection
      // khong rong", nhung 1 NodeSelection (bam chon NGUYEN 1 khoi atom nhu
      // Accordion Geographical/Sơ đồ luồng, khong phai bôi đen VĂN BẢN) CUNG
      // tinh la "khong rong" - to mau chu/nen vo nghia cho ca 1 khoi block
      // nhu vay, nen loai tru han truong hop nay (an toan hon LAN dung nghia
      // hon "bôi đen văn bản" nguoi dung mo ta).
      shouldShow={({ editor: ed, state }: { editor: Editor; state: EditorState }) => {
        if (!ed.isEditable) return false;
        const { selection } = state;
        if (selection.empty) return false;
        if (selection instanceof NodeSelection) return false;
        return true;
      }}
    >
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-2 shadow-dropdown">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-ink-faint">Chữ</span>
          <ColorSwatchRow
            colors={TEXT_COLORS}
            activeValue={currentColor}
            onPick={(value) => {
              const chain = editor.chain().focus();
              if (value) chain.setColor(value).run();
              else chain.unsetColor().run();
            }}
          />
        </div>
        <div className="h-5 w-px shrink-0 bg-border" aria-hidden="true" />
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-ink-faint">Nền</span>
          <ColorSwatchRow
            colors={BG_COLORS}
            activeValue={currentBg}
            onPick={(value) => {
              const chain = editor.chain().focus();
              if (value) chain.setBackgroundColor(value).run();
              else chain.unsetBackgroundColor().run();
            }}
          />
        </div>
      </div>
    </BubbleMenu>
  );
}
