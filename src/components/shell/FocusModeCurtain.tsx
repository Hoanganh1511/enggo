"use client";

import { motion } from "framer-motion";
import { useFocusModeStore } from "@/stores/focus-mode-store";

// 2 tam "rem san khau" tu 2 canh vao giua, che TOAN MAN HINH trong luc
// layout thuc su thay doi (an/hien sidebar chinh + header, noi dung Series
// dan rong/keo len top) - yeu cau nguoi dung 2026-09-16: "làm hiệu ứng đóng
// rèm từ 2 bên vào che đi... Mục tiêu là không cho nhìn thấy quá trình
// transform... layout... vỡ ra". Dieu phoi trinh tu (dong rem -> doi state
// that -> doi 1 nhip on dinh -> mo rem) nam TRON VEN trong
// focus-mode-store.ts (`toggle()`) - component nay CHI ve 2 tam rem theo
// dung 1 bien `curtainClosed`, khong tu quyet dinh timing gi ca.
//
// z-[200]: cao hon MOI overlay khac trong app (NavTransitionOverlay z-100,
// drawer/backdrop z-40/z-50...) - luc dong rem PHAI che TUYET DOI moi thu,
// khong the de lo bat ky lop nao khac de len tren.
export function FocusModeCurtain() {
  const curtainClosed = useFocusModeStore((s) => s.curtainClosed);

  return (
    <>
      <motion.div
        className="fixed inset-y-0 left-0 z-[200] w-1/2 bg-ink"
        initial={false}
        animate={{ x: curtainClosed ? "0%" : "-100%" }}
        transition={{ duration: 0.38, ease: [0.65, 0, 0.35, 1] }}
        aria-hidden="true"
      />
      <motion.div
        className="fixed inset-y-0 right-0 z-[200] w-1/2 bg-ink"
        initial={false}
        animate={{ x: curtainClosed ? "0%" : "100%" }}
        transition={{ duration: 0.38, ease: [0.65, 0, 0.35, 1] }}
        aria-hidden="true"
      />
    </>
  );
}
