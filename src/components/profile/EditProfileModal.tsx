"use client";

import { useRef, useState, type ReactNode } from "react";
import { Briefcase, Camera, Link2, Loader2, MapPin, Share2, User, X } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { UserAvatarImage } from "@/components/ui/user-avatar-image";
import { useProfileImageUpload } from "@/lib/use-profile-image-upload";
import { updateProfileAction } from "@/actions/users/update-profile";
import { getApiErrorMessage } from "@/lib/api/client";
import { useProfileContext } from "./profile-context";

const fieldClass =
  "h-10 w-full min-w-0 rounded-md border border-input-border bg-input-bg px-3 text-sm text-input-text placeholder:text-input-placeholder transition-colors duration-150 ease-out focus:border-input-focus focus:ring-2 focus:ring-input-focus/15 focus:outline-none";

type SaveStatus = "idle" | "saving" | "saved" | "error";

// Field co icon dau dong + nut xoa (X) khi co noi dung - dung chung cho
// Vai trò/Nơi ở/Đại từ nhân xưng/Website (khop mockup nguoi dung gui). Van
// la input tu do (khong phai select that) - role/pronouns trong DB la
// String tu do, ep thanh danh sach dung san co rui ro mat du lieu neu gia
// tri hien tai khong khop preset nao.
function IconField({
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  icon: typeof User;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Icon
        size={15}
        strokeWidth={1.8}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${fieldClass} pr-8 pl-9`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          title="Xoá"
          className="absolute top-1/2 right-2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink-faint hover:bg-hover-bg hover:text-ink"
        >
          <X size={13} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

function FieldGroup({
  label,
  required,
  hint,
  counter,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  counter?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        {hint ? (
          <p className="text-xs leading-5 text-ink-muted">{hint}</p>
        ) : (
          <span />
        )}
        {counter && (
          <span className="shrink-0 text-[11px] text-ink-faint tabular-nums">{counter}</span>
        )}
      </div>
    </div>
  );
}

// Modal "Chỉnh sửa hồ sơ" - THAY THE hoan toan muc "Hồ sơ công khai" truoc
// day nam trong Settings (theo yeu cau nguoi dung, khop mockup: mo tu nut
// "Chỉnh sửa hồ sơ" o ProfileSidebar.tsx, khong con la 1 trang/section rieng
// nua). Logic luu (updateProfileAction, avatar upload qua
// useProfileImageUpload) chuyen nguyen tu SettingsSections.tsx ProfileSection
// (da xoa) sang day, doc/ghi qua useProfileContext() giong ProfileSidebar.
export function EditProfileModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { profile, onProfileUpdate } = useProfileContext();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [role, setRole] = useState(profile.role ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [website, setWebsite] = useState(profile.websiteUrl ?? "");
  const [pronouns, setPronouns] = useState(profile.pronouns ?? "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarUpload = useProfileImageUpload("avatarUrl", (url) =>
    onProfileUpdate({ avatarUrl: url }),
  );

  async function handleSave() {
    setStatus("saving");
    setErrorMessage(null);
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
      onProfileUpdate({
        displayName,
        username,
        bio,
        location,
        websiteUrl: website,
        pronouns,
        role,
      });
      setStatus("saved");
      onOpenChange(false);
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "Không lưu được, thử lại sau."));
      setStatus("error");
    }
  }

  return (
    <SimpleModal
      open={open}
      onOpenChange={onOpenChange}
      title="Chỉnh sửa hồ sơ"
      description="Cập nhật thông tin để mọi người hiểu bạn hơn."
      maxWidthClassName="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          {status === "error" && (
            <span className="mr-auto text-xs text-danger">{errorMessage}</span>
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 cursor-pointer rounded-md border border-border px-4 text-sm font-medium text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={status === "saving"}
            className="h-9 cursor-pointer rounded-md bg-button-primary-bg px-4 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-button-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "saving" ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2 pt-1">
          <div className="relative size-24">
            <UserAvatarImage
              src={profile.avatarUrl}
              name={profile.displayName}
              size={96}
              className="size-24"
            />
            {avatarUpload.isUploading && (
              <div className="absolute inset-0 grid place-items-center rounded-full bg-black/40">
                <Loader2 size={22} strokeWidth={2.2} className="animate-spin text-white" />
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) avatarUpload.upload(file);
              }}
            />
            <button
              type="button"
              disabled={avatarUpload.isUploading}
              title="Đổi ảnh đại diện"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute right-0 bottom-0 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-surface bg-ink text-white transition-colors duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Camera size={14} strokeWidth={2} />
            </button>
          </div>
          <button
            type="button"
            disabled={avatarUpload.isUploading}
            onClick={() => avatarInputRef.current?.click()}
            className="cursor-pointer text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          >
            Thay ảnh đại diện
          </button>
          {avatarUpload.error && (
            <p className="text-xs text-danger">{avatarUpload.error}</p>
          )}
        </div>

        <FieldGroup label="Tên hiển thị" required counter={`${displayName.length}/50`}>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className={fieldClass}
          />
        </FieldGroup>

        <FieldGroup
          label="Tên người dùng"
          required
          hint="Chỉ có thể đổi 1 lần mỗi 30 ngày."
        >
          <div className="flex items-center gap-1.5">
            <span className="flex h-10 shrink-0 items-center rounded-md border border-input-border bg-input-bg px-3 text-sm text-ink-faint">
              @
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={fieldClass}
            />
          </div>
        </FieldGroup>

        <FieldGroup label="Giới thiệu" counter={`${bio.length}/160`}>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            className={`${fieldClass} h-auto resize-none py-2`}
          />
        </FieldGroup>

        <FieldGroup label="Vai trò">
          <IconField icon={Briefcase} value={role} onChange={setRole} placeholder="Software Engineer" />
        </FieldGroup>

        <FieldGroup label="Nơi ở" hint="Chỉ là văn bản tự do, hệ thống không lưu toạ độ.">
          <IconField icon={MapPin} value={location} onChange={setLocation} placeholder="Hà Nội, Việt Nam" />
        </FieldGroup>

        <FieldGroup label="Đại từ nhân xưng">
          <IconField icon={User} value={pronouns} onChange={setPronouns} placeholder="anh ấy / cô ấy" />
        </FieldGroup>

        <FieldGroup label="Website">
          <IconField icon={Link2} value={website} onChange={setWebsite} placeholder="https://..." />
        </FieldGroup>

        <button
          type="button"
          disabled
          title="Sắp có"
          className="flex h-11 cursor-not-allowed items-center gap-2.5 rounded-md border border-border px-3 text-left text-sm font-medium text-ink-faint"
        >
          <Share2 size={15} strokeWidth={1.8} className="shrink-0" />
          <span className="flex-1">Mạng xã hội</span>
          <span className="text-xs">Sắp có</span>
        </button>
      </div>
    </SimpleModal>
  );
}
