import { createFileRoute } from "@tanstack/react-router";
import Greeting from "@/components/Chat/Greeting";
import { Button } from "@/components/ui/button";
import CreateRoomButton from "@/components/Chat/CreateRoomButton";

export const Route = createFileRoute("/_layout/_chat/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="relative h-full bg-background flex flex-col items-center justify-center gap-10">
      <Greeting />
      <div>
        <CreateRoomButton size={"sm"} variant={"default"}>
          Start Chatting
        </CreateRoomButton>

        <Button size={"sm"} variant="outline" className="ml-2">
          Learn More
        </Button>
      </div>
    </div>
  );
}
