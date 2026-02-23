import { motion } from "framer-motion";
import { GalleryGrid } from "@/components/GalleryGrid";
import { IntelligenceBridge } from "@/components/IntelligenceBridge";
import { useProjects } from "@/hooks/useProjects";

export function LandingPage() {
  const { featuredProjects, categories } = useProjects();
  const categoryDescriptions = new Map(
    categories.filter((c) => c.description).map((c) => [c.name, c.description])
  );

  return (
    <main>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 sm:px-10 py-24">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-tight max-w-3xl tracking-tight"
        >
          We design and build environments shaped by purpose and clarity.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 text-sm sm:text-base text-muted-foreground max-w-lg leading-relaxed"
        >
          Over 15 years of residential and commercial architecture rooted in San Diego.
          Full-service design - from first sketch through construction.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-4 text-xs text-muted-foreground/60 tracking-wider"
        >
          OBJX Design  |  Objective by Design
        </motion.p>
      </section>

      {/* ─── Gallery Snippet ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        <GalleryGrid projects={featuredProjects} showViewAll showCategory categoryDescriptions={categoryDescriptions} />
      </section>

      {/* ─── Intelligence Bridge ──────────────────────────── */}
      <IntelligenceBridge />

      {/* ─── What We Do + Contact ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left — what we do */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-8 h-px bg-foreground/30" />
            <h2 className="text-2xl sm:text-3xl font-light leading-snug">
              Design with clarity.<br />
              Build with intent.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              OBJX Design is a San Diego architecture and design practice specializing in
              residential renovations, ADUs, commercial interiors, and new construction.
              We handle the full scope - concept through project completion.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              For property owners exploring what's possible, we offer feasibility analysis,
              zoning review, and development consulting - powered by OBJX Intelligence.
            </p>
          </motion.div>

          {/* Right — contact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-6"
          >
            <div className="w-8 h-px bg-foreground/30" />
            <h2 className="text-2xl sm:text-3xl font-light">Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For project inquiries or to discuss your property - reach out directly.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:hello@objx.design"
                className="block text-sm text-foreground hover:opacity-60 transition-opacity underline underline-offset-4"
              >
                hello@objx.design
              </a>
              <a
                href="https://meetobjx.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-foreground hover:opacity-60 transition-opacity underline underline-offset-4"
              >
                meetobjx.com ↗
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
