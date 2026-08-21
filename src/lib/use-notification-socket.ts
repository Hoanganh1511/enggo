"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getSocketTokenAction } from "@/actions/notifications/get-socket-token";
import type { ApiNotification } from "./api/types";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_CAREER_TREE_API_URL ?? "http://localhost:3001";

// Ket noi WebSocket toi NotificationGateway (backend) de nhan thong bao
// real-time thay vi doi nguoi dung tu mo lai dropdown/reload trang. `auth`
// la 1 CALLBACK (khong phai gia tri tinh) - Socket.IO tu goi lai no o MOI lan
// (re)connect, nen luon ky token MOI (het han 60s, xem sign-internal-token.ts)
// thay vi giu 1 token cu co the da het han luc mang chap chon roi reconnect.
export function useNotificationSocket(
  enabled: boolean,
  onNewNotification: (n: ApiNotification) => void,
) {
  // Giu callback moi nhat qua ref thay vi dua vao mang dependency cua effect
  // ben duoi - tranh disconnect/reconnect lai socket moi khi component cha
  // re-render (vd onNewNotification duoc tao lai inline moi lan render). Gan
  // gia tri trong 1 effect KHONG deps (chay sau MOI render) thay vi truc tiep
  // trong than ham - mutate ref luc render bi React coi la khong an toan.
  const callbackRef = useRef(onNewNotification);
  useEffect(() => {
    callbackRef.current = onNewNotification;
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

    socket.on("notification:new", (n: ApiNotification) => {
      callbackRef.current(n);
    });

    return () => {
      socket.disconnect();
    };
  }, [enabled]);
}
