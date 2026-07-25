# Feed / Post system (Trang chủ - Discover feed)

Tài liệu kiến trúc cho hệ thống feed (`/home`, `/home/following`, `/home/trending`).
Khác với `engineering-log.md` (ghi lý do quyết định), file này ghi **hiện trạng
kiến trúc** - đọc file này để biết feed đang hoạt động thế nào và cách mở rộng,
không cần đọc lại toàn bộ lịch sử chat.

## Ý tưởng cốt lõi

Mỗi loại nội dung trong feed (`Post.kind`) có:

1. **1 body component riêng** (`post-bodies/`) - cách trình bày nội dung chính.
2. **1 action-bar layout riêng** (`action-bar/action-bar-config.tsx`) - bộ nút
   tương tác bên dưới, KHÔNG dùng chung 1 bộ Like/Comment/Repost/Save cho mọi
   loại.

`PostCard.tsx` chỉ là shell dùng chung cho mọi kind: avatar/tên/verified
badge/@username/thời gian/menu 3 chấm ở header, rồi dispatch phần thân
(`PostBody`) và action bar (`ActionBar`) theo `post.kind`. PostCard không biết
gì về nội dung/action cụ thể của từng loại - toàn bộ logic hiển thị nằm trong
2 hệ thống con dưới đây.

## Data model - `src/content/home-feed-mock.ts`

`Post` là **discriminated union theo `kind`** (không phải 1 shape chung với
field `attachment`/`tag` optional như thiết kế ban đầu). Field chung
(`PostCommon`): `id`, `author`, `timeAgo`, `stats.{likes,comments,reposts}`,
`liked?`, `saved?`, `following`.

`following`/`stats.likes/comments/reposts` phải luôn có trên MỌI kind vì 3
route (`home/page.tsx`, `home/following/page.tsx`, `home/trending/page.tsx`)
filter/sort dựa trên các field này (xem 3 file đó để không phá filter khi
thêm kind mới).

Dữ liệu hiện tại 100% là MOCK tĩnh (`POSTS` array), chưa nối API/DB.

## Danh sách 23 `kind` hiện có

| kind | Body component | Action bar (trái → phải) |
|---|---|---|
| `text` | `MediaBody.TextBody` | Like, Comment, Repost — Bookmark |
| `image` | `MediaBody.ImageBody` | Like, Comment, Repost — Bookmark |
| `gallery` | `MediaBody.GalleryBody` (grid 2x2, +N overlay) | Like, Comment, Repost — Bookmark |
| `video` | `MediaBody.VideoBody` (play overlay + duration) | Views, Like, Comment, Repost — Bookmark |
| `file` | `AttachmentBody.FileBody` | Download, Like, Comment — Bookmark |
| `link` | `AttachmentBody.LinkBody` | Like, Comment, Repost — Visit (external-link, tĩnh) |
| `resource` | `AttachmentBody.ResourceBody` (rating sao) | Saved (label+count), Like, Comment |
| `note` (Knowledge Note/TIL) | `NoteBody.NoteBody` (viền trái warning, title=headline) | Helpful, Comment — Saved |
| `idea` | `NoteBody.IdeaBody` (nhẹ hơn Note, không khung màu) | Insightful, Comment — Bookmark |
| `project-update` | `ProjectUpdateBody` (kiểu GitHub Release) | Like, Celebrate (count), Comment — Bookmark |
| `achievement` | `StatusBodies.AchievementBody` (center, celebratory) | Reaction (Zap), Like, Comment — Share (count) |
| `milestone` | `StatusBodies.MilestoneBody` (grid 3 stat + caption tuỳ chọn) | Celebrate (label+count), Like, Comment |
| `question` | `DiscussionBody.QuestionBody` (badge + headline lớn) | Answer, Comment — Save (label) |
| `poll` | `DiscussionBody.PollBody` (vote tương tác, local state) | Votes (tĩnh, tổng từ `options`), Comment |
| `career-update` | `StatusBodies.CareerUpdateBody` | Like, Comment, Celebrate (label) — Bookmark |
| `skill-update` | `StatusBodies.SkillUpdateBody` (dot level meter) | Star, Comment — Save (label+count) |
| `node-created` | `StatusBodies.NodeCreatedBody` | Like, Comment, Repost — Bookmark (fallback chuẩn) |
| `knowledge-block` | `StatusBodies.KnowledgeBlockBody` (progress bar) | Like, Comment, Repost — Bookmark (fallback chuẩn) |
| `timeline-event` | `StatusBodies.TimelineEventBody` (viền trái primary + Clock) | Like, Comment, Repost — Bookmark |
| `code-snippet` | `CodeSnippetBody` (khối `<pre><code>` mono) | Copy, Like, Comment |
| `tutorial` | `ExpandedBodies.TutorialBody` (badge số bước) | Save (label+count), Like, Comment |
| `experiment` | `ExpandedBodies.ExperimentBody` (hypothesis → result nổi bật) | Results (label+count), Like, Comment |
| `event` | `ExpandedBodies.EventBody` (poster, icon CalendarDays) | Interested, Like, Comment — Share (label) |

