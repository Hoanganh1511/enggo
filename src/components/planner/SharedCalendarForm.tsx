"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FormInput,
  FieldLabel,
  ToggleSwitch,
  InlineSelect,
  DeleteConfirmPopover,
  isValidEmail,
  randomId,
} from "./macos-form-controls";
import {
  PERMISSION_OPTIONS,
  SHARE_COLOR_PRESETS,
  type SharedCalendar,
  type Participant,
  type Permission,
  type ShareType,
} from "./calendar-types";

// [2026-10-08] SharedCalendarForm - "Code component SharedCalendarForm
// (modal) theo macOS Calendar sharing style". DOC LAP voi model PlannerItem
// (xem comment dau calendar-types.ts), tai dung CHUNG primitive voi
// EventForm/ReminderForm (macos-form-controls.tsx).
//
// [2026-10-08] Gioi han CO Y THUC, flag ro:
// - Component KHONG nhan thong tin profile (ten/email) cua currentUser qua
//   props (chi co `currentUserId`, 1 ID string tho) - khi TAO MOI (chua co
//   `calendar`), hang Owner hien nhan "You" thay vi ten/email that, vi
//   khong co du lieu nao khac de hien. Noi goi thuc te NEN truyen them ten/
//   email that qua 1 props rieng neu can hien chinh xac hon - ngoai pham vi
//   SharedCalendarFormProps nguoi dung dua (chi co `currentUserId`).
// - "Public Calendar" toggle: sinh publicUrl MOCK (dua tren id) khi chua co
//   san - component KHONG tu goi API nao de tao link that.
// - "gửi invitation" khi them participant: goi callback `onInviteParticipant`
//   (them vao NGOAI interface block nguoi dung dua, vi Behaviors section doi
//   hoi ro: "Khi thêm participant: gửi invitation (callback)" - interface
//   block chinh chi liet ke onSubmit/onCancel/onDelete, co the la thieu sot
//   trong spec; them 1 prop optional la lua chon an toan nhat de khop CA 2
//   phan, khong pha vo phan nao).

function randomPublicUrl(id: string): string {
  return `https://caldav.icloud.com/published/2/${id}`;
}

function initialsFor(p: Participant): string {
  const src = p.name?.trim() || p.email;
  return src.slice(0, 1).toUpperCase();
}

const STATUS_STYLE: Record<Participant["status"], { label: string; color: string; bg: string }> = {
  accepted: { label: "Accepted", color: "var(--mset-success)", bg: "rgba(52,199,89,.12)" },
  pending: { label: "Pending", color: "var(--mset-warning)", bg: "rgba(255,159,10,.12)" },
  declined: { label: "Declined", color: "var(--mset-danger)", bg: "rgba(255,59,48,.12)" },
};

