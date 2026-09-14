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
};

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
  // Anh nen hero cho trang tong quan Series - optional, CHUA dung o the rail
  // "Series mới nhất"/danh sach /series (2 noi do co chu dich giu phang,
  // xem NewestSeriesRail.tsx).
  coverImageUrl: string | null;
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
};

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
};

export function createContentSeries(
  input: ContentSeriesInput & { title: string; description: string; authorName: string },
): Promise<ContentSeriesListItem> {
  return apiFetch<ContentSeriesListItem>("/content-series", {
    method: "POST",
    body: JSON.stringify(input),
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
