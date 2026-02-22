import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border/40">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="OBJX Design home">
          {/* OD marker — inline vector paths, no font dependency */}
          <svg viewBox="0 0 670 418" className="h-7 w-auto" aria-hidden="true">
            <path
              d="M469.17,387.86c197.59-3.35,255.49-266.78,77.64-352.72-49.54-28.33-184.42-13.7-239.49-17.09,9.12,5.13,25.92,16.67,33.92,23.35,7.95,6.77,22.19,21.4,28.74,29.48,34.76,1.97,116-5.88,147.81,9.27,46.49,18.18,80.28,64.68,83.19,114.51,3.89,55.61-31.21,110.94-83.2,131.09-31.43,15.17-113.6,7.54-147.81,9.28-16.27,20.21-39.98,40.2-62.66,52.83,24.99.82,134.6-.59,161.85,0Z"
              fill="#b3b3b3"
              fillRule="evenodd"
            />
            <path
              d="M215.03,387.59c137.83-7.05,219.96-161.93,148.43-279.97C287.87-18.48,98.69-8.23,37.2,125.31c-58.34,125.07,40.05,270.18,177.83,262.27M213.31,334.77c-94.76,6.98-167.03-92.47-131.09-180.44,40.36-102.83,185.62-111.97,238.54-15,46.66,82.77-12.55,190.5-107.45,195.44Z"
              fill="#1a1a1a"
              fillRule="evenodd"
            />
          </svg>
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
