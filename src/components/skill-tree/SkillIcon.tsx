import type { LucideIcon } from "lucide-react";
import { getTechIcon } from "@/lib/career-tree/tech-icons";

type SkillIconProps = {
  title: string;
  fallback: LucideIcon;
  size: number;
};

// Tu nhan dien logo cong nghe theo TEN skill (dung lai getTechIcon/simple-icons
// da co san cho TechTag/GrowthCard) - "Node.js" tu ra dung logo Node.js, khong
// can nguoi dung tu chon icon (Node hien chua co field luu icon rieng). Mau
// logo LUON theo currentColor (= mau status cua HexBadge cha) thay vi mau
// brand goc, de khong pha vo quy uoc "mau = trang thai" cua ca he thong.
const SkillIcon = ({ title, fallback: Fallback, size }: SkillIconProps) => {
  const tech = getTechIcon(title);
  if (tech) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        role="img"
        aria-label={tech.title}
      >
        <path d={tech.path} />
      </svg>
    );
  }
  return <Fallback size={size} strokeWidth={2} />;
};

export default SkillIcon;
