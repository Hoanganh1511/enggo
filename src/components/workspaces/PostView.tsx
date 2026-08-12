"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Eye,
  Pencil,
  Pin,
  PinOff,
  Share2,
  Rocket,
  Trash2,
  Check,
  List,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { ApiDocument } from "@/lib/api/types";
import { formatRelativeTime } from "@/lib/format-time";
import { formatCompact } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { deleteDocumentAction } from "@/actions/documents/delete-document";
import { togglePinDocumentAction } from "@/actions/documents/toggle-pin-document";
import { shareDocumentAction } from "@/actions/documents/share-document";
import { getPostExtensions, POST_PROSE_CLASS } from "./post-extensions";

type TocItem = { id: string; text: string; level: number };

// Trang doc bai viet (read-only) - render Tiptap JSON giong het editor (cung
// bo extension) + muc luc TU DONG sinh tu cac heading. Chu so huu thay them
// nut Sua / Ghim / Xoa / Dang len bang tin; ai cung thay nut Sao chep link.
export function PostView({ document: doc }: { document: ApiDocument }) {
  const router = useRouter();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [pinned, setPinned] = useState(doc.isPinned);
  const [shared, setShared] = useState(false);
  const [, startTransition] = useTransition();

  const editor = useEditor({
    extensions: getPostExtensions(),
    content: doc.content,
    editable: false,
    immediatelyRender: false,
    editorProps: { attributes: { class: POST_PROSE_CLASS } },
  });

  // Sau khi render xong: gan id cho moi heading (h1/h2/h3) + sinh muc luc.
  useEffect(() => {
    if (!editor) return;
    const root = bodyRef.current;
    if (!root) return;
    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(
        ".ProseMirror h1, .ProseMirror h2, .ProseMirror h3",
      ),
    );
    const items: TocItem[] = nodes.map((el, i) => {
      const id = `h-${i}-${(el.textContent ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 40)}`;
      el.id = id;
      el.style.scrollMarginTop = "80px";
      return {
        id,
        text: el.textContent ?? "",
        level: Number(el.tagName.slice(1)),
      };
    });
    setToc(items);
  }, [editor, doc.content]);

  // Scroll-spy: highlight muc luc theo heading DANG trong view. Chon heading
  // cuoi cung co mep tren da vuot qua nguong ~100px tinh tu dinh viewport
  // (nghia la phan dang doc). Dung getBoundingClientRect (theo viewport) +
  // lang nghe scroll o capture-phase tren window de bat duoc CA scroll tu
  // container long ben trong (scroll event khong bubble nhung propagate o
  // capture phase) - khong can biet truoc phan tu nao that su cuon.
  useEffect(() => {
    if (toc.length === 0) return;
    const els = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const compute = () => {
      const threshold = 100;
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top - threshold <= 0) current = el.id;
        else break;
      }
      setActiveId(current);
    };

    compute();
    window.addEventListener("scroll", compute, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute, { capture: true });
      window.removeEventListener("resize", compute);
    };
  }, [toc]);

  const dateLabel = useMemo(
    () => formatRelativeTime(doc.updatedAt),
    [doc.updatedAt],
  );

  function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function togglePin() {
    startTransition(async () => {
      const next = !pinned;
      setPinned(next);
      await togglePinDocumentAction(doc.id, doc.author.username, next);
    });
  }

  function remove() {
    if (!window.confirm("Xóa bài viết này? Không thể hoàn tác.")) return;
    startTransition(async () => {
      await deleteDocumentAction(doc.id, doc.author.username);
      router.push(`/u/${doc.author.username}/workspaces`);
    });
  }

  function shareToFeed() {
    startTransition(async () => {
      await shareDocumentAction(doc.id);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    });
  }

  return (
    <div className="mx-auto w-full  px-4 py-8">
      <div className="flex gap-10">
        <article className="min-w-0 flex-1">
          {/* Cover */}
          {doc.coverImageUrl && (
            <div className="mb-6 h-64 w-full overflow-hidden rounded-2xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.coverImageUrl}
                alt=""
                className="size-full object-cover"
              />
            </div>
          )}

          {/* Draft badge */}
          {!doc.isPublished && (
            <span className="mb-3 inline-block rounded-full bg-warning/15 px-2.5 py-1 text-xs font-semibold text-warning">
              Bản nháp — chỉ bạn thấy
            </span>
          )}

          <h1 className="text-[36px] leading-[1.15] font-bold tracking-tight text-ink">
            {doc.title}
          </h1>
          {doc.summary && (
            <p className="mt-3 text-lg leading-relaxed text-ink-muted">
              {doc.summary}
            </p>
          )}

          {/* Author + meta */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-5">
            <Link
              href={`/u/${doc.author.username}`}
              className="flex items-center gap-2.5"
            >
              <Image
                src={doc.author.avatarUrl}
                alt={doc.author.name}
                width={36}
                height={36}
                className="size-9 rounded-full object-cover"
              />
              <span className="flex items-center gap-1 text-sm font-semibold text-ink hover:underline">
                {doc.author.name}
                {doc.author.verified && (
                  <BadgeCheck
                    size={14}
                    strokeWidth={2.25}
                    className="text-primary"
                  />
                )}
              </span>
            </Link>
            <span className="text-sm text-ink-faint">{dateLabel}</span>
            <span className="flex items-center gap-1 text-sm text-ink-faint">
              <Eye size={14} strokeWidth={2} />
              {formatCompact(doc.viewCount)} lượt xem
            </span>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={share}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-ink-muted hover:bg-hover-bg"
              >
                {copied ? (
                  <Check size={13} strokeWidth={2.5} />
                ) : (
                  <Share2 size={13} strokeWidth={2} />
                )}
                {copied ? "Đã sao chép link" : "Sao chép link"}
              </button>
              {doc.isOwner && (
                <>
                  <button
                    type="button"
                    onClick={shareToFeed}
                    title="Đăng bài viết này lên bảng tin khám phá"
                    className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-ink-muted hover:bg-hover-bg"
                  >
                    {shared ? (
                      <Check size={13} strokeWidth={2.5} />
                    ) : (
                      <Rocket size={13} strokeWidth={2} />
                    )}
                    {shared ? "Đã đăng" : "Đăng lên bảng tin"}
                  </button>
                  <button
                    type="button"
                    onClick={togglePin}
                    title={pinned ? "Bỏ ghim" : "Ghim lên đầu hồ sơ"}
                    className={cn(
                      "flex size-8 cursor-pointer items-center justify-center rounded-full border transition-colors duration-150 ease-out",
                      pinned
                        ? "border-community-accent/30 bg-community-accent/10 text-community-accent"
                        : "border-border text-ink-muted hover:bg-hover-bg",
                    )}
                  >
                    {pinned ? (
                      <PinOff size={14} strokeWidth={2} />
                    ) : (
                      <Pin size={14} strokeWidth={2} />
                    )}
                  </button>
                  <Link
                    href={`/u/${doc.author.username}/workspaces/${doc.slug}/edit`}
                    className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-ink-muted hover:bg-hover-bg"
                  >
                    <Pencil size={13} strokeWidth={2} />
                    Sửa
                  </Link>
                  <button
                    type="button"
                    onClick={remove}
                    title="Xóa"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border text-ink-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tags */}
          {doc.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Body */}
          <div ref={bodyRef} className="mt-6">
            <EditorContent editor={editor} />
          </div>
        </article>

        {/* TOC - chi hien tren man rong, sticky */}
        {toc.length > 1 && (
          <aside className="hidden w-56 shrink-0 xl:block">
            <div className="sticky top-6">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-ink-faint uppercase">
                <List size={13} strokeWidth={2.25} />
                Mục lục
              </p>
              <nav className="flex flex-col gap-1.5 border-l border-border">
                {toc.map((item) => {
                  const active = activeId === item.id;
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(item.id)?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                        setActiveId(item.id);
                      }}
                      className={cn(
                        "-ml-px border-l-2 py-0.5 text-sm transition-colors duration-150 ease-out",
                        active
                          ? "border-community-accent font-medium text-community-accent"
                          : "border-transparent text-ink-muted hover:border-community-accent/50 hover:text-ink",
                        item.level === 1
                          ? "pl-3 font-medium"
                          : item.level === 2
                            ? "pl-5"
                            : "pl-7 text-[13px]",
                      )}
                    >
                      {item.text}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
