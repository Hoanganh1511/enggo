"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createTierAction } from "@/actions/career-tree/create-tier";

type AddTierButtonProps = {
  workspaceId: string;
  categoryId: string;
};

const AddTierButton = ({ workspaceId, categoryId }: AddTierButtonProps) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState("");
  const [sublabel, setSublabel] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    const trimmedLabel = label.trim();
    const trimmedSublabel = sublabel.trim();
    if (!trimmedLabel || !trimmedSublabel) return;
    startTransition(async () => {
      await createTierAction(
        workspaceId,
        categoryId,
        trimmedLabel,
        trimmedSublabel,
      );
      setLabel("");
      setSublabel("");
      setEditing(false);
    });
  };

  if (editing) {
    return (
      <div className="flex flex-col items-stretch gap-2">
        <input
          autoFocus
          value={label}
          disabled={isPending}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Tên tier (VD: TIER 5)"
          className="h-9 w-full rounded-lg border border-dashed border-hover-border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:border-solid focus:border-focus-border focus:outline-none"
        />
        <input
          value={sublabel}
          disabled={isPending}
          onChange={(e) => setSublabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setEditing(false);
          }}
          placeholder="Mô tả (VD: MASTER)"
          className="h-9 w-full rounded-lg border border-dashed border-hover-border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:border-solid focus:border-focus-border focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
          >
            Thêm
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="cursor-pointer text-sm text-ink-faint hover:text-ink"
          >
            Huỷ
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex h-19 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-hover-border text-sm text-ink-faint transition-colors duration-150 ease-out hover:border-solid hover:border-primary/40 hover:text-primary"
    >
      <Plus size={15} strokeWidth={1.75} />
      Thêm tier
    </button>
  );
};

export default AddTierButton;
