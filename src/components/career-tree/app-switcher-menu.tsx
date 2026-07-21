"use client";

import { useState } from "react";
import { Grid2x2 } from "lucide-react";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const AppSwitcherMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Chuyển đổi ứng dụng"
          className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm text-icon transition-colors duration-150 ease-out
             ${open ? "ring ring-primary bg-primary/15" : "hover:bg-hover-bg hover:text-icon-hover"}
            `}
        >
          <Grid2x2
            size={18}
            strokeWidth={1.75}
            className={`${open ? "text-primary" : ""}`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        open={open}
        align="start"
        className="z-50 w-48 origin-top rounded-sm border border-border bg-surface p-3 shadow-dropdown"
      >
        <p className="text-sm text-ink-faint">Upcoming</p>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default AppSwitcherMenu;
