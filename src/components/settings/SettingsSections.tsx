"use client";

import { useRef, useState } from "react";
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
import { updateProfileAction } from "@/actions/users/update-profile";
import { uploadPostImageAction } from "@/actions/discover/upload-post-image";
import { getApiErrorMessage } from "@/lib/api/client";
import type { UserProfileApiShape } from "@/lib/api/users";
import {
  SelectField,
  SettingsRow,
  SettingsSection,
  TextArea,
  TextField,
  Toggle,
} from "./SettingsControls";

// ProfileSection (UserProfile) da noi backend that (PATCH /users/me) - cac
// section con lai (Privacy/Preference/Account, tru muc doi mat khau/dang
// xuat trong Security) van chi la UI, state chi song trong component, CHUA
// goi API nao de luu. Backend tuong ung (UserPrivacy/UserPreference/
// UserLegal) chua ton tai, xem lo trinh trong
// career-tree-api/docs/user-schema-design.md.

type SaveStatus = "idle" | "saving" | "saved" | "error";

function SaveBar({
  onSave,
  status,
  errorMessage,
}: {
  onSave: () => void;
  status: SaveStatus;
  errorMessage?: string | null;
}) {
  return (
    <div className="flex items-center justify-end gap-3 px-5 py-3">
      {status === "saved" && <span className="text-xs text-success">Đã lưu.</span>}
      {status === "error" && (
        <span className="text-xs text-danger">
          {errorMessage ?? "Không lưu được, thử lại sau."}
        </span>
      )}
      <button
        type="button"
        onClick={onSave}
        disabled={status === "saving"}
        className="h-9 cursor-pointer rounded-md bg-button-primary-bg px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-button-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "saving" ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}

// "Hồ sơ công khai" - MUC DUY NHAT trong Settings da noi PATCH /users/me
// that (xem update-profile.ts) - luu duoc displayName/username/bio/location/
// websiteUrl/pronouns/role/avatarUrl. "Đổi ảnh" upload That qua S3 co san
// (POST /uploads kind=image, tai dung dung duong Composer.tsx/ProfileSidebar.tsx
// dang dung) roi luu URL qua PATCH /users/me ngay (khong doi chung voi nut
// "Lưu thay đổi" cua cac field text, vi anh nen phan hoi ngay khi chon).
export function ProfileSection({ profile }: { profile: UserProfileApiShape }) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [role, setRole] = useState(profile.role ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [website, setWebsite] = useState(profile.websiteUrl ?? "");
  const [pronouns, setPronouns] = useState(profile.pronouns ?? "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setStatus("saving");
    try {
      await updateProfileAction({
        displayName,
        username,
        bio,
        location,
        websiteUrl: website,
        pronouns,
        role,
      });
      setStatus("saved");
    } catch (err) {
      setSaveErrorMessage(getApiErrorMessage(err, "Không lưu được, thử lại sau."));
      setStatus("error");
    }
  }

  async function handleAvatarFile(file: File) {
    if (file.size > 25 * 1024 * 1024) {
      setAvatarError("Ảnh vượt quá 25MB.");
      return;
    }
    setIsUploadingAvatar(true);
    setAvatarError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", "image");
      const uploaded = await uploadPostImageAction(formData);
      await updateProfileAction({ avatarUrl: uploaded.url });
      setAvatarUrl(uploaded.url);
    } catch (err) {
      setAvatarError(getApiErrorMessage(err, "Tải ảnh thất bại, thử lại sau."));
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  return (
    <SettingsSection
      bare
      title="Hồ sơ công khai"
      description="Những thông tin này hiển thị với người khác trên trang cá nhân của bạn."
    >
      <SettingsRow label="Ảnh đại diện">
        <div className="flex items-center gap-3">
          <Image
            src={avatarUrl}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) handleAvatarFile(file);
            }}
          />
          <button
            type="button"
            disabled={isUploadingAvatar}
            onClick={() => avatarInputRef.current?.click()}
            className="h-9 cursor-pointer rounded-md border border-border px-3 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploadingAvatar ? "Đang tải..." : "Đổi ảnh"}
          </button>
          {avatarError && <span className="text-xs text-danger">{avatarError}</span>}
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

      <SaveBar onSave={handleSave} status={status} errorMessage={saveErrorMessage} />
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
      bare
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
      bare
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
      <SettingsSection bare title="Giao diện & ngôn ngữ">
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
      bare
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
      <SettingsSection bare title="Tài khoản">
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
      bare
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
