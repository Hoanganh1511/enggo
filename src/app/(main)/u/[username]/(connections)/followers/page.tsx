import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/api/users";
import { getFollowers } from "@/lib/api/follow";
import FollowListView from "@/components/profile/FollowListView";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfileFollowersPage({ params }: PageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername);

  const [page] = await Promise.all([getFollowers(username).catch(() => null)]);

  if (!page) notFound();

  return (
    <FollowListView username={username} kind="followers" initialPage={page} />
  );
}
