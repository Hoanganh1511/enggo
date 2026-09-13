import Spinner from "@/components/ui/spinner";

export default function SeriesReadLoading() {
  return (
    <div className="flex h-full flex-1 items-center justify-center py-20">
      <Spinner size={24} />
    </div>
  );
}
