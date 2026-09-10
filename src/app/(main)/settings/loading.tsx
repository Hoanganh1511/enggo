import Skeleton from "@/components/ui/skeleton";
import SectionContainer from "@/components/ui/section-container";

// Route-level Suspense fallback - khop dung khung SettingsShell.tsx (tieu
// de + 4 hang accordion dong, "Quyền riêng tư" mo mac dinh nen hang dau
// hien them vai dong noi dung gia lap tranh giat qua manh khi noi dung
// that thay vao).
export default function SettingsLoading() {
  return (
    <SectionContainer as="div" maxWidth="4xl" className="flex flex-col gap-5 py-4">
      <div>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="mt-2 h-3.5 w-72" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="flex h-12 w-full items-center gap-2.5 px-4">
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <div className="flex flex-col gap-4 border-t border-border p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-2 h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex h-12 items-center gap-2.5 rounded-lg border border-border bg-surface px-4"
          >
            <Skeleton className="size-4 rounded-sm" />
            <Skeleton className="h-3.5 w-40" />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
