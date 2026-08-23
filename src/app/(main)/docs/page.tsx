import Link from "next/link";
import { DOCS_COLLECTIONS } from "@/lib/docs/docs-collections";

// Trang /docs - luoi 4 cot, moi item la 1 "collection" tai lieu (hien tai chi
// co 1: Tai lieu kien thuc, xem docs-collections.ts) dan toi
// /docs/[collection] (sidebar danh muc + bai viet, xem [collection]/layout.tsx).
export default function DocsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="text-2xl font-extrabold text-ink sm:text-[32px]">Docs</h1>
      <p className="mt-2 max-w-xl text-sm text-ink-muted">
        Tài liệu và ghi chú kiến thức của Good Life.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DOCS_COLLECTIONS.map((collection) => (
          <Link
            key={collection.slug}
            href={`/docs/${collection.slug}`}
            className="group flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-md"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-transform duration-150 ease-out group-hover:scale-105">
              <collection.icon size={20} strokeWidth={2} />
            </span>
            <span className="text-sm font-bold text-ink">{collection.title}</span>
            <span className="text-xs text-ink-muted">{collection.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
