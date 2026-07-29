"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Download,
  LogOut,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";
import GoogleIcon from "@/components/ui/google-icon";
import { revokeSessionsAction } from "@/actions/auth/revoke-sessions-action";
import type { UserProfileData } from "@/content/user-profile";
import {
  SelectField,
  SettingsRow,
  SettingsSection,
  TextArea,
  TextField,
  Toggle,
} from "./SettingsControls";

// TAT CA cac section duoi day moi la UI - state chi song trong component, CHUA
// goi API nao de luu. Backend tuong ung (UserProfile/UserPrivacy/UserSecurity/
// UserPreference/UserLegal) chua ton tai, xem lo trinh trong
// career-tree-api/docs/user-schema-design.md.

function SaveBar({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-end px-5 py-3">
      <button
        type="button"
        onClick={onSave}
        className="h-9 cursor-pointer rounded-md bg-button-primary-bg px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-button-primary-hover"
      >
        Lưu thay đổi
      </button>
    </div>
  );
}

export function ProfileSection({ profile }: { profile: UserProfileData }) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [role, setRole] = useState(profile.role ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [website, setWebsite] = useState(profile.websiteUrl ?? "");
  const [pronouns, setPronouns] = useState(profile.pronouns ?? "");

  return (
    <SettingsSection
      title="Hồ sơ công khai"
      description="Những thông tin này hiển thị với người khác trên trang cá nhân của bạn."
    >
      <SettingsRow label="Ảnh đại diện">
        <div className="flex items-center gap-3">
          <Image
            src={profile.avatarUrl}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
          <button
            type="button"
            className="h-9 cursor-pointer rounded-md border border-border px-3 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            Đổi ảnh
          </button>
        </div>
      </SettingsRow>

      <SettingsRow label="Tên hiển thị" hint="Cho phép tiếng Việt có dấu và emoji, tối đa 50 ký tự.">
        <TextField value={displayName} onChange={setDisplayName} />
      </SettingsRow>

      <SettingsRow
        label="Tên người dùng"
        hint="Đây là đường dẫn tới trang cá nhân của bạn. Chỉ đổi được 1 lần mỗi 30 ngày."
      >
        <TextField value={username} onChange={setUsername} prefix="@" />
      </SettingsRow>

      <SettingsRow label="Giới thiệu" hint="Vài dòng về bạn, hiển thị ngay dưới tên.">
        <TextArea value={bio} onChange={setBio} maxLength={300} />
      </SettingsRow>

      <SettingsRow label="Vai trò">
        <TextField
          value={role}
          onChange={setRole}
          placeholder="Software Engineer"
        />
      </SettingsRow>

      <SettingsRow label="Nơi ở" hint="Chỉ là văn bản tự do, hệ thống không lưu toạ độ.">
        <TextField
          value={location}
          onChange={setLocation}
          placeholder="Hà Nội, Việt Nam"
        />
      </SettingsRow>

      <SettingsRow label="Website">
        <TextField
          value={website}
          onChange={setWebsite}
          placeholder="https://..."
        />
      </SettingsRow>

      <SettingsRow label="Đại từ nhân xưng">
        <TextField
          value={pronouns}
          onChange={setPronouns}
          placeholder="anh ấy / cô ấy"
        />
      </SettingsRow>

      <SaveBar onSave={() => {}} />
    </SettingsSection>
  );
}

