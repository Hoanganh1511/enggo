import React from "react";

const Loading = () => {
  return (
    <div className="border-b border-white/6 px-8 py-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="h-11 w-11 animate-pulse rounded-full bg-white/8" />

          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="h-4 w-32 animate-pulse rounded bg-white/8" />
              <div className="h-3 w-24 animate-pulse rounded bg-white/6" />
            </div>

            <div className="h-3 w-24 animate-pulse rounded bg-white/6" />
          </div>
        </div>

        <div className="h-5 w-5 animate-pulse rounded bg-white/6" />
      </div>

      {/* Content */}
      <div className="mt-5 space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-white/6" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-white/6" />
      </div>

      {/* Preview */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
        <div className="h-44 animate-pulse bg-white/5" />

        <div className="space-y-3 p-5">
          <div className="h-5 w-60 animate-pulse rounded bg-white/7" />
          <div className="h-3 w-48 animate-pulse rounded bg-white/6" />
          <div className="h-3 w-36 animate-pulse rounded bg-white/6" />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex gap-7">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-5 w-5 animate-pulse rounded-full bg-white/6" />
              <div className="h-3 w-8 animate-pulse rounded bg-white/6" />
            </div>
          ))}
        </div>

        <div className="h-5 w-5 animate-pulse rounded bg-white/6" />
      </div>
    </div>
  );
};

export default Loading;
