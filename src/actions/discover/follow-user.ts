"use server";
import { followUser, unfollowUser, getFollowing, getFollowers } from "@/lib/api/follow";

export async function followUserAction(username: string) {
  return followUser(username);
}
export async function unfollowUserAction(username: string) {
  return unfollowUser(username);
}

// "Xem them" o trang danh sach Dang theo doi/Nguoi theo doi - client component
// khong goi thang apiFetch duoc (can auth() chi chay server), nen can wrapper
// action nay cho nut load-more.
export async function getFollowingAction(username: string, cursor?: string) {
  return getFollowing(username, cursor);
}
export async function getFollowersAction(username: string, cursor?: string) {
  return getFollowers(username, cursor);
}
