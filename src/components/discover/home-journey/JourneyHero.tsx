import Link from "next/link";
import { ArrowRight, BookOpen, PenLine, Sparkles } from "lucide-react";
import type { ApiJourney } from "@/lib/api/types";

// Trich dan trang tri thuan tuy (khong dai dien so lieu nguoi dung) - xoay
// theo ngay-trong-nam (on dinh trong 1 ngay, khong random moi lan render),
// KHONG goi API.
const QUOTES: [string, string][] = [
  ["Hôm qua là lịch sử, ngày mai là bí ẩn, nhưng hôm nay là món quà.", "Master Oogway"],
  ["Sự phát triển bắt đầu từ vùng an toàn của bạn.", "Khuyết danh"],
  ["Học, rồi lại học — không ai giỏi ngay từ đầu.", "Khuyết danh"],
  ["Một trang mỗi ngày, một năm sẽ có một cuốn sách.", "Khuyết danh"],
  ["Kỷ luật là cầu nối giữa mục tiêu và thành tựu.", "Jim Rohn"],
  ["Đường dài nhất bắt đầu bằng một bước chân.", "Lão Tử"],
  ["Không có gì là lãng phí nếu bạn học được từ nó.", "Khuyết danh"],
  ["Kiến thức càng chia sẻ càng lớn.", "Khuyết danh"],
];

function dayOfYear() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

// Bang mau/font rieng cho GOC widget "hanh trinh" (tone dat kem + serif
// Georgia) - THEO YEU CAU MOI NHAT cua nguoi dung ("Lấy đúng UI như này"),
// PHU DINH lua chon truoc do ("giu token app"). Chi khoanh vung trong file
// nay + ChapterCard/ChapterShelf/JourneyAchievements (cung 1 widget), KHONG
// dung sang phan con lai cua /home (EditorialFeed... van giu token app binh
// thuong) - tranh lam 2 tong mau/font lan nhau trong 1 lan quet mat.
const SERIF = { fontFamily: "Georgia, serif" } as const;

