"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  FileText,
  HelpCircle,
  Lightbulb,
  BarChart3,
  Image as ImageIcon,
  Images,
  Video,
  FileDown,
  Link2 as LinkIcon,
  BookOpen,
  Wrench,
  Code2,
  Rocket,
  Trophy,
  Target,
  FlaskConical,
  CalendarDays,
  Globe,
  ChevronDown,
  Check,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import { profile } from "@/content/user-profile";
import { addPost } from "@/lib/discover/feed-store";
import type { Post } from "@/content/home-feed-mock";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

// Loai bai co the tu soan qua composer - KHONG bao gom cac kind mang tinh
// "su kien he thong" tu dong sinh ra (career-update/skill-update/node-created/
// knowledge-block/timeline-event thuong den tu hanh dong that trong app,
// khong phai nguoi dung go tay).
type ComposableKind =
  | "text"
  | "question"
  | "idea"
  | "poll"
  | "image"
  | "gallery"
  | "video"
  | "file"
  | "link"
  | "resource"
  | "note"
  | "tutorial"
  | "code-snippet"
  | "project-update"
  | "achievement"
  | "milestone"
  | "experiment"
  | "event";

type TypeOption = { key: ComposableKind; label: string; icon: LucideIcon };

const TYPE_GROUPS: { label: string; types: TypeOption[] }[] = [
  {
    label: "Viết",
    types: [
      { key: "text", label: "Bài viết thường", icon: FileText },
      { key: "question", label: "Câu hỏi", icon: HelpCircle },
      { key: "idea", label: "Ý tưởng", icon: Lightbulb },
      { key: "poll", label: "Bình chọn", icon: BarChart3 },
    ],
  },
  {
    label: "Hình ảnh & video",
    types: [
      { key: "image", label: "Ảnh", icon: ImageIcon },
      { key: "gallery", label: "Nhiều ảnh", icon: Images },
      { key: "video", label: "Video", icon: Video },
    ],
  },
  {
    label: "Đính kèm",
    types: [
      { key: "file", label: "File / Tài liệu", icon: FileDown },
      { key: "link", label: "Link ngoài", icon: LinkIcon },
      { key: "resource", label: "Resource", icon: BookOpen },
    ],
  },
  {
    label: "Kiến thức",
    types: [
      { key: "note", label: "Knowledge Note", icon: FileText },
      { key: "tutorial", label: "Tutorial / Guide", icon: Wrench },
      { key: "code-snippet", label: "Code Snippet", icon: Code2 },
    ],
  },
  {
    label: "Cập nhật",
    types: [
      { key: "project-update", label: "Project Update", icon: Rocket },
      { key: "achievement", label: "Achievement", icon: Trophy },
      { key: "milestone", label: "Milestone", icon: Target },
      { key: "experiment", label: "Experiment", icon: FlaskConical },
      { key: "event", label: "Event / Announcement", icon: CalendarDays },
    ],
  },
];

const ALL_TYPES = TYPE_GROUPS.flatMap((g) => g.types);

const fieldInputClass =
  "h-8 min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 text-xs text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none";

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-ink-faint">{label}</span>
      {children}
    </label>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Lay 1 frame dau video lam thumbnail + thoi luong that - chi xu ly PHIA
// CLIENT tu file da chon (chua upload len dau ca), dung tam trong luc chua
// noi platform upload that (S3/Cloudinary/...). Khi noi that, thay ham nay
// bang goi API upload va lay URL/thumbnail tra ve tu server.
function captureVideoThumbnail(
  file: File,
): Promise<{ thumbnailUrl: string; duration: string }> {
  return new Promise((resolve, reject) => {
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.src = URL.createObjectURL(file);

    videoEl.addEventListener("loadedmetadata", () => {
      videoEl.currentTime = Math.min(0.1, videoEl.duration / 2);
    });
    videoEl.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Không lấy được canvas context"));
        return;
      }
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      resolve({
        thumbnailUrl: canvas.toDataURL("image/jpeg", 0.85),
        duration: formatDuration(videoEl.duration),
      });
      URL.revokeObjectURL(videoEl.src);
    });
    videoEl.addEventListener("error", () =>
      reject(new Error("Không đọc được video")),
    );
  });
}

