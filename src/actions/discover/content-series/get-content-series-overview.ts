"use server";
import { getContentSeriesOverview } from "@/lib/api/content-series";

export async function getContentSeriesOverviewAction(slug: string) {
  return getContentSeriesOverview(slug);
}
