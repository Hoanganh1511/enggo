"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { ApiIssue } from "@/lib/api/types";

type IssuesTabProps = {
  issues: ApiIssue[];
  onAddIssue: (question: string) => void;
  onToggleIssue: (issueId: string, resolved: boolean) => void;
  onDeleteIssue: (issueId: string) => void;
};

const IssuesTab = ({
  issues,
  onAddIssue,
  onToggleIssue,
  onDeleteIssue,
}: IssuesTabProps) => {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    if (!question.trim()) return;
    onAddIssue(question.trim());
    setQuestion("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Vấn đề/câu hỏi còn tồn đọng..."
          className="min-w-40 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition-colors duration-150 ease-out hover:bg-primary-hover"
        >
          Thêm
        </button>
      </div>

      {issues.length === 0 ? (
        <p className="text-sm text-ink-muted">Chưa có vấn đề tồn đọng nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {issues.map((issue) => (
            <li
              key={issue.id}
              className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2"
            >
              <input
                type="checkbox"
                checked={issue.resolved}
                onChange={(e) => onToggleIssue(issue.id, e.target.checked)}
                className="shrink-0 cursor-pointer"
              />
              <span
                className={`min-w-0 flex-1 truncate text-sm ${
                  issue.resolved ? "text-ink-faint line-through" : "text-ink"
                }`}
              >
                {issue.question}
              </span>
              <button
                type="button"
                onClick={() => onDeleteIssue(issue.id)}
                className="shrink-0 cursor-pointer rounded p-1 text-ink-disabled opacity-0 transition-opacity duration-150 ease-out hover:text-red-600 group-hover:opacity-100"
              >
                <Trash2 size={13} strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IssuesTab;
