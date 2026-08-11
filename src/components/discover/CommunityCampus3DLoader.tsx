"use client";

import dynamic from "next/dynamic";
import type { ApiCommunitySummary } from "@/lib/api/types";

// Wrapper client rieng chi de goi next/dynamic({ssr:false}) - Next.js KHONG
// cho phep dynamic(..., {ssr:false}) truc tiep trong Server Component (page.tsx
// van la async Server Component de fetch du lieu), nen tach ra file client
// nay. CommunityCampus3D.tsx dung Canvas (WebGL) - bat buoc phai client-only,
// khong the render phia server.
const CommunityCampus3D = dynamic(
  () => import("./CommunityCampus3D").then((m) => m.CommunityCampus3D),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-140 w-full items-center justify-center rounded-xl border border-border"
        style={{
          background:
            "linear-gradient(135deg, #ede9fe 0%, #fdf2f8 55%, #eff6ff 100%)",
        }}
      >
        <div className="size-8 animate-spin rounded-full border-2 border-community-accent/25 border-t-community-accent" />
      </div>
    ),
  },
);

export function CommunityCampus3DLoader({
  communities,
  label,
  hint,
  emptyLabel,
}: {
  communities: ApiCommunitySummary[];
  label?: string;
  hint?: string;
  emptyLabel?: string;
}) {
  return (
    <CommunityCampus3D
      communities={communities}
      label={label}
      hint={hint}
      emptyLabel={emptyLabel}
    />
  );
}
