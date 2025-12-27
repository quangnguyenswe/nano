import Navigation from "@/components/Navigation";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}
