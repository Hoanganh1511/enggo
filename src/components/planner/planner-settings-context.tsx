"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getPlannerSettingsAction,
  updatePlannerSettingsAction,
} from "@/actions/planner/planner";
import type { PlannerSettings, PlannerSettingsPatch } from "@/lib/api/planner";

// [2026-10-07] Gia tri mac dinh - khop 1-1 voi @default trong model
// PlannerSettings (backend schema.prisma). Dung lam gia tri KHOI TAO (truoc
// khi fetch tu server xong) - tranh 1 nhip "loading rong/undefined" luc moi
// mo Planner, UI luon co du lieu HOP LY de render ngay ca khi chua kip tai.
export const DEFAULT_PLANNER_SETTINGS: PlannerSettings = {
  userId: "",
  weekStartsOn: "MONDAY",
  timeFormat: "24H",
  showWeekends: true,
  showAllDaySection: true,
  density: "COMFORTABLE",
  workingHoursStart: 480,
  workingHoursEnd: 1320,
  firstVisibleHour: 0,
  lastVisibleHour: 24,
  timeSlotMinutes: 30,
  // [2026-10-09] showTaskType -> showCategory; bo showArea/showProject (2 cot
  // area/project da bi xoa khoi PlannerItem); them showStatus/showLocation.
  // Phai KHOP voi @default trong model PlannerSettings (schema.prisma) -
  // day la gia tri dung TRUOC khi fetch dau tien tra ve, lech la UI nhay 1
  // nhip khi settings that ve.
  showCategory: true,
  showStatus: true,
  showDuration: true,
  showLocation: true,
  showPriority: true,
  completedTaskDisplay: "KEEP_VISIBLE",
  completedTaskStyle: "CHECK_ICON",
};

type PlannerSettingsContextValue = {
  settings: PlannerSettings;
  // Cap nhat LAC QUAN (optimistic) - doi UI NGAY, roi moi goi API nen ngam
  // (fire-and-forget, khong await trong onClick) - khop tinh than "instant
  // apply, khong co nut Save" cua Settings modal (xem comment
  // PlannerSettingsModal.tsx).
  update: (patch: PlannerSettingsPatch) => void;
};

const PlannerSettingsContext = createContext<PlannerSettingsContextValue>({
  settings: DEFAULT_PLANNER_SETTINGS,
  update: () => {},
});

export function PlannerSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlannerSettings>(DEFAULT_PLANNER_SETTINGS);

  // [2026-10-07] Tai 1 LAN luc mo Planner - CUNG tinh than voi
  // typeColorOverrides trong PlannerShell.tsx (useEffect([]) goi
  // listPlannerTypeColorsAction luc mount).
  useEffect(() => {
    getPlannerSettingsAction()
      .then(setSettings)
      .catch(() => {});
  }, []);

  const update = useCallback((patch: PlannerSettingsPatch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    updatePlannerSettingsAction(patch).catch(() => {
      // [2026-10-07] Khong rollback UI khi API loi (thay vi "giat nguoc"
      // gay roi mat luc nguoi dung dang bam lien tiep nhieu toggle) - lan
      // tai lai trang sau se tu dong bo lai dung gia tri server.
    });
  }, []);

  return (
    <PlannerSettingsContext.Provider value={{ settings, update }}>
      {children}
    </PlannerSettingsContext.Provider>
  );
}

export function usePlannerSettings(): PlannerSettingsContextValue {
  return useContext(PlannerSettingsContext);
}
