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
