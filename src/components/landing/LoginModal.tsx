"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import LoginCard from "./LoginCard";

type LoginModalProps = {
  triggerLabel: string;
  triggerClassName: string;
};

const LoginModal = ({ triggerLabel, triggerClassName }: LoginModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={triggerClassName}>
          {triggerLabel}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-8 shadow-panel focus:outline-none">
          <Dialog.Title className="sr-only">Đăng nhập</Dialog.Title>
          <LoginCard />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LoginModal;
