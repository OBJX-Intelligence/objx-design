import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border/40">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0" aria-label="OBJX Design home">
          {/* Full logo — inline SVG with vector paths + text using page Urbanist font */}
          <svg viewBox="0 0 2661 445" className="h-7 w-auto" aria-hidden="true">
            {/* D shape (gray) */}
            <path
              d="M462.83,394.12c197.59-3.35,255.49-266.78,77.64-352.72-49.54-28.33-184.42-13.7-239.49-17.09,9.12,5.13,25.92,16.67,33.92,23.35,7.95,6.77,22.19,21.4,28.74,29.48,34.76,1.97,116-5.88,147.81,9.27,46.49,18.18,80.28,64.68,83.19,114.51,3.89,55.61-31.21,110.94-83.2,131.09-31.43,15.17-113.6,7.54-147.81,9.28-16.27,20.21-39.98,40.2-62.66,52.83,24.99.82,134.6-.59,161.85,0Z"
              fill="#b3b3b3" fillRule="evenodd" stroke="#333" strokeMiterlimit="10"
            />
            {/* O circle (dark) */}
            <path
              d="M208.69,393.85c137.83-7.05,219.96-161.93,148.43-279.97C281.54-12.22,92.36-1.97,30.87,131.57c-58.34,125.07,40.05,270.18,177.83,262.27M206.98,341.03c-94.76,6.98-167.03-92.47-131.09-180.44,40.36-102.83,185.62-111.97,238.54-15,46.66,82.77-12.55,190.5-107.45,195.44Z"
              fill="#1a1a1a" fillRule="evenodd"
            />
            {/* Purple vertical line */}
            <path d="M736.44,25.08v369.08" stroke="#662d91" strokeWidth="4" fill="none" strokeMiterlimit="10" />
            {/* Small D marker (dark) */}
            <path
              d="M1750.54,347.25c167.65-6.51,167.55-246.99,0-253.45,0,0-110.92,0-110.92,0,6.24,3.52,17.76,11.43,23.24,16,5.45,4.64,15.21,14.67,19.7,20.21,17.1.98,74.85-2.23,90.49,2.84,78.37,19.49,92.14,128.64,21.09,167-25.8,16.92-82.39,9.82-111.59,11.2-11.15,13.85-27.4,27.56-42.94,36.21,17.13.56,92.25-.4,110.92,0Z"
              fill="#1a1a1a" fillRule="evenodd" stroke="#333" strokeMiterlimit="10" strokeWidth="2"
            />
            {/* OBJX (semibold gray) */}
            <text
              transform="translate(798.54 342.12)"
              fill="gray" fontFamily="Urbanist, sans-serif" fontWeight="600" fontSize="351.83"
            >
              <tspan x="0" y="0" letterSpacing="-0.06em">O</tspan>
              <tspan x="251.38" y="0" letterSpacing="-0.07em">B</tspan>
              <tspan x="428" y="0" letterSpacing="-0.05em">JX</tspan>
            </text>
            {/* esign (extralight dark) */}
            <text
              transform="translate(1894.08 342.25)"
              fill="#1a1a1a" fontFamily="Urbanist, sans-serif" fontWeight="200" fontSize="351.83" letterSpacing="-0.03em"
            >
              <tspan x="0" y="0">esign</tspan>
            </text>
          </svg>
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
