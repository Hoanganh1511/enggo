import type { LucideIcon } from "lucide-react";
import {
  MessageSquare,
  BookOpen,
  HelpCircle,
  FolderGit2,
  Trophy,
  BarChart3,
  TrendingUp,
  GitBranch,
} from "lucide-react";

import type {
  SeriesDifficulty,
  SeriesTaskTargetKind,
} from "@/content/series-mock";

// Map tap trung icon/nhan theo dung quy uoc POST_KIND_META (post-kind-meta.ts)
// - KHONG sua/mo rong file do vi tap kind cua viec trong series khac han: no
// gom ca "node" (Learning Node ben Skill Tree), von khong phai 1 Post["kind"].
export const SERIES_TASK_ICON: Record<SeriesTaskTargetKind, LucideIcon> = {
  post: MessageSquare,
  resource: BookOpen,
  question: HelpCircle,
  project: FolderGit2,
  achievement: Trophy,
  vote: BarChart3,
  progress: TrendingUp,
  node: GitBranch,
};

// Dung thang token ngu nghia da co trong globals.css (--success/--warning/
// --danger) thay vi bia bo mau hex moi cho rieng do kho.
export const SERIES_DIFFICULTY_META: Record<
  SeriesDifficulty,
  { label: string; textClass: string; dotClass: string }
> = {
  beginner: {
    label: "Cơ bản",
    textClass: "text-success",
    dotClass: "bg-success",
  },
  intermediate: {
    label: "Trung bình",
    textClass: "text-warning",
    dotClass: "bg-warning",
  },
  advanced: {
    label: "Nâng cao",
    textClass: "text-danger",
    dotClass: "bg-danger",
  },
};
