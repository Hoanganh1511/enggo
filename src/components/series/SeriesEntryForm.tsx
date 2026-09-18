"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { toast } from "@/lib/toast/toast-store";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useUnsavedChangesGuard } from "@/lib/use-unsaved-changes-guard";
import { createContentSeriesEntryAction } from "@/actions/discover/content-series/create-content-series-entry";
import { updateContentSeriesEntryAction } from "@/actions/discover/content-series/update-content-series-entry";
import { DocsMarkdown } from "@/components/docs/DocsMarkdown";
import { SeriesEntryEditor } from "@/components/series/SeriesEntryEditor";
import { SeriesIconPicker } from "@/components/series/SeriesIconPicker";
import { RepeaterField, RemoveRowButton } from "@/components/series/RepeaterField";
import { EntryContentBlocksEditor } from "@/components/series/EntryContentBlocksEditor";
import { DictionarySectionsEditor } from "@/components/series/DictionarySectionsEditor";
import { SelectMenu } from "@/components/ui/select-menu";
import { LayoutSpinnerOverlay } from "@/components/ui/layout-spinner";
import { UnsavedChangesModal } from "@/components/ui/unsaved-changes-modal";
import type {
  ContentSeriesCategory,
  ContentSeriesEntryDetail,
  ContentSeriesFaqItem,
  ContentSeriesInstallTab,
  DictionarySection,
  EntryContentBlock,
} from "@/lib/api/content-series";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] outline-none focus:border-primary";
const labelClass = "mb-1 block text-[13px] font-medium text-ink";

// Tab gia lap device cho Live preview - doi max-width cua khung chua (xem
// comment chi tiet o cho dung trong JSX ve gioi han: chi la mo phong be
// rong, khong phai iframe device-emulator that su nen 1 vai class Tailwind
// "sm:" (phan hoi theo VIEWPORT trinh duyet, khong phai container nay) co
// the khong doi theo.
const PREVIEW_DEVICES = [
  { id: "desktop" as const, label: "Desktop", Icon: Monitor },
  { id: "tablet" as const, label: "Tablet", Icon: Tablet },
  { id: "mobile" as const, label: "Mobile", Icon: Smartphone },
];
const PREVIEW_DEVICE_WIDTH: Record<(typeof PREVIEW_DEVICES)[number]["id"], number> = {
  desktop: 9999,
  tablet: 480,
  mobile: 360,
};

function estimateReadTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Cap 3 (Soan Entry) - layout 2 cot: form ben trai, live preview ben phai
// (dac ta muc "Layout editor: 2 cot"). Dung chung cho tao moi va sua, giong
// SeriesForm.tsx.
export function SeriesEntryForm({
  seriesSlug,
  categories,
  defaultCategoryId,
  initial,
}: {
  seriesSlug: string;
  categories: ContentSeriesCategory[];
  defaultCategoryId?: string;
  initial?: ContentSeriesEntryDetail;
}) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const [saving, setSaving] = useState(false);

  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? "",
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [navTitle, setNavTitle] = useState(initial?.navTitle ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [source, setSource] = useState(initial?.source ?? "");
  const [contentMarkdown, setContentMarkdown] = useState(initial?.contentMarkdown ?? "");
  const [hasFaq, setHasFaq] = useState(Boolean(initial?.faq?.length));
  const [faq, setFaq] = useState<ContentSeriesFaqItem[]>(initial?.faq ?? []);
  const [installOverride, setInstallOverride] = useState(Boolean(initial?.installTabs?.length));
  const [installTabs, setInstallTabs] = useState<ContentSeriesInstallTab[]>(
    initial?.installTabs ?? [],
  );
  const [readTimeOverride, setReadTimeOverride] = useState(initial?.readTimeMinutes ?? undefined);
  const [contentBlocks, setContentBlocks] = useState<EntryContentBlock[]>(
    initial?.contentBlocks ?? [],
  );
  const [hasDictionary, setHasDictionary] = useState(Boolean(initial?.dictionarySections?.length));
  const [dictionarySections, setDictionarySections] = useState<DictionarySection[]>(
    initial?.dictionarySections ?? [],
  );
  const [previewDevice, setPreviewDevice] =
    useState<(typeof PREVIEW_DEVICES)[number]["id"]>("desktop");

  // Bao ve du lieu chua luu - yeu cau nguoi dung: "Các trang cần thêm tính
  // năng bảo vệ dữ liệu khi có bất kỳ hành động nào rời khỏi trang hiện tại
  // nếu có thay đổi trong nội dung. Cần bật modal để confirm trước khi
  // quyết định thoát". `isDirty` bat len khi BAT KY state nao o tren doi
  // (mountedRef bo qua LAN CHAY DAU do useEffect luon chay 1 lan luc mount,
  // khong tinh la "thay doi") - don gian hon nhieu so voi so sanh sau tung
  // truong voi `initial`, du co the "duong" (vd go roi xoa lai y het cu van
  // tinh la dirty) - chap nhan duoc cho 1 tinh nang canh bao, uu tien AN
  // TOAN (tha canh bao thua con hon bo sot mat that noi dung that).
  const [isDirty, setIsDirty] = useState(false);
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setIsDirty(true);
  }, [
    categoryId,
    title,
    navTitle,
    slug,
    icon,
    subtitle,
    source,
    contentMarkdown,
    hasFaq,
    faq,
    installOverride,
    installTabs,
    readTimeOverride,
    contentBlocks,
    hasDictionary,
    dictionarySections,
  ]);
  const { pendingHref, confirmLeave, cancelLeave } = useUnsavedChangesGuard(isDirty);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Chan double-submit bang GUARD o day thay vi thuoc tinh HTML
    // `disabled` tren nut submit - xem giai thich o nut ben duoi.
    if (saving) return;
    if (!title.trim() || !contentMarkdown.trim() || !categoryId) {
      toast.danger("Điền đủ Category, Tiêu đề, Nội dung trước đã.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        categoryId,
        title,
        // Mode edit: gui nguyen (ke ca rong) de xoa duoc that su, quay ve
        // dung `title` mac dinh - giong tinh than coverImageUrl trong
        // SeriesForm.tsx/CreateCollectionModal.tsx.
        navTitle: isEdit ? navTitle.trim() : navTitle.trim() || undefined,
        slug: slug.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        // Mode edit: gui nguyen (ke ca rong) de XOA icon that su - cung loi
        // voi navTitle o tren. Truoc do luon "|| undefined" nen luc bam nut
        // "x" xoa icon (SeriesIconPicker.tsx dat icon="") thi payload gui di
        // lai la `undefined` -> fetch tu BO HAN key nay khoi JSON body ->
        // backend hieu la "khong doi gi", icon cu VAN CON trong DB (yeu cau
        // nguoi dung: "Tính năng xóa icon... chưa hoạt động, bên ngoài vẫn
        // hiện").
        icon: isEdit ? icon.trim() : icon.trim() || undefined,
        source: source.trim() || undefined,
        contentMarkdown,
        faq: hasFaq ? faq : [],
        installTabs: installOverride ? installTabs : undefined,
        contentBlocks,
        dictionarySections: hasDictionary ? dictionarySections : [],
        readTimeMinutes: readTimeOverride,
      };
      if (isEdit && initial) {
        // Sua Entry co san - O NGUYEN trang, CHI bao thanh cong (yeu cau
        // nguoi dung: "Lưu chỉnh sửa bài viết xong thì ở nguyên đấy báo
        // thành công chứ mắc gì điều hướng về quản lý series") - truoc do
        // tu dong router.push ve trang Quan ly, cat ngang luc dang sua tiep.
        // router.refresh() de dong bo lai du lieu server (vd readTimeMinutes
        // tu tinh lai) ma KHONG doi URL.
        await updateContentSeriesEntryAction(seriesSlug, initial.id, payload);
        toast.success("Đã lưu Entry");
        setIsDirty(false);
        router.refresh();
      } else {
        await createContentSeriesEntryAction(seriesSlug, payload);
        toast.success("Đã tạo Entry");
        setIsDirty(false);
        router.push(`/series/${seriesSlug}/manage`);
      }
    } catch (err) {
      toast.danger(getApiErrorMessage(err, "Lưu thất bại, thử lại sau."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative flex gap-8">
      {/* Spinner layout - phu vung than trang soan Entry nay trong luc dang
          luu (yeu cau nguoi dung). Dat o day (relative wrapper NGOAI CUNG)
          thay vi chi boc form de che ca cot preview ben phai luon. Label kem
          ten bai (in dam) - yeu cau nguoi dung: "Bổ sung thêm text ví dụ
          như Đang khởi tạo Bài viết Entry "**tên bài**"". */}
      <LayoutSpinnerOverlay
        active={saving}
        label={
          <>
            {isEdit ? "Đang lưu Bài viết Entry " : "Đang khởi tạo Bài viết Entry "}
            &quot;<strong className="font-semibold">{title.trim() || "(chưa có tiêu đề)"}</strong>&quot;
          </>
        }
      />
      <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 flex-col gap-5">
        <div>
          <label className={labelClass}>Category *</label>
          <SelectMenu
            value={categoryId}
            onChange={setCategoryId}
            options={categories.map((cat) => ({ value: cat.id, label: cat.title }))}
            placeholder="Chọn category"
          />
        </div>

        <div>
          <label className={labelClass}>Tiêu đề *</label>
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        {/* Icon di CHUNG voi Tên hiển thị sidebar (khong con o canh Tieu de) -
            yeu cau nguoi dung: "phần chọn icon là cho tên hiển thị trong
            sidebar" - icon nay CHI xuat hien canh navTitle trong
            SeriesSidebar.tsx (xem EntryLink), khong lien quan gi Tieu de
            chinh/H1 tren trang, nen gom chung 1 nhom cho dung ngu canh. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
          <div>
            <label className={labelClass}>Icon</label>
            <SeriesIconPicker value={icon} onChange={setIcon} />
          </div>
          <div>
            <label className={labelClass}>
              Tên hiển thị trong sidebar (tuỳ chọn)
            </label>
            <input
              className={inputClass}
              placeholder="Để trống = dùng chung Tiêu đề"
              value={navTitle}
              onChange={(e) => setNavTitle(e.target.value)}
            />
          </div>
        </div>
        <p className="-mt-3 text-[11px] text-ink-faint">
          Sidebar hẹp nên có thể muốn 1 tên ngắn gọn hơn Tiêu đề chính trên trang.
        </p>

        <div>
          <label className={labelClass}>Slug</label>
          <input
            className={inputClass}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="tự sinh từ tiêu đề nếu để trống"
          />
        </div>

        <div>
          <label className={labelClass}>Subtitle</label>
          <input
            className={inputClass}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Source (vd mattpocock/skills)</label>
          <input className={inputClass} value={source} onChange={(e) => setSource(e.target.value)} />
        </div>

        {/* [2026-09-16] Gop 3 "cục" rieng (Top/giữa/cuối) thanh 1 khoi DUY
            NHAT - yeu cau nguoi dung: "Không tách thành 3 cục riêng này. Xóa
            cái Top Đầu Bài đi. Giờ để 1 button click, sau đó nó hiện modal
            ra chọn 1 trong 2 cái. Rồi chọn mẫu, vậy cho gọn" (xem chi tiet
            trong EntryContentBlocksEditor.tsx - modal 2 buoc chon vi tri roi
            chon mau, thay the han zone "top"/rieng label moi zone). */}
        <EntryContentBlocksEditor blocks={contentBlocks} onChange={setContentBlocks} />

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className={labelClass}>Thân bài — Nội dung *</label>
            <span className="text-[12px] text-ink-faint">
              Read time: {readTimeOverride ?? estimateReadTime(contentMarkdown)} phút
              <button
                type="button"
                onClick={() =>
                  setReadTimeOverride((v) => (v === undefined ? estimateReadTime(contentMarkdown) : undefined))
                }
                className="ml-2 cursor-pointer text-primary hover:underline"
              >
                {readTimeOverride === undefined ? "ghi đè" : "dùng auto"}
              </button>
              {readTimeOverride !== undefined && (
                <input
                  type="number"
                  min={1}
                  className="ml-2 w-14 rounded-md border border-border px-1.5 py-0.5 text-[12px]"
                  value={readTimeOverride}
                  onChange={(e) => setReadTimeOverride(Number(e.target.value) || 1)}
                />
              )}
            </span>
          </div>
          <SeriesEntryEditor value={contentMarkdown} onChange={setContentMarkdown} />
        </div>

        <div className="rounded-xl border border-border p-4">
          <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <input type="checkbox" checked={hasFaq} onChange={(e) => setHasFaq(e.target.checked)} />
            FAQ
          </label>
          {hasFaq && (
            <div className="mt-3">
              <RepeaterField
                items={faq}
                onChange={setFaq}
                newItem={(): ContentSeriesFaqItem => ({ question: "", answer: "" })}
                addLabel="Thêm câu hỏi"
                renderRow={(item, update, remove) => (
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        className={inputClass}
                        placeholder="Câu hỏi"
                        value={item.question}
                        onChange={(e) => update({ question: e.target.value })}
                      />
                      <textarea
                        className={`${inputClass} min-h-16 resize-y`}
                        placeholder="Trả lời (markdown)"
                        value={item.answer}
                        onChange={(e) => update({ answer: e.target.value })}
                      />
                    </div>
                    <RemoveRowButton onClick={remove} />
                  </div>
                )}
              />
            </div>
          )}
        </div>

        {/* [2026-09-17] Layout "Dictionary" - yeu cau nguoi dung: "bổ sung
            thêm 1 cate Guides... trong này sẽ có 1 page mặc định là:
            Dictionary" roi "Làm đi" (DB-backed, sua duoc o day thay vi hardcode
            trong component). Bat cong tac nay -> Entry render bang
            SeriesDictionaryView (search + sidebar Sections + luoi thuat ngu)
            THAY VI bai viet Markdown binh thuong, xem [entrySlug]/page.tsx. */}
        <div className="rounded-xl border border-border p-4">
          <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <input
              type="checkbox"
              checked={hasDictionary}
              onChange={(e) => setHasDictionary(e.target.checked)}
            />
            Dùng layout Dictionary cho Entry này (thay thế nội dung Markdown)
          </label>
          {hasDictionary && (
            <div className="mt-3">
              <DictionarySectionsEditor sections={dictionarySections} onChange={setDictionarySections} />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border p-4">
          <label className="flex items-center gap-2 text-[13px] font-semibold text-ink">
            <input
              type="checkbox"
              checked={installOverride}
              onChange={(e) => setInstallOverride(e.target.checked)}
            />
            Dùng install config riêng cho Entry này (mặc định kế thừa Series)
          </label>
          {installOverride && (
            <div className="mt-3">
              <RepeaterField
                items={installTabs}
                onChange={setInstallTabs}
                newItem={(): ContentSeriesInstallTab => ({ label: "", command: "" })}
                addLabel="Thêm install tab"
                renderRow={(item, update, remove) => (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                        <input
                          className={inputClass}
                          placeholder="Tab label"
                          value={item.label}
                          onChange={(e) => update({ label: e.target.value })}
                        />
                        <input
                          className={`${inputClass} font-mono`}
                          placeholder="Command"
                          value={item.command}
                          onChange={(e) => update({ command: e.target.value })}
                        />
                      </div>
                      <RemoveRowButton onClick={remove} />
                    </div>
                    <input
                      className={inputClass}
                      placeholder="Post-install note (vd: Then type /skill...)"
                      value={item.note ?? ""}
                      onChange={(e) => update({ note: e.target.value })}
                    />
                  </div>
                )}
              />
            </div>
          )}
        </div>

        {/* [2026-09-18] Chuyen thanh nut NOI (fixed, luon thay du cuon toi
            dau) - yeu cau nguoi dung: "giờ tôi muốn nút Lưu này ở đâu đó mà
            dù đang biên soạn ở đâu, cuộn tới đâu cũng vẫn thấy nó xuất hiện
            ý". z-50 (CAO HON z-40 cua LayoutSpinnerOverlay o tren) - bug UI
            nguoi dung bao ("Nút Lưu lỗi UI"): nut CU nam TRONG vung overlay
            phu luc dang luu (khong co z-index rieng, mac dinh THAP HON lop
            phu mo/backdrop-blur cua overlay) nen bi CHINH overlay do de
            mo/nhoe len tren, nhin nhu "vỡ giao diện" thay vi 1 nut binh
            thuong dang hien chu "Đang lưu...". Dat z-50 rieng de LUON nam
            TREN overlay, giu nguyen ro net ca luc dang luu.
            aria-disabled (KHONG dung thuoc tinh HTML `disabled`) - nut nay
            dang GIU FOCUS luc bam submit; disabled that su se lam trinh
            duyet tu dong bo focus khoi phan tu, keo theo cuon trang VE DAU
            (bug nguoi dung bao truoc do: "ngay khi [spinner] bật lên...
            cuộn lên đầu luôn"). Guard chong double-submit da chuyen sang dau
            handleSubmit (if (saving) return). */}
        <button
          type="submit"
          aria-disabled={saving}
          onClick={(e) => {
            if (saving) e.preventDefault();
          }}
          className="fixed right-6 bottom-6 z-50 cursor-pointer rounded-full bg-ink px-6 py-3 text-[14px] font-semibold text-surface shadow-lg transition hover:opacity-90 aria-disabled:cursor-not-allowed aria-disabled:opacity-70"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu Entry" : "Tạo Entry"}
        </button>
      </form>

      {/* [2026-09-16] Rong gap doi (w-80 -> w-160) - yeu cau nguoi dung: "tăng
          chiều rộng của phần LivePreview này thêm gấp đôi đi. Chứ như này
          không đúng view". Them tabs gia lap device (Desktop/Tablet/Mobile) -
          yeu cau "nếu có thể thì thêm hẳn tabs có các tab content là các
          view device khác nhau". Luu y: day CHI la mo phong chieu RONG (doi
          max-width khung chua) - cac class Tailwind "sm:" trong app phan hoi
          theo chieu rong THAT cua CUA SO TRINH DUYET (media query), khong
          phai theo container nay, nen 1-2 cho dung "sm:" (vd grid StatAccordion)
          co the KHONG tu doi lai khi chon tab Mobile - van du de xem chu
          xuong dong/khoang cach/kich thuoc anh thay doi ra sao o be rong hep
          hon, dung nhu muc dich chinh cua 1 "live preview" nhanh (khac han 1
          iframe device-emulator that su, ngoai pham vi 1 preview ben canh
          form). */}
      <div className="hidden w-160 shrink-0 lg:block">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Live preview
          </p>
          <div className="flex gap-0.5 rounded-md bg-surface-muted p-0.5">
            {PREVIEW_DEVICES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setPreviewDevice(d.id)}
                title={d.label}
                className={cn(
                  "flex size-6 cursor-pointer items-center justify-center rounded transition-colors duration-150 ease-out",
                  previewDevice === d.id
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-faint hover:text-ink-muted",
                )}
              >
                <d.Icon size={13} strokeWidth={2} />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface-muted/40 p-4">
          <div
            className="mx-auto overflow-hidden rounded-lg border border-border bg-surface p-4 transition-[max-width] duration-200 ease-out"
            style={{ maxWidth: PREVIEW_DEVICE_WIDTH[previewDevice] }}
          >
            <h2 className="text-[18px] font-bold text-ink">{title || "(chưa có tiêu đề)"}</h2>
            {subtitle && <p className="mt-1 text-[13px] text-ink-faint">{subtitle}</p>}
            <div className="mt-3">
              <DocsMarkdown markdown={contentMarkdown || "*chưa có nội dung*"} />
            </div>
          </div>
        </div>
      </div>
      <UnsavedChangesModal open={pendingHref !== null} onConfirm={confirmLeave} onCancel={cancelLeave} />
    </div>
  );
}
