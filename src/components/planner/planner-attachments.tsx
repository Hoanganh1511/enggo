"use client";

// [2026-10-12] Dinh kem PlannerItem <-> Series (hoac 1 Entry cu the trong
// Series) - yeu cau nguoi dung: "Bổ sung tính năng đính kèm các thứ vào
// task, chẳng hạn như các series". Pham vi da CHOT qua AskUserQuestion: CHI
// Series (chua ho tro link ngoai/file/post rieng), NHIEU dinh kem/task, hien
// dang danh sach trong panel chi tiet (khong phai form tao/sua - dinh kem
// chi co nghia khi item da ton tai, can `itemId` that tu server).
//
// Tai RIENG (lazy, khi panel chi tiet mo) - KHONG nam trong PlannerItem
// chinh, xem lib/api/planner.ts.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Paperclip, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  listPlannerItemAttachmentsAction,
  addPlannerItemAttachmentAction,
  removePlannerItemAttachmentAction,
} from "@/actions/planner/planner";
import { listContentSeriesAction } from "@/actions/discover/content-series/list-content-series";
import type { PlannerItemAttachment } from "@/lib/api/planner";
import type { ContentSeriesListItem } from "@/lib/api/content-series";
import { PlannerInlineError } from "./planner-states";

export function AttachmentsSection({ itemId }: { itemId: string }) {
  // `loaded` giu CA itemId cua lan fetch cuoi - `attachments` DAN XUAT tu no
  // (null khi itemId doi nhung chua fetch xong cho item MOI). Tranh goi
  // setState() dong bo ngay trong than effect (react-hooks/set-state-in-effect)
  // kieu `setAttachments(null)` truoc khi fetch - thay vi 1 state rieng
  // "dang tai", so sanh itemId la du de biet du lieu hien co co KHOP voi
  // item dang xem hay khong.
  const [loaded, setLoaded] = useState<{
    itemId: string;
    rows: PlannerItemAttachment[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const attachments = loaded?.itemId === itemId ? loaded.rows : null;

  useEffect(() => {
    let cancelled = false;
    listPlannerItemAttachmentsAction(itemId)
      .then((rows) => {
        if (!cancelled) setLoaded({ itemId, rows });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Không tải được đính kèm.");
          setLoaded({ itemId, rows: [] });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [itemId]);

  async function handleAdd(seriesId: string, entryId?: string) {
    setError(null);
    try {
      const row = await addPlannerItemAttachmentAction(itemId, { seriesId, entryId });
      setLoaded((prev) => ({
        itemId,
        rows: [...(prev?.itemId === itemId ? prev.rows : []), row],
      }));
      setPickerOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đính kèm được.");
    }
  }

  async function handleRemove(attachmentId: string) {
    setError(null);
    setRemovingId(attachmentId);
    try {
      await removePlannerItemAttachmentAction(itemId, attachmentId);
      setLoaded((prev) => ({
        itemId,
        rows: (prev?.itemId === itemId ? prev.rows : []).filter(
          (a) => a.id !== attachmentId,
        ),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gỡ được đính kèm.");
    } finally {
      setRemovingId(null);
    }
  }

  // Dang tai LAN DAU: giu im lang (khong skeleton rieng) - phan lon item
  // khong co dinh kem, hien 1 khung rong roi tu lap day ngay sau fetch se it
  // giat hon la ve skeleton roi bien mat.
  if (attachments === null) return null;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[.02em] text-[color:var(--planner-text-muted)] uppercase">
          <Paperclip size={12} aria-hidden="true" />
          Đính kèm
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={pickerOpen}
            aria-label="Đính kèm Series"
            className="flex size-5 cursor-pointer items-center justify-center rounded-[5px] text-[color:var(--planner-text-muted)] hover:bg-[color:var(--planner-surface-soft)]"
          >
            <Plus size={12} />
          </button>
          {pickerOpen && (
            <SeriesPicker
              onPick={handleAdd}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>
      </div>

      {error && <PlannerInlineError message={error} />}

      {attachments.length === 0 ? (
        <p className="text-[11px] leading-[1.5] text-[color:var(--planner-text-muted)]">
          Chưa có đính kèm nào.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {attachments.map((a) => (
            <AttachmentRow
              key={a.id}
              attachment={a}
              removing={removingId === a.id}
              onRemove={() => void handleRemove(a.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function AttachmentRow({
  attachment,
  removing,
  onRemove,
}: {
  attachment: PlannerItemAttachment;
  removing: boolean;
  onRemove: () => void;
}) {
  const href = attachment.entrySlug
    ? `/series/${attachment.seriesSlug}/${attachment.entrySlug}`
    : `/series/${attachment.seriesSlug}`;
  const title = attachment.entryTitle ?? attachment.seriesTitle;

  return (
    <li className="group flex min-w-0 items-center gap-2 rounded-[8px] border border-[color:var(--planner-border-soft)] bg-[color:var(--planner-surface-soft)] px-2 py-1.5">
      {attachment.seriesCoverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- thumbnail nho, khong can next/image cho 1 anh 24px trong popover.
        <img
          src={attachment.seriesCoverImageUrl}
          alt=""
          className="size-6 shrink-0 rounded-[5px] object-cover"
        />
      ) : (
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-[5px] bg-[color:var(--planner-surface)] text-[color:var(--planner-text-muted)]"
          aria-hidden="true"
        >
          <Paperclip size={11} />
        </span>
      )}

      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1 text-[12px] leading-[1.35] hover:underline"
        title={title}
      >
        <span className="block truncate font-medium text-[color:var(--planner-text-primary)]">
          {title}
        </span>
        {/* Dinh kem 1 ENTRY cu the - noi them ten Series cha de biet entry nay
            thuoc chuoi noi dung nao, khong chi 1 cai ten bai troi tro. */}
        {attachment.entrySlug && (
          <span className="block truncate text-[10.5px] text-[color:var(--planner-text-muted)]">
            {attachment.seriesTitle}
          </span>
        )}
      </Link>

      <button
        type="button"
        onClick={onRemove}
        disabled={removing}
        aria-label={`Gỡ đính kèm "${title}"`}
        className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[5px] text-[color:var(--planner-text-muted)] opacity-0 group-hover:opacity-100 hover:bg-[color:var(--planner-surface)] hover:text-[color:var(--mset-danger)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {removing ? (
          <Loader2 size={11} className="animate-spin" aria-hidden="true" />
        ) : (
          <X size={11} />
        )}
      </button>
    </li>
  );
}

/**
 * Popover chon Series (hoac 1 Entry cu the trong Series) de dinh kem.
 *
 * Cung pattern voi PlannerCreateMenu (PlannerShell.tsx): bam ra ngoai /
 * Escape thi dong.
 */
function SeriesPicker({
  onPick,
  onClose,
}: {
  onPick: (seriesId: string, entryId?: string) => void;
  onClose: () => void;
}) {
  const [series, setSeries] = useState<ContentSeriesListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listContentSeriesAction()
      .then(setSeries)
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Không tải được danh sách Series."),
      );
  }, []);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const filtered = (series ?? []).filter((s) =>
    s.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div
      ref={wrapRef}
      role="menu"
      className="absolute top-full right-0 z-30 mt-1.5 flex max-h-80 w-[280px] flex-col overflow-hidden rounded-[10px] border border-[color:var(--planner-border)] bg-white shadow-[0_10px_28px_rgba(20,30,50,.16)]"
      style={{ fontFamily: "var(--planner-font-family)" }}
    >
      <div className="shrink-0 border-b border-[color:var(--planner-border-soft)] p-1.5">
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm Series…"
          className="w-full rounded-[7px] border border-[color:var(--planner-border-soft)] bg-[color:var(--planner-surface-soft)] px-2 py-1.5 text-[12px] text-[color:var(--planner-text-primary)] outline-none placeholder:text-[color:var(--planner-text-muted)] focus:border-[color:var(--planner-primary)]"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-1">
        {loadError ? (
          <PlannerInlineError message={loadError} className="p-2" />
        ) : series === null ? (
          <div className="flex items-center justify-center py-6 text-[color:var(--planner-text-muted)]">
            <Loader2 size={16} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-2 py-3 text-[11.5px] text-[color:var(--planner-text-muted)]">
            {query ? "Không tìm thấy Series phù hợp." : "Chưa có Series nào."}
          </p>
        ) : (
          filtered.map((s) => {
            const expanded = expandedId === s.id;
            return (
              <div key={s.id} className="flex flex-col">
                <div className="flex min-w-0 items-center gap-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => onPick(s.id)}
                    title={`Đính kèm toàn bộ Series "${s.title}"`}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-[7px] px-2 py-1.5 text-left hover:bg-[color:var(--planner-surface-soft)]"
                  >
                    {s.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- thumbnail nho trong popover chon.
                      <img
                        src={s.coverImageUrl}
                        alt=""
                        className="size-6 shrink-0 rounded-[5px] object-cover"
                      />
                    ) : (
                      <span
                        className="flex size-6 shrink-0 items-center justify-center rounded-[5px] bg-[color:var(--planner-surface-soft)] text-[color:var(--planner-text-muted)]"
                        aria-hidden="true"
                      >
                        <Paperclip size={11} />
                      </span>
                    )}
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-[color:var(--planner-text-primary)]">
                      {s.title}
                    </span>
                  </button>
                  {s.entries.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : s.id)}
                      aria-label={
                        expanded
                          ? `Ẩn danh sách bài trong "${s.title}"`
                          : `Chọn 1 bài cụ thể trong "${s.title}"`
                      }
                      aria-expanded={expanded}
                      className="flex shrink-0 cursor-pointer items-center rounded-[6px] px-1.5 py-1.5 text-[10px] font-medium text-[color:var(--planner-text-muted)] hover:bg-[color:var(--planner-surface-soft)] hover:text-[color:var(--planner-text-secondary)]"
                    >
                      {expanded ? "▲" : `${s.entries.length} bài ▾`}
                    </button>
                  )}
                </div>
                {expanded && (
                  <div className="ml-7 flex flex-col border-l border-[color:var(--planner-border-soft)] pl-2">
                    {s.entries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        role="menuitem"
                        onClick={() => onPick(s.id, entry.id)}
                        className={cn(
                          "min-w-0 cursor-pointer truncate rounded-[6px] px-2 py-1 text-left text-[11.5px] text-[color:var(--planner-text-secondary)] hover:bg-[color:var(--planner-surface-soft)] hover:text-[color:var(--planner-text-primary)]",
                        )}
                        title={entry.navTitle || entry.title}
                      >
                        {entry.navTitle || entry.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
