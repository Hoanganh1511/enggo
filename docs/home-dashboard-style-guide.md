# Style guide — Dashboard area (`/home`, `/articles`)

Tại sao có file này: `/home` và `/articles` dùng chung 1 "khu vực dashboard"
port từ 2 source riêng (`knowledge-dashboard-nextjs.zip` cho thư mục
component `home-dashboard/`, `knowledge-dashboard-note-knowledge-hub-style.zip`
cho thư mục `articles-hub/` — xem ghi chú "ĐỔI CHỖ ROUTE" ngay dưới đây, 2 tên
thư mục này KHÔNG còn khớp URL cùng tên nữa) — khu vực này **cố tình** giữ
bảng màu/spacing/font riêng, KHÔNG dùng token
`--ink`/`--border`... của phần còn lại app, theo yêu cầu người dùng lúc port
("giữ đúng toàn bộ UI/UX như trong file"). File này chốt lại đầy đủ hệ thống
thiết kế của khu vực đó (grid/spacing/màu/type scale/motion...) để khi mở
rộng thêm UI mới ở đây (thêm widget, sửa hero, thêm loại card...), đối chiếu
đúng quy ước ở đây thay vì tự chế giá trị mới hoặc vô tình lẫn token của phần
còn lại app vào.

## Phạm vi áp dụng

Áp dụng cho `src/components/discover/home-dashboard/` (widget dạng
"knowledge dashboard": `HomeHero.tsx`, `HomeArticleSection.tsx`,
`HomeRoadmapCard.tsx`...) và `src/components/discover/articles-hub/` (widget
dạng "articles hub": `ArticlesHero.tsx`, `CreatorRail.tsx`, `TopicsRail.tsx`,
`ArticlesPostGrid.tsx`, `RecentCollectionsSection.tsx`...), cộng
`HomeDashboardSidebar.tsx` (sidebar CHUNG cho cả 2 trang). **KHÔNG** áp dụng
cho phần còn lại app (dùng token `--ink`/`--border`/`--primary`... trong
`globals.css` như bình thường) — 2 hệ thống màu tách biệt có chủ đích.

> **ĐỔI CHỖ ROUTE (2026):** theo yêu cầu người dùng, nội dung 2 trang đã đổi
> URL cho nhau. `home/page.tsx` (URL `/home`) giờ compose từ
> `articles-hub/` (hero + Tác giả nổi bật + Chủ đề đang hot + Bài viết mới
> nhất + Bộ sưu tập gần đây); `articles/page.tsx` (URL `/articles`) giờ
> compose từ `home-dashboard/` (hero + Roadmap/Weekly Progress/Quote/Activity
> ở right rail). Tên thư mục component (`home-dashboard/`, `articles-hub/`)
> **KHÔNG đổi theo** — chỉ route/page.tsx nào import chúng mới đổi.
> Sidebar (`HomeDashboardSidebar.tsx`) giữ nguyên nhãn/href, không đổi.

### Kiến trúc route (layout dùng chung)

`/home` và `/articles` cùng nằm trong route group `(feed)` — sidebar
(`HomeDashboardSidebar`) sống ĐÚNG 1 chỗ trong `(feed)/layout.tsx` (không còn
layout riêng cho từng trang, không render thủ công trong `page.tsx`), tránh
remount sidebar khi chuyển qua lại giữa 2 trang. `.dashboard-scope` (class
gốc ở `(feed)/layout.tsx`, xem mục 23) nạp CSS var riêng của khu vực này,
cascade xuống sidebar + cả 2 trang con.

### Kiến trúc component (Server/Client split)

Mỗi trang composed từ nhiều Server Component nhỏ (`HomeHero`,
`HomeRoadmapCard`, `ArticlesHero`, `CreatorRail`, `TopicsRail`... — KHÔNG
`"use client"`, không hydrate, không JS) + vài client island cho phần thật sự
cần tương tác: `HomeArticleSection.tsx` (trên `/articles` sau khi đổi chỗ —
filter category + search dùng chung state), `ArticlesPostGrid.tsx` (trên
`/home` — dùng framer-motion nên cần boundary client, xem file đó),
`RecentCollectionsSection.tsx` (trên `/home` — tab chuyển đổi). Khi thêm
widget mới: mặc định viết Server Component trước, chỉ thêm `"use client"`
khi thật sự cần state/event handler cục bộ.

