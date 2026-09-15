import { apiFetch } from "./client";

// Module "Series" (chuoi bai/khoa hoc nhieu phan, vd 1 bo skill) - backend
// dat ten model "ContentSeries*" (KHONG phai "Series" tran) vi da co tinh
// nang KHAC trung ten (gom Document CUNG CHU DE trong 1 KnowledgeGroup, xem
// career-tree-api/src/series/**) - xem comment schema.prisma ben backend.
// Route hien thi o FE van la /series (khong dam voi gi ben frontend).

export type ContentSeriesStat = { label: string; value: string; icon?: string; link?: string };
export type ContentSeriesInstallTab = { label: string; command: string; note?: string; link?: string };
export type ContentSeriesExternalLink = { label: string; url: string; icon?: string };
export type ContentSeriesFaqItem = { question: string; answer: string };

// Khoi noi dung o dau 1 Entry (truoc than bai markdown), sap xep duoc - yeu
// cau nguoi dung: "chia làm nửa trên... custom thêm đa dạng các element...
// sắp xếp thứ tự hiển thị". Co tinh TACH RIENG khoi ContentSeriesAction/
// ContentSeriesActionStyle (dung cho CTA cua campaign card o tren) - 2 he
// thong nut khac nhau ve tu vung style (solid-yellow/outline-black/ghost-gray
// o day, thay vi primary/secondary/text ben card) VA khac ngu canh hien thi,
// gop chung se ep 1 union phai gong ganh 2 UI khong lien quan.
export type EntryBlockButtonStyle = "solid-yellow" | "outline-black" | "ghost-gray";
// [2026-09-15] `event` - yeu cau nguoi dung: "ngoài gắn link url cho button
// ra, thì nếu như tôi muốn đặt cho nó event, sự kiện gì đó liên quan tới
// page thì sao?" (vd nut "Ask AI Assistant" trong botHelp KHONG dieu huong
// sang URL nao ca, ma can TRIGGER 1 hanh vi JS o NGAY trang hien tai - mo
// widget chat, cuon toi 1 vi tri, mo modal khac... nhung Series KHONG biet/
// khong nen phu thuoc CU THE vao tinh nang do la gi). Giai phap: button
// CHON 1 trong 2 CHE DO - "link" (url, hanh vi CU) hoac "event" (dispatch 1
// CustomEvent(tren window) VOI TEN nguoi dung tu dat) - bat ky component
// JS nao khac trong app co the tu dang ky window.addEventListener(tenSuKien)
// de PHAN UNG, Series module khong can biet truoc su kien do lam gi. Khi
// `event` co gia tri, `url` bi BO QUA luc render (button KHONG con la the
// <a>/<Link> dieu huong nua, ma la <button> onClick dispatch).
export type EntryBlockButton = {
  id: string;
  label: string;
  url: string;
  event?: string;
  style: EntryBlockButtonStyle;
  openInNewTab?: boolean;
};
// [2026-09-15] `zone` - yeu cau nguoi dung mo rong tu "nua tren" duy nhat
// sang 1 khai niem bo cuc trang day du: "Top" (duoi subtitle, hanh vi CU,
// zone vang mat = "top" de tuong thich nguoc voi moi block da luu truoc do),
// "middle" (giua cum Top va than bai markdown) va "bottom" (sau than bai,
// truoc pagination Next). 4 loai block MOI (newsletter/botHelp/
// featurePromo/deeperCourse) CHI danh cho middle/bottom (khong bao gio
// "top") - giu tach biet voi 4 loai CU (toc/install/buttonGroup/callout)
// von thiet ke rieng cho vi tri duoi subtitle, tranh ket hop ky la (vd 1
// khoi "TOC box" nam giua trang).
export type EntryContentBlockZone = "top" | "middle" | "bottom";
export type EntryContentBlock =
  | { id: string; zone?: EntryContentBlockZone; type: "toc" }
  | {
      id: string;
      zone?: EntryContentBlockZone;
      type: "install";
      command: string;
      description?: string;
      buttons?: EntryBlockButton[];
    }
  | { id: string; zone?: EntryContentBlockZone; type: "buttonGroup"; buttons: EntryBlockButton[] }
  | { id: string; zone?: EntryContentBlockZone; type: "callout"; eyebrow?: string; title: string; description?: string }
  // Khong config gi ca - chi bat/tat, render lai dung SeriesEmailSignup voi
  // du lieu CUA CHINH Series (emailCourseTitle/Description), chi hien khi
  // series.emailCourseEnabled - tai su dung 100% component/logic da co san
  // thay vi lam 1 form thu email thu 2.
  | { id: string; zone: "middle" | "bottom"; type: "newsletter" }
  | {
      id: string;
      zone: "middle" | "bottom";
      type: "botHelp";
      title: string;
      description: string;
      buttonLabel: string;
      buttonUrl: string;
      // Xem comment `EntryBlockButton.event` o tren - cung co che, ap dung
      // cho nut DON LE cua 3 loai block nay (botHelp/featurePromo/
      // deeperCourse chi co 1 nut, khong phai mang nhu buttonGroup/install).
      buttonEvent?: string;
    }
  | {
      id: string;
      zone: "middle" | "bottom";
      type: "featurePromo";
      imageUrl: string;
      eyebrow?: string;
      title: string;
      description?: string;
      buttonLabel: string;
      buttonUrl: string;
      buttonEvent?: string;
    }
  | {
      id: string;
      zone: "middle" | "bottom";
      type: "deeperCourse";
      eyebrow?: string;
      title: string;
      description?: string;
      buttonLabel: string;
      buttonUrl: string;
      buttonEvent?: string;
    }
  // [2026-09-15] Danh sach bai hoc dang the doc ("5 lessons, in order") -
  // yeu cau nguoi dung dua tren 1 anh mau: tieu de chung + nhieu dong, moi
  // dong la 1 the rieng (anh thu nho + so thu tu + tieu de + mo ta 2 dong +
  // nut mui ten tron ben phai). Khac VOI SeriesNextEntryBanner (chi 1 the
  // Next DUY NHAT, tu dong lay tu du lieu that cua Series) - block nay la
  // 1 DANH SACH LIEN KET TUY Y admin tu nhap (co the tro toi Entry khac
  // trong CHINH Series nay, Series khac, hoac URL ngoai bat ky), dung cho
  // truong hop muon gioi thieu 1 nhom bai/khoa hoc CU THE giua/cuoi 1 Entry.
  | {
      id: string;
      zone: "middle" | "bottom";
      type: "lessonList";
      heading?: string;
      items: EntryLessonListItem[];
    };

