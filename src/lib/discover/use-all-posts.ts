"use client";

import { useSyncExternalStore } from "react";
import { getPosts, subscribeFeed, getServerSnapshot } from "./feed-store";

// Doc toan bo feed tu store dung chung - dung boi 6 tab cua trang profile
// (xem cac page.tsx trong u/[username]/) de tranh lap lai 3 dong
// useSyncExternalStore o moi file.
export function useAllPosts() {
  return useSyncExternalStore(subscribeFeed, getPosts, getServerSnapshot);
}
