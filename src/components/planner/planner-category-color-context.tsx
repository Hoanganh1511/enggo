"use client";

// [2026-10-09] Thay life-item-palette-context.tsx (mau theo LifeItemType +
// 1 paletteId tu bo 14 palette co san). Gio: mau theo CATEGORY, luu truc
// tiep 3 hex (main/light/border) de khop design reference.
//
// Van la 1 Context nap 1 LAN o goc PlannerShell - the/hang/form/panel nam
// qua nhieu cap long nhau de truyen tay override qua tung tang.

import { createContext, useContext } from "react";
import {
  resolveCategoryColor,
  type CategoryColor,
  type CategoryColorOverrides,
  type PlannerCategory,
} from "@/lib/planner/planner-domain";

const CategoryColorContext = createContext<CategoryColorOverrides>({});

export function PlannerCategoryColorProvider({
  overrides,
  children,
}: {
  overrides: CategoryColorOverrides;
  children: React.ReactNode;
}) {
  return (
    <CategoryColorContext.Provider value={overrides}>
      {children}
    </CategoryColorContext.Provider>
  );
}

/** Ban THO - dung khi can resolve NHIEU category trong 1 vong lap (khong goi
 *  hook ben trong .map() duoc: vi pham Rules of Hooks). */
export function useCategoryColorOverrides(): CategoryColorOverrides {
  return useContext(CategoryColorContext);
}

/** Mau da resolve cho 1 category CU THE. */
export function useCategoryColor(category: PlannerCategory): CategoryColor {
  return resolveCategoryColor(category, useContext(CategoryColorContext));
}
