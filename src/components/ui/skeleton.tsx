type SkeletonProps = {
  className?: string;
};

const Skeleton = ({ className = "h-4 w-full" }: SkeletonProps) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export default Skeleton;
