import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/api/users";
import { getFollowing } from "@/lib/api/follow";
import FollowListView from "@/components/profile/FollowListView";

type PageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfileFollowingPage({ params }: PageProps) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername);

  const page = await getFollowing(username).catch(() => null);

  if (!page || !page) notFound();

  return (
    <FollowListView username={username} kind="following" initialPage={page} />
  );
}
