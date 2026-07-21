import type { Metadata } from "next";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import UseCasesSection from "@/components/landing/UseCasesSection";
import ScreenshotSection from "@/components/landing/ScreenshotSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

const TITLE = "Career Tree — Theo dõi hành trình học tập bằng cây phân cấp";
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
    <div className="h-full overflow-y-auto bg-surface text-ink">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <UseCasesSection />
      <ScreenshotSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
