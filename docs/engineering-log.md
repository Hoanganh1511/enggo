# Engineering Log

File này không ghi lại **cái gì đã đổi** (đã có sẵn trong git log/diff) — mà ghi
lại **cách tư duy xử lý vấn đề**: đã cân nhắc những hướng nào, vì sao loại bỏ
hướng nào, chọn hướng nào và đánh đổi ra sao. Mục đích: sau này đọc lại (hoặc
gặp vấn đề tương tự) thì hiểu được lý do đằng sau quyết định, không chỉ đọc
được code đã đổi.

---

## 2026-08-05 — Làm lại /community/[slug] thành giao diện kênh chat (Member/Admin)

**Quyết định:** thay THẾ HOÀN TOÀN trang chi tiết Community cũ (header + feed
bài viết dạng note.com) bằng giao diện kiểu Discord/Slack: kênh chat có tin
nhắn/reaction/code block cho **Member**, và trang quản trị duyệt yêu cầu
tham gia cho **Admin** - rẽ nhánh qua `community.isOwner` (map thẳng từ
`series.isOwner` có sẵn), không phải toggle thủ công.

**Phạm vi đã CHỦ ĐỘNG THU HẸP** (xác nhận trước khi làm, tránh làm quá nhiều
trong 1 lần): trang Admin có 9 mục điều hướng trong thiết kế tham khảo,
nhưng chỉ **"Tổng quan"** và **"Yêu cầu tham gia"** có nội dung thật (khớp
đúng màn hình chi tiết trong ảnh mẫu) - 7 mục còn lại (Thành viên/Kênh &
Danh mục/Nội dung ghim/Tài liệu & Link/Sự kiện/Thống kê/Cài đặt) chỉ đổi
active state, hiện `CommunityAdminPlaceholder` ("chưa xây dựng lần này").

**Nguồn dữ liệu cho yêu cầu tham gia (Admin):** dùng THẲNG
`Series.joinRequests` có sẵn (reason/intro/avatarUrl thật) thay vì bịa -
`intro` map sang cột "Kinh nghiệm", `reason` map sang "Lý do muốn tham gia".
Field duy nhất Series không có là **email** - dùng placeholder rõ ràng từ
username (`${username}@example.com`), không giả vờ là email thật.

**Xoá hoàn toàn** các component cũ không còn dùng:
`CommunityHeader/CommunitySidebarLeft/CommunitySidebarRight/CommunityMainTabs/
CommunityComposer(cũ)/CommunityFeed/CommunityPostCard`, cùng các field
`Community` không còn cần (goal/challenge/leaderboard/certificates/
upcomingEvent/documents/posts/CommunityPost...) - viết lại `Community` type
gọn lại đúng những gì giao diện mới cần (channels/joinRequests/adminStats/
activeMembers/docsAndLinks/recentActivity).

---

## 2026-08-05 — /series, /contest có sidebar; /series/[slug], /contest/[slug] thì không

**Yêu cầu:** danh sách `/series`, `/contest` giữ sidebar lĩnh vực nghề
nghiệp (dùng chung `HomeLayoutShell` với `/home`), nhưng trang CHI TIẾT
(`/series/[slug]`, `/contest/[slug]`) thì KHÔNG có sidebar đó - bộ lọc lĩnh
vực chỉ có nghĩa với 1 danh sách, không liên quan gì tới 1 series/cuộc thi
cụ thể đang xem.

**Vấn đề kỹ thuật:** Next.js App Router, 1 `layout.tsx` áp dụng cho MỌI route
con lồng bên dưới nó - không có cách nào để 1 route con "từ chối" layout của
cha. Nếu `series/[slug]/` nằm trong cùng thư mục `series/` với `page.tsx`
(danh sách), nó bắt buộc nhận layout của `series/` (hoặc cha xa hơn) giống
hệt trang danh sách.

**Đã làm:** tách VẬT LÝ 2 phần của "series" ra 2 vị trí khác nhau, dùng route
group để chỉ 1 trong 2 chỗ đó đi qua `HomeLayoutShell`:
- `(main)/(feed)/series/page.tsx` → `/series` (đi qua `(feed)/layout.tsx`,
  CÓ sidebar).
- `(main)/series/[slug]/page.tsx` → `/series/[slug]` (đứng ngoài route group
  `(feed)`, KHÔNG đi qua layout đó, chỉ thừa hưởng `(main)/layout.tsx` -
  TopHeaderBar).
