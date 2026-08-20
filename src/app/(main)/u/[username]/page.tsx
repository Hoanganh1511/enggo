import { ChevronDown, Compass, PenLine, Rocket, Sparkles, Zap } from "lucide-react";
import { ProfileComingSoonBlock } from "@/components/profile/ProfileComingSoonBlock";

// Tab "Trang chu" - trang landing kieu "Career Universe" (port tu source
// treecareer-profile-universe-v2). Cac khoi Universe/Journey/Projects/
// Activity/Metric CHUA co du lieu that o backend (khong co skill tree/
// timeline/projects/activity log rieng cho user) nen la ProfileComingSoonBlock
// trung thuc thay vi mock nhu source goc - xem ProfileComingSoonBlock.tsx.
// Feed bai dang that van xem duoc o tab "Bài đăng" rieng (khong doi).
export default function ProfileHomeTabPage() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0">
        <div className="px-5 pt-8 pb-0 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✦</span>
                <h2 className="font-hand text-[30px] font-semibold tracking-[-0.02em] text-[#182338]">
                  My Career Universe
                </h2>
              </div>
              <p className="mt-1 text-[13px] text-slate-500">
                Mỗi hành tinh là một kỹ năng. Mỗi quỹ đạo là hành trình của
                mình.
              </p>
            </div>
            <button
              type="button"
              disabled
              className="flex h-10 cursor-not-allowed items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-[12px] font-medium text-slate-400 shadow-sm"
            >
              <Sparkles size={15} /> Chế độ khám phá <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="px-5 pt-6 lg:px-8">
          <ProfileComingSoonBlock
            icon={Sparkles}
            title="Career Universe"
            description="Bản đồ kỹ năng trực quan - từng hành tinh là một kỹ năng, đang được xây dựng."
            minHeight="420px"
          />
        </div>

        <div className="px-5 pt-6 lg:px-8">
          <ProfileComingSoonBlock
            icon={Compass}
            title="Hành trình của mình"
            description="Dòng thời gian các dấu mốc quan trọng trên hành trình phát triển sự nghiệp."
          />
        </div>

        <section className="px-5 pt-8 pb-10 lg:px-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="font-hand text-[23px] font-semibold text-[#182338]">
                Dự án nổi bật
              </h3>
              <p className="text-[12px] text-slate-500">
                Những thứ mình đang xây dựng
              </p>
            </div>
          </div>
          <ProfileComingSoonBlock
            icon={Rocket}
            title="Dự án"
            description="Danh sách dự án nổi bật của bạn sẽ hiển thị ở đây."
          />
        </section>
      </section>

      <aside className="border-l border-slate-200/70 px-5 pt-8 pb-8 xl:px-6">
        <ProfileComingSoonBlock
          icon={Zap}
          title="Chỉ số của mình"
          description="Biểu đồ tổng hợp học tập, phát triển, chia sẻ..."
        />
        <div className="mt-5">
          <ProfileComingSoonBlock
            icon={PenLine}
            title="Hoạt động gần đây"
            description="Nhật ký hoạt động của bạn sẽ hiển thị ở đây."
          />
        </div>
      </aside>
    </div>
  );
}
