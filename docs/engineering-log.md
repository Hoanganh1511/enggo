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