// Nut upload dung chung cho Image/Gallery/Video/File - hien tai chi doc file
// CUC BO (object URL / metadata trinh duyet) de preview ngay, CHUA goi API
// upload that len server nao ca. Khi noi platform upload that, chi can thay
// phan onSelect() cua tung field ben duoi (gui file len, nhan URL tra ve).
function FileUploadButton({
  accept,
  multiple,
  disabled,
  label,
  icon: Icon,
  onSelect,
}: {
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  label: string;
  icon: LucideIcon;
  onSelect: (files: FileList) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onSelect(e.target.files);
          }
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-hover-border px-3 text-xs font-medium text-ink-muted transition-colors duration-150 ease-out hover:border-primary hover:bg-hover-bg hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon size={14} strokeWidth={1.75} />
        {label}
      </button>
    </>
  );
}

function RepeatableList({
  values,
  onChange,
  placeholder,
  max,
  min = 1,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  max?: number;
  min?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            value={v}
            onChange={(e) =>
              onChange(values.map((x, xi) => (xi === i ? e.target.value : x)))
            }
            placeholder={`${placeholder} ${i + 1}`}
            className={fieldInputClass}
          />
          {values.length > min && (
            <button
              type="button"
              onClick={() => onChange(values.filter((_, xi) => xi !== i))}
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-danger"
            >
              <X size={13} strokeWidth={1.75} />
            </button>
          )}
        </div>
      ))}
      {(!max || values.length < max) && (
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="flex h-7 w-fit cursor-pointer items-center gap-1 rounded-md px-1.5 text-xs font-medium text-primary transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          <Plus size={13} strokeWidth={1.75} />
          Thêm
        </button>
      )}
    </div>
  );
}

type FieldsState = {
  imageUrl: string;
  imageAlt: string;
  galleryUrls: string[];
  videoThumbnailUrl: string;
  videoDuration: string;
  fileName: string;
  fileExt: string;
  fileSize: string;
  linkDomain: string;
  linkTitle: string;
  linkDescription: string;
  resourceTitle: string;
  resourceKindLabel: string;
  resourceRating: string;
  noteTitle: string;
  noteTag: string;
  project: string;
  version: string;
  changes: string[];
  achievementTitle: string;
  achievementDescription: string;
  milestoneTitle: string;
  milestoneItems: { label: string; value: string }[];
  pollOptions: string[];
  tutorialTitle: string;
  tutorialDescription: string;
  steps: string;
  experimentTitle: string;
  hypothesis: string;
  result: string;
  eventTitle: string;
  when: string;
  location: string;
  language: string;
  snippetTitle: string;
};

const INITIAL_FIELDS: FieldsState = {
  imageUrl: "",
  imageAlt: "",
  galleryUrls: [],
  videoThumbnailUrl: "",
  videoDuration: "",
  fileName: "",
  fileExt: "",
  fileSize: "",
  linkDomain: "",
  linkTitle: "",
  linkDescription: "",
  resourceTitle: "",
  resourceKindLabel: "",
  resourceRating: "4.5",
  noteTitle: "",
  noteTag: "TIL",
  project: "",
  version: "v1.0",
  changes: [""],
  achievementTitle: "",
  achievementDescription: "",
  milestoneTitle: "",
  milestoneItems: [{ label: "", value: "" }],
  pollOptions: ["", ""],
  tutorialTitle: "",
  tutorialDescription: "",
  steps: "5",
  experimentTitle: "",
  hypothesis: "",
  result: "",
  eventTitle: "",
  when: "",
  location: "",
  language: "TypeScript",
  snippetTitle: "",
};

