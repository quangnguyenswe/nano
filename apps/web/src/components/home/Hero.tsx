import GridBackground from "./GridBackground";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative space-y-8 py-8 sm:space-y-16 sm:py-16 lg:py-24"
    >
      <GridBackground />
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-7 px-4 text-center sm:px-6 lg:px-8 pb-20">
        <div className="z-10">
          <Badge variant={"outline"} className="bg-primary-foreground">
            <span className="bg-primary text-primary-foreground rounded-full px-1.5">
              Beta
            </span>
            <span className="text-sm text-wrap">
              🎉 Client-first chat application
            </span>
          </Badge>
        </div>
        <h1 className="z-10 max-w-5xl font-bold text-4xl lg:text-6xl prose-highlighted lg:leading-[1.3]">
          Simple{" "}
          <em className="highlight highlight-green-200 highlight-spread-sm highlight-variant-1 dark:highlight-green-900 ">
            <strong>chat</strong>
          </em>
          , powerful features
        </h1>
        <p className="z-10 max-w-212 text-base lg:text-lg">
          Experience the future of chat with our intuitive interface and robust
          features.
        </p>
        <div className="z-10 flex flex-wrap justify-center gap-4">
          <Button>
            <Link to="/login">Get Started</Link>
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://github.com/tanstack/router"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Star className="size-4" />
              Github
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
