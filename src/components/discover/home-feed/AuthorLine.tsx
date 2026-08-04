import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { Author } from "@/content/home-feed-mock";
import { formatRelativeTime } from "@/lib/career-tree/format-time";

// Dong tac gia + thoi gian dung chung cho moi card editorial - gon hon
// header day du cua PostCard.tsx (khong co menu 3 cham, khong badge kind)
// vi cac card nay da co icon/kind rieng o ContentTile. Tu boc <Link> RIENG
// toi trang tac gia - truoc day KHONG lam vay vi NoteCard.tsx boc CA the
// (ke ca dong nay) trong 1 <Link> toi trang tac gia, long <a> trong <a> se
// bi trinh duyet tu "sua" DOM sai cach. Gio NoteCard chi con boc PHAN NOI
// DUNG (anh/tieu de) trong Link rieng toi bai viet, AuthorLine nam NGOAI
// Link do (xem NoteCard.tsx) nen tu boc Link o day la an toan.
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
    <Link
      href={`/u/${author.username}`}
      className="flex min-w-0 items-center gap-1.5 py-2 text-xs text-ink-muted"
    >
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
    </Link>
  );
}
