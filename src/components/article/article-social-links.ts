import { Rss, X } from "lucide-react";
import type { UserProfileApiShape } from "@/lib/api/users";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";

// Danh sach nen tang mang xa hoi hien trong card tac gia - dung CHUNG giua
// ArticleStickyAuthorBar.tsx (cot trai, dinh) va ArticleAuthorCard.tsx (card
// day du sau than bai) de tranh khai bao lap. Icon mo + co tooltip khi tac
// gia CHUA dien (url null) - xem ghi chu goc o ArticleStickyAuthorBar.tsx.
export const SOCIAL_LINKS = [
  { key: "twitterUrl", label: "X (Twitter)", icon: X },
  { key: "facebookUrl", label: "Facebook", icon: FacebookIcon },
  { key: "instagramUrl", label: "Instagram", icon: InstagramIcon },
  { key: "youtubeUrl", label: "YouTube", icon: YoutubeIcon },
  { key: "linkedinUrl", label: "LinkedIn", icon: LinkedinIcon },
  { key: "rssUrl", label: "RSS", icon: Rss },
] as const satisfies readonly {
  key: keyof UserProfileApiShape;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
}[];