export function PrivacySection() {
  const [visibility, setVisibility] = useState<"PUBLIC" | "FOLLOWERS_ONLY" | "PRIVATE">("PUBLIC");
  const [whoCanMessage, setWhoCanMessage] = useState<"EVERYONE" | "FOLLOWERS" | "NOBODY">("EVERYONE");
  const [whoCanComment, setWhoCanComment] = useState<"EVERYONE" | "FOLLOWERS" | "NOBODY">("EVERYONE");
  const [showOnline, setShowOnline] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(false);
  const [allowIndexing, setAllowIndexing] = useState(true);
  const [discoverableByEmail, setDiscoverableByEmail] = useState(false);

  return (
    <SettingsSection
      title="Quyền riêng tư"
      description="Kiểm soát ai xem được hồ sơ và tương tác được với bạn."
    >
      <SettingsRow label="Ai xem được hồ sơ">
        <SelectField
          value={visibility}
          onChange={setVisibility}
          options={[
            { value: "PUBLIC", label: "Tất cả mọi người" },
            { value: "FOLLOWERS_ONLY", label: "Chỉ người theo dõi" },
            { value: "PRIVATE", label: "Chỉ mình tôi" },
          ]}
        />
      </SettingsRow>

      <SettingsRow label="Ai nhắn tin được cho bạn">
        <SelectField
          value={whoCanMessage}
          onChange={setWhoCanMessage}
          options={[
            { value: "EVERYONE", label: "Tất cả mọi người" },
            { value: "FOLLOWERS", label: "Chỉ người theo dõi" },
            { value: "NOBODY", label: "Không ai" },
          ]}
        />
      </SettingsRow>

      <SettingsRow label="Ai bình luận được bài của bạn">
        <SelectField
          value={whoCanComment}
          onChange={setWhoCanComment}
          options={[
            { value: "EVERYONE", label: "Tất cả mọi người" },
            { value: "FOLLOWERS", label: "Chỉ người theo dõi" },
            { value: "NOBODY", label: "Không ai" },
          ]}
        />
      </SettingsRow>

      <SettingsRow label="Hiện trạng thái đang hoạt động">
        <Toggle
          checked={showOnline}
          onChange={setShowOnline}
          label="Hiện trạng thái đang hoạt động"
        />
      </SettingsRow>

      <SettingsRow
        label="Hiện lần truy cập gần nhất"
        hint="Mặc định tắt để an toàn hơn."
      >
        <Toggle
          checked={showLastSeen}
          onChange={setShowLastSeen}
          label="Hiện lần truy cập gần nhất"
        />
      </SettingsRow>

      <SettingsRow
        label="Cho phép công cụ tìm kiếm lập chỉ mục"
        hint="Tắt đi thì Google sẽ không hiển thị trang cá nhân của bạn trong kết quả tìm kiếm."
      >
        <Toggle
          checked={allowIndexing}
          onChange={setAllowIndexing}
          label="Cho phép công cụ tìm kiếm lập chỉ mục"
        />
      </SettingsRow>

      <SettingsRow
        label="Cho phép tìm thấy qua email"
        hint="Mặc định tắt, tránh bị dò tìm tài khoản bằng địa chỉ email."
      >
        <Toggle
          checked={discoverableByEmail}
          onChange={setDiscoverableByEmail}
          label="Cho phép tìm thấy qua email"
        />
      </SettingsRow>

      <SettingsRow
        label="Danh sách chặn"
        hint="Người bị chặn không xem được hồ sơ và không tương tác được với bạn."
      >
        <button
          type="button"
          className="h-9 cursor-pointer rounded-md border border-border px-3 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          Quản lý
        </button>
      </SettingsRow>
    </SettingsSection>
  );
}

export function SecuritySection() {
  const [loginAlerts, setLoginAlerts] = useState(true);

  return (
    <SettingsSection
      title="Bảo mật"
      description="Career Tree đăng nhập qua Google — mật khẩu và xác thực 2 lớp do Google quản lý."
    >
      <SettingsRow
        label="Phương thức đăng nhập"
        hint="Tài khoản của bạn đang liên kết với Google. Bạn không cần đặt mật khẩu riêng."
      >
        <span className="flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-ink">
          <GoogleIcon className="size-4" />
          Google
          <ShieldCheck size={14} strokeWidth={1.75} className="text-success" />
        </span>
      </SettingsRow>

      <SettingsRow
        label="Cảnh báo đăng nhập lạ"
        hint="Gửi email khi có thiết bị mới đăng nhập vào tài khoản."
      >
        <Toggle
          checked={loginAlerts}
          onChange={setLoginAlerts}
          label="Cảnh báo đăng nhập lạ"
        />
      </SettingsRow>

      {/* Day la muc DUY NHAT trong Settings da noi backend that (POST
          /users/me/revoke-sessions) - cac muc con lai van chi la state cuc bo. */}
      <SettingsRow
        label="Thiết bị đang đăng nhập"
        hint="Đăng xuất khỏi mọi thiết bị nếu bạn nghi ngờ tài khoản bị truy cập trái phép. Bạn cũng sẽ bị đăng xuất khỏi thiết bị này."
      >
        <form action={revokeSessionsAction}>
          <button
            type="submit"
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <MonitorSmartphone size={14} strokeWidth={1.75} />
            Đăng xuất mọi thiết bị
          </button>
        </form>
      </SettingsRow>
    </SettingsSection>
  );
}

