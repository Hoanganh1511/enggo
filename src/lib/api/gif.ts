import { apiFetch } from "./client";

export type ApiGif = {
  id: string;
  title: string;
  previewUrl: string | null;
  url: string | null;
};

// Can GIPHY_API_KEY cau hinh o backend, khong thi tra 503 - xem GifService.
export function searchGifs(query: string, limit?: number): Promise<ApiGif[]> {
  const params = new URLSearchParams({ q: query });
  if (limit) params.set("limit", String(limit));
  return apiFetch<ApiGif[]>(`/gifs/search?${params.toString()}`);
}

export function trendingGifs(limit?: number): Promise<ApiGif[]> {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiFetch<ApiGif[]>(`/gifs/trending${qs ? `?${qs}` : ""}`);
}
