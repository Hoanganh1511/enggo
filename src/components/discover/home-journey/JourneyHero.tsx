import Link from "next/link";
import { ArrowRight, BookOpen, PenLine } from "lucide-react";
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
    <section className="rounded-2xl border border-border bg-surface p-8">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold tracking-wide text-ink-faint">
            TRANG CHỦ · HÀNH TRÌNH CỦA BẠN
          </p>
          <h1 className="mt-2 text-3xl leading-tight font-bold text-ink">
            Kiến thức của bạn,
            <br />
            từng chương một
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Mỗi nhóm kiến thức là một chương trong hành trình học tập của
            bạn. Viết tiếp, tích luỹ và theo dõi tiến độ của chính mình.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={writeHref}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
            >
              <PenLine size={15} strokeWidth={2} />
              Viết chương mới
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
            <Link
              href={`/workspace/${username}`}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-out hover:text-ink"
            >
              <BookOpen size={15} strokeWidth={2} />
              Xem hành trình
            </Link>
          </div>
        </div>

        {currentGroup && (
          <div className="w-full max-w-[300px] shrink-0 rounded-[13px] border border-border bg-surface-muted p-5">
            <p className="text-[10px] font-semibold tracking-wide text-ink-faint">
              CHƯƠNG HIỆN TẠI
            </p>
            <h3 className="mt-1 line-clamp-1 text-lg font-semibold text-ink">
              {currentGroup.name}
            </h3>
            {currentGroup.description && (
              <p className="mt-1 line-clamp-2 text-xs text-ink-faint">
                {currentGroup.description}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${currentGroup.progressPercent}%` }}
                />
              </div>
              <b className="text-xs text-ink">
                {currentGroup.progressPercent}%
              </b>
            </div>
          </div>
        )}
      </div>

      <blockquote className="mt-6 border-t border-border-subtle pt-4">
        <p className="text-sm italic text-ink-muted">“{quote}”</p>
        <cite className="mt-1 block text-[11px] text-ink-faint not-italic">
          — {quoteAuthor}
        </cite>
      </blockquote>
    </section>
  );
}
