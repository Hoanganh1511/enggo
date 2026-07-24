import { POSTS as INITIAL_POSTS, type Post } from "@/content/home-feed-mock";

// Store chia se cho feed - cung 1 pattern pub-sub thu cong nhu
// sidebar-collapsed-store.ts (khong dung localStorage vi post chi can song
// trong phien lam viec hien tai, khong can persist qua lan reload). Can co
// store rieng vi PostComposer va 3 trang For you/Following/Trending la
// SIBLING duoi HomeLayoutShell (khong phai cha-con), nen khong the truyen
// thang state qua props - phai qua 1 nguon du lieu dung chung.
let posts: Post[] = INITIAL_POSTS;
let listeners: Array<() => void> = [];

export function getPosts() {
  return posts;
}

export function addPost(post: Post) {
  posts = [post, ...posts];
  listeners.forEach((listener) => listener());
}

export function subscribeFeed(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

export function getServerSnapshot() {
  return INITIAL_POSTS;
}
