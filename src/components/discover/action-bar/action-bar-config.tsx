import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  ExternalLink,
  Play,
  Download,
  Lightbulb,
  PartyPopper,
  Zap,
  HelpCircle,
  ThumbsUp,
  Star,
  Copy,
  TrendingUp,
  Megaphone,
  Share2,
} from "lucide-react";
import type { Post } from "@/content/home-feed-mock";
import type { ActionSlot } from "./ActionButton";

export type ActionBarLayout = { left: ActionSlot[]; right?: ActionSlot };

const heart = (count: number): ActionSlot => ({
  key: "like",
  icon: Heart,
  count,
  tone: "danger",
  fill: true,
});
const comment = (count: number): ActionSlot => ({
  key: "comment",
  icon: MessageCircle,
  count,
  tone: "neutral",
  interactive: false,
});
const repost = (count: number): ActionSlot => ({
  key: "repost",
  icon: Repeat2,
  count,
  tone: "success",
});
const bookmark = (): ActionSlot => ({
  key: "bookmark",
  icon: Bookmark,
  tone: "primary",
  fill: true,
});

// Moi "kind" co bo action rieng thay vi dung chung 1 bo Like/Comment/Repost/
// Save - vd Poll khong can "repost" (khong hop ngu nghia bau chon lai), File
// nhan manh so lan tai ve, Resource/Note/Question dua "Save"/"Helpful"/
// "Answer" len vi tri quan trong hon thay vi 1 icon bookmark chung chung.
export function getActionBarLayout(post: Post): ActionBarLayout {
  switch (post.kind) {
    case "text":
    case "image":
    case "gallery":
    case "timeline-event":
      return {
        left: [
          heart(post.stats.likes),
          comment(post.stats.comments),
          repost(post.stats.reposts),
        ],
        right: bookmark(),
      };

    case "video":
      return {
        left: [
          {
            key: "views",
            icon: Play,
            count: 12500,
            tone: "neutral",
            interactive: false,
          },
          heart(post.stats.likes),
          comment(post.stats.comments),
          repost(post.stats.reposts),
        ],
        right: bookmark(),
      };

    case "file":
      return {
        left: [
          { key: "download", icon: Download, count: 1200, tone: "primary" },
          heart(post.stats.likes),
          comment(post.stats.comments),
        ],
        right: bookmark(),
      };

    case "link":
      return {
        left: [
          heart(post.stats.likes),
          comment(post.stats.comments),
          repost(post.stats.reposts),
        ],
        right: {
          key: "visit",
          icon: ExternalLink,
          tone: "neutral",
          interactive: false,
        },
      };

    case "resource":
      return {
        left: [
          {
            key: "saved",
            icon: Bookmark,
            label: "Saved",
            count: 1100,
            tone: "primary",
            fill: true,
          },
          heart(post.stats.likes),
          comment(post.stats.comments),
        ],
      };

    case "note":
      return {
        left: [
          {
            key: "helpful",
            icon: Lightbulb,
            label: "Helpful",
            count: 623,
            tone: "warning",
          },
          comment(post.stats.comments),
        ],
        right: {
          key: "saved",
          icon: Bookmark,
          label: "Saved",
          count: 212,
          tone: "primary",
          fill: true,
        },
      };

    case "project-update":
      return {
        left: [
          heart(post.stats.likes),
          { key: "celebrate", icon: PartyPopper, count: 98, tone: "success" },
          comment(post.stats.comments),
        ],
        right: bookmark(),
      };

    case "achievement":
      return {
        left: [
          { key: "reaction", icon: Zap, count: 1500, tone: "warning" },
          heart(post.stats.likes),
          comment(post.stats.comments),
        ],
        right: { key: "share", icon: Share2, count: 42, tone: "neutral" },
      };

    case "question":
      return {
        left: [
          {
            key: "answer",
            icon: HelpCircle,
            label: "Answer",
            count: 23,
            tone: "primary",
          },
          comment(post.stats.comments),
        ],
        right: {
          key: "save",
          icon: Bookmark,
          label: "Save",
          tone: "primary",
          fill: true,
        },
      };

    case "poll":
      return {
        left: [
          {
            key: "votes",
            icon: ThumbsUp,
            count: post.options.reduce((sum, o) => sum + o.votes, 0),
            tone: "primary",
            interactive: false,
          },
          comment(post.stats.comments),
        ],
      };

    case "career-update":
      return {
        left: [
          heart(post.stats.likes),
          comment(post.stats.comments),
          {
            key: "celebrate",
            icon: PartyPopper,
            label: "Celebrate",
            tone: "success",
          },
        ],
        right: bookmark(),
      };

    case "skill-update":
      return {
        left: [
          { key: "star", icon: Star, count: 415, tone: "warning", fill: true },
          comment(post.stats.comments),
        ],
        right: {
          key: "save",
          icon: Bookmark,
          label: "Save",
          count: 156,
          tone: "primary",
          fill: true,
        },
      };

    case "milestone":
      return {
        left: [
          {
            key: "celebrate",
            icon: PartyPopper,
            label: "Celebrate",
            count: 342,
            tone: "success",
          },
          heart(post.stats.likes),
          comment(post.stats.comments),
        ],
      };

    case "code-snippet":
      return {
        left: [
          {
            key: "copy",
            icon: Copy,
            label: "Copy",
            count: 842,
            tone: "primary",
          },
          heart(post.stats.likes),
          comment(post.stats.comments),
        ],
      };

    case "idea":
      return {
        left: [
          {
            key: "insightful",
            icon: Lightbulb,
            label: "Insightful",
            count: 512,
            tone: "warning",
          },
          comment(post.stats.comments),
        ],
        right: bookmark(),
      };

    case "tutorial":
      return {
        left: [
          {
            key: "save",
            icon: Bookmark,
            label: "Save",
            count: 732,
            tone: "primary",
            fill: true,
          },
          heart(post.stats.likes),
          comment(post.stats.comments),
        ],
      };

    case "experiment":
      return {
        left: [
          {
            key: "results",
            icon: TrendingUp,
            label: "Results",
            count: 287,
            tone: "success",
          },
          heart(post.stats.likes),
          comment(post.stats.comments),
        ],
      };

    case "event":
      return {
        left: [
          {
            key: "interested",
            icon: Megaphone,
            label: "Interested",
            count: 421,
            tone: "primary",
          },
          heart(post.stats.likes),
          comment(post.stats.comments),
        ],
        right: { key: "share", icon: Share2, label: "Share", tone: "neutral" },
      };

    case "node-created":
    case "knowledge-block":
      return {
        left: [
          heart(post.stats.likes),
          comment(post.stats.comments),
          repost(post.stats.reposts),
        ],
        right: bookmark(),
      };
  }
}
