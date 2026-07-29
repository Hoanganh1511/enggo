# Engineering Log

File này không ghi lại **cái gì đã đổi** (đã có sẵn trong git log/diff) — mà ghi
lại **cách tư duy xử lý vấn đề**: đã cân nhắc những hướng nào, vì sao loại bỏ
hướng nào, chọn hướng nào và đánh đổi ra sao. Mục đích: sau này đọc lại (hoặc
gặp vấn đề tương tự) thì hiểu được lý do đằng sau quyết định, không chỉ đọc
được code đã đổi.

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
