import { useState, useEffect } from "react";
import { openDB } from "idb";
import projectData from "@/data/projects.json";

export interface ProjectImage {
  url: string;
  cropX: number;    // 0–100, horizontal focus (default 50 = center)
  cropY: number;    // 0–100, vertical focus (default 50 = center)
  cropScale: number; // 1.0–3.0 zoom multiplier (default 1.0)
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;         // deprecated — kept for backwards compat (= images[0].url)
  images: ProjectImage[];   // primary field
  category: string;
  medium: string;
  year: string;
  orderIndex: number;
  published: boolean;
  showOnLanding?: boolean;  // undefined = true (shown on landing by default)
}

/* ─── IndexedDB storage ──────────────────────────────── */

const DB_NAME = "objxdesign";
const DB_VERSION = 1;
const STORE = "projects";
const KEY = "all";
const LS_KEY = "objxdesign_projects"; // legacy localStorage key — migrated on first load

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    },
  });
}

async function loadFromDb(): Promise<Project[] | null> {
  try {
    const db = await getDb();
    const data = await db.get(STORE, KEY);
    return data ? (data as any[]).map(migrateProject) : null;
  } catch {
    return null;
  }
}

async function saveToDb(projects: Project[]): Promise<string | null> {
  try {
    const db = await getDb();
    await db.put(STORE, projects, KEY);
    return null;
  } catch {
    return "Failed to save. Check browser storage settings.";
  }
}

/* ─── Migration helper ───────────────────────────────── */

function migrateProject(p: any): Project {
  if (!p.images || p.images.length === 0) {
    return {
      ...p,
      images: p.imageUrl
        ? [{ url: p.imageUrl, cropX: 50, cropY: 50, cropScale: 1 }]
        : [],
    };
  }
  return p as Project;
}

/* ─── Hook ───────────────────────────────────────────── */

export function useProjects() {
  // Start with JSON seed (synchronous) so the page renders immediately
  const [projects, setProjects] = useState<Project[]>(() =>
    (projectData as any[]).map(migrateProject)
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  // On mount: load from IndexedDB; migrate from localStorage if first run
  useEffect(() => {
    loadFromDb().then((stored) => {
      if (stored) {
        setProjects(stored);
      } else {
        // One-time migration from old localStorage data
        try {
          const lsRaw = localStorage.getItem(LS_KEY);
          if (lsRaw) {
            const migrated = (JSON.parse(lsRaw) as any[]).map(migrateProject);
            setProjects(migrated);
            saveToDb(migrated);
            localStorage.removeItem(LS_KEY);
          }
        } catch {
          // ignore — fall back to JSON seed
        }
      }
    });
  }, []);

  function save(updated: Project[]) {
    setProjects(updated);
    saveToDb(updated).then((err) => setSaveError(err));
  }

  function clearSaveError() {
    setSaveError(null);
  }

  const publishedProjects = projects
    .filter((p) => p.published)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const featuredProjects = projects
    .filter((p) => p.published && (p.showOnLanding ?? true))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  function addProject(project: Omit<Project, "id" | "orderIndex">): Project {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      orderIndex: projects.length + 1,
    };
    save([...projects, newProject]);
    return newProject;
  }

  function updateProject(id: string, updates: Partial<Project>) {
    save(projects.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }

  function deleteProject(id: string) {
    save(projects.filter((p) => p.id !== id));
  }

  function reorderProject(id: string, direction: "up" | "down") {
    const sorted = [...projects].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex((p) => p.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = projects.findIndex((p) => p.id === sorted[idx].id);
    const b = projects.findIndex((p) => p.id === sorted[swapIdx].id);
    const updated = projects.map((p) => ({ ...p }));
    [updated[a].orderIndex, updated[b].orderIndex] = [updated[b].orderIndex, updated[a].orderIndex];
    save(updated);
  }

  function exportJson(): void {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projects.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    projects,
    publishedProjects,
    featuredProjects,
    saveError,
    clearSaveError,
    addProject,
    updateProject,
    deleteProject,
    reorderProject,
    exportJson,
  };
}
