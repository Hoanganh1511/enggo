"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  Compass,
  Feather,
  GraduationCap,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { completeOnboardingAction } from "@/actions/users/complete-onboarding";
import type { LucideIcon } from "lucide-react";

// Modal chao mung 3 buoc cho user MOI (chua co onboardedAt) tren /home - port
// 1-1 UI/UX/animation tu demo nguoi dung dua (cung tong kem/serif/cam
// #d95b16 voi JourneyHero.tsx - dung lai dung ky thuat inline style cho
// gradient/clip-path/skew). Khac demo: goi API THAT o 2 diem —
// dong som (X) chi danh dau da onboard, hoan tat buoc 3 TAO THAT 1
// Workspace + 1 KnowledgeGroup dau tien (xem UserService.completeOnboarding
// o backend) roi dieu huong thang vao do.
const GOAL_CHOICES: {
  value: string;
  title: string;
  text: string;
  icon: LucideIcon;
}[] = [
  {
    value: "self",
    title: "Phát triển bản thân",
    text: "Xây dựng phiên bản tốt hơn mỗi ngày.",
    icon: Target,
  },
  {
    value: "learn",
    title: "Học hỏi & khám phá",
    text: "Tích lũy kiến thức và những điều mới.",
    icon: GraduationCap,
  },
  {
    value: "career",
    title: "Xây dựng sự nghiệp",
    text: "Định hướng con đường riêng.",
    icon: Compass,
  },
  {
    value: "community",
    title: "Kết nối cộng đồng",
    text: "Gặp gỡ những người cùng hành trình.",
    icon: Users,
  },
];

const ORANGE = "#d95b16";

