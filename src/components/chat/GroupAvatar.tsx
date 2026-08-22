import { Users } from "lucide-react";
import type { GroupAvatarColor } from "@/lib/api/types";

// Chua co upload anh nhom that (xem CreateGroupModal.tsx) - avatarColor la 1
// trong so gradient CO DINH nay, chon luc tao va luu lai vinh vien cho nhom
// do (khong random moi lan render). Phai khop key voi GROUP_AVATAR_COLORS,
// va khop TONE mau voi GROUP_COLOR_SWATCHES trong CreateGroupModal.tsx de
// avatar nhin giong het du render o modal tao nhom hay o danh sach/header.
const GROUP_GRADIENTS: Record<GroupAvatarColor, string> = {
  violet: "linear-gradient(135deg, #8B5CF6, #6D4AFF)",
  blue: "linear-gradient(135deg, #60A5FA, #2563EB)",
  emerald: "linear-gradient(135deg, #2DD4BF, #0D9488)",
  amber: "linear-gradient(135deg, #FB923C, #F97316)",
  rose: "linear-gradient(135deg, #F87171, #EF4444)",
  slate: "linear-gradient(135deg, #94A3B8, #64748B)",
};

export function GroupAvatar({
  color,
  size = 60,
}: {
  color: GroupAvatarColor | null;
  size?: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full text-white"
      style={{
        width: size,
        height: size,
        background: GROUP_GRADIENTS[color ?? "slate"],
      }}
    >
      <Users size={Math.max(14, Math.round(size * 0.4))} />
    </span>
  );
}
