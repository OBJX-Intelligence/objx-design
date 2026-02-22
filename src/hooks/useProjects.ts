import { useState, useEffect } from "react";
import projectData from "@/data/projects.json";

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  medium: string;
  year: string;
  orderIndex: number;
  published: boolean;
}

const STORAGE_KEY = "objxdesign_projects";

function loadProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fall through to default
  }
  return projectData as Project[];
}

function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);

  const publishedProjects = projects
    .filter((p) => p.published)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  function addProject(project: Omit<Project, "id" | "orderIndex">) {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      orderIndex: projects.length + 1,
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    saveProjects(updated);
    return newProject;
  }

  function updateProject(id: string, updates: Partial<Project>) {
    const updated = projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProjects(updated);
    saveProjects(updated);
  }

  function deleteProject(id: string) {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveProjects(updated);
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
    setProjects(updated);
    saveProjects(updated);
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

  return { projects, publishedProjects, addProject, updateProject, deleteProject, reorderProject, exportJson };
}
