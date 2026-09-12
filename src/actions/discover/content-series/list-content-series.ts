"use server";
import { listContentSeries } from "@/lib/api/content-series";

export async function listContentSeriesAction() {
  return listContentSeries();
}
