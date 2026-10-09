# Style guide — Planner "macOS System Settings" design system

Tại sao có file này: nguyên văn 1 spec rất dài (36 mục: màu/typography/modal/
sidebar/section/segmented control/toggle/checkbox/input/dropdown/shadow/
spacing/radius/motion...) đã được chốt và áp dụng thật vào
`PlannerSettingsModal.tsx` rồi lan ra toàn bộ `PlannerShell.tsx` (retint
`--planner-*`) trong phiên làm việc 2026-10-08. Yêu cầu người dùng: "lưu
phong cách vào markdown để các chỗ khác sau phát triển cũng phải duyệt cái
thiết kế concept, style đó" — file này là **nguồn tham chiếu bắt buộc** khi
thêm UI mới trong khu vực Planner (`src/components/planner/`), thay vì chép
lại spec gốc (đã nằm rải rác trong code/lịch sử chat), rút thẳng từ
`globals.css`/`PlannerSettingsModal.tsx` — những gì **đã chạy thật**.

> **Cập nhật 2026-10-09 — refactor Planner.** Hệ token/màu/control trong file
> này vẫn đúng nguyên vẹn. Nhưng **mô hình dữ liệu và tập component đã đổi
> hẳn**: xem "Mô hình dữ liệu" và "Component shared" bên dưới trước khi viết
> UI mới. Các component sau **đã bị xoá**, đừng đi tìm: `EventForm`,
> `ReminderForm`, `RecurrenceEditor`, `SharedCalendarForm`, `TaskTypePicker`,
> `TaskListView`, `CalendarView`, `calendar-types.ts`,
> `calendar-model-bridge.ts`, `life-item-types.ts`,
> `life-item-palette-context.tsx`, `calendar-events.ts`.

## Component shared — dùng lại, đừng vẽ lại

Mọi chỗ hiển thị/sửa một `PlannerItem` đều phải đi qua các component này.
Trước refactor có 6 cách vẽ thẻ gần giống nhau và 4 form riêng, mỗi cái tự
quyết định badge nào được hiện — sửa 1 chi tiết phải nhớ sửa 6 chỗ, và thực
tế chúng đã trôi khác nhau.

| Việc cần làm | Dùng |
| --- | --- |
| Hiện 1 item (lưới giờ / hàng "Cả ngày" / danh sách / ô lưới tháng) | `PlannerItemCard` với `variant="timed" \| "allDay" \| "list" \| "compact"` |
| Tạo **hoặc** sửa item (mọi loại) | `PlannerItemForm` — một form duy nhất |
| Panel chi tiết 1 item | `PlannerItemDetail` |
| Chấm category / badge status / dấu ưu tiên / icon loại | `planner-indicators.tsx` |
| Chuỗi giờ, địa điểm, link họp, thời lượng | `planner-datetime.tsx` (`formatSchedule()` là nơi DUY NHẤT biến lịch thành chữ) |
| Trạng thái rỗng / đang tải / lỗi / lỗi inline trong form | `planner-states.tsx` |
| Modal có dropdown lồng bên trong | `PlannerModal` (truyền `container` xuống — xem mục Portal-safe) |

Validate: `validateDraft()` trong `planner-domain.ts` — **cùng một bộ luật
với backend** (`PlannerService.normalizeSchedule`). Đừng viết lại luật
ngày/giờ trong component.

## Category vs status vs priority — 3 trục độc lập

Nguyên tắc từ design reference ("Keep category and status separate"):

- **Category** quyết định **màu thẻ**: nền `light` + thanh accent `main` dọc
  mép trái (3px, **cách lề trái 3px**, bo tròn 2 đầu), bo góc 7px, không
  border 4 cạnh, không shadow mặc định — chỉ `hover:brightness-95`.
- **Status** là lớp **riêng**: badge/chấm/gạch ngang. **Không** tô lại cả thẻ
  theo status, nếu không category mất khả năng nhận diện.
