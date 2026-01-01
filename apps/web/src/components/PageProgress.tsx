import { Spinner } from "./Spinner";
import { usePageProgressMessage } from "@/store/page";

export default function PageProgress() {
  const message = usePageProgressMessage();

  if (!message) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 z-100 flex h-full w-full items-center justify-center bg-white/70">
      <div className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-1">
        <Spinner className="h-4 w-4 text-blue-500" />
        <h1 className="ml-2 font-semibold">
          {message}
          <span className="animate-pulse">...</span>
        </h1>
      </div>
    </div>
  );
}