export function PreferenceSection() {
  const [theme, setTheme] = useState<"SYSTEM" | "LIGHT" | "DARK">("SYSTEM");
  const [language, setLanguage] = useState<"vi-VN" | "en-US">("vi-VN");
  const [notifyFollow, setNotifyFollow] = useState(true);
  const [notifyComment, setNotifyComment] = useState(true);
  const [notifyMention, setNotifyMention] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(false);

  return (
    <>
      <SettingsSection title="Giao diện & ngôn ngữ">
        <SettingsRow label="Giao diện">
          <SelectField
            value={theme}
            onChange={setTheme}
            options={[
              { value: "SYSTEM", label: "Theo hệ thống" },
              { value: "LIGHT", label: "Sáng" },
              { value: "DARK", label: "Tối" },
            ]}
          />
        </SettingsRow>
        <SettingsRow label="Ngôn ngữ">
          <SelectField
            value={language}
            onChange={setLanguage}
            options={[
              { value: "vi-VN", label: "Tiếng Việt" },
              { value: "en-US", label: "English" },
            ]}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Thông báo"
        description="Chọn loại hoạt động bạn muốn được thông báo."
      >
        <SettingsRow label="Có người theo dõi bạn">
          <Toggle
            checked={notifyFollow}
            onChange={setNotifyFollow}
            label="Có người theo dõi bạn"
          />
        </SettingsRow>
        <SettingsRow label="Bình luận vào bài của bạn">
          <Toggle
            checked={notifyComment}
            onChange={setNotifyComment}
            label="Bình luận vào bài của bạn"
          />
        </SettingsRow>
        <SettingsRow label="Có người nhắc đến bạn">
          <Toggle
            checked={notifyMention}
            onChange={setNotifyMention}
            label="Có người nhắc đến bạn"
          />
        </SettingsRow>
        <SettingsRow
          label="Email tổng hợp hàng tuần"
          hint="Tóm tắt hoạt động và gợi ý học tập, gửi vào sáng thứ Hai."
        >
          <Toggle
            checked={notifyDigest}
            onChange={setNotifyDigest}
            label="Email tổng hợp hàng tuần"
          />
        </SettingsRow>
      </SettingsSection>
    </>
  );
}

export function AccountSection({ email }: { email: string }) {
  const [marketingConsent, setMarketingConsent] = useState(false);

  return (
    <>
      <SettingsSection title="Tài khoản">
        <SettingsRow
          label="Email"
          hint="Lấy từ tài khoản Google, không đổi trực tiếp tại đây."
        >
          <span className="text-sm text-ink-muted">{email}</span>
        </SettingsRow>
        <SettingsRow
          label="Nhận email giới thiệu tính năng"
          hint="Bạn có thể tắt bất cứ lúc nào. Chúng tôi lưu lại thời điểm bạn đồng ý."
        >
          <Toggle
            checked={marketingConsent}
            onChange={setMarketingConsent}
            label="Nhận email giới thiệu tính năng"
          />
        </SettingsRow>
        <SettingsRow
          label="Tải dữ liệu của bạn"
          hint="Xuất toàn bộ hồ sơ, bài đăng và cây kiến thức dưới dạng tệp nén."
        >
          <button
            type="button"
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <Download size={14} strokeWidth={1.75} />
            Yêu cầu tải dữ liệu
          </button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection
        title="Vùng nguy hiểm"
        description="Các thao tác dưới đây ảnh hưởng vĩnh viễn tới tài khoản của bạn."
      >
        <SettingsRow
          label="Vô hiệu hoá tài khoản"
          hint="Ẩn hồ sơ và bài đăng của bạn. Đăng nhập lại là khôi phục được."
        >
          <button
            type="button"
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            <LogOut size={14} strokeWidth={1.75} />
            Vô hiệu hoá
          </button>
        </SettingsRow>
        <SettingsRow
          label="Xoá tài khoản"
          hint="Có 30 ngày để đổi ý. Sau thời hạn đó dữ liệu bị xoá vĩnh viễn, không khôi phục được."
        >
          <button
            type="button"
            className="flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-danger px-3 text-sm font-medium text-danger transition-colors duration-150 ease-out hover:bg-danger/10"
          >
            <AlertTriangle size={14} strokeWidth={1.75} />
            Xoá tài khoản
          </button>
        </SettingsRow>
      </SettingsSection>

      <p className="px-1 text-xs leading-5 text-ink-faint">
        Bằng việc sử dụng Career Tree, bạn đồng ý với{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Điều khoản dịch vụ
        </Link>{" "}
        và{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Chính sách quyền riêng tư
        </Link>
        .
      </p>
    </>
  );
}
