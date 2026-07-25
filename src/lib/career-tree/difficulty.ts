import type { Difficulty } from "@/lib/api/types";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó",
};

export const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  EASY: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  MEDIUM: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  HARD: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};
