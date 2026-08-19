# Style guide — khu vực Workspace (sidebar / main / DetailsPanel / ArticleFocusOverlay)

Tại sao có file này: ArticleFocusOverlay được port từ nhiều source demo liên
tiếp (control-center-reactor, tech-article-right-sidebar, treecareer-
knowledge-ironman, treecareer-article-reader...), mỗi source tự mang 1 bảng
màu/font/scale riêng. Kết quả: phần "chi tiết bài viết" lạc tông hẳn so với
sidebar/header/DetailsPanel của chính WorkspaceDetail (dùng token thích ứng
sáng/tối + font mặc định của app). File này chốt lại 1 hệ chung, dựa trên
những gì **đã dùng thật** trong `WorkspaceDetail.tsx`/`TopHeaderBar` — không
bịa ra token/scale mới. Khi thêm UI mới trong khu vực Workspace (kể cả khi
port từ 1 source ngoài), đối chiếu quy ước ở đây trước khi viết class.

## Phạm vi áp dụng

Áp dụng cho: `WorkspaceDetail.tsx`, `DetailsPanel`, `ArticleFocusOverlay.tsx`,
và bất kỳ panel/màn hình mới nào thêm vào khu vực đọc/quản lý workspace.

**Ngoại lệ đã ghi nhận** (KHÔNG áp dụng guide này): `KnowledgeUniverseCanvas.tsx`
(canvas bản đồ tri thức) và `WorkspaceGatewayOverlay.tsx` (hiệu ứng chuyển
cảnh sci-fi lúc chọn workspace). Hai chỗ này dùng bảng màu cyan/violet **cố
định** (không đổi theo theme) có chủ đích — đây là bề mặt "không gian vũ trụ"
mang tính trình diễn/không gian, không phải màn đọc/chỉnh sửa nội dung, nên
việc cố định tối là hợp lý. `ArticleFocusOverlay` KHÔNG thuộc diện này — đây
là màn đọc/sửa bài viết, ưu tiên dễ đọc và nhất quán hơn hiệu ứng.

> **Cập nhật 2026-08-14:** `KnowledgeUniverseCanvas.tsx` hiện KHÔNG còn được
> import/dùng ở bất kỳ đâu trong UI (đã bỏ map view khỏi `WorkspaceDetail.tsx`
> khi redesign theo `WORKSPACE_UI_SPEC.md`, xem `docs/engineering-log.md`) —
> file vẫn giữ lại phòng cần dùng lại, nhưng ngoại lệ ở trên hiện chỉ còn áp
> dụng thật sự cho `WorkspaceGatewayOverlay.tsx`.

> **Cập nhật 2026-08-17:** `WorkspaceGatewayOverlay.tsx` đã bị XOÁ hẳn (không
> còn hiệu ứng "cổng" khi chọn workspace, bấm thẻ điều hướng thẳng — xem
> `docs/engineering-log.md`). Ngoại lệ fixed-palette ở trang chọn workspace
> chuyển sang `workspace/[username]/layout.tsx` (nền ảnh `workspace-bg.png` —
> bầu trời/đảo nổi cố định, không đổi theo theme) và các màu `HERO_INK*`
> trong `WorkspaceSwitcher.tsx` (chữ tông tối cố định để luôn đọc được trên
> nền ảnh sáng cố định đó) — lý do tương tự nhóm cũ: đây là bề mặt trình diễn
> có ảnh nền riêng, không phải màn đọc/sửa nội dung.

## 1. Màu sắc — luôn dùng token, không hardcode hex/slate/cyan

Mọi màu phải đi qua CSS variable đã có trong `globals.css` (tự đổi theo
`prefers-color-scheme`), không viết thẳng `text-slate-400`, `border-white/[.08]`,
`bg-[#040d18]`, `text-cyan-300`... Cách dùng: class Tailwind đã map sẵn token
(`bg-surface`, `text-ink-muted`, `border-border`...) hoặc `style={{ color: "var(--ink)" }}`
khi cần giá trị động.

