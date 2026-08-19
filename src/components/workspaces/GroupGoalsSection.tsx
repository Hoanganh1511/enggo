"use client";

import { useEffect, useState } from "react";
import { Plus, Target } from "lucide-react";
import type { ApiKnowledgeGroup, ApiObjective } from "@/lib/api/types";
import { listObjectivesAction } from "@/actions/objectives/list-objectives";
import { CreateObjectiveModal } from "./CreateObjectiveModal";
import { ObjectiveCard } from "./ObjectiveCard";

// "Trang" Muc tieu - danh sach LearningObjective cua nhom (vd "1.1 Design
// secure access to AWS resources"), moi objective co cac muc Knowledge/Skill
// rieng - xem ObjectiveCard.tsx. KHAC KnowledgeGroup.goal (1 o rich-text tu
// do cua ca nhom, gan qua GroupGoalButton/GroupGoalModal.tsx, khong lien
// quan trang nay).
export function GroupGoalsSection({ group }: { group: ApiKnowledgeGroup }) {
  const [objectives, setObjectives] = useState<ApiObjective[] | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listObjectivesAction(group.id).then((res) => {
      if (!cancelled) setObjectives(res);
    });
    return () => {
      cancelled = true;
    };
  }, [group.id]);

  function refresh() {
    listObjectivesAction(group.id).then(setObjectives);
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[17px] font-bold" style={{ color: "var(--ink)" }}>
          Mục tiêu học tập
        </h1>
        {group.viewerCanWrite && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] px-3.5 text-[12px] font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
            style={{ background: "linear-gradient(to right, #20c5d8, #269ce9, #326eea)" }}
          >
            <Plus size={14} strokeWidth={2.25} />
            Tạo mục tiêu
          </button>
        )}
      </div>

      {objectives === null ? (
        <p className="py-10 text-center text-xs" style={{ color: "var(--ink-faint)" }}>
          Đang tải...
        </p>
      ) : objectives.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Target size={26} strokeWidth={1.5} style={{ color: "var(--ink-faint)" }} />
          <p className="text-[12.5px]" style={{ color: "var(--ink-faint)" }}>
            Nhóm này chưa có mục tiêu học tập nào.
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {objectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              canEdit={group.viewerCanWrite}
              onChanged={(updated) =>
                setObjectives((prev) =>
                  (prev ?? []).map((o) => (o.id === updated.id ? updated : o)),
                )
              }
              onDeleted={() =>
                setObjectives((prev) => (prev ?? []).filter((o) => o.id !== objective.id))
              }
            />
          ))}
        </div>
      )}

      <CreateObjectiveModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        groupId={group.id}
        groupName={group.name}
        onCreated={refresh}
      />
    </div>
  );
}
