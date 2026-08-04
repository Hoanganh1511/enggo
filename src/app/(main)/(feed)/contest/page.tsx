import { listContests, type ContestStatus } from "@/lib/api/contests";
import { ContestCard } from "@/components/discover/contest/ContestCard";
import { FeaturedContestBanner } from "@/components/discover/contest/FeaturedContestBanner";

// Chia section theo trang thai, dung thu tu enum ContestStatus o backend
// (OPEN -> JUDGING -> CLOSED) - giong cach note.com tach khu "審査中".
const STATUS_SECTIONS: { status: ContestStatus; title: string }[] = [
  { status: "OPEN", title: "Đang nhận bài" },
  { status: "JUDGING", title: "Đang chấm" },
  { status: "CLOSED", title: "Đã kết thúc" },
];

export default async function ContestListPage() {
  const contests = await listContests().catch(() => []);

  // Cuoc thi "noi bat" cho banner dau trang - CONTEST (co giai, khac TOPIC
  // chu de thuong truc) dang OPEN va sap het han nhat (thuc su can nguoi
  // tham gia gap nhat), khong phai gia tri "featured" rieng tu backend.
  const featuredContest = contests
    .filter((c) => c.kind === "CONTEST" && c.status === "OPEN" && c.deadline)
    .sort(
      (a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    )[0];

  return (
    // Khong tu them px/py: shell cha (HomeLayoutShell qua (feed)/layout.tsx)
    // da co san px-4 pt-4 cho vung noi dung ben phai sidebar.
    <div className="flex flex-col gap-10 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl leading-tight font-bold tracking-tight text-ink">
          Chủ đề & Cuộc thi
        </h1>
        <p className="text-sm text-ink-muted">
          Viết theo một hashtag để bài của bạn xuất hiện cùng mọi người trong
          cùng chủ đề — có cả cuộc thi kèm giải thưởng.
        </p>
      </header>

      {featuredContest && <FeaturedContestBanner contest={featuredContest} />}

      {contests.length === 0 && (
        <p className="py-12 text-center text-sm text-ink-faint">
          Chưa có chủ đề nào đang mở.
        </p>
      )}

      {/* id lam diem neo cho CTA "Xem tat ca cuoc thi" trong
          FeaturedContestBanner - trang nay da la view day du roi nen chi can
          cuon xuong, khong dieu huong sang trang khac. */}
      <div id="contest-sections" className="flex flex-col gap-10">
        {STATUS_SECTIONS.map(({ status, title }) => {
          const items = contests.filter((c) => c.status === status);
          if (items.length === 0) return null;
          return (
            <section key={status}>
              <h2 className="mb-4 text-xl font-bold tracking-tight text-ink">
                {title}
              </h2>
              {/* 3 cot o man hinh rong, tu rut cot khi hep - dung auto-fill
                  de the luon lap day chieu ngang thay vi chua khoang trong
                  cuoi hang (cung ky thuat nhu luoi bai viet o
                  SingleTypeFeedList). */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                {items.map((contest) => (
                  <ContestCard key={contest.id} contest={contest} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
