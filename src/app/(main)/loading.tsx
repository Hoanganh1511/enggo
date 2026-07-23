import Spinner from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-full flex-1 items-center justify-center">
      <Spinner size={28} />
    </div>
  );
}
