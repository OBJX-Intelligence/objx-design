import { motion } from "framer-motion";
import { FlipCard } from "@/components/FlipCard";
import { useProjects } from "@/hooks/useProjects";

export function WorkPage() {
  const { publishedProjects } = useProjects();

  return (
    <main className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight">Work</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hover or tap to see project details.
        </p>
      </motion.div>

      {/* 3-column flip card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedProjects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
          >
            <FlipCard project={project} />
          </motion.div>
        ))}
      </div>

      {publishedProjects.length === 0 && (
        <div className="text-center py-32 text-muted-foreground text-sm">
          No projects yet. Add some in the{" "}
          <a href="/admin" className="underline underline-offset-2 hover:opacity-60">
            admin portal
          </a>
          .
        </div>
      )}
    </main>
  );
}
