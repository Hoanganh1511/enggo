import {
  AtSign,
  Award,
  BadgeHelp,
  BookOpen,
  Box,
  Code2,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  GitFork,
  Globe,
  Heart,
  Layers,
  Link2,
  MessageCircle,
  Package,
  Radio,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Star,
  Terminal,
  TrendingUp,
  Trophy,
  Users,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Danh sach icon curated cho module Series (stats bar / external links) -
// dung chung 1 pattern voi GroupIconPicker.tsx (workspaces/group-icons.tsx)
// nhung DANH SACH RIENG, thien ve icon thong ke/lien ket ngoai (star, tai
// ve, mang xa hoi...) thay vi icon chu de hoc tap.
export const SERIES_ICON_OPTIONS: { name: string; icon: LucideIcon }[] = [
  { name: "Star", icon: Star },
  { name: "Download", icon: Download },
  { name: "Eye", icon: Eye },
  { name: "Users", icon: Users },
  { name: "Heart", icon: Heart },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "Trophy", icon: Trophy },
  { name: "Award", icon: Award },
  { name: "Sparkles", icon: Sparkles },
  { name: "Zap", icon: Zap },
  { name: "Rocket", icon: Rocket },
  { name: "Shield", icon: Shield },
  { name: "BookOpen", icon: BookOpen },
  { name: "FileText", icon: FileText },
  { name: "Layers", icon: Layers },
  { name: "Box", icon: Box },
  { name: "Package", icon: Package },
  { name: "Code2", icon: Code2 },
  { name: "Terminal", icon: Terminal },
  { name: "Server", icon: Server },
  { name: "Database", icon: Database },
  { name: "Globe", icon: Globe },
  { name: "Link2", icon: Link2 },
  { name: "ExternalLink", icon: ExternalLink },
  { name: "MessageCircle", icon: MessageCircle },
  { name: "Video", icon: Video },
  { name: "GitFork", icon: GitFork },
  { name: "AtSign", icon: AtSign },
  { name: "Radio", icon: Radio },
];

const SERIES_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  SERIES_ICON_OPTIONS.map((o) => [o.name, o.icon]),
);

// Render icon Series theo TEN da luu - fallback ve BadgeHelp khi chua chon/
// ten khong con hop le, dung chung o SeriesStatsBar.tsx (trang cong khai) va
// preview trong SeriesForm.tsx (phai khop 100% - cung 1 ham resolve).
export function SeriesIconGlyph({
  name,
  size = 15,
  strokeWidth = 1.9,
  className,
}: {
  name?: string | null;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Icon = (name && SERIES_ICON_MAP[name]) || BadgeHelp;
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}
