import Link from "next/link";
import { Plus } from "lucide-react";
import { GroupIconGlyph } from "@/components/workspaces/group-icons";
import type { ApiJourneyGroup } from "@/lib/api/types";

// Bang mau xoay theo index - PHONG DUNG 5 tong mau (nen gradient + ribbon)
// cua ban mau tree-career-book-ui goc (khong bia them mau moi), tao cam giac
// "ke sach" nhieu mau nhu tham chieu thay vi 1 mau don --primary.
const CHAPTER_PALETTE = [
  { bg: "linear-gradient(145deg,#f8f1dd,#e9f0db)", ribbon: "#68a96b" },
  { bg: "linear-gradient(145deg,#f2f0df,#e5ead7)", ribbon: "#4f9a70" },
  { bg: "linear-gradient(145deg,#eef0e9,#dfe9f0)", ribbon: "#3978c8" },
  { bg: "linear-gradient(145deg,#f1e9ee,#eadff0)", ribbon: "#8b62bd" },
  { bg: "linear-gradient(145deg,#f9ece1,#f6ddd4)", ribbon: "#c9574f" },
];

export function ChapterCard({
  group,
  index,
  username,
}: {
  group: ApiJourneyGroup;
  index: number;
  username: string;
}) {
  const { bg, ribbon } = CHAPTER_PALETTE[index % CHAPTER_PALETTE.length];

  return (
    <Link
      href={`/workspace/${username}/${group.workspaceId}`}
      className="relative flex w-56 min-h-49.5 shrink-0 snap-start flex-col overflow-hidden p-4"
      style={{
        background: bg,
        borderRadius: "7px 10px 8px 6px",
        borderLeft: "9px solid rgba(0,0,0,.08)",
        boxShadow: "0 9px 16px rgba(75,53,31,.12)",
      }}
    >
      <span
        className="absolute top-0 right-3 h-11 w-5.5"
        style={{
          background: ribbon,
          clipPath: "polygon(0 0,100% 0,100% 100%,50% 76%,0 100%)",
        }}
      />
      <small className="text-[10px]" style={{ color: "#826e5d" }}>
        Chương {index + 1}
      </small>
      <span className="mt-1 inline-block" style={{ color: ribbon }}>
        <GroupIconGlyph name={group.icon} size={26} strokeWidth={1.75} />
      </span>
      <h3
        className="mt-1.5 line-clamp-1 text-[19px]"
        style={{ fontFamily: "var(--font-serif-book)", color: "#2b2117" }}
      >
        {group.name}
      </h3>
      {group.description && (
        <p
          className="mt-1 line-clamp-2 text-[10px] leading-relaxed"
          style={{ color: "#786b60" }}
        >
          {group.description}
        </p>
      )}
      <footer
        className="mt-auto flex items-center justify-between pt-3 text-[10px]"
        style={{ color: "#85776a" }}
      >
        <span>{group.postCount} bài viết</span>
        <span>{group.progressPercent}%</span>
      </footer>
      <div
        className="mt-1.5 h-1.25 overflow-hidden rounded-full"
        style={{ background: "rgba(120,100,76,.13)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${group.progressPercent}%`, background: "#69a76f" }}
        />
      </div>
    </Link>
  );
}

// The trong-cuoi-hang: chua co nhom nao (0 nhom) hoac "them chuong moi" (cuoi
// hang khi da co >=1 nhom) - cung 1 khuon, khac nhau qua props text/href.
export function AddChapterCard({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-49.5 w-56 shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-[9px] border border-dashed text-center transition-colors duration-150 ease-out"
      style={{ borderColor: "#d8c7b4", background: "rgba(255,253,249,.66)" }}
    >
      <span
        className="flex size-11 items-center justify-center rounded-full border bg-white"
        style={{ borderColor: "#e8daca" }}
      >
        <Plus size={22} strokeWidth={2} style={{ color: "#806f60" }} />
      </span>
      <b className="text-[13px]" style={{ color: "#806f60" }}>
        {title}
      </b>
      <small
        className="px-4 text-[10px] leading-relaxed"
        style={{ color: "#9c8f80" }}
      >
        {subtitle}
      </small>
    </Link>
  );
}
