"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Lock, NotebookPen, ShieldCheck } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { getSelfStatusAction } from "@/actions/users/get-self-status";

type CheckState = "idle" | "checking" | "admin" | "denied";

// Cong vao GL Daily Diary that (/u/:username/daily-diary) - xac thuc THAT
// qua backend (getSelfStatusAction -> GET users/me, co isAdmin) moi lan mo
// modal, khong chi check client. AdminGuard o backend van chan doc lap neu
// ai co thu vao thang URL ma khong qua modal nay (xem plan).
export function DailyDiaryAccessModal({ accent }: { accent: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<CheckState>("idle");

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setState("checking");
      getSelfStatusAction()
        .then((res) => setState(res.isAdmin ? "admin" : "denied"))
        .catch(() => setState("denied"));
    } else {
      setState("idle");
    }
  }

  function handleEnter() {
    if (!session?.username) return;
    router.push(`/u/${session.username}/daily-diary`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="mt-2 flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:brightness-105"
        style={{ background: accent }}
      >
        <NotebookPen size={14} strokeWidth={2} />
        Truy cập Daily Diary
      </button>

      <SimpleModal
        open={open}
        onOpenChange={handleOpenChange}
        title="Xác thực quyền truy cập"
        description="GL Daily Diary hiện chỉ dành cho quản trị viên."
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          {state === "checking" && (
            <>
              <Loader2
                size={28}
                className="animate-spin"
                style={{ color: accent }}
              />
              <p className="text-sm text-ink-muted">
                Đang xác thực quyền truy cập...
              </p>
            </>
          )}

          {state === "admin" && (
            <>
              <span
                className="grid size-12 place-items-center rounded-full"
                style={{ background: `${accent}1a`, color: accent }}
              >
                <ShieldCheck size={22} strokeWidth={2} />
              </span>
              <p className="text-sm font-medium text-ink">
                Bạn có quyền truy cập
              </p>
              <button
                type="button"
                onClick={handleEnter}
                className="mt-1 flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:brightness-105"
                style={{ background: accent }}
              >
                Vào Daily Diary
              </button>
            </>
          )}

          {state === "denied" && (
            <>
              <span className="grid size-12 place-items-center rounded-full bg-danger/10 text-danger">
                <Lock size={20} strokeWidth={2} />
              </span>
              <p className="text-sm font-medium text-ink">
                Bạn không có quyền truy cập tính năng này
              </p>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="mt-1 rounded-full border border-border px-5 py-2 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                Đóng
              </button>
            </>
          )}
        </div>
      </SimpleModal>
    </>
  );
}
