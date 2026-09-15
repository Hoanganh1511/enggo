"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Copy, FileEdit, Layers, Share2, User } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { SimpleModal } from "@/components/ui/simple-modal";
import { SeriesShareButtons } from "@/components/series/SeriesShareButtons";
import { CopyPageFlipCard } from "@/components/series/CopyPageFlipCard";
import type { ContentSeriesEntrySummary } from "@/lib/api/content-series";

// [2026-09-15] Tang size + dam chu (h-8 -> h-9, px-3 -> px-3.5, 12.5px ->
// 13px, font-medium -> font-semibold, text-ink-muted -> text-ink) - yeu cau
// nguoi dung sau khi so sanh voi anh mau: "Nút chưa to, chưa đậm nội dung
// như bên kia" (ban dau lam nhat/nho hon EntryDownloadButtons ben canh cho
// "phu", nhung day la hang HANH DONG chinh cuoi cum dau bai nen can noi bat
// hon).
// rounded-[10px] (khong phai rounded-md=6px mac dinh) - yeu cau nguoi dung:
// "Tất cả button này cho radius khoảng 10px".
const buttonClass =
  "flex h-9 cursor-pointer items-center gap-1.5 rounded-[10px] border border-border px-3.5 text-[13px] font-semibold text-ink transition-colors duration-150 ease-out hover:bg-hover-bg";

