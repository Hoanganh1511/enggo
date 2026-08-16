"use client";

import { SimpleModal } from "@/components/ui/simple-modal";
import { RequestCollabButton } from "./RequestCollabButton";
import type { ApiKnowledgeGroup } from "@/lib/api/types";

// Boc RequestCollabButton (form gui yeu cau cong tac) trong 1 modal - thay
// the banner inline cu (truoc day chiem het chieu cao WorkspaceMain khi nhom
// dang chon la PRIVATE + chua duoc duyet). Gio kich hoat tu viec click 1 the
// nhom bi khoa trong KnowledgeGroupFloors.tsx - nguoi xem chua bao gio thuc
// su "vao" duoc 1 nhom ho khong co quyen nua (khac ban cu, van cho selectGroup
// chay roi moi hien banner chan).
export function RequestCollabModal({
  group,
  open,
  onOpenChange,
}: {
  group: ApiKnowledgeGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <SimpleModal
      open={open}
      onOpenChange={onOpenChange}
      title={group?.name ?? "Nhóm kiến thức riêng tư"}
      description="Nhóm này đang ở chế độ riêng tư."
    >
      {group && <RequestCollabButton groupId={group.id} />}
    </SimpleModal>
  );
}
