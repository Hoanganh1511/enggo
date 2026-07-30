import React from "react";
import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/api/users";
import FollowListSidebar from "./components/FollowListSidebar";
type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
};

export default async function ConnectionsLayout({
  children,
  params,
}: LayoutProps) {
  const { username } = await params;
  const profile = await getProfileByUsername(
    decodeURIComponent(username),
  ).catch(() => null);
  if (!profile) notFound();
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <FollowListSidebar
        username={username}
        followingCount={profile.followingCount}
        followerCount={profile.followerCount}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
