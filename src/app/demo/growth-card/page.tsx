"use client";
import { Braces, Database, Target } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import GrowthCard from "@/components/ui/growth-card";

export default function GrowthCardDemoPage() {
  return (
    // <Tooltip.Provider delayDuration={300}>
    <div className="flex min-h-screen flex-wrap items-start gap-4 bg-gray-50 p-8">
      <GrowthCard
        icon={Target}
        title="Sự nghiệp lập trình"
        subtitle="Mục tiêu 2026"
        branches={6}
        streak={{
          current: 12,
          longest: 38,
          last7: [true, true, true, true, false, true, true],
        }}
        lastActivity={new Date().toISOString()}
        done={8}
        total={24}
      />
      <GrowthCard
        icon={Database}
        title="Backend"
        subtitle="NestJS · Prisma"
        branches={4}
        streak={{
          current: 3,
          longest: 9,
          last7: [false, false, false, false, false, true, true],
        }}
        lastActivity={new Date().toISOString()}
        done={13}
        total={20}
      />
      <GrowthCard
        icon={Braces}
        title="Node.js core"
        subtitle="Event loop · Streams"
        branches={3}
        streak={{
          current: 0,
          longest: 4,
          last7: [false, false, false, false, false, false, false],
        }}
        lastActivity={null}
        done={0}
        total={12}
      />
    </div>
    // </Tooltip.Provider>
  );
}
