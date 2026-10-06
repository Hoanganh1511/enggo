"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PopoverRoot, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { useNotesStore } from "@/stores/notes-store";
import { NOTE_TYPES, getNoteTypeConfig, type NoteType } from "@/lib/notes/note-types";
import type { Note } from "@/lib/api/notes";
import { createNoteAction } from "@/actions/notes/create-note";
import { updateNoteAction } from "@/actions/notes/update-note";
import { TagChipInput } from "./TagChipInput";

// Dropdown chon Note Type - PopoverRoot THUAN (khong dung <select> native,
// dung quy uoc chung cua app - xem StatusPicker trong card-grid-view.tsx lam
// vi du tuong tu).
function NoteTypeSelect({ value, onChange }: { value: NoteType; onChange: (type: NoteType) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = getNoteTypeConfig(value);
  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-transparent px-2.5 py-2 text-left text-[13px] font-medium text-ink hover:border-border-strong"
        >
          <span>{cfg.icon}</span>
          <span className="min-w-0 flex-1 truncate">{cfg.label}</span>
          <ChevronDown size={14} strokeWidth={2} className="shrink-0 text-ink-faint" />
        </button>
      </PopoverTrigger>
      <PopoverContent open={open} align="start" sideOffset={6} className="z-50 w-56 rounded-lg border border-border bg-surface p-1 shadow-dropdown">
        {NOTE_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              onChange(t.id);
              setOpen(false);
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] text-ink-muted hover:bg-hover-bg hover:text-ink"
          >
            <span>{t.icon}</span>
            <span className="min-w-0 flex-1 truncate">{t.label}</span>
            {t.id === value && <Check size={14} strokeWidth={2.5} className="shrink-0 text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </PopoverRoot>
  );
}

// Form "Add note"/"Edit note" - mo tu 2 duong (xem notes-store.ts):
// (1) bo den text trong bai -> "✦ Note" (ArticleSelectionToolbar.tsx) ->
//     addFormQuote co gia tri, gan san "Source reference".
// (2) nut "+ Add a note" cuoi panel -> addFormQuote = null, note thu cong
//     khong gan doan trich nao.
// editingId khac null = dang SUA 1 note co san (tim trong `notes` truyen vao).
// LUU Y: cha (NotesPanel.tsx) PHAI truyen `key={editingId ?? "new"}` khi
// render component nay - buoc REMOUNT (thay vi 1 effect dong bo lai state)
// moi khi doi tu "sua note A" sang "sua note B"/"them note moi", de 3
// useState duoi day luon khoi tao DUNG tu `editing` MOI ma khong vi pham
// react-hooks/set-state-in-effect (goi setState dong bo trong effect).
export function AddNoteForm({ notes, onSaved }: { notes: Note[]; onSaved: () => void }) {
  const { addFormQuote, editingId, context, closeAddForm } = useNotesStore();
  const editing = editingId ? (notes.find((n) => n.id === editingId) ?? null) : null;

  const [type, setType] = useState<NoteType>(editing?.type ?? "keyPoint");
  const [content, setContent] = useState(editing?.content ?? "");
  const [tags, setTags] = useState<string[]>(editing?.tags ?? []);
  const [saving, setSaving] = useState(false);

  const quoteText = editing?.quoteText || addFormQuote?.quoteText || "";

  async function handleSave() {
    if (!content.trim()) {
      toast.danger("Nhập nội dung ghi chú trước đã.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateNoteAction(editing.id, { type, content: content.trim(), tags });
        toast.success("Đã lưu ghi chú");
      } else {
        if (!context?.entryId || !context.entrySlug) {
          toast.danger("Không xác định được bài viết hiện tại.");
          return;
        }
        await createNoteAction({
          entryId: context.entryId,
          entrySlug: context.entrySlug,
          seriesSlug: context.seriesSlug,
          type,
          content: content.trim(),
          tags,
          quoteText: addFormQuote?.quoteText,
          quotePrefix: addFormQuote?.quotePrefix,
          quoteSuffix: addFormQuote?.quoteSuffix,
        });
        toast.success("Đã thêm ghi chú");
      }
      onSaved();
      closeAddForm();
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Lưu ghi chú thất bại, thử lại sau."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 shadow-sm">
      <p className="text-[13px] font-semibold text-ink">{editing ? "Sửa ghi chú" : "Add note"}</p>

      <NoteTypeSelect value={type} onChange={setType} />

      {quoteText && (
        <blockquote className="rounded-md border-l-2 border-primary/40 bg-surface-muted px-2.5 py-1.5 text-[12.5px] leading-snug text-ink-faint italic">
          “{quoteText}”
        </blockquote>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết suy nghĩ/ghi chú của bạn..."
        rows={4}
        className="w-full resize-none rounded-md border border-border bg-transparent px-2.5 py-2 text-[13px] outline-none placeholder:text-ink-faint focus:border-primary"
      />

      <div>
        <label className="mb-1 block text-[11px] font-medium text-ink-faint">Tags</label>
        <TagChipInput tags={tags} onChange={setTags} />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={closeAddForm}
          className="h-8 cursor-pointer rounded-md px-3 text-[12.5px] font-medium text-ink-muted hover:bg-hover-bg hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className={cn(
            "h-8 cursor-pointer rounded-md bg-primary px-3.5 text-[12.5px] font-semibold text-white hover:opacity-90",
            saving && "pointer-events-none opacity-60",
          )}
        >
          Save
        </button>
      </div>
    </div>
  );
}
