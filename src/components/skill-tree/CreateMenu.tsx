"use client";

import { useState } from "react";
import { ChevronDown, Copy } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// Chi con giu lenh chua lam duoc (Nhan ban Category) - "Tao Tier" gio la nut
// "Them tier" inline trong tung Category tren canvas (AddTierButton.tsx).
const CreateMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Thêm lựa chọn khác"
          className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150 ease-out ${
            open
              ? "bg-hover-bg text-ink"
              : "text-icon hover:bg-hover-bg hover:text-icon-hover"
          }`}
        >
          <ChevronDown size={14} strokeWidth={1.75} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="start"
        className="z-50 w-60 rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
      >
        <button
          type="button"
          disabled
          title="Sắp ra mắt"
          className="flex w-full cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink-faint"
        >
          <Copy size={14} strokeWidth={1.75} />
          <span className="flex-1">Nhân bản Category</span>
          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
            Sắp ra mắt
          </span>
        </button>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default CreateMenu;
