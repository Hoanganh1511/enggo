"use client";

import { useState } from "react";
import Image from "next/image";
import { Type, Smile, Image as ImageIcon, BarChart3, AtSign, Send } from "lucide-react";

const TOOLBAR_ICONS = [Type, Smile, ImageIcon, BarChart3, AtSign];

// Avatar placeholder cho "nguoi dang dang nhap" - mock nay chua co API auth
// gan voi trang Community nen chua the lay anh that, dung pravatar lam anh
// trang tri (giong cach FeaturedSeriesBanner.tsx dung MEMBER_AVATARS).
const CURRENT_USER_AVATAR_URL =
  "https://i.pravatar.cc/64?u=community-composer-current-user";

// Composer "dang bai" o cuoi kenh - UI shell (chua co API dang bai that,
// chi giu local state cho input). Rut gon con 1 hang DUY NHAT (thay vi 2
// hang truoc do) de giam ~1 nua chieu cao - nut "Dang bai" rut gon thanh 1
// icon Send tron, "Hoi AI" tam bo (chua co tinh nang that, khong phai xoa
// han - co the them lai sau khi co huong thiet ke ro hon).
export function CommunityComposer() {
  const [value, setValue] = useState("");

  return (
    <div className="flex items-center gap-2 rounded-xl border-2 border-community-accent/30 bg-white/90 py-1.5 pr-1.5 pl-3 shadow-xl backdrop-blur-md">
      <Image
        src={CURRENT_USER_AVATAR_URL}
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0 rounded-full object-cover"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Viết điều bạn vừa học, thắc mắc hay chia sẻ..."
        className="h-8 min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
      />
      <div className="flex shrink-0 items-center gap-0.5">
        {TOOLBAR_ICONS.map((Icon, i) => (
          <button
            key={i}
            type="button"
            className="flex size-8 cursor-pointer items-center justify-center rounded-md text-ink-muted hover:bg-hover-bg hover:text-ink"
          >
            <Icon size={16} strokeWidth={2.25} />
          </button>
        ))}
      </div>
      <button
        type="button"
        aria-label="Đăng bài"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-community-accent text-white hover:bg-community-accent-hover"
      >
        <Send size={15} strokeWidth={2.25} />
      </button>
    </div>
  );
}
