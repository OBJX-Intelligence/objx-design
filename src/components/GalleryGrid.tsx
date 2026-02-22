import { Link } from "react-router-dom";
import type { Project } from "@/hooks/useProjects";

interface GalleryGridProps {
  projects: Project[];
  limit?: number;
  showViewAll?: boolean;
}

export function GalleryGrid({ projects, limit, showViewAll = false }: GalleryGridProps) {
  const displayed = limit ? projects.slice(0, limit) : projects;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayed.map((project) => (
          <div key={project.id} className="group space-y-3">
            <div className="overflow-hidden bg-card aspect-[4/5]">
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">{project.title}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-foreground/70 font-normal">{project.title}</p>
          </div>
        ))}
      </div>

      {showViewAll && (
        <div className="text-center pt-4">
          <Link
            to="/work"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            See all work →
          </Link>
        </div>
      )}
    </div>
  );
}
