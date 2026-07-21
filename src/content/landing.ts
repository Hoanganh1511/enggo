import { BellRing, Layers, NotebookPen, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const hero = {
  headline: "Nhìn thấy sự trưởng thành của bạn, không chỉ ghi chú nó",
  subheadline:
    "Biến mỗi mục tiêu học tập thành một cái cây — tách nhánh khi cần đào sâu, biết ngay chỗ nào đang bị bỏ quên.",
  ctaPrimaryLabel: "Bắt đầu miễn phí",
  ctaSecondary: { label: "Xem demo", href: "#how-it-works" },
};

export const problems: { title: string; description: string }[] = [
  {
    title: "Ghi chú rải rác khắp nơi",
    description:
      "Notion, Google Docs, sổ tay... — không có nơi nào cho bạn thấy bức tranh tổng thể của cả hành trình.",
  },
  {
    title: "Bỏ quên mà không hay biết",
    description:
      "Một chủ đề bạn từng rất tâm huyết, giờ im lìm cả tháng trời mà chẳng có gì nhắc bạn quay lại.",
  },
  {
    title: "Tiến độ chỉ nằm trong đầu",
    description:
      "Không có gì cụ thể để nhìn lại, để thấy rõ mình đã đi được bao xa và tự hào về điều đó.",
  },
];

export const howItWorks: {
  step: number;
  title: string;
  description: string;
  highlight: string[];
}[] = [
  {
    step: 1,
    title: "Tạo mục tiêu gốc",
    description:
      'Bắt đầu với một mục tiêu lớn — ví dụ "Sự nghiệp của tôi". Đây sẽ là gốc của cả cái cây.',
    highlight: ["career"],
  },
  {
    step: 2,
    title: "Tách nhánh khi cần đào sâu",
    description:
      'Từ gốc, tách ra "Backend" — rồi tiếp tục tách nhỏ thành "API Design", "Database", "Authentication".',
    highlight: ["backend", "api-design", "database", "authentication"],
  },
  {
    step: 3,
    title: "Ghi chú & đặt tần suất ôn tập riêng từng nhánh",
    description:
      '"Backend" cần ôn Hằng ngày, "English" chỉ Thỉnh thoảng — mỗi nhánh có nhịp độ riêng của nó.',
    highlight: ["backend", "english"],
  },
];

export const features: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Layers,
    title: "Cây phân cấp không giới hạn độ sâu",
    description:
      "Tách nhánh bao nhiêu tầng tuỳ ý — mỗi mục tiêu lớn có thể chia nhỏ đến mức chi tiết nhất.",
  },
  {
    icon: BellRing,
    title: "Nhắc ôn tập theo tần suất riêng",
    description:
      "Mỗi nhánh có nhịp độ ôn tập của riêng nó — Hằng ngày, Hằng tuần, hay Thỉnh thoảng.",
  },
  {
    icon: NotebookPen,
    title: "Ghi chú rich-text ngay trong node",
    description:
      "Không cần mở thêm app ghi chú nào khác — mọi ghi chép nằm ngay tại đúng nhánh đang học.",
  },
  {
    icon: Share2,
    title: "Chia sẻ workspace, ẩn phần riêng tư",
    description:
      "Chia sẻ tiến độ với người khác, đồng thời ẩn đi những nhánh bạn muốn giữ riêng cho mình.",
  },
];

export const useCases: {
  title: string;
  description: string;
  example: string;
}[] = [
  {
    title: "Học kỹ năng mới cho công việc",
    description:
      "Backend, Data Analysis, Product Design — tách nhánh theo đúng lộ trình bạn đang theo đuổi.",
    example: "Backend → API Design, Database",
  },
  {
    title: "Ngoại ngữ & nhạc cụ",
    description:
      "Theo dõi từng kỹ năng nhỏ: phát âm, ngữ pháp, một bản nhạc đang tập — không gì bị bỏ sót.",
    example: "English → Speaking, Grammar",
  },
  {
    title: "Mục tiêu sự nghiệp dài hạn",
    description:
      "Một cái cây duy nhất cho cả hành trình — từ kỹ năng kỹ thuật đến kỹ năng mềm.",
    example: "Sự nghiệp của tôi → Leadership",
  },
];

export const screenshots: { src: string; alt: string; width: number; height: number }[] = [
  {
    src: "/demo.png",
    alt: "Canvas cây phân cấp thật của Career Tree, hiển thị các nhánh mục tiêu học tập với progress bar và số ghi chú",
    width: 1713,
    height: 840,
  },
];

export const faqs: { question: string; answer: string }[] = [
  {
    question: "Dữ liệu của tôi có export được không?",
    answer:
      "Có. Mọi ghi chú, cấu trúc cây và tiến độ đều thuộc về bạn — chúng tôi đang hoàn thiện tính năng export để bạn luôn có thể mang dữ liệu đi bất cứ lúc nào.",
  },
  {
    question: "Có giới hạn số node hay số nhánh không?",
    answer:
      "Không. Cây của bạn có thể sâu và rộng bao nhiêu tuỳ thích — không giới hạn số tầng, không giới hạn số nhánh con.",
  },
  {
    question: "Dùng miễn phí được bao lâu, có mất phí không?",
    answer:
      "Miễn phí hoàn toàn ở giai đoạn hiện tại. Chúng tôi sẽ thông báo rõ ràng trước khi có bất kỳ thay đổi nào về chi phí trong tương lai.",
  },
  {
    question: "Có dùng được cho lĩnh vực ngoài công nghệ không?",
    answer:
      "Có. Career Tree được thiết kế cho bất kỳ ai theo đuổi một mục tiêu dài hạn — ngoại ngữ, nhạc cụ, thể thao, sự nghiệp... không riêng gì dân kỹ thuật.",
  },
];

export const ctaFinal = {
  headline: "Bắt đầu vẽ cái cây học tập của riêng bạn",
  ctaLabel: "Bắt đầu miễn phí",
};

export const footer = {
  links: [
    { label: "Về chúng tôi", href: "#" },
    { label: "Liên hệ", href: "#" },
    { label: "Điều khoản", href: "#" },
  ],
};
