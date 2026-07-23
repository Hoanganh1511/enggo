// Bat/tat nhe cho tung tinh nang lon dang trien khai dan (xem plan Skill
// Tree nang cap) - doc tu env de co the bat thu o 1 moi truong ma khong
// doi code, mac dinh khop dung pham vi da lam xong trong tung phase.
// Khong phai remote feature-flag service (GrowthBook/LaunchDarkly...) -
// chi la hang so tinh, du cho quy mo hien tai cua repo.
function readFlag(envValue: string | undefined, fallback: boolean): boolean {
  if (envValue === "true") return true;
  if (envValue === "false") return false;
  return fallback;
}

export const FEATURES = {
  // Phase 1 - da xong: Skill Set that (Tier + Node) thay cho mock.
  skillTreeRealData: readFlag(
    process.env.NEXT_PUBLIC_FEATURE_SKILL_TREE_REAL_DATA,
    true,
  ),
  // Phase 2 - chua lam: Danh gia bang chung hoc tap (du an/chung chi/self-check).
  skillEvidence: readFlag(
    process.env.NEXT_PUBLIC_FEATURE_SKILL_EVIDENCE,
    false,
  ),
  // Phase 3 - chua lam: keo-tha sap xep skill/tier.
  skillTreeDragDrop: readFlag(
    process.env.NEXT_PUBLIC_FEATURE_SKILL_TREE_DND,
    false,
  ),
  // Phase 4 - chua lam: dashboard tong quan + benchmark.
  skillDashboard: readFlag(
    process.env.NEXT_PUBLIC_FEATURE_SKILL_DASHBOARD,
    false,
  ),
  // Phase 5 - chua lam: AI de xuat ky nang (rule-based truoc, LLM sau).
  aiSkillSuggestions: readFlag(
    process.env.NEXT_PUBLIC_FEATURE_AI_SKILL_SUGGESTIONS,
    false,
  ),
} as const;
