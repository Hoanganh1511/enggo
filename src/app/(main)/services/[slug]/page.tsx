import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HOME_FEATURES } from "@/components/discover/home-features-data";

// Trang chi tiet 1 dich vu GL - dich toi tu ServiceCard.tsx (/services). 6
// dich vu GL hien CHUA co tool that dung sau (chi la mockup tren /home va
// popover Services), nen o day hien 1 placeholder trung thuc "Sap ra mat"
// (icon/ten/mo ta that, KHONG bia them tinh nang gia) thay vi 404 khi bam
// "Open" tren ServiceCard - giu dung nguyen tac "khong tao fake
// functionality" cua app.
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = HOME_FEATURES.find((s) => s.slug === slug);
  if (!service) notFound();

  const Icon = service.icon;

  return (
    <div className="container px-6 py-16">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={15} />
        Tất cả dịch vụ
      </Link>

      <div className="mx-auto mt-10 flex max-w-md flex-col items-center text-center">
        <span
          className={`grid size-16 shrink-0 place-items-center rounded-2xl ${service.iconBg}`}
        >
          <Icon size={30} className="text-white" strokeWidth={2} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">
          {service.title}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">{service.description}</p>

        <span className="mt-6 rounded-full bg-surface-muted px-4 py-1.5 text-xs font-semibold text-ink-muted">
          Sắp ra mắt
        </span>
        <p className="mt-3 text-xs text-ink-faint">
          Chúng tôi đang xây dựng công cụ này — quay lại sau nhé!
        </p>
      </div>
    </div>
  );
}
