import Hero from "@/components/home/Hero";
import Navigation from "@/components/Navigation/Navigation";
import { createFileRoute } from "@tanstack/react-router";

// If user is authenticated, redirect to their latest chat or to create a new chat
// Otherwise, show the home page
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Navigation />
      <main className="flex flex-1 flex-col">
        <div className="mx-auto h-full w-full max-w-350 border-dashed min-[1400px]:border-x min-[1800px]:max-w-384">
          <Hero />
          <div className="flex flex-col gap-2xl md:gap-5xl">
            <section className="mx-auto px-4 sm:px-10">
              <div className="flex items-center justify-center">
                <figure>
                  <div className="overflow-hidden border-surface-low bg-surface-lowest p-md">
                    <img
                      src="https://excalidraw.nyc3.cdn.digitaloceanspaces.com/lp-cms/media/HP_hero_Excalidraw_editor_playground.png"
                      alt="Hero Image"
                      className="h-auto w-full object-cover object-center"
                    />
                  </div>
                </figure>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