`node-created`/`knowledge-block` không có trong bộ 20-case tham khảo gốc nên
đang dùng action bar fallback tiêu chuẩn (Like/Comment/Repost/Bookmark) - có
thể tuỳ biến thêm nếu có case cụ thể sau này.

## Cấu trúc thư mục

```
src/components/discover/
├── PostCard.tsx              # shell chung (header + dispatch body/action-bar)
├── HomeLayoutShell.tsx       # layout dùng chung 3 tab For you/Following/Trending
├── PostComposer.tsx          # ô soạn bài trên cùng feed
├── HomeRightPanel.tsx        # cột phải (Trending Knowledge, People you may learn from)
├── post-bodies/
│   ├── index.tsx             # PostBody dispatcher (switch theo post.kind)
│   ├── MediaBody.tsx         # text/image/gallery/video
│   ├── AttachmentBody.tsx    # file/link/resource ("card trong card", elevation riêng)
│   ├── NoteBody.tsx          # note + idea
│   ├── ProjectUpdateBody.tsx
│   ├── StatusBodies.tsx      # achievement/milestone/career-update/skill-update/
│   │                         # node-created/knowledge-block/timeline-event
│   ├── DiscussionBody.tsx    # question + poll (poll có state vote local)
│   ├── CodeSnippetBody.tsx
│   └── ExpandedBodies.tsx    # tutorial/experiment/event
└── action-bar/
    ├── index.tsx             # ActionBar - render left[] + right? (spacer đẩy phải)
    ├── ActionButton.tsx      # 1 nút generic (icon/label?/count?/tone/toggle)
    └── action-bar-config.tsx # getActionBarLayout(post) - switch theo kind
```

## Quy ước thiết kế

- **Phân cấp thị giác**: nội dung luôn là trọng tâm; đính kèm (file/link/
  resource) là "card trong card" có elevation/hover riêng (`bg-surface-muted`
  + `border` + `hover:-translate-y-0.5 hover:shadow-dropdown`); author/metadata
  luôn nhạt (`text-ink-muted`/`text-ink-faint`); action bar nhẹ nhàng, không
  cạnh tranh với nội dung.
- **Màu sắc**: luôn dùng token ngữ nghĩa từ `globals.css` (`text-ink`,
  `bg-surface-muted`, `border-border`, `text-primary`, `bg-tag-bg`,
  `text-warning`, `text-danger`...) - KHÔNG hardcode hex, để tự đổi theo
  light/dark. `hexToRgba(accent, 0.15)` chỉ dùng cho icon badge tinted
  (không phải nền lớn).
- **`ActionButton`**: mỗi slot tự quản lý state `active` cục bộ (toggle khi
  bấm, cộng 1 vào count hiển thị) - không đồng bộ 2 chiều với `post.stats`
  gốc, phù hợp vì đây vẫn là mock/demo. `interactive: false` = hiển thị tĩnh,
  không bấm được (vd Views, số phiếu Poll - vote thật xảy ra trong
  `PollBody`, action bar chỉ hiển thị tổng).
- **Layout action bar**: model `{ left: ActionSlot[]; right?: ActionSlot }` -
  tối đa 1 action được đẩy sang phải bằng `flex-1` spacer, đủ cho toàn bộ
  23 case hiện tại (không case nào cần 2 item bên phải).

## Cách thêm 1 `kind` mới

1. Thêm 1 nhánh union mới vào `Post` trong `home-feed-mock.ts` (nhớ giữ
   `stats`/`following` từ `PostCommon`).
2. Thêm ít nhất 1 item mẫu vào `POSTS`.
3. Viết body component mới (file riêng hoặc gộp vào file nhóm gần nghĩa nhất
   trong `post-bodies/`), export và thêm `case` vào `post-bodies/index.tsx`.
4. Thêm `case` tương ứng vào `getActionBarLayout` (`action-bar/action-bar-config.tsx`)
   - tái dùng helper `heart()`/`comment()`/`repost()`/`bookmark()` nếu hợp,
   hoặc khai báo `ActionSlot` riêng nếu cần icon/label/tone khác.
5. `npx tsc --noEmit` sẽ tự báo thiếu `case` nếu switch không exhaustive (nhờ
   discriminated union) - đây là cơ chế chính giữ toàn bộ hệ thống nhất quán
   khi mở rộng.

## Design tokens liên quan (globals.css)

Palette hiện tại: cool neutral + brand blue `#0090E3` (đã trải qua vài lần
đổi palette trong quá trình làm - xem git history của `globals.css` nếu cần
so sánh). Token đáng chú ý được thêm riêng cho feed:
`--outline-*`/`--follow-*` (nút dạng "đã chọn"/"theo dõi" viền brand),
`--button-primary-bg/hover` (nút CTA đặc, tách khỏi `--primary` để có thể
dùng tông pastel riêng nếu cần), `--tag-*` (chip/badge trung tính),
`--active-bg/border` (trạng thái active trong sidebar và feed).
