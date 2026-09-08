import { Bookmark, Heart } from "lucide-react";
import { NEWEST_TOPICS } from "./newest-topics-mock";
import { SectionTitle } from "./SectionTitle";
import { ScrollableRow } from "./ScrollableRow";
import { NewestCardMenu } from "./NewestCardMenu";

// Server Component thuan - 10 hang theo chu de (kieu Netflix), moi hang cuon
// ngang ~20 the. DU LIEU TAM (xem newest-topics-mock.ts - "Tạm thời fix data"
// theo yeu cau nguoi dung, backend chua co du bai that cho tung linh vuc de
// xep 10 hang day du). Card rong CO DINH 212px (w-53) - ban dau 192px, tang
// them 20px theo yeu cau.
export function NewestSection() {
  return (
    <div>
      {NEWEST_TOPICS.map((topic) => (
        <div key={topic.name}>
          <SectionTitle title={topic.name} />
          <ScrollableRow gapClassName="gap-4">
            {topic.posts.map((post) => (
              <div
                key={post.id}
                className="group w-53 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-hover)]"
              >
                <div className="relative aspect-[1.8] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-[var(--foreground-muted)] shadow-sm">
                    {post.time}
                  </span>
                </div>
                <div className="font-content p-4">
                  <h3 className="line-clamp-2 text-[14px] leading-5 font-semibold">{post.title}</h3>
                  {/* Hang 1: tac gia. Hang 2: like + save (trai) va menu 3
                      cham (phai) - xem NewestCardMenu.tsx. */}
                  <p className="mt-3 truncate text-[11px] text-[var(--muted)]">{post.author}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-[var(--muted)]">
                      <span className="flex items-center gap-1">
                        <Heart size={13} aria-hidden="true" />
                        {post.likes}
                      </span>
                      {/* Chua co bang Save that cho bai viet tam (mock) -
                          icon hien thi, KHONG lam nut bam luu duoc (cung tinh
                          than da chot voi bookmark o HomeArticleCard/
                          RecommendedGrid). */}
                      <span aria-hidden="true">
                        <Bookmark size={13} />
                      </span>
                    </div>
                    <NewestCardMenu />
                  </div>
                </div>
              </div>
            ))}
          </ScrollableRow>
        </div>
      ))}
    </div>
  );
}
