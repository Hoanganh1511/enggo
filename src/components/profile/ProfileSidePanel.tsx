import {
  Award,
  Megaphone,
  UserCircle,
  UserPlus,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Module = {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
};

const MODULES: Module[] = [
  {
    icon: Award,
    iconColor: "#fbbf24",
    title: "Xác minh & danh hiệu",
    description: "Huy hiệu thành tích, trạng thái xác minh tài khoản",
  },
  {
    icon: Zap,
    iconColor: "#fb923c",
    title: "Ủng hộ",
    description: "Người xem có thể ủng hộ cho kênh của bạn",
  },
  {
    icon: Megaphone,
    iconColor: "#38bdf8",
    title: "Thông báo",
    description: "Ghim thông báo tới người theo dõi",
  },
  {
    icon: UserCircle,
    iconColor: "#818cf8",
    title: "Thông tin cá nhân",
    description: "Nghề nghiệp, kỹ năng, liên kết mạng xã hội",
  },
  {
    icon: Video,
    iconColor: "#f87171",
    title: "Phòng livestream",
    description: "Phát trực tiếp và tương tác với người xem",
  },
  {
    icon: UserPlus,
    iconColor: "#34d399",
    title: "Đề xuất theo dõi",
    description: "Gợi ý người dùng khác có thể bạn quan tâm",
  },
];

// Cot phai rieng cua cac tab noi dung profile (home/posts/playlists/
// collections/likes/history - KHONG hien o /following, /followers vi 2 trang
// do da co layout 2 cot rieng, xem (connections)/layout.tsx). 6 module theo
// dung spec Bilibili tham khao - tat ca deu CHUA co tinh nang that, danh dau
// "Sap ra mat" dong nhat voi cach lam o nut Nhan tin/More trong ProfileHeader.tsx.
const ProfileSidePanel = () => {
  return (
    <aside className="hidden w-76 shrink-0 flex-col gap-3 lg:flex">
      {MODULES.map((m) => (
        <div
          key={m.title}
          title="Sắp ra mắt"
          className="flex cursor-not-allowed items-start gap-3 rounded-lg  bg-gray-50 p-3 opacity-80"
        >
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${m.iconColor}22` }}
          >
            <m.icon size={17} strokeWidth={2} style={{ color: m.iconColor }} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-ink">
                {m.title}
              </h3>
              <span className="shrink-0 rounded-full bg-ink-faint/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-faint">
                Sắp ra mắt
              </span>
            </div>
            <p className="mt-0.5 line-clamp-2 text-sm text-ink/80">
              {m.description}
            </p>
          </div>
        </div>
      ))}
    </aside>
  );
};

export default ProfileSidePanel;
