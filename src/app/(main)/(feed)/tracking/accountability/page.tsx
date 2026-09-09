import { listMyTrackingGroupsAction } from "@/actions/tracking/accountability";
import { AccountabilityHubShell } from "@/components/tracking/AccountabilityHubShell";

export default async function TrackingAccountabilityPage() {
  const groups = await listMyTrackingGroupsAction().catch(() => []);
  return <AccountabilityHubShell initialGroups={groups} />;
}