export type EntryLessonListItem = {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  url: string;
  event?: string;
};

// "Campaign card" - cac field dieu khien hien thi the Series o /home (rail)
// + /series (list), xem SeriesCampaignCard.tsx + tab "Thẻ hiển thị" trong
// SeriesManageTabs.tsx (yeu cau nguoi dung: redesign the Series thanh dang
// banner co anh/badge/CTA + CMS cau hinh rieng cho tung the). Dung CHUNG cho
// ca ContentSeriesListItem (render the) LAN ContentSeriesOverview (form
// sua) - 1 nguon du lieu duy nhat, khong lech kieu giua 2 noi.
export type ContentSeriesActionStyle = "primary" | "secondary" | "text";
export type ContentSeriesAction = {
  id: string;
  label: string;
  url: string;
  style: ContentSeriesActionStyle;
  openInNewTab?: boolean;
};
export type ContentSeriesBadgeVariant = "info" | "success" | "warning" | "deadline" | "custom";
export type ContentSeriesCardFields = {
  // Anh cho CA hero trang tong quan LAN the campaign card (yeu cau nguoi
  // dung 2026-09-15 - truoc day CHUA dung cho card, xem lich su comment o
  // schema.prisma ContentSeries.coverImageUrl).
  coverImageUrl: string | null;
  // Thu tu hien thi tren /series (admin drag-reorder) - KHONG anh huong
  // "Series mới nhất" o /home (van dua vao createdAt, xem findAll() backend).
  orderIndex: number;
  badgeText: string | null;
  badgeVariant: ContentSeriesBadgeVariant;
  badgeColor: string | null;
  badgeTextColor: string | null;
  deadlineAt: string | null;
  imagePosition: "left" | "right";
  imageWidthPercent: number;
  imageFit: "cover" | "contain";
  backgroundColor: string | null;
  textTheme: "dark" | "light";
  cardStyle: "default" | "soft" | "accent";
  actions: ContentSeriesAction[];
  showBadge: boolean;
  showDeadline: boolean;
  isVisible: boolean;
};

export type ContentSeriesListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { entries: number };
  // Kem theo tu findAll() (backend) - dung cho the Series o /series VA rail
  // "Series mới nhất" o /home (mosaic icon tu vai entry dau, xem
  // NewestSeriesRail.tsx). Sap xep san theo orderIndex.
  categories: ContentSeriesCategory[];
  entries: ContentSeriesEntrySummary[];
} & ContentSeriesCardFields;

export type ContentSeriesCategory = {
  id: string;
  seriesId: string;
  parentId: string | null;
  slug: string;
  title: string;
  orderIndex: number;
  colorHex: string | null;
};

export type ContentSeriesEntrySummary = {
  id: string;
  slug: string;
  orderIndex: number;
  title: string;
  // Ten hien thi RIENG trong sidebar - null/rong = dung `title` (xem
  // SeriesSidebar.tsx: `entry.navTitle || entry.title`). Tach khoi `title`
  // (H1 tren trang doc) - yeu cau nguoi dung "tùy chỉnh title ở 2 vị trí".
  navTitle: string | null;
  subtitle: string | null;
  icon: string | null;
  categoryId: string;
  readTimeMinutes: number;
};

