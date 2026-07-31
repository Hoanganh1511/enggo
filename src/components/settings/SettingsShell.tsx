"use client";

import { useState } from "react";
import { Bell, KeyRound, Lock, UserRound, type LucideIcon } from "lucide-react";
import type { UserProfileData } from "@/content/user-profile";
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
  profile: UserProfileData;
  email: string;
}) => {
  const [section, setSection] = useState<SectionKey>("profile");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5 pt-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">Cài đặt</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Quản lý hồ sơ, quyền riêng tư và tuỳ chọn cá nhân của bạn.
        </p>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Nav trai - tren man hinh hep thi thanh 1 hang cuon ngang */}
        <nav className="flex shrink-0 gap-1 overflow-x-auto lg:w-56 lg:flex-col lg:overflow-visible">
          {NAV.map((item) => {
            const active = section === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSection(item.key)}
                className={`flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-md px-3 text-left text-sm font-medium transition-colors duration-150 ease-out ${
                  active
                    ? "bg-active-bg text-primary"
                    : "text-ink-muted hover:bg-hover-bg hover:text-ink"
                }`}
              >
                <item.icon size={15} strokeWidth={1.75} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {section === "profile" && <ProfileSection profile={profile} />}
          {section === "privacy" && <PrivacySection />}
          {section === "security" && <SecuritySection />}
          {section === "preference" && <PreferenceSection />}
          {section === "account" && <AccountSection email={email} />}
        </div>
      </div>
    </div>
  );
};

export default SettingsShell;
