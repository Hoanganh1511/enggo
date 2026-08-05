import { notFound } from "next/navigation";

import SeriesDetailContainer from "@/components/discover/series/SeriesDetailContainer";
import { SERIES } from "@/content/series-mock";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Chua co backend cho Series (xem series-mock.ts) nen "fetch" o day chi la
// tra cuu dong bo trong mang mock - van giu dang async server component +
// notFound() giong cac trang detail khac (vd w/[workspaceId]/nodes/[nodeId])
// de sau nay thay bang API that khong phai doi cau truc trang.
export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const series = SERIES.find((s) => s.slug === slug);
  if (!series) notFound();

  return <SeriesDetailContainer series={series} />;
}
