"use client";

import { useState } from "react";
import { Settings, SunMoon, User, Users, LogOut } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { signOutAction } from "@/actions/auth/sign-out-action";

type AccountUser = {
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

function Avatar({ user, size }: { user: AccountUser; size: number }) {
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

  if (!user) return null;

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Tài khoản"
          className={`flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 ease-out ${
            open ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-border"
          }`}
        >
          <Avatar user={user} size={34} />
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
          <MenuRow icon={User} label="Profile" disabled />
          <MenuRow icon={Settings} label="Account settings" disabled />
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

function MenuRow({
  icon: Icon,
  label,
  disabled,
}: {
  icon: typeof User;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:bg-transparent"
    >
      <Icon size={16} strokeWidth={1.75} className="shrink-0 text-icon" />
      {label}
      {disabled && (
        <span className="ml-auto text-[10px] text-ink-faint">Sắp có</span>
      )}
    </button>
  );
}

export default AccountMenu;
