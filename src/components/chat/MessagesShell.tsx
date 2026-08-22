"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { ConversationAvatar } from "./ConversationAvatar";
import { GroupAvatar } from "./GroupAvatar";
import {
  ArrowLeft,
  BarChart3,
  BellOff,
  Check,
  CheckCheck,
  File as FileIcon,
  FunnelIcon,
  UserRoundPlus,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  Mic,
  MoreHorizontal,
  MoreVertical,
  Paperclip,
  Plus,
  Reply as ReplyIcon,
  Search,
  Send,
  ShieldAlert,
  Smile,
  SquarePenIcon,
  Star,
  X,
  BubblesIcon,
} from "lucide-react";
import type {
  ApiChatMessage,
  ApiConversationSummary,
  ApiMemberLeftEvent,
  ApiMessageType,
  ApiPoll,
  ApiPresenceUpdate,
  ApiReactionUpdate,
  ApiReadEvent,
  ApiTypingEvent,
} from "@/lib/api/types";
import type { ApiGif } from "@/lib/api/gif";
import type { ApiUploadResult } from "@/lib/api/upload";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast/toast-store";
import {
  setUnreadChatTotal,
  clearUnreadChatTotal,
} from "@/lib/chat-unread-store";
import { listConversationsAction } from "@/actions/chat/list-conversations";
import { listMessagesAction } from "@/actions/chat/list-messages";
import { sendMessageAction } from "@/actions/chat/send-message";
import { markConversationReadAction } from "@/actions/chat/mark-conversation-read";
import { listReadReceiptsAction } from "@/actions/chat/list-read-receipts";
import { uploadChatAttachmentAction } from "@/actions/chat/upload-attachment";
import { votePollAction } from "@/actions/chat/vote-poll";
import { recallMessageAction } from "@/actions/chat/recall-message";
import {
  pinMessageAction,
  unpinMessageAction,
  listPinnedMessagesAction,
} from "@/actions/chat/group-info";
import {
  reactToMessageAction,
  removeReactionAction,
} from "@/actions/chat/react-message";
import {
  markConversationUnreadAction,
  updateConversationSettingsAction,
} from "@/actions/chat/conversation-settings";
import { useChatSocket } from "@/lib/use-chat-socket";
import { formatRelativeTime } from "@/lib/format-time";
import { formatMessagePreview } from "@/lib/chat-message-preview";
import { MessageInfoPanel } from "./MessageInfoPanel";
import { GroupInfoPanel } from "./GroupInfoPanel";
import { MessageBubble } from "./MessageBubble";
import { EmojiPickerPopover } from "./EmojiPickerPopover";
import { GifPickerPopover } from "./GifPickerPopover";
import { PollComposerModal } from "./PollComposerModal";
import { CreateGroupModal } from "./CreateGroupModal";
import { MessageSearchPopover } from "./MessageSearchPopover";
import { MessageSearchDrawer } from "./MessageSearchDrawer";
import { getChatBackground } from "./chat-backgrounds";
import { ImmersiveThemeModal } from "./ImmersiveThemeModal";
import {
  getImmersiveTheme,
  type ImmersiveThemeId,
} from "./chat-immersive-themes";
import { ImmersiveChatScene } from "./ImmersiveChatScene";
import { PinnedMessagesBar } from "./PinnedMessagesBar";
import {
  ChatWindowSkeleton,
  ConversationRowSkeleton,
  InfoPanelSkeleton,
} from "./ChatSkeletons";
import {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

type ChatTab = "all" | "favorites" | "groups" | "unread";
type AttachmentKind = "image" | "file" | "voice";
type PendingAttachment = {
  kind: AttachmentKind;
  file: File;
  previewUrl: string;
  uploading: boolean;
  uploaded: ApiUploadResult | null;
  durationSeconds?: number;
};

// "Nhóm" CHUA CO du lieu that dang sau (Conversation hien chi ho tro 1-1,
// khong co khai niem nhom - xem model Conversation o backend) - disable tab
// do (nhan "Sắp có") thay vi loc ra 1 danh sach rong gia vo la du lieu that.
// "Yêu thích" da co that (ConversationParticipant.isFavorite, dat qua menu
// 3 cham tren tung dong - xem ConversationRowMenu).
const CHAT_TABS: { key: ChatTab; label: string; disabled?: boolean }[] = [
  { key: "all", label: "Tất cả" },
  { key: "favorites", label: "Yêu thích" },
  { key: "groups", label: "Nhóm", disabled: true },
  { key: "unread", label: "Chưa đọc" },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// 2 tin nhan cung nhom (khong lap avatar, khoang cach nho hon) khi CUNG
// nguoi gui va cach nhau duoi 5 phut - nguong pho bien cua cac chat app.
const GROUP_GAP_MS = 5 * 60 * 1000;
function sameGroup(a: ApiChatMessage, b: ApiChatMessage): boolean {
  // Tin he thong (SYSTEM) khong bao gio "noi" nhom voi bubble that ke ben -
  // no khong co avatar/bo goc rieng (xem MessageBubble.tsx), du senderId
  // trung actor cua 1 tin nhan gan do.
  if (a.type === "SYSTEM" || b.type === "SYSTEM") return false;
  return (
    a.senderId === b.senderId &&
    Math.abs(
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ) < GROUP_GAP_MS
  );
}

// Cap nhat danh sach pinnedMessages (PinnedMessagesBar.tsx) tu 1 tin nhan vua
// doi (ghim/bo ghim CHINH minh hoac nguoi khac qua "chat:message-updated") -
// bo neu het ghim, them/cap nhat + sap lai theo pinnedAt moi nhat truoc neu
// con ghim. Goi cho MOI message-updated (ke ca recall) - vo hai, tin khong
// dinh gi den isPinned thi chi ghi de dung phan tu do (thuong khong doi gi).
function syncPinnedMessages(
  prev: ApiChatMessage[] | null,
  updated: ApiChatMessage,
): ApiChatMessage[] | null {
  if (!prev) return prev;
  const rest = prev.filter((m) => m.id !== updated.id);
  if (!updated.isPinned) return rest;
  return [updated, ...rest].sort((a, b) => {
    const at = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
    const bt = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;
    return bt - at;
  });
}

// Tinh truoc tally poll SAU khi bam vote, hien NGAY (optimistic) truoc khi
// server phan hoi - khop dung logic single-choice o backend
// (ChatService.votePoll): bam lai DUNG option da chon -> bo vote (toggle
// off), bam option KHAC -> chuyen vote sang option do (tru option cu, cong
// option moi). Ket qua CHI la du doan hien thi tam - se bi ghi de boi tally
// THAT tu response/socket ngay sau do, hoac rollback ve `poll` goc neu
// request that bai (xem handleVote).
function buildOptimisticPollTally(poll: ApiPoll, optionId: string): ApiPoll {
  const previouslyVotedOptionId = poll.options.find((o) => o.votedByMe)?.id;
  const clickedSameOption = previouslyVotedOptionId === optionId;
  const options = poll.options.map((o) => {
    if (o.id === optionId) {
      return clickedSameOption
        ? { ...o, voteCount: Math.max(0, o.voteCount - 1), votedByMe: false }
        : { ...o, voteCount: o.voteCount + 1, votedByMe: true };
    }
    if (o.id === previouslyVotedOptionId) {
      return {
        ...o,
        voteCount: Math.max(0, o.voteCount - 1),
        votedByMe: false,
      };
    }
    return o;
  });
  return {
    ...poll,
    options,
    totalVotes: options.reduce((sum, o) => sum + o.voteCount, 0),
  };
}

// Khung chinh trang /messages (port tu source treecareer-profile-universe-v2,
// BO Spaces/InfoPanel theo pham vi MVP - xem page.tsx). 2 cot: danh sach hoi
// thoai (trai) + khung chat cua hoi thoai dang chon (phai). Real-time qua
// useChatSocket (event "chat:message" + "chat:poll-update"), khong polling.
export function MessagesShell() {
  const { data: session } = useSession();
  const myId = session?.userId as string | undefined;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [conversations, setConversations] = useState<
    ApiConversationSummary[] | null
  >(null);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiChatMessage[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadOlderError, setLoadOlderError] = useState(false);
  // Hien khi co tin nhan realtime moi toi trong luc nguoi dung dang cuon len
  // xem lich su cu (khong o gan day) - xem handleIncoming/isNearBottom.
  const [showNewMessagesBanner, setShowNewMessagesBanner] = useState(false);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<ChatTab>("all");
  // Mac dinh DONG - chi bat khi bam nut 3 cham (xem className md:hidden/
  // fixed cua panel o duoi). Truoc day mac dinh true khien panel tu mo
  // NGAY luc vao 1 hoi thoai; tren desktop thi vo hai (1 cot tinh, khong
  // choan gi), nhung tren mobile panel gio la drawer PHU KIN CA MAN HINH
  // nen mac dinh true = vua mo hoi thoai la bi che het, phai bam 3 cham
  // moi thay lai duoc noi dung chat.
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // "Xem tất cả kết quả" tu MessageSearchPopover.tsx mo drawer nay - dong
  // popover + luu lai tu khoa dang tim de seed vao drawer (xem
  // MessageSearchDrawer.tsx, dung key={searchDrawerQuery} de tu reset state
  // rieng cua drawer moi lan mo 1 tim kiem MOI, khong can effect dong bo).
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [searchDrawerQuery, setSearchDrawerQuery] = useState("");
  // Nen vung tin nhan - 1 lua chon CHUNG cho ca app (khong rieng tung hoi
  // thoai), luu localStorage nen chi tren THIET BI nay (khong dong bo qua
  // API - xem chat-backgrounds.tsx). "none" (mac dinh, nen trang hien tai)
  // luc khoi tao de tranh lech giao dien server/client render lan dau (SSR
  // khong co localStorage) - doc gia tri that trong effect [] o duoi.
  const [chatBgId, setChatBgId] = useState("none");
  useEffect(() => {
    // queueMicrotask: doc localStorage CHI co tren client (SSR khong co
    // window), nen phai doc SAU lan render dau (khong the dua vao useState
    // initializer - se lech hydration server/client). Nest trong microtask
    // (khong phai goi setState truc tiep o than effect) de trach ESLint
    // react-hooks/set-state-in-effect, cung tinh than cac effect fetch khac
    // trong file nay - va KHONG dung startTransition (uu tien thap co the
    // khien React bo qua cap nhat nay tren cac thiet bi cham).
    queueMicrotask(() => {
      const saved = window.localStorage.getItem("chat-background");
      if (saved) setChatBgId(saved);
    });
  }, []);
  // Khung canh + mau bubble - cung pattern voi chatBgId o tren (CHUNG ca app,
  // localStorage, chi tren thiet bi nay - xem chat-immersive-themes.ts).
  const [immersiveThemeId, setImmersiveThemeId] =
    useState<ImmersiveThemeId>("none");
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      const saved = window.localStorage.getItem("chat-immersive-theme");
      if (saved) setImmersiveThemeId(saved as ImmersiveThemeId);
    });
  }, []);
  function handleChangeImmersiveTheme(id: string) {
    setImmersiveThemeId(id as ImmersiveThemeId);
    window.localStorage.setItem("chat-immersive-theme", id);
  }

  // Sua bug rieng cua MOBILE SAFARI: focus vao textarea soan tin -> ban phim
  // mo -> Safari tu cuon trang de giu textarea hien tren ban phim -> bam
  // "OK"/an ban phim di, NHUNG scroll khong duoc tra ve dung vi tri, de lai
  // 1 khoang trong o duoi bang chieu cao ban phim vua dong (bug nay CHI xay
  // ra tren iOS Safari, khong co tren Android/desktop - lien quan cach iOS
  // xu ly resize layout viewport khi input focus/blur, KHONG lien quan
  // 100dvh o app/layout.tsx). Dung o CA 2 noi (xem handleTextareaBlur o duoi):
  // window.scrollTo thuong khong co tac dung vi <body> da overflow-hidden,
  // day chi la lop phong thu them - [data-scroll-root] (main-content-area.tsx)
  // moi la vung cuon THAT can reset.
  function resetScrollAfterKeyboardClose() {
    window.scrollTo(0, 0);
    document.querySelector<HTMLElement>("[data-scroll-root]")?.scrollTo(0, 0);
  }

  // Co che 1: window.visualViewport phan anh dung kich thuoc man hinh THAT
  // con lai sau ban phim (khac window.innerHeight/CSS dvh - 2 cai nay KHONG
  // cap nhat theo ban phim tren iOS) - theo doi su kien resize cua no, khi
  // chieu cao TRO VE gan bang layout viewport (ban phim dong that su) thi
  // chu dong reset scroll.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function handleViewportResize() {
      const keyboardLikelyClosed = window.innerHeight - vv!.height < 60;
      if (keyboardLikelyClosed) resetScrollAfterKeyboardClose();
    }

    vv.addEventListener("resize", handleViewportResize);
    return () => vv.removeEventListener("resize", handleViewportResize);
  }, []);

  // Co che 2 (fallback, xem onBlur cua textarea soan tin): phong truong hop
  // su kien "resize" cua visualViewport ban lo/den tre - goi lai cung ham
  // reset ngay khi textarea mat focus (delay ngan de doi animation dong ban
  // phim cua iOS chay xong truoc, goi qua som se bi ban phim "de" lai vi tri
  // cu ngay sau do).
  function handleTextareaBlur() {
    setTimeout(resetScrollAfterKeyboardClose, 100);
  }
  // "... dang nhap" theo tung conversationId (Set de ho tro nhieu hoi thoai
  // dang typing cung luc, du hiem) - tu het han sau 3s neu khong co event
  // "chat:typing" moi (khong co event "stop typing" rieng, don gian hoa).
  const [typingConversationIds, setTypingConversationIds] = useState<
    Set<string>
  >(new Set());
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  // "Da xem" (1-1) - chi giu event MOI NHAT (conversationId + readAt), so voi
  // tin nhan cuoi cung cua CHINH minh trong hoi thoai dang mo de quyet dinh hien.
  const [otherReadEvent, setOtherReadEvent] = useState<ApiReadEvent | null>(
    null,
  );
  // "Da xem" (NHOM) - moc doc CUA TUNG thanh vien (userId -> lastReadAt),
  // fetch luc mo 1 hoi thoai nhom (xem effect [activeId] o duoi) + cap nhat
  // real-time tung phan tu qua "chat:read" (khong fetch lai ca danh sach moi
  // lan co nguoi doc them - xem handleRead).
  const [groupReadReceipts, setGroupReadReceipts] = useState<
    Record<string, string | null>
  >({});
  // Danh sach tin da ghim cua hoi thoai dang mo (xem PinnedMessagesBar.tsx) -
  // fetch luc mo hoi thoai (effect [activeId] o duoi), cap nhat real-time qua
  // handleTogglePin (chinh minh ghim) va handleMessageUpdated (nguoi khac
  // ghim/bo ghim, phat qua socket "chat:message-updated" - xem
  // syncPinnedMessages). null = chua fetch xong.
  const [pinnedMessages, setPinnedMessages] = useState<ApiChatMessage[] | null>(
    null,
  );
  const [replyTarget, setReplyTarget] = useState<ApiChatMessage | null>(null);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  // Bam vao 1 reply preview trong bubble -> cuon toi + vien sang tin nhan
  // goc trong giay lat (chi hoat dong neu tin do CON trong `messages` da tai,
  // xem MessageReplyPreview.tsx/handleJumpToMessage ben duoi).
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const lastTypingEmitRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Gan trong effect KHONG deps (chay sau MOI render) thay vi truc tiep trong
  // than ham - mutate ref luc render bi React coi la khong an toan (cung ly
  // do voi callbackRef trong use-notification-socket.ts).
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeIdRef.current = activeId;
  });
  // Cung ly do voi activeIdRef o tren - handleIncoming la useCallback deps
  // rong nen closure cua no giu myId luc MOUNT (thuong la undefined, session
  // chua load xong); doc qua ref de luon lay gia tri moi nhat.
  const myIdRef = useRef<string | undefined>(myId);
  useEffect(() => {
    myIdRef.current = myId;
  });
  // Cursor pagination "load them tin cu" (scroll-up) - xem handleLoadOlder/
  // sentinel effect ben duoi. pendingScrollActionRef: "bottom" = cuon xuong
  // day sau khi messages doi (tai lan dau/tin moi khi dang o gan day cuoi),
  // "preserve" = giu nguyen vi tri nhin thay duoc sau khi noi THEM tin cu vao
  // DAU danh sach (bu chieu cao them vao, xem layout effect [messages]).
  const pendingScrollActionRef = useRef<"bottom" | "preserve" | null>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const loadOlderSentinelRef = useRef<HTMLDivElement>(null);
  // "Dinh day" - khi true, MOI lan noi dung ben trong scrollRef doi chieu cao
  // (anh/GIF/avatar tai xong, load nhanh hay cham deu duoc) se tu dong keo
  // lai xuong day THAT SU, khong chi 1 lan luc vua co messages moi (luc do
  // scrollHeight co the con thap hon that vi anh chua tai xong). Bat khi:
  // tai hoi thoai lan dau, tin/GIF/poll CUA CHINH MINH vua gui. Tat khi nguoi
  // dung tu cuon len (xem onScroll ben duoi) - khong ganh voi thao tac cua ho.
  const stickyBottomRef = useRef(false);
  // Bao boc TOAN BO noi dung cuon (sentinel + header dau hoi thoai + danh
  // sach tin nhan) - ResizeObserver gan vao day (khong phai scrollRef, vi
  // scrollRef co chieu cao CO DINH qua flex-1, chi noi dung BEN TRONG no moi
  // doi chieu cao khi anh/GIF tai xong).
  const scrollContentRef = useRef<HTMLDivElement>(null);

  const [, startFetchTransition] = useTransition();

  // Toolbar composer: dinh kem (anh/file/ghi am) - 1 attachment "cho" tai 1
  // thoi diem (upload NGAY luc chon, "cho" den khi bam Gui - dung yeu cau
  // "de o preview truoc"), popover Plus/emoji/gif, ghi am qua MediaRecorder.
  const [pendingAttachment, setPendingAttachment] =
    useState<PendingAttachment | null>(null);
  const [plusOpen, setPlusOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordStartRef = useRef(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const composerBusy = pendingAttachment !== null || recording;

  // Doi hoi thoai dang chon - RESET NGAY (dong bo, cung tick voi
  // setActiveIdState) toan bo state rieng cua hoi thoai cu (tin nhan/draft/
  // reply/dinh kem/ghi am), khong doi effect [activeId] ben duoi tu lam viec
  // do. Truoc day chi co setActiveIdState() o day, con setMessages(null) nam
  // trong effect [activeId], boc qua startFetchTransition - startTransition
  // coi day la cap nhat UU TIEN THAP nen React co the GIU NGUYEN messages cu
  // tren man cho toi khi fetch xong, trong khi activeConversation (ten nguoi
  // dung tren header) doi NGAY vi no khong qua transition - gay đúng trieu
  // chung nguoi dung phan anh: "đổi tên user trước, giữ nội dung chat cũ rồi
  // mới đổi". Guard id === activeId de tranh xoa oan draft dang go khi bam
  // lai DUNG hoi thoai dang mo.
  function setActiveId(id: string) {
    if (id === activeId) return;
    setActiveIdState(id);
    setMessages(null);
    setNextCursor(null);
    setLoadOlderError(false);
    setShowNewMessagesBanner(false);
    setDraft("");
    setReplyTarget(null);
    if (pendingAttachment) cancelPendingAttachment();
    if (recording) cancelRecording();
    router.replace(`/messages?c=${id}`, { scroll: false });
  }

  // Nut "<-" chi hien tren mobile (xem JSX header khung chat) - danh sach
  // hoi thoai va khung chat KHONG hien dong thoi tren man hep (xem className
  // 2 panel <section>/<main> o duoi), nen can 1 cach quay lai danh sach.
  // KHONG reset messages/draft/... nhu setActiveId() - chi "an" khung chat
  // di, giu nguyen state phong khi nguoi dung mo lai DUNG hoi thoai nay.
  function handleBackToList() {
    setActiveIdState(null);
    router.replace("/messages", { scroll: false });
  }

  // Tai danh sach hoi thoai 1 lan luc mount - neu URL co san ?c=<id> (dieu
  // huong tu nut "Nhắn tin" tren profile) thi chon luon hoi thoai do, khong
  // thi chon hoi thoai dau tien (moi nhat). Boc trong startFetchTransition
  // (cung 1 pattern voi NotificationsPanel.tsx) de setState dong bo (vd
  // setMessages(null) o effect duoi) khong bi ESLint react-hooks/set-state-in-effect
  // chan.
  useEffect(() => {
    let cancelled = false;
    startFetchTransition(async () => {
      const items = await listConversationsAction();
      if (cancelled) return;
      setConversations(items);
      const preselect = searchParams.get("c");
      if (preselect && items.some((c) => c.id === preselect)) {
        setActiveIdState(preselect);
      } else if (items.length > 0) {
        setActiveIdState(items[0].id);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tai tin nhan + danh dau da doc moi khi doi hoi thoai dang chon - reset
  // messages/nextCursor VE null da nam trong setActiveId() (dong bo, luc bam
  // chon hoi thoai), khong lam lai o day nua.
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    startFetchTransition(async () => {
      const page = await listMessagesAction(activeId);
      if (cancelled) return;
      pendingScrollActionRef.current = "bottom";
      stickyBottomRef.current = true;
      setMessages(page.items);
      setNextCursor(page.nextCursor);
    });
    markConversationReadAction(activeId).then(() => {
      if (cancelled) return;
      setConversations(
        (prev) =>
          prev?.map((c) =>
            c.id === activeId ? { ...c, unreadCount: 0 } : c,
          ) ?? prev,
      );
    });
    // Snapshot moc doc cua TUNG thanh vien (chi thuc su can cho nhom - xem
    // groupReadReceipts o tren) - fetch 1 lan luc mo, sau do chi cap nhat
    // real-time qua socket "chat:read" (handleRead), khong fetch lai.
    startFetchTransition(() => setGroupReadReceipts({}));
    if (conversations?.find((c) => c.id === activeId)?.isGroup) {
      listReadReceiptsAction(activeId).then((receipts) => {
        if (cancelled) return;
        const next: Record<string, string | null> = {};
        for (const r of receipts) next[r.userId] = r.lastReadAt;
        setGroupReadReceipts(next);
      });
    }
    startFetchTransition(() => setPinnedMessages(null));
    listPinnedMessagesAction(activeId).then((items) => {
      if (cancelled) return;
      setPinnedMessages(items);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // `messages` duoc ghi tu 3 nguon doc lap (REST gui tin, socket realtime,
  // fetch phan trang) co the trung id nhau (vd tin cua chinh minh vong ve
  // qua ca REST response lan mot nguon khac) - loai id trung truoc khi them
  // de tranh React canh bao "same key" / render sai.
  function appendUniqueMessage(
    prev: ApiChatMessage[],
    incoming: ApiChatMessage,
  ): ApiChatMessage[] {
    if (prev.some((m) => m.id === incoming.id)) return prev;
    return [...prev, incoming];
  }

  // Nguoi dung con "gan day cuoi" hay khong (nguong 150px) - quyet dinh co tu
  // dong cuon xuong khi co tin nhan moi/typing hay khong, thay vi luon nhay
  // xuong day bat ke dang doc lich su cu o dau (gay giat man khi dang cuon
  // len xem tin cu ma co tin moi toi).
  function isNearBottom(threshold = 150) {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }

  // Chay TRUOC khi trinh duyet ve lai man hinh (khong phai sau, tranh nhap
  // nhay 1 frame) de xu ly 2 truong hop: "bottom" (tai lan dau 1 hoi thoai/
  // gui-nhan tin moi luc dang o gan day cuoi) va "preserve" (vua noi THEM tin
  // cu vao DAU danh sach qua handleLoadOlder - bu dung phan chieu cao moi
  // them vao scrollTop de vi tri dang xem KHONG bi nhay, xem prevScrollHeightRef).
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const action = pendingScrollActionRef.current;
    pendingScrollActionRef.current = null;
    if (!el || !action) return;
    if (action === "bottom") {
      el.scrollTo({ top: el.scrollHeight });
    } else if (action === "preserve" && prevScrollHeightRef.current !== null) {
      el.scrollTop += el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = null;
    }
  }, [messages]);

  // "Dinh day" THAT SU qua moi lan reflow, khong chi 1 lan luc [messages]
  // doi: anh/GIF/avatar trong tin nhan tai xong SAU khi DOM da commit se lam
  // scrollHeight tang THEM (load nhanh hay cham deu vay), luc effect [messages]
  // o tren chay scrollHeight con thap hon that nen cuon "xong" ma van chua
  // toi day THAT (day chinh la trieu chung "load xong bi hut view len tren").
  // ResizeObserver bao dung MOI lan noi dung doi cao, tu keo lai xuong day
  // trong luc con dinh (stickyBottomRef) - deu se tu ngung khi noi dung het
  // doi (anh tai xong het) hoac nguoi dung tu cuon len (xem onScroll).
  useEffect(() => {
    const content = scrollContentRef.current;
    const el = scrollRef.current;
    if (!content || !el) return;
    const observer = new ResizeObserver(() => {
      if (stickyBottomRef.current) {
        el.scrollTo({ top: el.scrollHeight });
      }
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [activeId]);

  // Bao go chu/typing xuat hien o cuoi danh sach - CHI tu cuon toi neu nguoi
  // dung dang o gan day cuoi san, khong ep cuon khi ho dang doc lich su cu.
  useEffect(() => {
    if (isNearBottom()) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [typingConversationIds]);

  // Dong bo lai danh sach hoi thoai (thu tu/unreadCount/lastMessage/gio hien
  // thi) MOI LAN socket ket noi - bat ke lan dau hay reconnect sau mat mang
  // tam thoi (xem onResync trong use-chat-socket.ts), VA khi handleIncoming
  // ben duoi nhan 1 tin cho 1 conversationId CHUA co trong danh sach (hoi
  // thoai 1-1 MOI TINH, nguoi kia nhan lan dau - xem comment o handleIncoming).
  // Fetch lai TOAN BO thay vi vas-vas tung phan vi khong biet chinh xac da
  // mat nhung event nao/hoi thoai nao con thieu - fetch moi la cach chac
  // chan nhat de dam bao dung du lieu server.
  const handleResync = useCallback(() => {
    listConversationsAction().then((items) => {
      setConversations((prev) => {
        if (!prev) return items;
        // Giu nguyen thu tu neu khong doi gi (tranh nhay/giat danh sach khi
        // resync ma thuc ra khong co gi moi - vd lan connect dau tien, ngay
        // sau khi effect mount da fetch xong).
        const same =
          prev.length === items.length &&
          prev.every(
            (c, i) =>
              c.id === items[i]?.id && c.updatedAt === items[i]?.updatedAt,
          );
        return same ? prev : items;
      });
    });
  }, []);

  const handleIncoming = useCallback(
    (m: ApiChatMessage) => {
      let knownConversation = true;
      setConversations((prev) => {
        if (!prev) return prev;
        const idx = prev.findIndex((c) => c.id === m.conversationId);
        if (idx === -1) {
          knownConversation = false;
          return prev;
        }
        const isActive = activeIdRef.current === m.conversationId;
        const updated: ApiConversationSummary = {
          ...prev[idx],
          lastMessage: m,
          updatedAt: m.createdAt,
          unreadCount: isActive ? 0 : prev[idx].unreadCount + 1,
        };
        return [updated, ...prev.filter((c) => c.id !== m.conversationId)];
      });
      // Tin nhan dau tien cua 1 hoi thoai 1-1 MOI TINH (nguoi kia vua nhan
      // "Nhắn tin" tren profile minh lan dau) - conversationId nay CHUA tung
      // co trong danh sach cua minh, setConversations() o tren khong lam gi
      // ca (idx=-1). Resync toan bo de lay ve hoi thoai moi nay, thay vi de
      // nguoi dung phai F5 moi thay.
      if (!knownConversation) handleResync();

      if (m.conversationId === activeIdRef.current) {
        // Tin cua CHINH minh (vua gui, vong lai qua socket) hoac dang o gan
        // day cuoi san -> tu cuon xuong; nguoc lai (dang doc lich su cu, tin
        // tu nguoi kia toi) giu nguyen vi tri, chi hien banner "Có tin nhắn mới".
        const mine = m.senderId === myIdRef.current;
        const nearBottom = isNearBottom();
        if (mine || nearBottom) {
          pendingScrollActionRef.current = "bottom";
          stickyBottomRef.current = true;
        }
        if (!mine && !nearBottom) setShowNewMessagesBanner(true);
        setMessages((prev) => (prev ? appendUniqueMessage(prev, m) : prev));
        markConversationReadAction(m.conversationId).catch(() => {});
      }
    },
    [handleResync],
  );
  const handlePollUpdate = useCallback((p: ApiPoll) => {
    setMessages(
      (prev) =>
        prev?.map((m) => (m.poll?.id === p.id ? { ...m, poll: p } : m)) ?? prev,
    );
  }, []);
  const handlePresenceUpdate = useCallback((p: ApiPresenceUpdate) => {
    setConversations(
      (prev) =>
        prev?.map((c) =>
          c.otherUser?.id === p.userId
            ? { ...c, otherUser: { ...c.otherUser, online: p.online } }
            : c,
        ) ?? prev,
    );
  }, []);
  const handleTyping = useCallback((p: ApiTypingEvent) => {
    setTypingConversationIds((prev) => {
      if (prev.has(p.conversationId)) return prev;
      const next = new Set(prev);
      next.add(p.conversationId);
      return next;
    });
    const existing = typingTimeoutsRef.current.get(p.conversationId);
    if (existing) clearTimeout(existing);
    const timeout = setTimeout(() => {
      setTypingConversationIds((prev) => {
        if (!prev.has(p.conversationId)) return prev;
        const next = new Set(prev);
        next.delete(p.conversationId);
        return next;
      });
      typingTimeoutsRef.current.delete(p.conversationId);
    }, 3000);
    typingTimeoutsRef.current.set(p.conversationId, timeout);
  }, []);
  const handleRead = useCallback((p: ApiReadEvent) => {
    setOtherReadEvent(p);
    if (p.conversationId === activeIdRef.current) {
      setGroupReadReceipts((prev) => ({ ...prev, [p.userId]: p.readAt }));
    }
  }, []);
  // Tin nhan bi thu hoi - cap nhat lai dung message do trong danh sach (server
  // da xoa sach content/attachment, chi con isRecalled=true).
  const handleMessageUpdated = useCallback((updated: ApiChatMessage) => {
    setMessages(
      (prev) => prev?.map((m) => (m.id === updated.id ? updated : m)) ?? prev,
    );
    setPinnedMessages((prev) => syncPinnedMessages(prev, updated));
  }, []);
  const handleReactionUpdate = useCallback((p: ApiReactionUpdate) => {
    setMessages(
      (prev) =>
        prev?.map((m) =>
          m.id === p.messageId ? { ...m, reactions: p.reactions } : m,
        ) ?? prev,
    );
  }, []);
  // Ten/mo ta/mau nhom doi (nguoi khac sua) - cap nhat lai dung hoi thoai do
  // trong danh sach ben trai + header dang mo (ca 2 deu doc tu `conversations`).
  // Cung 1 event cho 3 truong hop: doi ten/mau/mo ta nhom, VA vua duoc them
  // vao 1 nhom (xem ChatService.addGroupMembers) - truong hop sau, hoi thoai
  // nay CHUA co trong danh sach cua nguoi nhan (ho moi vao lan dau), nen them
  // moi vao DAU danh sach thay vi chi map() cap nhat cho item da ton tai.
  const handleGroupUpdated = useCallback((c: ApiConversationSummary) => {
    setConversations((prev) => {
      if (!prev) return prev;
      const exists = prev.some((item) => item.id === c.id);
      if (exists) return prev.map((item) => (item.id === c.id ? c : item));
      return [c, ...prev];
    });
  }, []);
  // 1 thanh vien vua roi nhom - go khoi participants cua dung hoi thoai do
  // (khong hien "system message" - chua co ha tang tin nhan he thong).
  const handleMemberLeft = useCallback((p: ApiMemberLeftEvent) => {
    setConversations(
      (prev) =>
        prev?.map((c) =>
          c.id === p.conversationId
            ? {
                ...c,
                participants: c.participants.filter((m) => m.id !== p.userId),
              }
            : c,
        ) ?? prev,
    );
  }, []);
  // Chinh minh vua roi 1 nhom (GroupInfoPanel.tsx) - bo hoi thoai do khoi
  // danh sach, dong khung chat neu dang mo dung hoi thoai vua roi.
  function handleGroupLeft(conversationId: string) {
    setConversations(
      (prev) => prev?.filter((c) => c.id !== conversationId) ?? prev,
    );
    if (activeId === conversationId) {
      setActiveIdState(null);
      setMessages(null);
      router.replace("/messages", { scroll: false });
    }
  }
  // Dep tat ca timeout dang cho khi unmount - tranh setState sau khi component
  // da roi trang.
  useEffect(() => {
    const timeouts = typingTimeoutsRef.current;
    return () => {
      timeouts.forEach((t) => clearTimeout(t));
      timeouts.clear();
    };
  }, []);

  const { emitTyping } = useChatSocket(Boolean(myId), handleIncoming, {
    onPollUpdate: handlePollUpdate,
    onPresenceUpdate: handlePresenceUpdate,
    onTyping: handleTyping,
    onRead: handleRead,
    onMessageUpdated: handleMessageUpdated,
    onReactionUpdate: handleReactionUpdate,
    onGroupUpdated: handleGroupUpdated,
    onMemberLeft: handleMemberLeft,
    onResync: handleResync,
  });

  // Lop bao ve THEM - tab bi trinh duyet "dong bang" ngam (chuyen tab lau,
  // may ngu ngan) co the khien goi tin WebSocket bi rot ma Socket.io CHUA
  // kip nhan ra mat ket noi (chua fire "disconnect"/"connect" lai), nen
  // onResync o tren khong du. Dong bo THEM moi lan tab duoc focus/hien lai -
  // khong ton kem (chi 1 fetch nhe), dam bao danh sach hoi thoai luon dung
  // du lieu server ngay khi nguoi dung quay lai xem.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") handleResync();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", handleResync);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", handleResync);
    };
  }, [handleResync]);

  async function handleLoadOlder() {
    if (!activeId || !nextCursor || loadingOlder) return;
    setLoadingOlder(true);
    setLoadOlderError(false);
    try {
      const page = await listMessagesAction(activeId, nextCursor);
      // Do chieu cao TRUOC khi noi tin cu vao dau - layout effect [messages]
      // se bu lai scrollTop bang dung phan chenh lech sau khi DOM cap nhat,
      // giu nguyen vi tri dang xem (khong nhay man).
      prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? null;
      pendingScrollActionRef.current = "preserve";
      setMessages((prev) => {
        const base = prev ?? [];
        const existingIds = new Set(base.map((m) => m.id));
        return [...page.items.filter((m) => !existingIds.has(m.id)), ...base];
      });
      setNextCursor(page.nextCursor);
    } catch {
      setLoadOlderError(true);
    } finally {
      setLoadingOlder(false);
    }
  }
  // Sentinel (IntersectionObserver) o duoi luon giu 1 tham chieu MOI NHAT toi
  // ham nay - tranh dong bo lai observer moi lan nextCursor/loadingOlder doi
  // (se gay dong-huy quan sat lien tuc), dong thoi tranh goi phai ban CU voi
  // loadingOlder/nextCursor cu (co the goi fetch trung lap khi cuon nhanh).
  const handleLoadOlderRef = useRef(handleLoadOlder);
  useEffect(() => {
    handleLoadOlderRef.current = handleLoadOlder;
  });

  // Sentinel o dau danh sach tin nhan - vao vung nhin CUA scroll container
  // (root, khong phai viewport trang) thi tu goi tai tin cu, thay cho nut
  // "Xem tin nhắn cũ hơn" bam thu cong truoc day.
  useEffect(() => {
    const sentinel = loadOlderSentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadOlderRef.current();
      },
      { root, rootMargin: "200px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeId]);

  // Bam reply preview trong 1 bubble - chi hoat dong neu tin nhan goc CON
  // dang nam trong `messages` (chua bam "Xem tin nhắn cũ hơn" toi do thi
  // khong co DOM node de cuon toi, im lang bo qua thay vi fetch bu qua
  // trang cu - giu don gian, dung yeu cau "reply preview có thể click để
  // scroll tới message gốc" ma khong keo them logic fetch phuc tap).
  function handleJumpToMessage(id: string) {
    const el = document.getElementById(`msg-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedMessageId(id);
    setTimeout(() => {
      setHighlightedMessageId((cur) => (cur === id ? null : cur));
    }, 1400);
  }

  function bumpConversationSummary(msg: ApiChatMessage) {
    setConversations((prev) => {
      if (!prev) return prev;
      const idx = prev.findIndex((c) => c.id === activeId);
      if (idx === -1) return prev;
      const updated: ApiConversationSummary = {
        ...prev[idx],
        lastMessage: msg,
        updatedAt: msg.createdAt,
      };
      return [updated, ...prev.filter((c) => c.id !== activeId)];
    });
  }

  function appendSentMessage(msg: ApiChatMessage) {
    pendingScrollActionRef.current = "bottom";
    stickyBottomRef.current = true;
    setMessages((prev) => (prev ? appendUniqueMessage(prev, msg) : prev));
    bumpConversationSummary(msg);
  }

  // Gui tin (text/dinh kem/gif) hien NGAY 1 bubble "tam" (id "temp-...") vao
  // khung chat truoc khi cho server phan hoi, thay vi khoa ca khung nhap +
  // spinner toan cuc nhu truoc. Trang thai "đang gửi" duoc nhan biet qua
  // tien to id "temp-" (xem status duoi tin nhan cuoi cung cua minh trong
  // JSX) - het "đang gửi" ngay khi replaceOptimisticMessage() thay id that vao.
  function buildOptimisticMessage(fields: {
    type: ApiMessageType;
    content?: string | null;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    attachmentMimeType?: string | null;
    attachmentSize?: number | null;
    durationSeconds?: number | null;
  }): ApiChatMessage {
    return {
      id: `temp-${crypto.randomUUID()}`,
      conversationId: activeId ?? "",
      senderId: myId ?? "",
      type: fields.type,
      content: fields.content ?? null,
      attachmentUrl: fields.attachmentUrl ?? null,
      attachmentName: fields.attachmentName ?? null,
      attachmentMimeType: fields.attachmentMimeType ?? null,
      attachmentSize: fields.attachmentSize ?? null,
      durationSeconds: fields.durationSeconds ?? null,
      poll: null,
      isRecalled: false,
      isPinned: false,
      pinnedAt: null,
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            senderId: replyTarget.senderId,
            type: replyTarget.type,
            preview: formatMessagePreview(replyTarget),
          }
        : null,
      reactions: [],
      createdAt: new Date().toISOString(),
    };
  }

  // Thay bubble tam bang ban ghi THAT tu server sau khi gui thanh cong - giu
  // nguyen vi tri (map, khong append) de khong nhay/trung tin trong danh sach.
  // Loai bo TRUOC 1 ban ghi khac co cung real.id neu co (vd da vong ve qua
  // socket realtime truoc khi REST kip phan hoi) - tranh 2 phan tu cung id.
  function replaceOptimisticMessage(tempId: string, real: ApiChatMessage) {
    setMessages((prev) => {
      if (!prev) return prev;
      const withoutDupe = prev.filter((m) => m.id !== real.id);
      return withoutDupe.map((m) => (m.id === tempId ? real : m));
    });
    bumpConversationSummary(real);
  }

  // Gui that bai - bo bubble tam khoi danh sach, khong de no nam mai voi
  // trang thai "Đang gửi".
  function removeOptimisticMessage(tempId: string) {
    setMessages((prev) => prev?.filter((m) => m.id !== tempId) ?? prev);
  }

  function cancelPendingAttachment() {
    if (pendingAttachment?.kind === "image" && pendingAttachment.previewUrl) {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    }
    setPendingAttachment(null);
  }

  async function uploadAndStage(
    file: File,
    kind: AttachmentKind,
    durationSeconds?: number,
  ) {
    const previewUrl = kind === "image" ? URL.createObjectURL(file) : "";
    setPendingAttachment({
      kind,
      file,
      previewUrl,
      uploading: true,
      uploaded: null,
      durationSeconds,
    });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const uploaded = await uploadChatAttachmentAction(formData);
      setPendingAttachment((prev) =>
        prev?.file === file ? { ...prev, uploading: false, uploaded } : prev,
      );
    } catch {
      toast.danger(
        "Tải lên thất bại - có thể chưa cấu hình AWS S3 (AWS_REGION/AWS_S3_BUCKET).",
      );
      if (kind === "image") URL.revokeObjectURL(previewUrl);
      setPendingAttachment(null);
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      // startRecording() chi chay tu 1 onClick handler (khong phai luc
      // render) - react-hooks bao false-positive "impure function during
      // render" vi khong lan ra duoc boundary do qua 1 ham async dinh nghia
      // truc tiep trong than component.
      // eslint-disable-next-line
      recordStartRef.current = Date.now();
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        recordStreamRef.current?.getTracks().forEach((t) => t.stop());
        recordStreamRef.current = null;
        const elapsedSec = Math.max(
          1,
          Math.round((Date.now() - recordStartRef.current) / 1000),
        );
        const blob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        void uploadAndStage(file, "voice", elapsedSec);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch {
      toast.danger("Không thể truy cập micro - kiểm tra quyền trình duyệt.");
    }
  }

  function stopRecordingTimer() {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
    stopRecordingTimer();
  }

  function cancelRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    recordStreamRef.current?.getTracks().forEach((t) => t.stop());
    recordStreamRef.current = null;
    setRecording(false);
    stopRecordingTimer();
  }

  async function handleSend() {
    if (!activeId) return;
    const text = draft.trim();

    if (pendingAttachment) {
      if (pendingAttachment.uploading || !pendingAttachment.uploaded) return;
      const type: ApiMessageType =
        pendingAttachment.kind === "image"
          ? "IMAGE"
          : pendingAttachment.kind === "voice"
            ? "VOICE"
            : "FILE";
      const optimistic = buildOptimisticMessage({
        type,
        content: text || null,
        attachmentUrl: pendingAttachment.uploaded.url,
        attachmentName: pendingAttachment.uploaded.name,
        attachmentMimeType: pendingAttachment.uploaded.mimeType,
        attachmentSize: pendingAttachment.uploaded.size,
        durationSeconds: pendingAttachment.durationSeconds,
      });
      const replyToId = replyTarget?.id;
      pendingScrollActionRef.current = "bottom";
      stickyBottomRef.current = true;
      setMessages((prev) =>
        prev ? appendUniqueMessage(prev, optimistic) : prev,
      );
      setDraft("");
      setReplyTarget(null);
      cancelPendingAttachment();
      try {
        const msg = await sendMessageAction(activeId, {
          type,
          content: text || undefined,
          attachmentUrl: optimistic.attachmentUrl ?? undefined,
          attachmentName: optimistic.attachmentName ?? undefined,
          attachmentMimeType: optimistic.attachmentMimeType ?? undefined,
          attachmentSize: optimistic.attachmentSize ?? undefined,
          durationSeconds: optimistic.durationSeconds ?? undefined,
          replyToId,
        });
        replaceOptimisticMessage(optimistic.id, msg);
      } catch {
        removeOptimisticMessage(optimistic.id);
        toast.danger("Gửi tin nhắn thất bại, thử lại sau.");
      }
      return;
    }

    if (!text) return;
    const optimistic = buildOptimisticMessage({ type: "TEXT", content: text });
    const replyToId = replyTarget?.id;
    pendingScrollActionRef.current = "bottom";
    stickyBottomRef.current = true;
    setMessages((prev) =>
      prev ? appendUniqueMessage(prev, optimistic) : prev,
    );
    setDraft("");
    setReplyTarget(null);
    try {
      const msg = await sendMessageAction(activeId, {
        content: text,
        replyToId,
      });
      replaceOptimisticMessage(optimistic.id, msg);
    } catch {
      removeOptimisticMessage(optimistic.id);
      setDraft(text);
      toast.danger("Gửi tin nhắn thất bại, thử lại sau.");
    }
  }

  async function handleSelectGif(gif: ApiGif) {
    if (!activeId || !gif.url) return;
    setGifOpen(false);
    const optimistic = buildOptimisticMessage({
      type: "GIF",
      attachmentUrl: gif.url,
      attachmentName: gif.title || "GIF",
      attachmentMimeType: "image/gif",
    });
    pendingScrollActionRef.current = "bottom";
    stickyBottomRef.current = true;
    setMessages((prev) =>
      prev ? appendUniqueMessage(prev, optimistic) : prev,
    );
    try {
      const msg = await sendMessageAction(activeId, {
        type: "GIF",
        attachmentUrl: gif.url,
        attachmentName: gif.title || "GIF",
        attachmentMimeType: "image/gif",
      });
      replaceOptimisticMessage(optimistic.id, msg);
    } catch {
      removeOptimisticMessage(optimistic.id);
      toast.danger("Gửi GIF thất bại, thử lại sau.");
    }
  }

  async function handleCreatePoll(poll: {
    question: string;
    options: { text: string }[];
  }) {
    if (!activeId) return;
    const msg = await sendMessageAction(activeId, { type: "POLL", poll });
    appendSentMessage(msg);
  }

  function handleGroupCreated(conversation: ApiConversationSummary) {
    setConversations((prev) =>
      prev ? [conversation, ...prev] : [conversation],
    );
    setActiveId(conversation.id);
  }

  // Poll dang cho phan hoi optimistic (xem isVoting o MessageBubble.tsx) -
  // disable nut vote them trong luc cho, tranh bam lien tuc lam optimistic
  // state (tinh cuc bo) lech voi server.
  const [votingPollIds, setVotingPollIds] = useState<Set<string>>(new Set());

  const handleVote = useCallback((pollId: string, optionId: string) => {
    let previousPoll: ApiPoll | null = null;
    setMessages((prev) => {
      if (!prev) return prev;
      return prev.map((m) => {
        if (m.poll?.id !== pollId) return m;
        previousPoll = m.poll;
        return { ...m, poll: buildOptimisticPollTally(m.poll, optionId) };
      });
    });
    setVotingPollIds((prev) => new Set(prev).add(pollId));
    votePollAction(pollId, optionId)
      .then((tally) => {
        setMessages(
          (prev) =>
            prev?.map((m) =>
              m.poll?.id === pollId ? { ...m, poll: tally } : m,
            ) ?? prev,
        );
      })
      .catch(() => {
        // Rollback ve tally TRUOC khi bam (khong phai xoa poll) - server
        // chua ghi nhan gi ca vi request that bai.
        if (previousPoll) {
          const rollback = previousPoll;
          setMessages(
            (prev) =>
              prev?.map((m) =>
                m.poll?.id === pollId ? { ...m, poll: rollback } : m,
              ) ?? prev,
          );
        }
        toast.danger("Không thể bình chọn, thử lại sau.");
      })
      .finally(() => {
        setVotingPollIds((prev) => {
          const next = new Set(prev);
          next.delete(pollId);
          return next;
        });
      });
  }, []);

  const handleReact = useCallback((messageId: string, emoji: string) => {
    reactToMessageAction(messageId, emoji)
      .then(({ reactions }) => {
        setMessages(
          (prev) =>
            prev?.map((m) => (m.id === messageId ? { ...m, reactions } : m)) ??
            prev,
        );
      })
      .catch(() => toast.danger("Không thể thả cảm xúc, thử lại sau."));
  }, []);

  const handleRemoveReaction = useCallback((messageId: string) => {
    removeReactionAction(messageId)
      .then(({ reactions }) => {
        setMessages(
          (prev) =>
            prev?.map((m) => (m.id === messageId ? { ...m, reactions } : m)) ??
            prev,
        );
      })
      .catch(() => toast.danger("Không thể bỏ cảm xúc, thử lại sau."));
  }, []);

  const handleReply = useCallback((message: ApiChatMessage) => {
    setReplyTarget(message);
  }, []);

  const handleRecall = useCallback(
    async (messageId: string) => {
      if (!activeId) return;
      const updated = await recallMessageAction(activeId, messageId);
      setMessages(
        (prev) => prev?.map((m) => (m.id === messageId ? updated : m)) ?? prev,
      );
    },
    [activeId],
  );

  // Ghim/bo ghim - phia con lai trong hoi thoai nhan lai qua socket
  // "chat:message-updated" (tai su dung handleMessageUpdated, khong can them
  // event rieng).
  const handleTogglePin = useCallback(
    (messageId: string, currentlyPinned: boolean) => {
      if (!activeId) return;
      const action = currentlyPinned ? unpinMessageAction : pinMessageAction;
      action(activeId, messageId)
        .then((updated) => {
          setMessages(
            (prev) =>
              prev?.map((m) => (m.id === messageId ? updated : m)) ?? prev,
          );
          setPinnedMessages((prev) => syncPinnedMessages(prev, updated));
        })
        .catch(() => toast.danger("Không thể ghim tin nhắn, thử lại sau."));
    },
    [activeId],
  );

  async function handleToggleConversationSetting(
    conversationId: string,
    key: "isFavorite" | "isMuted" | "isRestricted",
  ) {
    const current = conversations?.find((c) => c.id === conversationId);
    if (!current) return;
    const nextValue = !current[key];
    setConversations(
      (prev) =>
        prev?.map((c) =>
          c.id === conversationId ? { ...c, [key]: nextValue } : c,
        ) ?? prev,
    );
    try {
      await updateConversationSettingsAction(conversationId, {
        [key]: nextValue,
      });
    } catch {
      toast.danger("Không thể cập nhật, thử lại sau.");
      setConversations(
        (prev) =>
          prev?.map((c) =>
            c.id === conversationId ? { ...c, [key]: current[key] } : c,
          ) ?? prev,
      );
    }
  }

  async function handleMarkUnread(conversationId: string) {
    try {
      const { unreadCount } =
        await markConversationUnreadAction(conversationId);
      setConversations(
        (prev) =>
          prev?.map((c) =>
            c.id === conversationId ? { ...c, unreadCount } : c,
          ) ?? prev,
      );
    } catch {
      toast.danger("Không thể đánh dấu chưa đọc, thử lại sau.");
    }
  }

  const filtered =
    conversations?.filter((c) => {
      const matchesQuery = (
        c.isGroup ? (c.groupName ?? "") : (c.otherUser?.name ?? "")
      )
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesTab =
        tab === "unread"
          ? c.unreadCount > 0
          : tab === "favorites"
            ? c.isFavorite
            : true;
      return matchesQuery && matchesTab;
    }) ?? [];
  // Tong SO TIN NHAN moi chua doc (cong don unreadCount tung hoi thoai) -
  // KHONG phai so hoi thoai co tin chua doc, dung cho badge tab "Chưa đọc".
  const unreadTotal =
    conversations?.reduce((sum, c) => sum + c.unreadCount, 0) ?? 0;
  // Badge tab CHUNG (Tất cả/Yêu thích) cung phai la SO TIN NHAN moi trong
  // pham vi tab do, KHONG phai so cuoc hoi thoai (vd "Tất cả (7)" tung bi
  // hieu nham la 7 cuoc hoi thoai - dung ra phai la tong tin nhan chua doc
  // trong ca 7 cuoc do).
  const favoritesUnreadTotal =
    conversations?.reduce(
      (sum, c) => sum + (c.isFavorite ? c.unreadCount : 0),
      0,
    ) ?? 0;
  // Bao gia tri MOI NHAT cho TopHeaderBar.tsx (qua chat-unread-store.ts) -
  // component nay la nguon tinh CHINH XAC nhat (REST + socket dong bo real-
  // time), trong khi header chi fetch lai khi doi pathname (bo lo truong
  // hop doc tin nhan ma van dang o /messages, chi doi query "?c="). Xoa bao
  // cao luc unmount (roi /messages) de header tu tiep quan lai binh thuong.
  useEffect(() => {
    if (conversations === null) return;
    setUnreadChatTotal(unreadTotal);
  }, [conversations, unreadTotal]);
  useEffect(() => {
    return () => clearUnreadChatTotal();
  }, []);
  const activeConversation = conversations?.find((c) => c.id === activeId);
  const isActiveTyping = activeId ? typingConversationIds.has(activeId) : false;

  // "Da xem" dang "1 dong tick" - CHI dung cho 1-1 (nhom dung avatar-stack
  // rieng, xem groupSeenByUsers duoi day, vi nhieu nguoi doc nen 1 dong tick
  // chung khong the hien AI da xem). Uu tien gia tri real-time (chat:read)
  // neu la CHINH hoi thoai dang mo, khong thi dung snapshot REST tu luc fetch
  // conversation.
  const effectiveOtherLastReadAt = activeConversation?.isGroup
    ? null
    : otherReadEvent?.conversationId === activeId
      ? otherReadEvent.readAt
      : (activeConversation?.otherLastReadAt ?? null);
  const lastOwnMessage =
    messages &&
    messages.length > 0 &&
    messages[messages.length - 1].senderId === myId &&
    messages[messages.length - 1].type !== "SYSTEM"
      ? messages[messages.length - 1]
      : null;
  const showSeen = Boolean(
    lastOwnMessage &&
    effectiveOtherLastReadAt &&
    new Date(lastOwnMessage.createdAt) <= new Date(effectiveOtherLastReadAt),
  );
  // "Da xem" (NHOM) - avatar cua tung thanh vien DA doc den/qua tin cuoi
  // cung cua CHINH minh, dua theo groupReadReceipts (fetch luc mo hoi thoai +
  // cap nhat real-time tung phan tu qua "chat:read" - xem effect [activeId]/
  // handleRead o tren).
  const groupSeenByUsers =
    activeConversation?.isGroup && lastOwnMessage
      ? activeConversation.participants.filter((p) => {
          const readAt = groupReadReceipts[p.id];
          return (
            readAt && new Date(lastOwnMessage.createdAt) <= new Date(readAt)
          );
        })
      : [];

  return (
    <div className="flex h-full overflow-hidden border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,.04)]">
      {/* Danh sach hoi thoai - man hep (< md) chi hien 1 trong 2 panel (danh
          sach HOAC khung chat), khong hien song song nhu desktop. activeId
          quyet dinh panel nao hien - da co san (dung de biet hoi thoai nao
          dang mo), tai dung lam luon "che do xem" tren mobile, khong can
          them state rieng. */}
      <section
        className={cn(
          "flex w-full shrink-0 flex-col md:w-[380px] md:border-r md:border-slate-200",
          activeId && "hidden md:flex",
        )}
      >
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-bold text-[#182338]">Tin nhắn</h1>
            <div className="flex items-center gap-x-3 text-slate-500">
              <FunnelIcon className="size-5.5" strokeWidth={2} />
              <button
                type="button"
                title="Tạo nhóm chat"
                onClick={() => setCreateGroupOpen(true)}
                className="cursor-pointer"
              >
                <UserRoundPlus className="size-5.5" strokeWidth={2} />
              </button>
              <SquarePenIcon className="size-5.5" strokeWidth={2} />
            </div>
          </div>

          <div className="scrollbar-none mt-4 flex items-center gap-4 overflow-x-auto border-b border-slate-100 sm:gap-5">
            {CHAT_TABS.map((t) => {
              const active = !t.disabled && tab === t.key;
              const badgeCount =
                t.key === "all"
                  ? unreadTotal
                  : t.key === "unread"
                    ? unreadTotal
                    : t.key === "favorites"
                      ? favoritesUnreadTotal
                      : 0;
              return (
                <button
                  key={t.key}
                  type="button"
                  disabled={t.disabled}
                  title={t.disabled ? "Sắp có" : undefined}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-1.5 pb-3 text-[14px] whitespace-nowrap transition-colors duration-150 ease-out",
                    t.disabled
                      ? "cursor-not-allowed text-slate-300"
                      : active
                        ? "cursor-pointer font-semibold"
                        : "cursor-pointer font-medium text-black ",
                  )}
                  style={active ? { color: "var(--primary)" } : undefined}
                >
                  {t.label}
                  {badgeCount > 0 && (
                    <span
                      className="grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-semibold text-white"
                      style={{
                        background: "var(--primary)",
                        boxShadow:
                          "0 2px 6px color-mix(in srgb, var(--primary) 45%, transparent)",
                      }}
                    >
                      {badgeCount}
                    </span>
                  )}
                  {active && (
                    <span
                      className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full"
                      style={{ background: "var(--primary)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-[#fafbfc] px-3.5">
            <Search size={17} className="shrink-0 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-[14px] text-[#182338] outline-none placeholder:text-slate-400"
              placeholder="Tìm kiếm hội thoại..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          {conversations === null ? (
            <div className="flex flex-col">
              {Array.from({ length: 6 }).map((_, i) => (
                <ConversationRowSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
              <MessageCircle size={26} className="text-slate-300" />
              <p className="text-[13px] text-slate-500">
                Chưa có hội thoại nào.
              </p>
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group relative flex w-full gap-3.5 px-6 py-4 transition",
                  activeId === c.id ? "bg-[#EEF5F7] " : "hover:bg-slate-50",
                  c.isRestricted && "opacity-60",
                )}
              >
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  className="flex min-w-0 flex-1 cursor-pointer gap-3.5 text-left"
                >
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        "flex rounded-full",
                        activeId === c.id && "ring-2 ring-white",
                      )}
                    >
                      {c.isGroup ? (
                        <GroupAvatar color={c.groupAvatarColor} />
                      ) : (
                        <ConversationAvatar
                          name={c.otherUser?.name}
                          avatarUrl={c.otherUser?.avatarUrl}
                          online={c.otherUser?.online}
                        />
                      )}
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="absolute -top-1 -left-2 grid h-6 min-w-6 shadow-md place-items-center rounded-full border-3 border-white bg-primary px-1 text-[13px] font-bold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1">
                        {c.isFavorite && (
                          <Star
                            size={12}
                            className="shrink-0"
                            style={{ color: "var(--primary)" }}
                            fill="currentColor"
                          />
                        )}
                        <b className="truncate text-[16px] text-[#10213A]">
                          {c.isGroup
                            ? (c.groupName ?? "Nhóm")
                            : (c.otherUser?.name ?? "Người dùng")}
                        </b>
                        {c.isMuted && (
                          <BellOff
                            size={12}
                            className="shrink-0 text-slate-400"
                          />
                        )}
                      </div>
                      <span className="shrink-0 text-[11px] text-slate-500 transition-opacity duration-150 ease-out group-hover:opacity-0">
                        {formatRelativeTime(c.updatedAt)}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between gap-2">
                      <p
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-1 truncate font-bold text-[14.5px] ",
                          typingConversationIds.has(c.id)
                            ? "italic"
                            : "text-ink/90",
                        )}
                        style={
                          typingConversationIds.has(c.id)
                            ? { color: "var(--primary)" }
                            : undefined
                        }
                      >
                        {!typingConversationIds.has(c.id) &&
                          c.lastMessage &&
                          c.lastMessage.senderId === myId && (
                            <ReplyIcon
                              size={14}
                              strokeWidth={4}
                              className="shrink-0 text-black/60 mb-1"
                            />
                          )}
                        <span className="truncate">
                          {typingConversationIds.has(c.id)
                            ? "Đang nhập..."
                            : c.lastMessage
                              ? formatMessagePreview(c.lastMessage)
                              : "Chưa có tin nhắn"}
                        </span>
                      </p>
                    </div>
                  </div>
                </button>

                <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
                  <PopoverRoot
                    open={openRowMenuId === c.id}
                    onOpenChange={(open) =>
                      setOpenRowMenuId(open ? c.id : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        title="Tuỳ chọn"
                        className="grid size-6 shrink-0 cursor-pointer place-items-center rounded-full bg-white text-slate-500 shadow-[0_1px_4px_rgba(15,23,42,.15)] hover:bg-slate-100"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      open={openRowMenuId === c.id}
                      align="end"
                      sideOffset={6}
                    >
                      <ConversationRowMenu
                        conversation={c}
                        onToggle={(key) =>
                          handleToggleConversationSetting(c.id, key)
                        }
                        onMarkUnread={() => handleMarkUnread(c.id)}
                        onClose={() => setOpenRowMenuId(null)}
                      />
                    </PopoverContent>
                  </PopoverRoot>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Khung chat - an hoan toan tren mobile khi CHUA chon hoi thoai (xem
          comment o <section> danh sach hoi thoai o tren). */}
      <main
        className={cn(
          "relative flex min-w-0 flex-1 flex-col bg-white transition-colors duration-300",
          !activeId && "hidden md:flex",
        )}
        style={
          immersiveThemeId !== "none"
            ? { background: getImmersiveTheme(immersiveThemeId).bg }
            : undefined
        }
      >
        {conversations === null ? (
          <ChatWindowSkeleton />
        ) : !activeConversation ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <MessageCircle size={30} className="text-slate-300" />
            <p className="text-[14px] text-slate-500">
              {conversations.length === 0
                ? "Chưa có hội thoại nào."
                : "Chọn 1 hội thoại để bắt đầu"}
            </p>
          </div>
        ) : (
          <>
            <ImmersiveChatScene themeId={immersiveThemeId} />
            <div className="relative z-10 flex h-21 shrink-0 items-center justify-between gap-3.5 border-b-[2px] border-gray-100 bg-white px-5 shadow-[0_3px_18px_rgba(15,23,42,.05)]">
              <div className="flex min-w-0 items-center gap-3.5">
                <button
                  type="button"
                  title="Quay lại danh sách"
                  onClick={handleBackToList}
                  className="-ml-1.5 grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338] md:hidden"
                >
                  <ArrowLeft size={16} />
                </button>
                {/* Avatar giam con nua kich thuoc (60 -> 30) tren mobile de
                    header khong choan het cho ten/icon - 2 component nay
                    nhan "size" qua JS prop (khong phai class), nen render
                    2 ban rieng + an/hien qua Tailwind (md:hidden / hidden
                    md:inline-flex) thay vi 1 media-query hook, giu dung quy
                    uoc responsive-thuan-CSS da dung xuyen suot session nay. */}
                {activeConversation.isGroup ? (
                  <>
                    <span className="md:hidden">
                      <GroupAvatar
                        color={activeConversation.groupAvatarColor}
                        size={30}
                      />
                    </span>
                    <span className="hidden md:inline-flex">
                      <GroupAvatar
                        color={activeConversation.groupAvatarColor}
                      />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="md:hidden">
                      <ConversationAvatar
                        name={activeConversation.otherUser?.name}
                        avatarUrl={activeConversation.otherUser?.avatarUrl}
                        online={activeConversation.otherUser?.online}
                        size={30}
                      />
                    </span>
                    <span className="hidden md:inline-flex">
                      <ConversationAvatar
                        name={activeConversation.otherUser?.name}
                        avatarUrl={activeConversation.otherUser?.avatarUrl}
                        online={activeConversation.otherUser?.online}
                      />
                    </span>
                  </>
                )}
                <div className="min-w-0">
                  <b className="truncate text-[17px] text-[#182338]">
                    {activeConversation.isGroup
                      ? (activeConversation.groupName ?? "Nhóm")
                      : (activeConversation.otherUser?.name ?? "Người dùng")}
                  </b>
                  <p className="text-[13px] text-slate-500">
                    {activeConversation.isGroup ? (
                      `${activeConversation.participants.length + 1} thành viên`
                    ) : activeConversation.otherUser?.online ? (
                      <span className="font-medium text-emerald-600">
                        Đang hoạt động
                      </span>
                    ) : activeConversation.otherUser?.username ? (
                      `@${activeConversation.otherUser.username}`
                    ) : (
                      "Ngoại tuyến"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <PopoverRoot open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      title="Tìm tin nhắn"
                      className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-500 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338]"
                    >
                      <Search size={18} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent open={searchOpen} align="end" sideOffset={10}>
                    <MessageSearchPopover
                      conversationId={activeConversation.id}
                      onViewAll={(q) => {
                        setSearchOpen(false);
                        setSearchDrawerQuery(q);
                        setSearchDrawerOpen(true);
                      }}
                    />
                  </PopoverContent>
                </PopoverRoot>

                <button
                  type="button"
                  title={
                    rightPanelOpen ? "Ẩn bảng thông tin" : "Hiện bảng thông tin"
                  }
                  onClick={() => setRightPanelOpen((v) => !v)}
                  className={cn(
                    "grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg transition-colors duration-150 ease-out hover:bg-slate-100",
                    rightPanelOpen ? "text-[#182338]" : "text-slate-500",
                  )}
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {pinnedMessages && pinnedMessages.length > 0 && (
              <PinnedMessagesBar
                pinnedMessages={pinnedMessages}
                participants={activeConversation.participants}
                myId={myId}
                onJumpToMessage={handleJumpToMessage}
              />
            )}

            <div
              ref={scrollRef}
              onScroll={() => {
                // Dinh lai theo vi tri THAT SU sau moi lan cuon (ca cuon tay
                // lan cuon do ResizeObserver/layout effect tu goi) - cuon len
                // xem tin cu se tat "dinh day", cuon/duoc keo ve gan day cuoi
                // se bat lai (dung hanh vi chat chuan: dang o day thi luon
                // dinh theo, roi len thi thoi).
                stickyBottomRef.current = isNearBottom();
                if (showNewMessagesBanner && isNearBottom()) {
                  setShowNewMessagesBanner(false);
                }
              }}
              className={cn(
                "relative z-10 flex-1 overflow-y-auto px-4 pt-6 pb-30 md:px-8",
                // Khung canh dong (immersiveThemeId != "none") thay the han
                // nen tinh cu - de trong suot cho canh phia sau lo ra, thay
                // vi ca 2 he thong nen chong nhau.
                immersiveThemeId === "none" && getChatBackground(chatBgId).base,
              )}
              style={
                immersiveThemeId === "none"
                  ? getChatBackground(chatBgId).patternStyle
                  : undefined
              }
            >
              <div ref={scrollContentRef} className="mx-auto">
                {/* Marker cho IntersectionObserver - vao vung nhin cua khung
                cuon (root: scrollRef) thi tu goi handleLoadOlder, xem effect
                sentinel o tren. Luon mount (khong go khi het nextCursor) de
                khong phai tao/huy lai observer lien tuc - handleLoadOlder tu
                thoat som neu khong con nextCursor. */}
                <div ref={loadOlderSentinelRef} className="h-px" />
                {loadingOlder && (
                  <div className="mb-4 flex justify-center">
                    <LoaderCircle
                      size={16}
                      className="animate-spin text-slate-400"
                    />
                  </div>
                )}
                {!loadingOlder && loadOlderError && (
                  <div className="mb-4 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadOlder}
                      className="cursor-pointer text-[13px] font-semibold text-danger"
                    >
                      Tải tin nhắn cũ hơn thất bại - Thử lại
                    </button>
                  </div>
                )}
                {!loadingOlder &&
                  !loadOlderError &&
                  !nextCursor &&
                  messages !== null &&
                  messages.length > 0 &&
                  activeConversation && (
                    <div className="mb-8 flex flex-col items-center gap-3 pt-4 text-center">
                      {activeConversation.isGroup ? (
                        <GroupAvatar
                          color={activeConversation.groupAvatarColor}
                          size={72}
                        />
                      ) : (
                        <ConversationAvatar
                          name={activeConversation.otherUser?.name}
                          avatarUrl={activeConversation.otherUser?.avatarUrl}
                          size={72}
                        />
                      )}
                      <div>
                        <p className="text-[16px] font-bold text-[#182338]">
                          {activeConversation.isGroup
                            ? (activeConversation.groupName ?? "Nhóm")
                            : (activeConversation.otherUser?.name ??
                              "Người dùng")}
                        </p>
                        <p className="mt-1 text-[13px] text-slate-400">
                          {activeConversation.isGroup
                            ? `Đây là khởi đầu của nhóm ${activeConversation.groupName ?? ""}`
                            : `Đây là khởi đầu cuộc trò chuyện của bạn với ${activeConversation.otherUser?.name ?? "người này"}`}
                        </p>
                      </div>
                    </div>
                  )}
                {messages === null ? (
                  <div className="flex justify-center py-10">
                    <LoaderCircle
                      size={20}
                      className="animate-spin text-slate-400"
                    />
                  </div>
                ) : (
                  <>
                    {messages.map((m, i) => {
                      const prev = messages[i - 1];
                      const next = messages[i + 1];
                      return (
                        <MessageBubble
                          key={m.id}
                          message={m}
                          isMine={m.senderId === myId}
                          myId={myId}
                          participants={activeConversation.participants}
                          isFirstInGroup={!prev || !sameGroup(prev, m)}
                          isLastInGroup={!next || !sameGroup(next, m)}
                          highlighted={highlightedMessageId === m.id}
                          onVote={handleVote}
                          onReact={handleReact}
                          onRemoveReaction={handleRemoveReaction}
                          onReply={handleReply}
                          onRecall={handleRecall}
                          onJumpToMessage={handleJumpToMessage}
                          onTogglePin={handleTogglePin}
                          theme={getImmersiveTheme(immersiveThemeId)}
                          isGroup={activeConversation.isGroup}
                          isVoting={!!m.poll && votingPollIds.has(m.poll.id)}
                        />
                      );
                    })}
                    {lastOwnMessage && !lastOwnMessage.isRecalled && (
                      <div className="mb-2 flex items-center justify-end gap-1 pr-1 mt-1 text-[12px] font-semibold text-slate-500">
                        {lastOwnMessage.id.startsWith("temp-") ? (
                          <>
                            <LoaderCircle size={13} className="animate-spin" />
                            <span>Đang gửi...</span>
                          </>
                        ) : activeConversation?.isGroup ? (
                          groupSeenByUsers.length > 0 ? (
                            <div
                              className="flex items-center -space-x-1.5"
                              title={`Đã xem: ${groupSeenByUsers.map((u) => u.name).join(", ")}`}
                            >
                              {groupSeenByUsers.slice(0, 5).map((u) => (
                                <span
                                  key={u.id}
                                  className="rounded-full ring-2 ring-white"
                                >
                                  <ConversationAvatar
                                    name={u.name}
                                    avatarUrl={u.avatarUrl}
                                    size={18}
                                  />
                                </span>
                              ))}
                              {groupSeenByUsers.length > 5 && (
                                <span className="grid size-4 shrink-0 place-items-center rounded-full bg-slate-200 text-[8px] font-bold text-slate-600 ring-2 ring-white">
                                  +{groupSeenByUsers.length - 5}
                                </span>
                              )}
                            </div>
                          ) : (
                            <>
                              <Check size={16} strokeWidth={2.75} />
                              <span>Đã gửi</span>
                            </>
                          )
                        ) : showSeen ? (
                          <>
                            <CheckCheck
                              size={16}
                              strokeWidth={2.75}
                              style={{ color: "var(--primary)" }}
                            />
                            <span style={{ color: "var(--primary)" }}>
                              Đã xem
                            </span>
                          </>
                        ) : (
                          <>
                            <Check size={16} strokeWidth={2.75} />
                            <span>Đã gửi</span>
                          </>
                        )}
                      </div>
                    )}
                    {isActiveTyping && (
                      <div className="mb-4 flex justify-start">
                        <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-[#f0f1f3] px-4 py-3.5">
                          <span
                            className="size-1.5 animate-bounce rounded-full bg-slate-400"
                            style={{ animationDelay: "0ms" }}
                          />
                          <span
                            className="size-1.5 animate-bounce rounded-full bg-slate-400"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="size-1.5 animate-bounce rounded-full bg-slate-400"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {showNewMessagesBanner && (
              <div className="pointer-events-none absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewMessagesBanner(false);
                    scrollRef.current?.scrollTo({
                      top: scrollRef.current.scrollHeight,
                      behavior: "smooth",
                    });
                  }}
                  className="pointer-events-auto cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(15,23,42,.18)] transition-transform duration-150 ease-out hover:scale-105"
                  style={{ background: "var(--primary)" }}
                >
                  Có tin nhắn mới ↓
                </button>
              </div>
            )}

            <div className="absolute bottom-0 left-0 z-20 w-full p-3 md:p-5">
              <div
                className={cn(
                  // Mobile LUON rounded-2xl (khong con rounded-full) - cum
                  // icon + input gio la 2 hang xep chong tren mobile (xem
                  // JSX ben duoi), rounded-full voi 1 khoi 2 hang cao se ra
                  // hinh dang be beo/cat cut o hang tren (ban kinh bo goc =
                  // nua chieu cao CA KHOI, qua lon so voi 1 hang rieng le) -
                  // dung hinh "vien thuoc" chi con hop ly khi THAT SU 1 hang
                  // (desktop tro len, md:).
                  "flex flex-col gap-2.5 rounded-2xl border-2 border-slate-300 bg-white p-2.5 shadow-[0_3px_18px_rgba(15,23,42,.06)] transition-[border-radius] duration-200 ease-out",
                  !(replyTarget || pendingAttachment || recording) &&
                    "md:rounded-full",
                )}
              >
                <AnimatePresence initial={false}>
                  {replyTarget && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
                        <ReplyIcon
                          size={15}
                          className="shrink-0 text-slate-400"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-slate-500">
                            Trả lời{" "}
                            {replyTarget.senderId === myId
                              ? "chính mình"
                              : (activeConversation?.participants.find(
                                  (p) => p.id === replyTarget.senderId,
                                )?.name ?? "")}
                          </p>
                          <p className="truncate text-[12px] text-slate-600">
                            {formatMessagePreview(replyTarget)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyTarget(null)}
                          className="shrink-0 cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {pendingAttachment && (
                  <AttachmentPreviewStrip
                    attachment={pendingAttachment}
                    onCancel={cancelPendingAttachment}
                  />
                )}
                {recording && (
                  <div className="flex items-center gap-2.5 rounded-xl bg-red-50 px-3.5 py-2.5">
                    <span className="size-2 shrink-0 animate-pulse rounded-full bg-red-500" />
                    <span className="text-[13px] font-semibold text-red-600">
                      Đang ghi âm... {formatDuration(recordSeconds)}
                    </span>
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="ml-auto cursor-pointer text-[13px] font-medium text-red-500 hover:text-red-700"
                    >
                      Huỷ
                    </button>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-red-700"
                    >
                      Dừng & Gửi
                    </button>
                  </div>
                )}

                {/* Mobile: cum icon "tuy chon" (Plus/Anh/Emoji/GIF/Mic) len
                    HANG RIENG phia tren, input xuong hang rieng ben duoi
                    (flex-col) - nhuong het chieu rong cho input tren man
                    hinh hep thay vi chen 5 icon + input + nut gui cung 1
                    hang. Tu md: tro len giu nguyen 1 hang ngang nhu truoc
                    (md:flex-row). */}
                {/* items-center (khong phai items-end) - truoc day dung
                    items-end + md:pb-1.5 "chinh tay" de can day cum icon
                    (28-36px) khop voi nut gui (36-44px, cao hon han) qua 1
                    khoang padding co dinh - sai ngay khi size 2 ben lech nhau
                    (vd luc doi sm:size-11 cho nut gui ma khong chinh lai
                    padding), khien nut gui trong nhu "troi" giua box thay vi
                    bam theo baseline text. items-center khong phu thuoc kich
                    thuoc tuyet doi, luon can giua deu nhau bat ke icon/nut
                    to nho khac nhau. */}
                <div className="flex flex-col gap-1.5 md:flex-row md:items-center">
                  <div className="flex shrink-0 items-center gap-0.5">
                    <PopoverRoot open={plusOpen} onOpenChange={setPlusOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={composerBusy}
                          title="Thêm"
                          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-slate-600 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338] disabled:cursor-not-allowed disabled:opacity-40 sm:size-9"
                        >
                          <Plus size={19} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        open={plusOpen}
                        align="start"
                        sideOffset={10}
                      >
                        <div className="w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_8px_28px_rgba(15,23,42,.12)]">
                          <button
                            type="button"
                            onClick={() => {
                              setPlusOpen(false);
                              fileInputRef.current?.click();
                            }}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
                          >
                            <Paperclip size={16} className="text-slate-500" />
                            Đính kèm file
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPlusOpen(false);
                              setPollModalOpen(true);
                            }}
                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
                          >
                            <BarChart3 size={16} className="text-slate-500" />
                            Tạo tin nhắn thăm dò ý kiến
                          </button>
                        </div>
                      </PopoverContent>
                    </PopoverRoot>

                    <button
                      type="button"
                      disabled={composerBusy}
                      title="Gửi ảnh"
                      onClick={() => imageInputRef.current?.click()}
                      className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-slate-600 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338] disabled:cursor-not-allowed disabled:opacity-40 sm:size-9"
                    >
                      <ImagePlus size={18} />
                    </button>

                    <PopoverRoot open={emojiOpen} onOpenChange={setEmojiOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={composerBusy}
                          title="Chọn sticker"
                          className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-slate-600 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338] disabled:cursor-not-allowed disabled:opacity-40 sm:size-9"
                        >
                          <Smile size={18} />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        open={emojiOpen}
                        align="start"
                        sideOffset={10}
                      >
                        <EmojiPickerPopover
                          onSelect={(emoji) => {
                            setDraft((prev) => prev + emoji);
                            setEmojiOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </PopoverRoot>

                    <PopoverRoot open={gifOpen} onOpenChange={setGifOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={composerBusy}
                          title="Tìm GIF"
                          className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-[11px] font-black tracking-tight text-slate-600 transition-colors duration-150 ease-out hover:bg-slate-100 hover:text-[#182338] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          GIF
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        open={gifOpen}
                        align="start"
                        sideOffset={10}
                      >
                        <GifPickerPopover
                          onSelect={(gif) => void handleSelectGif(gif)}
                        />
                      </PopoverContent>
                    </PopoverRoot>

                    <button
                      type="button"
                      disabled={pendingAttachment !== null}
                      title="Ghi âm tin nhắn thoại"
                      onClick={() =>
                        recording ? stopRecording() : void startRecording()
                      }
                      className={cn(
                        "grid size-7 shrink-0 cursor-pointer place-items-center rounded-full transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40 sm:size-9",
                        recording
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "text-slate-600 hover:bg-slate-100 hover:text-[#182338]",
                      )}
                    >
                      <Mic size={18} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                  <textarea
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      if (activeId) {
                        const now = Date.now();
                        // Throttle 1.2s - khong emit moi keystroke, nguoi
                        // nhan tu het "dang nhap" sau 3s neu khong co event moi.
                        if (now - lastTypingEmitRef.current > 1200) {
                          lastTypingEmitRef.current = now;
                          emitTyping(activeId);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    rows={1}
                    disabled={recording}
                    onBlur={handleTextareaBlur}
                    // text-base (16px) BAT BUOC, khong duoc nho hon - iOS
                    // Safari tu dong ZOOM CA TRANG khi focus vao 1 input/
                    // textarea co font-size < 16px (co che "tranh nguoi dung
                    // phai zoom tay de doc chu qua nho", khong tat duoc qua
                    // CSS, chi tranh duoc bang cach khong bao gio de font
                    // duoi 16px). Truoc la text-[15px] nen bam vao o soan tin
                    // se bi zoom man hinh tren iPhone/iPad Safari.
                    className="max-h-24 min-w-0 flex-1 resize-none bg-transparent px-1.5 py-2.5 text-base text-[#182338] outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60 sm:px-2.5"
                    placeholder="Nhập tin nhắn..."
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={
                      recording ||
                      (pendingAttachment
                        ? pendingAttachment.uploading
                        : !draft.trim())
                    }
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full text-white shadow-sm transition-transform duration-150 ease-out sm:size-11",
                      recording ||
                        (pendingAttachment
                          ? pendingAttachment.uploading
                          : !draft.trim())
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:scale-105",
                    )}
                    style={{ background: "var(--primary)" }}
                  >
                    <Send size={19} />
                  </button>
                  </div>
                </div>
              </div>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadAndStage(file, "image");
                  e.target.value = "";
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadAndStage(file, "file");
                  e.target.value = "";
                }}
              />
            </div>
          </>
        )}
      </main>

      {/* Bang thong tin (nut 3 cham o header) - RESPONSIVE: desktop (md+) la
          cot tinh nhu truoc (khong hieu ung, khong backdrop); mobile la 1
          drawer that su (fixed toan man hinh, backdrop bam-ra-ngoai-de-dong,
          truot vao tu phai) - dung CHUNG 1 instance panel (khong render 2
          lan) qua className responsive tren chinh motion.div, tranh fetch
          trung lap du lieu cua GroupInfoPanel/MessageInfoPanel. "Khung cảnh
          trò chuyện" (truoc la nut rieng tren header, gio bo nut "Đổi nền
          đoạn chat" theo yeu cau nguoi dung) chuyen thanh 1 dong dau tien
          trong chinh panel nay - ap dung ca 2 che do. */}
      <AnimatePresence>
        {rightPanelOpen && (
          <>
            <motion.div
              key="right-panel-backdrop"
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => setRightPanelOpen(false)}
            />
            <motion.div
              key="right-panel"
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-hidden bg-white shadow-xl md:static md:z-auto md:w-95 md:max-w-none md:shrink-0 md:border-l md:border-[#E7E9EF] md:shadow-none"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setThemeModalOpen(true)}
                className="flex shrink-0 items-center gap-2.5 border-b border-slate-100 px-5 py-3.5 text-left text-[13px] font-medium text-[#182338] transition-colors duration-150 ease-out hover:bg-slate-50"
              >
                <BubblesIcon size={17} className="shrink-0 text-slate-500" />
                Khung cảnh trò chuyện
              </button>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {conversations === null ? (
                  <InfoPanelSkeleton />
                ) : activeConversation?.isGroup ? (
                  <GroupInfoPanel
                    key={activeConversation.id}
                    conversation={activeConversation}
                    myName={session?.user?.name ?? "Bạn"}
                    myAvatarUrl={session?.user?.image}
                    onClose={() => setRightPanelOpen(false)}
                    onUpdated={handleGroupUpdated}
                    onToggleMute={() =>
                      void handleToggleConversationSetting(
                        activeConversation.id,
                        "isMuted",
                      )
                    }
                    onOpenSearch={() => {
                      setSearchDrawerQuery("");
                      setSearchDrawerOpen(true);
                    }}
                    onJumpToMessage={handleJumpToMessage}
                    onLeft={() => handleGroupLeft(activeConversation.id)}
                  />
                ) : (
                  activeConversation?.otherUser && (
                    <MessageInfoPanel
                      otherUser={activeConversation.otherUser}
                      onClose={() => setRightPanelOpen(false)}
                    />
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PollComposerModal
        open={pollModalOpen}
        onOpenChange={setPollModalOpen}
        onSubmit={handleCreatePoll}
      />

      <CreateGroupModal
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        onCreated={handleGroupCreated}
      />

      <ImmersiveThemeModal
        open={themeModalOpen}
        onOpenChange={setThemeModalOpen}
        value={immersiveThemeId}
        onChange={handleChangeImmersiveTheme}
      />

      {activeConversation && (
        <MessageSearchDrawer
          key={searchDrawerQuery}
          open={searchDrawerOpen}
          onOpenChange={setSearchDrawerOpen}
          conversationId={activeConversation.id}
          initialQuery={searchDrawerQuery}
        />
      )}
    </div>
  );
}

function ConversationRowMenu({
  conversation,
  onToggle,
  onMarkUnread,
  onClose,
}: {
  conversation: ApiConversationSummary;
  onToggle: (key: "isFavorite" | "isMuted" | "isRestricted") => void;
  onMarkUnread: () => void;
  onClose: () => void;
}) {
  return (
    <div className="w-56 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_8px_28px_rgba(15,23,42,.12)]">
      <button
        type="button"
        onClick={() => {
          onToggle("isFavorite");
          onClose();
        }}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
      >
        <Star
          size={15}
          className={conversation.isFavorite ? undefined : "text-slate-500"}
          style={
            conversation.isFavorite ? { color: "var(--primary)" } : undefined
          }
          fill={conversation.isFavorite ? "currentColor" : "none"}
        />
        {conversation.isFavorite
          ? "Bỏ đánh dấu Yêu thích"
          : "Đánh dấu Yêu thích"}
      </button>
      <button
        type="button"
        onClick={() => {
          onMarkUnread();
          onClose();
        }}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
      >
        <MessageCircle size={15} className="text-slate-500" />
        Chưa đọc
      </button>
      <button
        type="button"
        onClick={() => {
          onToggle("isRestricted");
          onClose();
        }}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
      >
        <ShieldAlert
          size={15}
          className={
            conversation.isRestricted ? "text-amber-600" : "text-slate-500"
          }
        />
        {conversation.isRestricted ? "Bỏ hạn chế" : "Hạn chế"}
      </button>
      <button
        type="button"
        onClick={() => {
          onToggle("isMuted");
          onClose();
        }}
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#182338] hover:bg-slate-50"
      >
        <BellOff
          size={15}
          className={conversation.isMuted ? "text-[#182338]" : "text-slate-500"}
        />
        {conversation.isMuted ? "Bật lại thông báo" : "Tắt thông báo"}
      </button>
    </div>
  );
}

function AttachmentPreviewStrip({
  attachment,
  onCancel,
}: {
  attachment: PendingAttachment;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
      {attachment.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element -- preview tu File cuc bo (object URL), khong phai anh remote
        <img
          src={attachment.previewUrl}
          alt={attachment.file.name}
          className="size-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-slate-200">
          {attachment.kind === "voice" ? (
            <Mic size={18} className="text-slate-500" />
          ) : (
            <FileIcon size={18} className="text-slate-500" />
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[#182338]">
          {attachment.file.name}
        </p>
        <p className="text-[11px] text-slate-500">
          {attachment.uploading ? "Đang tải lên..." : "Sẵn sàng gửi"}
        </p>
      </div>
      {attachment.uploading && (
        <LoaderCircle
          size={16}
          className="shrink-0 animate-spin text-slate-400"
        />
      )}
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
      >
        <X size={16} />
      </button>
    </div>
  );
}
