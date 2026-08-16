"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { SquarePen, Target } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { cn } from "@/lib/utils";
import { updateGroupAction } from "@/actions/knowledge-groups/update-group";
import { getOverviewExtensions, OVERVIEW_PROSE_CLASS } from "./post-extensions";
import { OverviewEditorToolbar } from "./OverviewEditorToolbar";
import type { ApiKnowledgeGroup } from "@/lib/api/types";
import { useWorkspaceShell } from "./workspace-shell-context";

// Icon "square-pen" + modal "Mục tiêu nhóm kiến thức" - noi dung Tiptap JSON
// HAN CHE (bold/italic/bulletList/orderedList, TAI SU DUNG nguyen ven
// getOverviewExtensions()/OverviewEditorToolbar da co san cho
// Document.overview, dung 1 schema/toolbar cho 2 cho khong lap code). AI
// CUNG xem duoc (goal la metadata cong khai giong description, khong phai
// noi dung bai viet bi gate) - CHI chu workspace (isSelf) duoc sua, dung lai
// updateGroupAction/updateGroupInState nhu EditGroupButton.tsx.
export function GroupGoalButton({ group }: { group: ApiKnowledgeGroup }) {
  const { username, isSelf, updateGroupInState } = useWorkspaceShell();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  const editor = useEditor({
    extensions: [
      ...getOverviewExtensions(),
      Placeholder.configure({
        placeholder: "Mục tiêu của nhóm kiến thức này là gì?",
      }),
    ],
    content: group.goal ?? undefined,
    editable: false,
    immediatelyRender: false,
    // Xem comment trong PostEditor.tsx - can de OverviewEditorToolbar tu lam
    // moi trang thai active khi go/chon van ban trong che do sua.
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: { class: OVERVIEW_PROSE_CLASS + " min-h-[120px] px-3 py-2" },
    },
  });

  useEffect(() => {
    editor?.setEditable(editing);
  }, [editing, editor]);

  const hasGoal = useMemo(() => {
    if (!group.goal) return false;
    const html = generateHTML(group.goal, getOverviewExtensions());
    return html.replace(/<[^>]*>/g, "").trim().length > 0;
  }, [group.goal]);

  function resetToViewMode() {
    editor?.commands.setContent(group.goal ?? "");
    setEditing(false);
    setError(null);
  }

  function handleSave() {
    if (!editor) return;
    setError(null);
    startTransition(async () => {
      try {
        const updated = await updateGroupAction(group.id, username, {
          goal: editor.getJSON() as Record<string, unknown>,
        });
        updateGroupInState(updated);
        setEditing(false);
      } catch {
        setError("Có lỗi khi lưu, thử lại sau.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Mục tiêu của nhóm"
        aria-label="Mục tiêu của nhóm"
        className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
      >
        <SquarePen size={12} strokeWidth={2} />
      </button>

      <SimpleModal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next && editing) resetToViewMode();
        }}
        title="Mục tiêu nhóm kiến thức"
        description={group.name}
      >
        <div className="flex flex-col gap-3">
          {!editing && !hasGoal ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Target size={20} strokeWidth={1.5} className="text-ink-faint" />
              <p className="text-sm text-ink-faint">
                {isSelf
                  ? "Nhóm này chưa có mục tiêu."
                  : "Tác giả chưa thiết lập mục tiêu cho nhóm này."}
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "overflow-hidden rounded-md",
                editing && "border border-border focus-within:border-primary/50",
              )}
            >
              {editing && editor && <OverviewEditorToolbar editor={editor} />}
              <EditorContent editor={editor} />
            </div>
          )}

          {error && <p className="text-xs font-medium text-danger">{error}</p>}

          {isSelf && (
            <div className="flex justify-end gap-2">
              {editing ? (
                <>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={resetToViewMode}
                    className="h-9 cursor-pointer rounded-md border border-border px-4 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Huỷ
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSave}
                    className="h-9 cursor-pointer rounded-md bg-community-accent px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-community-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Đang lưu..." : "Lưu"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="h-9 cursor-pointer rounded-md border border-border px-4 text-sm font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
                >
                  {hasGoal ? "Sửa mục tiêu" : "Viết mục tiêu"}
                </button>
              )}
            </div>
          )}
        </div>
      </SimpleModal>
    </>
  );
}
