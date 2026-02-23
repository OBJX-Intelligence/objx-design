import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlipCard } from "@/components/FlipCard";
import { useProjects } from "@/hooks/useProjects";

export function WorkPage() {
  const { publishedProjects, categories } = useProjects();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const displayed = selectedCategory
    ? publishedProjects.filter((p) => p.category === selectedCategory)
    : publishedProjects;

  return (
    <main className="max-w-6xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight">Work</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {selectedCategory
            ? `${displayed.length} ${selectedCategory} project${displayed.length !== 1 ? "s" : ""}`
            : `${displayed.length} projects`}
        </p>
      </motion.div>

      {/* Category filter bar */}
      <div className="mb-10 -mx-6 sm:mx-0 px-6 sm:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 sm:flex-wrap min-w-max sm:min-w-0">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground border border-border/40 hover:border-foreground/30"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.name ? null : cat.name)
              }
              className={`px-3 py-1.5 text-xs whitespace-nowrap transition-colors ${
                selectedCategory === cat.name
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground border border-border/40 hover:border-foreground/30"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3-column flip card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {displayed.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <FlipCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {displayed.length === 0 && (
        <div className="text-center py-32 text-muted-foreground text-sm">
          {selectedCategory
            ? `No ${selectedCategory} projects published yet.`
            : "No projects yet."}
        </div>
      )}
    </main>
  );
}