const PLACEHOLDER_BY_KIND: Partial<Record<ComposableKind, string>> = {
  text: "Bạn đã học được thêm điều gì hôm nay chưa?",
  question: "Đặt câu hỏi cho cộng đồng...",
  idea: "Chia sẻ 1 ý tưởng thoáng qua...",
  poll: "Câu hỏi bình chọn của bạn là gì?",
  image: "Chú thích cho ảnh (tuỳ chọn)...",
  gallery: "Chú thích cho album ảnh (tuỳ chọn)...",
  video: "Chú thích cho video (tuỳ chọn)...",
  file: "Chú thích cho tệp đính kèm (tuỳ chọn)...",
  link: "Cảm nhận của bạn về link này (tuỳ chọn)...",
  milestone: "Đôi lời về cột mốc này (tuỳ chọn)...",
  "code-snippet": "// Dán code vào đây",
};

// Icon/mau accent mac dinh cho cac kind can (link/resource/project-update/
// tutorial) - khong lam UI chon icon rieng de giu composer gon, dung 1 bo mac
// dinh hop ly theo tung loai.
const DEFAULT_ACCENT: Partial<
  Record<ComposableKind, { icon: LucideIcon; accent: string }>
> = {
  link: { icon: Globe, accent: "#38bdf8" },
  resource: { icon: BookOpen, accent: "#8b5cf6" },
  "project-update": { icon: Rocket, accent: "#0090e3" },
  tutorial: { icon: Wrench, accent: "#38bdf8" },
};

function buildPost(
  kind: ComposableKind,
  content: string,
  f: FieldsState,
): Post | null {
  const base = {
    id: `local-${Date.now()}`,
    author: {
      name: profile.name,
      username: profile.username,
      verified: false,
      avatarUrl: profile.avatarUrl,
    },
    timeAgo: "Vừa xong",
    stats: { likes: 0, comments: 0, reposts: 0 },
    following: true,
  };

  switch (kind) {
    case "text":
      if (!content.trim()) return null;
      return { ...base, kind: "text", content };
    case "question":
      if (!content.trim()) return null;
      return { ...base, kind: "question", content };
    case "idea":
      if (!content.trim()) return null;
      return { ...base, kind: "idea", content };
    case "poll": {
      const options = f.pollOptions.filter((o) => o.trim());
      if (!content.trim() || options.length < 2) return null;
      return {
        ...base,
        kind: "poll",
        question: content,
        options: options.map((label) => ({ label, votes: 0 })),
      };
    }
    case "image":
      if (!f.imageUrl.trim()) return null;
      return {
        ...base,
        kind: "image",
        content: content || undefined,
        image: { url: f.imageUrl, alt: f.imageAlt || "Ảnh đính kèm" },
      };
    case "gallery": {
      const urls = f.galleryUrls.filter((u) => u.trim());
      if (urls.length < 1) return null;
      return {
        ...base,
        kind: "gallery",
        content: content || undefined,
        images: urls.map((url, i) => ({ url, alt: `Ảnh ${i + 1}` })),
      };
    }
    case "video":
      if (!f.videoThumbnailUrl.trim()) return null;
      return {
        ...base,
        kind: "video",
        content: content || undefined,
        video: {
          thumbnailUrl: f.videoThumbnailUrl,
          duration: f.videoDuration || "0:00",
        },
      };
    case "file":
      if (!f.fileName.trim()) return null;
      return {
        ...base,
        kind: "file",
        content: content || undefined,
        file: {
          name: f.fileName,
          ext: f.fileExt || "FILE",
          size: f.fileSize || "—",
        },
      };
    case "link":
      if (!f.linkTitle.trim() || !f.linkDomain.trim()) return null;
      return {
        ...base,
        kind: "link",
        content: content || undefined,
        link: {
          domain: f.linkDomain,
          title: f.linkTitle,
          description: f.linkDescription,
          ...(DEFAULT_ACCENT.link ?? { icon: Globe, accent: "#38bdf8" }),
        },
      };
    case "resource":
      if (!f.resourceTitle.trim()) return null;
      return {
        ...base,
        kind: "resource",
        content: content || undefined,
        resource: {
          title: f.resourceTitle,
          kindLabel: f.resourceKindLabel || "Tài liệu",
          rating: Number(f.resourceRating) || 0,
          ...(DEFAULT_ACCENT.resource ?? { icon: BookOpen, accent: "#8b5cf6" }),
        },
      };
    case "note":
      if (!f.noteTitle.trim() || !content.trim()) return null;
      return {
        ...base,
        kind: "note",
        title: f.noteTitle,
        content,
        tag: f.noteTag || "TIL",
      };
    case "tutorial":
      if (!f.tutorialTitle.trim()) return null;
      return {
        ...base,
        kind: "tutorial",
        title: f.tutorialTitle,
        description: f.tutorialDescription,
        steps: Number(f.steps) || 1,
        ...(DEFAULT_ACCENT.tutorial ?? { icon: Wrench, accent: "#38bdf8" }),
      };
    case "code-snippet":
      if (!content.trim()) return null;
      return {
        ...base,
        kind: "code-snippet",
        language: f.language || "Plain text",
        title: f.snippetTitle || undefined,
        code: content,
      };
    case "project-update": {
      const changes = f.changes.filter((c) => c.trim());
      if (!f.project.trim() || changes.length === 0) return null;
      return {
        ...base,
        kind: "project-update",
        project: f.project,
        version: f.version || "v1.0",
        changes,
        ...(DEFAULT_ACCENT["project-update"] ?? {
          icon: Rocket,
          accent: "#0090e3",
        }),
      };
    }
    case "achievement":
      if (!f.achievementTitle.trim()) return null;
      return {
        ...base,
        kind: "achievement",
        title: f.achievementTitle,
        description: f.achievementDescription,
        icon: Trophy,
        accent: "#f59e0b",
      };
    case "milestone": {
      const items = f.milestoneItems.filter(
        (i) => i.label.trim() && i.value.trim(),
      );
      if (!f.milestoneTitle.trim() || items.length === 0) return null;
      return {
        ...base,
        kind: "milestone",
        content: content || undefined,
        title: f.milestoneTitle,
        items,
      };
    }
    case "experiment":
      if (!f.experimentTitle.trim() || !f.result.trim()) return null;
      return {
        ...base,
        kind: "experiment",
        title: f.experimentTitle,
        hypothesis: f.hypothesis,
        result: f.result,
      };
    case "event":
      if (!f.eventTitle.trim() || !f.when.trim()) return null;
      return {
        ...base,
        kind: "event",
        title: f.eventTitle,
        when: f.when,
        location: f.location || undefined,
      };
  }
}