---

## 1. Content grid

```
Page
├── Sidebar: 240px (chung cho /home và /articles, xem (feed)/layout.tsx)
└── Workspace
    ├── Main: minmax(0, 1fr)
    └── Right rail: 320px (/articles only, sau khi đổi chỗ route (2026) —
                            /home không có right rail)
```

Dùng CSS Grid cho cấu trúc trang chính (`/articles` dùng
`lg:grid-cols-[minmax(0,1fr)_320px]` trong `articles/page.tsx` vì có right
rail — nội dung home-dashboard sau khi đổi chỗ; `/home` chỉ 1 cột, không
right rail). Sidebar `fixed` sống trong
`(feed)/layout.tsx`, offset nội dung qua `lg:pl-61` trên `<main>`. Container
BODY dùng chung (`mx-auto w-full px-10`) cũng đặt Ở ĐÚNG 1 CHỖ trong
`(feed)/layout.tsx` (bọc `{children}`, nằm trong `<main>`) — `page.tsx` của
từng trang KHÔNG tự khai báo `px-*`/`max-w-*` riêng nữa (trước đây `/home` và
`/articles` mỗi trang tự viết container lệch nhau, gây khác biệt padding
không chủ ý). Trang mới thêm vào nhóm `(feed)` tự động thừa hưởng container
này, chỉ cần lo phần grid/nội dung riêng của nó.

## 2. Spacing system

Đơn vị cơ sở 4px.

| Token | Value | Cách dùng tiêu biểu |
| --- | --- | --- |
| `space-1` | 4px | Khoảng cách icon nhỏ |
| `space-2` | 8px | Khoảng cách icon/chữ |
| `space-3` | 12px | Spacing nội bộ gọn |
| `space-4` | 16px | Padding card / gap phần tử |
| `space-5` | 20px | Spacing giữa component |
| `space-6` | 24px | Khoảng cách giữa section |
| `space-8` | 32px | Spacing section lớn |
| `space-10` | 40px | Spacing hero |
| `space-12` | 48px | Spacing layout lớn |
| `space-16` | 64px | Ngăn cách cấp trang |

**Quy tắc:**
- Gap component mặc định: 16px
- Gap section mặc định: 24–32px
- Padding nội bộ hero: 40px
- Tránh giá trị spacing tuỳ tiện trừ khi thật cần thiết — ưu tiên bội số của 4.

## 3. Border radius

Bề mặt bo tròn rõ nhưng có chừng mực.

| Component | Radius |
| --- | --- |
| Control nhỏ | 8px |
| Input | 10–12px |
| Card thường | 12–14px |
| Card lớn | 16px |
| Hero | 16px |
| Pill / badge | 9999px |
| Avatar | 9999px |

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-pill: 9999px;
```

Tránh bo góc quá lớn ở MỌI component — hệ thống phân cấp nên đến từ kích
thước/spacing, không chỉ từ radius.

## 4. Color system

Bảng màu tổng thể: trắng ấm + than chì + xanh trầm + màu ngữ nghĩa dùng hạn chế.

**Base**

```
Background       #FAFAF9
Surface          #FFFFFF
Surface subtle   #F7F7F5
Text primary     #172033
Text secondary   #667085
Text muted       #98A2B3
Border           #E7E9EE
```

**Primary** — chỉ dùng cho: điều hướng đang active, link, progress bar, focus
state, tab đang chọn, chỉ báo tương tác.

```
Primary          #2563EB
Primary soft     #EFF6FF
Primary border   #BFDBFE
```

**Semantic**

```
Success          #16A34A   Success soft   #F0FDF4
Warning          #D97706   Warning soft   #FFFBEB
Danger           #DC2626   Danger soft    #FEF2F2
```

**Quy tắc màu:** màu ngữ nghĩa dùng làm điểm nhấn, không phải nền lớn. Tỷ lệ
điển hình 1 màn hình: màu trung tính 80–90%, primary/accent 5–10%, màu ngữ
nghĩa &lt;5%.

## 5. Typography

Sans-serif trung tính hiện đại:

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

> Lưu ý: đây là font RIÊNG của khu vực này (theo đúng source gốc) — KHÔNG
> phải `--font-sans`/`--font-content` của phần còn lại app (hiện là Plex
> Mono/Manrope, xem `app/layout.tsx`).

| Role | Size | Weight | Line height |
| --- | --- | --- | --- |
| Display | 40px | 700 | 1.1 |
| H1 | 28px | 700 | 1.2 |
| H2 | 20px | 700 | 1.3 |
| H3 | 16px | 600 | 1.4 |
| Body | 14–15px | 400 | 1.5 |
| Small | 12–13px | 400 | 1.4 |
| Caption | 11–12px | 400 | 1.4 |

Hero heading: 40px/700/1.1 (màn nhỏ: 32px/700/1.15).

**Quy tắc:** in đậm chỉ để phân cấp, không lạm dụng weight nặng khắp nơi;
thông tin phụ phải rõ ràng "nhạt" hơn; tiêu đề bài viết phải nổi hơn metadata;
tránh chữ hoa toàn bộ trừ nhãn nhỏ/label điều hướng.

## 6. Shadows & elevation

Độ sâu rất nhẹ, tránh shadow "nổi" rõ.

```css
--shadow-card: 0 1px 3px rgba(16, 24, 40, 0.06);
--shadow-hover: 0 8px 24px rgba(16, 24, 40, 0.08);
```

| Level | Dùng cho |
| --- | --- |
| 0 | Nội dung phẳng |
| 1 | Card |
| 2 | Card khi hover |
| 3 | Dropdown / popover |
| 4 | Modal / dialog |

Ưu tiên border + shadow rất nhẹ hơn là shadow lớn.

## 7. Borders

Border mặc định: `1px solid #E7E9EE`. Dùng border để phân định bề mặt 1 cách
tinh tế — card/input/sidebar separator đều 1px. Tránh border lồng nhiều lớp,
tránh border màu tối. Trạng thái active nên dùng nền/accent thay vì border dày.

