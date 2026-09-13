"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";

function randomKey(): string {
  return Math.random().toString(36).slice(2);
}

// Repeater dung chung cho cac mang tu do trong form soan Series (stats,
// install tabs, external links, FAQ...) - moi field dung 1 shape T khac
// nhau nen KHONG the gop 1 component cu the, chi gop PHAN KHUNG (them/xoa
// dong + nut) con noi dung tung dong (renderRow) do noi goi tu quyet dinh.
//
// Tu giu 1 mang `keys` SONG SONG voi `items` (KHONG dung index lam key JSX) -
// items la object thuong (khong co id), tao moi qua spread {...item, ...patch}
// moi lan sua nen KHONG the dung object identity lam key. Neu dung index,
// xoa 1 dong GIUA danh sach se lam React hieu nham la "dong cuoi bien mat"
// (cac dong sau do chi doi NOI DUNG, khong doi vi tri) - exit animation se
// chay sai dong. Mang `keys` nay dam bao dung dong nao bi xoa se la dong do
// tu bien mat.
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
  // Items chi bao gio doi qua handleAdd/handleRemove/renderRow's `update` BEN
  // DUOI (khong co duong nao khac tu ben ngoai reset lai mang sau khi mount) -
  // nen `keys` chi can khoi tao 1 LAN duy nhat, khong can dong bo lai trong
  // effect (tranh loi react-hooks/set-state-in-effect).
  const [keys, setKeys] = useState<string[]>(() => items.map(() => randomKey()));

  function handleAdd() {
    onChange([...items, newItem()]);
    setKeys((prev) => [...prev, randomKey()]);
  }

  function handleRemove(index: number) {
    onChange(items.filter((_, i) => i !== index));
    setKeys((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      {/* KHONG animate `height`/dung `overflow-hidden` o day - tung se lam
          vay (height:0 -> auto) nhung no CLIP mat dropdown cua
          PostLinkAutocomplete (khong dung Portal nhu PopoverContent, chi la
          1 div absolute BEN TRONG hang) khien cac hang bi de/che len nhau -
          nguoi dung bao loi. Chi dung opacity/y/scale (khong dong cham chieu
          cao) + `layout` de framer-motion tu FLIP vi tri cac hang con lai,
          van muot ma ma khong can clip gi ca. */}
      <AnimatePresence initial={false}>
        {items.map((item, index) => (
          <motion.div
            key={keys[index]}
            layout
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-start gap-2 rounded-lg border border-border p-2.5">
              <div className="min-w-0 flex-1">
                {renderRow(
                  item,
                  (patch) => {
                    const next = [...items];
                    next[index] = { ...item, ...patch };
                    onChange(next);
                  },
                  () => handleRemove(index),
                  index,
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <button
        type="button"
        onClick={handleAdd}
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
