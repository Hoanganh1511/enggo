"use client";

import { createContext, useContext } from "react";
import {
  resolveLifeItemPalette,
  type LifeItemType,
  type LifeItemPalette,
} from "@/lib/planner/life-item-types";

// Override palette (section 21 "User customization", PlannerTypeColor o
// backend) - 1 Context DUY NHAT nap 1 LAN o goc PlannerShell, tranh phai
// truyen tay qua tung tang component (TimedItemChip/AllDayItemChip/ItemRow/
// TimelineRow/BigTimelineItem/AddTaskForm/EditItemForm... qua nhieu cap long
// nhau de truyen props xuyen suot).
const TypeColorOverridesContext = createContext<Partial<Record<LifeItemType, string>>>({});

export function LifeItemPaletteProvider({
  overrides,
  children,
}: {
  overrides: Partial<Record<LifeItemType, string>>;
  children: React.ReactNode;
}) {
  return (
    <TypeColorOverridesContext.Provider value={overrides}>{children}</TypeColorOverridesContext.Provider>
  );
}

// [2026-10-07] itemColorPaletteId - mau RIENG cua 1 item CU THE (optional),
// uu tien CAO NHAT khi co gia tri - xem comment day du o resolveLifeItemPalette().
export function useLifeItemPalette(
  type: LifeItemType,
  itemColorPaletteId?: string | null,
): LifeItemPalette {
  const overrides = useContext(TypeColorOverridesContext);
  return resolveLifeItemPalette(type, overrides, itemColorPaletteId);
}

// Ban THO cua override (khong tu resolve san 1 Type CU THE) - dung khi can
// resolve NHIEU item/Type khac nhau trong 1 vong lap (vd DayItemsPreview.map()) -
// khong goi hook useLifeItemPalette() BEN TRONG .map() duoc (vi pham Rules of
// Hooks, so lan goi hook thay doi theo do dai mang).
export function useTypeColorOverrides(): Partial<Record<LifeItemType, string>> {
  return useContext(TypeColorOverridesContext);
}
