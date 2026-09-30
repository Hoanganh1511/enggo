"use client";

import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Check, Copy } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { RepeaterField } from "@/components/series/RepeaterField";
import { SelectMenu } from "@/components/ui/select-menu";
import { BlockActionsMenu } from "./BlockActionsMenu";
import { normalizeEntryButtonItem, type EntryBlockButtonItem } from "./post-extensions";

const inputClass =
  "min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[13px] outline-none placeholder:text-ink-faint hover:border-border focus:border-primary";

const STYLE_OPTIONS: { value: EntryBlockButtonItem["style"]; label: string }[] = [
  { value: "solid", label: "Nền đen, chữ trắng" },
  { value: "outline", label: "Viền đen, chữ đen" },
  { value: "ghost", label: "Không viền, chữ xám" },
];

// InstallBlock - "dòng lệnh copy-paste + nút bên dưới" (thay the block
// "install" cu cua he thong Section chèn thêm - xem comment dau file
// post-extensions.ts).
export function InstallBlockView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const canEdit = editor.isEditable;
  const command = (node.attrs.command as string) || "";
  const description = (node.attrs.description as string) || "";
  const buttons = ((node.attrs.buttons ?? []) as Partial<EntryBlockButtonItem>[]).map(normalizeEntryButtonItem);
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard
      .writeText(command)
      .then(() => {
        setCopied(true);
        toast.success("Đã copy lệnh");
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => toast.danger("Không copy được, thử lại sau."));
  }

  if (!canEdit) {
    return (
      <NodeViewWrapper className="install-block">
        <div className="install-block-command">
          <code>{command}</code>
        </div>
        {(description || buttons.length > 0) && (
          <div className="install-block-footer">
            {description && <p className="install-block-desc">{description}</p>}
            {buttons.length > 0 && (
              <div className="install-block-buttons">
                {buttons.map((b, i) => (
                  <a key={i} href={b.href || undefined} className={`entry-btn entry-btn-${b.style}`}>
                    {b.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper contentEditable={false} className="group my-4">
      <div className="mb-1.5 flex justify-end">
        <BlockActionsMenu editor={editor} getPos={getPos} node={node} />
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-center gap-3 bg-[#0d1117] px-4 py-3">
          <input
            value={command}
            onChange={(e) => updateAttributes({ command: e.target.value })}
            placeholder="Command (vd: npx skills@latest add ...)"
            className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-[#e6edf3] outline-none placeholder:text-[#6e7681]"
          />
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy lệnh"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#8b949e] transition-colors duration-150 ease-out hover:bg-white/10 hover:text-white"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
        <div className="flex flex-col gap-2 p-3">
          <input
            value={description}
            onChange={(e) => updateAttributes({ description: e.target.value })}
            placeholder="Mô tả sau lệnh (không bắt buộc)"
            className={inputClass}
          />
          <RepeaterField
            items={buttons}
            onChange={(next) => updateAttributes({ buttons: next })}
            newItem={() => ({ label: "", href: "", style: "outline" }) as EntryBlockButtonItem}
            addLabel="Thêm nút"
            renderRow={(item, update) => (
              <div className="flex items-center gap-2">
                <input value={item.label} onChange={(e) => update({ label: e.target.value })} placeholder="Nhãn nút" className={inputClass} />
                <input value={item.href} onChange={(e) => update({ href: e.target.value })} placeholder="URL" className={inputClass} />
                <div className="w-40 shrink-0">
                  <SelectMenu value={item.style} onChange={(style) => update({ style })} options={STYLE_OPTIONS} placeholder="Kiểu" />
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
