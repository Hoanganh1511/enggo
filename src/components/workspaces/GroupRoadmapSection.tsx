"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { Map, Pencil } from "lucide-react";
import type { ApiKnowledgeGroup } from "@/lib/api/types";
import { updateGroupAction } from "@/actions/knowledge-groups/update-group";
import { getPostExtensions, POST_PROSE_CLASS } from "./post-extensions";
import { PostEditorToolbar } from "./PostEditorToolbar";
import { WorkspaceButton } from "./WorkspaceButton";
import { cn } from "@/lib/utils";
import { useWorkspaceShell } from "./workspace-shell-context";

// "Trang" Lo trinh - 1 vung soan Tiptap DAY DU (getPostExtensions(), CO
// heading/nested list - khac han GroupGoalModal.tsx dung schema han che) de
// ghi outline dang cum/topic/nhieu truong long nhau (vd "CỤM 00 — Foundation
// > Topic > What to learn/AWS docs/..."). View/edit toggle CUNG mo hinh voi
// GroupGoalButton.tsx nhung la 1 TRANG rieng (khong phai modal) vi noi dung
// du kien dai hon nhieu. CHI chu workspace (isSelf) duoc sua, dung lai
// updateGroupAction/updateGroupInState nhu cac form khac cua nhom.
export function GroupRoadmapSection({ group }: { group: ApiKnowledgeGroup }) {
  const { username, isSelf, updateGroupInState } = useWorkspaceShell();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  const editor = useEditor({
    extensions: [
      ...getPostExtensions(),
      Placeholder.configure({
        placeholder:
          "Ghi lộ trình học tập ở đây — cụm chủ đề, topic, tài liệu cần đọc...",
      }),
    ],
    content: group.roadmap ?? undefined,
    editable: false,
    immediatelyRender: false,
    // Xem comment trong PostEditor.tsx - can de PostEditorToolbar tu lam moi
    // trang thai active khi go/chon van ban trong che do sua.
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { class: POST_PROSE_CLASS + " min-h-[200px]" },
    },
  });

  useEffect(() => {
    editor?.setEditable(editing);
  }, [editing, editor]);

  const hasRoadmap = useMemo(() => {
    if (!group.roadmap) return false;
    const html = generateHTML(group.roadmap, getPostExtensions());
    return html.replace(/<[^>]*>/g, "").trim().length > 0;
  }, [group.roadmap]);

  function resetToViewMode() {
    editor?.commands.setContent(group.roadmap ?? "");
    setEditing(false);
    setError(null);
  }

  function handleSave() {
    if (!editor) return;
    setError(null);
    startTransition(async () => {
      try {
        const updated = await updateGroupAction(group.id, username, {
          roadmap: editor.getJSON() as Record<string, unknown>,
        });
        updateGroupInState(updated);
        setEditing(false);
      } catch {
        setError("Có lỗi khi lưu, thử lại sau.");
      }
    });
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[17px] font-bold" style={{ color: "var(--ink)" }}>
          Lộ trình học tập
        </h1>
        {isSelf && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[9px] border border-border px-3.5 text-[12px] font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <Pencil size={13} strokeWidth={2} />
            {hasRoadmap ? "Sửa lộ trình" : "Viết lộ trình"}
          </button>
        )}
      </div>

      {!editing && !hasRoadmap ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Map size={26} strokeWidth={1.5} style={{ color: "var(--ink-faint)" }} />
          <p className="text-[12.5px]" style={{ color: "var(--ink-faint)" }}>
            {isSelf
              ? "Nhóm này chưa có lộ trình học tập."
              : "Tác giả chưa viết lộ trình học tập cho nhóm này."}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "mt-4 overflow-hidden rounded-[13px]",
            editing && "border border-border focus-within:border-primary/50",
          )}
        >
          {editing && editor && <PostEditorToolbar editor={editor} />}
          <div className={editing ? "px-4 py-3" : ""}>
            <EditorContent editor={editor} />
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}

      {isSelf && editing && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={resetToViewMode}
            className="h-9 cursor-pointer rounded-md border border-border px-4 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
          >
            Huỷ
          </button>
          <WorkspaceButton onClick={handleSave} disabled={isSaving} showPlane={false}>
            {isSaving ? "Đang lưu..." : "Lưu"}
          </WorkspaceButton>
        </div>
      )}
    </div>
  );
}
