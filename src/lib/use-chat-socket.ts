"use client";

import { useCallback, useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getSocketTokenAction } from "@/actions/notifications/get-socket-token";
import type {
  ApiChatMessage,
  ApiPoll,
  ApiPresenceUpdate,
  ApiReactionUpdate,
  ApiReadEvent,
  ApiTypingEvent,
} from "./api/types";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_CAREER_TREE_API_URL ?? "http://localhost:3001";

type ChatSocketHandlers = {
  // Tuy chon - chi MessagesShell.tsx can (cap nhat so vote poll real-time tu
  // phia con lai), TopHeaderBar.tsx chi dung onMessage nen khong truyen.
  onPollUpdate?: (p: ApiPoll) => void;
  // Tuy chon - badge online/offline tren header hoi thoai (xem MessagesShell.tsx).
  onPresenceUpdate?: (p: ApiPresenceUpdate) => void;
  // Tuy chon - "... dang nhap" (xem MessagesShell.tsx).
  onTyping?: (p: ApiTypingEvent) => void;
  // Tuy chon - "Da xem" (xem MessagesShell.tsx).
  onRead?: (p: ApiReadEvent) => void;
  // Tuy chon - tin nhan bi thu hoi (Message.isRecalled) cap nhat real-time.
  onMessageUpdated?: (m: ApiChatMessage) => void;
  // Tuy chon - reaction tren 1 tin nhan thay doi real-time.
  onReactionUpdate?: (p: ApiReactionUpdate) => void;
};

// Ket noi WebSocket RIENG cho trang /messages (chi song trong luc trang nay
// dang mount, khac useNotificationSocket dung xuyen suot app o top-header-bar.tsx)
// - lang nghe "chat:message" tren CUNG 1 gateway backend (NotificationGateway,
// xem comment trong ChatModule/ChatService o backend), chi khac ten event.
// Chap nhan 2 ket noi WS song song (1 cho badge thong bao, 1 cho chat) de don
// gian - khong dang gop chung cho pham vi MVP.
export function useChatSocket(
  enabled: boolean,
  onMessage: (m: ApiChatMessage) => void,
  handlers?: ChatSocketHandlers,
) {
  const callbackRef = useRef(onMessage);
  useEffect(() => {
    callbackRef.current = onMessage;
  });
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const socket: Socket = io(SOCKET_URL, {
      auth: (cb) => {
        getSocketTokenAction()
          .then((token) => cb({ token }))
          .catch(() => cb({}));
      },
    });
    socketRef.current = socket;

    socket.on("chat:message", (m: ApiChatMessage) => {
      callbackRef.current(m);
    });
    socket.on("chat:poll-update", (p: ApiPoll) => {
      handlersRef.current?.onPollUpdate?.(p);
    });
    socket.on("presence:update", (p: ApiPresenceUpdate) => {
      handlersRef.current?.onPresenceUpdate?.(p);
    });
    socket.on("chat:typing", (p: ApiTypingEvent) => {
      handlersRef.current?.onTyping?.(p);
    });
    socket.on("chat:read", (p: ApiReadEvent) => {
      handlersRef.current?.onRead?.(p);
    });
    socket.on("chat:message-updated", (m: ApiChatMessage) => {
      handlersRef.current?.onMessageUpdated?.(m);
    });
    socket.on("chat:reaction-update", (p: ApiReactionUpdate) => {
      handlersRef.current?.onReactionUpdate?.(p);
    });

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [enabled]);

  // Bao cho nguoi con lai trong hoi thoai biet minh dang go - xem
  // MessagesShell.tsx (throttle o phia goi, khong emit moi keystroke).
  const emitTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit("chat:typing", { conversationId });
  }, []);

  return { emitTyping };
}
