import { Check } from "lucide-react";

// Trang Pricing - MOCKUP 3 goi (Free/Pro/Team), CHUA phai gia/tinh nang that
// (app chua co Stripe/billing) - nguoi dung xac nhan qua AskUserQuestion la
// dung mockup ro rang + CTA khong that (giong nut "Buy Alls" o HomeHero.tsx),
// kem 1 dong ghi chu "minh hoa" de KHONG hien thi nhu gia chinh thuc that su
// (giu dung nguyen tac "khong tao fake functionality" cua app).
type Tier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "0đ",
    period: "/tháng",
    description: "Bắt đầu quản lý cuộc sống ở mức cơ bản.",
    features: [
      "Truy cập 6 dịch vụ GL cơ bản",
      "Lưu trữ giới hạn",
      "Hỗ trợ qua cộng đồng",
    ],
    cta: "Bắt đầu miễn phí",
  },
  {
    name: "Pro",
    price: "99.000đ",
    period: "/tháng",
    description: "Đầy đủ tính năng cho cá nhân nghiêm túc.",
    features: [
      "Tất cả tính năng của Free",
      "Đồng bộ không giới hạn thiết bị",
      "Nhắc nhở & báo cáo thông minh",
      "Hỗ trợ ưu tiên",
    ],
    cta: "Chọn gói Pro",
    highlighted: true,
  },
  {
    name: "Team",
    price: "249.000đ",
    period: "/tháng",
    description: "Dành cho nhóm hoặc gia đình cùng quản lý.",
    features: [
      "Tất cả tính năng của Pro",
      "Không gian làm việc chung",
      "Quản lý thành viên",
      "Báo cáo tổng hợp cả nhóm",
    ],
    cta: "Chọn gói Team",
  },
];

export default function PricingPage() {
  return (
    <div className="container px-6 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-[28px] font-extrabold text-ink sm:text-[36px]">
          Chọn gói phù hợp với bạn
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted sm:text-[16px]">
          Quản lý cuộc sống của bạn, từ cá nhân đến cả nhóm.
        </p>
        <p className="mt-2 text-xs text-ink-faint">
          * Bảng giá minh họa — sẽ cập nhật khi ra mắt chính thức.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={
              tier.highlighted
                ? "relative flex flex-col rounded-lg border-2 border-primary bg-surface p-6 shadow-md"
                : "relative flex flex-col rounded-lg border border-border bg-surface p-6"
            }
          >
            {tier.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white">
                Phổ biến nhất
              </span>
            )}

            <h2 className="text-lg font-bold text-ink">{tier.name}</h2>
            <p className="mt-1 text-sm text-ink-muted">{tier.description}</p>

            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-ink">
                {tier.price}
              </span>
              <span className="text-sm text-ink-muted">{tier.period}</span>
            </div>

            <ul className="mt-6 flex flex-1 flex-col gap-2.5">
              {tier.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-ink"
                >
                  <Check
                    size={16}
                    className="mt-0.5 shrink-0 text-primary"
                    strokeWidth={2.5}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={
                tier.highlighted
                  ? "mt-6 cursor-pointer rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-150 ease-out hover:opacity-85"
                  : "mt-6 cursor-pointer rounded-lg border border-[#e4e4e7] bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors duration-150 ease-out hover:bg-hover-bg"
              }
            >
              {tier.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
