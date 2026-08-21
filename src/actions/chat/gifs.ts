"use server";

import { searchGifs, trendingGifs } from "@/lib/api/gif";

export async function searchGifsAction(query: string) {
  return searchGifs(query);
}

export async function trendingGifsAction() {
  return trendingGifs();
}
