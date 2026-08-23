"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type DocsSidebarGroup = {
  category: string;
  articles: { slug: string; title: string }[];
};

// Sidebar trai cho 1 collection docs (vd /docs/engineering-log) - bai viet
// nhom theo danh muc (nhan danh muc IN HOA, khong thut le), cac bai viet BEN
// DUOI thut vao 1 buoc + chu mo hon (text-ink-faint), dung 1 highlight nhe
// (nen + chu primary) cho bai dang xem - dung yeu cau nguoi dung mo ta.
export function DocsSidebar({
  collectionSlug,
  groups,
}: {
  collectionSlug: string;
  groups: DocsSidebarGroup[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.category}>
          <p className="px-2.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            {group.category}
          </p>
          <div className="mt-1.5 flex flex-col gap-0.5">
            {group.articles.map((article) => {
              const href = `/docs/${collectionSlug}/${article.slug}`;
              const active = pathname === href;
              return (
                <Link
                  key={article.slug}
                  href={href}
                  className={cn(
                    "truncate rounded-md py-1.5 pr-2 pl-4.5 text-[13px] transition-colors duration-150 ease-out",
                    active
                      ? "bg-primary-soft font-medium text-primary"
                      : "text-ink-faint hover:bg-hover-bg hover:text-ink-muted",
                  )}
                >
                  {article.title}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
