"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { followUserAction } from "@/actions/discover/follow-user";
import { useIsMobileViewport } from "@/lib/use-is-mobile-viewport";
import { cn } from "@/lib/utils";
import { ScrollableRow } from "./ScrollableRow";
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

// "use client" - can 2 logic rieng biet KHONG duoc an vao nhau (yeu cau
// nguoi dung): (1) bam avatar/ten - desktop di thang toi trang ca nhan
// (giu nguyen hanh vi cu), mobile mo CreatorPreviewModal.tsx xem truoc; (2)
// bam dau "+" goc duoi-phai avatar - theo doi nhanh NGAY TAI DAY, khong mo
// modal, khong dieu huong. 2 nhanh nay dung 2 onClick RIENG + e.stopPropagation()
// o nut "+" (no nam LONG trong cung 1 the voi avatar) de bam "+" khong lam
// avatar "an theo" mo modal/dieu huong cung luc.
export function CreatorRail({ creators }: { creators: CreatorSummary[] }) {
  const [previewUsername, setPreviewUsername] = useState<string | null>(null);
  const isMobile = useIsMobileViewport();

  if (creators.length === 0) return null;

  return (
    <>
      <ScrollableRow gapClassName="gap-5">
        {creators.map((creator) => (
          <CreatorTile
            key={creator.username}
            creator={creator}
            onOpenPreview={() => setPreviewUsername(creator.username)}
            isMobile={isMobile}
          />
        ))}
      </ScrollableRow>

      <CreatorPreviewModal
        username={previewUsername}
        onClose={() => setPreviewUsername(null)}
      />
    </>
  );
}

function CreatorTile({
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
    // Chan NGAY luc bubble - tranh click "+" bi hieu nham la click avatar
    // (mo modal/dieu huong cung luc), xem comment o CreatorRail.
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

  const avatar = (
    <div className="relative">
      {/* Dang theo doi (khong phai chinh minh) - vong tron nhap nhay CHAM
          (2.4s, khac han "animate-ping" mac dinh cua Tailwind - qua nhanh/
          gat mat khi 10+ avatar cung nhap nhay lien tuc trong 1 hang cuon)
          bao "ban dang theo doi nguoi nay", KHONG can doc chu. */}
      {following && !isSelf && (
        <span
          aria-hidden="true"
          className="animate-creator-following-pulse absolute inset-0 rounded-full bg-emerald-500/60"
        />
      )}
      <Image
        src={creator.avatarUrl}
        alt={creator.name}
        width={48}
        height={48}
        className={cn(
          "relative size-12 shrink-0 rounded-full object-cover shadow-sm",
          following && !isSelf ? "border-2 border-emerald-500" : "border-2 border-white",
        )}
      />
      {/* Dau "+" theo doi nhanh - AN HAN neu la chinh minh (khong the tu
          theo doi minh) HOAC da theo doi roi (thay bang vong nhap nhay o
          tren). */}
      {!following && !isSelf && (
        <button
          type="button"
          onClick={handleQuickFollow}
          disabled={pending}
          aria-label={`Theo dõi nhanh ${creator.name}`}
          title="Theo dõi"
          className="absolute -right-0.5 -bottom-0.5 flex size-5 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm transition-transform duration-150 ease-out hover:scale-110 disabled:cursor-wait"
        >
          <Plus size={11} strokeWidth={2} />
        </button>
      )}
    </div>
  );

  const content = (
    <>
      {avatar}
      <span className="font-content max-w-[76px] truncate text-[11px] text-[var(--foreground-muted)]">
        {creator.name}
      </span>
    </>
  );

  // Mobile: mo preview modal (khong dieu huong ngay) - desktop: giu nguyen
  // hanh vi cu, di thang toi trang ca nhan qua <Link> that (khong phai
  // router.push trong onClick, de van huong duoc middle-click/mo tab moi).
  if (isMobile) {
    return (
      <button
        type="button"
        onClick={onOpenPreview}
        className={cn("flex min-w-[64px] cursor-pointer flex-col items-center gap-2")}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={`/u/${creator.username}`}
      className="flex min-w-[64px] flex-col items-center gap-2"
    >
      {content}
    </Link>
  );
}
