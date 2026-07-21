// "Completed" bi bo khoi bo trang thai vi khong co can cu that trong data
// (khong co field/nut danh dau da hoan thanh o dau ca) - chi giu 3 trang thai
// suy duoc that su tu du lieu da co: streak va open issues.
export type NodeStatus = "learning" | "need-review" | "inactive";

export function getNodeStatus(params: {
  streakCurrent: number;
  openIssueCount: number;
}): NodeStatus {
  if (params.openIssueCount > 0) return "need-review";
  if (params.streakCurrent > 0) return "learning";
  return "inactive";
}
