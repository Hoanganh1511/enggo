"use client";

import { Plus, Trash2 } from "lucide-react";

// Repeater dung chung cho cac mang tu do trong form soan Series (stats,
// install tabs, external links, FAQ...) - moi field dung 1 shape T khac
// nhau nen KHONG the gop 1 component cu the, chi gop PHAN KHUNG (them/xoa
// dong + nut) con noi dung tung dong (renderRow) do noi goi tu quyet dinh.
export function RepeaterField<T>({
  items,
  onChange,
  newItem,
  renderRow,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  renderRow: (
    item: T,
    update: (patch: Partial<T>) => void,
    remove: () => void,
    index: number,
  ) => React.ReactNode;
  addLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-2 rounded-lg border border-border p-2.5">
          <div className="min-w-0 flex-1">
            {renderRow(
              item,
              (patch) => {
                const next = [...items];
                next[index] = { ...item, ...patch };
                onChange(next);
              },
              () => onChange(items.filter((_, i) => i !== index)),
              index,
            )}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="flex cursor-pointer items-center gap-1.5 self-start rounded-md px-2 py-1.5 text-[13px] font-medium text-primary hover:bg-primary-soft"
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  );
}

// Nut xoa dong dung chung (dat rieng vi renderRow thuong can dat o goc phai).
export function RemoveRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Xoá dòng"
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-hover-bg hover:text-danger"
    >
      <Trash2 size={13} />
    </button>
  );
}
