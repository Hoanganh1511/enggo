// Carousel ngang dung chung cho Featured/Trending Topics/Resources/Projects/
// Achievements - thuan CSS scroll-snap (keo/chuot ngang de cuon), khong con
// nut mui ten 2 ben (da bo theo yeu cau, chi con thao tac keo/scroll truc tiep).
export function HorizontalScroller({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1">
      {children}
    </div>
  );
}
