import type { LucideIcon } from "lucide-react";
import { Layers, Boxes, Code2, Cloud, Database } from "lucide-react";

// MOCK con lai chua "that hoa" duoc trong lan chuyen Post sang backend that
// (xem home-feed-mock.ts) - PEOPLE_TO_FOLLOW/TRENDING_SKILLS can 1 he thong
// Follow that + thong ke bai viet theo skill de tinh matchPercent/followers/
// helpfulPercent, ngoai pham vi "seed data cho Post" lan nay. Giu MOCK co y
// (khong xoa/khong gia vo la that) thay vi tu y xay them 1 he thong Follow
// rieng khong ai yeu cau.
export type TrendingSkill = {
  name: string;
  icon: LucideIcon;
  accent: string;
  posts: number;
  trend: number[];
};

export const TRENDING_SKILLS: TrendingSkill[] = [
  {
    name: "System Design",
    icon: Layers,
    accent: "#22d3ee",
    posts: 1200,
    trend: [3, 4, 4, 6, 5, 7, 9, 8, 10, 12],
  },
  {
    name: "Docker",
    icon: Boxes,
    accent: "#38bdf8",
    posts: 987,
    trend: [6, 5, 7, 6, 8, 7, 9, 8, 9, 10],
  },
  {
    name: "React Server Components",
    icon: Code2,
    accent: "#8b5cf6",
    posts: 864,
    trend: [4, 5, 4, 5, 6, 5, 6, 7, 6, 8],
  },
  {
    name: "AWS CDK",
    icon: Cloud,
    accent: "#f59e0b",
    posts: 642,
    trend: [8, 7, 6, 7, 5, 6, 5, 6, 5, 4],
  },
  {
    name: "Vector Database",
    icon: Database,
    accent: "#8b5cf6",
    posts: 512,
    trend: [2, 3, 3, 4, 5, 6, 7, 7, 8, 9],
  },
];

export const PEOPLE_TO_FOLLOW: {
  name: string;
  username: string;
  role: string;
  verified: boolean;
  matchPercent: number;
  tags: string[];
  posts: number;
  followers: number;
  helpfulPercent: number;
}[] = [
  {
    name: "Anh Nguyễn",
    username: "anh.dev",
    role: "Senior Frontend Engineer",
    verified: true,
    matchPercent: 92,
    tags: ["React", "TypeScript", "Next.js"],
    posts: 48,
    followers: 12400,
    helpfulPercent: 97,
  },
  {
    name: "Huy Lê",
    username: "huy.cloud",
    role: "Cloud Architect",
    verified: true,
    matchPercent: 88,
    tags: ["AWS", "Docker", "K8s"],
    posts: 36,
    followers: 8700,
    helpfulPercent: 96,
  },
  {
    name: "Phương Trần",
    username: "phuong.ai",
    role: "ML Engineer",
    verified: true,
    matchPercent: 85,
    tags: ["ML", "Python", "PyTorch"],
    posts: 29,
    followers: 11200,
    helpfulPercent: 94,
  },
  {
    name: "Minh Trần",
    username: "minh.engineer",
    role: "DevOps Engineer",
    verified: true,
    matchPercent: 83,
    tags: ["DevOps", "Terraform", "CI/CD"],
    posts: 41,
    followers: 6100,
    helpfulPercent: 93,
  },
];
