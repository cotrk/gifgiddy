import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, UserRound } from "lucide-react";
import { Button } from "./ui/button";

export function AppNavigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <nav aria-label="Main navigation" className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link to="/" search={{}} className="rounded-md text-sm font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          GiddyGen
        </Link>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <Link to="/" search={{}} activeOptions={{ exact: true }} activeProps={{ className: "bg-accent text-accent-foreground", "aria-current": "page" }}>
              <Home aria-hidden="true" />
              Generator
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/feed" activeProps={{ className: "bg-accent text-accent-foreground", "aria-current": "page" }}>
              <LayoutGrid aria-hidden="true" />
              The Feed
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/giddy" activeProps={{ className: "bg-accent text-accent-foreground", "aria-current": "page" }}>
              <UserRound aria-hidden="true" />
              Giddy
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}