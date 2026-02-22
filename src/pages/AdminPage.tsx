import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjects, type Project } from "@/hooks/useProjects";
import { Trash2, Plus, Download, Eye, EyeOff, Lock } from "lucide-react";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "objxdesign2026";
const SESSION_KEY = "objxdesign_admin";

function isAuthed(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

/* ─── Login screen ──────────────────────────────────── */
function LoginScreen({ onAuth }: { onAuth: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onAuth();
    } else {
      setError(true);
      setValue("");
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-xs space-y-6">
        <div className="space-y-1">
          <Lock className="w-5 h-5 text-muted-foreground mb-3" />
          <h1 className="text-2xl font-light">Admin</h1>
          <p className="text-sm text-muted-foreground">OBJX Design project management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            placeholder="Password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            autoFocus
          />
          {error && <p className="text-xs text-destructive">Incorrect password</p>}
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </div>
    </div>
  );
}

/* ─── Add / Edit form ───────────────────────────────── */
const BLANK: Omit<Project, "id" | "orderIndex" | "published"> = {
  title: "",
  description: "",
  imageUrl: "",
  category: "",
  medium: "",
  year: new Date().getFullYear().toString(),
};

function ProjectForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<Project>;
  onSave: (data: Omit<Project, "id" | "orderIndex">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...BLANK, ...initial });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="border border-border/60 p-6 space-y-4 bg-card">
      <h3 className="text-sm font-medium">{initial?.id ? "Edit project" : "Add project"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Title *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Sand" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Year</label>
          <Input value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2025" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Image URL</label>
          <Input
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="/images/sand.jpg or https://..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Category</label>
          <Input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Painting" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Medium</label>
          <Input value={form.medium} onChange={(e) => set("medium", e.target.value)} placeholder="Oil on canvas" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Description</label>
          <textarea
            className="w-full border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A brief description of this work..."
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          size="sm"
          onClick={() =>
            form.title.trim() &&
            onSave({ ...form, published: initial?.published ?? true })
          }
          disabled={!form.title.trim()}
        >
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* ─── Main admin panel ──────────────────────────────── */
function AdminPanel() {
  const { projects, addProject, updateProject, deleteProject, exportJson } = useProjects();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-10 py-14 space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-light">Project Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} projects total</p>
        </div>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" onClick={exportJson} className="gap-2">
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </Button>
          <Button size="sm" onClick={() => setAdding(true)} className="gap-2">
            <Plus className="w-3.5 h-3.5" />
            Add project
          </Button>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <ProjectForm
          onSave={(data) => {
            addProject(data);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* Project list */}
      <div className="space-y-2">
        {projects.map((project) =>
          editingId === project.id ? (
            <ProjectForm
              key={project.id}
              initial={project}
              onSave={(data) => {
                updateProject(project.id, data);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={project.id}
              className="flex items-center gap-4 border border-border/40 bg-card px-4 py-3 group"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 shrink-0 bg-muted overflow-hidden">
                {project.imageUrl && (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{project.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[project.category, project.medium, project.year].filter(Boolean).join(" · ")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Publish toggle */}
                <button
                  onClick={() => updateProject(project.id, { published: !project.published })}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title={project.published ? "Unpublish" : "Publish"}
                >
                  {project.published ? (
                    <Eye className="w-4 h-4 text-foreground/60" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {/* Edit */}
                <button
                  onClick={() => setEditingId(project.id)}
                  className="p-1.5 hover:bg-muted rounded transition-colors text-xs text-muted-foreground hover:text-foreground"
                >
                  Edit
                </button>

                {/* Delete */}
                {confirmDelete === project.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        deleteProject(project.id);
                        setConfirmDelete(null);
                      }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(project.id)}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                )}
              </div>

              {/* Published badge */}
              {!project.published && (
                <span className="text-xs text-muted-foreground border border-border/40 px-2 py-0.5 shrink-0">
                  hidden
                </span>
              )}
            </div>
          ),
        )}
      </div>

      <p className="text-xs text-muted-foreground pt-4 border-t border-border/40">
        Changes are saved to your browser. Click "Export JSON" and replace{" "}
        <code className="bg-muted px-1">src/data/projects.json</code> to make them permanent.
      </p>
    </div>
  );
}

/* ─── Page root ─────────────────────────────────────── */
export function AdminPage() {
  const [authed, setAuthed] = useState(isAuthed);

  if (!authed) {
    return <LoginScreen onAuth={() => setAuthed(true)} />;
  }

  return <AdminPanel />;
}
