import type { Post } from "@/content/home-feed-mock";
import { TextBody, ImageBody, GalleryBody, VideoBody } from "./MediaBody";
import { FileBody, LinkBody, ResourceBody } from "./AttachmentBody";
import { NoteBody, IdeaBody } from "./NoteBody";
import { ProjectUpdateBody } from "./ProjectUpdateBody";
import { QuestionBody, PollBody } from "./DiscussionBody";
import {
  AchievementBody,
  MilestoneBody,
  CareerUpdateBody,
  SkillUpdateBody,
  NodeCreatedBody,
  KnowledgeBlockBody,
  TimelineEventBody,
} from "./StatusBodies";
import { CodeSnippetBody } from "./CodeSnippetBody";
import { TutorialBody, ExperimentBody, EventBody } from "./ExpandedBodies";

// Dispatcher: moi "kind" co 1 body component rieng (xem cac file trong thu
// muc nay) - PostCard.tsx chi lo phan chung (header/actions), khong biet gi
// ve cach trinh bay tung loai noi dung.
export function PostBody({ post }: { post: Post }) {
  switch (post.kind) {
    case "text":
      return <TextBody post={post} />;
    case "image":
      return <ImageBody post={post} />;
    case "gallery":
      return <GalleryBody post={post} />;
    case "video":
      return <VideoBody post={post} />;
    case "file":
      return <FileBody post={post} />;
    case "link":
      return <LinkBody post={post} />;
    case "resource":
      return <ResourceBody post={post} />;
    case "note":
      return <NoteBody post={post} />;
    case "project-update":
      return <ProjectUpdateBody post={post} />;
    case "achievement":
      return <AchievementBody post={post} />;
    case "milestone":
      return <MilestoneBody post={post} />;
    case "question":
      return <QuestionBody post={post} />;
    case "poll":
      return <PollBody post={post} />;
    case "career-update":
      return <CareerUpdateBody post={post} />;
    case "skill-update":
      return <SkillUpdateBody post={post} />;
    case "node-created":
      return <NodeCreatedBody post={post} />;
    case "knowledge-block":
      return <KnowledgeBlockBody post={post} />;
    case "timeline-event":
      return <TimelineEventBody post={post} />;
    case "code-snippet":
      return <CodeSnippetBody post={post} />;
    case "idea":
      return <IdeaBody post={post} />;
    case "tutorial":
      return <TutorialBody post={post} />;
    case "experiment":
      return <ExperimentBody post={post} />;
    case "event":
      return <EventBody post={post} />;
  }
}
