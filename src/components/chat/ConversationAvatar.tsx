import Image from "next/image";

// Tach rieng file (truoc day dinh nghia cuc bo trong MessagesShell.tsx) -
// MessageBubble.tsx (hang tin nhan, avatar nho 34px) cung can dung lai
// component nay, khong duplicate logic fallback chu cai dau/online dot.
export function ConversationAvatar({
  name,
  avatarUrl,
  online,
  size = 52,
}: {
  name: string | undefined;
  avatarUrl: string | null | undefined;
  online?: boolean;
  size?: number;
}) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name ?? ""}
          width={size}
          height={size}
          className="shrink-0 rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <span
          className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
          style={{
            width: size,
            height: size,
            background: "var(--primary)",
            fontSize: Math.max(11, Math.round(size * 0.34)),
          }}
        >
          {(name ?? "?").trim().charAt(0).toUpperCase()}
        </span>
      )}
      {online && (
        <span
          className="absolute right-0 bottom-0 rounded-full bg-emerald-500 ring-2 ring-white"
          style={{ width: Math.max(8, Math.round(size * 0.23)), height: Math.max(8, Math.round(size * 0.23)) }}
        />
      )}
    </span>
  );
}
