"use client";

import { ChevronsDown, ChevronsUp, Rows3, Rows2 } from "lucide-react";
import type { CardSize } from "./toolbar-types";

type ViewMenuProps = {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  cardSize: CardSize;
  onCardSizeChange: (size: CardSize) => void;
};

// "Auto Layout"/"Fit View" trong spec goc gia dinh 1 canvas tu do (nhu React
// Flow) - Skill Tree lai la 1 luoi CSS co dinh theo tier, khong co vi tri/zoom
// tu do de "fit" hay "auto-arrange", nen 2 muc do bi bo (khong ap dung, khac
// voi cac muc "chua lam" khac). 3 nut con lai (Mo rong/Thu gon tat ca tier,
// mat do hien thi) tach thanh nut rieng dat thang ngoai toolbar - khop tinh
// than "standalone button" cua anh mau - thay vi gop chung 1 dropdown "Hien
// thi" nhu truoc. Mat do hien thi gio la 1 nut toggle Compact <-> Comfortable
// (icon doi theo trang thai hien tai) thay vi 2 muc chon trong dropdown.
const ViewMenu = ({
  onExpandAll,
  onCollapseAll,
  cardSize,
  onCardSizeChange,
}: ViewMenuProps) => {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        title="Mở rộng tất cả tier"
        onClick={onExpandAll}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
      >
        <ChevronsDown size={15} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title="Thu gọn tất cả tier"
        onClick={onCollapseAll}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
      >
        <ChevronsUp size={15} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        title={
          cardSize === "sm"
            ? "Đang Gọn (Compact) - bấm để chuyển Đầy đủ"
            : "Đang Đầy đủ (Comfortable) - bấm để chuyển Gọn"
        }
        onClick={() => onCardSizeChange(cardSize === "sm" ? "md" : "sm")}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
      >
        {cardSize === "sm" ? (
          <Rows3 size={15} strokeWidth={1.75} />
        ) : (
          <Rows2 size={15} strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
};

export default ViewMenu;
