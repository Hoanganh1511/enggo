"use client";

import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from "@tiptap/react";
import { ImagePlus } from "lucide-react";

// NodeView cua ProfileBlock - "block layout" DAU TIEN (yeu cau nguoi dung:
// "Ảnh đại diện vuông, tên, sau đó phía dưới là nội dung"). Head (anh vuong +
// ten) la attrs THUAN, khong phai ProseMirror children - bam vao o anh mo
// window.prompt() dan URL (dung y het addImage() trong PostEditorToolbar.tsx,
// khong tu dung mot co che upload rieng ngoai pham vi yeu cau). Body la
// NodeViewContent THAT (rich text day du, xem post-extensions.ts).
export function ProfileBlockView({ node, updateAttributes, editor }: ReactNodeViewProps) {
  const avatarUrl = (node.attrs.avatarUrl as string | null) ?? null;
  const name = (node.attrs.name as string) ?? "";
  const canEdit = editor.isEditable;

  function changeAvatar() {
    const url = window.prompt("Dán URL ảnh đại diện (https://...)", avatarUrl ?? "");
    if (url === null) return;
    updateAttributes({ avatarUrl: url || null });
  }

  return (
    <NodeViewWrapper className="profile-block my-4">
      <div className="profile-block-head flex items-center gap-3" contentEditable={false}>
        {canEdit ? (
          <button
            type="button"
            onClick={changeAvatar}
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
      </div>
      <NodeViewContent className="profile-block-body" />
    </NodeViewWrapper>
  );
}