Tương tự cho `contest/`. Đã build thử để xác nhận Next.js CHO PHÉP 2 thư mục
cùng tên "series" tồn tại song song ở 2 vị trí (1 trong group, 1 ngoài group)
miễn là không cùng định nghĩa CHÍNH XÁC 1 path - `(feed)/series/page.tsx`
định nghĩa `/series`, còn `series/[slug]/page.tsx` định nghĩa `/series/[slug]`,
2 path khác nhau nên không xung đột.

**Padding:** `series/page.tsx`/`contest/page.tsx` (trong `(feed)/`) quay lại
KHÔNG tự thêm `px-4 pt-4` (HomeLayoutShell cấp sẵn). `series/[slug]`/
`contest/[slug]` (ngoài `(feed)/`) vẫn giữ `px-4 pt-4` tự thêm từ lần sửa
trước (không đổi, vì vẫn không có sidebar).

---

## 2026-08-03 — Card Series dẫn sang trang Community thay vì /series/[slug]

**Quyết định:** thêm route mới `/community/[slug]` (mock hoàn toàn, xem
`content/community-mock.ts`) làm hub thảo luận/leaderboard/thử thách cho 1
"nhóm học chung". `SeriesCard`/`SeriesJoinButton` đổi hẳn sang trỏ tới
`/community/${series.slug}` thay vì `/series/${series.slug}` cũ.

**Vấn đề:** `community-mock.ts` chỉ biên soạn tay 1 ví dụ chi tiết
("on-certificate"), trong khi `SERIES` có 9 slug khác cần trỏ tới được.

**Hướng đã chọn:** `buildCommunityFromSeries(series)` SINH 1 Community từ dữ
liệu Series có sẵn thay vì chép tay 9 lần — ánh xạ 1-1 field nào có tương ứng
tự nhiên (thành viên → leaderboard sắp theo `progressPercent`, ngày hiện
tại/tổng ngày → vừa là "mục tiêu" vừa là "thử thách" vì 1 Community sinh ra
CHỈ xoay quanh đúng 1 series). Field Series không có tương ứng (certificates,
upcomingEvent, documents) để rỗng/`undefined` — **không bịa dữ liệu** — sidebar
tự ẩn cả khối khi rỗng thay vì hiện danh sách trống vô nghĩa.

**Còn để ngỏ:** trang `/series/[slug]` cũ (`SeriesDetailContainer`) vẫn còn
tồn tại trong code, chỉ không còn được link tới từ lưới danh sách nữa —
CHƯA xoá (quyết định giữ nguyên, không phải quên) vì đây là hành động phá huỷ
lớn hơn phạm vi yêu cầu ban đầu; xoá khi nào xác nhận chắc chắn không cần nữa.

**Cập nhật cùng ngày:** đổi tên `SeriesCard.tsx` → `CommunityCard.tsx` (the
này giờ đại diện cho 1 cộng đồng, không chỉ 1 series thuần tuý), thêm 3 dòng
stat "thành viên/cuộc thảo luận/tài liệu". 2 số liệu Series chưa có sẵn
(thảo luận, tài liệu) dùng chung công thức `estimateDiscussionCount`/
`estimateDocumentCount` (community-mock.ts) với `buildCommunityFromSeries` -
tránh 2 nơi hiển thị lệch số nhau vì mỗi chỗ tự bịa 1 công thức riêng. Lưu ý:
`documentCount` trên card là ước tính có cộng thêm tín hiệu thật (số task
`targetKind: "resource"`), nhưng khối "Tài liệu mới cập nhật" ở trang chi
tiết vẫn ẩn (mảng `documents` để rỗng, không bịa danh sách file cụ thể) - card
có thể hiện số > 0 trong khi trang chi tiết chưa có gì, đây là đánh đổi có
chủ đích chứ không phải lỗi.

---

## 2026-08-03 — Sửa lại `/p/[slug]`: phải là trang chi tiết Post THẬT, không phải Article mock riêng

**Vấn đề:** bản đầu tiên của `/p/[slug]` dùng 1 type "Article" tự bịa
(blocks/TOC/reading-time) tách biệt hoàn toàn khỏi `Post` thật đang chạy
khắp app - hiểu sai yêu cầu. Không thể gắn link từ `NoteCard`/`PostCard`
(hiển thị `Post` thật) sang trang đó vì khác hẳn data shape.

**Sửa lại:**
1. Backend (career-tree-api): thêm `GET /posts/:id` (`PostService.findOne`,
   trả `null` thay vì throw để controller tự quyết 404).
2. Frontend: `getPostById`/`getPostAction`, đổi route thành `/p/[id]`
   (nhận `Post.id` thật). Xoá `content/article-mock.ts`.
