"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import type { Post } from "@/content/home-feed-mock";

type TextPost = Extract<Post, { kind: "text" }>;
type ImagePost = Extract<Post, { kind: "image" }>;
type GalleryPost = Extract<Post, { kind: "gallery" }>;
type VideoPost = Extract<Post, { kind: "video" }>;

// Text/Image/Gallery/Video - nhom "media" don gian: caption tuy chon o tren,
// media la trong tam thi giac chinh, khong co khung/nhan gi them (khac han
// nhom "attachment" - File/Link/Resource - la nhung the doc lap co elevation
// rieng).
export function TextBody({ post }: { post: TextPost }) {
  return (
    <p className="mt-1 text-[16px] wrap-break-word text-ink">{post.content}</p>
  );
}

export function ImageBody({ post }: { post: ImagePost }) {
  return (
    <>
      {post.content && (
        <p className="mt-1 text-[18px] wrap-break-word text-ink">
          {post.content}
        </p>
      )}
      <div className="mt-3 overflow-hidden rounded-xl border border-border">
        <Image
          src={post.image.url}
          alt={post.image.alt}
          width={900}
          height={560}
          className="h-auto w-full cursor-pointer object-cover transition-transform duration-300 hover:scale-[1.02]"
        />
      </div>
    </>
  );
}

export function GalleryBody({ post }: { post: GalleryPost }) {
  const visible = post.images.slice(0, 4);
  const extra = post.images.length - visible.length;
  return (
    <>
      {post.content && (
        <p className="mt-1 text-[16px] wrap-break-word text-ink">
          {post.content}
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-xl border border-border">
        {visible.map((img, i) => (
          <div
            key={img.url}
            className="relative aspect-square cursor-pointer overflow-hidden"
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 50vw, 320px"
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
            {i === visible.length - 1 && extra > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                +{extra}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function VideoBody({ post }: { post: VideoPost }) {
  return (
    <>
      {post.content && (
        <p className="mt-1 text-[16px] wrap-break-word text-ink">
          {post.content}
        </p>
      )}
      <div className="group relative mt-3 cursor-pointer overflow-hidden rounded-xl border border-border">
        <Image
          src={post.video.thumbnailUrl}
          alt="Video thumbnail"
          width={900}
          height={560}
          className="h-auto w-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-200 group-hover:bg-black/30">
          <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-ink shadow-panel transition-transform duration-200 group-hover:scale-110">
            <Play size={22} className="ml-0.5" fill="currentColor" />
          </span>
        </div>
        <span className="absolute right-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {post.video.duration}
        </span>
      </div>
    </>
  );
}
