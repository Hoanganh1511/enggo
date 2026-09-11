"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Briefcase,
  Camera,
  ChevronDown,
  Loader2,
  MapPin,
  Rss,
  Share2,
  User,
  X,
} from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { SelectMenu } from "@/components/ui/select-menu";
import { UserAvatarImage } from "@/components/ui/user-avatar-image";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
} from "@/components/ui/social-icons";
import { useProfileImageUpload } from "@/lib/use-profile-image-upload";
import { updateProfileAction } from "@/actions/users/update-profile";
import { getApiErrorMessage } from "@/lib/api/client";
import { VN_PROVINCES } from "@/lib/vn-provinces";
import { useProfileContext } from "./profile-context";

// 6 nen tang mang xa hoi that - moi phan tu 1 key trong UpdateProfileInput/
// UserProfileApiShape (career-tree-api, cung ten field). Dung 1 mang cau
// hinh thay vi lap lai 6 lan y het nhau (label/icon/placeholder) cho state/
// validate/render.
const SOCIAL_PLATFORMS = [
  { key: "twitterUrl", label: "X (Twitter)", icon: X, placeholder: "x.com/tenban" },
  { key: "facebookUrl", label: "Facebook", icon: FacebookIcon, placeholder: "facebook.com/tenban" },
  { key: "instagramUrl", label: "Instagram", icon: InstagramIcon, placeholder: "instagram.com/tenban" },
  { key: "youtubeUrl", label: "YouTube", icon: YoutubeIcon, placeholder: "youtube.com/@tenban" },
  { key: "linkedinUrl", label: "LinkedIn", icon: LinkedinIcon, placeholder: "linkedin.com/in/tenban" },
  { key: "rssUrl", label: "RSS", icon: Rss, placeholder: "tenmien.com/feed" },
] as const;
type SocialKey = (typeof SOCIAL_PLATFORMS)[number]["key"];

const fieldClass =
  "h-10 w-full min-w-0 rounded-md border border-input-border bg-input-bg px-3 text-sm text-input-text placeholder:text-input-placeholder transition-colors duration-150 ease-out focus:border-input-focus focus:ring-2 focus:ring-input-focus/15 focus:outline-none";
const fieldErrorClass = "border-danger focus:border-danger focus:ring-danger/15";

// Khop DUNG regex backend (UpdateProfileDto.username, career-tree-api) - 1
// nguon duy nhat de tranh 2 phia lech nhau, copy nguyen chuoi thay vi import
// (2 repo rieng, khong share code duoc).
const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;
// Domain + duong dan tuy chon, KHONG kem protocol (protocol la tien to co
// dinh "https://" o UI, xem PrefixField) - chi kiem tra so bo phia client,
// nguon that van la @IsUrl() o backend tren URL day du da ghep san.
const DOMAIN_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(\/\S*)?$/;

const PRONOUN_OPTIONS = ["Anh/Em", "Anh/Chị", "Anh ấy/Cô ấy", "He/Him", "She/Her", "They/Them"];

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, "");
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

// Icon co the la 1 icon lucide-react (User/Briefcase/MapPin/...) HOAC 1 icon
// tu ve rieng (FacebookIcon/InstagramIcon/... trong social-icons.tsx - lucide
// da bo cac icon thuong hieu nay) - ca 2 deu nhan dung 3 prop nay.
type FieldIcon = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

