import { notFound } from "next/navigation";
import { getSelfStatusAction } from "@/actions/users/get-self-status";
import { SeriesForm } from "@/components/series/SeriesForm";

// Tao Series moi - chi admin (giong pattern DailyDiaryPage: gate hien thi o
// FE qua getSelfStatusAction, AdminGuard o backend van chan doc lap moi
// request ghi that su).
export default async function NewSeriesPage() {
  const status = await getSelfStatusAction();
  if (!status.isAdmin) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-[22px] font-bold text-ink">Tạo Series mới</h1>
      <div className="mt-6">
        <SeriesForm />
      </div>
    </div>
  );
}
