import { motion } from "framer-motion";
import { GalleryGrid } from "@/components/GalleryGrid";
import { IntelligenceBridge } from "@/components/IntelligenceBridge";
import { useProjects } from "@/hooks/useProjects";

export function LandingPage() {
  const { publishedProjects } = useProjects();

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
          Every project is an opportunity to develop creative direction in response to our
          continuously evolving landscapes.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-4 text-xs text-muted-foreground/60 tracking-wider"
        >
          Objective By Design + OBJXIntelligence
        </motion.p>
      </section>

      {/* ─── Gallery Snippet ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 pb-24">
        <GalleryGrid projects={publishedProjects} limit={6} showViewAll />
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
              Custom environments,<br />
              composed with intention.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              OBJX Design creates original artworks and environmental installations for private
              collectors and commercial spaces. Each piece is developed through a process guided
              by both instinct and intelligence — exploring the intersection of material, form,
              and the spaces they inhabit.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Available for custom commissions, private collections, and collaborative projects
              that demand a distinctive creative voice.
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
              For custom paintings, commissions, or any questions — reach out directly.
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
