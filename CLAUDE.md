# enggo — career-tree (frontend)

Next.js 16 App Router. Backend tương ứng: repo `career-tree-api` (NestJS + Prisma).
⚠️ Xem AGENTS.md: đây KHÔNG phải Next.js bạn từng biết — đọc/grep `node_modules/next/dist/docs/` trước khi code.

## Kiến trúc

- `src/app` — routes (App Router). Có route group `(auth)`, `(main)`,
  parallel route `@topbar` (xem docs/engineering-log.md để hiểu vì sao).
- `src/actions` — server actions, gọi backend. Chia theo domain.
- `src/lib/api` — client + types nói chuyện với career-tree-api.
- `src/components`— UI (feature-based: career-tree/, ui/, landing/).
- `src/stores` — Zustand.
- `src/auth.ts` — cấu hình next-auth (v5 beta).

## Lệnh (pnpm — KHÔNG dùng npm/yarn)

- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck` (thêm script: "tsc --noEmit")

## Landmines

- Trước khi code Next.js: grep trong node_modules/next/dist/docs, ĐỪNG đọc cả file (tốn token).
- next-auth đang dùng bản 5.0-beta → API khác v4, kiểm tra trước khi dùng.
- Ghi quyết định kiến trúc quan trọng vào docs/engineering-log.md (lý do, không phải "đã đổi gì").

@AGENTS.md

## UI conventions

### Dropdown / popover animation

Mọi dropdown/popover kiểu hover hoặc click-to-open (workspace switcher, app switcher menu, ...) dùng chung 1 animation `framer-motion` để đồng bộ cảm giác trong toàn app:

```tsx
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      ...
    </motion.div>
  )}
</AnimatePresence>
```

Khi thêm dropdown/popover mới, tái dùng đúng các giá trị trên (không tự chế animation khác).

### Khu vực Workspace (sidebar/main/DetailsPanel/ArticleFocusOverlay)

Xem `docs/workspace-style-guide.md` TRƯỚC KHI viết class màu/font/size mới ở
đây — đặc biệt khi port UI từ 1 source demo ngoài (dễ mang theo bảng màu/font
riêng của source, gây lạc tông với phần còn lại của app).

### Khu vực Dashboard (`/home`, `/articles`)

Xem `docs/home-dashboard-style-guide.md` TRƯỚC KHI thêm/sửa UI trong
`src/components/discover/home-dashboard/` hoặc `articles-hub/` —
grid/spacing/radius/màu/type scale/motion đầy đủ của khu vực này (port từ 2
source riêng, **cố tình** dùng bảng màu/font riêng thay vì token
`--ink`/`--border` của phần còn lại app — 2 hệ tách biệt có chủ đích, không
phải thiếu sót). 2 trang dùng CHUNG 1 sidebar (`HomeDashboardSidebar.tsx`),
đặt ở `(feed)/layout.tsx` — sidebar mới cho trang khác trong nhóm này thì sửa
đúng 1 chỗ đó, không tạo layout riêng từng trang.

### Font: nội dung vs UI/điều hướng

App có 2 font áp song song (xem `app/layout.tsx`, `globals.css`):
- `--font-sans` (Plex Mono) — mặc định toàn app, dùng cho UI/điều hướng: nút,
  tab, sidebar, menu, label, input.
- `--font-content` (Manrope, class tiện ích `font-content`) — dùng cho NỘI
  DUNG (thứ được đọc lâu/xem lâu): tiêu đề bài viết, thân bài, mô tả, bình
  luận, thông tin hiển thị (byline/thời gian/thống kê). Áp trực tiếp lên từng
  cụm text nội dung, KHÔNG đổi `--font-sans` mặc định.

Khi thêm màn hình mới có nội dung dài (bài viết, tài liệu, bình luận...), áp
`font-content` cho phần đọc, giữ nguyên phần điều khiển/điều hướng ở font mặc
định — xem `PostCard.tsx`, `ArticleBody.tsx`, `DocsMarkdown.tsx` làm ví dụ.
