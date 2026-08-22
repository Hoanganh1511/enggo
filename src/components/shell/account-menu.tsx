"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BookText,
  ChevronDown,
  Settings,
  SunMoon,
  User,
  Users,
  LogOut,
} from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { signOutAction } from "@/actions/auth/sign-out-action";

export type AccountUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

// Export de AppSidebar.tsx dung lai cho the profile (avatar + fallback chu
// cai dau) thay vi viet lai logic fallback rieng.
export function Avatar({ user, size }: { user: AccountUser; size: number }) {
  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt=""
        referrerPolicy="no-referrer"
        width={size}
        height={size}
        className="shrink-0 rounded-full"
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
    >
      {getInitials(user.name)}
    </span>
  );
}

const AccountMenu = ({ user }: { user?: AccountUser | null }) => {
  const [open, setOpen] = useState(false);
  // username KHONG nam trong `user` (chi name/email/image, tu session.user
  // mac dinh cua next-auth) - doc rieng qua session.username (custom field,
  // xem auth.ts). Dung useSession() (client-side, cache san tu Suspense o
  // CurrentUser/(main)/layout.tsx render lan dau) thay vi phai truyen them 1
  // prop rieng xuyen qua CurrentUser -> AccountMenu.
  const { data: session } = useSession();
  const username = session?.username;

  if (!user) return null;

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Tài khoản"
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full py-1 pr-2 pl-1 transition-colors duration-150 ease-out hover:bg-hover-bg sm:pr-2 sm:pl-1"
        >
          <Avatar user={user} size={30} />
          {/* Ten + mui ten CHI hien tu sm tro len - tren mobile chi con avatar
              (bam vao van mo popover day du binh thuong qua PopoverTrigger,
              khong mat chuc nang gi), tranh cum tai khoan chiem qua nhieu
              cho tren header hep. */}
          <span className="hidden max-w-32 truncate text-sm font-medium text-ink sm:inline">
            {user.name ?? "Người dùng"}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={`hidden shrink-0 text-ink-faint transition-transform duration-150 ease-out sm:block ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        open={open}
        align="end"
        className="z-50 w-64 origin-top-right overflow-hidden rounded-sm border border-border bg-surface shadow-dropdown"
      >
        <div className="flex items-center gap-2.5 border-b border-border bg-surface-muted p-3">
          <Avatar user={user} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">
              {user.name ?? "Người dùng"}
            </p>
            <p className="truncate text-xs text-ink-muted">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 p-2">
          <MenuRow
            icon={User}
            label="Profile"
            href={username ? `/u/${username}` : undefined}
            onNavigate={() => setOpen(false)}
          />
          <MenuRow
            icon={BookText}
            label="Workspace"
            href={username ? `/workspace/${username}` : undefined}
            onNavigate={() => setOpen(false)}
          />
          <MenuRow
            icon={Settings}
            label="Cài đặt"
            href="/settings"
            onNavigate={() => setOpen(false)}
          />
          <MenuRow icon={SunMoon} label="Theme" disabled />
        </div>

        <div className="flex flex-col gap-0.5 border-t border-border p-2">
          <MenuRow icon={Users} label="Switch account" disabled />
        </div>

        <div className="border-t border-border p-2">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
            >
              <LogOut
                size={16}
                strokeWidth={1.75}
                className="shrink-0 text-icon"
              />
              Log out
            </button>
          </form>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
};

const menuRowClass =
  "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:bg-transparent";

function MenuRow({
  icon: Icon,
  label,
  href,
  disabled,
  onNavigate,
}: {
  icon: typeof User;
  label: string;
  href?: string;
  disabled?: boolean;
  onNavigate?: () => void;
}) {
  const inner = (
    <>
      <Icon size={16} strokeWidth={1.75} className="shrink-0 text-icon" />
      {label}
      {disabled && (
        <span className="ml-auto text-[10px] text-ink-faint">Sắp có</span>
      )}
    </>
  );

  // Muc da co trang that thi render Link (dieu huong duoc, middle-click mo tab
  // moi duoc); muc chua lam van la button disabled kem nhan "Sắp có".
  if (href && !disabled) {
    return (
      <Link href={href} onClick={onNavigate} className={menuRowClass}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" disabled={disabled} className={menuRowClass}>
      {inner}
    </button>
  );
}

export default AccountMenu;
