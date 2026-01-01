import { Spinner } from "./Spinner";

type LoadingPageProps = {
  initialMessage?: string;
};

export default function LoadingPage(props: LoadingPageProps) {
  const { initialMessage = "Loading" } = props;
  return (
    <div className="fixed left-0 top-0 z-100 flex h-full w-full items-center justify-center bg-white">
      <div className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-1">
        <Spinner className="h-4 w-4 text-blue-500" />
        <h1 className="ml-2 font-semibold">
          {initialMessage}
          <span className="animate-pulse">...</span>
        </h1>
      </div>
    </div>
  );
}
