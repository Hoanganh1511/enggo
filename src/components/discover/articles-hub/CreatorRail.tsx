"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Check, Plus } from "lucide-react";
import { followUserAction } from "@/actions/discover/follow-user";
import { useIsMobileViewport } from "@/lib/use-is-mobile-viewport";
import { cn } from "@/lib/utils";
import { CreatorPreviewModal } from "./CreatorPreviewModal";

export type CreatorSummary = {
  username: string;
  name: string;
  avatarUrl: string;
  // Tu 2026-09-12 - de biet an/hien dau "+" theo doi nhanh o goc avatar
  // (khong hien voi nguoi da theo doi roi). Optional vi 1 so noi goi component
  // nay chua truyen (mac dinh coi la CHUA theo doi, an toan hon hien nham).
  isFollowing?: boolean;
};

// [2026-09-15] Doi tu ScrollableRow (hang cuon ngang, avatar+ten don thuan)
// sang the CARD gon (flex-wrap, khong cuon) - yeu cau nguoi dung: "nội dung
// của tác giả nổi bật... đơn điệu nhưng chiếm nhiều diện tích, tối ưu diện
// tích, elements trong nó lại". Voi chi 1-2 tac gia (truong hop pho bien),
// ScrollableRow cu de lai 1 khoang trong ngang RAT LON (hang du rong het cot
// noi dung, avatar/ten chi chiem 1 goc) - flex-wrap khien the tu CO LAI vua
// du noi dung, khong con khoang chet. Moi the gio la 1 KHOI thong tin day du
// hon (avatar + ten + @username + nut Theo dõi RO CHU thay vi dau "+" nho
// chong len avatar) thay vi chi 2 dong text don gian, bot "don dieu" hon.
export function CreatorRail({ creators }: { creators: CreatorSummary[] }) {
  const [previewUsername, setPreviewUsername] = useState<string | null>(null);
  const isMobile = useIsMobileViewport();

  if (creators.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {creators.map((creator) => (
          <CreatorCard
            key={creator.username}
            creator={creator}
            onOpenPreview={() => setPreviewUsername(creator.username)}
            isMobile={isMobile}
          />
        ))}
      </div>

      <CreatorPreviewModal
        username={previewUsername}
        onClose={() => setPreviewUsername(null)}
      />
    </>
  );
}

function CreatorCard({
  creator,
  onOpenPreview,
  isMobile,
}: {
  creator: CreatorSummary;
  onOpenPreview: () => void;
  isMobile: boolean;
}) {
  const { data: session } = useSession();
  const isSelf = session?.username === creator.username;
  const [following, setFollowing] = useState(creator.isFollowing ?? false);
  const [pending, setPending] = useState(false);

  async function handleQuickFollow(e: React.MouseEvent) {
    // Chan NGAY luc bubble - tranh click nut Theo doi bi hieu nham la click
    // ca the (mo modal/dieu huong cung luc).
    e.preventDefault();
    e.stopPropagation();
    if (following || pending) return;
    setPending(true);
    setFollowing(true); // optimistic
    try {
      await followUserAction(creator.username);
    } catch {
      setFollowing(false); // rollback neu API loi
    } finally {
      setPending(false);
    }
  }

  const content = (
    <>
      <Image
        src={creator.avatarUrl}
        alt={creator.name}
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="font-content truncate text-[13px] font-semibold text-[var(--foreground)]">
          {creator.name}
        </p>
        <p className="truncate text-[11px] text-[var(--muted)]">@{creator.username}</p>
      </div>
      {!isSelf &&
        (following ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-600">
            <Check size={11} strokeWidth={2.5} aria-hidden="true" />
            Đang theo dõi
          </span>
        ) : (
          <button
            type="button"
            onClick={handleQuickFollow}
            disabled={pending}
            aria-label={`Theo dõi ${creator.name}`}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--foreground)] transition-colors duration-150 ease-out hover:bg-[var(--hover-bg)] disabled:cursor-wait"
          >
            <Plus size={11} strokeWidth={2} aria-hidden="true" />
            Theo dõi
          </button>
        ))}
    </>
  );

  const cardClass =
    "flex w-64 max-w-full cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 transition-colors duration-150 ease-out hover:border-[var(--border-strong)]";

  // Mobile: mo preview modal (khong dieu huong ngay) - desktop: giu nguyen
  // hanh vi cu, di thang toi trang ca nhan qua <Link> that (khong phai
  // router.push trong onClick, de van huong duoc middle-click/mo tab moi).
  if (isMobile) {
    return (
      <button type="button" onClick={onOpenPreview} className={cn(cardClass, "text-left")}>
        {content}
      </button>
    );
  }

  return (
    <Link href={`/u/${creator.username}`} className={cardClass}>
      {content}
    </Link>
  );
}
