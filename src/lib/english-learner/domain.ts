// [2026-10-15] NGUON SU THAT DUY NHAT cho du lieu English Learner phia FE -
// khop 1-1 voi career-tree-api/src/english-learner (DTO/service). Khong
// component nao tu dinh nghia lai shape rieng.

export type ElUnitType = "GRAMMAR" | "VOCABULARY" | "MIXED" | "REVIEW" | "PROGRESS_TEST";
export type ElSectionType =
  | "GRAMMAR_EXPLANATION"
  | "VOCAB_CONTRAST"
  | "PHRASAL_VERBS"
  | "COLLOCATIONS"
  | "WORD_PATTERNS"
  | "WORD_FORMATION"
  | "MIXED_PRACTICE"
  | "REVIEW"
  | "APPLICATION";
export type ElConceptType = "GRAMMAR" | "VOCABULARY";
export type ElExerciseType =
  | "MULTIPLE_CHOICE"
  | "GAP_FILL"
  | "SENTENCE_TRANSFORMATION"
  | "ERROR_CORRECTION"
  | "MATCHING"
  | "WORD_FORMATION";
export type ElDifficulty = "EASY" | "MEDIUM" | "HARD";
export type ElAttemptContext = "PRACTICE" | "UNIT_TEST" | "REVIEW";
export type ElProgressStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NEEDS_REVIEW"
  | "MASTERED";

export const EL_PROGRESS_STATUS_META: Record<
  ElProgressStatus,
  { label: string; color: string }
> = {
  NOT_STARTED: { label: "Chưa học", color: "#94A3B8" },
  IN_PROGRESS: { label: "Đang học", color: "#6366F1" },
  COMPLETED: { label: "Hoàn thành", color: "#22C55E" },
  NEEDS_REVIEW: { label: "Cần ôn lại", color: "#F59E0B" },
  MASTERED: { label: "Thành thạo", color: "#14B8A6" },
};

export const EL_UNIT_TYPE_META: Record<ElUnitType, { label: string }> = {
  GRAMMAR: { label: "Grammar" },
  VOCABULARY: { label: "Vocabulary" },
  MIXED: { label: "Mixed" },
  REVIEW: { label: "Review" },
  PROGRESS_TEST: { label: "Progress Test" },
};

export type ElCourseListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  coverImageUrl: string | null;
  objectives: string[];
  isDemo: boolean;
  unitCount: number;
};

export type ElCourseOverview = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  coverImageUrl: string | null;
  objectives: string[];
  isDemo: boolean;
  units: {
    id: string;
    slug: string;
    number: number;
    title: string;
    type: ElUnitType;
    topic: string | null;
    description: string | null;
    estimatedMinutes: number | null;
    sectionCount: number;
    exerciseCount: number;
    status: ElProgressStatus;
    progressPercent: number;
  }[];
  reviews: { id: string; title: string; description: string | null; coveredUnitIds: string[] }[];
};

export type ElUnitOverview = {
  id: string;
  slug: string;
  courseSlug: string;
  number: number;
  title: string;
  type: ElUnitType;
  topic: string | null;
  description: string | null;
  objectives: string[];
  estimatedMinutes: number | null;
  exerciseCount: number;
  sections: {
    id: string;
    slug: string;
    title: string;
    type: ElSectionType;
    description: string | null;
    lessons: {
      id: string;
      slug: string;
      title: string;
      conceptCount: number;
      status: ElProgressStatus;
      progressPercent: number;
    }[];
  }[];
};

export type ElExampleEntry = { en: string; vi: string; isNegative?: boolean };
export type ElNoteEntry = { title: string; note: string };
export type ElWordFamilyEntry = { word: string; partOfSpeech?: string };

export type ElVocabularyItem = {
  id: string;
  term: string;
  partOfSpeech: string | null;
  meaningVi: string;
  definitionEn: string | null;
  ipa: string | null;
  audioUrl: string | null;
  examples: { en: string; vi: string }[] | null;
  collocations: string[];
  wordPatterns: string[];
  wordFamily: ElWordFamilyEntry[] | null;
  confusableTerms: string[];
  notes?: string | null;
};

/** Dong tra ve tu GET .../vocabulary (/vocabulary - thu vien tu vung FLAT
 *  toan Course) - them context (tu thuoc Concept/Unit nao) so voi
 *  ElVocabularyItem thuong (nam san trong 1 Lesson, da biet ngu canh roi). */
export type ElVocabularyLibraryItem = ElVocabularyItem & {
  conceptTitle: string;
  unitTitle: string;
  unitSlug: string;
};

/** Exercise an toan gui ra FE - KHONG BAO GIO chua dap an/giai thich (xem
 *  backend english-learner.service.ts, toPublicExercise). */
export type ElPublicExercise = {
  id: string;
  conceptId: string;
  unitId: string;
  type: ElExerciseType;
  instruction: string;
  prompt: Record<string, unknown>;
  options: Record<string, unknown> | null;
  difficulty: ElDifficulty;
  points: number;
  hint: string | null;
  sortOrder: number;
};

export type ElConcept = {
  id: string;
  type: ElConceptType;
  title: string;
  explanation: string | null;
  formula: string | null;
  examples: ElExampleEntry[] | null;
  commonMistakes: ElNoteEntry[] | null;
  usageNotes: ElNoteEntry[] | null;
  relatedConceptIds: string[];
  vocabularyItems: ElVocabularyItem[];
  exercises: ElPublicExercise[];
};

export type ElLessonDetail = {
  id: string;
  slug: string;
  title: string;
  objectives: string[];
  unitSlug: string;
  courseSlug: string;
  sectionTitle: string;
  sectionType: ElSectionType;
  previous: { id: string; slug: string; title: string } | null;
  next: { id: string; slug: string; title: string } | null;
  concepts: ElConcept[];
};

export type ElCourseProgress = {
  courseSlug: string;
  status: ElProgressStatus;
  progressPercent: number;
  totalUnits: number;
  completedUnits: number;
  units: { slug: string; title: string; status: ElProgressStatus; progressPercent: number }[];
};

export type ElMistakeItem = {
  attemptId: string;
  exerciseId: string;
  exercise: ElPublicExercise;
  submittedAnswer: unknown;
  attemptedAt: string;
  conceptTitle: string;
  unitTitle: string;
  unitSlug: string;
  stillWrong: boolean;
};

export type ElReviewListItem = {
  id: string;
  title: string;
  description: string | null;
  coveredUnitIds: string[];
  exerciseCount: number;
};

export type ElReviewSession = {
  reviewId: string;
  title: string;
  exercises: ElPublicExercise[];
  mistakeCount: number;
};

/** Shape nguoi dung GUI (khop voi `answerConfig` cua chinh Exercise, khac
 *  nhau theo `type`) - xem backend scoreExercise() cho hop dong day du. */
export type ElSubmittedAnswer =
  | { selectedOptionId: string }
  | { blanks: Record<string, string> }
  | { text: string }
  | { pairs: Record<string, string> };

export type ElAttemptResult = {
  attemptId: string;
  isCorrect: boolean;
  score: number;
  correctAnswerDisplay: string;
  explanation: string | null;
};