// Field co icon dau dong + nut xoa (X) khi co noi dung - dung cho Vai trò
// (input tu do, khong phai select - role trong DB la String tu do, ep thanh
// danh sach dung san co rui ro mat du lieu neu gia tri hien tai khong khop
// preset nao) VA cho tung nen tang mang xa hoi (icon rieng, xem
// SOCIAL_PLATFORMS).
function IconField({
  icon: Icon,
  value,
  onChange,
  placeholder,
  maxLength,
  list,
  error,
}: {
  icon: FieldIcon;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  // id cua 1 <datalist> ben ngoai - goi y KHONG ep chon (xem Nơi ở, danh
  // sach tinh/thanh VN).
  list?: string;
  error?: boolean;
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
        maxLength={maxLength}
        list={list}
        className={`${fieldClass} pr-8 pl-9 ${error ? fieldErrorClass : ""}`}
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

// Đại từ nhân xưng - danh sach dung san theo yeu cau nguoi dung ("cho data
// fix sẵn cũng được"). Neu gia tri hien tai (du lieu cu) khong khop preset
// nao, TU them no vao dau danh sach thay vi lam mat/doi ngam gia tri that
// cua nguoi dung. Dropdown tu ve (SelectMenu, dung chung token/animation voi
// moi popover khac trong app) thay vi <select> mac dinh cua trinh duyet -
// theo yeu cau "droplist phai dong bo style".
function PronounSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const fullOptions =
    value && !options.includes(value) ? [value, ...options] : options;
  return (
    <SelectMenu
      icon={User}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={fullOptions.map((o) => ({ value: o, label: o }))}
    />
  );
}

// Field co TIEN TO CO DINH (khong phai icon) - dung cho Website ("https://"),
// cung tinh than voi o Tên người dùng ("@"). `list` (datalist id) de goi y
// khong ep chon - dung cho Nơi ở (danh sach tinh/thanh VN).
function PrefixField({
  prefix,
  value,
  onChange,
  placeholder,
  list,
  error,
}: {
  prefix: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  list?: string;
  error?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex h-10 shrink-0 items-center rounded-md border border-input-border bg-input-bg px-3 text-sm text-ink-faint">
        {prefix}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={list}
        className={`${fieldClass} ${error ? fieldErrorClass : ""}`}
      />
    </div>
  );
}

function FieldGroup({
  label,
  required,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
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
        {error ? (
          <p className="text-xs leading-5 text-danger">{error}</p>
        ) : hint ? (
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
//
// Validate: dong bo VOI DUNG rule backend (UpdateProfileDto,
// career-tree-api) - Tên hiển thị/Tên người dùng bat buoc, username theo
// dung regex backend, Website phai la domain hop le (backend validate URL
// day du sau khi FE ghep tien to https://). Loi tu backend (vd trung
// username) van hien qua getApiErrorMessage o duoi form - validate client
// chi chan truoc cac loi CHAC CHAN sai, khong thay the validate server.
export function EditProfileModal({
  open,
  onOpenChange,
  initialFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // "bio" = tu focus vao o Giới thiệu ngay khi mo (tu link "+ Thêm tiểu sử"
  // o ProfileSidebar.tsx).
  initialFocus?: "bio";
}) {
  const { profile, onProfileUpdate } = useProfileContext();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [role, setRole] = useState(profile.role ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [website, setWebsite] = useState(() => stripProtocol(profile.websiteUrl ?? ""));
  const [pronouns, setPronouns] = useState(profile.pronouns ?? "");
  const [social, setSocial] = useState<Record<SocialKey, string>>(() => ({
    twitterUrl: stripProtocol(profile.twitterUrl ?? ""),
    facebookUrl: stripProtocol(profile.facebookUrl ?? ""),
    instagramUrl: stripProtocol(profile.instagramUrl ?? ""),
    youtubeUrl: stripProtocol(profile.youtubeUrl ?? ""),
    linkedinUrl: stripProtocol(profile.linkedinUrl ?? ""),
    rssUrl: stripProtocol(profile.rssUrl ?? ""),
  }));
  const [socialOpen, setSocialOpen] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);
  const avatarUpload = useProfileImageUpload("avatarUrl", (url) =>
    onProfileUpdate({ avatarUrl: url }),
  );

  useEffect(() => {
    if (open && initialFocus === "bio") {
      // rAF: doi SimpleModal (Radix Dialog) mount + auto-focus mac dinh cua
      // no chay xong roi moi chiem lai focus, khong thi bi giat/ghi de.
      requestAnimationFrame(() => bioRef.current?.focus());
    }
  }, [open, initialFocus]);

  const errors = useMemo(() => {
    const e: Partial<Record<"displayName" | "username" | "website" | SocialKey, string>> = {};
    if (!displayName.trim()) e.displayName = "Không được để trống.";
    if (!username.trim()) {
      e.username = "Không được để trống.";
    } else if (!USERNAME_REGEX.test(username)) {
      e.username = "Chỉ gồm chữ thường, số, dấu chấm, gạch dưới (3-30 ký tự).";
    }
    if (website.trim() && !DOMAIN_REGEX.test(website.trim())) {
      e.website = "Đường dẫn không hợp lệ.";
    }
    for (const platform of SOCIAL_PLATFORMS) {
      const v = social[platform.key].trim();
      if (v && !DOMAIN_REGEX.test(v)) {
        e[platform.key] = "Đường dẫn không hợp lệ.";
      }
    }
    return e;
  }, [displayName, username, website, social]);
  const hasErrors = Object.keys(errors).length > 0;

  async function handleSave() {
    setTouched(true);
    if (hasErrors) return;
    setStatus("saving");
    setErrorMessage(null);
    const socialPatch = Object.fromEntries(
      SOCIAL_PLATFORMS.map(({ key }) => [
        key,
        social[key].trim() ? `https://${social[key].trim()}` : "",
      ]),
    ) as Record<SocialKey, string>;
    const patch = {
      displayName: displayName.trim(),
      username: username.trim(),
      bio,
      location,
      websiteUrl: website.trim() ? `https://${website.trim()}` : "",
      pronouns,
      role,
      ...socialPatch,
    };
    try {
      await updateProfileAction(patch);
      onProfileUpdate(patch);
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
            disabled={status === "saving" || (touched && hasErrors)}
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

        <FieldGroup
          label="Tên hiển thị"
          required
          counter={`${displayName.length}/50`}
          error={touched ? errors.displayName : undefined}
        >
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className={`${fieldClass} ${touched && errors.displayName ? fieldErrorClass : ""}`}
          />
        </FieldGroup>

        <FieldGroup
          label="Tên người dùng"
          required
          hint={touched && errors.username ? undefined : "Chỉ có thể đổi 1 lần mỗi 30 ngày."}
          error={touched ? errors.username : undefined}
        >
          <div className="flex items-center gap-1.5">
            <span className="flex h-10 shrink-0 items-center rounded-md border border-input-border bg-input-bg px-3 text-sm text-ink-faint">
              @
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              maxLength={30}
              className={`${fieldClass} ${touched && errors.username ? fieldErrorClass : ""}`}
            />
          </div>
        </FieldGroup>

        <FieldGroup label="Giới thiệu" counter={`${bio.length}/160`}>
          <textarea
            ref={bioRef}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            rows={3}
            className={`${fieldClass} h-auto resize-none py-2`}
          />
        </FieldGroup>

        <FieldGroup label="Vai trò">
          <IconField
            icon={Briefcase}
            value={role}
            onChange={setRole}
            placeholder="Software Engineer"
            maxLength={100}
          />
        </FieldGroup>

        <FieldGroup label="Nơi ở" hint="Gõ để xem gợi ý tỉnh/thành, hoặc tự nhập.">
          <IconField
            icon={MapPin}
            value={location}
            onChange={setLocation}
            placeholder="Hà Nội, Việt Nam"
            list="vn-provinces"
          />
          <datalist id="vn-provinces">
            {VN_PROVINCES.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </FieldGroup>

        <FieldGroup label="Đại từ nhân xưng">
          <PronounSelect
            value={pronouns}
            onChange={setPronouns}
            options={PRONOUN_OPTIONS}
            placeholder="Chọn đại từ nhân xưng"
          />
        </FieldGroup>

        <FieldGroup label="Website" error={touched ? errors.website : undefined}>
          <PrefixField
            prefix="https://"
            value={website}
            onChange={setWebsite}
            placeholder="tenmien.com"
            error={touched && !!errors.website}
          />
        </FieldGroup>

        <div className="rounded-md border border-border">
          <button
            type="button"
            onClick={() => setSocialOpen((v) => !v)}
            className="flex h-11 w-full cursor-pointer items-center gap-2.5 px-3 text-left text-sm font-medium text-ink"
          >
            <Share2 size={15} strokeWidth={1.8} className="shrink-0" />
            <span className="flex-1">Mạng xã hội</span>
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`shrink-0 text-ink-faint transition-transform duration-150 ${socialOpen ? "rotate-180" : ""}`}
            />
          </button>
          {socialOpen && (
            <div className="flex flex-col gap-4 border-t border-border p-3">
              {SOCIAL_PLATFORMS.map((platform) => (
                <FieldGroup
                  key={platform.key}
                  label={platform.label}
                  error={touched ? errors[platform.key] : undefined}
                >
                  <IconField
                    icon={platform.icon}
                    value={social[platform.key]}
                    onChange={(v) => setSocial((s) => ({ ...s, [platform.key]: v }))}
                    placeholder={platform.placeholder}
                    error={touched && !!errors[platform.key]}
                  />
                </FieldGroup>
              ))}
            </div>
          )}
        </div>
      </div>
    </SimpleModal>
  );
}
