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
};

export type ContentSeriesEntryDetail = {
  id: string;
  seriesId: string;
  categoryId: string;
  slug: string;
  orderIndex: number;
  title: string;
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
