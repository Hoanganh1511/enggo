// Skeleton placeholder cho trang /messages luc dang tai (conversations ===
// null) - truoc day chi 1 spinner giua man (danh sach hoi thoai) + 1 empty
// state "Chọn 1 hội thoại để bắt đầu" (khung chat) + KHONG co gi o cot phai
// (info panel chi mount khi co activeConversation that). Ket qua: bo cuc
// nhay hang tu "1 cot mong" sang "3 cot day" ngay khi du lieu ve, gay cam
// giac xê dịch layout (nguoi dung phan anh). 3 component o day CO Y giu
// DUNG kich thuoc/vi tri cac vung (avatar 52px, w-[320px] cho info panel,
// header 84px...) khop voi noi dung THAT se thay the, chi khac o cho dung
// khoi mau xam animate-pulse thay vi noi dung that.

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />;
}

// 1 hang trong danh sach hoi thoai (trai) - khop voi p-4/gap-3.5/avatar 52px
// cua hang that (xem MessagesShell.tsx).
export function ConversationRowSkeleton() {
  return (
    <div className="flex w-full gap-3.5 rounded-lg p-4">
      <div className="size-13 shrink-0 animate-pulse rounded-full bg-slate-200" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <Bar className="h-3.5 w-28" />
          <Bar className="h-2.5 w-10 shrink-0" />
        </div>
        <Bar className="mt-2 h-3 w-40" />
      </div>
    </div>
  );
}

// 1 bubble tin nhan gia - so le trai/phai giong phan bo that (mine/them).
function BubbleSkeleton({ mine, width }: { mine: boolean; width: string }) {
  return (
    <div className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`h-10 animate-pulse rounded-2xl bg-slate-200 ${width} ${mine ? "rounded-br-md" : "rounded-bl-md"}`}
      />
    </div>
  );
}

// Toan bo khung chat giua (header + noi dung tin nhan + thanh nhap) - khop
// chieu cao header 84px va bo cuc header/composer that (xem MessagesShell.tsx)
// de khi du lieu ve, chi phan NOI DUNG doi (skeleton -> bubble that), khong
// nhay ca cum header/composer tu "khong co" thanh "co".
export function ChatWindowSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="relative z-10 flex h-21 shrink-0 items-center gap-3.5 border-b border-slate-100 bg-white px-8 shadow-[0_3px_18px_rgba(15,23,42,.05)]">
        <div className="size-13 shrink-0 animate-pulse rounded-full bg-slate-200" />
        <div className="min-w-0 flex-1">
          <Bar className="h-4 w-32" />
          <Bar className="mt-2 h-3 w-20" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-8 py-6">
        <BubbleSkeleton mine={false} width="w-52" />
        <BubbleSkeleton mine={false} width="w-36" />
        <BubbleSkeleton mine={true} width="w-44" />
        <BubbleSkeleton mine={true} width="w-28" />
        <BubbleSkeleton mine={false} width="w-60" />
      </div>

      <div className="border-t border-slate-100 p-5">
        <div className="mx-auto h-13 max-w-[820px] animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

// Cot phai (thong tin nguoi dung) - khop w-[320px]/border-l/bg/p-5 cua
// MessageInfoPanel.tsx that, chi hien tu breakpoint xl giong panel that.
export function InfoPanelSkeleton() {
  return (
    <aside className="hidden w-[320px] shrink-0 flex-col items-center overflow-hidden border-l border-slate-200 bg-[#fbfbfc] p-5 xl:flex">
      <div className="size-20 animate-pulse rounded-full bg-slate-200" />
      <Bar className="mt-4 h-4 w-28" />
      <Bar className="mt-2 h-3 w-20" />
      <div className="mt-6 grid w-full grid-cols-3 gap-2">
        <Bar className="h-16 w-full" />
        <Bar className="h-16 w-full" />
        <Bar className="h-16 w-full" />
      </div>
      <div className="mt-6 w-full">
        <Bar className="h-3 w-16" />
        <Bar className="mt-2 h-3 w-full" />
      </div>
    </aside>
  );
}
