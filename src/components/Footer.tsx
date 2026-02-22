export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 mt-24">
      {/* Intelligence strip */}
      <div className="bg-foreground text-primary-foreground py-3">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 flex items-center justify-between text-xs">
          <span className="opacity-60">Built on OBJX Intelligence · Objective by Design + Intelligence</span>
          <a
            href="https://meetobjx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
          >
            meetobjx.com
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
              <path
                d="M1 9L9 1M9 1H3M9 1V7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium">OBJX Design</p>
          <p className="text-xs text-muted-foreground">
            Objective by Design. Environments shaped by purpose and clarity.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-1 text-xs text-muted-foreground">
          <a href="mailto:hello@objx.design" className="hover:text-foreground transition-colors">
            hello@objx.design
          </a>
          <span>© {year} OBJX Design. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
