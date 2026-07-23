"use client";

import { useState } from "react";
import { SlidersHorizontal, Check } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { Difficulty } from "@/lib/api/types";
import type { NodeStatus } from "@/lib/career-tree/node-status";
import { getStatusStyle, STATUS_LABEL } from "@/lib/skill-tree/status-style";
import { DIFFICULTY_LABEL } from "@/lib/career-tree/difficulty";
import {
  createEmptyFilters,
  countActiveFilters,
  type SkillFilters,
  type NotesFilter,
} from "./toolbar-types";

const ALL_STATUSES: NodeStatus[] = [
  "mastered",
  "healthy",
  "growing",
  "need-review",
  "stale",
  "inactive",
];
const ALL_DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];
const NOTES_OPTIONS: { key: NotesFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "has", label: "Có ghi chú" },
  { key: "none", label: "Chưa có ghi chú" },
];

type FilterMenuProps = {
  filters: SkillFilters;
  onChange: (filters: SkillFilters) => void;
};

// Filter da lam duoc THAT SU vi status/do kho/so ghi chu/lastActivity deu da
// co san tren tung node (khong can fetch them). Bo muc "Category" trong spec
// vi khai niem do chua ton tai trong schema.
const FilterMenu = ({ filters, onChange }: FilterMenuProps) => {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  const toggleStatus = (status: NodeStatus) => {
    const next = new Set(filters.statuses);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    onChange({ ...filters, statuses: next });
  };

  const toggleDifficulty = (difficulty: Difficulty) => {
    const next = new Set(filters.difficulties);
    if (next.has(difficulty)) next.delete(difficulty);
    else next.add(difficulty);
    onChange({ ...filters, difficulties: next });
  };

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors duration-150 ease-out ${
            activeCount > 0
              ? "bg-primary/10 text-primary"
              : open
                ? "bg-hover-bg text-ink"
                : "text-ink-muted hover:bg-hover-bg hover:text-ink"
          }`}
        >
          <SlidersHorizontal size={14} strokeWidth={1.75} />
          Lọc
          {activeCount > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        open={open}
        align="start"
        className="z-50 w-64 rounded-lg border border-border bg-surface p-2 shadow-dropdown"
      >
        <p className="px-2 py-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
          Trạng thái
        </p>
        {ALL_STATUSES.map((status) => {
          const checked = filters.statuses.has(status);
          const style = getStatusStyle(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggleStatus(status)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              <span
                className={`flex size-3.5 shrink-0 items-center justify-center rounded border ${
                  checked ? "border-primary bg-primary" : "border-border"
                }`}
              >
                {checked && (
                  <Check size={10} strokeWidth={3} className="text-white" />
                )}
              </span>
              <span
                className={`size-1.5 shrink-0 rounded-full ${style.dotClass}`}
              />
              <span className="flex-1">{STATUS_LABEL[status]}</span>
            </button>
          );
        })}

        <div className="my-1 h-px bg-border" />
        <p className="px-2 py-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
          Độ khó
        </p>
        {ALL_DIFFICULTIES.map((difficulty) => {
          const checked = filters.difficulties.has(difficulty);
          return (
            <button
              key={difficulty}
              type="button"
              onClick={() => toggleDifficulty(difficulty)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              <span
                className={`flex size-3.5 shrink-0 items-center justify-center rounded border ${
                  checked ? "border-primary bg-primary" : "border-border"
                }`}
              >
                {checked && (
                  <Check size={10} strokeWidth={3} className="text-white" />
                )}
              </span>
              <span className="flex-1">{DIFFICULTY_LABEL[difficulty]}</span>
            </button>
          );
        })}

        <div className="my-1 h-px bg-border" />
        <p className="px-2 py-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
          Ghi chú
        </p>
        {NOTES_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ...filters, notes: key })}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <span
              className={`flex size-3.5 shrink-0 items-center justify-center rounded-full border ${
                filters.notes === key ? "border-primary" : "border-border"
              }`}
            >
              {filters.notes === key && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </span>
            {label}
          </button>
        ))}

        <div className="my-1 h-px bg-border" />
        <button
          type="button"
          onClick={() =>
            onChange({ ...filters, recentlyLearned: !filters.recentlyLearned })
          }
          className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <span
            className={`flex size-3.5 shrink-0 items-center justify-center rounded border ${
              filters.recentlyLearned
                ? "border-primary bg-primary"
                : "border-border"
            }`}
          >
            {filters.recentlyLearned && (
              <Check size={10} strokeWidth={3} className="text-white" />
            )}
          </span>
          Học gần đây (14 ngày)
        </button>

        {activeCount > 0 && (
          <>
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              onClick={() => onChange(createEmptyFilters())}
              className="flex w-full cursor-pointer items-center justify-center rounded-md px-2 py-1.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
            >
              Xoá bộ lọc
            </button>
          </>
        )}
      </PopoverContent>
    </PopoverRoot>
  );
};

export default FilterMenu;
