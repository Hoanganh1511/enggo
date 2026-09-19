"use client";

import { useState } from "react";
import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { ImagePlus } from "lucide-react";
import { ImagePickerModal } from "./ImagePickerModal";
import { BlockActionsMenu } from "./BlockActionsMenu";

// NodeView cua ProfileBlock - "block layout" DAU TIEN (yeu cau nguoi dung:
// "Ảnh đại diện vuông, tên, sau đó phía dưới là nội dung"). Head (anh vuong +
// ten) la attrs THUAN, khong phai ProseMirror children. [2026-09-20] Doi tu
// window.prompt() (chi dan URL) sang ImagePickerModal (2 tab Tải lên/Dán
// URL) - yeu cau nguoi dung: "không để dán url, cho bật modal, có thể lựa
// chọn giữa 2 tab upload hoặc dán url". Body la NodeViewContent THAT (rich
// text day du, xem post-extensions.ts).
export function ProfileBlockView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const avatarUrl = (node.attrs.avatarUrl as string | null) ?? null;
  const name = (node.attrs.name as string) ?? "";
  const canEdit = editor.isEditable;
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <NodeViewWrapper className="profile-block group relative my-4">
      <div className="profile-block-head flex items-center gap-3" contentEditable={false}>
        {canEdit ? (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            title="Đổi ảnh đại diện"
            className="profile-block-avatar flex cursor-pointer items-center justify-center overflow-hidden bg-surface-muted text-ink-faint hover:text-ink"
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            {!avatarUrl && <ImagePlus size={20} strokeWidth={1.8} aria-hidden="true" />}
          </button>
        ) : avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL tuy y nguoi dung dan (khong phai asset noi bo, next/image can domain whitelist truoc)
          <img src={avatarUrl} alt={name} className="profile-block-avatar" />
        ) : (
          <div className="profile-block-avatar profile-block-avatar-empty" />
        )}
        {canEdit ? (
          <input
            value={name}
            onChange={(e) => updateAttributes({ name: e.target.value })}
            placeholder="Tên..."
            className="profile-block-name min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-faint placeholder:font-normal"
          />
        ) : (
          <span className="profile-block-name">{name}</span>
        )}
        {canEdit && <BlockActionsMenu editor={editor} getPos={getPos} node={node} />}
      </div>
      <NodeViewContent className="profile-block-body" />
      <ImagePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(url) => updateAttributes({ avatarUrl: url })}
      />
    </NodeViewWrapper>
  );
}