// Cum hang cuoi CUNG cua phan dau bai (truoc khi xuong than bai) - yeu cau
// nguoi dung, khop anh mau tham khao (trang skill cua Matt Pocock): trai la
// tac gia + Follow, phai la Copy page/Share/Next page. Tac gia lay tu
// Series.authorName/authorAvatarUrl (Series KHONG co FK toi 1 User cu the,
// chi la CHUOI TEXT tu do) nen "Follow" O DAY CHUA gan logic that (chua co he
// thong follow tac gia rieng cho Series) - CHI la UI, bam vao hien toast
// "sắp ra mắt" (yeu cau nguoi dung: "Sửa thành Follow đi", khong yeu cau gan
// chuc nang that).
//
// [2026-09-15] Bam vao avatar+ten tac gia (CHI admin) mo 1 POPOVER Profile/
// Cập nhật bài viết/Cập nhật Series - thay the han cum nut doc rieng
// EntryAuthorRail cu (fixed canh phai man hinh, xem lich su [entrySlug]/
// page.tsx) theo yeu cau nguoi dung: "Bỏ cái cục này đi... khi click vào
// phần avatar và tên tác giả... sẽ hiện ra một popover". "Profile" dan toi
// TRANG CA NHAN cua CHINH nguoi dang xem (session.username qua useSession) -
// admin gan voi quyen he thong (isAdmin), KHONG phai 1 User cu the gan voi
// Series (Series khong co FK) nen "Profile" o day la profile cua NGUOI DANG
// THAO TAC, khong phai cua "tác giả" hien thi.
export function EntryPageActionsRow({
  authorName,
  authorAvatarUrl,
  contentMarkdown,
  shareChannels,
  shareUrl,
  shareTitle,
  next,
  seriesSlug,
  entrySlug,
  isAdmin,
}: {
  authorName: string;
  authorAvatarUrl: string | null;
  contentMarkdown: string;
  shareChannels: string[];
  shareUrl: string;
  shareTitle: string;
  next: ContentSeriesEntrySummary | null;
  seriesSlug: string;
  entrySlug: string;
  isAdmin: boolean;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [authorMenuOpen, setAuthorMenuOpen] = useState(false);
  const [copyPageAnim, setCopyPageAnim] = useState(false);
  const { data: session } = useSession();
  const username = session?.username;

  // [2026-09-15] KHONG con toast cho rieng hanh dong nay - yeu cau nguoi
  // dung: "không dùng toast để thông báo thành công [nút] copy page" - thay
  // bang CopyPageFlipCard (UI file markdown tu lat/scale, xem file do). Tu
  // tat sau 900ms (rut ngan tu 1.4s - yeu cau nguoi dung: "cho thời gian lên
  // nhanh hơn và xong cũng xuống nhanh hơn. hơi lâu"; van du de kip doc
  // "Copied .md" truoc khi bien mat vi lat vao gio chi con 0.3s).
  function handleCopyPage() {
    navigator.clipboard
      .writeText(contentMarkdown)
      .then(() => {
        setCopyPageAnim(true);
        setTimeout(() => setCopyPageAnim(false), 900);
      })
      .catch(() => toast.danger("Không copy được, thử lại sau."));
  }

  function handleCopyShareUrl() {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => toast.success("Đã copy link"))
      .catch(() => toast.danger("Không copy được, thử lại sau."));
  }

  return (
    <div className="font-content mt-4 flex flex-wrap items-center justify-between gap-3 pt-4">
      <div className="flex min-w-0 items-center gap-2.5">
        {isAdmin ? (
          // Popover "Profile/Cập nhật bài viết/Cập nhật Series" - thay the
          // cum nut doc rieng EntryAuthorRail cu (yeu cau nguoi dung: "Bỏ
          // cái cục này đi... Giờ khi click vào phần avatar và tên tác giả
          // ... sẽ hiện ra một popover"). CHI hien cho admin (author o day
          // anh xa theo quyen admin, xem comment dau file) - nguoi xem
          // thuong chi thay avatar+ten TINH, khong bam duoc.
          <PopoverRoot open={authorMenuOpen} onOpenChange={setAuthorMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                // rounded-full (khong phai rounded-md) - goc TRAI cua nen
                // hover PHAI khop DUNG do cong tron cua avatar (yeu cau
                // nguoi dung: "Bên trái của cái màu nền cho border sao cho
                // khớp với độ tròn của avatar"). rounded-md truoc do ban
                // kinh goc qua NHO so voi avatar tron hoan toan, khien goc
                // vuong cua nen "cắt" ngang avatar thay vi bao tron no. pl-1
                // them 1 chut dem TRAI de avatar khong dinh sat mep cong.
                className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-full py-1 pr-2.5 pl-1 transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                <AuthorAvatar authorName={authorName} authorAvatarUrl={authorAvatarUrl} />
                <span className="truncate text-[13px] font-medium text-ink">
                  {authorName}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              open={authorMenuOpen}
              align="start"
              sideOffset={6}
              // series-scope lap lai o day - PopoverContent portal thang ra
              // document.body (Radix Portal mac dinh), NAM NGOAI cay DOM cua
              // <div className="series-scope"> boc toan bo /series
              // (series/layout.tsx) nen KHONG ke thua duoc font-family:
              // var(--font-inter) dat truc tiep tren .series-scope - text
              // popover bi roi ve font mac dinh toan app (Plex Mono) thay vi
              // Inter cua khu Series (nguoi dung phat hien: "Chỗ này có áp
              // dụng quy tắc font chữ đúng không?"). Ap lai class nay TRUC
              // TIEP tren chinh element portal ra ngoai de tai lap font-family
              // (va moi CSS var khac cua .series-scope) cho nhanh DOM rieng
              // biet nay.
              className="series-scope z-50 w-48 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-dropdown"
            >
              {username && (
                <Link
                  href={`/u/${username}`}
                  onClick={() => setAuthorMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
                >
                  <User size={14} strokeWidth={2} aria-hidden="true" />
                  Profile
                </Link>
              )}
              <Link
                href={`/series/${seriesSlug}/manage/entries/${entrySlug}`}
                onClick={() => setAuthorMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
              >
                <FileEdit size={14} strokeWidth={2} aria-hidden="true" />
                Cập nhật bài viết
              </Link>
              <Link
                href={`/series/${seriesSlug}/manage`}
                onClick={() => setAuthorMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 ease-out hover:bg-hover-bg hover:text-ink"
              >
                <Layers size={14} strokeWidth={2} aria-hidden="true" />
                Cập nhật Series
              </Link>
            </PopoverContent>
          </PopoverRoot>
        ) : (
          <div className="flex min-w-0 items-center gap-2.5">
            <AuthorAvatar authorName={authorName} authorAvatarUrl={authorAvatarUrl} />
            <span className="truncate text-[13px] font-medium text-ink">
              {authorName}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => toast.info("Tính năng Follow sắp ra mắt")}
          className="flex h-9 shrink-0 cursor-pointer items-center rounded-[10px] border border-border px-3.5 text-[13px] font-semibold text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
        >
          Follow
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={handleCopyPage} className={buttonClass}>
          <Copy size={14} strokeWidth={2} aria-hidden="true" />
          Copy page
        </button>

        {/* [2026-09-15] SimpleModal (khong con PopoverRoot) - yeu cau nguoi
            dung: "Khi ấn nút Share trong bài viết nó phải hiện modal như
            này chứ không phải như [popover cu]" - dung LAI SimpleModal (khung
            modal chung ca app, xem simple-modal.tsx) thay vi tu ve 1 popover
            nho, khop dung "form factor" modal that (giua man hinh, co lop
            overlay mo, nut dong X) trong anh mau. */}
        <SimpleModal open={shareOpen} onOpenChange={setShareOpen} title="Share">
          <div className="series-scope flex flex-col gap-4">
            <div className="overflow-x-auto pb-1">
              <SeriesShareButtons
                variant="modal"
                channels={shareChannels}
                url={shareUrl}
                title={shareTitle}
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink-muted">
                {shareUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyShareUrl}
                className="shrink-0 cursor-pointer rounded-md bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink transition-colors duration-150 ease-out hover:bg-hover-bg"
              >
                Copy
              </button>
            </div>
          </div>
        </SimpleModal>
        <button type="button" onClick={() => setShareOpen(true)} className={buttonClass}>
          <Share2 size={14} strokeWidth={2} aria-hidden="true" />
          Share
        </button>

        {next && (
          <Link
            href={`/series/${seriesSlug}/${next.slug}`}
            className={buttonClass}
          >
            Next page
            <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
          </Link>
        )}
      </div>

      <CopyPageFlipCard show={copyPageAnim} />
    </div>
  );
}

function AuthorAvatar({
  authorName,
  authorAvatarUrl,
}: {
  authorName: string;
  authorAvatarUrl: string | null;
}) {
  if (authorAvatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- avatar nho, khong can toi uu Next/Image
      <img
        src={authorAvatarUrl}
        alt=""
        className="size-7 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[12px] font-semibold text-ink-muted">
      {authorName.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
