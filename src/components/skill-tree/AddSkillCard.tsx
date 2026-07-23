"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createNodeAction } from "@/actions/career-tree/create-node";
import Spinner from "@/components/ui/spinner";

type AddSkillCardProps = {
  workspaceId: string;
  parentId: string;
  tierId: string;
};

// O placeholder "+ Them ky nang" o cuoi moi hang tier - tao 1 Node TOPIC that,
// gan parentId = root cua workspace (bat buoc de Career Tree canvas van chi
// co dung 1 root) va tierId = tier hien tai.
const AddSkillCard = ({ workspaceId, parentId, tierId }: AddSkillCardProps) => {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    // Chan submit lai khi dang pending - input bi disabled luc pending se tu
    // kich hoat onBlur, neu khong chan se goi createNodeAction 2 lan.
    if (isPending) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      await createNodeAction(workspaceId, parentId, trimmed, "TOPIC", tierId);
      setTitle("");
      setEditing(false);
    });
  };

  if (editing) {
    return (
      <div className="relative flex h-19 min-w-47.5 items-center">
        <input
          autoFocus
          value={title}
          disabled={isPending}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") {
              setTitle("");
              setEditing(false);
            }
          }}
          placeholder="Tên kỹ năng..."
          className="flex h-full w-full items-center rounded-xl border border-dashed border-hover-border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:border-solid focus:border-focus-border focus:outline-none disabled:cursor-wait disabled:opacity-70"
        />
        {isPending && (
          <span className="absolute right-3 flex items-center">
            <Spinner size={14} className="text-primary" />
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex h-19 min-w-47.5 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-hover-border text-sm text-ink-faint transition-colors duration-150 ease-out hover:border-solid hover:border-primary/40 hover:text-primary"
    >
      <Plus size={15} strokeWidth={1.75} />
      Thêm kỹ năng
    </button>
  );
};

export default AddSkillCard;