| Vai trò | Token | Ghi chú |
|---|---|---|
| Chữ chính | `var(--ink)` | Tiêu đề, nội dung chính |
| Chữ phụ | `var(--ink-muted)` | Mô tả, meta quan trọng vừa |
| Chữ mờ/nhãn | `var(--ink-faint)` | Eyebrow label, timestamp, số liệu phụ |
| Chữ disabled | `var(--ink-disabled)` | Trạng thái tắt |
| Nền panel | `var(--surface)` | Nền mặc định của card/panel |
| Nền lõm | `var(--surface-muted)` | Hàng phụ, chip, khối lồng bên trong panel |
| Nền nổi | `var(--surface-raised)` | Card nổi bật hơn nền xung quanh |
| Nền header dính | `var(--surface-header)` | Thanh sticky trên cùng (đã có blur alpha sẵn) |
| Viền | `var(--border)` | Viền mặc định |
| Viền đậm | `var(--border-strong)` | Nhấn viền (hover, focus) |
| Viền mờ | `var(--border-subtle)` | Divider rất nhẹ |
| Accent tương tác | `var(--primary)` | Nút chính, tab active, link, focus ring — **cyan ở dark theme, teal ở light** (đã đúng tinh thần "cyan" của các bản demo, chỉ là thích ứng theme thay vì cố định) |
| Accent AI / liên kết tri thức | `var(--knowledge)` | Đúng vai trò "violet = AI" từng thống nhất ở TechArticleSidebar — Knowledge Graph, gợi ý liên quan |
| Trạng thái thành công/đã xuất bản | `var(--success)` | |
| Trạng thái nháp/cảnh báo | `var(--warning)` | |
| Trạng thái xoá/nguy hiểm | `var(--danger)` | |
| Hàng đang chọn | `var(--active-bg)` / `var(--active-bg-strong)` / `var(--active-border)` | Đồng bộ với `GroupListItem` |
| Tag/chip trung tính | `var(--tag-bg)` / `var(--tag-text)` | |

Vì dark theme của app đã có `--primary: #22d3ee` (cyan) và `--knowledge: #8b5cf6`
(violet) sẵn — đổi sang token **không làm mất "cảm giác cyan/violet"** ở dark
mode, chỉ thêm khả năng thích ứng light mode + đồng bộ ngữ nghĩa màu với toàn
app (primary luôn là "tương tác", không phải "cứ cyan là đẹp").

## 2. Typography

- **Font**: dùng font mặc định của app (kế thừa tự nhiên, không set
  `font-family` riêng). KHÔNG dùng monospace/"HUD text" cho nhãn thường —
  monospace chỉ dành cho số liệu dạng bảng thật sự cần căn cột hoặc code, và
  khi đó dùng class `font-mono` có sẵn (map `--font-mono`), không tự tạo
  class riêng kiểu `focus-hud-text`.
- **Thang cỡ chữ** (lấy từ `WorkspaceDetail.tsx`/`DetailsPanel` đang dùng thật):

  | Cỡ | Dùng cho |
  |---|---|
  | `text-[9px]` | Eyebrow label viết hoa (`WORKSPACE`, `MODULE`), không nhỏ hơn mức này |
  | `text-[10px]`–`text-[11px]` | Meta text, badge, timestamp, list phụ |
  | `text-[11px]`–`text-[13px]` | Text chính trong list/card compact (tên nhóm, tên bài) |
  | `text-[14px]`–`text-[15px]` | Heading của panel/section |
  | `text-[30px]` | H1 cấp trang (tiêu đề bài viết) |
  | Heading trong nội dung bài (Tiptap) | theo `POST_PROSE_CLASS`: h1 30px / h2 23px / h3 18px — không tự đặt cỡ khác |

## 3. Icon (lucide-react)

| Ngữ cảnh | size | strokeWidth |
|---|---|---|
| Icon meta/inline (cạnh timestamp, số liệu nhỏ) | 9–11 | 1.75–1.9 |
| Icon trong nút/hàng chuẩn | 13–15 | 1.75–1.9 |
| Icon tiêu đề section | 14–16 | 1.75–1.9 |
| Icon minh hoạ lớn (empty state, feature nổi bật) | 20–26 | 1.5–1.75 |

Không tự chọn size tuỳ hứng theo "nhìn vừa mắt trong ảnh demo" — luôn rơi vào
1 trong các mốc trên.

## 4. Spacing & bo góc