## 8. Sidebar

Rộng 240px. Cấu trúc: Brand → điều hướng chính → divider → điều hướng phụ →
spacer co giãn → quote/thông điệp cá nhân.

**Nav item:** cao 40px, padding ngang 12px, radius 8px, icon 18–20px, gap 12px.

**Active state:** nền `#EFF6FF`, chữ `#2563EB`/màu tối (tránh nền xanh đậm).

**Brand:** icon nhỏ + tên sản phẩm/workspace + mô tả ngắn, vd:

```
Tuan's Knowledge
Write · Learn · Build · Grow
```

## 9. Header / Search

Header cao 64px. Search: rộng 540–560px, cao 40px, radius 10px — cảm giác như
1 command/search surface hơn là input form thông thường.

```
Background: #F7F7F5
Border: transparent
Placeholder: #98A2B3
Icon: 18px
```

Khi focus: nền `#FFFFFF`, border `#BFDBFE`.

## 10. Hero section

Cao 336px, radius 16px, padding 40px.

```
┌──────────────────────────────────────────────┐
│ Eyebrow                                      │
│                                              │
│ Large headline                               │
│ Supporting description                       │
│                                              │
│ [Primary CTA] [Secondary CTA]                │
│                                      Image    │
└──────────────────────────────────────────────┘
```

Ảnh nền: chủ đề thiên nhiên/núi non/khám phá, tương phản dịu, tông ấm tự
nhiên, chủ thể lệch phải, đủ khoảng trống bên trái cho chữ. Thêm overlay
tối/trung tính nhẹ nếu cần giữ độ đọc được của chữ. Text max-width: 600px.

## 11. Buttons

**Primary:** cao 44px, padding ngang 18px, radius 10px, font 14px/600. Nền
`#172033`, chữ trắng. Hover: `translateY(-1px)` + shadow nhẹ.

**Secondary:** nền trắng, border `#E7E9EE`, chữ `#172033`.

Chỉ 1 CTA nổi bật về thị giác mỗi khu vực, vd `[Start Writing]` (primary) +
`[Explore Roadmap]` (secondary).

## 12. Category cards

Shortcut nhẹ nhàng, không phải widget dashboard nặng. Cao 112–128px, radius
12px, padding 16px, gap 16px. Mỗi card: icon + tên danh mục + số bài + mũi
tên. Hover: `translateY(-2px)`, shadow tăng nhẹ, border chuyển màu — KHÔNG
scale mạnh.

## 13. Article cards

Component quan trọng nhất. Ảnh tỉ lệ ~16/8.5, radius 12px.

