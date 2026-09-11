import { apiFetch } from "./client";
import type { Post } from "@/content/home-feed-mock";

export type CollectionVisibility = "public" | "private";

export type CollectionTopic =
  | "tech"
  | "life"
  | "learning"
  | "creativity"
  | "business"
  | "sports"
  | "culture"
  | "history"
  | "other";

// Nhan tieng Viet cho tung chu de - dung chung giua CreateCollectionModal
// (form tao) va CollectionsSidebarFilters (bo loc /collections).
export const COLLECTION_TOPIC_LABELS: Record<CollectionTopic, string> = {
  tech: "Công nghệ",
  life: "Đời sống",
  learning: "Học tập",
  creativity: "Sáng tạo",
  business: "Kinh doanh",
  sports: "Thể thao",
  culture: "Văn hóa",
  history: "Lịch sử",
  other: "Khác",
};

export type PostCollectionApiShape = {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  visibility: CollectionVisibility;
  topic: CollectionTopic | null;
  postCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CollectionOwner = {
  username: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
};

export type PostCollectionBrowseItem = PostCollectionApiShape & {
  owner: CollectionOwner;
  isFollowingOwner: boolean;
};

export type CollectionFacets = {
  topics: { topic: string; count: number }[];
  allCount: number;
  followingCount: number;
};

export type ListPublicCollectionsResult = {
  items: PostCollectionBrowseItem[];
  nextCursor: string | null;
  facets: CollectionFacets;
};

export type PostCollectionDetailApiShape = PostCollectionApiShape & {
  isOwner: boolean;
  posts: Post[];
};

export type CollectionMembership = {
  collectionId: string;
  title: string;
  contains: boolean;
};

export type CollectionInput = {
  title: string;
  description?: string;
  coverImageUrl?: string;
  visibility?: CollectionVisibility;
  topic?: CollectionTopic;
};

export function createCollection(
  input: CollectionInput,
): Promise<PostCollectionApiShape> {
  return apiFetch<PostCollectionApiShape>("/post-collections", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCollection(
  id: string,
  input: Partial<CollectionInput>,
): Promise<PostCollectionApiShape> {
  return apiFetch<PostCollectionApiShape>(`/post-collections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteCollection(id: string): Promise<void> {
  return apiFetch<void>(`/post-collections/${id}`, { method: "DELETE" });
}

export function listMyCollections(): Promise<PostCollectionApiShape[]> {
  return apiFetch<PostCollectionApiShape[]>("/post-collections/mine");
}

export function listUserCollections(
  username: string,
): Promise<PostCollectionApiShape[]> {
  return apiFetch<PostCollectionApiShape[]>(
    `/post-collections/user/${username}`,
  );
}

export function getCollectionDetail(
  id: string,
): Promise<PostCollectionDetailApiShape> {
  return apiFetch<PostCollectionDetailApiShape>(`/post-collections/${id}`);
}

export function addToCollection(
  collectionId: string,
  postId: string,
): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/post-collections/${collectionId}/items`, {
    method: "POST",
    body: JSON.stringify({ postId }),
  });
}

export function removeFromCollection(
  collectionId: string,
  postId: string,
): Promise<void> {
  return apiFetch<void>(
    `/post-collections/${collectionId}/items/${postId}`,
    { method: "DELETE" },
  );
}

export function getCollectionMembership(
  postId: string,
): Promise<CollectionMembership[]> {
  return apiFetch<CollectionMembership[]>(
    `/post-collections/membership/${postId}`,
  );
}

export type ListPublicCollectionsParams = {
  scope?: "all" | "following";
  topic?: CollectionTopic;
  sort?: "newest" | "most-posts" | "az";
  search?: string;
  cursor?: string;
  limit?: number;
};

// Trang kham pha /collections ("Bo suu tap cua moi nguoi") - CHI tra ve
// PUBLIC, kem chu so huu + trang thai da follow tac gia hay chua (xem
// PostCollectionService.listPublic o backend).
export function listPublicCollections(
  params?: ListPublicCollectionsParams,
): Promise<ListPublicCollectionsResult> {
  const query = new URLSearchParams();
  if (params?.scope) query.set("scope", params.scope);
  if (params?.topic) query.set("topic", params.topic);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.search) query.set("search", params.search);
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch<ListPublicCollectionsResult>(
    `/post-collections${qs ? `?${qs}` : ""}`,
  );
}
