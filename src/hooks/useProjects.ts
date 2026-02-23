import { useState, useEffect } from "react";
import { openDB } from "idb";
import projectData from "@/data/projects.json";

/* ─── Category system ──────────────────────────────── */

export interface Category {
  id: string;
  name: string;
  description: string;   // shown on landing hover overlay
  orderIndex: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "seed-1", name: "Missing Middle Residential", description: "", orderIndex: 1 },
  { id: "seed-2", name: "Custom Residential", description: "", orderIndex: 2 },
  { id: "seed-3", name: "Residential Interiors", description: "", orderIndex: 3 },
  { id: "seed-4", name: "Hospitality", description: "", orderIndex: 4 },
  { id: "seed-5", name: "Commercial Interiors", description: "", orderIndex: 5 },
  { id: "seed-6", name: "Conceptual Planning + Feasibility", description: "", orderIndex: 6 },
];

/* ─── Project types ────────────────────────────────── */

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
  showOnLanding?: boolean;  // undefined = false (must be explicitly enabled in admin)
}

/* ─── IndexedDB storage ──────────────────────────────── */

const DB_NAME = "objxdesign";
const DB_VERSION = 1;
const STORE = "projects";
const KEY = "all";
const CATEGORIES_KEY = "categories";
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

async function loadCategoriesFromDb(): Promise<Category[] | null> {
  try {
    const db = await getDb();
    const data = await db.get(STORE, CATEGORIES_KEY);
    return data ? (data as Category[]) : null;
  } catch {
    return null;
  }
}

async function saveCategoriesToDb(categories: Category[]): Promise<string | null> {
  try {
    const db = await getDb();
    await db.put(STORE, categories, CATEGORIES_KEY);
    return null;
  } catch {
    return "Failed to save categories.";
  }
}

/* ─── Migration helper ───────────────────────────────── */

const CATEGORY_MIGRATION: Record<string, string> = {
  Residential: "Custom Residential",
  Commercial: "Commercial Interiors",
  Consulting: "Conceptual Planning + Feasibility",
};

function migrateProject(p: any): Project {
  const out = { ...p };

  // Migrate legacy single-image to images array
  if (!out.images || out.images.length === 0) {
    out.images = out.imageUrl
      ? [{ url: out.imageUrl, cropX: 50, cropY: 50, cropScale: 1 }]
      : [];
  }

  // Migrate old category names to practice areas
  if (out.category && CATEGORY_MIGRATION[out.category]) {
    out.category = CATEGORY_MIGRATION[out.category];
  }

  // Default showOnLanding to false if missing
  if (out.showOnLanding === undefined) {
    out.showOnLanding = false;
  }

  return out as Project;
}

/* ─── Hook ───────────────────────────────────────────── */

export function useProjects() {
  // Start with JSON seed (synchronous) so the page renders immediately
  const [projects, setProjects] = useState<Project[]>(() =>
    (projectData as any[]).map(migrateProject)
  );
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [saveError, setSaveError] = useState<string | null>(null);

  // On mount: load from IndexedDB; migrate from localStorage if first run
  useEffect(() => {
    // Load projects
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

    // Load categories
    loadCategoriesFromDb().then((stored) => {
      if (stored && stored.length > 0) {
        setCategories(stored);
      } else {
        // First run: seed with defaults
        setCategories(DEFAULT_CATEGORIES);
        saveCategoriesToDb(DEFAULT_CATEGORIES);
      }
    });
  }, []);

  function save(updated: Project[]) {
    setProjects(updated);
    saveToDb(updated).then((err) => setSaveError(err));
  }

  function saveCateg(updated: Category[]) {
    setCategories(updated);
    saveCategoriesToDb(updated).then((err) => {
      if (err) setSaveError(err);
    });
  }

  function clearSaveError() {
    setSaveError(null);
  }

  const sortedCategories = [...categories].sort((a, b) => a.orderIndex - b.orderIndex);

  const publishedProjects = projects
    .filter((p) => p.published)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const featuredProjects = sortedCategories.map((cat) =>
    projects.find((p) => p.published && p.showOnLanding === true && p.category === cat.name)
  ).filter((p): p is Project => p !== undefined);

  /* ─── Project CRUD ─────────────────────────────────── */

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

  /* ─── Category CRUD ────────────────────────────────── */

  function addCategory(name: string, description: string = ""): Category {
    const newCat: Category = {
      id: Date.now().toString(),
      name,
      description,
      orderIndex: categories.length + 1,
    };
    saveCateg([...categories, newCat]);
    return newCat;
  }

  function updateCategory(id: string, updates: Partial<Omit<Category, "id">>, renameProjects?: boolean) {
    const old = categories.find((c) => c.id === id);
    if (renameProjects && old && updates.name && old.name !== updates.name) {
      // Batch-update all projects referencing the old category name
      save(projects.map((p) =>
        p.category === old.name ? { ...p, category: updates.name! } : p
      ));
    }
    saveCateg(categories.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }

  function deleteCategory(id: string) {
    saveCateg(categories.filter((c) => c.id !== id));
  }

  function reorderCategory(id: string, direction: "up" | "down") {
    const sorted = [...categories].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex((c) => c.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = categories.findIndex((c) => c.id === sorted[idx].id);
    const b = categories.findIndex((c) => c.id === sorted[swapIdx].id);
    const updated = categories.map((c) => ({ ...c }));
    [updated[a].orderIndex, updated[b].orderIndex] = [updated[b].orderIndex, updated[a].orderIndex];
    saveCateg(updated);
  }

  /* ─── Export ───────────────────────────────────────── */

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
    categories: sortedCategories,
    saveError,
    clearSaveError,
    addProject,
    updateProject,
    deleteProject,
    reorderProject,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategory,
    exportJson,
  };
}
