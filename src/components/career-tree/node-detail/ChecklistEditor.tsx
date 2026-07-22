"use client";

import { useState } from "react";
import { Plus, Trash2, type LucideIcon } from "lucide-react";

type ChecklistEditorProps = {
  items: string[];
  onChange: (items: string[]) => void;
  icon: LucideIcon;
  placeholder: string;
  emptyLabel: string;
  editable: boolean;
};

const ChecklistEditor = ({
  items,
  onChange,
  icon: Icon,
  placeholder,
  emptyLabel,
  editable,
}: ChecklistEditorProps) => {
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft("");
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 && !editable && (
        <p className="text-sm text-ink-faint italic">{emptyLabel}</p>
      )}
      {items.map((item, i) => (
        <div key={i} className="group flex items-center gap-2 text-sm text-ink">
          <Icon size={14} strokeWidth={1.75} className="shrink-0 text-primary" />
          <span className="flex-1">{item}</span>
          {editable && (
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="shrink-0 cursor-pointer rounded p-1 text-ink-disabled opacity-0 transition-opacity duration-150 ease-out hover:text-red-600 group-hover:opacity-100"
            >
              <Trash2 size={13} strokeWidth={1.75} />
            </button>
          )}
        </div>
      ))}
      {editable && (
        <div className="mt-1 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-dashed border-hover-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-solid focus:border-focus-border focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border px-2 text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <Plus size={14} strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChecklistEditor;
