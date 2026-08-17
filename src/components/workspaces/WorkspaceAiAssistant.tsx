"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Sparkles, X } from "lucide-react";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import Spinner from "@/components/ui/spinner";
import { askWorkspaceAssistantAction } from "@/actions/ai-assistant/ask-workspace-assistant";
import type { ChatMessage } from "@/lib/api/types";

// Nut noi luon hien xuyen suot Workspace (browse + doc bai, dat trong
// WorkspaceShell.tsx nen khong remount khi dieu huong). Dung PopoverRoot/
// Trigger/Content co san (@/components/ui/popover) de tu dong co animation
// click-to-open dung chuan da chot trong CLAUDE.md + hanh vi dong khi click
// ra ngoai/Esc, khong tu viet lai AnimatePresence rieng.
export function WorkspaceAiAssistant({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSend = () => {
    const content = input.trim();
    if (!content || pending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    startTransition(async () => {
      try {
        const res = await askWorkspaceAssistantAction(workspaceId, next);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.answer },
        ]);
      } catch (err) {
        console.error("askWorkspaceAssistantAction failed", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Có lỗi xảy ra khi hỏi trợ lý AI, thử lại sau nhé.",
          },
        ]);
      }
    });
  };

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="fixed bottom-6 right-6 z-30 cursor-pointer drop-shadow-[0_8px_20px_rgba(40,90,220,0.35)] transition-transform duration-150 ease-out hover:scale-[1.03]"
        >
          <Image
            src={"/assets/images/workspaces/workspace-button-ai-help.png"}
            alt="Trợ lý AI"
            width={160}
            height={60}
            priority
            className="object-contain "
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        open={open}
        side="top"
        align="end"
        sideOffset={12}
        className="z-30 flex h-[520px] w-96 flex-col overflow-hidden rounded-[13px] border border-border bg-surface shadow-dropdown"
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles size={15} strokeWidth={1.9} className="text-knowledge" />
            <span className="text-[14px] font-semibold text-ink">
              Trợ lý AI
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="cursor-pointer rounded-[9px] p-1 text-ink-faint transition-colors duration-150 ease-out hover:bg-surface-muted hover:text-ink"
          >
            <X size={14} strokeWidth={1.9} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Sparkles
                size={22}
                strokeWidth={1.5}
                className="text-ink-faint"
              />
              <p className="text-xs text-ink-faint">
                Hỏi mình về nội dung trong workspace này
              </p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-[11px] px-3 py-2 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-active-bg text-ink"
                      : "bg-surface-muted text-ink"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {pending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-[11px] bg-surface-muted px-3 py-2">
                <Spinner size={13} />
              </div>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-end gap-2 border-t border-border p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={pending}
            placeholder="Nhập câu hỏi..."
            rows={1}
            className="max-h-24 min-h-9 flex-1 resize-none rounded-[11px] border border-border bg-surface px-3 py-2 text-[13px] text-ink outline-none placeholder:text-ink-faint focus:border-border-strong disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={pending || !input.trim()}
            className="h-9 shrink-0 cursor-pointer rounded-[11px] bg-knowledge px-3 text-[13px] font-medium text-white transition-opacity duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50"
          >
            Gửi
          </button>
        </div>
      </PopoverContent>
    </PopoverRoot>
  );
}
