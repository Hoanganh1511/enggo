"use client";

import { useState } from "react";
import { Bell, ChevronDown, KeyRound, Lock, UserRound, type LucideIcon } from "lucide-react";
import type { UserProfileApiShape } from "@/lib/api/users";
import SectionContainer from "@/components/ui/section-container";
import {
  AccountSection,
  PreferenceSection,
  PrivacySection,
  ProfileSection,
  SecuritySection,
} from "./SettingsSections";

type SectionKey = "profile" | "privacy" | "security" | "preference" | "account";

// Nhom cai dat bam theo dung cach tach bang trong thiet ke schema (xem
// career-tree-api/docs/user-schema-design.md): UserProfile / UserPrivacy /
// UserSecurity / UserPreference / UserLegal+DataRequest. Giu 1-1 nhu vay de
// khi noi API that, moi tab map thang vao 1 endpoint, khong phai gom du lieu
// tu nhieu cho.
const NAV: { key: SectionKey; label: string; icon: LucideIcon }[] = [
  { key: "profile", label: "Hồ sơ công khai", icon: UserRound },
  { key: "privacy", label: "Quyền riêng tư", icon: Lock },
  { key: "security", label: "Bảo mật", icon: KeyRound },
  { key: "preference", label: "Giao diện & thông báo", icon: Bell },
  { key: "account", label: "Tài khoản & dữ liệu", icon: KeyRound },
];

const SettingsShell = ({
  profile,
  email,
}: {
  profile: UserProfileApiShape;
  email: string;
}) => {
  // Doi tu "nav chon 1 panel hien" sang accordion (theo mockup) - "Hồ sơ
  // công khai" mo mac dinh, cac muc con lai dong. Bam lai chinh muc dang mo
  // se dong no (khong bat buoc luon co 1 muc mo).
  const [openKey, setOpenKey] = useState<SectionKey | null>("profile");

  return (
    <SectionContainer as="div" maxWidth="4xl" className="flex flex-col gap-5 py-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">Cài đặt</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Quản lý hồ sơ, quyền riêng tư và tuỳ chọn cá nhân của bạn.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {NAV.map((item) => {
          const open = openKey === item.key;
          return (
            <div
              key={item.key}
              className="overflow-hidden rounded-lg border border-border bg-surface"
            >
              <button
                type="button"
                onClick={() => setOpenKey(open ? null : item.key)}
                aria-expanded={open}
                className="flex h-12 w-full cursor-pointer items-center gap-2.5 px-4 text-left text-sm font-semibold text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                <item.icon size={16} strokeWidth={1.85} className="shrink-0 text-ink-muted" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-ink-faint transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && (
                <div className="border-t border-border">
                  {item.key === "profile" && <ProfileSection profile={profile} />}
                  {item.key === "privacy" && <PrivacySection />}
                  {item.key === "security" && <SecuritySection />}
                  {item.key === "preference" && <PreferenceSection />}
                  {item.key === "account" && <AccountSection email={email} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionContainer>
  );
};

export default SettingsShell;
