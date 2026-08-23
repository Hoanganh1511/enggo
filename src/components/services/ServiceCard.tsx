"use client";

import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HomeFeature } from "@/components/discover/home-features-data";

export function ServiceCard({
  service,
  isFavorite,
  onToggleFavorite,
}: {
  service: HomeFeature;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
}) {
  const Icon = service.icon;

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex flex-col rounded-lg border border-border bg-surface p-5 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-md"
    >
      <button
        type="button"
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(service.slug);
        }}
        className="absolute top-4 right-4 cursor-pointer text-ink-faint transition-colors duration-150 ease-out hover:text-amber-500"
      >
        <Star
          size={18}
          strokeWidth={2}
          className={isFavorite ? "fill-amber-400 text-amber-400" : ""}
        />
      </button>

      <span
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-xl transition-transform duration-150 ease-out group-hover:scale-105",
          service.iconBg,
        )}
      >
        <Icon size={26} className="text-white" strokeWidth={2} />
      </span>

      <h3 className="mt-4 text-base font-bold text-ink">{service.title}</h3>
      <p className="mt-1 text-sm text-ink-muted">{service.description}</p>

      <div className="mt-5 flex items-center justify-end">
        <span className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-ink transition-colors duration-150 ease-out group-hover:border-ink/30">
          Open
          <ArrowUpRight
            size={13}
            className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
