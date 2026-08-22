import { Users } from "lucide-react";
import type { GroupAvatarColor } from "@/lib/api/types";

// Chua co upload anh nhom that (xem CreateGroupModal.tsx) - avatarColor la 1
// trong so gradient CO DINH nay, chon luc tao va luu lai vinh vien cho nhom
// do (khong random moi lan render). Phai khop key voi GROUP_AVATAR_COLORS.
const GROUP_GRADIENTS: Record<GroupAvatarColor, string> = {
  violet: "linear-gradient(135deg, #a78bfa, #7c3aed)",
  blue: "linear-gradient(135deg, #60a5fa, #2563eb)",
  emerald: "linear-gradient(135deg, #34d399, #059669)",
  amber: "linear-gradient(135deg, #fbbf24, #d97706)",
  rose: "linear-gradient(135deg, #fb7185, #e11d48)",
  slate: "linear-gradient(135deg, #94a3b8, #475569)",
};

export function GroupAvatar({
  color,
  size = 52,
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
