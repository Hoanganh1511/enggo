"use client";

import { useEffect, useRef, useState } from "react";
import {
  completeEnglishSessionAction,
  submitEnglishAnswerAction,
} from "@/actions/english-learner/english-learner";
import type {
  ApiEnglishAnswerResult,
  ApiEnglishCompleteResult,
  ApiEnglishSession,
} from "@/lib/api/english-learner";
import { QuizQuestion } from "./QuizQuestion";
import { QuestionFeedback } from "./QuestionFeedback";
import { SessionResult } from "./SessionResult";

type Phase = "answering" | "feedback" | "result";

export function SessionShell({ initialSession }: { initialSession: ApiEnglishSession }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [answerResult, setAnswerResult] = useState<ApiEnglishAnswerResult | null>(null);
  const [sessionResult, setSessionResult] = useState<ApiEnglishCompleteResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sessionStartedAtRef = useRef<number | null>(null);
  useEffect(() => {
    sessionStartedAtRef.current = Date.now();
  }, []);

  // Timer dem LEN (khong countdown, theo spec UX) - dung lam so sanh voi
  // minTimeSeconds de mo khoa nut "Tra loi".
  useEffect(() => {
    if (phase !== "answering") return;
    const timer = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const question = initialSession.questions[index];
  const canSubmit = elapsedSeconds >= question.minTimeSeconds;

  async function handleSubmit() {
    if (!selectedOptionId || submitting) return;
    setSubmitting(true);
    const result = await submitEnglishAnswerAction(initialSession.id, {
      questionId: question.id,
      selectedOptionId,
      timeSpentSeconds: elapsedSeconds,
    });
    setAnswerResult(result);
    setPhase("feedback");
    setSubmitting(false);
  }

  async function handleContinue() {
    const isLast = index === initialSession.questions.length - 1;
    if (!isLast) {
      setIndex((i) => i + 1);
      setSelectedOptionId(null);
      setAnswerResult(null);
      setElapsedSeconds(0);
      setPhase("answering");
      return;
    }

    setSubmitting(true);
    const startedAt = sessionStartedAtRef.current ?? Date.now();
    const totalTimeSeconds = Math.round((Date.now() - startedAt) / 1000);
    const result = await completeEnglishSessionAction(initialSession.id, { totalTimeSeconds });
    setSessionResult(result);
    setPhase("result");
    setSubmitting(false);
  }

  if (phase === "result" && sessionResult) {
    return <SessionResult result={sessionResult} />;
  }

  if (phase === "feedback" && answerResult) {
    return (
      <QuestionFeedback question={question} result={answerResult} onContinue={handleContinue} />
    );
  }

  return (
    <QuizQuestion
      question={question}
      index={index}
      total={initialSession.questions.length}
      elapsedSeconds={elapsedSeconds}
      canSubmit={canSubmit && !submitting}
      selectedOptionId={selectedOptionId}
      onSelect={setSelectedOptionId}
      onSubmit={handleSubmit}
    />
  );
}