3. Title/cover suy từ `getPostTitle`/`getPostImageUrl` (helper có sẵn, xử lý
   được MỌI kind, kể cả kind không có field `title`/ảnh riêng).
4. Mục lục: parse heading kiểu `## `/`### ` THẲNG từ `post.content` thật
   (`lib/discover/article-content.ts`, dùng chung 1 hàm sinh id giữa TOC và
   thân bài để không bao giờ lệch nhau) - bài không viết heading kiểu này thì
   đơn giản không có mục lục, không bịa khung rỗng.
5. Thân bài: kind có `content` text thì tự parse heading/đoạn văn; kind
   không có (project-update/achievement/poll/...) thì fallback thẳng về
   `PostBody` có sẵn (đã biết render đúng dạng riêng từng kind).
6. Tác giả đầy đủ: dùng THẬT `followUserAction`/`unfollowUserAction` +
   `getProfileByUsername` (bio/followerCount/isFollowing that) - không phải
   toggle giả như bản đầu.
7. Bài trước/sau + gợi ý: `listPostsAction({authorUsername})` và
   `({category})` THẬT - không mock.
8. Bình luận: vẫn phải mock/local-only vì backend CHƯA có model Comment thật
   (chỉ có `stats.comments` là số đếm) - khởi tạo RỖNG cho mỗi post thật
   thay vì tái dùng 6 comment giả cũ (sẽ sai ngữ cảnh với từng bài khác nhau).
9. Gắn link "click vào card post -> `/p/[id]`" ở TẤT CẢ nơi hiển thị Post
   thật: `NoteCard.tsx` (tách `Link` ảnh/tiêu đề riêng khỏi `AuthorLine` - nay
   tự có `Link` riêng tới profile, tránh lồng `<a>`), `PostCard.tsx` (link
   qua mốc thời gian, cả 2 variant timeline/card).

**Cố ý KHÔNG gắn link:** `CommunityPostCard.tsx` (feature Community) vẫn
100% mock, id không khớp Post thật nào - gắn `/p/${id}` ở đây sẽ ra 404. Để
nguyên, chưa xử lý.

---

## 2026-08-03 — Trang chi tiết bài viết long-form `/p/[slug]`

**Lưu ý:** mục này đã LỖI THỜI - xem mục sửa lại ngay phía trên (cùng ngày).
Giữ nguyên văn bên dưới để hiểu quá trình, không đại diện code hiện tại.

**Quyết định:** route mới hoàn toàn (mock, xem `content/article-mock.ts`),
1 cột duy nhất `max-w-155` (620px) canh giữa — khác layout 3 cột của
`/community/[slug]` vì đây là trang "đọc", ưu tiên tập trung nội dung.

**Các điểm cần quyết định khi build:**
- Mục lục (TOC) sinh THẲNG từ heading block trong `article.blocks`
  (`getTableOfContents`) — không biên soạn riêng, tránh lệch với nội dung
  thật khi sửa bài sau này.
- Bình luận: tối đa 2 cấp (gốc → reply, không cho reply-của-reply) — enforce
  bằng prop `depth: 0 | 1` ở `CommentItem`, không phải giới hạn ở type
  `ArticleComment` (type cho phép nested tuỳ ý, UI mới là nơi chặn).
- "Fetch trước 4 bình luận + Xem thêm": chỉ là `visibleCount` state tăng dần
  trên mảng đã có sẵn (không phải phân trang API thật) — đủ dùng cho giai
  đoạn chốt UI, sẽ đổi thành cursor thật khi có backend comment.
- Bình luận dài >6 dòng: ước lượng bằng số ký tự (260 ký tự ~ 6 dòng ở cột
  620px) thay vì đo chiều cao DOM thật — đơn giản, chấp nhận sai số nhỏ.
- Bài trước/sau (`ArticlePrevNextNav`) là theo TÁC GIẢ, không phải theo thời
  gian toàn hệ thống — `prev`/`next` optional, tự ẩn khi ở bài đầu/cuối.

---

## 2026-08-03 — Home feed: SSR hoá fetch, infinite scroll, tối ưu ảnh (LCP/`sizes`)

**Vấn đề:** `home/page.tsx` là `"use client"` + `useEffect` fetch toàn bộ 70
posts sau khi mount — HTML ban đầu rỗng, ảnh chỉ bắt đầu tải sau khi
JS hydrate xong + round-trip fetch, không có gì để Google index (SEO), và
không có "load more" dù backend đã hỗ trợ `cursor` sẵn ([lib/api/posts.ts](../src/lib/api/posts.ts)).

**Các hướng đã cân nhắc cho phần fetch:**
1. Giữ client fetch, chỉ thêm `AbortController`/cache. → Không giải quyết gốc
   (HTML vẫn rỗng lúc đầu), SEO vẫn bằng 0.
