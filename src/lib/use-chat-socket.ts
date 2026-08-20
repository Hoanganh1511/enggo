"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getSocketTokenAction } from "@/actions/notifications/get-socket-token";
import type { ApiChatMessage } from "./api/types";

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
) {
  const callbackRef = useRef(onMessage);
  useEffect(() => {
    callbackRef.current = onMessage;
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

    return () => {
      socket.disconnect();
    };
  }, [enabled]);
}
