"use client";

import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import type { ApiResource, ResourceType } from "@/lib/api/types";

export const TYPE_LABEL: Record<ResourceType, string> = {
  ARTICLE: "Article",
  VIDEO: "Video",
  DOC: "Doc",
  COURSE: "Course",
  BOOK: "Book",
};

export const TYPE_STYLE: Record<ResourceType, string> = {
  ARTICLE: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  VIDEO: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  DOC: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  COURSE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  BOOK: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

type ResourcesTabProps = {
  resources: ApiResource[];
  onAddResource: (data: {
    type: ResourceType;
    title: string;
    url: string;
  }) => void;
  onDeleteResource: (resourceId: string) => void;
};

const ResourcesTab = ({
  resources,
  onAddResource,
  onDeleteResource,
}: ResourcesTabProps) => {
  const [type, setType] = useState<ResourceType>("ARTICLE");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    if (!title.trim() || !url.trim()) return;
    onAddResource({ type, title: title.trim(), url: url.trim() });
    setTitle("");
    setUrl("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ResourceType)}
          className="cursor-pointer rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-ink focus:border-focus-border focus:outline-none"
        >
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Tên tài liệu..."
          className="min-w-40 flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:border-focus-border focus:outline-none"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="URL..."
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

      {resources.length === 0 ? (
        <p className="text-sm text-ink-muted">Chưa có tài liệu nào.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="group flex items-center gap-2 rounded-lg border border-border px-3 py-2"
            >
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${TYPE_STYLE[resource.type]}`}
              >
                {TYPE_LABEL[resource.type]}
              </span>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center gap-1 truncate text-sm text-ink underline decoration-border underline-offset-2 transition-colors duration-150 ease-out hover:text-primary"
              >
                <span className="truncate">{resource.title}</span>
                <ExternalLink
                  size={12}
                  strokeWidth={1.75}
                  className="shrink-0"
                />
              </a>
              <button
                type="button"
                onClick={() => onDeleteResource(resource.id)}
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

export default ResourcesTab;
