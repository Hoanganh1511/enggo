"use server";

import { getMyJourney } from "@/lib/api/knowledge-groups";

// home/page.tsx goi truc tiep tu Server Component (giong listPostsAction) -
// khong revalidatePath, chi doc.
export async function getMyJourneyAction() {
  return getMyJourney();
}
