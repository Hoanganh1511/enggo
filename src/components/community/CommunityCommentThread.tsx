"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { listPostCommentsAction } from "@/actions/community/list-post-comments";
import { createCommentAction } from "@/actions/community/create-comment";
import type { ApiComment } from "@/lib/api/types";

export function CommunityCommentThread({ postId }: { postId: string }) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [draft, setDraft] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    listPostCommentsAction(postId).then(setComments);
  }, [postId]);

  function submit() {
    if (!draft.trim()) return;
    startTransition(async () => {
      const comment = await createCommentAction(postId, draft);
      setComments((prev) => [...prev, comment]);
      setDraft("");
    });
  }

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-black/6 pt-3">
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-2">
          <Image
            src={c.author.avatarUrl}
            alt={c.author.name}
            width={24}
            height={24}
            className="size-6 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <span className="text-sm font-semibold text-ink">
              {c.author.name}
            </span>
            <p className="text-sm text-ink/85">{c.content}</p>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Viết bình luận..."
          className="h-8 flex-1 rounded-full border border-border px-3 text-sm outline-none focus:border-community-accent"
        />
        <button
          type="button"
          onClick={submit}
          className="cursor-pointer text-sm font-semibold text-community-accent"
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
