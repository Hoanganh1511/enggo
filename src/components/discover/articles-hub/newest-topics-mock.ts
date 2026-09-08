// DU LIEU TAM (theo yeu cau nguoi dung: "Tạm thời fix data, mỗi chủ đề
// khoảng 20 bài") - 10 chu de, moi chu de ~20 bai gia lap, CHI phuc vu bo cuc
// "Bài viết mới nhất theo chủ đề" (NewestSection.tsx) trong luc backend chua
// co du bai viet that cho tung linh vuc de xep 10 hang day du. Thay bang du
// lieu that (vd GET /posts?category=... cho tung nhom) khi so luong bai that
// du nhieu - KHONG phai muc tieu lau dai, chi la fixture hien thi.
export type MockPostCard = {
  id: string;
  title: string;
  author: string;
  time: string;
  likes: number;
};

type TopicSeed = { name: string; titles: string[] };

const AUTHORS = ["Tuấn Anh Hoàng", "Lucas Trần", "Thảo Nguyễn", "Hưng Lê", "Mai Phạm"];
const TIMES = [
  "3 ngày trước",
  "5 ngày trước",
  "1 tuần trước",
  "2 tuần trước",
  "3 tuần trước",
  "1 tháng trước",
];

const TOPIC_SEEDS: TopicSeed[] = [
  {
    name: "Frontend",
    titles: [
      "Hôm nay ôn lại luồng refresh token và fix xong lỗi race condition khi 2 tab cùng gọi API",
      "Vừa debug xong 1 con bug quái dị: connection pool bị leak vì quên đóng transaction",
      "Bỏ hẳn useEffect để đồng bộ state dẫn xuất, tính thẳng trong lúc render cho gọn",
      "So sánh Server Components và Client Components sau 3 tháng dùng thật trong dự án",
      "CSS container queries đã đủ chín để dùng production chưa? Thử nghiệm của mình",
      "Lười viết test cho component UI, cuối cùng vẫn phải quay lại viết vì regression",
      "Ghi chú nhỏ về React Compiler: khi nào cần useMemo, khi nào không còn cần nữa",
      "Chuyển từ styled-components sang Tailwind, 2 tuần sau nhìn lại thấy gì thay đổi",
      "Debug 1 buổi chiều vì quên rằng key trong list phải ổn định giữa các lần render",
      "Thử accessibility audit toàn bộ app, phát hiện 12 lỗi tưởng nhỏ mà không nhỏ",
    ],
  },
  {
    name: "Backend",
    titles: [
      "Ba năm trước mình còn không biết Git là gì. Hôm nay ngồi review pull request",
      "Thử cache-aside với Redis cho API list workspace, giảm p95 từ 400ms xuống 60ms",
      "Rút thời gian đóng sổ cuối tháng từ 9 ngày xuống 4 ngày nhờ 1 thay đổi nhỏ ở query",
      "Migrate từ REST sang tRPC cho 1 phần nội bộ - được và mất những gì",
      "Viết lại job cron chạy 6 tiếng thành job chạy song song, còn 40 phút",
      "Học cách đọc EXPLAIN ANALYZE của Postgres sau nhiều năm đoán mò",
      "Rate limit API bằng token bucket, so sánh với fixed window thấy khác biệt rõ",
      "Chuyển queue từ polling database sang BullMQ, giảm tải hẳn cho DB chính",
      "1 buổi tối vật lộn với deadlock vì 2 transaction lock ngược thứ tự nhau",
      "Ghi lại cách mình tổ chức migration cho 1 schema có 80 bảng không rối",
    ],
  },
  {
    name: "AI & Máy học",
    titles: [
      "Tắt 6 nhóm quảng cáo tiêu 60% ngân sách nhưng chỉ mang về 9% đơn hàng",
      "Thử RAG cho tài liệu nội bộ công ty, kết quả tốt hơn kỳ vọng ban đầu",
      "So sánh 3 model embedding tiếng Việt cho bài toán tìm kiếm ngữ nghĩa",
      "Prompt engineering không phải phép màu - những gì mình học được sau 6 tháng",
      "Xây agent nhỏ tự động review code, tiết kiệm 30 phút mỗi ngày cho team",
      "Fine-tune hay RAG? Bài toán cụ thể quyết định câu trả lời, không có công thức chung",
      "Ghi chú về chi phí vận hành 1 sản phẩm AI nhỏ sau 3 tháng chạy thật",
      "Đánh giá chất lượng output LLM bằng eval tự động, không còn ngồi đọc tay",
      "Học cách giới hạn context window cho chatbot nội bộ không bị lố ngân sách",
      "Thử nghiệm streaming response cho chatbot, trải nghiệm người dùng thay đổi rõ",
    ],
  },
  {
    name: "Thiết kế UI/UX",
    titles: [
      "Bỏ hẳn modal xác nhận cho hành động phụ, chuyển sang undo toast",
      "3 nguyên tắc mình luôn kiểm tra trước khi ship 1 màn hình mới",
      "Redesign trang chủ sau khi đọc lại 40 phản hồi người dùng gần nhất",
      "Học cách dùng khoảng trắng thay vì đường viền để phân tách nội dung",
      "So sánh 2 phiên bản onboarding qua A/B test, kết quả bất ngờ",
      "Ghi chú về contrast ratio sau khi audit accessibility toàn bộ app",
      "Vì sao mình bỏ hẳn animation loading spinner cho action nhanh dưới 300ms",
      "Thiết kế empty state kể được câu chuyện thay vì chỉ nói 'chưa có dữ liệu'",
      "Rút gọn form đăng ký từ 8 trường xuống 3 trường, tỉ lệ hoàn tất tăng gấp đôi",
      "Học cách đặt tên nút bấm rõ hành động thay vì chỉ 'OK'/'Xác nhận'",
    ],
  },
  {
    name: "Năng suất",
    titles: [
      "Thử lịch làm việc 4 ngày rưỡi trong 2 tháng, đây là những gì thay đổi",
      "Bỏ hẳn to-do list dài, chuyển sang chỉ chọn 3 việc quan trọng mỗi sáng",
      "Ghi chú về cách mình quản lý meeting để không còn ngày nào kín lịch",
      "Deep work 90 phút mỗi sáng thay đổi cách mình làm việc thế nào",
      "Học cách nói không với việc không quan trọng mà vẫn giữ quan hệ tốt",
      "Thử phương pháp 2 phút cho việc nhỏ, tồn đọng giảm hẳn sau 1 tuần",
      "Ghi lại 1 tuần không dùng điện thoại sau 9 giờ tối, ngủ ngon hơn rõ rệt",
      "Vì sao mình quay lại dùng giấy bút cho việc lên kế hoạch tuần",
      "Học cách chia nhỏ dự án lớn thành các mốc 1 tuần để không bị ngợp",
      "Thử batch xử lý email 2 lần/ngày thay vì check liên tục, tập trung hơn hẳn",
    ],
  },
  {
    name: "Kinh doanh",
    titles: [
      "Bài học từ lần đóng cửa sản phẩm đầu tiên sau 14 tháng vận hành",
      "Thử tăng giá 20% cho khách hàng mới, tỉ lệ chuyển đổi không đổi",
      "Ghi chú về cách mình định giá dịch vụ tư vấn sau nhiều lần định sai",
      "Học cách đọc báo cáo tài chính cơ bản khi không xuất thân dân kinh tế",
      "3 kênh marketing mình dừng hẳn vì chi phí trên mỗi khách hàng quá cao",
      "Xây dựng cộng đồng nhỏ trước khi có sản phẩm, đây là những gì học được",
      "Vì sao mình chọn bootstrap thay vì gọi vốn ở giai đoạn đầu",
      "Ghi lại cách đàm phán hợp đồng đầu tiên với 1 khách hàng doanh nghiệp",
      "Học cách tính đơn giá hoà vốn cho 1 sản phẩm SaaS nhỏ",
      "Thử chuyển từ mô hình 1 lần sang subscription, doanh thu ổn định hơn hẳn",
    ],
  },
  {
    name: "Mobile",
    titles: [
      "So sánh React Native và Flutter sau khi build cùng 1 app bằng cả 2",
      "Giảm cold start app từ 2.4s xuống 900ms bằng cách lazy load module",
      "Ghi chú về cách xử lý deep link không làm vỡ stack điều hướng",
      "Học cách debug crash chỉ xảy ra trên 1 dòng máy Android cụ thể",
      "Thử offline-first cho app ghi chú, đồng bộ lại khi có mạng ổn hơn hẳn",
      "Vì sao mình chuyển từ Redux sang state cục bộ cho phần lớn màn hình",
      "Tối ưu danh sách dài trên mobile bằng windowing, cuộn mượt hẳn",
      "Ghi lại quy trình release lên 2 store không còn mất cả buổi",
      "Học cách test app trên thiết bị thật thay vì chỉ tin vào simulator",
      "Thử push notification thông minh hơn, tỉ lệ mở tăng nhưng gỡ cài đặt giảm",
    ],
  },
  {
    name: "DevOps & Cloud",
    titles: [
      "Chuyển CI từ 18 phút xuống 6 phút bằng cache dependency đúng cách",
      "Ghi chú về lần rollback production lúc nửa đêm và bài học rút ra",
      "Thử blue-green deploy cho service nhỏ, downtime gần như bằng 0",
      "Học cách đọc log tập trung khi có 12 service chạy song song",
      "Vì sao mình chuyển từ server riêng sang serverless cho phần batch job",
      "Giảm chi phí cloud 35% chỉ bằng cách dọn tài nguyên không dùng tới",
      "Ghi lại cách set up alert không làm phiền nhưng vẫn kịp báo sự cố",
      "Thử infrastructure as code cho toàn bộ hệ thống, review dễ hơn hẳn",
      "Học cách viết healthcheck thật sự phản ánh đúng sức khoẻ service",
      "Chuyển database sang read replica, giảm tải rõ rệt cho instance chính",
    ],
  },
  {
    name: "Viết lách",
    titles: [
      "Viết đều mỗi ngày 15 phút, sau 3 tháng nhìn lại thay đổi bất ngờ",
      "Bỏ hẳn việc chỉnh sửa khi đang viết nháp, tốc độ ra ý tăng gấp đôi",
      "Ghi chú về cách mình chọn chủ đề để không bao giờ hết ý tưởng",
      "Học cách viết tiêu đề rõ ràng thay vì cố gắng nghe cho 'kêu'",
      "Vì sao mình đọc lại bài viết cũ 1 năm trước và thấy ngại",
      "Thử viết public trước khi hiểu rõ vấn đề, ép bản thân suy nghĩ mạch lạc hơn",
      "Ghi lại quy trình biên tập 3 bước mình dùng cho mọi bài viết dài",
      "Học cách kết bài không lặp lại y nguyên phần mở đầu",
      "Vì sao mình chuyển từ viết trên máy sang viết tay cho bản nháp đầu",
      "Thử xuất bản đều đặn thay vì chờ 'hoàn hảo', chất lượng lại ổn định hơn",
    ],
  },
  {
    name: "Sự nghiệp",
    titles: [
      "Bài học sau lần đầu làm mentor cho 1 bạn junior trong 6 tháng",
      "Ghi chú về cách mình chuẩn bị cho buổi review lương nửa năm",
      "Học cách nói về thất bại trong phỏng vấn mà không nghe như đổ lỗi",
      "Vì sao mình chọn ở lại làm sâu 1 mảng thay vì nhảy việc liên tục",
      "Ghi lại 5 câu hỏi mình luôn hỏi ngược lại nhà tuyển dụng",
      "Thử làm việc từ xa hoàn toàn 1 năm, đây là những gì được và mất",
      "Học cách xây network không cần cố tỏ ra quen biết nhiều người",
      "Vì sao mình quyết định học thêm 1 kỹ năng ngoài chuyên môn chính",
      "Ghi chú về lần đầu quản lý 1 team nhỏ và những sai lầm đầu tiên",
      "Thử đặt mục tiêu sự nghiệp theo quý thay vì theo năm, dễ điều chỉnh hơn",
    ],
  },
];

function buildTopicPosts(topic: TopicSeed, count: number): MockPostCard[] {
  return Array.from({ length: count }, (_, i) => {
    const title = topic.titles[i % topic.titles.length];
    return {
      id: `${topic.name}-${i}`,
      title,
      author: AUTHORS[i % AUTHORS.length],
      time: TIMES[i % TIMES.length],
      likes: 40 + ((i * 37) % 260),
    };
  });
}

export const NEWEST_TOPICS: { name: string; posts: MockPostCard[] }[] = TOPIC_SEEDS.map(
  (topic) => ({ name: topic.name, posts: buildTopicPosts(topic, 20) }),
);
