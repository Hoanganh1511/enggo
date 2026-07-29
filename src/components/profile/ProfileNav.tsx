"use client";

import {
  Bookmark,
  FileText,
  Heart,
  History,
  Home,
  ListVideo,
  Search,
  type LucideIcon,
} from "lucide-react";

export type ProfileTab =
  | "home"
  | "posts"
  | "playlists"
  | "collections"
  | "likes"
  | "history";

// Thanh dieu huong trong profile - tran vien nhu header, dinh ngay duoi anh
// bia. "Lich su" chi co nghia voi chinh chu nen an voi nguoi khac.
const TABS: { key: ProfileTab; label: string; icon: LucideIcon; selfOnly?: boolean }[] = [
  { key: "home", label: "Trang chủ", icon: Home },
  { key: "posts", label: "Bài đăng", icon: FileText },
  { key: "playlists", label: "Danh sách phát", icon: ListVideo },
  { key: "collections", label: "Bộ sưu tập", icon: Bookmark },
  { key: "likes", label: "Thích", icon: Heart },
  { key: "history", label: "Lịch sử", icon: History, selfOnly: true },
];

const ProfileNav = ({
  active,
  onChange,
  isSelf,
  query,
  onQueryChange,
}: {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
  isSelf: boolean;
  query: string;
  onQueryChange: (v: string) => void;
}) => {
  const visible = TABS.filter((t) => !t.selfOnly || isSelf);

  return (
    <div className="-mx-6 border-y border-border bg-surface">
      <div className="flex items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {visible.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChange(tab.key)}
                className={`-mb-px flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors duration-150 ease-out ${
                  isActive
                    ? "border-danger text-danger"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                <tab.icon size={15} strokeWidth={1.75} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative hidden shrink-0 sm:block">
          <Search
            size={14}
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint"
          />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Tìm kiếm trong trang"
            className="h-8 w-52 rounded-md border border-search-border bg-surface-muted pr-2.5 pl-8 text-xs text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileNav;