function ParticipantRow({
  participant,
  isOwnerViewing,
  container,
  onChangePermission,
  onRemove,
}: {
  participant: Participant;
  isOwnerViewing: boolean;
  container?: HTMLElement | null;
  onChangePermission: (p: Permission) => void;
  onRemove: () => void;
}) {
  const statusCfg = STATUS_STYLE[participant.status];
  return (
    <div className="flex items-center gap-2.5 rounded-[9px] border border-[color:var(--planner-border-soft)] px-2.5 py-2">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
        style={{ background: "var(--mset-text-tertiary)" }}
        aria-hidden="true"
      >
        {initialsFor(participant)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[color:var(--planner-text-primary)]">
          {participant.name || participant.email}
        </p>
        {participant.name && (
          <p className="truncate text-[11px] text-[color:var(--planner-text-muted)]">{participant.email}</p>
        )}
      </div>
      {participant.isOwner ? (
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
          style={{ color: "var(--planner-primary)", background: "var(--planner-primary-soft)" }}
        >
          Owner
        </span>
      ) : (
        <>
          <div className="w-32 shrink-0">
            <InlineSelect<Permission>
              value={participant.permission}
              options={PERMISSION_OPTIONS}
              onChange={onChangePermission}
              container={container}
            />
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
            style={{ color: statusCfg.color, background: statusCfg.bg }}
          >
            {statusCfg.label}
          </span>
          {/* "Nut X để xoá (chỉ owner mới xoá được)" - spec. */}
          {isOwnerViewing && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${participant.name || participant.email}`}
              className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-[color:var(--planner-text-muted)] hover:bg-[var(--planner-surface-soft)] hover:text-[color:var(--mset-danger)]"
            >
              <X size={13} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function SharedCalendarForm({
  calendar,
  currentUserId,
  onSubmit,
  onCancel,
  onDelete,
  onInviteParticipant,
}: {
  calendar?: SharedCalendar;
  currentUserId: string;
  onSubmit: (cal: SharedCalendar) => void;
  onCancel: () => void;
  onDelete?: () => void;
  // Xem comment dau file - khong co trong interface block goc, them vi
  // Behaviors section yeu cau ro "gửi invitation (callback)".
  onInviteParticipant?: (email: string) => void;
}) {
  const isEdit = !!calendar;

  const [shareType, setShareType] = useState<ShareType>(calendar?.shareType ?? "calendar");
  const [name, setName] = useState(calendar?.name ?? "");
  const [color, setColor] = useState(calendar?.color ?? SHARE_COLOR_PRESETS[0].hex);
  const [customColorOpen, setCustomColorOpen] = useState(
    !!calendar?.color && !SHARE_COLOR_PRESETS.some((p) => p.hex.toLowerCase() === calendar.color.toLowerCase()),
  );

  const [participants, setParticipants] = useState<Participant[]>(
    calendar?.participants ?? [
      {
        id: randomId(),
        userId: currentUserId,
        // Xem comment dau file - khong co profile that de dien, dung "You"
        // lam placeholder hien thi (xem initialsFor/ten hien trong JSX).
        email: "you",
        name: "You",
        isOwner: true,
        permission: "view_edit",
        status: "accepted",
      },
    ],
  );
  const [inviteInput, setInviteInput] = useState("");
  const [inviteError, setInviteError] = useState(false);

  const [isPublic, setIsPublic] = useState(calendar?.isPublic ?? false);
  const [publicUrl] = useState(calendar?.publicUrl ?? randomPublicUrl(calendar?.id ?? randomId()));
  const [copied, setCopied] = useState(false);

  const [notifyOnChanges, setNotifyOnChanges] = useState(calendar?.notifyOnChanges ?? true);

  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

  // [2026-10-08] "Chỉ owner mới thay đổi permission, xoá participant, toggle
  // public. Participant (không phải owner) chỉ thấy được settings, không
  // sửa" - spec Behaviors. Owner xac dinh qua participant co isOwner=true
  // VA userId khop currentUserId (hoac dang TAO MOI - luc do luon la owner).
  const isOwnerViewing =
    !isEdit || participants.some((p) => p.isOwner && p.userId === currentUserId);

  const nameValid = name.trim().length > 0;
  const canSubmit = nameValid;

  function addParticipant() {
    const raw = inviteInput.trim();
    if (!raw) return;
    if (!isValidEmail(raw)) {
      setInviteError(true);
      return;
    }
    if (participants.some((p) => p.email.toLowerCase() === raw.toLowerCase())) {
      setInviteError(true);
      return;
    }
    setParticipants((prev) => [
      ...prev,
      { id: randomId(), email: raw, isOwner: false, permission: "view_only", status: "pending" },
    ]);
    onInviteParticipant?.(raw);
    setInviteInput("");
    setInviteError(false);
  }
  function changePermission(id: string, permission: Permission) {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, permission } : p)));
  }
  function removeParticipant(id: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  function copyPublicUrl() {
    navigator.clipboard?.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      id: calendar?.id ?? randomId(),
      shareType,
      name: name.trim(),
      color,
      participants,
      isPublic,
      publicUrl: isPublic ? publicUrl : undefined,
      notifyOnChanges,
    });
  }

  return (
    <Dialog.Root open onOpenChange={(next) => !next && onCancel()}>
      <AnimatePresence>
        <Dialog.Portal forceMount>
          <Dialog.Overlay asChild forceMount>
            <motion.div
              className="fixed inset-0 z-50"
              style={{ backgroundColor: "rgba(0,0,0,.18)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            />
          </Dialog.Overlay>
          <Dialog.Content
            ref={setContentEl}
            asChild
            forceMount
            onOpenAutoFocus={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
          >
            <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 18 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex max-h-[min(760px,85vh)] w-[min(600px,calc(100vw-48px))] flex-col overflow-hidden"
                style={{
                  background: "rgba(255,255,255,.96)",
                  border: "1px solid rgba(255,255,255,.8)",
                  borderRadius: 18,
                  boxShadow: "0 32px 80px rgba(0,0,0,.14), 0 8px 24px rgba(0,0,0,.08)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  fontFamily: "var(--planner-font-family)",
                }}
              >
                <Dialog.Title asChild>
                  <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--mset-divider)] px-4 py-3">
                    <div className="flex items-center gap-1">
                      {isEdit && onDelete && isOwnerViewing && (
                        <DeleteConfirmPopover
                          label="Delete calendar"
                          confirmText="Delete this calendar?"
                          onConfirm={onDelete}
                        />
                      )}
                      <button
                        type="button"
                        onClick={onCancel}
                        className="cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[13px] font-medium text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
                      >
                        Cancel
                      </button>
                    </div>
                    <span className="truncate text-[14px] font-semibold text-[color:var(--planner-text-primary)]">
                      {isEdit ? "Calendar Settings" : "New Shared Calendar"}
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="cursor-pointer rounded-[8px] bg-[color:var(--planner-primary)] px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-[0_4px_10px_rgba(0,122,255,.22)] transition-colors duration-150 ease-out hover:bg-[#006fe6] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                    >
                      Save
                    </button>
                  </div>
                </Dialog.Title>

                <div className="mset-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
                  {!isOwnerViewing && (
                    <p
                      className="rounded-[8px] px-2.5 py-2 text-[12px] font-medium"
                      style={{ background: "rgba(255,159,10,.1)", color: "var(--mset-warning)" }}
                    >
                      You&apos;re viewing this calendar as a participant. Only the owner can change these
                      settings.
                    </p>
                  )}

                  {/* Share Type - chi khi create. */}
                  {!isEdit && (
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel>Share Type</FieldLabel>
                      <div
                        className="inline-flex w-fit"
                        style={{
                          padding: 2,
                          background: "var(--mset-surface-tertiary)",
                          border: "1px solid rgba(0,0,0,.06)",
                          borderRadius: 9,
                        }}
                      >
                        {(["calendar", "reminder_list"] as ShareType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setShareType(t)}
                            className="h-7 cursor-pointer rounded-[7px] border-0 px-3 text-xs font-medium whitespace-nowrap outline-none transition-[background-color,box-shadow] duration-150 ease-out"
                            style={{
                              background: shareType === t ? "#ffffff" : "transparent",
                              color: shareType === t ? "var(--mset-text-primary)" : "var(--mset-text-secondary)",
                              boxShadow:
                                shareType === t
                                  ? "0 1px 3px rgba(0,0,0,.10), 0 0 0 0.5px rgba(0,0,0,.04)"
                                  : "none",
                            }}
                          >
                            {t === "calendar" ? "Calendar" : "Reminder List"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Name & Color. */}
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Name</FieldLabel>
                    <FormInput
                      autoFocus
                      disabled={!isOwnerViewing}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={shareType === "calendar" ? "Calendar name" : "Reminder list name"}
                      className="disabled:opacity-50"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Color</FieldLabel>
                    <div className="grid grid-cols-6 gap-1.5">
                      {SHARE_COLOR_PRESETS.map((p) => (
                        <button
                          key={p.hex}
                          type="button"
                          title={p.name}
                          disabled={!isOwnerViewing}
                          onClick={() => {
                            setColor(p.hex);
                            setCustomColorOpen(false);
                          }}
                          style={{
                            backgroundColor: p.hex,
                            boxShadow:
                              color.toLowerCase() === p.hex.toLowerCase() && !customColorOpen
                                ? "0 0 0 2px #fff, 0 0 0 4px var(--mset-text-primary)"
                                : "0 0 0 1px rgba(0,0,0,.10)",
                          }}
                          className="flex size-7 cursor-pointer items-center justify-center rounded-full transition-transform duration-150 ease-out hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {color.toLowerCase() === p.hex.toLowerCase() && !customColorOpen && (
                            <Check size={12} strokeWidth={3} className="text-white drop-shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={!isOwnerViewing}
                        onClick={() => setCustomColorOpen((v) => !v)}
                        className="cursor-pointer text-[12px] font-medium text-[color:var(--planner-primary)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Custom color
                      </button>
                      {customColorOpen && (
                        <input
                          type="color"
                          value={color}
                          disabled={!isOwnerViewing}
                          onChange={(e) => setColor(e.target.value)}
                          className="h-7 w-12 cursor-pointer rounded-[6px] border border-[color:var(--planner-border-soft)] disabled:cursor-not-allowed"
                        />
                      )}
                    </div>
                  </div>

                  {/* Participants. */}
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel>Participants</FieldLabel>
                    {isOwnerViewing && (
                      <div className="flex items-center gap-1.5">
                        <UserPlus size={14} className="shrink-0 text-[color:var(--planner-text-muted)]" />
                        <FormInput
                          value={inviteInput}
                          onChange={(e) => {
                            setInviteInput(e.target.value);
                            setInviteError(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addParticipant();
                            }
                          }}
                          placeholder="Add participant by email, press Enter"
                          className={cn(inviteError && "border-[color:var(--mset-danger)]")}
                        />
                      </div>
                    )}
                    {inviteError && (
                      <p className="pl-5 text-[11px]" style={{ color: "var(--mset-danger)" }}>
                        Enter a valid, not-yet-added email address.
                      </p>
                    )}
                    <div className="flex flex-col gap-1.5">
                      {/* Owner luon hien TREN CUNG - spec: "Owner hiện ở
                          trên cùng với badge 'Owner'". */}
                      {[...participants]
                        .sort((a, b) => Number(b.isOwner) - Number(a.isOwner))
                        .map((p) => (
                          <ParticipantRow
                            key={p.id}
                            participant={p}
                            isOwnerViewing={isOwnerViewing}
                            container={contentEl}
                            onChangePermission={(perm) => changePermission(p.id, perm)}
                            onRemove={() => removeParticipant(p.id)}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Public Calendar. */}
                  <div className="flex flex-col gap-3 rounded-[10px] border border-[color:var(--planner-border-soft)] p-3.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Public Calendar</FieldLabel>
                      <ToggleSwitch
                        checked={isPublic}
                        onChange={isOwnerViewing ? setIsPublic : () => {}}
                      />
                    </div>
                    {isPublic && (
                      <>
                        <div className="flex items-center gap-1.5">
                          <FormInput readOnly value={publicUrl} className="bg-[var(--mset-surface-secondary)]" />
                          <button
                            type="button"
                            onClick={copyPublicUrl}
                            className="flex h-9 shrink-0 cursor-pointer items-center gap-1 rounded-[8px] border border-[color:var(--planner-border-soft)] px-2.5 text-[12px] font-medium text-[color:var(--planner-text-secondary)] hover:bg-[var(--planner-surface-soft)]"
                          >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            {copied ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <p className="text-[11px] text-[color:var(--planner-text-muted)]">
                          Anyone with this link can subscribe (read-only).
                        </p>
                      </>
                    )}
                  </div>

                  {/* Notifications - mo tat ca nguoi dung (ca participant,
                      khong chi owner) vi day la 1 TUY CHON CA NHAN, khong
                      phai cau hinh calendar chung - xem comment Behaviors o
                      dau file (spec CHI gioi han owner-only cho 3 hanh dong
                      khac). */}
                  <div className="flex items-center justify-between">
                    <FieldLabel>Notify me about changes</FieldLabel>
                    <ToggleSwitch checked={notifyOnChanges} onChange={setNotifyOnChanges} />
                  </div>
                </div>
              </motion.div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </AnimatePresence>
    </Dialog.Root>
  );
}