export function WelcomeOnboardingModal({
  username,
  name,
}: {
  username: string;
  name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goal, setGoal] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Dong som (X, hoac bam ra ngoai) - chi danh dau da onboard, KHONG tao
  // Workspace/KnowledgeGroup rong nao (chua co ten chuong). Chay nen, khong
  // chan UI - nguoi dung da thay modal dong ngay.
  function skip() {
    setOpen(false);
    void completeOnboardingAction({ goal: goal ?? undefined });
  }

  async function handleSubmit() {
    const title = chapterTitle.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    try {
      const result = await completeOnboardingAction({
        goal: goal ?? undefined,
        firstChapterTitle: title,
      });
      setOpen(false);
      if (result.workspaceId && result.groupId) {
        router.push(
          `/workspace/${username}/${result.workspaceId}/group/${result.groupId}`,
        );
      }
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-5"
          style={{
            background: "rgba(38,26,17,.43)",
            backdropFilter: "blur(10px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full overflow-hidden"
            style={{
              maxWidth: 720,
              minHeight: 680,
              border: "1px solid #fff",
              borderRadius: 26,
              background:
                "radial-gradient(circle at 50% 0%,#ffe4c5aa,transparent 31%),linear-gradient(145deg,#fffdf9,#fff7ed 58%,#fff0df)",
              boxShadow: "0 35px 100px rgba(42,27,17,.27)",
            }}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div
              className="pointer-events-none absolute"
              style={{
                inset: 10,
                border: "1px solid rgba(217,91,22,.11)",
                borderRadius: 19,
              }}
            />

            <button
              type="button"
              onClick={skip}
              className="absolute top-4.5 right-4.5 z-10 grid size-9.5 cursor-pointer place-items-center rounded-full border text-[#856e5c] transition-all duration-200 ease-out hover:rotate-90"
              style={{
                borderColor: "#eaded1",
                background: "rgba(255,255,255,.73)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = ORANGE)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#856e5c")}
            >
              <X size={18} />
            </button>

            <motion.div
              className="absolute text-[24px]"
              style={{ left: 44, top: 180, color: "#d17a3c" }}
              animate={{ y: [0, -8, 0], rotate: [0, 12, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ✦
            </motion.div>
            <motion.div
              className="absolute text-[28px]"
              style={{ right: 63, top: 150, color: "#d17a3c" }}
              animate={{ y: [0, 8, 0], rotate: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              ✧
            </motion.div>

            <div
              className="flex flex-col items-center px-8 pt-9.5 pb-6 text-center sm:px-14"
              style={{ minHeight: 680 }}
            >
              <div
                className="flex items-center gap-2.5 text-[9px] font-extrabold"
                style={{ color: ORANGE, letterSpacing: "0.2em" }}
              >
                <i className="block h-px w-7.5" style={{ background: "#e5a276" }} />
                <span>WELCOME TO TREE CAREER</span>
                <i className="block h-px w-7.5" style={{ background: "#e5a276" }} />
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.section
                    key="s1"
                    className="flex w-full flex-col items-center"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                  >
                    <BookArt name={name} />
                    <h1
                      className="mt-3 text-[38px] leading-[1] sm:text-[43px]"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontWeight: 500,
                        letterSpacing: "-0.035em",
                        color: "#342b23",
                      }}
                    >
                      Cuộc đời bạn,
                      <br />
                      <span style={{ color: ORANGE }}>câu chuyện của bạn.</span>
                    </h1>
                    <p
                      className="mt-3.5 text-[13px] leading-relaxed"
                      style={{ color: "#8d7968" }}
                    >
                      Chào mừng bạn đến với Tree Career.
                      <br />
                      Đây là nơi bạn viết, học hỏi và trưởng thành qua từng
                      chương.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="mt-5 flex min-h-11.25 items-center justify-center gap-2.5 rounded-[10px] px-5 text-[13px] font-bold text-white transition-transform duration-200 ease-out hover:-translate-y-px"
                      style={{
                        background: ORANGE,
                        boxShadow: "0 9px 22px rgba(217,91,22,.25)",
                      }}
                    >
                      Mở trang đầu tiên <ArrowRight size={17} />
                    </button>
                    <small className="mt-3 text-[10px]" style={{ color: "#aa9989" }}>
                      Bạn có thể thay đổi mọi thứ sau này.
                    </small>
                  </motion.section>
                )}

                {step === 2 && (
                  <motion.section
                    key="s2"
                    className="flex w-full flex-col items-center pt-9"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                  >
                    <small
                      className="text-[9px] font-extrabold"
                      style={{ color: ORANGE, letterSpacing: "0.2em" }}
                    >
                      CHƯƠNG I
                    </small>
                    <h2
                      className="mt-3 text-[32px] leading-[1] sm:text-[38px]"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontWeight: 500,
                        letterSpacing: "-0.03em",
                        color: "#342b23",
                      }}
                    >
                      Bạn muốn viết
                      <br />
                      <span style={{ color: ORANGE }}>về điều gì?</span>
                    </h2>
                    <p className="text-[13px]" style={{ color: "#8d7968" }}>
                      Chọn những điều bạn muốn tập trung trong hành trình của
                      bạn.
                    </p>

                    <div className="mt-6 grid w-full max-w-140 grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {GOAL_CHOICES.map(({ value, title, text, icon: Icon }) => {
                        const selected = goal === value;
                        return (
                          <motion.button
                            key={value}
                            type="button"
                            whileHover={{ y: -2 }}
                            onClick={() => setGoal(value)}
                            className="relative flex min-h-24 items-center gap-2.75 rounded-[13px] border p-3.25 text-left transition-colors duration-200 ease-out"
                            style={{
                              borderColor: selected ? ORANGE : "#e7dbce",
                              background: selected ? "#fff7ee" : "#fffaf4",
                              boxShadow: selected
                                ? "0 0 0 2px rgba(217,91,22,.09)"
                                : undefined,
                            }}
                          >
                            <span
                              className="grid size-9.5 shrink-0 place-items-center rounded-[10px]"
                              style={{ background: "#fff0e4", color: ORANGE }}
                            >
                              <Icon size={18} />
                            </span>
                            <span>
                              <b className="block text-[12px]" style={{ color: "#342b23" }}>
                                {title}
                              </b>
                              <small
                                className="mt-0.75 block pr-3 text-[10px] leading-relaxed"
                                style={{ color: "#9b8a7b" }}
                              >
                                {text}
                              </small>
                            </span>
                            <em
                              className="absolute top-2.5 right-2.5 grid size-4.25 place-items-center rounded-full border text-[10px] not-italic"
                              style={{
                                borderColor: selected ? ORANGE : "#d9cabc",
                                background: selected ? ORANGE : "transparent",
                                color: "#fff",
                              }}
                            >
                              {selected ? "✓" : ""}
                            </em>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex w-full max-w-140 items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-0.75 text-[12px]"
                        style={{ color: "#897667" }}
                      >
                        <ChevronLeft size={16} /> Quay lại
                      </button>
                      <button
                        type="button"
                        disabled={goal === null}
                        onClick={() => setStep(3)}
                        className="flex min-h-11.25 items-center justify-center gap-2.25 rounded-[10px] px-5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
                        style={{
                          background: ORANGE,
                          boxShadow: "0 9px 22px rgba(217,91,22,.25)",
                        }}
                      >
                        Tiếp tục <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.section>
                )}

                {step === 3 && (
                  <motion.section
                    key="s3"
                    className="flex w-full flex-col items-center pt-10.5"
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                  >
                    <small
                      className="text-[9px] font-extrabold"
                      style={{ color: ORANGE, letterSpacing: "0.2em" }}
                    >
                      TRANG ĐẦU TIÊN
                    </small>
                    <div
                      className="my-3 grid size-15.5 place-items-center rounded-full border"
                      style={{ background: "#fff0e3", borderColor: "#f1c9ab", color: ORANGE }}
                    >
                      <Feather size={25} />
                    </div>
                    <h2
                      className="text-[32px] leading-[1]"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontWeight: 500,
                        letterSpacing: "-0.03em",
                        color: "#342b23",
                      }}
                    >
                      Hãy đặt tên cho
                      <br />
                      <span style={{ color: ORANGE }}>chương đầu tiên.</span>
                    </h2>
                    <p className="mt-3 text-[13px]" style={{ color: "#8d7968" }}>
                      Không cần hoàn hảo. Chỉ cần là điều bạn muốn bắt đầu.
                    </p>
                    <textarea
                      autoFocus
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      placeholder="Ví dụ: Một khởi đầu mới..."
                      rows={2}
                      className="mt-6 w-full max-w-130 resize-none rounded-xl border px-4 py-3.5 text-[13px] outline-none transition-shadow duration-200 ease-out"
                      style={{ borderColor: "#dfd2c5", background: "#fffdf9", color: "#342b23" }}
                    />
                    <div className="mt-5 flex w-full max-w-130 items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex items-center gap-0.75 text-[12px]"
                        style={{ color: "#897667" }}
                      >
                        <ChevronLeft size={16} /> Quay lại
                      </button>
                      <button
                        type="button"
                        disabled={!chapterTitle.trim() || submitting}
                        onClick={handleSubmit}
                        className="flex min-h-11.25 items-center justify-center gap-2.25 rounded-[10px] px-5 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
                        style={{
                          background: ORANGE,
                          boxShadow: "0 9px 22px rgba(217,91,22,.25)",
                        }}
                      >
                        {submitting ? "Đang tạo..." : "Viết chương đầu"}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>

              <div className="mt-auto flex gap-1.5 pt-6">
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className="h-0.75 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: step >= n ? 34 : 25,
                      background: step >= n ? ORANGE : "#e5d9cd",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Minh hoa "cuon sach mo" cho buoc 1 - dung ky thuat inline style giong het
// BookArt trong JourneyHero.tsx (gradient/skew/drop-shadow qua style, khong
// dung anh/SVG rieng). "THE STORY OF {name}" dung ten that cua user.
function BookArt({ name }: { name: string }) {
  return (
    <div className="relative h-68.5 w-97.5 max-w-full">
      <div
        className="absolute rounded-full"
        style={{
          width: 300,
          height: 200,
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-45%)",
          background:
            "radial-gradient(circle,#ffe0b8,#ffedd8 40%,transparent 70%)",
        }}
      />
      <div
        className="absolute"
        style={{
          width: 255,
          height: 174,
          left: "50%",
          bottom: 17,
          transform: "translateX(-50%) rotate(-3deg)",
          filter: "drop-shadow(0 18px 12px rgba(80,48,22,.18))",
        }}
      >
        <div
          className="absolute bottom-0"
          style={{
            left: 0,
            width: 127,
            height: 150,
            background: "linear-gradient(145deg,#fffaf0,#ead4ae)",
            border: "1px solid #d4ba8d",
            borderRadius: "9px 3px 4px 15px",
            transform: "skewY(4deg)",
          }}
        />
        <div
          className="absolute bottom-0"
          style={{
            right: 0,
            width: 127,
            height: 150,
            background: "linear-gradient(145deg,#fffaf0,#ead4ae)",
            border: "1px solid #d4ba8d",
            borderRadius: "3px 9px 15px 4px",
            transform: "skewY(-4deg)",
          }}
        />
        <div
          className="absolute bottom-0"
          style={{
            left: "50%",
            width: 8,
            height: 151,
            transform: "translateX(-50%)",
            background: "#ae8552",
            borderRadius: "50%",
            zIndex: 3,
          }}
        />
        <div
          className="absolute z-10 text-center"
          style={{ left: "50%", top: 48, transform: "translateX(-50%)", width: 130, color: "#765a3e" }}
        >
          <small className="block" style={{ fontFamily: "Georgia,serif", fontSize: 8, letterSpacing: "0.14em" }}>
            THE STORY OF
          </small>
          <b
            className="mt-1 block truncate"
            style={{ fontFamily: "Georgia,serif", fontSize: 18 }}
          >
            {name.toUpperCase()}
          </b>
          <em className="mt-1 block not-italic" style={{ fontFamily: "Georgia,serif", fontSize: 10, color: "#b87b40" }}>
            Chapter I
          </em>
        </div>
      </div>
      <div
        className="absolute"
        style={{ left: 32, top: 38, fontSize: 74, color: "#d67b3d", transform: "rotate(-27deg)" }}
      >
        ⌁
      </div>
      <div
        className="absolute"
        style={{ right: 43, bottom: 5, fontSize: 64, color: "#60452e", transform: "rotate(12deg)" }}
      >
        ✒
      </div>
      <Sparkles
        size={19}
        className="absolute animate-pulse"
        style={{ right: 68, top: 55, color: "#d27b3e" }}
      />
    </div>
  );
}
