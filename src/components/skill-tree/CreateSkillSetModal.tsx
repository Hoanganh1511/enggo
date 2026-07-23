"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Sparkles, FilePlus2 } from "lucide-react";
import Spinner from "@/components/ui/spinner";
import { SKILL_SET_PRESETS } from "@/content/skill-set-presets";
import {
  createBlankSkillSetAction,
  createSkillSetFromPresetAction,
} from "@/actions/career-tree/create-skill-set";

// Khong ep chon preset/blank ngay tu dau - ca 2 lua chon hien binh dang trong
// cung 1 modal (dung UX note trong plan: "khong tao ap luc quyet dinh ngay").
const CreateSkillSetModal = () => {
  const [open, setOpen] = useState(false);
  const [blankName, setBlankName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const goToWorkspace = (id: string) => {
    setOpen(false);
    router.push(`/skill-tree/${id}`);
  };

  const handlePreset = (presetKey: string) => {
    const preset = SKILL_SET_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;
    startTransition(async () => {
      const workspace = await createSkillSetFromPresetAction(preset);
      goToWorkspace(workspace.id);
    });
  };

  const handleBlank = () => {
    const trimmed = blankName.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const workspace = await createBlankSkillSetAction(trimmed);
      goToWorkspace(workspace.id);
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          title="Tạo Skill Set mới"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-icon transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-icon-hover"
        >
          <Plus size={15} strokeWidth={1.75} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-3rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-panel focus:outline-none"
        >
          <Dialog.Title className="text-base font-medium text-ink">
            Tạo Skill Set mới
          </Dialog.Title>
          <p className="mt-1 text-sm text-ink-muted">
            Bắt đầu từ 1 mẫu có sẵn rồi tuỳ chỉnh sau, hoặc tự dựng từ đầu.
          </p>

          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">
              <Sparkles size={12} strokeWidth={1.75} />
              Từ mẫu có sẵn
            </p>
            <div className="flex flex-col gap-2">
              {SKILL_SET_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  disabled={isPending}
                  onClick={() => handlePreset(preset.key)}
                  className="flex cursor-pointer flex-col items-start rounded-lg border border-border p-3 text-left transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-wait"
                >
                  <span className="text-sm font-medium text-ink">
                    {preset.name}
                  </span>
                  <span className="mt-0.5 text-xs text-ink-faint">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">
              <FilePlus2 size={12} strokeWidth={1.75} />
              Bắt đầu từ đầu
            </p>
            <div className="flex items-center gap-2">
              <input
                value={blankName}
                disabled={isPending}
                onChange={(e) => setBlankName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBlank()}
                placeholder="Tên Skill Set..."
                className="h-9 flex-1 rounded-lg border border-dashed border-hover-border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:border-solid focus:border-focus-border focus:outline-none"
              />
              <button
                type="button"
                disabled={isPending || !blankName.trim()}
                onClick={handleBlank}
                className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 text-sm text-white transition-colors duration-150 ease-out hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending && <Spinner size={13} className="text-white" />}
                Tạo
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CreateSkillSetModal;
