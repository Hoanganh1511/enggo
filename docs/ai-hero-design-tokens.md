# AI Hero design tokens (reference: aihero.dev)

Token set do người dùng cung cấp (2026-09-14), rút ra từ **aihero.dev** (site
tham khảo cho UI đọc tài liệu - xem sidebar "Guides/Topics" đã dùng làm mẫu
cho `SeriesSidebar.tsx`). Lưu lại đây để các UI thiết kế **sau này** tuân
theo, thay vì chỉ nằm trong lịch sử chat.

> Lưu ý phạm vi: đây là token của MỘT site khác (aihero.dev), không phải
> token hệ thống hiện có của enggo (`--ink`, `--surface`, `--border`,
> `--primary`... trong globals.css). Trước khi áp dụng rộng, cần thống nhất
> áp dụng cho **toàn app** hay chỉ cho các màn hình phong cách "đọc tài liệu"
> (Series reading pages) - xem mục "Phạm vi áp dụng" cuối file.

## Foundations

- Font: Be Vietnam Pro (đã dùng sẵn trong enggo qua `--font-content`).
- Type scale (px): xs 11 / sm 12 / md 12.5 / lg 13 / xl 13.5 / 2xl 14 / 3xl 15 / 4xl 16.
  Base: size 16 / weight 400 / line-height 24.
- Màu (semantic, không dùng hex thô trong component):
  - `text.primary` #14161a, `text.secondary` #191510,
    `text.tertiary` oklab(0.1998 -0.0008 -0.0086 / 0.7)
  - `surface.base` #000000, `surface.muted` oklab(0.1998 -0.0008 -0.0086 / 0.055),
    `surface.raised` #fbfbfc, `surface.strong` #f1f2f5
  - `border.muted` oklab(0.1998 -0.0008 -0.0086 / 0.2),
    `border.strong` oklab(0.1998 -0.0008 -0.0086 / 0.35)
  - `focus.ring` oklab(0.1998 -0.0008 -0.0086 / 0.17451)
- Spacing (px): 4 / 5 / 6 / 8 / 9 / 10 / 11 / 12 (bậc rất nhỏ, sát nhau).
- Radius (px): xs 6 / sm 7 / md 8 / lg 9 / xl 10 / 2xl 11 (luôn nhỏ, khớp quy
  ước hiện tại của enggo - không dùng rounded-2xl/3xl Tailwind).
- Shadow: **rỗng/trong suốt ở mọi cấp** - tức site gốc là thiết kế PHẲNG,
  phân lớp bằng border/màu nền, không dùng đổ bóng.
- Motion: instant = 150ms (khớp `duration-150` đang dùng sẵn trong enggo).

## Accessibility

- Mục tiêu WCAG 2.2 AA, keyboard-first, focus-visible bắt buộc, có ràng buộc
  contrast rõ ràng.

## Quy tắc

**Phải làm:**
- Dùng token ngữ nghĩa (semantic), không hex thô trong component.
- Mỗi component tương tác phải định nghĩa đủ state: default/hover/
  focus-visible/active/disabled/loading/error.
- Component phải nêu rõ cách xử lý responsive + edge-case (nội dung dài,
  overflow, empty-state).
- Component tương tác phải mô tả hành vi keyboard/pointer/touch.
- Tiêu chí accessibility phải kiểm tra được (testable), không nói chung
  chung.

**Không được làm:**
- Không để text tương phản thấp hoặc focus indicator ẩn.
- Không tạo ngoại lệ spacing/typography lẻ tẻ ngoài scale ở trên.
- Không dùng nhãn mơ hồ / hành động không rõ nghĩa.
- Không ship component thiếu quy tắc state.

## Quy trình viết guideline (khi áp dụng cho 1 component mới)

1. Tóm tắt ý đồ thiết kế trong 1 câu.
2. Định nghĩa foundations/token ngữ nghĩa liên quan.
3. Định nghĩa anatomy, variant, tương tác, state.
4. Thêm tiêu chí accessibility (pass/fail).
5. Thêm anti-pattern, ghi chú migration, edge-case.
6. Kết bằng checklist QA.

## Phạm vi áp dụng (cần thống nhất với người dùng trước khi mở rộng)

Token này lấy từ 1 site tài liệu (docs) phẳng, mật độ chữ cao, gần như
không dùng ảnh/màu sắc trang trí - phù hợp nhất với các màn "đọc tài liệu"
kiểu Series (sidebar, trang đọc entry, trang quản lý). CHƯA áp dụng cho các
khu vực khác của enggo (feed, home rail, profile...) vì các khu đó vốn dùng
phong cách khác (card ảnh, màu nhấn, đổ bóng - xem `--shadow-card` trong
globals.css) - áp đặt token phẳng/không-đổ-bóng vào đó sẽ xung đột trực tiếp
với hệ thống hiện tại thay vì bổ sung cho nó.

## 2 thể loại bài viết trên enggo (2026-09-15)

Web hiện có **2 thể loại bài viết hoàn toàn tách biệt**, mỗi loại tự có hệ
thống thiết kế riêng - trước khi sửa/thêm UI cho "trang đọc bài", PHẢI xác
định đang nói tới loại nào, vì áp nhầm token của loại này sang loại kia sẽ
lạc tông ngay lập tức:

1. **Bài thường (Post)** - route `/p/[id]`, soạn qua Composer.tsx (Tiptap).
   Trang đọc: `ArticleHeader`/`ArticleBody`/`ArticleSidebar`/`ArticleActionBar`
   (like/comment), `ArticleAuthorCard`, `ArticleTableOfContents` (mục lục
   dạng pill card góc phải, ẩn dưới 1200px). Dùng **hệ token chính của app**
   (`--ink`/`--surface`/`--shadow-card`/`--primary` trong `:root`), ảnh bìa
   lớn, card có đổ bóng - hoàn toàn KHÔNG liên quan tới bộ token AI Hero
   trong file này.
2. **Bài Series (ContentSeriesEntry)** - route `/series/[slug]/[entrySlug]`,
   soạn qua `SeriesEntryForm`/`SeriesEntryEditor`. Trang đọc: sidebar cây
   category/entry riêng (`SeriesSidebar.tsx`, font Geist Sans - khác Inter
   của phần còn lại trong `.series-scope`), `EntryDownloadButtons` (Tải PDF/
   Markdown + switch Focus mode), Cinema/Focus mode (`SeriesFocusRow`/
   `SeriesFocusSidebar`/`SeriesFocusContent`/`SeriesFocusBackdrop` - cụm
   sidebar+nội dung bay ra giữa màn hình, ẩn header). Dùng 1 accent RIÊNG
   `rgb(245,196,81)` (gold) cho mọi trạng thái active/nút chính - KHÔNG dùng
   `--primary` cam của app. Đây mới là nơi áp bộ token AI Hero (phẳng,
   border thay shadow, rgba(20,22,26,*) cho text) theo "Phạm vi áp dụng" ở
   trên.

Khi nhận yêu cầu kiểu "sửa trang đọc bài" mà không rõ loại nào, hỏi lại thay
vì đoán - 2 cây component không dùng chung bất kỳ file style nào ngoài
`globals.css` gốc.