2. **Chuyển hẳn `home/page.tsx` thành Server Component `async`, đọc
   `searchParams` trực tiếp, fetch trang đầu (`limit: 70`) ngay trong
   component** (đã chọn) — dùng route-level `home/loading.tsx` có sẵn làm
   Suspense fallback tự động (Next tự bọc), không cần tự quản `loading`
   state/`cancelled` flag như trước. `EditorialFeed`/`SingleTypeFeedList` bỏ
   hẳn prop `loading`.
3. Cho các trang tiếp theo (cuộn xuống): **client island riêng
   `InfiniteFeed.tsx`** nhận `initialPosts` từ SSR + object `filters`, tự gọi
   `listPostsAction({...filters, cursor: lastPost.id})` qua
   `IntersectionObserver` ở sentinel cuối feed — đây là component `"use
   client"` DUY NHẤT trong luồng Home, mọi thứ khác thuần Server/presentational.
   Bắt buộc `key={JSON.stringify(filters)}` ở nơi gọi để reset state khi đổi
   topic/type, tránh nối nhầm posts của 2 tập lọc khác nhau vào 1 danh sách.

**Ảnh (LCP/`sizes`):** so với note.com (kiểm chứng qua network thật, không
đoán — xem chat log) thấy họ SSR toàn bộ list + serve ảnh qua CDN resize theo
query param (`?width=219&dpr=2`) khớp đúng kích thước hiển thị. Áp dụng tương
tự: `ContentTile`/`NoteCard` nhận thêm `priority`/`sizes` prop thay vì hard-code
`sizes="400px"` cho mọi nơi dùng — `EditorialFeed` chỉ set `priority` cho 4-6
card đầu section "Nổi bật hôm nay" (ứng viên LCP thật sự, nằm trong viewport
ban đầu ở desktop vì `HorizontalScroller` không tràn ở màn rộng).

**Còn để ngỏ:** `generateMetadata` (title/canonical/robots theo từng URL
filter) — cần chọn chiến lược index trước (chỉ index `topic`/`world`, hay
noindex toàn bộ `/home` và dồn SEO cho trang bài viết chi tiết) vì đây là
quyết định content/SEO, chưa làm.

**Phát hiện thêm (cùng ngày):** sau khi SSR hoá, chuyển sang `/series` bị
"nháy toàn bộ trang" (sidebar + nội dung cùng biến mất, thay bằng spinner
rỗng). Nguyên nhân: `home/layout.tsx`, `series/layout.tsx`, `contest/layout.tsx`
đều `await getFeedCategoryTree()` thẳng, không tự bọc `<Suspense>` riêng —
Next fallback lên `(main)/loading.tsx` (spinner tràn hết khung nội dung).
Fix 2 lớp:
1. Tự bọc `<Suspense fallback={<HomeLayoutShellSkeleton />}>` trong từng
   layout (đúng pattern đã có sẵn ở `u/[username]/layout.tsx`).
2. **Gộp cả 3 route vào 1 route group `(feed)/`** (`src/app/(main)/(feed)/{home,series,contest}`)
   dùng chung đúng 1 `(feed)/layout.tsx` — route group không lộ ra URL
   (`/home`, `/series`, `/contest` giữ nguyên), nhưng khiến `HomeLayoutShell`
   chỉ mount 1 lần duy nhất thay vì remount mỗi lần chuyển qua lại giữa 3
   trang (trước đó mỗi route có layout.tsx riêng = 3 instance độc lập dù
   dùng chung component `HomeLayoutShell`, đây mới là nguyên nhân gốc khiến
   sidebar "biến mất" dù comment cũ đã ghi rõ ý định ngược lại).

---

## 2026-07-28 — Post kind "skill-report": fetch-on-demand trong client component mà không đụng `react-hooks/set-state-in-effect`

