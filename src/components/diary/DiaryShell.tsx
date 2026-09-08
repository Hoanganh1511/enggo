"use client";

import { useEffect, useState } from "react";
import { DiaryTopicSidebar } from "./DiaryTopicSidebar";
import { DiaryEntrySlides } from "./DiaryEntrySlides";
import { createDiaryTopicAction } from "@/actions/diary/create-diary-topic";
import { updateDiaryTopicAction } from "@/actions/diary/update-diary-topic";
import { deleteDiaryTopicAction } from "@/actions/diary/delete-diary-topic";
import { listDiaryEntriesAction } from "@/actions/diary/list-diary-entries";
import { createDiaryEntryAction } from "@/actions/diary/create-diary-entry";
import { updateDiaryEntryAction } from "@/actions/diary/update-diary-entry";
import { deleteDiaryEntryAction } from "@/actions/diary/delete-diary-entry";
import type { ApiDiaryEntry, ApiDiaryTopic } from "@/lib/api/types";
import type { DiaryEntryInput } from "@/lib/api/diary";

// Layout that cua GL Daily Diary: sidebar chu de (trai) + entries dang slide
// cuon ngang (phai) - xem plan. Topics fetch server-side (page.tsx) truyen
// vao lam initial state; entries fetch LAZY theo topic dang chon (cache
// trong entriesByTopic, tranh goi lai khi quay lai 1 chu de da xem).
export function DiaryShell({
  initialTopics,
}: {
  initialTopics: ApiDiaryTopic[];
}) {
  const [topics, setTopics] = useState(initialTopics);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    initialTopics[0]?.id ?? null,
  );
  const [entriesByTopic, setEntriesByTopic] = useState<
    Record<string, ApiDiaryEntry[]>
  >({});

  useEffect(() => {
    if (!selectedTopicId || entriesByTopic[selectedTopicId]) return;
    let cancelled = false;
    listDiaryEntriesAction(selectedTopicId).then((entries) => {
      if (cancelled) return;
      setEntriesByTopic((prev) => ({ ...prev, [selectedTopicId]: entries }));
    });
    return () => {
      cancelled = true;
    };
  }, [selectedTopicId, entriesByTopic]);

  const loading =
    selectedTopicId !== null && entriesByTopic[selectedTopicId] === undefined;

  async function refreshEntries(topicId: string) {
    const entries = await listDiaryEntriesAction(topicId);
    setEntriesByTopic((prev) => ({ ...prev, [topicId]: entries }));
  }

  async function handleCreateTopic(name: string) {
    const topic = await createDiaryTopicAction({ name });
    setTopics((prev) => [...prev, topic]);
    setSelectedTopicId(topic.id);
  }

  async function handleRenameTopic(id: string, name: string) {
    const topic = await updateDiaryTopicAction(id, { name });
    setTopics((prev) => prev.map((t) => (t.id === id ? topic : t)));
  }

  async function handleDeleteTopic(id: string) {
    await deleteDiaryTopicAction(id);
    setTopics((prev) => prev.filter((t) => t.id !== id));
    setEntriesByTopic((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSelectedTopicId((prev) => (prev === id ? null : prev));
  }

  async function handleCreateEntry(dto: DiaryEntryInput) {
    if (!selectedTopicId) return;
    await createDiaryEntryAction(selectedTopicId, dto);
    await refreshEntries(selectedTopicId);
  }

  async function handleUpdateEntry(id: string, dto: DiaryEntryInput) {
    if (!selectedTopicId) return;
    await updateDiaryEntryAction(id, dto);
    await refreshEntries(selectedTopicId);
  }

  async function handleDeleteEntry(id: string) {
    if (!selectedTopicId) return;
    await deleteDiaryEntryAction(id);
    await refreshEntries(selectedTopicId);
  }

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null;

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <DiaryTopicSidebar
        topics={topics}
        selectedTopicId={selectedTopicId}
        onSelect={setSelectedTopicId}
        onCreate={handleCreateTopic}
        onRename={handleRenameTopic}
        onDelete={handleDeleteTopic}
      />
      <DiaryEntrySlides
        topicName={selectedTopic?.name ?? null}
        entries={selectedTopicId ? (entriesByTopic[selectedTopicId] ?? []) : []}
        loading={loading}
        onCreate={handleCreateEntry}
        onUpdate={handleUpdateEntry}
        onDelete={handleDeleteEntry}
      />
    </div>
  );
}