```
┌──────────────────────┐
│       Cover          │
├──────────────────────┤
│ Category badge       │
│ Article title        │
│ Short excerpt        │
│ Author · Date · Read │
└──────────────────────┘
```

Title: 16px/600–700/line-height 1.35, giới hạn ~2 dòng. Excerpt: 13–14px/1.5,
giới hạn ~2–3 dòng.

## 14. Badges / tags

Nền mềm (soft background), vd "Technology". Font 11–12px/500–600, padding
`4px 8px`, radius 9999px. Tránh outline mạnh.

## 15. Roadmap

Trực quan hoá tiến độ dạng dọc. Node: đường kính 14–16px, border 2px.
Connector: rộng 1–2px. Item: title 14px/600, description 12–13px, progress
bar cao 4–5px. Progress bar radius 9999px, màu primary.

Trạng thái: chưa bắt đầu (○ trung tính) · đang học (◉ primary) · hoàn thành
(✓ success).

## 16. Today's goal / checklist

Gọn: item cao 36–40px, checkbox 18px, gap 10px. Trạng thái đã check: checkbox
chuyển primary, chữ nhạt đi, có thể gạch ngang. Header dạng `Today's goal
3/5` — bộ đếm nhạt nhưng vẫn rõ.

> Lưu ý: `HomeWeeklyProgressCard.tsx` hiện đã thay khối checkbox giả (không
> có dữ liệu thật đứng sau) bằng "Tiến độ tuần này" — số liệu THẬT từ journey (streak/số
> ngày học/số mục đã hiểu), không phải checklist tương tác — xem
> `docs/engineering-log.md`. Áp style ở mục này nếu sau này có 1 checklist
> thật (có model/API đứng sau) được thêm vào.

## 17. Activity feed

Timeline/list gọn. Mỗi item: icon/avatar → title → metadata phụ → timestamp.
Spacing dọc 16–20px. Tránh kiểu "card trong card".

## 18. Quote / personal element

Thêm cá tính, tránh cảm giác admin panel chung chung. Radius 14–16px, padding
24px, nền trung tính rất nhạt. Có thể dùng hoạ tiết nhẹ (núi non/texture
giấy/phong cảnh dịu/line art trừu tượng) — opacity đủ thấp để chữ vẫn là
trọng tâm.

## 19. Iconography

Hệ icon outline nhất quán (Lucide/Heroicons — repo đang dùng `lucide-react`
sẵn, ưu tiên tiếp tục dùng, không thêm bộ icon thứ 2).

| Ngữ cảnh | Size |
| --- | --- |
| Navigation | 18–20px |
| Button | 17–18px |
| Card | 20–24px |
| Feature | 24–28px |
| Decorative | 28–32px |

Stroke weight 1.75–2px. Tránh trộn icon filled và outline khi không cần thiết.

## 20. Motion system

Chuyển động nên "trầm", không phô trương. Dùng `framer-motion` (đã có sẵn
trong repo).

- **Page entrance:** `opacity 0→1`, `y 12→0`, duration 0.35–0.45s, ease `easeOut`.
- **Stagger:** `staggerChildren` 0.05–0.08s.
- **Card hover:** `y -2px`, duration 0.18–0.22s.
- **Button hover:** `y -1px`, duration 0.15–0.18s.

**Tránh:** xoay lớn, scale quá tay, animation kiểu bouncy, transition dài,
animate độc lập từng phần tử nhỏ lẻ. Animation nên truyền đạt trạng thái/phân
cấp, không phải trang trí.

Với `prefers-reduced-motion`: dùng `useReducedMotion()` của Framer Motion, tắt
hoặc giảm transition không thiết yếu khi được yêu cầu (xem mục Accessibility).

## 21. Responsive rules

- **≥1280px:** đầy đủ Sidebar + Main + Right rail.
- **1024–1279px:** thu gọn gap/padding hero/rộng right rail; có thể chỉ còn
  Sidebar + Main, đẩy widget right-rail xuống dưới main nếu cần.
- **&lt;1024px:** gộp sidebar vào điều hướng mobile — chỉ còn top bar + main
  content.
- **&lt;640px:** 1 cột. Page padding 16px, section gap 24px, hero padding
  24px, hero heading 30–32px, card full width.

## 22. Content density

