import { useState } from "react";
import React from "react";
import { cn } from "@/lib/utils";
import type { Project, ProjectImage } from "@/hooks/useProjects";

interface FlipCardProps {
  project: Project;
  className?: string;
  style?: React.CSSProperties;
}

function imageStyle(img: ProjectImage): React.CSSProperties {
  return {
    objectFit: "cover",
    objectPosition: `${img.cropX ?? 50}% ${img.cropY ?? 50}%`,
    transform: `scale(${img.cropScale ?? 1})`,
    transformOrigin: "50% 50%",
  };
}

export function FlipCard({ project, className, style }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const primaryImg = project.images[0] ?? null;
  const primaryUrl = primaryImg?.url ?? project.imageUrl ?? "";

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
      aria-label={`${project.title} - click to see details`}
    >
      <div
        className={cn("flip-card-inner w-full", flipped && "flipped")}
        style={{ height: "100%" }}
      >
        {/* FRONT — primary image */}
        <div className="flip-card-front bg-card overflow-hidden">
          {primaryUrl ? (
            <img
              src={primaryUrl}
              alt={project.title}
              className="w-full h-full"
              style={primaryImg ? imageStyle(primaryImg) : { objectFit: "cover" }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-end justify-center bg-muted" />
          )}
          {/* Title overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-sm font-normal text-foreground/80">{project.title}</p>
          </div>
        </div>

        {/* BACK — details + optional image strip */}
        <div className="flip-card-back bg-background p-6 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3">
            {/* Image thumbnail strip (only when multiple images) */}
            {project.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {project.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIdx(idx);
                    }}
                    className={cn(
                      "shrink-0 w-14 h-14 overflow-hidden border transition-all",
                      activeIdx === idx
                        ? "border-foreground opacity-100"
                        : "border-border/40 opacity-50 hover:opacity-80"
                    )}
                    title={`Image ${idx + 1}`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ objectPosition: `${img.cropX ?? 50}% ${img.cropY ?? 50}%` }}
                    />
                  </button>
                ))}
              </div>
            )}

            <h3 className="text-xl font-light tracking-tight">{project.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="mt-6 space-y-1 border-t border-border/40 pt-4">
            {project.medium && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Medium</span> - {project.medium}
              </p>
            )}
            {project.category && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Category</span> - {project.category}
              </p>
            )}
            {project.year && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Year</span> - {project.year}
              </p>
            )}
            <a
              href="mailto:hello@objx.design"
              className="inline-block mt-3 text-xs underline underline-offset-2 hover:opacity-60 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              Inquire about this project →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