// O soan bai dang tren cung feed - dat trong layout dung chung cua 3 tab
// (For you/Following/Trending) nen KHONG bi remount khi chuyen tab. "Post"
// dung addPost() (lib/discover/feed-store.ts) de day bai moi len dau feed -
// 3 trang doc chung 1 store qua useSyncExternalStore nen thay ngay lap tuc.
const PostComposer = () => {
  const [content, setContent] = useState("");
  const [activeKind, setActiveKind] = useState<ComposableKind>("text");
  const [fields, setFields] = useState<FieldsState>(INITIAL_FIELDS);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [videoProcessing, setVideoProcessing] = useState(false);

  const setField = <K extends keyof FieldsState>(
    key: K,
    value: FieldsState[K],
  ) => setFields((f) => ({ ...f, [key]: value }));

  const activeType = ALL_TYPES.find((t) => t.key === activeKind)!;
  const draft = buildPost(activeKind, content, fields);

  const handlePost = () => {
    if (!draft) return;
    addPost(draft);
    setContent("");
    setFields(INITIAL_FIELDS);
    setActiveKind("text");
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <Image
          src={profile.avatarUrl}
          alt={profile.name}
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover"
        />
        {activeKind === "code-snippet" ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={PLACEHOLDER_BY_KIND[activeKind]}
            rows={4}
            className="min-h-22 min-w-0 flex-1 resize-none bg-transparent font-mono text-xs text-ink placeholder:text-ink-faint focus:outline-none"
          />
        ) : (
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              PLACEHOLDER_BY_KIND[activeKind] ?? "Bạn muốn chia sẻ điều gì?"
            }
            className="h-9 min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        )}
      </div>

      {/* Form rieng theo tung kind - fade nhe khi doi loai de cam giac muot,
          khong giat cuc bo. */}
      <div
        key={activeKind}
        className="mt-3 animate-[compose-fade-in_0.15s_ease-out] pl-12"
      >
        {activeKind === "poll" && (
          <RepeatableList
            values={fields.pollOptions}
            onChange={(v) => setField("pollOptions", v)}
            placeholder="Lựa chọn"
            max={4}
            min={2}
          />
        )}

        {activeKind === "image" && (
          <div className="flex flex-col gap-2">
            {fields.imageUrl ? (
              <div className="relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element -- preview cuc bo tu file vua chon (blob:/data: URL), next/image khong toi uu duoc nguon nay */}
                <img
                  src={fields.imageUrl}
                  alt="Xem trước ảnh"
                  className="max-h-48 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setField("imageUrl", "")}
                  className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-faint transition-colors duration-150 ease-out hover:text-danger"
                >
                  <X size={13} strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <FileUploadButton
                accept="image/*"
                label="Tải ảnh lên"
                icon={ImageIcon}
                onSelect={(files) =>
                  setField("imageUrl", URL.createObjectURL(files[0]))
                }
              />
            )}
            <FieldRow label="Mô tả ảnh (alt)">
              <input
                value={fields.imageAlt}
                onChange={(e) => setField("imageAlt", e.target.value)}
                placeholder="Screenshot dashboard..."
                className={fieldInputClass}
              />
            </FieldRow>
          </div>
        )}

        {activeKind === "gallery" && (
          <div className="flex flex-col gap-2">
            {fields.galleryUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {fields.galleryUrls.map((url) => (
                  <div key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- preview cuc bo tu file vua chon */}
                    <img
                      src={url}
                      alt="Xem trước ảnh"
                      className="size-20 rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setField(
                          "galleryUrls",
                          fields.galleryUrls.filter((u) => u !== url),
                        )
                      }
                      className="absolute -top-1.5 -right-1.5 flex size-5 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-faint transition-colors duration-150 ease-out hover:text-danger"
                    >
                      <X size={11} strokeWidth={1.75} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {fields.galleryUrls.length < 4 && (
              <FileUploadButton
                accept="image/*"
                multiple
                label={`Tải ảnh lên (tối đa 4)`}
                icon={Images}
                onSelect={(files) => {
                  const room = 4 - fields.galleryUrls.length;
                  const added = Array.from(files)
                    .slice(0, room)
                    .map((file) => URL.createObjectURL(file));
                  setField("galleryUrls", [...fields.galleryUrls, ...added]);
                }}
              />
            )}
          </div>
        )}

        {activeKind === "video" && (
          <div className="flex flex-col gap-2">
            {fields.videoThumbnailUrl ? (
              <div className="relative w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail sinh tu canvas cuc bo (data: URL) */}
                <img
                  src={fields.videoThumbnailUrl}
                  alt="Xem trước video"
                  className="max-h-48 rounded-lg border border-border object-cover"
                />
                <span className="absolute right-1.5 bottom-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  {fields.videoDuration}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setField("videoThumbnailUrl", "");
                    setField("videoDuration", "");
                  }}
                  className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink-faint transition-colors duration-150 ease-out hover:text-danger"
                >
                  <X size={13} strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <FileUploadButton
                accept="video/*"
                disabled={videoProcessing}
                label={
                  videoProcessing ? "Đang xử lý video..." : "Tải video lên"
                }
                icon={Video}
                onSelect={async (files) => {
                  setVideoProcessing(true);
                  try {
                    const { thumbnailUrl, duration } =
                      await captureVideoThumbnail(files[0]);
                    setField("videoThumbnailUrl", thumbnailUrl);
                    setField("videoDuration", duration);
                  } catch {
                    // im lang, nguoi dung co the thu lai voi file khac
                  } finally {
                    setVideoProcessing(false);
                  }
                }}
              />
            )}
          </div>
        )}

        {activeKind === "file" && (
          <div className="flex flex-col gap-2">
            {fields.fileName ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-muted p-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-danger/10 text-[10px] font-bold text-danger">
                  {fields.fileExt || "FILE"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink">
                    {fields.fileName}
                  </p>
                  <p className="text-[11px] text-ink-faint">
                    {fields.fileSize}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setField("fileName", "");
                    setField("fileExt", "");
                    setField("fileSize", "");
                  }}
                  className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-danger"
                >
                  <X size={13} strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <FileUploadButton
                accept="*/*"
                label="Tải tệp lên"
                icon={FileDown}
                onSelect={(files) => {
                  const file = files[0];
                  const ext = file.name.includes(".")
                    ? file.name.split(".").pop()!.toUpperCase()
                    : "FILE";
                  setField("fileName", file.name);
                  setField("fileExt", ext);
                  setField("fileSize", formatBytes(file.size));
                }}
              />
            )}
          </div>
        )}

        {activeKind === "link" && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="Domain">
                <input
                  value={fields.linkDomain}
                  onChange={(e) => setField("linkDomain", e.target.value)}
                  placeholder="example.com"
                  className={fieldInputClass}
                />
              </FieldRow>
              <FieldRow label="Tiêu đề">
                <input
                  value={fields.linkTitle}
                  onChange={(e) => setField("linkTitle", e.target.value)}
                  placeholder="Tiêu đề trang"
                  className={fieldInputClass}
                />
              </FieldRow>
            </div>
            <FieldRow label="Mô tả">
              <input
                value={fields.linkDescription}
                onChange={(e) => setField("linkDescription", e.target.value)}
                placeholder="Mô tả ngắn..."
                className={fieldInputClass}
              />
            </FieldRow>
          </div>
        )}

        {activeKind === "resource" && (
          <div className="grid grid-cols-3 gap-2">
            <FieldRow label="Tên resource">
              <input
                value={fields.resourceTitle}
                onChange={(e) => setField("resourceTitle", e.target.value)}
                placeholder="Clean Architecture.pdf"
                className={fieldInputClass}
              />
            </FieldRow>
            <FieldRow label="Loại">
              <input
                value={fields.resourceKindLabel}
                onChange={(e) => setField("resourceKindLabel", e.target.value)}
                placeholder="Ebook · 420 trang"
                className={fieldInputClass}
              />
            </FieldRow>
            <FieldRow label="Đánh giá">
              <input
                value={fields.resourceRating}
                onChange={(e) => setField("resourceRating", e.target.value)}
                placeholder="4.8"
                className={fieldInputClass}
              />
            </FieldRow>
          </div>
        )}

        {activeKind === "note" && (
          <div className="grid grid-cols-3 gap-2">
            <FieldRow label="Tiêu đề (headline)">
              <input
                value={fields.noteTitle}
                onChange={(e) => setField("noteTitle", e.target.value)}
                placeholder="React.memo không phải lúc nào..."
                className={`${fieldInputClass} col-span-2`}
              />
            </FieldRow>
            <FieldRow label="Nhãn">
              <input
                value={fields.noteTag}
                onChange={(e) => setField("noteTag", e.target.value)}
                placeholder="TIL"
                className={fieldInputClass}
              />
            </FieldRow>
          </div>
        )}

        {activeKind === "tutorial" && (
          <div className="grid grid-cols-3 gap-2">
            <FieldRow label="Tiêu đề">
              <input
                value={fields.tutorialTitle}
                onChange={(e) => setField("tutorialTitle", e.target.value)}
                placeholder="Setup CI/CD với GitHub Actions"
                className={`${fieldInputClass} col-span-2`}
              />
            </FieldRow>
            <FieldRow label="Số bước">
              <input
                value={fields.steps}
                onChange={(e) => setField("steps", e.target.value)}
                placeholder="7"
                className={fieldInputClass}
              />
            </FieldRow>
            <FieldRow label="Mô tả">
              <input
                value={fields.tutorialDescription}
                onChange={(e) =>
                  setField("tutorialDescription", e.target.value)
                }
                placeholder="Hướng dẫn từng bước..."
                className={`${fieldInputClass} col-span-3`}
              />
            </FieldRow>
          </div>
        )}

        {activeKind === "code-snippet" && (
          <div className="grid grid-cols-2 gap-2">
            <FieldRow label="Ngôn ngữ">
              <input
                value={fields.language}
                onChange={(e) => setField("language", e.target.value)}
                placeholder="TypeScript"
                className={fieldInputClass}
              />
            </FieldRow>
            <FieldRow label="Tiêu đề (tuỳ chọn)">
              <input
                value={fields.snippetTitle}
                onChange={(e) => setField("snippetTitle", e.target.value)}
                placeholder="Debounce hook"
                className={fieldInputClass}
              />
            </FieldRow>
          </div>
        )}

        {activeKind === "project-update" && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="Tên project">
                <input
                  value={fields.project}
                  onChange={(e) => setField("project", e.target.value)}
                  placeholder="CareerTree"
                  className={fieldInputClass}
                />
              </FieldRow>
              <FieldRow label="Version">
                <input
                  value={fields.version}
                  onChange={(e) => setField("version", e.target.value)}
                  placeholder="v0.4"
                  className={fieldInputClass}
                />
              </FieldRow>
            </div>
            <FieldRow label="Thay đổi">
              <RepeatableList
                values={fields.changes}
                onChange={(v) => setField("changes", v)}
                placeholder="Tính năng"
                max={6}
              />
            </FieldRow>
          </div>
        )}

        {activeKind === "achievement" && (
          <div className="grid grid-cols-2 gap-2">
            <FieldRow label="Thành tích">
              <input
                value={fields.achievementTitle}
                onChange={(e) => setField("achievementTitle", e.target.value)}
                placeholder="Reached Top 1%"
                className={fieldInputClass}
              />
            </FieldRow>
            <FieldRow label="Mô tả">
              <input
                value={fields.achievementDescription}
                onChange={(e) =>
                  setField("achievementDescription", e.target.value)
                }
                placeholder="Completed System Design"
                className={fieldInputClass}
              />
            </FieldRow>
          </div>
        )}

        {activeKind === "milestone" && (
          <div className="flex flex-col gap-2">
            <FieldRow label="Tiêu đề cột mốc">
              <input
                value={fields.milestoneTitle}
                onChange={(e) => setField("milestoneTitle", e.target.value)}
                placeholder="100 ngày học liên tục"
                className={fieldInputClass}
              />
            </FieldRow>
            <div className="flex flex-col gap-1.5">
              {fields.milestoneItems.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <input
                    value={item.value}
                    onChange={(e) =>
                      setField(
                        "milestoneItems",
                        fields.milestoneItems.map((it, xi) =>
                          xi === i ? { ...it, value: e.target.value } : it,
                        ),
                      )
                    }
                    placeholder="100"
                    className={`${fieldInputClass} max-w-20`}
                  />
                  <input
                    value={item.label}
                    onChange={(e) =>
                      setField(
                        "milestoneItems",
                        fields.milestoneItems.map((it, xi) =>
                          xi === i ? { ...it, label: e.target.value } : it,
                        ),
                      )
                    }
                    placeholder="Ngày học"
                    className={fieldInputClass}
                  />
                  {fields.milestoneItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setField(
                          "milestoneItems",
                          fields.milestoneItems.filter((_, xi) => xi !== i),
                        )
                      }
                      className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-faint transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-danger"
                    >
                      <X size={13} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              ))}
              {fields.milestoneItems.length < 3 && (
                <button
                  type="button"
                  onClick={() =>
                    setField("milestoneItems", [
                      ...fields.milestoneItems,
                      { label: "", value: "" },
                    ])
                  }
                  className="flex h-7 w-fit cursor-pointer items-center gap-1 rounded-md px-1.5 text-xs font-medium text-primary transition-colors duration-150 ease-out hover:bg-hover-bg"
                >
                  <Plus size={13} strokeWidth={1.75} />
                  Thêm số liệu
                </button>
              )}
            </div>
          </div>
        )}

        {activeKind === "experiment" && (
          <div className="flex flex-col gap-2">
            <FieldRow label="Tiêu đề thí nghiệm">
              <input
                value={fields.experimentTitle}
                onChange={(e) => setField("experimentTitle", e.target.value)}
                placeholder="So sánh cold start: Lambda vs Cloud Run"
                className={fieldInputClass}
              />
            </FieldRow>
            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="Giả thuyết">
                <input
                  value={fields.hypothesis}
                  onChange={(e) => setField("hypothesis", e.target.value)}
                  placeholder="Giả thuyết ban đầu..."
                  className={fieldInputClass}
                />
              </FieldRow>
              <FieldRow label="Kết quả">
                <input
                  value={fields.result}
                  onChange={(e) => setField("result", e.target.value)}
                  placeholder="Kết quả đo được..."
                  className={fieldInputClass}
                />
              </FieldRow>
            </div>
          </div>
        )}

        {activeKind === "event" && (
          <div className="flex flex-col gap-2">
            <FieldRow label="Tên sự kiện">
              <input
                value={fields.eventTitle}
                onChange={(e) => setField("eventTitle", e.target.value)}
                placeholder="CareerTree Meetup #3"
                className={fieldInputClass}
              />
            </FieldRow>
            <div className="grid grid-cols-2 gap-2">
              <FieldRow label="Thời gian">
                <input
                  value={fields.when}
                  onChange={(e) => setField("when", e.target.value)}
                  placeholder="Thứ 7, 20/07 · 14:00"
                  className={fieldInputClass}
                />
              </FieldRow>
              <FieldRow label="Địa điểm (tuỳ chọn)">
                <input
                  value={fields.location}
                  onChange={(e) => setField("location", e.target.value)}
                  placeholder="Online qua Google Meet"
                  className={fieldInputClass}
                />
              </FieldRow>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <PopoverRoot open={typeMenuOpen} onOpenChange={setTypeMenuOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors duration-150 ease-out ${
                typeMenuOpen
                  ? "border-outline-border bg-outline-bg text-primary"
                  : "border-border text-ink-muted hover:bg-hover-bg"
              }`}
            >
              <activeType.icon size={14} strokeWidth={1.75} />
              {activeType.label}
              <ChevronDown size={13} strokeWidth={1.75} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            open={typeMenuOpen}
            align="start"
            className="z-50 max-h-96 w-64 overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-dropdown"
          >
            {TYPE_GROUPS.map((group) => (
              <div key={group.label} className="mb-1 last:mb-0">
                <p className="px-2 py-1 text-[10px] font-semibold tracking-wide text-ink-faint uppercase">
                  {group.label}
                </p>
                {group.types.map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => {
                      setActiveKind(type.key);
                      setTypeMenuOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
                  >
                    <type.icon
                      size={15}
                      strokeWidth={1.75}
                      className="shrink-0 text-ink-faint"
                    />
                    <span className="flex-1 truncate">{type.label}</span>
                    {activeKind === type.key && (
                      <Check
                        size={14}
                        strokeWidth={2}
                        className="shrink-0 text-primary"
                      />
                    )}
                  </button>
                ))}
              </div>
            ))}
          </PopoverContent>
        </PopoverRoot>

        <div className="flex-1" />

        <button
          type="button"
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-ink-muted hover:bg-hover-bg"
        >
          <Globe size={13} strokeWidth={1.75} />
          Everyone
          <ChevronDown size={13} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          disabled={!draft}
          onClick={handlePost}
          className="flex h-8 shrink-0 cursor-pointer items-center rounded-md bg-button-primary-bg px-3.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-button-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default PostComposer;