- Padding panel: `p-3` (compact) / `p-4` (chuẩn) / `p-5` (rộng rãi).
- Gap hàng: `gap-1.5` / `gap-2` / `gap-3`.
- Bo góc: dùng đúng 3 mốc đã có trong `WorkspaceDetail.tsx` — `rounded-[9px]`
  (chip nhỏ), `rounded-[11px]` (hàng list, nút), `rounded-[13px]` (card/panel
  lớn). Overlay/shell cấp cao nhất mới dùng `rounded-2xl`. Không trộn thêm
  `rounded-md`/`rounded-xl` tuỳ tiện — chọn mốc gần nhất trong 3 mốc trên.

## 5. Motion

- Panel trượt vào (sidebar, DetailsPanel, shell): tái dùng `PANEL_SPRING`
  (`stiffness: 420, damping: 32, mass: 0.65`) đã định nghĩa trong
  `WorkspaceDetail.tsx` — không tự chế 1 spring config khác cho mỗi panel.
- Đổi nội dung/tab: fade + dịch nhẹ, `duration` 0.15–0.25s, không cần spring.
- **Không bao giờ animate `filter`/`blur()` qua Framer Motion** — filter buộc
  trình duyệt rasterize phần tử qua 1 layer riêng, gây mờ dư/giật kể cả sau
  khi animation kết thúc (đã gặp thật ở sidebar list và WorkspaceGatewayOverlay
  trong session trước — chỉ dùng transform/opacity).
- Hiệu ứng glow/pulse lặp vô hạn chỉ dùng khi gắn với trạng thái THẬT đang
  diễn ra (vd spinner loading) — không thêm glow/pulse thuần trang trí không
  gắn ý nghĩa gì, vì đó chính là thứ làm giao diện "lạc tông" HUD sci-fi so
  với phần còn lại của app.

## 6. Việc cần tránh (rút từ lịch sử thật của ArticleFocusOverlay)

- ❌ `text-slate-400`, `border-white/[.08]`, `bg-[#040d18]`, `text-cyan-300/60`...
  → ✅ `var(--ink-muted)`, `var(--border)`, `var(--surface-header)`, `var(--primary)`.
- ❌ `className="focus-hud-text"` cho nhãn thường → ✅ bỏ hẳn, dùng font mặc định.
- ❌ Tự đặt `rounded-md`/`rounded-xl` ngẫu nhiên mỗi component → ✅ 3 mốc bo góc ở mục 4.
- ❌ Hiệu ứng cơ khí/joint/dock/glow thuần trang trí không gắn dữ liệu thật
  → ✅ Nếu không chắc 1 hiệu ứng có ý nghĩa thật hay chỉ "cho đẹp giống demo",
  mặc định BỎ nó, ưu tiên rõ ràng/dễ đọc.

## 7. Khi port 1 source demo mới

1. Lấy đúng HÀNH VI/tương tác (layout, animation choreography, state machine).
2. Lấy màu/font/scale làm THAM KHẢO Ý TƯỞNG, không copy nguyên giá trị — map
   lại qua bảng ở mục 1–4 trước khi viết code.
3. Nếu 1 thứ trong source không có dữ liệu thật để gắn vào (demo panel, số
   liệu giả) — giữ nhưng gắn nhãn rõ "· DEMO"/"CHƯA LƯU SERVER" thay vì giả vờ
   là tính năng thật (quy ước đã áp dụng nhất quán từ AI Insights, Discussion
   tab, Performance HUD... trong session xây workspace này).

## 8. Nút CTA chính (reactor family) — gradient dùng chung

Nút hành động chính (primary CTA — "Viết bài mới", và các nút tương tự sau
này) trong khu vực Workspace dùng **1 gradient cố định chung**, tách biệt
khỏi bảng token thích ứng sáng/tối ở mục 1 — đây là ngoại lệ có chủ đích
(cùng nhóm với `WorkspaceGatewayOverlay.tsx`/`TransformModal`), KHÔNG áp
dụng nguyên tắc "luôn dùng token" cho riêng loại nút này:

```
bg-gradient-to-r from-[#20c5d8] via-[#269ce9] to-[#326eea]
text-white border border-white/30
shadow-[0_7px_18px_rgba(40,125,235,0.24)]
hover:shadow-[0_10px_25px_rgba(40,125,235,0.30)]
```

Implementation tham khảo/dùng lại: `components/workspaces/WorkspaceButton.tsx`
(variant `"primary"`, xem `getVariantStyles`) — khi cần 1 nút CTA chính mới
trong khu vực Workspace, ưu tiên tái dùng `<WorkspaceButton>` thay vì viết
lại gradient này thủ công ở nơi khác.
