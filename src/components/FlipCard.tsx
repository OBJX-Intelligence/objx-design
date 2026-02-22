import { useState } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import type { Project } from "@/hooks/useProjects";

interface FlipCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
}

export function FlipCard({ project, className, style }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={cn("group cursor-pointer", className)}
      style={{ perspective: "1000px", ...style }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
      aria-label={`${project.title} — click to see description`}
    >
      <div
        className={cn("flip-card-inner w-full", flipped && "flipped")}
        style={{ height: "100%" }}
      >
        {/* FRONT — image */}
        <div className="flip-card-front bg-card overflow-hidden">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-end justify-center bg-muted" />
          )}
          {/* Title overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-sm font-normal text-foreground/80 bg-background/0">
              {project.title}
            </p>
          </div>
        </div>

        {/* BACK — description */}
        <div className="flip-card-back bg-background p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xl font-light tracking-tight">{project.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="mt-6 space-y-1 border-t border-border/40 pt-4">
            {project.medium && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Medium</span> — {project.medium}
              </p>
            )}
            {project.category && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Category</span> — {project.category}
              </p>
            )}
            {project.year && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Year</span> — {project.year}
              </p>
            )}
            <a
              href="mailto:hello@objx.design"
              className="inline-block mt-3 text-xs underline underline-offset-2 hover:opacity-60 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              Commission similar work →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
