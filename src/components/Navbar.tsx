import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border/40">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0" aria-label="OBJX Design home">
          <span className="text-xl tracking-tight leading-none">
            <span className="font-semibold text-foreground/50">OBJX</span>
            <span className="font-extralight text-foreground">Design</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/work"
            className={`transition-colors ${
              location.pathname === "/work"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Work
          </Link>
          <a
            href="https://meetobjx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Intelligence
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className="inline-block opacity-60"
            >
              <path
                d="M1 9L9 1M9 1H3M9 1V7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}
