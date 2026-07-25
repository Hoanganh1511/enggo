# Engineering Log

File này không ghi lại **cái gì đã đổi** (đã có sẵn trong git log/diff) — mà ghi
lại **cách tư duy xử lý vấn đề**: đã cân nhắc những hướng nào, vì sao loại bỏ
hướng nào, chọn hướng nào và đánh đổi ra sao. Mục đích: sau này đọc lại (hoặc
gặp vấn đề tương tự) thì hiểu được lý do đằng sau quyết định, không chỉ đọc
được code đã đổi.

---

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
