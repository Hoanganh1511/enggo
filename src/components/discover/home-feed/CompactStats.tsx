import { Heart, MessageCircle } from "lucide-react";

// So lieu tuong tac RUT GON (chi doc, khong bam duoc) - dung cho cac card
// mat do cao (Featured/Resource/Project/Question), khac ActionBar.tsx (nut
// bam that, dung cho Latest Posts - noi doc chinh gan voi tuong tac).
export function CompactStats({
  likes,
  comments,
}: {
  likes: number;
  comments: number;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-ink-faint">
      <span className="flex items-center gap-1">
        <Heart size={13} strokeWidth={1.75} />
        {likes}
      </span>
      <span className="flex items-center gap-1">
        <MessageCircle size={13} strokeWidth={1.75} />
        {comments}
      </span>
    </div>
  );
}
