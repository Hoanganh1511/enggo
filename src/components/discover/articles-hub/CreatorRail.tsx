import Image from "next/image";
import Link from "next/link";
import { ScrollableRow } from "./ScrollableRow";

export type CreatorSummary = { username: string; name: string; avatarUrl: string };

// Server Component thuan - cuon ngang qua ScrollableRow (nut prev/next, xem
// component do), khong can "use client" o CHINH file nay. Danh sach tac gia
// THAT (rut tu cac bai viet da fetch, khong phai "creators ban dang theo doi"
// gia dinh nhu source goc - app chua co man hinh "following feed" rieng de
// lay dung danh sach do).
export function CreatorRail({ creators }: { creators: CreatorSummary[] }) {
  if (creators.length === 0) return null;

  return (
    <ScrollableRow gapClassName="gap-5">
      {creators.map((creator) => (
        <Link
          key={creator.username}
          href={`/u/${creator.username}`}
          className="flex min-w-[64px] flex-col items-center gap-2"
        >
          <Image
            src={creator.avatarUrl}
            alt={creator.name}
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
          />
          <span className="font-content max-w-[76px] truncate text-[11px] text-[var(--foreground-muted)]">
            {creator.name}
          </span>
        </Link>
      ))}
    </ScrollableRow>
  );
}