**Vấn đề:** Thêm kind mới cho feed ("Báo cáo kỹ năng" - báo cáo hôm nay hoàn
thành gì trong 1 skill/node THẬT của workspace, kèm modal xem chi tiết note
thật). 2 chỗ cần fetch dữ liệu thật theo 1 "trigger" nào đó thay vì lúc mount:
`PostComposer.tsx` cần tải workspace/category/node khi người dùng chọn kind
này hoặc đổi `<select>` cha; `SkillReportDetailModal.tsx` cần tải node/cards
khi modal mở. Cách viết tự nhiên đầu tiên - `useEffect` theo dõi
`activeKind`/`open` rồi gọi `setState` ngay dòng đầu effect để bật cờ loading
- bị ESLint chặn cứng (lỗi, không phải warning):
`react-hooks/set-state-in-effect` ("Calling setState synchronously within an
effect can trigger cascading renders").

**Các hướng đã cân nhắc:**
1. Giữ `useEffect` + gọi `setState` trong `.then()/.finally()` thay vì đầu
   effect. → Vẫn bị chặn, vì rule flag đúng dòng `setState` ĐỒNG BỘ đầu tiên
   trong thân effect (dòng bật cờ loading), bất kể phần async phía sau.
2. Bọc `setState` đầu effect trong `Promise.resolve().then(...)` để "trì
   hoãn" 1 microtask, đánh lừa rule. → Hoạt động nhưng là hack, không giải
   quyết gốc (rule tồn tại vì effect vốn không nên là nơi khởi phát 1 hành
   động - nó nên là nơi *đồng bộ* với hệ thống ngoài).
3. **Chuyển trigger từ effect sang thẳng event handler** (đã chọn cho
   PostComposer) - việc "chọn kind Báo cáo kỹ năng" hay "đổi workspace" vốn
   dĩ LÀ 1 hành động người dùng rõ ràng (click/onChange), nên gọi fetch ngay
   trong handler đó (`loadReportWorkspaces()`, `handleSelectReportWorkspace()`)
   thay vì suy luận lại từ state đã đổi qua effect. Đúng bản chất hơn, và né
   hoàn toàn rule vì không còn effect nào gọi setState nữa.
4. **Tách component con chỉ mount khi cần** (đã chọn cho
   SkillReportDetailModal) - trigger "mở modal" không nằm trong chính modal
   (nó nhận `open` như 1 prop từ cha), nên không thể áp dụng hướng 3 y hệt.
   Thay vào đó tách phần fetch+render nội dung thành `SkillReportDetailBody`,
   chỉ render khi `open` true (`{open && <SkillReportDetailBody .../>}`) -
   Radix `Dialog.Content` vốn cũng chỉ mount con khi `open`. Nhờ vậy: (a) effect
   fetch bên trong Body dùng `useTransition` thay vì `setState` tay để bật cờ
   loading (`isPending` do React tự quản, không tính là "setState trong
   effect" theo rule này), và (b) không cần effect "reset về idle khi đóng
   modal" nữa - unmount/remount tự nhiên đã reset state.

**Bài học chung:** rule này về cơ bản đang ép 2 nguyên tắc: effect data-fetch
chỉ nên *đồng bộ hoá theo dependency đã đổi*, không nên là nơi *khởi phát*
hành động - nếu có 1 sự kiện người dùng rõ ràng đứng sau, gọi thẳng từ handler
sự kiện đó; và nếu cờ loading chỉ tồn tại để hiện spinner trong lúc chờ 1
async call, ưu tiên `useTransition`/`isPending` thay vì tự tạo `useState` +
tự `setState` nó ở đầu/cuối effect.

**Phát hiện phụ (không phải bug, chỉ ghi lại vì không hiển nhiên khi đọc
type):** `ApiNode`/`ApiNodeListItem` KHÔNG có field `categoryId` - 1 node
thuộc về 1 Category chỉ gián tiếp qua `node.tierId ∈ category.tiers[].id`
(logic này đã có sẵn trong `computeCategoryStats` ở `category-stats.ts`,
được tách ra thành `filterNodesByCategory` dùng chung cho cả trang Skill Tree
lẫn composer picker mới, tránh viết lại lần 3).

## 2026-07-19 — Header nháy sai UI khi vào trang chi tiết node (F5 / chuyển route)

**Vấn đề:** `CareerTreeHeader` (dùng chung cho cả canvas và trang chi tiết
node) cần hiện 2 loại nội dung khác nhau tuỳ route: Toolbar+WorkspaceInfoBar
(canvas) hoặc breadcrumb (chi tiết). Ban đầu dùng 1 state trong context
(`activeNodeTitle`), được `NodeDetailContainer` (component con, nằm sâu bên
trong) set qua `useEffect` lúc mount. Hệ quả: mọi lần vào trang chi tiết (kể cả
F5) đều thấy Toolbar cũ hiện ra vài mili giây trước khi nháy đổi sang
breadcrumb — vì `useEffect` luôn chạy SAU khi component đã render/mount xong,
nên lần render đầu tiên chắc chắn dùng giá trị cũ.

**Các hướng đã cân nhắc:**
1. Đổi điều kiện hiển thị từ `activeNodeTitle` sang `usePathname()` — biết
   route ngay lập tức, không cần đợi effect. → Hết nháy sai **loại** UI, nhưng
   phần **chữ** (tên node) vẫn phải đợi effect nên vẫn có độ trễ nhỏ.
2. Thêm `Skeleton` cho riêng phần chữ trong lúc chờ. → Vá được triệu chứng,
   nhưng không giải quyết gốc: bản chất vẫn là "cha đợi con báo state qua
   effect", độ trễ không thể về 0 dù nhỏ tới đâu.
3. **Next.js Parallel Routes** (đã chọn) — nhận ra vấn đề gốc không phải thiếu
   skeleton mà là **kiến trúc sai chỗ**: đang dùng state+effect (cơ chế client,
   luôn có độ trễ tối thiểu) để giải quyết bài toán "nội dung khác nhau theo
   route", trong khi Next.js có sẵn cơ chế chuyên dụng cho đúng bài toán này —
   `@slot` được resolve hoàn toàn ở server, ghép cùng lúc với nội dung chính
   trong 1 lần response, không qua client effect nào cả.

**Đã chọn:** Tạo slot `@topbar` trong `app/(main)/w/[workspaceId]/` — mỗi route
con tự cung cấp nội dung header riêng của nó
(`@topbar/page.tsx` cho canvas, `@topbar/nodes/[nodeId]/page.tsx` cho chi
tiết), Next.js tự ghép đúng slot theo route đang khớp, song song với nội dung
chính. Bỏ hẳn `activeNodeTitle`/`setActiveNodeTitle` khỏi context và effect
trong `NodeDetailContainer` — không cần nữa.

**Cách tư duy rút ra:** khi thấy mình đang giải quyết 1 vấn đề UI bằng cách
thêm state + effect để "con báo lên cho cha", nên dừng lại hỏi: framework đang
dùng có cơ chế dựng sẵn cho đúng bài toán này không? Vá bằng state/effect luôn
có độ trễ tối thiểu (dù nhỏ) vì bản chất là bất đồng bộ; cơ chế dựng sẵn của
framework (ở đây là Parallel Routes, resolve ở server) mới triệt tiêu được độ
trễ hoàn toàn — đáng để tìm hiểu trước khi chấp nhận vá triệu chứng.

**Tiện thể tối ưu thêm:** slot breadcrumb dùng `getWorkspaceTree` (không có
`content`) thay vì `getNode` (có `content`, nặng hơn) — vì chỉ cần đúng
`title`, không cần kéo theo rich-text của node chỉ để hiển thị 1 dòng
breadcrumb.

---

## 2026-07-22 — Phân loại node (branch/topic), redesign trang chi tiết, và GrowthCard "có hồn"

**Vấn đề:** Ban đầu mọi node card trên canvas đều điều hướng sang trang chi
tiết khi click, và "nhánh" hay "lá" được suy thuần từ việc node có con hay
không (`hasChildren`). Yêu cầu mới: chỉ node được đánh dấu tường minh là "chủ
đề cần học sâu" mới vào trang chi tiết; card cần giàu thông tin và "có câu
chuyện" hơn thay vì chỉ progress bar khô khan.

**1. `kind` (BRANCH/TOPIC) — field độc lập, không suy từ children**

*Các hướng đã cân nhắc:*
- Giữ suy luận từ `hasChildren`, chỉ đổi ngưỡng/thêm điều kiện phụ. → Loại vì
  1 node TOPIC vẫn có thể có con (ghi chú/thẻ con) mà vẫn cần vào được trang
  chi tiết — "có con hay không" và "có phải chủ đề cần học sâu" là 2 trục dữ
  liệu độc lập, gộp chung sẽ luôn có trường hợp sai.
- Field override tùy chọn, mặc định vẫn suy theo children. → Loại vì tạo 2
  nguồn sự thật cho cùng 1 khái niệm (role), dễ lệch nhau khi dữ liệu cũ chưa
  set field mới.

*Đã chọn:* `kind` là field tường minh đặt lúc tạo node (mặc định `BRANCH`),
ghi đè hoàn toàn cách suy `role` cũ. Hệ quả kéo theo: `resolveNodeRole` bỏ
tham số `hasChildren`; **toàn bộ node cũ tự động thành BRANCH** (do
`@default(BRANCH)` ở migration) → không còn node nào điều hướng được cho tới
khi người dùng tạo/chuyển node sang TOPIC. Đây là đánh đổi có chủ đích (đúng
theo migration default), không phải bug — nhưng đủ bất ngờ với người dùng nên
phải bù lại bằng mục 2 dưới đây.

**2. Branch/root không điều hướng được nữa → cần lối vào khác**

*Các hướng đã cân nhắc:*
- Click branch/root không làm gì (giữ nguyên chevron nhỏ để mở/đóng nhánh). →
  Đơn giản nhất nhưng bít mất đường vào trang chi tiết của node BRANCH (chỉnh
  goal/tags/độ khó...) trừ khi đã có ít nhất 1 con TOPIC để lách qua breadcrumb.
- Luôn điều hướng vào trang chi tiết như cũ, bất kể kind. → Loại vì đi ngược
  lại đúng yêu cầu ban đầu.

*Đã chọn:* Click branch/root mở **modal xem nhanh** (`NodeQuickViewModal`) —
thông tin sơ lược + form thêm node con ngay tại chỗ (tái dùng `AddChildBox`),
kèm nút "Xem trang chi tiết đầy đủ" để vẫn mở được trang chi tiết khi cần.
Vừa giữ đúng yêu cầu (branch không tự nhảy trang), vừa không bít đường vào
chi tiết, vừa giảm số lần phải rời canvas chỉ để thêm 1 nhánh con.

**3. GrowthCard: Mastery % vs Health score % — 2 con số khác nhau, không phải 1**

Ảnh mẫu có cả "MASTERY 92%" và "96% Healthy" cạnh nhau — nhìn qua tưởng trùng
lặp nhưng thực ra là 2 tín hiệu khác nhau: Mastery đo **khối lượng nội dung**
(số ghi chú / ngưỡng kỳ vọng), Health score đo **chất lượng thói quen học**
(độ đều streak 7 ngày + độ mới hoạt động + không có vấn đề tồn đọng, trọng số
40/40/20). Tách 2 công thức riêng (`getMasteryPercent` vs `getHealthScore`
trong `node-narrative.ts`) thay vì dùng chung 1 số — vì gộp lại sẽ mất khả
năng phân biệt "học nhiều nhưng ngắt quãng" với "học đều nhưng còn ít nội
dung", trong khi đây chính là 2 câu chuyện khác nhau mà card muốn kể.

**4. "AI Insight" — rule-based, không gọi LLM thật**

*Các hướng đã cân nhắc:*
- Gọi Claude API thật để sinh insight cá nhân hóa từ nội dung ghi chú. → Thông
  minh hơn nhưng phát sinh chi phí API, độ trễ, và cần thiết kế cache/khi nào
  regenerate — vượt phạm vi 1 lần redesign UI.
- Rule-based từ dữ liệu thật (không phải LLM). → **Đã chọn.** Câu insight vẫn
  đọc tự nhiên vì luôn bám dữ liệu thật (số vấn đề tồn đọng, node con
  TOPIC chưa hoàn thành gần nhất theo `orderIndex`...), không cần hạ tầng mới.
  Có thể nâng cấp lên LLM thật sau này như 1 feature riêng nếu cần, không phải
  làm lại từ đầu vì phần "next step" (dữ liệu) đã tách biệt khỏi phần "câu chữ".

**5. Icon tag công nghệ — `simple-icons` thay vì tự vẽ**

Card cần hiện đúng icon thương hiệu (JS/TS/NestJS/Prisma...) cho từng tag tự
do người dùng nhập. Tự maintain 1 icon map tay sẽ luôn thiếu khi có tag mới;
chọn `simple-icons` (~3000 icon thương hiệu có sẵn, khớp tên tự động qua
slug) — đánh đổi là thêm 1 dependency, nhưng tránh được việc phải cập nhật
tay icon map mỗi khi có công nghệ mới xuất hiện trong ghi chú người dùng.

**Cách tư duy rút ra:** Khi 1 field mới (`kind`) thay đổi hành vi điều hướng
sẵn có, luôn phải tự hỏi "dữ liệu cũ sẽ rơi vào nhánh nào của logic mới?" —
ở đây toàn bộ node cũ lặng lẽ thành BRANCH và mất khả năng điều hướng, nếu
không chủ động thiết kế modal xem nhanh bù lại thì tính năng sẽ trông như bị
hỏng dù code hoàn toàn đúng theo yêu cầu. Tương tự, khi ảnh mẫu có 2 con số
trông giống nhau (Mastery/Health), đừng vội gộp làm 1 — hỏi xem chúng có thực
sự đo cùng 1 thứ không trước khi tối giản.

---

## 2026-07-29 — Follow/Block giữa các tài khoản: áp dụng lý do của FlockDB (Twitter), không copy kiến trúc

**Vấn đề:** Thiết kế quan hệ follow cho career-tree sau khi nghiên cứu FlockDB
(hệ thống social graph nội bộ Twitter xây từ 2010). Follower/following đều là
truy vấn nóng ngang nhau (mỗi lần render feed/profile), và block phải là ràng
buộc cứng chặn được follow — cần đạt cả 2 yêu cầu đó trên 1 Postgres đơn,
không phải hạ tầng sharded như Twitter.

**Các hướng đã cân nhắc:**
1. Copy nguyên FlockDB: ghi 2 dòng vật lý mỗi lần follow (forward + backward
   edge). → Loại bỏ: Twitter làm vậy vì họ sharded MySQL ngang hàng (Gizzard),
   không có composite index xuyên node nhanh; ở quy mô 1 Postgres, ghi đúp là
   chi phí thừa (mỗi follow/unfollow phải đồng bộ 2 bản ghi, dễ lệch nếu 1
   trong 2 ghi thất bại).
2. **Composite PK `(followerId, followeeId)` + 2 index riêng chiều**
   (`[followeeId, createdAt]` và `[followerId, createdAt]`) thay cho 2 dòng
   vật lý. Postgres tự chọn đúng index theo chiều truy vấn, đạt cùng hiệu năng
   đọc 2 chiều mà chỉ 1 bản ghi/quan hệ — composite PK còn kiêm luôn vai trò
   chống follow trùng ở tầng DB (bắt lỗi Prisma P2002 ở service thay vì tự
   check tồn tại trước khi insert).
3. Check block SAU khi tạo follow rồi rollback nếu vi phạm. → Loại bỏ: tạo ra
   khoảng hở thời gian follow tồn tại dù bị block. Chọn: `isBlockedEitherDirection()`
   luôn gọi TRƯỚC bất kỳ ghi nào, 1 câu `OR` duy nhất (không phải 2 query
   riêng theo từng chiều) vì chỉ cần biết "có block giữa 2 người không", không
   cần biết ai block ai.
4. `followerCount`/`followingCount`: đếm real-time bằng `COUNT(*)` mỗi lần
   render, hay cache field cập nhật increment/decrement. → Chọn cache, với
   điều kiện bắt buộc đi kèm: mọi write phải nằm trong CÙNG 1 `$transaction`
   với thao tác tạo/xoá `UserFollow` — thiếu điều kiện này, counter sẽ lệch
   dần khỏi số dòng thật mà không ai phát hiện cho tới khi user thắc mắc.
5. Trả lỗi thật (403/lộ lý do) khi bị block, hay che giấu. → Chọn che giấu:
   trả `404 NotFoundException` giống hệt case "user không tồn tại" (cùng
   message) khi bị block chặn follow — nối lại đúng pattern 404-thay-403 đã
   dùng ở auth, để người bị chặn không phân biệt được "tài khoản không tồn
   tại" với "tôi bị chặn".
6. Tách `UserProfile` riêng (bio/cover/followerCount...) như thiết kế đích
   trong `user-schema-design.md`, hay giữ `followerCount`/`followingCount`
   thẳng trên `User`. → Chọn giữ trên `User` cho phạm vi hiện tại — tách
   `UserProfile` là 1 tính năng riêng (trang profile đầy đủ), chưa cần để
   Follow chạy được, tránh mở rộng phạm vi cho bài toán chưa thực sự tới.

**Phát hiện phụ (không phải bug, chỉ ghi lại vì không hiển nhiên lúc đầu):**
`blockUser` phải tự động unfollow cả 2 chiều (hệ quả bắt buộc của nguyên tắc
"block thắng follow" — không thể để tồn tại đồng thời 1 block và 1 follow
ngược hướng). Bản phác thảo đầu dùng `userFollow.deleteMany({ OR: [...] })`
xoá gộp cả 2 chiều trong 1 câu — nhưng như vậy không còn biết CHIỀU NÀO thực
sự bị xoá, nên không biết trừ counter của ai. Phải tách thành 2 lần
`findUnique` + `delete` riêng từng chiều, dài hơn nhưng biết chắc chiều nào
tồn tại mới trừ đúng `followerCount`/`followingCount` của đúng người.

**Cách tư duy rút ra:** Nghiên cứu kiến trúc hệ thống lớn nên tách 2 lớp:
**lý do kỹ thuật đằng sau quyết định** (đọc 2 chiều nhanh ngang nhau, block
phải thắng follow, đừng tối ưu bài toán chưa xảy ra) đúng ở mọi quy mô; còn
**cách hiện thực cụ thể** (2 bản ghi vật lý, sharded graph DB, fanout
push/pull) chỉ hợp lý ở đúng quy mô hệ thống gốc đang giải quyết. Copy lý do
mà bỏ qua bối cảnh quy mô sẽ dẫn tới over-engineering sớm.