Mật độ thông tin trung bình-thấp, màn hình cần "thở". Tỷ lệ hình dung:
whitespace 30–40%, content 45–55%, UI chrome 10–15%. KHÔNG cố nhồi mọi số
liệu vào trang chủ — trang chủ chỉ cần trả lời: đang học gì? nên đọc gì?
tiếp theo nên làm gì? gần đây đã hoàn thành gì?

## 23. Design tokens

Đã khai báo THẬT trong `globals.css`, dưới class `.dashboard-scope` (áp ở gốc
`(feed)/layout.tsx`, KHÔNG phải `:root` — tránh ghi đè token toàn app cùng
tên như `--background`/`--border`/`--primary`, vốn đã tồn tại với giá trị
khác):

```css
.dashboard-scope {
  --background: #fafaf9;
  --surface: #ffffff;
  --surface-subtle: #f7f7f5;

  --foreground: #172033;
  --foreground-muted: #667085;
  --muted: #98a2b3;

  --border: #e7e9ee;

  --primary: #2563eb;
  --primary-soft: #eff6ff;

  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;

  --shadow-card: 0 1px 3px rgba(16, 24, 40, 0.06);
  --shadow-hover: 0 8px 24px rgba(16, 24, 40, 0.08);
}
```

Component MỚI trong `articles-hub/` dùng đúng bộ token này qua
`bg-[var(--surface)]`/`text-[var(--foreground)]`/... — đổi màu = sửa 1 chỗ ở
đây. Component CŨ trong `home-dashboard/` (viết trước khi có `.dashboard-scope`)
vẫn dùng hex trực tiếp từ source gốc (`#162033`/`#edf0f4`/`#3b82f6`...) —
**các giá trị này lệch nhẹ** so với token ở trên (vd `#162033` vs
`#172033`, `#edf0f4` vs `#e7e9ee`, `#3b82f6` vs `#2563eb`) vì 2 source port ở
2 thời điểm khác nhau dùng bảng màu hơi khác nhau. Chưa retrofit `home-dashboard/`
sang dùng token chung (chưa được yêu cầu, và khác biệt gần như không nhận ra
bằng mắt thường) — nếu cần đồng nhất tuyệt đối, đó là việc cần làm rõ ràng,
không nên tự ý đổi âm thầm.

`--radius-sm`/`--radius-md`/`--radius-lg` (mục 3) hiện CHƯA khai báo thành CSS
var - các component vẫn dùng class Tailwind (`rounded-lg`, `rounded-xl`...)
trực tiếp, khớp giá trị ở mục 3 nhưng không tham chiếu qua biến.

## 24. Accessibility

Yêu cầu tối thiểu: tương phản WCAG AA cho text thường; focus bàn phím rõ
ràng; button phải có label truy cập được; control chỉ-icon cần `aria-label`;
ảnh cần `alt` có nghĩa; trạng thái checkbox thao tác được bằng bàn phím;
KHÔNG truyền đạt trạng thái chỉ qua màu sắc; tôn trọng
`prefers-reduced-motion` (dùng `useReducedMotion()` của Framer Motion để tắt/giảm
transition không thiết yếu).

## 25. Do / Don't

**Nên:**
dùng whitespace rộng rãi · giữ bề mặt trắng/trung tính · dùng xanh dương hạn
chế · dùng ảnh chụp để thêm cá tính · giữ typography mạnh, dễ đọc · dùng
border tinh tế · dùng shadow trầm · animate transition nhẹ nhàng · giữ phân
cấp nội dung rõ ràng.

**Không nên:**
không làm mọi card đầy màu sắc · không dùng gradient lớn · không lạm dụng
glassmorphism khắp nơi · không dùng drop shadow quá tay · không bo tròn mọi
component 24–32px · không animate mọi thứ · không nhồi quá nhiều số liệu vào
dashboard · không để metadata phụ cạnh tranh với title · không biến sản phẩm
thành 1 admin panel doanh nghiệp chung chung.

## 26. Visual personality

Cảm giác cuối cùng: **1 trung tâm điều khiển cá nhân, điềm tĩnh, cho việc học,
sáng tạo và ghi chép tri thức.**

```
Personal       █████████░
Professional   ████████░░
Editorial      ████████░░
Playful        ███░░░░░░░
Corporate      ████░░░░░░
Technical      ███████░░░
Minimal        █████████░
```

Giao diện nên truyền tải sự tò mò + tiến bộ + sự chỉn chu, chứ không phải áp
lực năng suất.
