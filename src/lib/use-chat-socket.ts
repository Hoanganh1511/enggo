"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getSocketTokenAction } from "@/actions/notifications/get-socket-token";
import type { ApiChatMessage, ApiPoll, ApiPresenceUpdate } from "./api/types";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_CAREER_TREE_API_URL ?? "http://localhost:3001";

// Ket noi WebSocket RIENG cho trang /messages (chi song trong luc trang nay
// dang mount, khac useNotificationSocket dung xuyen suot app o top-header-bar.tsx)
// - lang nghe "chat:message" tren CUNG 1 gateway backend (NotificationGateway,
// xem comment trong ChatModule/ChatService o backend), chi khac ten event.
// Chap nhan 2 ket noi WS song song (1 cho badge thong bao, 1 cho chat) de don
// gian - khong dang gop chung cho pham vi MVP.
export function useChatSocket(
  enabled: boolean,
  onMessage: (m: ApiChatMessage) => void,
  // Tuy chon - chi MessagesShell.tsx can (cap nhat so vote poll real-time tu
  // phia con lai), TopHeaderBar.tsx chi dung onMessage nen khong truyen.
  onPollUpdate?: (p: ApiPoll) => void,
  // Tuy chon - badge online/offline tren header hoi thoai (xem MessagesShell.tsx).
  onPresenceUpdate?: (p: ApiPresenceUpdate) => void,
) {
  const callbackRef = useRef(onMessage);
  useEffect(() => {
    callbackRef.current = onMessage;
  });
  const pollCallbackRef = useRef(onPollUpdate);
  useEffect(() => {
    pollCallbackRef.current = onPollUpdate;
  });
  const presenceCallbackRef = useRef(onPresenceUpdate);
  useEffect(() => {
    presenceCallbackRef.current = onPresenceUpdate;
  });

  useEffect(() => {
    if (!enabled) return;

    const socket: Socket = io(SOCKET_URL, {
      auth: (cb) => {
        getSocketTokenAction()
          .then((token) => cb({ token }))
          .catch(() => cb({}));
      },
    });

    socket.on("chat:message", (m: ApiChatMessage) => {
      callbackRef.current(m);
    });
    socket.on("chat:poll-update", (p: ApiPoll) => {
      pollCallbackRef.current?.(p);
    });
    socket.on("presence:update", (p: ApiPresenceUpdate) => {
      presenceCallbackRef.current?.(p);
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled]);
}
