"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import type { ApiKnowledgeGroup } from "@/lib/api/types";
import { deleteGroupAction } from "@/actions/knowledge-groups/delete-group";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useWorkspaceShell } from "./workspace-shell-context";

// "Trang" Cai dat cua 1 nhom kien thuc - hien tai chi co dung 1 hanh dong
// THAT: xoa nhom (destructive, CHI chu workspace - backend gate bang
// assertGroupOwner, giong EditGroupButton.tsx). Khong hien them muc "sap co"
// nao khac o day - dung nguyen tac cua GroupSectionPlaceholder.tsx (khong
// gia vo co chuc nang chua xay).
export function GroupSettingsSection({ group }: { group: ApiKnowledgeGroup }) {
  const { username, workspace, isSelf, removeGroupFromState } =
    useWorkspaceShell();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    await deleteGroupAction(group.id, username);
    removeGroupFromState(group.id);
    router.push(`/workspace/${username}/${workspace.id}`);
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-5">
      <h1 className="text-[17px] font-bold" style={{ color: "var(--ink)" }}>
        Cài đặt nhóm
      </h1>

      {isSelf ? (
        <div
          className="mt-4 rounded-[13px] p-4"
          style={{
            border: "1px solid var(--danger)",
            background: "color-mix(in srgb, var(--danger) 6%, transparent)",
          }}
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle
              size={16}
              strokeWidth={1.9}
              className="mt-0.5 shrink-0"
              style={{ color: "var(--danger)" }}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                Vùng nguy hiểm
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                Xoá nhóm sẽ xoá vĩnh viễn toàn bộ {group.postCount} bài viết bên
                trong nhóm này. Không thể hoàn tác.
              </p>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="mt-3 flex cursor-pointer items-center gap-1.5 rounded-[9px] bg-danger px-3.5 py-2 text-[12px] font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90"
              >
                <Trash2 size={13} strokeWidth={2} />
                Xoá nhóm kiến thức
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-[12.5px]" style={{ color: "var(--ink-faint)" }}>
          Chỉ chủ workspace mới thiết lập được nhóm này.
        </p>
      )}

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Xoá "${group.name}"?`}
        description={`Toàn bộ ${group.postCount} bài viết trong nhóm sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá nhóm"
        danger
        onConfirm={handleDelete}
      />
    </div>
  );
}
