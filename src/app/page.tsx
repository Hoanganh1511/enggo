import type { Metadata } from "next";
import CinematicBackground from "@/components/landing/cinematic/CinematicBackground";
import CinematicNav from "@/components/landing/cinematic/CinematicNav";
import CinematicHero from "@/components/landing/cinematic/CinematicHero";
import TrustedBySection from "@/components/landing/cinematic/TrustedBySection";
import ProductPreviewSection from "@/components/landing/cinematic/ProductPreviewSection";
import FeatureCardsSection from "@/components/landing/cinematic/FeatureCardsSection";
import TestimonialsSection from "@/components/landing/cinematic/TestimonialsSection";
import PricingTeaserSection from "@/components/landing/cinematic/PricingTeaserSection";
import FinalCtaSection from "@/components/landing/cinematic/FinalCtaSection";
import CinematicFooter from "@/components/landing/cinematic/CinematicFooter";

const TITLE = "CareerTree — Theo dõi hành trình học tập bằng cây phân cấp";
const DESCRIPTION =
  "Biến mỗi mục tiêu học tập thành một cái cây — tách nhánh khi cần đào sâu, biết ngay chỗ nào đang bị bỏ quên.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: ["/demo.png"],
  },
};

export default function LandingPage() {
  return (
    <div className="relative h-full overflow-y-auto">
      <CinematicBackground />
      <CinematicNav />
      <CinematicHero />
      <TrustedBySection />
      <ProductPreviewSection />
      <FeatureCardsSection />
      <TestimonialsSection />
      <PricingTeaserSection />
      <FinalCtaSection />
      <CinematicFooter />
    </div>
  );
}