- **Priority** độc lập với cả hai, hiện bằng dấu `!`/`!!`/`!!!` + màu.
- Mọi trạng thái phải hiểu được **không chỉ nhờ màu**: status có icon + chữ,
  priority có dấu `!` + nhãn ẩn cho screen reader.

`OVERDUE` là trạng thái **suy ra ở backend lúc đọc**, không lưu trong DB và
người dùng không chọn tay được (`PLANNER_STATUS_META[...].selectable`).

## Phạm vi áp dụng

Mọi UI mới trong `src/components/planner/` (modal, popover, form, dropdown,
toolbar...) — kể cả khi port 1 ý tưởng từ nơi khác trong app — đối chiếu
token/pattern ở đây trước khi tự chế màu/spacing/motion mới. Đã áp dụng cho:
`PlannerSettingsModal.tsx` (toàn bộ), `PlannerShell.tsx` (toolbar, lưới
tuần/tháng, `QuickAddPopover`, các popover chi tiết item).

## Triết lý ("7 quy tắc")

1. **Native-first** — mọi control trông/cảm giác như 1 control hệ thống thật
   (macOS System Settings), không phải 1 component web tự chế lòe loẹt.
2. **Neutral chiếm 85-90%** — nền/chữ/viền gần như toàn bộ dùng thang xám
   trung tính (`--mset-*`); màu accent (`--mset-accent` / `--planner-primary`,
   xanh `#007AFF`) CHỈ xuất hiện ở: trạng thái chọn/active, nút hành động
   chính, focus ring. Không rải màu accent vào nơi không phải hành động.
2b. **Semantic color tách khỏi accent** — success/warning/danger
   (`--mset-success #34C759` / `--mset-warning #FF9F0A` / `--mset-danger
   #FF3B30`) chỉ dùng cho đúng ngữ nghĩa trạng thái, không dùng thay accent.
3. **Bề mặt kính (glass) chỉ ở modal/popover nổi hẳn lên trên** (xem token
   Modal bên dưới) — bề mặt nằm trong luồng trang bình thường (card lịch,
   sidebar) dùng nền đặc `--mset-surface`/`--mset-surface-secondary`, KHÔNG
   backdrop-filter.
4. **Không dùng control HTML mặc định của trình duyệt** — không
   `<select>`/`<input type=checkbox>`/`<input type=radio>` thô; luôn 1
   component tự vẽ (xem Checkbox/SegmentedControl/Toggle/Dropdown bên dưới).
   Quy ước này áp dụng toàn app, không riêng Planner.
5. **Motion thống nhất** — mọi dropdown/popover dùng ĐÚNG 1 preset
   framer-motion (xem mục Motion) đã quy ước chung toàn app trong CLAUDE.md;
   Planner không có preset riêng.
6. **1 cặp màu KHÔNG đổi tên, chỉ đổi giá trị khi retint** — `--planner-*`
   luôn trỏ tới `--mset-*` (xem bảng mapping) thay vì hex thẳng, để đổi cả hệ
   màu Planner chỉ cần sửa 1 khối `:root { --mset-* }`.
7. **Token Portal-safe** — MỌI custom property Planner cần đọc được bên
   trong Radix Portal (Dialog/Popover/DropdownMenu — các primitive này
   teleport ra `document.body`, ngoài mọi `.scope` div) phải khai báo ở
   `:root`, KHÔNG BAO GIỜ trong 1 class scope. `font-family` không phải
   custom property nên không tự "nhảy" qua ranh giới Portal theo cách tương
   tự — phải set tường minh `style={{ fontFamily: "var(--planner-font-family)" }}`
   trên từng `Dialog.Content`/`PopoverContent` Portal thay vì dựa vào kế
   thừa CSS tự nhiên.

## Màu sắc

