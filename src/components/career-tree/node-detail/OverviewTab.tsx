"use client";

import Link from "next/link";
import { CheckCircle2, ListChecks, ExternalLink } from "lucide-react";
import SectionLabel from "./SectionLabel";
import ChecklistEditor from "./ChecklistEditor";
import { TYPE_LABEL, TYPE_STYLE } from "./ResourcesTab";
import { formatDate, formatRelativeTime } from "@/lib/career-tree/format-time";
import { DIFFICULTY_LABEL, DIFFICULTY_STYLE } from "@/lib/career-tree/difficulty";
import type { ApiResource, Difficulty } from "@/lib/api/types";

type OverviewTabProps = {
  editable: boolean;
  goal: string;
  onGoalChange: (value: string) => void;
  learningOutcomes: string[];
  onLearningOutcomesChange: (items: string[]) => void;
  prerequisites: string[];
  onPrerequisitesChange: (items: string[]) => void;
  category: string | null;
  onCategoryChange: (value: string) => void;
  difficulty: Difficulty | null;
  onDifficultyChange: (value: Difficulty) => void;
  estimatedTime: string | null;
  onEstimatedTimeChange: (value: string) => void;
  workspaceId: string;
  parentId: string | null;
  parentName: string | null;
  branchName: string | null;
  createdAt: string;
  updatedAt: string;
  done: number;
  total: number;
  lastActivity: string | null;
  cardCount: number;
  resources: ApiResource[];
  onViewAllResources: () => void;
  onViewStats: () => void;
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="min-w-0 truncate text-right font-medium text-ink">
        {children}
      </span>
    </div>
  );
}

const OverviewTab = ({
  editable,
  goal,
  onGoalChange,
  learningOutcomes,
  onLearningOutcomesChange,
  prerequisites,
  onPrerequisitesChange,
  category,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  estimatedTime,
  onEstimatedTimeChange,
  workspaceId,
  parentId,
  parentName,
  branchName,
  createdAt,
  updatedAt,
  done,
  total,
  lastActivity,
  cardCount,
  resources,
  onViewAllResources,
  onViewStats,
}: OverviewTabProps) => {
  const percent = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  const topResources = resources.slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
      {/* Cot trai */}
      <div className="flex flex-col gap-4">
        <Card title="Mô tả">
          {editable ? (
            <textarea
              autoFocus
              value={goal}
              onChange={(e) => onGoalChange(e.target.value)}
              placeholder="Mô tả ngắn gọn về chủ đề này..."
              rows={3}
              className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
            />
          ) : goal ? (
            <p className="text-sm whitespace-pre-wrap text-ink">{goal}</p>
          ) : (
            <p className="text-sm text-ink-faint italic">Chưa có mô tả.</p>
          )}
        </Card>

        <Card title="Bạn sẽ học được">
          <ChecklistEditor
            items={learningOutcomes}
            onChange={onLearningOutcomesChange}
            icon={CheckCircle2}
            placeholder="Thêm điều bạn sẽ học được..."
            emptyLabel="Chưa có mục nào."
            editable={editable}
          />
        </Card>

        <Card title="Yêu cầu">
          <ChecklistEditor
            items={prerequisites}
            onChange={onPrerequisitesChange}
            icon={ListChecks}
            placeholder="Thêm yêu cầu..."
            emptyLabel="Không có yêu cầu nào."
            editable={editable}
          />
        </Card>

        <Card title="Tài liệu & Nguồn học nổi bật">
          {topResources.length === 0 ? (
            <p className="text-sm text-ink-faint italic">Chưa có tài liệu nào.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {topResources.map((resource) => (
                <li
                  key={resource.id}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${TYPE_STYLE[resource.type]}`}
                  >
                    {TYPE_LABEL[resource.type]}
                  </span>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-1 truncate text-sm text-ink underline decoration-border underline-offset-2 transition-colors duration-150 ease-out hover:text-primary"
                  >
                    <span className="truncate">{resource.title}</span>
                    <ExternalLink size={12} strokeWidth={1.75} className="shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={onViewAllResources}
            className="mt-3 cursor-pointer text-xs font-medium text-primary transition-colors duration-150 ease-out hover:underline"
          >
            Xem tất cả →
          </button>
        </Card>
      </div>

      {/* Cot phai */}
      <div className="flex flex-col gap-4">
        <Card title="Thông tin">
          <InfoRow label="Danh mục">
            {editable ? (
              <input
                value={category ?? ""}
                onChange={(e) => onCategoryChange(e.target.value)}
                placeholder="Chưa đặt"
                className="w-32 rounded-md border border-border bg-surface px-2 py-1 text-right text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
              />
            ) : (
              category ?? "—"
            )}
          </InfoRow>

          <InfoRow label="Độ khó">
            {editable ? (
              <div className="flex rounded-lg border border-border p-0.5">
                {(Object.keys(DIFFICULTY_LABEL) as Difficulty[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onDifficultyChange(value)}
                    className={`cursor-pointer rounded px-2 py-0.5 text-xs font-medium transition-colors duration-150 ease-out ${
                      difficulty === value
                        ? "bg-active-bg text-ink"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {DIFFICULTY_LABEL[value]}
                  </button>
                ))}
              </div>
            ) : difficulty ? (
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLE[difficulty]}`}
              >
                {DIFFICULTY_LABEL[difficulty]}
              </span>
            ) : (
              "—"
            )}
          </InfoRow>

          <InfoRow label="Thời gian ước tính">
            {editable ? (
              <input
                value={estimatedTime ?? ""}
                onChange={(e) => onEstimatedTimeChange(e.target.value)}
                placeholder="VD: 10 – 15 giờ"
                className="w-32 rounded-md border border-border bg-surface px-2 py-1 text-right text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
              />
            ) : (
              estimatedTime ?? "—"
            )}
          </InfoRow>

          {parentId && parentName && (
            <InfoRow label="Node cha">
              <Link
                href={`/w/${workspaceId}/nodes/${parentId}`}
                className="text-primary hover:underline"
              >
                {parentName}
              </Link>
            </InfoRow>
          )}

          {branchName && branchName !== parentName && (
            <InfoRow label="Nhánh">{branchName}</InfoRow>
          )}

          <InfoRow label="Ngày tạo">{formatDate(createdAt)}</InfoRow>
          <InfoRow label="Cập nhật lần cuối">{formatDate(updatedAt)}</InfoRow>
        </Card>

        <Card title="Tiến độ của bạn">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">Hoàn thành</span>
            <span className="font-medium tabular-nums text-ink">
              {Math.round(percent)}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${percent}%` }}
            />
          </div>

          <InfoRow label="Lần học cuối">
            {lastActivity ? formatRelativeTime(lastActivity) : "Chưa có"}
          </InfoRow>
          <InfoRow label="Tổng ghi chú">{cardCount}</InfoRow>

          <button
            type="button"
            onClick={onViewStats}
            className="mt-2 w-full cursor-pointer rounded-lg border border-border py-1.5 text-xs font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            Xem chi tiết tiến độ
          </button>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
