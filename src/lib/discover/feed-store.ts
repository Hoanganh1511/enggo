import type { Post } from "@/content/home-feed-mock";
import { listPostsAction } from "@/actions/discover/list-posts";
import { createPostAction } from "@/actions/discover/create-post";

// Store chia se cho feed - pattern pub-sub thu cong, dung useSyncExternalStore
// o noi tieu thu. Can co store rieng vi PostComposer va cac trang tab la
// SIBLING duoi HomeLayoutShell (khong phai cha-con), nen khong the truyen
// thang state qua props - phai qua 1 nguon du lieu dung chung.
//
// KHAC ban truoc: posts gio la du lieu THAT tu backend (PostModule), khong
// con seed san tu 1 mang mock luc module load - phai fetch (ensureFeedLoaded)
// truoc khi doc duoc gi ca, va addPost gio la async (goi POST /posts that).
let posts: Post[] = [];
let status: "idle" | "loading" | "loaded" | "error" = "idle";
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((listener) => listener());
}

export function getPosts() {
  return posts;
}

export function getFeedStatus() {
  return status;
}

export function subscribeFeed(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

// Component nay chi chay client ("use client" o moi noi tieu thu), khong co
// gi de hydrate tu server ca - mang rong la snapshot server hop le duy nhat.
export function getServerSnapshot(): Post[] {
  return [];
}

// Goi 1 LAN duy nhat (idempotent - cac lan goi sau khi da loading/loaded deu
// no-op) - dat trong HomeLayoutShell (layout dung chung moi tab) de khong bi
// fetch lai moi lan chuyen tab.
export async function ensureFeedLoaded(): Promise<void> {
  if (status === "loading" || status === "loaded") return;
  status = "loading";
  notify();
  try {
    posts = await listPostsAction({ limit: 50 });
    status = "loaded";
  } catch {
    status = "error";
  }
  notify();
}

// Dang bai that: goi API tao Post that trong DB, chi prepend vao store SAU
// khi backend xac nhan thanh cong (tra ve dung post da co id/createdAt/author
// that) - khong con "lac quan" tu bia 1 Post gia nhu ban truoc.
export async function addPost(
  kind: Post["kind"],
  data: Record<string, unknown>,
): Promise<boolean> {
  try {
    const created = await createPostAction(kind, data);
    posts = [created, ...posts];
    notify();
    return true;
  } catch {
    return false;
  }
}
