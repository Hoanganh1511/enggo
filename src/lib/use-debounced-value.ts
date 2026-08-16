"use client";

import { useEffect, useState } from "react";

// Hook debounce dung chung DAU TIEN trong repo (chua co tien le nao khac) -
// tra ve gia tri CHAM lai delay ms sau lan doi cuoi cung, dung cho o tim
// kiem header (khong goi API tren tung ky tu go).
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
