import type { Difficulty } from "@/lib/api/types";

// Preset "Tao Skill Set moi tu mau san" - danh sach TINH, khong can bang DB
// rieng (xem plan Skill Tree Phase 1). Server action doc file nay va tao
// that Workspace + Category + Tier + Node cho tung skill.
export type SkillSetPresetSkill = {
  title: string;
  difficulty?: Difficulty;
};

export type SkillSetPresetTier = {
  label: string;
  sublabel: string;
  skills: SkillSetPresetSkill[];
};

// Moi Category so huu bo Tier rieng cua no (khac Category khac khong dung
// chung Tier) - dung khai niem nay de mo phong dung cau truc anh mau
// (Frontend/Backend/Database/DevOps deu co Tier 1-4 rieng).
export type SkillSetPresetCategory = {
  name: string;
  tiers: SkillSetPresetTier[];
};

export type SkillSetPreset = {
  key: string;
  name: string;
  description: string;
  categories: SkillSetPresetCategory[];
};

export const SKILL_SET_PRESETS: SkillSetPreset[] = [
  {
    key: "backend-engineer",
    name: "Backend Engineer",
    description: "Node.js, database, API, hạ tầng triển khai.",
    categories: [
      {
        name: "Backend",
        tiers: [
          {
            label: "TIER 1",
            sublabel: "FOUNDATION",
            skills: [
              { title: "Linux Basics", difficulty: "EASY" },
              { title: "Git", difficulty: "EASY" },
              { title: "HTTP/HTTPS", difficulty: "EASY" },
              { title: "Terminal", difficulty: "EASY" },
            ],
          },
          {
            label: "TIER 2",
            sublabel: "CORE SKILLS",
            skills: [
              { title: "Node.js", difficulty: "MEDIUM" },
              { title: "Express.js", difficulty: "MEDIUM" },
              { title: "REST API", difficulty: "MEDIUM" },
              { title: "Authentication", difficulty: "MEDIUM" },
            ],
          },
          {
            label: "TIER 3",
            sublabel: "ADVANCED",
            skills: [
              { title: "Database Design", difficulty: "HARD" },
              { title: "SQL", difficulty: "MEDIUM" },
              { title: "Redis", difficulty: "HARD" },
              { title: "Message Queue", difficulty: "HARD" },
            ],
          },
          {
            label: "TIER 4",
            sublabel: "EXPERT",
            skills: [
              { title: "Docker", difficulty: "HARD" },
              { title: "Testing", difficulty: "MEDIUM" },
              { title: "CI/CD", difficulty: "HARD" },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "frontend-engineer",
    name: "Frontend Engineer",
    description: "React/Next.js, styling, hiệu năng, kiểm thử.",
    categories: [
      {
        name: "Frontend",
        tiers: [
          {
            label: "TIER 1",
            sublabel: "FOUNDATION",
            skills: [
              { title: "HTML/CSS", difficulty: "EASY" },
              { title: "JavaScript", difficulty: "EASY" },
              { title: "Git", difficulty: "EASY" },
            ],
          },
          {
            label: "TIER 2",
            sublabel: "CORE SKILLS",
            skills: [
              { title: "TypeScript", difficulty: "MEDIUM" },
              { title: "React", difficulty: "MEDIUM" },
              { title: "State Management", difficulty: "MEDIUM" },
              { title: "Responsive Design", difficulty: "EASY" },
            ],
          },
          {
            label: "TIER 3",
            sublabel: "ADVANCED",
            skills: [
              { title: "Next.js", difficulty: "HARD" },
              { title: "Server Components", difficulty: "HARD" },
              { title: "Performance Optimization", difficulty: "HARD" },
            ],
          },
          {
            label: "TIER 4",
            sublabel: "EXPERT",
            skills: [
              { title: "Testing", difficulty: "MEDIUM" },
              { title: "Accessibility", difficulty: "MEDIUM" },
            ],
          },
        ],
      },
    ],
  },
  {
    key: "full-stack-engineer",
    name: "Full Stack Engineer",
    description: "Frontend, Backend, Database, DevOps trong 1 workspace.",
    categories: [
      {
        name: "Frontend",
        tiers: [
          {
            label: "TIER 1",
            sublabel: "FOUNDATION",
            skills: [
              { title: "HTML/CSS", difficulty: "EASY" },
              { title: "JavaScript", difficulty: "EASY" },
            ],
          },
          {
            label: "TIER 2",
            sublabel: "CORE SKILLS",
            skills: [
              { title: "TypeScript", difficulty: "MEDIUM" },
              { title: "React", difficulty: "MEDIUM" },
              { title: "State Management", difficulty: "MEDIUM" },
            ],
          },
          {
            label: "TIER 3",
            sublabel: "ADVANCED",
            skills: [
              { title: "Next.js", difficulty: "HARD" },
              { title: "Server Components", difficulty: "HARD" },
            ],
          },
          {
            label: "TIER 4",
            sublabel: "EXPERT",
            skills: [{ title: "Performance Optimization", difficulty: "HARD" }],
          },
        ],
      },
      {
        name: "Backend",
        tiers: [
          {
            label: "TIER 1",
            sublabel: "FOUNDATION",
            skills: [
              { title: "Linux Basics", difficulty: "EASY" },
              { title: "Git", difficulty: "EASY" },
            ],
          },
          {
            label: "TIER 2",
            sublabel: "CORE SKILLS",
            skills: [
              { title: "Node.js", difficulty: "MEDIUM" },
              { title: "NestJS", difficulty: "MEDIUM" },
              { title: "REST API", difficulty: "MEDIUM" },
            ],
          },
          {
            label: "TIER 3",
            sublabel: "ADVANCED",
            skills: [
              { title: "Authentication", difficulty: "HARD" },
              { title: "Microservices", difficulty: "HARD" },
            ],
          },
          {
            label: "TIER 4",
            sublabel: "EXPERT",
            skills: [{ title: "Message Queue", difficulty: "HARD" }],
          },
        ],
      },
      {
        name: "Database",
        tiers: [
          {
            label: "TIER 1",
            sublabel: "FOUNDATION",
            skills: [{ title: "SQL Basics", difficulty: "EASY" }],
          },
          {
            label: "TIER 2",
            sublabel: "CORE SKILLS",
            skills: [
              { title: "PostgreSQL", difficulty: "MEDIUM" },
              { title: "Database Design", difficulty: "MEDIUM" },
            ],
          },
          {
            label: "TIER 3",
            sublabel: "ADVANCED",
            skills: [
              { title: "Redis", difficulty: "HARD" },
              { title: "Query Optimization", difficulty: "HARD" },
            ],
          },
          {
            label: "TIER 4",
            sublabel: "EXPERT",
            skills: [{ title: "Replication & Sharding", difficulty: "HARD" }],
          },
        ],
      },
      {
        name: "DevOps",
        tiers: [
          {
            label: "TIER 1",
            sublabel: "FOUNDATION",
            skills: [{ title: "Terminal", difficulty: "EASY" }],
          },
          {
            label: "TIER 2",
            sublabel: "CORE SKILLS",
            skills: [
              { title: "Docker", difficulty: "MEDIUM" },
              { title: "CI/CD", difficulty: "MEDIUM" },
            ],
          },
          {
            label: "TIER 3",
            sublabel: "ADVANCED",
            skills: [{ title: "Kubernetes", difficulty: "HARD" }],
          },
          {
            label: "TIER 4",
            sublabel: "EXPERT",
            skills: [{ title: "Infrastructure as Code", difficulty: "HARD" }],
          },
        ],
      },
    ],
  },
];