export function JourneyHero({
  journey,
  username,
}: {
  journey: ApiJourney;
  username: string;
}) {
  const currentGroup = journey.groups.find(
    (g) => g.id === journey.currentGroupId,
  );
  const [quote, quoteAuthor] = QUOTES[dayOfYear() % QUOTES.length];

  // "Viet chuong moi" nhay thang vao workspace cua nhom dang hoc (that su
  // huu ich), khong dung lai logic cuon+focus post-composer cua
  // HomeLayoutShell.tsx - component do hien khong con <PostComposer/> nao
  // duoc mount tren /home (id "post-composer" khong ton tai trong DOM),
  // dan lai theo se la 1 nut chet.
  const writeHref = currentGroup
    ? `/workspace/${username}/${currentGroup.workspaceId}`
    : `/workspace/${username}`;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border p-9"
      style={{
        borderColor: "#eadcc8",
        background: "linear-gradient(90deg,#fffaf1,#fff9ed 32%,#f8e9c9)",
        boxShadow: "0 10px 28px rgba(101,75,43,.07)",
      }}
    >
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-8">
        <div className="max-w-md">
          <p
            className="text-[10px] font-bold tracking-[0.13em]"
            style={{ color: "#9c806a" }}
          >
            TRANG CHỦ · HÀNH TRÌNH CỦA BẠN
          </p>
          <h1
            className="mt-2.5 text-[40px] leading-[1.05] tracking-tight"
            style={{ ...SERIF, color: "#2b2117" }}
          >
            Kiến thức của bạn,
            <br />
            từng chương một
          </h1>
          <p
            className="mt-4 text-[14px] leading-relaxed"
            style={{ color: "#78685a" }}
          >
            Mỗi nhóm kiến thức là một chương trong hành trình học tập của
            bạn. Viết tiếp, tích luỹ và theo dõi tiến độ của chính mình.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href={writeHref}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
              style={{
                background: "#d95b16",
                boxShadow: "0 8px 18px rgba(217,91,22,.25)",
              }}
            >
              <PenLine size={15} strokeWidth={2} />
              Viết chương mới
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
            <Link
              href={`/workspace/${username}`}
              className="flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-[13px] font-semibold transition-colors duration-150 ease-out"
              style={{
                borderColor: "#e5d9ca",
                background: "rgba(255,255,255,.78)",
                color: "#685a4e",
              }}
            >
              <BookOpen size={15} strokeWidth={2} />
              Xem hành trình
            </Link>
          </div>
        </div>

        <BookArt />

        {currentGroup && (
          <div
            className="relative z-10 w-full max-w-[300px] shrink-0 rounded-2xl border p-5"
            style={{
              borderColor: "rgba(190,151,105,.2)",
              background: "rgba(255,253,246,.9)",
              boxShadow: "0 14px 30px rgba(95,69,35,.1)",
            }}
          >
            <p
              className="text-[10px] font-bold tracking-[0.13em]"
              style={{ color: "#9c806a" }}
            >
              CHƯƠNG HIỆN TẠI
            </p>
            <h3
              className="mt-1 line-clamp-1 text-[22px]"
              style={{ ...SERIF, color: "#2b2117" }}
            >
              {currentGroup.name}
            </h3>
            {currentGroup.description && (
              <p
                className="mt-1 line-clamp-2 text-[13px]"
                style={{ color: "#75685e" }}
              >
                {currentGroup.description}
              </p>
            )}
            <div className="mt-3.5 flex items-center gap-2">
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full"
                style={{ background: "#efe4d4" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${currentGroup.progressPercent}%`,
                    background: "#df9b4b",
                  }}
                />
              </div>
              <b className="text-[11px]" style={{ color: "#2b2117" }}>
                {currentGroup.progressPercent}%
              </b>
            </div>
            <p
              className="mt-3.5 text-[12px] leading-relaxed italic"
              style={{ ...SERIF, color: "#766558" }}
            >
              “{quote}”
            </p>
            <p className="mt-1 text-[10px]" style={{ color: "#9c806a" }}>
              — {quoteAuthor}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Minh hoa "cuon sach mo" thuan CSS (khong dung anh/SVG rieng) - phong theo
// dung bo cuc .art/.orb/.openBook/.inkwell cua ban mau, thu gon lai vi vung
// hien thi thuc te o day hep hon (hero 2 cot, khong phai full-bleed nhu ban
// mau). An tren man hinh hep (lg:block) - thuan tuy trang tri, khong anh
// huong thao tac.
function BookArt() {
  return (
    <div className="relative hidden h-45 w-65 shrink-0 lg:block">
      <div
        className="absolute top-2 right-8 h-35 w-50 rounded-full opacity-75"
        style={{
          background:
            "radial-gradient(circle,#fff4c8,#f6d993 42%,transparent 72%)",
        }}
      />
      <div
        className="absolute bottom-6 left-3 flex h-27 w-50"
        style={{
          filter: "drop-shadow(0 16px 11px rgba(86,57,31,.22))",
          transform: "perspective(500px) rotateX(7deg)",
        }}
      >
        <div
          className="h-full w-1/2 rounded-l-lg"
          style={{
            background: "linear-gradient(#fff9e9,#e9d5ab)",
            border: "1px solid #d8bd8d",
            transform: "skewY(3.5deg)",
          }}
        />
        <div
          className="h-full w-1/2 rounded-r-lg"
          style={{
            background: "linear-gradient(#fff9e9,#e9d5ab)",
            border: "1px solid #d8bd8d",
            transform: "skewY(-3.5deg)",
          }}
        />
      </div>
      <Sparkles
        size={20}
        strokeWidth={1.75}
        className="absolute top-4 right-2"
        style={{ color: "#bc8c44" }}
      />
    </div>
  );
}