### Token gốc `--mset-*` (macOS System Settings), khai báo ở `:root` trong
`globals.css`:

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--mset-background` | `#f5f5f7` | Nền ngoài cùng (vd nền trang sau modal) |
| `--mset-surface` | `#ffffff` | Bề mặt card/modal chính |
| `--mset-surface-secondary` | `#f8f8fa` | Sidebar nav trong modal, nền phụ |
| `--mset-surface-tertiary` | `#f2f2f5` | Nền rãnh SegmentedControl |
| `--mset-text-primary` | `#1d1d1f` | Chữ chính |
| `--mset-text-secondary` | `#6e6e73` | Chữ phụ, label không active |
| `--mset-text-tertiary` | `#86868b` | Chữ mô tả/ghi chú nhỏ |
| `--mset-text-disabled` | `#a1a1a6` | Chữ control bị khoá |
| `--mset-border` | `rgba(0,0,0,.08)` | Viền nhạt (divider ngang trong card) |
| `--mset-border-strong` | `rgba(0,0,0,.12)` | Viền input/control cần rõ hơn |
| `--mset-divider` | `rgba(0,0,0,.07)` | Divider giữa các `Section` |
| `--mset-accent` | `#007aff` | Accent DUY NHẤT (chọn/active/nút chính) |
| `--mset-accent-hover` | `#006fe6` | Hover của accent |
| `--mset-accent-active` | `#005fcc` | Active/pressed của accent |
| `--mset-accent-soft` | `#eaf3ff` | Nền pill/row khi accent ở dạng nhạt |
| `--mset-accent-subtle` | `#f3f8ff` | Nền rất nhạt (vd dải "today" trên lịch) |
| `--mset-success` | `#34c759` | Trạng thái thành công (semantic, KHÔNG phải accent) |
| `--mset-warning` | `#ff9f0a` | Trạng thái cảnh báo |
| `--mset-danger` | `#ff3b30` | Trạng thái lỗi/xoá |
| `--mset-info` | `#007aff` | Trạng thái thông tin (= accent) |

### Mapping `--planner-*` (dùng trong component, KHÔNG dùng `--mset-*` trực
tiếp ở component — chỉ `globals.css` được phép đọc `--mset-*`):

```
--planner-bg              → --mset-background
--planner-surface         → --mset-surface
--planner-surface-soft    → --mset-surface-secondary
--planner-text-primary    → --mset-text-primary
--planner-text-secondary  → --mset-text-secondary
--planner-text-muted      → --mset-text-tertiary
--planner-border          → --mset-border-strong
--planner-border-soft     → --mset-border
--planner-grid-line       → color-mix(--planner-border-soft 70%, transparent)
--planner-primary         → --mset-accent
--planner-primary-soft    → --mset-accent-soft
--planner-today-bg        → --mset-accent-subtle
```

Lý do tách lớp mapping này: đổi cả "da" của Planner (vd sang theme khác) chỉ
cần sửa khối `--mset-*`, không phải sửa từng file component.

## Typography

- Font: `--planner-font-family` = `-apple-system, BlinkMacSystemFont, "SF Pro
  Display", "SF Pro Text", var(--font-sans), sans-serif` — khai báo ở `:root`
  (Portal-safe, xem quy tắc 7). Set tường minh qua `style={{fontFamily:
  "var(--planner-font-family)"}}` trên mọi `Dialog.Content`/`PopoverContent`.
- Scale đã dùng thật: `18.4px` (tiêu đề toolbar, = 16px × 1.15 theo yêu cầu
  "to hơn 15%"), `14px`/`13px` (label chính), `12.5px`/`12px` (control/nút),
  `11px`/`10.5px`/`9px` (caption/muted/badge nhỏ). Không có bảng scale cố
  định — chọn theo mật độ UI xung quanh, ưu tiên các giá trị đã dùng ở trên
  thay vì bịa số mới.
- Số liệu dạng liệt kê (giờ, ngày) có thể tách span riêng cho số vs đơn vị
  (vd nhãn giờ "1 PM": số `font-medium 12px`, "PM" `font-normal 9px` nhạt
  hơn) khi muốn nhấn phần số.

## Modal (Dialog)

Pattern từ `PlannerSettingsModal.tsx`:

