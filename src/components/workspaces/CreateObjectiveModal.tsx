"use client";

import { useState } from "react";
import { Book, Wrench, X } from "lucide-react";
import type { ApiObjectiveItemType } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { SimpleModal } from "@/components/ui/simple-modal";
import { createObjectiveAction } from "@/actions/objectives/create-objective";
import { createObjectiveItemAction } from "@/actions/objectives/create-objective-item";

// Gradient dung chung cho nut CTA/hanh dong noi bat trong khu vuc Workspace
// (xem docs/workspace-style-guide.md muc 8) - dung XUYEN SUOT ca modal nay
// (tab active + nut Luu), khong tron voi bg-community-accent (tim, accent
// rieng cua Community) de tranh 2 mau CTA lac nhau trong CUNG 1 modal.
const CTA_GRADIENT = "linear-gradient(to right, #20c5d8, #269ce9, #326eea)";

const TABS: { key: ApiObjectiveItemType; label: string; Icon: typeof Book; addLabel: string; placeholder: string }[] = [
  { key: "KNOWLEDGE", label: "Knowledge", Icon: Book, addLabel: "Thêm knowledge", placeholder: "VD: Federated access & identity services" },
  { key: "SKILL", label: "Skills", Icon: Wrench, addLabel: "Thêm skill", placeholder: "VD: Design role-based access control" },
];

// Modal "Tạo mục tiêu học tập" - tao 1 LearningObjective + (tuy chon) cac muc
// Knowledge/Skill ban dau CUNG LUC. Cac item CHUA ton tai o server cho toi
// khi bam "Lưu mục tiêu" (staged o local state) - vi Objective (cha) can
// duoc tao TRUOC de co id gan item vao, nen khong the ghi thang tung item
// nhu ArticleChecklist.tsx (o do document da co san).
export function CreateObjectiveModal({
  open,
  onClose,
  groupId,
  groupName,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState<ApiObjectiveItemType>("KNOWLEDGE");
  const [items, setItems] = useState<{ type: ApiObjectiveItemType; label: string }[]>([]);
  const [itemDraft, setItemDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeTabDef = TABS.find((t) => t.key === activeTab)!;

  function resetForm() {
    setTitle("");
    setDescription("");
    setActiveTab("KNOWLEDGE");
    setItems([]);
    setItemDraft("");
    setError(null);
  }

  function addStagedItem() {
    const label = itemDraft.trim();
    if (!label) return;
    setItems((prev) => [...prev, { type: activeTab, label }]);
    setItemDraft("");
  }

  async function handleSave() {
    setError(null);
    if (!title.trim()) {
      setError("Mục tiêu cần có tên.");
      return;
    }
    setIsSaving(true);
    try {
      const objective = await createObjectiveAction(groupId, {
        title: title.trim(),
        description: description.trim() || undefined,
      });
      for (const item of items) {
        await createObjectiveItemAction(objective.id, item);
      }
      resetForm();
      onClose();
      onCreated();
    } catch (err) {
      console.error("createObjectiveAction failed", err);
      setError("Có lỗi khi lưu, thử lại sau.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SimpleModal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
          resetForm();
        }
      }}
      title="Tạo mục tiêu học tập"
      description={groupName}
      maxWidthClassName="max-w-lg"
      footer={
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="h-9 cursor-pointer rounded-md border border-border px-4 text-xs font-semibold text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
          >
            Huỷ
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="h-9 cursor-pointer rounded-md px-4 text-xs font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: CTA_GRADIENT }}
          >
            {isSaving ? "Đang lưu..." : "Lưu mục tiêu"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="objective-title" className="text-[10px] font-bold tracking-wide text-ink-faint">
            TÊN MỤC TIÊU
          </label>
          <input
            id="objective-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: 1.1 Design secure access to AWS resources"
            className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/50"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="objective-description" className="text-[10px] font-bold tracking-wide text-ink-faint">
            MÔ TẢ
          </label>
          <textarea
            id="objective-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thiết kế quyền truy cập an toàn..."
            rows={2}
            className="resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-primary/50"
          />
        </div>

        {/* Tab Knowledge/Skills - moi tab quan ly 1 mang item rieng, item da
            them van hien du kha o tab kia (khong bi mat khi doi tab). */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-surface-muted p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm text-xs font-semibold transition-colors duration-150 ease-out",
                activeTab !== tab.key && "text-ink-muted hover:text-ink",
              )}
              style={activeTab === tab.key ? { background: CTA_GRADIENT, color: "#fff" } : undefined}
            >
              <tab.Icon size={13} strokeWidth={2} />
              {tab.label}
              <span className="text-[10px] opacity-80">
                ({items.filter((i) => i.type === tab.key).length})
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-wide text-ink-faint">
            {activeTabDef.label.toUpperCase()}
          </span>

          {items.filter((i) => i.type === activeTab).length > 0 && (
            <div className="mb-1 flex flex-col gap-1">
              {items.map((item, index) =>
                item.type === activeTab ? (
                  <span
                    key={index}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12.5px]"
                    style={{ border: "1px solid var(--border)", background: "var(--surface-muted)" }}
                  >
                    <span className="min-w-0 flex-1 truncate" style={{ color: "var(--ink)" }}>
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                      className="flex shrink-0 cursor-pointer items-center justify-center text-ink-faint hover:text-danger"
                    >
                      <X size={12} strokeWidth={2} />
                    </button>
                  </span>
                ) : null,
              )}
            </div>
          )}

          <div className="relative flex items-center gap-1.5">
            <input
              value={itemDraft}
              onChange={(e) => setItemDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addStagedItem();
                }
              }}
              placeholder={activeTabDef.placeholder}
              className="h-9 min-w-0 flex-1 rounded-md border border-dashed border-border bg-transparent px-3 text-[12.5px] text-ink outline-none placeholder:text-ink-faint focus:border-primary/50"
            />
            <button
              type="button"
              onClick={addStagedItem}
              className="flex h-9 shrink-0 cursor-pointer items-center rounded-md px-3 text-[12px] font-semibold text-primary hover:bg-hover-bg"
            >
              + {activeTabDef.addLabel}
            </button>
          </div>
        </div>

        {error && <p className="text-xs font-medium text-danger">{error}</p>}
      </div>
    </SimpleModal>
  );
}
