import { useState, useEffect, useRef } from "react";
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
  const [displayIdx, setDisplayIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-cycle images when not flipped and multiple images exist
  useEffect(() => {
    if (flipped || project.images.length <= 1) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setDisplayIdx((prev) => (prev + 1) % project.images.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [flipped, project.images.length]);

  // Sync thumbnail highlight with current display image when flipping to back
  useEffect(() => {
    if (flipped) setActiveIdx(displayIdx);
  }, [flipped, displayIdx]);

  return (
    <div className={cn("group", className)} style={style}>
      {/* 3D flip container */}
      <div
        className="cursor-pointer"
        style={{ perspective: "1000px" }}
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
          style={{ aspectRatio: "4/5" }}
        >
          {/* FRONT — image slideshow */}
          <div className="flip-card-front bg-card overflow-hidden relative">
            {project.images.length > 0 ? (
              project.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={idx === displayIdx ? project.title : ""}
                  className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
                  style={{
                    ...imageStyle(img),
                    opacity: idx === displayIdx ? 1 : 0,
                  }}
                  loading="lazy"
                />
              ))
            ) : (
              <div className="w-full h-full flex items-end justify-center bg-muted" />
            )}
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
                        setDisplayIdx(idx);
                        setActiveIdx(idx);
                        setFlipped(false); // flip back to front showing selected image
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

      {/* Title BELOW card */}
      <div className="mt-3">
        <p className="text-sm text-foreground/70 font-normal">{project.title}</p>
      </div>
    </div>
  );
}
