import { Bell, CalendarDays, NotebookPen } from "lucide-react";
import { HOME_FEATURES } from "@/components/discover/home-features-data";
import { DailyDiaryAccessModal } from "@/components/services/DailyDiaryAccessModal";
import { hexToRgba } from "@/lib/utils";

const service = HOME_FEATURES.find((s) => s.slug === "daily-diary")!;

// Trang chi tiet RIENG cho GL Daily Diary - bo cuc CAN GIUA (khac han Life
// Book 2 cot), motif "luoi ngay/streak" thay vi anh minh hoa cuon sach - moi
// dich vu 1 thiet ke rieng theo yeu cau nguoi dung, khong con dung chung
// template "/services/[slug]" (da bo, cung khong con nut "Tất cả dịch vụ"
// chung o dau trang).
export default function DailyDiaryServicePage() {
  const accent = service.accentColor;

  return (
    <div className="relative overflow-hidden" style={{ background: "#fff" }}>
      <div
        className="pointer-events-none absolute top-0 left-1/2 h-125 w-125 -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: hexToRgba(accent, 0.08) }}
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <span
          className="grid size-16 place-items-center rounded-2xl text-white"
          style={{ background: accent }}
        >
          <NotebookPen size={28} strokeWidth={2} />
        </span>

        <h1 className="mt-7 text-[38px] leading-[1.1] font-extrabold text-ink sm:text-[44px]">
          Một ngày, <span style={{ color: accent }}>một trang.</span>
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
          {service.description}
        </p>

        <span
          className="mt-6 rounded-full px-4 py-1.5 text-xs font-semibold"
          style={{ background: hexToRgba(accent, 0.1), color: accent }}
        >
          Sắp ra mắt
        </span>
        <p className="mt-3 text-xs text-ink-faint">
          Chúng tôi đang xây dựng công cụ này — quay lại sau nhé!
        </p>

        <DailyDiaryAccessModal accent={accent} />

        <StreakCalendar accent={accent} />

        <div className="mt-10 grid w-full max-w-md grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-border px-4 py-3 text-left">
            <CalendarDays size={16} style={{ color: accent }} />
            <p className="text-xs text-ink-muted">Mỗi ngày một mục nhỏ, không áp lực</p>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-border px-4 py-3 text-left">
            <Bell size={16} style={{ color: accent }} />
            <p className="text-xs text-ink-muted">Nhắc nhẹ nhàng để duy trì thói quen</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Minh hoa "luoi ngay" kieu lich streak - hoan toan trang tri/khai niem
// (KHONG phai du lieu that cua ai ca, chi mo phong tinh than "moi ngay 1
// trang"), phan biet ro rang voi minh hoa "cuon sach" cua Life Book.
function StreakCalendar({ accent }: { accent: string }) {
  const cells = Array.from({ length: 35 }, (_, i) => i);
  return (
    <div className="mt-10 grid grid-cols-7 gap-1.5">
      {cells.map((i) => {
        const filled = (i * 7) % 11 < 6;
        return (
          <span
            key={i}
            className="size-5.5 rounded-[6px]"
            style={{
              background: filled ? hexToRgba(accent, 0.25 + ((i % 4) * 0.15)) : "#f2f2f2",
            }}
          />
        );
      })}
    </div>
  );
}