export type ContentSeriesOverview = {
  id: string;
  slug: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatarUrl: string | null;
  emailCourseEnabled: boolean;
  emailCourseTitle: string | null;
  emailCourseDescription: string | null;
  stats: ContentSeriesStat[];
  installTabs: ContentSeriesInstallTab[];
  externalLinks: ContentSeriesExternalLink[];
  shareChannels: string[];
  categories: ContentSeriesCategory[];
  entries: ContentSeriesEntrySummary[];
  createdAt: string;
  updatedAt: string;
} & ContentSeriesCardFields;

export type ContentSeriesEntryDetail = {
  id: string;
  seriesId: string;
  categoryId: string;
  slug: string;
  orderIndex: number;
  title: string;
  navTitle: string | null;
  subtitle: string | null;
  icon: string | null;
  source: string | null;
  contentMarkdown: string;
  installTabs: ContentSeriesInstallTab[] | null;
  faq: ContentSeriesFaqItem[] | null;
  contentBlocks: EntryContentBlock[] | null;
  readTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type ContentSeriesEntryPage = {
  series: ContentSeriesOverview;
  entry: ContentSeriesEntryDetail;
  prev: ContentSeriesEntrySummary | null;
  next: ContentSeriesEntrySummary | null;
  totalCount: number;
};

export function listContentSeries(): Promise<ContentSeriesListItem[]> {
  return apiFetch<ContentSeriesListItem[]>("/content-series");
}

export function getContentSeriesOverview(slug: string): Promise<ContentSeriesOverview> {
  return apiFetch<ContentSeriesOverview>(`/content-series/${slug}`);
}

export function getContentSeriesEntry(
  slug: string,
  entrySlug: string,
): Promise<ContentSeriesEntryPage> {
  return apiFetch<ContentSeriesEntryPage>(`/content-series/${slug}/entries/${entrySlug}`);
}

// ------------------------- Soan Series (admin, xem admin.guard.ts) -------------------------
// Cac ham duoi day goi route GHI (POST/PATCH/DELETE), backend tu chan bang
// AdminGuard - FE chi can gate HIEN THI trang qua getSelfStatus().isAdmin
// (xem cac trang manage/**), khong can kiem tra lai o day.

export type ContentSeriesInput = {
  title?: string;
  slug?: string;
  description?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  coverImageUrl?: string;
  emailCourseEnabled?: boolean;
  emailCourseTitle?: string;
  emailCourseDescription?: string;
  stats?: ContentSeriesStat[];
  installTabs?: ContentSeriesInstallTab[];
  externalLinks?: ContentSeriesExternalLink[];
  shareChannels?: string[];
  // --- "Campaign card" (xem comment ContentSeriesCardFields).
  badgeText?: string;
  badgeVariant?: ContentSeriesBadgeVariant;
  badgeColor?: string;
  badgeTextColor?: string;
  // null = xoa deadline, undefined = khong doi, string (ISO) = dat moi.
  deadlineAt?: string | null;
  imagePosition?: "left" | "right";
  imageWidthPercent?: number;
  imageFit?: "cover" | "contain";
  backgroundColor?: string;
  textTheme?: "dark" | "light";
  cardStyle?: "default" | "soft" | "accent";
  actions?: ContentSeriesAction[];
  showBadge?: boolean;
  showDeadline?: boolean;
  isVisible?: boolean;
};

export function createContentSeries(
  input: ContentSeriesInput & { title: string; description: string; authorName: string },
): Promise<ContentSeriesListItem> {
  return apiFetch<ContentSeriesListItem>("/content-series", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Sap xep lai thu tu hien thi TOAN BO Series tren /series (drag-reorder,
// admin - xem SeriesListPage), khong lien quan "Series mới nhất" o /home.
export function reorderContentSeries(orderedIds: string[]): Promise<unknown> {
  return apiFetch<unknown>("/content-series/reorder", {
    method: "POST",
    body: JSON.stringify({ orderedIds }),
  });
}

export function updateContentSeries(
  slug: string,
  input: ContentSeriesInput,
): Promise<ContentSeriesListItem> {
  return apiFetch<ContentSeriesListItem>(`/content-series/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteContentSeries(slug: string): Promise<void> {
  return apiFetch<void>(`/content-series/${slug}`, { method: "DELETE" });
}

export type ContentSeriesCategoryInput = {
  title?: string;
  slug?: string;
  colorHex?: string;
  // Category CHA - tao 1 "nhom con" (accordion, xem SeriesSidebar.tsx) ben
  // trong 1 category goc. Doi cha SAU KHI da tao thi dung
  // moveContentSeriesCategoryToParent rieng ben duoi (khong qua input nay).
  parentId?: string;
};

export function createContentSeriesCategory(
  seriesSlug: string,
  input: ContentSeriesCategoryInput & { title: string },
): Promise<ContentSeriesCategory> {
  return apiFetch<ContentSeriesCategory>(`/content-series/${seriesSlug}/categories`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateContentSeriesCategory(
  seriesSlug: string,
  categoryId: string,
  input: ContentSeriesCategoryInput,
): Promise<ContentSeriesCategory> {
  return apiFetch<ContentSeriesCategory>(
    `/content-series/${seriesSlug}/categories/${categoryId}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function deleteContentSeriesCategory(seriesSlug: string, categoryId: string): Promise<void> {
  return apiFetch<void>(`/content-series/${seriesSlug}/categories/${categoryId}`, {
    method: "DELETE",
  });
}

export function moveContentSeriesCategory(
  seriesSlug: string,
  categoryId: string,
  direction: "up" | "down",
): Promise<ContentSeriesCategory> {
  return apiFetch<ContentSeriesCategory>(
    `/content-series/${seriesSlug}/categories/${categoryId}/move`,
    { method: "POST", body: JSON.stringify({ direction }) },
  );
}

// Chuyen 1 category CON (nhom con/accordion) sang lam con cua 1 category GOC
// KHAC trong cung Series (yeu cau nguoi dung: "dịch chuyển cả cục accordion
// ... từ Explore kéo xuống Security") - khac moveContentSeriesCategory (chi
// hoan doi len/xuong trong CUNG cha).
export function moveContentSeriesCategoryToParent(
  seriesSlug: string,
  categoryId: string,
  newParentId: string,
): Promise<ContentSeriesCategory> {
  return apiFetch<ContentSeriesCategory>(
    `/content-series/${seriesSlug}/categories/${categoryId}/move-to-parent`,
    { method: "POST", body: JSON.stringify({ parentId: newParentId }) },
  );
}

export type ContentSeriesEntryInput = {
  categoryId?: string;
  title?: string;
  navTitle?: string;
  slug?: string;
  subtitle?: string;
  icon?: string;
  source?: string;
  contentMarkdown?: string;
  installTabs?: ContentSeriesInstallTab[];
  faq?: ContentSeriesFaqItem[];
  contentBlocks?: EntryContentBlock[];
  readTimeMinutes?: number;
};

export function createContentSeriesEntry(
  seriesSlug: string,
  input: ContentSeriesEntryInput & { categoryId: string; title: string; contentMarkdown: string },
): Promise<ContentSeriesEntryDetail> {
  return apiFetch<ContentSeriesEntryDetail>(`/content-series/${seriesSlug}/entries`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateContentSeriesEntry(
  seriesSlug: string,
  entryId: string,
  input: ContentSeriesEntryInput,
): Promise<ContentSeriesEntryDetail> {
  return apiFetch<ContentSeriesEntryDetail>(`/content-series/${seriesSlug}/entries/${entryId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteContentSeriesEntry(seriesSlug: string, entryId: string): Promise<void> {
  return apiFetch<void>(`/content-series/${seriesSlug}/entries/${entryId}`, { method: "DELETE" });
}

export function moveContentSeriesEntry(
  seriesSlug: string,
  entryId: string,
  direction: "up" | "down",
): Promise<ContentSeriesEntryDetail> {
  return apiFetch<ContentSeriesEntryDetail>(
    `/content-series/${seriesSlug}/entries/${entryId}/move`,
    { method: "POST", body: JSON.stringify({ direction }) },
  );
}

// Keo tha (che do "Sắp xếp", xem SeriesTreeManager.tsx) - FE tu tinh thu tu
// cuoi cung (arrayMove) roi gui nguyen 1 mang id, thay vi goi move up/down
// nhieu lan.
export function reorderContentSeriesCategories(
  seriesSlug: string,
  orderedIds: string[],
): Promise<ContentSeriesCategory[]> {
  return apiFetch<ContentSeriesCategory[]>(`/content-series/${seriesSlug}/categories/reorder`, {
    method: "POST",
    body: JSON.stringify({ orderedIds }),
  });
}

// Keo tha entry - CHI trong pham vi 1 category (xem comment
// reorderEntriesInCategory o backend ve ly do khong gop chung toan Series).
export function reorderContentSeriesEntriesInCategory(
  seriesSlug: string,
  categoryId: string,
  orderedIds: string[],
): Promise<ContentSeriesEntrySummary[]> {
  return apiFetch<ContentSeriesEntrySummary[]>(
    `/content-series/${seriesSlug}/categories/${categoryId}/entries/reorder`,
    { method: "POST", body: JSON.stringify({ orderedIds }) },
  );
}
