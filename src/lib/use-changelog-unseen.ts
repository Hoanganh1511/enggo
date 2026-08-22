"use client";

import { useEffect, useState, useTransition } from "react";
import { CHANGELOG } from "./changelog";

const STORAGE_KEY = "changelog-last-seen";

// So sanh entry MOI NHAT (dau mang CHANGELOG) voi id da luu trong
// localStorage - chi la trang thai "da xem chua" CUC BO tren trinh duyet nay
// (khong dong bo nhieu thiet bi/backend) de hien 1 cham do "co gi moi" tren
// icon, bien mat sau khi mo popover 1 lan. Khac han viec dung localStorage
// lam cache thay the fetch (da tu choi truoc do) - day chi la 1 UI preference
// don thuan, khong phai du lieu can dong bo.
export function useChangelogUnseen() {
  const [hasUnseen, setHasUnseen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const latestId = CHANGELOG[0]?.id;
    if (!latestId) return;
    const lastSeen = window.localStorage.getItem(STORAGE_KEY);
    startTransition(() => setHasUnseen(lastSeen !== latestId));
  }, []);

  function markSeen() {
    const latestId = CHANGELOG[0]?.id;
    if (!latestId) return;
    window.localStorage.setItem(STORAGE_KEY, latestId);
    setHasUnseen(false);
  }

  return { hasUnseen, markSeen };
}
