"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import type { ApiCategory, Difficulty } from "@/lib/api/types";
import { createNodeAction } from "@/actions/career-tree/create-node";
import { updateNodeAction } from "@/actions/career-tree/update-node";
import { DIFFICULTY_LABEL } from "@/lib/career-tree/difficulty";
import Spinner from "@/components/ui/spinner";

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

type CreateSkillModalProps = {
  workspaceId: string;
  rootNodeId: string | null;
  categories: ApiCategory[];
};

// "+ Skill" tren toolbar - khac voi AddSkillCard (gan lien 1 tier co san tren
// canvas), nut nay khong biet truoc dat vao tier nao nen can hoi. Tier duoc
// nhom theo Category (optgroup) vi 1 Tier luon thuoc dung 1 Category. Chi giu
// field THAT SU co trong Node schema (name/tier/difficulty) - bo Status/
// Mastery/Resources/Relationships trong spec vi khong co field tuong ung
// (status/mastery deu la gia tri TINH TU du lieu khac, khong the gan truc
// tiep luc tao).
const CreateSkillModal = ({
  workspaceId,
  rootNodeId,
  categories,
}: CreateSkillModalProps) => {
  const hasTiers = categories.some((c) => c.tiers.length > 0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tierId, setTierId] = useState(
    categories.find((c) => c.tiers.length > 0)?.tiers[0]?.id ?? "",
  );
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [isPending, startTransition] = useTransition();

  const canSubmit = name.trim().length > 0 && tierId && !isPending;

  const handleSubmit = () => {
    if (!canSubmit || !rootNodeId) return;
    startTransition(async () => {
      const node = await createNodeAction(
        workspaceId,
        rootNodeId,
        name.trim(),
        "TOPIC",
        tierId,
      );
      if (difficulty) {
        await updateNodeAction(workspaceId, node.id, { difficulty });
      }
      setName("");
      setDifficulty(null);
      setOpen(false);
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          disabled={!rootNodeId || !hasTiers}
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={14} strokeWidth={2} />
          Skill
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-panel focus:outline-none"
        >
          <Dialog.Title className="text-base font-medium text-ink">
            Thêm kỹ năng mới
          </Dialog.Title>

          <div className="mt-4 flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Tên kỹ năng <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="VD: Redis"
                className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Tier <span className="text-red-500">*</span>
              </label>
              <select
                value={tierId}
                onChange={(e) => setTierId(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-focus-border focus:outline-none"
              >
                {categories
                  .filter((category) => category.tiers.length > 0)
                  .map((category) => (
                    <optgroup key={category.id} label={category.name}>
                      {category.tiers.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.label} · {tier.sublabel}
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Độ khó
              </label>
              <div className="flex gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(difficulty === d ? null : d)}
                    className={`flex-1 cursor-pointer rounded-md border px-2 py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
                      difficulty === d
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-ink-muted hover:bg-hover-bg"
                    }`}
                  >
                    {DIFFICULTY_LABEL[d]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                Huỷ
              </button>
            </Dialog.Close>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition-colors duration-150 ease-out hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending && <Spinner size={13} className="text-white" />}
              Tạo kỹ năng
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateSkillModal;
