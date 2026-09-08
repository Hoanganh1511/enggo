import { BookOpen, Camera, Clock3, Share2 } from "lucide-react";
import { HOME_FEATURES } from "@/components/discover/home-features-data";
import { hexToRgba } from "@/lib/utils";

const service = HOME_FEATURES.find((s) => s.slug === "life-book")!;

// Trang chi tiet RIENG cho GL Life Book - thiet ke am/hoai niem/tap chi rieng
// cua no (KHAC hoan toan Daily Diary), KHONG con dung chung 1 template
// "/services/[slug]" nhu truoc (da bo theo yeu cau nguoi dung - moi dich vu
// thiet ke rieng, khong con nut "Tất cả dịch vụ" chung o dau trang). Van
// trung thuc "Sắp ra mắt" - editor that (Konva, /services/gl-life-book/
// [bookId]) da co san trong code nhung CHUA duoc noi vao day theo yeu cau
// (pham vi lan nay chi lam moi giao dien 2 trang chi tiet).
export default function LifeBookServicePage() {
  const accent = service.accentColor;

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#fffaf9,#fff)" }}
    >
      <div
        className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full blur-3xl"
        style={{ background: hexToRgba(accent, 0.12) }}
      />
      <div
        className="pointer-events-none absolute top-40 -right-32 size-112 rounded-full blur-3xl"
        style={{ background: hexToRgba(accent, 0.08) }}
      />

      <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-center gap-14 px-6 py-24 lg:grid-cols-2">
        <div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide uppercase"
            style={{ borderColor: hexToRgba(accent, 0.3), color: accent, background: hexToRgba(accent, 0.06) }}
          >
            <BookOpen size={12} /> Good Life · Life Book
          </span>
          <h1
            className="mt-5 text-[42px] leading-[1.08] font-extrabold text-ink italic sm:text-[52px]"
            style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic" }}
          >
            Cuộc đời bạn,
            <br />
            <span style={{ color: accent }}>từng trang một.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-muted">
            {service.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{ background: hexToRgba(accent, 0.1), color: accent }}
            >
              Sắp ra mắt
            </span>
            <span className="text-xs text-ink-faint">
              Chúng tôi đang hoàn thiện cuốn sổ này — quay lại sau nhé!
            </span>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-border/70 pt-8 sm:flex-row sm:gap-8">
            {[
              { icon: Camera, text: "Lưu lại từng khoảnh khắc bằng ảnh và chữ" },
              { icon: Clock3, text: "Lật lại theo dòng thời gian, như đọc lại nhật ký" },
              { icon: Share2, text: "Chia sẻ những chương bạn muốn, riêng tư phần còn lại" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex max-w-40 flex-col gap-2">
                <Icon size={17} style={{ color: accent }} strokeWidth={2} />
                <p className="text-xs leading-relaxed text-ink-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex justify-center">
          <OpenBookIllustration accent={accent} />
        </div>
      </div>
    </div>
  );
}

// Minh hoa "cuon sach mo" quy mo lon - cung ky thuat CSS-only (gradient/
// skew/shadow) da dung o BookArt (JourneyHero.tsx) va PinkBookVisual
// (HomeFeatureGrid.tsx), phong to va them chi tiet (2 trang, anh, bookmark)
// cho phu hop 1 trang chi tiet rieng thay vi 1 the nho trong luoi.
function OpenBookIllustration({ accent }: { accent: string }) {
  return (
    <div
      className="relative"
      style={{ width: 340, height: 260, filter: "drop-shadow(0 30px 30px rgba(0,0,0,.14))" }}
    >
      <div
        className="absolute rounded-[14px_4px_4px_14px]"
        style={{ inset: "14px 14px 0 4px", background: `linear-gradient(145deg, ${hexToRgba(accent, 0.85)}, ${accent})` }}
      />
      <div
        className="absolute flex"
        style={{ left: 22, top: 0, width: 296, height: 246 }}
      >
        <div
          className="h-full w-1/2 rounded-l-lg"
          style={{ background: "linear-gradient(#fffaf2,#f1e3d3)", transform: "skewY(1.5deg)" }}
        />
        <div
          className="h-full w-1/2 rounded-r-lg"
          style={{ background: "linear-gradient(#fffaf2,#f1e3d3)", transform: "skewY(-1.5deg)" }}
        />
        <div
          className="absolute top-0 bottom-0 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
          style={{ background: hexToRgba(accent, 0.35) }}
        />
        <div
          className="absolute"
          style={{ inset: "34px 26px 34px 26px", right: "56%" }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="my-2 h-1 rounded-full bg-[#e5d5c1]" />
          ))}
        </div>
        <div
          className="absolute rounded-sm border-4 border-white shadow-md"
          style={{
            width: 92,
            height: 102,
            right: 34,
            top: 60,
            transform: "rotate(3deg)",
            background: `linear-gradient(155deg, #ffe9d6 0 40%, ${hexToRgba(accent, 0.65)} 100%)`,
          }}
        />
      </div>
      <div
        className="absolute"
        style={{
          width: 20,
          height: 60,
          left: 172,
          bottom: -14,
          background: hexToRgba(accent, 0.85),
          clipPath: "polygon(0 0,100% 0,100% 100%,50% 80%,0 100%)",
        }}
      />
    </div>
  );
}
