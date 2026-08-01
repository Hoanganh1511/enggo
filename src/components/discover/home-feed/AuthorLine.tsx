import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import type { Author } from "@/content/home-feed-mock";
import { formatRelativeTime } from "@/lib/career-tree/format-time";

// Dong tac gia + thoi gian dung chung cho moi card editorial - gon hon
// header day du cua PostCard.tsx (khong co menu 3 cham, khong badge kind)
// vi cac card nay da co icon/kind rieng o ContentTile. KHONG dung <Link>
// rieng cho ten tac gia (chi la <span>) - component nay CHI duoc dung ben
// trong NoteCard.tsx, ma NoteCard da boc CA the trong 1 <Link> toi dung
// trang tac gia roi; long them <a> trong <a> la HTML khong hop le, trinh
// duyet se tu dong "sua" cau truc DOM (dong som the <a> ngoai), khien phan
// sau AuthorLine (tieu de, so lieu) roi ra ngoai vung bam duoc - day chinh
// la bug "bam vao khong thay gi" da gap.
export function AuthorLine({
  author,
  createdAt,
  avatarSize = 20,
}: {
  author: Author;
  createdAt: string;
  avatarSize?: number;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 py-2 text-xs text-ink-muted">
      <Image
        src={author.avatarUrl}
        alt={author.name}
        width={avatarSize}
        height={avatarSize}
        className="shrink-0 rounded-full object-cover"
        style={{ width: avatarSize, height: avatarSize }}
      />
      <span className="truncate font-medium text-ink">{author.name}</span>
      {author.verified && (
        <BadgeCheck
          size={12}
          strokeWidth={2}
          className="shrink-0 text-primary"
        />
      )}
      <span className="text-ink-faint">·</span>
      <span className="shrink-0 text-ink-faint">
        {formatRelativeTime(createdAt)}
      </span>
    </div>
  );
}
