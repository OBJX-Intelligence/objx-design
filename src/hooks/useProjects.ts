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

/* ─── Deploy export helpers ──────────────────────────── */

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 60);
}

function getExtFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/(\w+);/);
  if (!match) return "jpg";
  return match[1] === "jpeg" ? "jpg" : match[1];
}

function base64ToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function imageFilename(project: Project, idx: number, dataUrl: string): string {
  return `${slugify(project.title)}-${project.id.slice(-4)}-${idx + 1}.${getExtFromDataUrl(dataUrl)}`;
}

/* ─── R2 API helpers ────────────────────────────────── */

const ADMIN_TOKEN_KEY = "objxdesign_admin_token";

function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

async function r2Fetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(path, options);
}

export async function uploadImageToR2(file: File, slug: string): Promise<string> {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated for R2");

  const form = new FormData();
  form.append("file", file);
  form.append("slug", slug);

  const res = await r2Fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error || "Upload failed");
  }

  const data = await res.json();
  return data.url;
}

async function publishDataToR2(
  projects: Project[],
  categories: Category[]
): Promise<void> {
  const token = getAdminToken();
  if (!token) throw new Error("Not authenticated for R2");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [projRes, catRes] = await Promise.all([
    r2Fetch("/api/projects", {
      method: "PUT",
      headers,
      body: JSON.stringify(projects),
    }),
    r2Fetch("/api/categories", {
      method: "PUT",
      headers,
      body: JSON.stringify(categories),
    }),
  ]);

  if (!projRes.ok) {
    const err = await projRes.json().catch(() => ({ error: "Save failed" }));
    throw new Error(err.error || "Failed to publish projects");
  }
  if (!catRes.ok) {
    const err = await catRes.json().catch(() => ({ error: "Save failed" }));
    throw new Error(err.error || "Failed to publish categories");
  }
}

async function fetchR2Projects(): Promise<Project[] | null> {
  try {
    const res = await r2Fetch("/api/projects");
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data.map(migrateProject);
  } catch {
    return null;
  }
}

async function fetchR2Categories(): Promise<Category[] | null> {
  try {
    const res = await r2Fetch("/api/categories");
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data;
  } catch {
    return null;
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

  // On mount: try R2 first (live published data), then IndexedDB (admin drafts), then static JSON
  useEffect(() => {
    async function loadData() {
      // 1. Try fetching from R2 (the live published data source)
      const [r2Projects, r2Categories] = await Promise.all([
        fetchR2Projects(),
        fetchR2Categories(),
      ]);

      if (r2Projects && r2Projects.length > 0) {
        // R2 has published data — use it as the source of truth
        setProjects(r2Projects);
        saveToDb(r2Projects); // cache locally
        if (r2Categories && r2Categories.length > 0) {
          setCategories(r2Categories);
          saveCategoriesToDb(r2Categories);
        }
        return;
      }

      // 2. No R2 data — fall back to IndexedDB (admin drafts or cached data)
      const stored = await loadFromDb();
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
          // ignore — fall back to JSON seed (already set as initial state)
        }
      }

      // Load categories from IndexedDB
      const storedCats = await loadCategoriesFromDb();
      if (storedCats && storedCats.length > 0) {
        setCategories(storedCats);
      } else {
        setCategories(DEFAULT_CATEGORIES);
        saveCategoriesToDb(DEFAULT_CATEGORIES);
      }
    }

    loadData();
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

  async function exportForDeploy(): Promise<void> {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const imagesFolder = zip.folder("images")!;

    const exportProjects = projects.map((p) => {
      const exportImages = p.images.map((img, idx) => {
        if (img.url.startsWith("data:")) {
          const filename = imageFilename(p, idx, img.url);
          imagesFolder.file(filename, base64ToBytes(img.url));
          return { ...img, url: `/images/${filename}` };
        }
        return img; // external URL or already a file path — pass through
      });
      return { ...p, images: exportImages, imageUrl: exportImages[0]?.url ?? "" };
    });

    zip.file("projects.json", JSON.stringify(exportProjects, null, 2));
    zip.file("categories.json", JSON.stringify(sortedCategories, null, 2));

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `objx-deploy-${new Date().toISOString().split("T")[0]}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ─── R2 Publish (direct save to live site) ────────── */

  async function publishToR2(): Promise<void> {
    // Upload any base64 images to R2 first
    const updatedProjects = await Promise.all(
      projects.map(async (p) => {
        const slug = slugify(p.title);
        const updatedImages = await Promise.all(
          p.images.map(async (img) => {
            if (img.url.startsWith("data:")) {
              // Convert base64 to File and upload
              const ext = getExtFromDataUrl(img.url);
              const bytes = base64ToBytes(img.url);
              const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;
              const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
              const file = new File([blob], `${Date.now()}.${ext}`, {
                type: blob.type,
              });
              const r2Url = await uploadImageToR2(file, slug);
              return { ...img, url: r2Url };
            }
            return img;
          })
        );
        return { ...p, images: updatedImages, imageUrl: updatedImages[0]?.url ?? "" };
      })
    );

    // Save updated projects to local state (base64 replaced with R2 URLs)
    save(updatedProjects);

    // Push data to R2
    await publishDataToR2(updatedProjects, categories);
  }

  async function syncFromR2(): Promise<{ projects: boolean; categories: boolean }> {
    const result = { projects: false, categories: false };
    const [r2Projects, r2Categories] = await Promise.all([
      fetchR2Projects(),
      fetchR2Categories(),
    ]);
    if (r2Projects) {
      setProjects(r2Projects);
      saveToDb(r2Projects);
      result.projects = true;
    }
    if (r2Categories) {
      setCategories(r2Categories);
      saveCategoriesToDb(r2Categories);
      result.categories = true;
    }
    return result;
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
    exportForDeploy,
    publishToR2,
    syncFromR2,
  };
}
