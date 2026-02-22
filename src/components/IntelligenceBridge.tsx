import { motion } from "framer-motion";

export function IntelligenceBridge() {
  return (
    <section className="bg-foreground text-primary-foreground py-20 sm:py-28 relative overflow-hidden">
      {/* Watermark logo */}
      <img
        src="/logos/logo-marker-light.svg"
        alt=""
        className="absolute right-0 bottom-0 pointer-events-none select-none opacity-[0.06] w-[clamp(200px,35vw,450px)]"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 sm:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {/* Label */}
          <p className="text-xs font-medium tracking-widest uppercase opacity-50 mb-6">
            OBJX Intelligence
          </p>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-light leading-snug mb-6 opacity-90">
            Design practice, amplified by intelligence.
          </h2>

          {/* Body */}
          <p className="text-base opacity-60 leading-relaxed mb-10 max-w-lg">
            Every project benefits from integrated analysis - zoning feasibility, code compliance,
            and property intelligence built into our process from day one. Not bolted on. Built in.
          </p>

          {/* CTA */}
          <a
            href="https://meetobjx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-primary-foreground/30 text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
          >
            Learn more at meetobjx.com
            <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
              <path
                d="M1 9L9 1M9 1H3M9 1V7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
