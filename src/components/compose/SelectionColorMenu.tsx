"use client";

import { useState } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import { NodeSelection, type EditorState } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { Palette } from "lucide-react";
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
    <div className="flex items-center gap-1.5">
      {colors.map((c) => (
        <button
          key={c.label}
          type="button"
          title={c.label}
          onClick={() => onPick(c.value)}
          className={cn(
            "flex size-6 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full ring-1 ring-border ring-offset-1 ring-offset-surface transition-shadow duration-100 ease-out",
            activeValue === c.value && "ring-2 ring-ink",
          )}
          style={{ backgroundColor: c.value ?? "transparent" }}
        >
          {/* value=null ("Mặc định"/"Không nền") - vach cheo trang tri thay
              vi 1 mau that, bao hieu "xoá về gốc". cursor-pointer THEM o day -
              bug nguoi dung bao: con tro van la mui ten mac dinh khi di
              CHINH GIUA len swatch nay (khac cac swatch mau khac khong co
              lop <span> con phu kin nut). `pointer-events-none` la fix DUNG
              hon (span nay chi de TRANG TRI, khong can nhan click rieng) -
              chuot "xuyen qua" thang toi <button> cha, tu dong ke thua đúng
              cursor cua no thay vi phai khai bao lai. */}
          {c.value === null && (
            <span
              className="pointer-events-none block size-full"
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

// [2026-09-18] CA HAI ham duoi day PHAI la reference ON DINH (khai bao NGOAI
// component, khong phai arrow function tao lai moi lan render) - bug that su
// nguoi dung bao: loi React #185 "Maximum update depth exceeded" dung LUC
// bam con tro vao vung soan. Nguyen nhan: SeriesEntryEditor dat
// `shouldRerenderOnTransaction: true` tren useEditor() nen component nay
// RE-RENDER tren MOI transaction (ke ca transaction CHI DOI SELECTION, tuc
// moi lan bam chuot). Truoc day `appendTo`/`shouldShow` la arrow function
// MOI moi lan render -> effect noi bo cua BubbleMenu (phu thuoc tham chieu
// 2 prop nay) huy+dung lai vong theo doi vi tri (floating-ui autoUpdate) MOI
// LAN render -> qua trinh dung lai do tu kich hoat 1 cap nhat khac -> vong
// lap vo han dung luc tao selection DAU TIEN (click vao editor). Hoisted ra
// ngoai = tham chieu KHONG DOI qua cac lan render => effect chi chay 1 lan.
function appendToBody() {
  return document.body;
}

function shouldShowTextSelectionOnly({ editor: ed, state }: { editor: Editor; state: EditorState }) {
  if (!ed.isEditable) return false;
  const { selection } = state;
  if (selection.empty) return false;
  if (selection instanceof NodeSelection) return false;
  // Bôi đen văn bản BÊN TRONG 1 bảng - loai tru rieng truong hop nay (bug
  // nguoi dung bao "Bị trùng 2 cái này nè. Đè nhau", kem anh chup 2 bubble
  // menu deu cung placement:"top" nen chong khit len nhau): TableControlsMenu.tsx
  // (them/xoa hang-cot) CUNG hien bat ke selection rong hay khong, mien la
  // con tro dang o trong bang - 2 dieu kien "co bôi đen" va "dang o trong
  // bang" hoan toan doc lap voi nhau nen co the CUNG dung 1 luc. Uu tien
  // TableControlsMenu (menu DAC THU cho ngu canh dang o) khi ca 2 deu du
  // dieu kien hien, thay vi co gang xep 2 bubble menu canh nhau (BubbleMenu
  // cua tiptap khong ho tro dat vi tri tuong doi giua 2 instance voi nhau).
  if (ed.isActive("table")) return false;
  return true;
}

// [2026-09-18] CUNG ly do nhu 2 ham tren - `options={{ placement: "top" }}`
// truoc day la OBJECT LITERAL MOI moi lan render, CUNG nam trong dependency
// array cua useEffect noi bo BubbleMenu (xem BubbleMenu.tsx trong
// @tiptap/react) nen TU NO cung du gay dung vong lap "Maximum update depth
// exceeded" DU 2 ham kia da hoisted xong - day la manh con thieu that su gay
// crash van tiep dien sau lan fix truoc.
const BUBBLE_MENU_OPTIONS = { placement: "top" as const };

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

  // [2026-09-22] Mac dinh CHI hien 1 icon nho ("Palette") thay vi bung het
  // toan bo bang mau NGAY khi bôi đen - yeu cau nguoi dung: "đừng cho hiện
  // luôn... cho hiện 1 icon setting trước đã, ấn vào setting thì mới cho
  // bật ra, không nó chê hết các phần khác" (bang mau full 2 hang qua to,
  // che mat noi dung/toolbar ben duoi ngay ca khi chi muon lam viec khac voi
  // vung dang chon). Bam icon moi "no ra" bang mau day du.
  //
  // `panelOpen` phai TU DONG DONG LAI moi khi chuyen sang 1 vung chon MOI
  // (khong giu trang thai "dang mo" tu lan chon truoc) - neu khong, do
  // <BubbleMenu> chi AN/HIEN qua CSS (khong unmount React children, xem
  // BubbleMenu.tsx trong @tiptap/react), state cu se "rò rỉ" sang lan bôi
  // đen tiep theo (mo san dù chua bam gi). So sanh selection.from/to voi lan
  // render TRUOC (luu qua useState, mau "Adjusting state during render" cua
  // React - xem RegionGlobeModal.tsx dung CHUNG pattern nay) de phat hien
  // "vua doi sang vung chon khac" va tu dong dong lai panel.
  const { from, to } = editor.state.selection;
  const selectionKey = `${from}:${to}`;
  const [panelOpen, setPanelOpen] = useState(false);
  const [lastSelectionKey, setLastSelectionKey] = useState(selectionKey);
  if (selectionKey !== lastSelectionKey) {
    setLastSelectionKey(selectionKey);
    setPanelOpen(false);
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
      appendTo={appendToBody}
      // z-50 - bug nguoi dung bao "bị chìm dưới nền editor": phan tu noi cua
      // BubbleMenu (menuEl trong BubbleMenu.tsx) khong tu mang z-index nao,
      // trong khi no la CON TRUC TIEP cua document.body (xem appendToBody o
      // tren) - cac phan tu KHAC trong app (form/sidebar nen trang, z-index
      // mac dinh "auto" nhung xep SAU no trong DOM neu nam ben trong 1 the
      // sticky/toolbar co tao stacking context rieng) co the ve DE LEN TREN.
      // className truyen vao day duoc gan THANG len chinh element noi (xem
      // useMenuElementProps.ts trong @tiptap/react), khong phai len children.
      className="z-50"
      options={BUBBLE_MENU_OPTIONS}
      // shouldShow RIENG - mac dinh cua thu vien chi kiem tra "selection
      // khong rong", nhung 1 NodeSelection (bam chon NGUYEN 1 khoi atom nhu
      // Accordion Geographical/Sơ đồ luồng, khong phai bôi đen VĂN BẢN) CUNG
      // tinh la "khong rong" - to mau chu/nen vo nghia cho ca 1 khoi block
      // nhu vay, nen loai tru han truong hop nay (an toan hon LAN dung nghia
      // hon "bôi đen văn bản" nguoi dung mo ta).
      shouldShow={shouldShowTextSelectionOnly}
    >
      {panelOpen ? (
        /* [2026-09-19] Xep 2 hang DOC (nhan tren, swatch duoi) thay vi 1
            hang NGANG duy nhat voi vach doc o giua - yeu cau nguoi dung: "Bố
            cục lại phần chọn màu này UI/UX cho chuẩn" (ban cu: "Chữ" + 7
            cham + vach + "Nền" + 7 cham don het vao 1 dong, kho phan biet
            nhom nao voi nhom nao khi luot nhanh qua). Nhan dat NGAY TREN
            swatch cua chinh no (khong con canh nhau tren cung 1 dong) - ro
            rang hon ve PHAN CAP thi giac: 1 nhan luon di kem 1 hang swatch
            BEN DUOI no, vach ngang mong (thay vach doc) tach 2 nhom mot
            cach tu nhien giong 2 "muc" doc lap trong 1 danh sach, khong
            phai 2 cot chen chung 1 hang chat choi. */
        <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-2.5 shadow-dropdown">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">Màu chữ</span>
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
          <div className="h-px w-full bg-border" aria-hidden="true" />
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">Màu nền</span>
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
      ) : (
        // Chi 1 icon nho - bam moi "no ra" bang mau day du o tren (xem
        // comment `panelOpen` trong than component). `onMouseDown` +
        // preventDefault (thay vi onClick thuong) - giu nguyen SELECTION
        // dang bôi đen (click vao 1 phan tu ngoai editor binh thuong se lam
        // mat selection/blur editor TRUOC KHI onClick kip chay, khien
        // BubbleMenu tu an mat ngay khi vua bam icon).
        <button
          type="button"
          title="Chọn màu chữ/nền cho đoạn đang chọn"
          onMouseDown={(e) => {
            e.preventDefault();
            setPanelOpen(true);
          }}
          className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-ink-muted shadow-dropdown hover:text-ink"
        >
          <Palette size={15} strokeWidth={1.9} />
        </button>
      )}
    </BubbleMenu>
  );
}