```tsx
<Dialog.Overlay className="fixed inset-0 z-50" style={{
  backgroundColor: "rgba(0,0,0,.18)",
  backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
}} />
<Dialog.Content className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 ..." style={{
  background: "rgba(255,255,255,.92)",
  border: "1px solid rgba(255,255,255,.8)",
  borderRadius: 18,
  boxShadow: "0 32px 80px rgba(0,0,0,.14), 0 8px 24px rgba(0,0,0,.08)",
  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
  fontFamily: "var(--planner-font-family)",
}}>
```

- Backdrop: `rgba(0,0,0,.18)` + `blur(8px)` — KHÔNG dùng `.5` (quá nặng).
- Modal: glass `rgba(255,255,255,.92)` + `blur(24px)`, `border-radius: 18`,
  shadow 2 lớp (lớp xa mềm + lớp gần rõ).
- Sidebar nav bên trong modal (nếu có nhiều "trang"): 260px,
  `background: rgba(247,247,249,.82)`, `border-right: 1px solid
  rgba(0,0,0,.06)`, item active dùng `background: rgba(0,122,255,.09)` +
  `color: var(--mset-accent)`.
- **Popover/Dropdown LỒNG BÊN TRONG Dialog** (vd `TimePickerField` trong
  Settings): Dialog modal dùng Radix `FocusScope` "trapped" — Portal mặc
  định (`document.body`) nằm NGOÀI subtree của `Dialog.Content`, FocusScope
  coi đó là "ngoài dialog" và liên tục giật focus về lại, khiến control bên
  trong Popover không bấm/gõ được. Fix: truyền `container` = chính DOM node
  của `Dialog.Content` (lấy qua callback ref `ref={setContentEl}`) xuống
  `PopoverContent`/Popover con (`<RadixPopover.Portal container={...}>`) để
  Popover mount LÀM CON của dialog thay vì `document.body`. Xem
  `src/components/ui/popover.tsx` (`PopoverContent`'s `container` prop) +
  `PlannerSettingsModal.tsx` (`contentEl` state) làm ví dụ đầy đủ.

## Popover nhỏ (QuickAddPopover, chi tiết item...)

Không cần glass/blur (khác Modal) — nền đặc, viền + shadow rõ:

```tsx
className="z-50 rounded-[12px] border bg-white p-3.5 shadow-[0_10px_28px_rgba(20,30,50,.16)]"
style={{ fontFamily: "var(--planner-font-family)" }}
```

### Pattern "ghost add row" (icon + nhãn mờ → bấm hiện control thật)

Dùng cho field KHÔNG bắt buộc, mặc định ẩn để form gọn (vd "+ Thêm địa
điểm", "+ Thêm hạn chót" trong `QuickAddPopover`):

```tsx
{value || expanded ? (
  <ControlThật />
) : (
  <button type="button" onClick={() => setExpanded(true)}
    className="flex w-fit cursor-pointer items-center gap-1.5 text-[12.5px] font-medium text-[color:var(--planner-text-muted)] hover:text-[color:var(--planner-text-secondary)]">
    <Icon size={13} /> Nhãn...
  </button>
)}
```

## Section / Row (trang settings nhiều dòng)

```tsx
// Section: khối có tiêu đề UPPERCASE + letter-spacing, divider dưới (trừ last)
<div style={{ padding: "24px 0", borderBottom: last ? "none" : "1px solid var(--mset-divider)" }}>
  <p className="mb-4 text-[13px] font-semibold uppercase" style={{ color: "var(--mset-text-secondary)", letterSpacing: ".04em" }}>{title}</p>
  ...
</div>
// Row: label + description bên trái, control bên phải, min-height 52px
<div className="flex min-h-[52px] items-center justify-between gap-6 py-2.5">
  <div><p className="text-sm font-medium">{label}</p>{description && <p className="mt-0.5 text-xs" style={{color:"var(--mset-text-tertiary)"}}>{description}</p>}</div>
  <div className="shrink-0">{children}</div>
</div>
```

Xem `Section`/`Row` trong `PlannerSettingsModal.tsx` (full code, tái dùng
trực tiếp thay vì viết lại).

## Control tự vẽ (không dùng control HTML mặc định)

- **SegmentedControl** (thay radio group): nền rãnh `--mset-surface-tertiary`,
  `padding: 2`, `border-radius: 9`, lựa chọn active = nền trắng + shadow nhẹ
  (`0 1px 3px rgba(0,0,0,.10)`). Xem `SegmentedControl` trong
  `PlannerSettingsModal.tsx`.
- **Toggle** (thay `<input type=checkbox>` dạng switch): pill 38×22px, nền
  `--mset-success` khi bật / `#d1d1d6` khi tắt, chấm trắng trượt
  `translateX(16px)`, easing `cubic-bezier(.2,.8,.2,1)` 180ms. Xem `Toggle`.
- **Checkbox** (thay `<input type=checkbox>` dạng ô vuông, dùng cho NHÓM
  nhiều lựa chọn độc lập): ô 18px bo `5px`, viền/nền `--mset-accent` khi
  check + icon `Check` trắng. Xem `Checkbox`.
- **Dropdown/Select** (thay `<select>`): luôn
  `DropdownMenuRoot/Trigger/Content/Item` (`src/components/ui/dropdown-menu.tsx`,
  Radix + motion preset chung) — KHÔNG BAO GIỜ `<select>` thô (quy ước toàn
  app, không riêng Planner — xem `CommunityComposer.tsx` visibility picker,
  `QuickAddPopover`'s recurrence picker làm ví dụ).
- **NumberField**: input số đơn giản, viền `#d2d2d7`, focus ring
  `0 0 0 3px rgba(0,122,255,.12)` + viền `--mset-accent`.
- **Swatch chọn màu** (grid tròn, vd Colors trong Settings): vòng chọn vẽ
  bằng inline `boxShadow: "0 0 0 2px #fff, 0 0 0 4px var(--mset-text-primary)"`
  — KHÔNG dùng class `ring-offset-*` của Tailwind (giả định nền dưới đặc
  màu, sai khi nằm trên modal kính/glass).

## Toolbar soạn thảo nhỏ (Bold/Italic/list/đính kèm/emoji...)

Dùng Tiptap (đã có sẵn trong repo — `@tiptap/react` + `@tiptap/starter-kit` +
`@tiptap/extension-underline`, xem `CommunityComposer.tsx`/`Composer.tsx`),
KHÔNG thêm thư viện rich-text khác. Nút toolbar dạng icon vuông nhỏ (24-28px),
active = nền `--planner-primary-soft` + chữ `--planner-primary`:

```tsx
function EditorToolbarButton({ icon: Icon, active, onClick }) {
  return <button className={cn("flex size-6 items-center justify-center rounded-[6px]",
    active ? "bg-[color:var(--planner-primary-soft)] text-[color:var(--planner-primary)]"
           : "text-[color:var(--planner-text-muted)] hover:bg-white")} onClick={onClick}>
    <Icon size={13} strokeWidth={2} />
  </button>;
}
```

- Đính kèm file: tái dùng pipeline upload CÓ SẴN
  (`uploadChatAttachmentAction` → `/uploads`, xem
  `src/actions/chat/upload-attachment.ts`) — không tạo endpoint upload mới.
  Planner chưa có field `attachments[]` riêng trong data model; MVP hiện tại
  chèn thẳng link file vào nội dung mô tả (Tiptap) thay vì thêm migration
  backend mới — nếu cần field `attachments` có cấu trúc riêng, đó là việc
  CHƯA làm, cần yêu cầu rõ.
- Emoji: lưới emoji cố định hardcode trong component (xem `QUICK_EMOJIS` +
  `EmojiPickerGrid` trong `PlannerShell.tsx`) — KHÔNG cài thêm thư viện
  emoji-picker (repo chưa có sẵn, tránh phình bundle chỉ cho 1 popover nhỏ).
  Nếu sau này cần bộ emoji đầy đủ/tìm kiếm, đó là 1 quyết định thêm dependency
  mới, cần hỏi trước khi cài.

## Motion

Dùng ĐÚNG 1 preset cho mọi dropdown/popover (quy ước chung toàn app, xem
CLAUDE.md "UI conventions"):

```tsx
initial={{ opacity: 0, scale: 0.95, y: -4 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: -4 }}
transition={{ duration: 0.15, ease: "easeOut" }}
```

Đã implement sẵn trong `PopoverContent`/`DropdownMenuContent`
(`src/components/ui/*.tsx`) — không cần tự viết lại, chỉ cần dùng 2 component
đó.

## Mô hình dữ liệu (cập nhật 2026-10-09 — đọc kỹ, đã đổi hẳn)

Pattern "nhét field mới vào `PlannerItem.metadata` (cột Json tự do) để khỏi
migration" **ĐÃ BỊ BỎ**, cùng với chính cột `metadata`. Lý do: nó là nguồn
gốc của việc cùng một khái niệm (địa điểm, link họp, nhắc trước, việc con)
tồn tại dưới 2-3 tên khác nhau ở 2-3 chỗ khác nhau, không field nào được
validate, và không query/filter được ở server.

Thay bằng **một model phẳng, mọi field là cột thật** — nguồn sự thật duy
nhất: `src/lib/planner/planner-domain.ts` (khớp 1-1 với model `PlannerItem`
trong `career-tree-api/prisma/schema.prisma`):

- Loại: `TASK | EVENT | REMINDER` (`PlannerItemType`).
- `scheduleKind`: `UNSCHEDULED | DEADLINE | TIMED | ALL_DAY` — **discriminator
  tường minh**, KHÔNG suy ý định từ việc cột ngày nào tình cờ có giá trị.
  Mỗi loại chỉ cho phép một tập `scheduleKind` nhất định
  (`PLANNER_TYPE_META[type].allowedScheduleKinds`).
- `category` (8 giá trị) quyết định **màu thẻ**; `status` (6) và `priority`
  (4) là 2 trục **độc lập** — xem "Category vs status vs priority" bên dưới.
- Field tuỳ chọn là cột thật: `location`, `meetingUrl`, `checklist` (Json),
  `recurrence` (Json), `description`.

Thêm field mới: thêm cột + migration thật, thêm vào `planner-domain.ts`,
rồi để các component shared tự nhận. **Đừng** tạo lại một cột Json tự do.

Khác biệt giữa 3 loại là **DỮ LIỆU trong `PLANNER_TYPE_META`**
(`allowedScheduleKinds` / `completable` / `supportsChecklist` /
`supportsPlace`), không phải 3 nhánh `if` trong form — thêm loại mới là thêm
một dòng vào bảng đó.

## Giới hạn đã biết (chưa làm, không ngầm hiểu là "đã xong")

- `item.recurrence` (cột Json) hiện CHỈ **lưu** được ý định lặp lại — CHƯA
  sinh instance: một việc lặp lại vẫn chỉ là 1 dòng, không tự nhân bản ra các
  lần xuất hiện sau trên lịch, và chưa có luồng sửa "chỉ lần này / lần này và
  sau / tất cả". Cần RRULE expansion phía backend.
- Mô tả chi tiết (description) tạo qua `QuickAddPopover` lưu dạng HTML
  (Tiptap `getHTML()`) để giữ định dạng Bold/Italic/Underline/list thật —
  nhưng form sửa task có sẵn (`EditItemForm`, phần "Sửa chi tiết") vẫn dùng
  `<textarea>` thuần, nên mở lại 1 task tạo qua `QuickAddPopover` ở đó sẽ
  thấy thẻ HTML thô thay vì định dạng. Nâng cấp `EditItemForm` sang cùng
  editor Tiptap là việc riêng, chưa làm.
