type SkeletonProps = {
  className?: string;
};

const Skeleton = ({ className = "h-4 w-full" }: SkeletonProps) => (
  <div className={`animate-pulse rounded-sm bg-border/60 ${className}`} />
);

export default Skeleton;
