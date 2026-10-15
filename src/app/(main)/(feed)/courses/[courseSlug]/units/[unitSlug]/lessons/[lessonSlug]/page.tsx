import Link from "next/link";
import { auth } from "@/auth";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ElPageShell } from "@/components/english-learner/ElPageShell";
import { ElLoginPrompt, ElErrorState } from "@/components/english-learner/ElStates";
import { ConceptBlock } from "@/components/english-learner/ConceptBlock";
import { getElLessonAction } from "@/actions/english-learner/english-learner";

// [2026-10-15] Trang Lesson (spec muc 8.4) - bo cuc don gian hoa so voi spec
// goc (khong tach sidebar/main/right-rail rieng, vi 1 Lesson demo chi co
// 1-2 Concept - sidebar rieng cho noi dung ngan se thua) nhung GIU NGUYEN
// tinh chat: breadcrumb + Previous/Next ro rang, Concept render qua 1
// component DUY NHAT (ConceptBlock) bat ke Grammar hay Vocabulary.
export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; unitSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, unitSlug, lessonSlug } = await params;
  const session = await auth();
  if (!session?.username) {
    return (
      <ElPageShell>
        <ElLoginPrompt />
      </ElPageShell>
    );
  }

  const lesson = await getElLessonAction(courseSlug, unitSlug, lessonSlug).catch(() => null);
  if (!lesson) {
    return (
      <ElPageShell>
        <ElErrorState message={`Không tìm thấy Lesson "${lessonSlug}".`} />
      </ElPageShell>
    );
  }

  return (
    <ElPageShell>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-[12px] font-medium text-ink-muted">
            <Link href={`/courses/${courseSlug}/units/${unitSlug}`} className="hover:underline">
              {lesson.sectionTitle}
            </Link>
          </p>
          <h1 className="mt-1 text-[20px] font-bold text-ink">{lesson.title}</h1>
        </div>

        <div className="flex flex-col gap-4">
          {lesson.concepts.map((c) => (
            <ConceptBlock key={c.id} concept={c} />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          {lesson.previous ? (
            <Link
              href={`/courses/${courseSlug}/units/${unitSlug}/lessons/${lesson.previous.slug}`}
              className="flex items-center gap-1.5 text-[13px] font-medium text-ink hover:text-primary"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              {lesson.previous.title}
            </Link>
          ) : (
            <Link
              href={`/courses/${courseSlug}/units/${unitSlug}`}
              className="flex items-center gap-1.5 text-[13px] font-medium text-ink-muted hover:text-ink"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Quay lại Unit
            </Link>
          )}

          {lesson.next ? (
            <Link
              href={`/courses/${courseSlug}/units/${unitSlug}/lessons/${lesson.next.slug}`}
              className="flex items-center gap-1.5 text-[13px] font-medium text-ink hover:text-primary"
            >
              {lesson.next.title}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href={`/courses/${courseSlug}/units/${unitSlug}/practice`}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white hover:opacity-90"
            >
              Vào luyện tập
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </ElPageShell>
  );
}
