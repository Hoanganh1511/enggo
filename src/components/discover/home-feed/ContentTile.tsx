import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { hexToRgba } from "@/lib/utils";
import { SHIMMER_BLUR_DATA_URL } from "@/lib/discover/image-placeholder";

// Tile hinh dai dien dung chung cho Featured/Resource/Project/Trending Topic.
// Resource/project/topic KHONG co field anh that trong data model (xem
// content/home-feed-mock.ts, knowledge-worlds.ts) nen fallback ve gradient
// nhuom theo accent + icon lon o giua thay vi bia anh gia. Post THAT co anh
// (image/gallery/video) thi uu tien hien qua prop imageUrl.
export function ContentTile({
  icon: Icon,
  accent,
  imageUrl,
  alt = "",
  className = "",
  iconSize = 32,
  sizes = "224px",
  priority = false,
}: {
  icon: LucideIcon;
  accent: string;
  imageUrl?: string;
  alt?: string;
  className?: string;
  iconSize?: number;
  // Khop kich thuoc HIEN THI THUC TE cua caller, khong de mac dinh chung
  // chung - card carousel (NoteCard, w-56 ~224px) khac luoi tu gian
  // (SingleTypeFeedList) khac trending topic, moi noi truyen sizes rieng.
  sizes?: string;
  // Chi bat cho vai the o vung nhin dau tien (vd 4-6 card dau section
  // "Noi bat hom nay") - day la ung vien LCP cua trang, can tai ngay khong
  // qua co che lazy-load IntersectionObserver mac dinh cua next/image.
  priority?: boolean;
}) {
  if (imageUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg bg-surface-muted ${className}`}
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={SHIMMER_BLUR_DATA_URL}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg ${className}`}
      style={{
        background: `linear-gradient(135deg, ${hexToRgba(accent, 0.3)}, ${hexToRgba(accent, 0.1)})`,
      }}
    >
      <Icon size={iconSize} strokeWidth={1.5} style={{ color: accent }} />
    </div>
  );
}
