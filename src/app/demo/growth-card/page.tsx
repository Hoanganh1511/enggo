"use client";
import { Braces, Database, Target } from "lucide-react";
import GrowthCard from "@/components/ui/growth-card";

export default function GrowthCardDemoPage() {
  return (
    <div className="flex min-h-screen flex-wrap items-start gap-4 bg-gray-50 p-8">
      <GrowthCard
        icon={Target}
        title="Sự nghiệp lập trình"
        subtitle="Mục tiêu 2026"
        branches={6}
        frequency="daily"
        done={8}
        total={24}
      />
      <GrowthCard
        icon={Database}
        title="Backend"
        subtitle="NestJS · Prisma"
        branches={4}
        frequency="daily"
        done={13}
        total={20}
      />
      <GrowthCard
        icon={Braces}
        title="Node.js core"
        subtitle="Event loop · Streams"
        branches={3}
        frequency="monthly"
        done={0}
        total={12}
      />
    </div>
  );
}
