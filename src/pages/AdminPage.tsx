import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useProjects, type Project, type ProjectImage, type Category } from "@/hooks/useProjects";
import {
  Trash2,
  Plus,
  Download,
  Eye,
  EyeOff,
  Lock,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  ImageIcon,
  Crop,
  X,
} from "lucide-react";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "GOODtimes2025!";
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

/* ─── Image crop modal ───────────────────────────────── */
function ImageCropModal({
  image,
  onSave,
  onCancel,
}: {
  image: ProjectImage;
  onSave: (updated: ProjectImage) => void;
  onCancel: () => void;
}) {
  const [cropX, setCropX] = useState(image.cropX);
  const [cropY, setCropY] = useState(image.cropY);
  const [cropScale, setCropScale] = useState(image.cropScale);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const frameRef = useRef<HTMLDivElement>(null);

  const SENSITIVITY = 0.25;

  function startDrag(clientX: number, clientY: number) {
    dragging.current = true;
    lastPos.current = { x: clientX, y: clientY };
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!dragging.current) return;
    const dx = (clientX - lastPos.current.x) * SENSITIVITY;
    const dy = (clientY - lastPos.current.y) * SENSITIVITY;
    lastPos.current = { x: clientX, y: clientY };
    setCropX((v) => Math.max(0, Math.min(100, v - dx)));
    setCropY((v) => Math.max(0, Math.min(100, v - dy)));
  }

  function endDrag() {
    dragging.current = false;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm px-4">
      <div className="bg-background border border-border/60 p-6 space-y-5 w-full max-w-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Crop &amp; position</h3>
          <button onClick={onCancel} className="p-1 hover:bg-muted rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Drag to pan · Slider to zoom
        </p>

        {/* Crop preview frame — 4:5 aspect */}
        <div
          ref={frameRef}
          className="w-full overflow-hidden border border-border/40 select-none"
          style={{ aspectRatio: "4/5", cursor: dragging.current ? "grabbing" : "grab" }}
          onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
          onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => {
            e.preventDefault();
            moveDrag(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onTouchEnd={endDrag}
        >
          <img
            src={image.url}
            alt="Crop preview"
            className="w-full h-full pointer-events-none"
            style={{
              objectFit: "cover",
              objectPosition: `${cropX}% ${cropY}%`,
              transform: `scale(${cropScale})`,
              transformOrigin: "50% 50%",
            }}
            draggable={false}
          />
        </div>

        {/* Zoom slider */}
        <div className="space-y-1.5">
          <label htmlFor="crop-zoom" className="text-xs text-muted-foreground flex justify-between">
            <span>Zoom</span>
            <span>{cropScale.toFixed(2)}×</span>
          </label>
          <input
            id="crop-zoom"
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={cropScale}
            onChange={(e) => setCropScale(parseFloat(e.target.value))}
            className="w-full accent-foreground"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            size="sm"
            onClick={() => onSave({ ...image, cropX, cropY, cropScale })}
          >
            Apply
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setCropX(50);
              setCropY(50);
              setCropScale(1);
            }}
          >
            Reset
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="ml-auto">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Single image row within MultiImageEditor ───────── */
function ImageRow({
  image,
  index,
  isFirst,
  isLast,
  isPrimary,
  onCrop,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  image: ProjectImage;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isPrimary: boolean;
  onCrop: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border border-border/40 bg-card px-3 py-2">
      {/* Reorder */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-0.5 hover:bg-muted rounded disabled:opacity-20 disabled:cursor-not-allowed"
          title="Move up"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-0.5 hover:bg-muted rounded disabled:opacity-20 disabled:cursor-not-allowed"
          title="Move down"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Thumbnail */}
      <div className="w-14 h-14 shrink-0 overflow-hidden bg-muted border border-border/30">
        {image.url && (
          <img
            src={image.url}
            alt={`Image ${index + 1}`}
            className="w-full h-full object-cover"
            style={{ objectPosition: `${image.cropX}% ${image.cropY}%` }}
          />
        )}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">
          {image.url.startsWith("data:") ? "Uploaded image" : image.url || "No URL"}
        </p>
        {isPrimary && (
          <span className="text-xs text-foreground/50 border border-border/40 px-1.5 py-0.5 mt-0.5 inline-block">
            Primary
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={onCrop}
          className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-border/40 hover:border-foreground/30 transition-colors"
          title="Crop &amp; position"
        >
          <Crop className="w-3 h-3" />
          Crop
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 hover:bg-muted rounded transition-colors"
          title="Remove image"
        >
          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
        </button>
      </div>
    </div>
  );
}

/* ─── Add image sub-form (upload or URL) ─────────────── */
function AddImageForm({ onAdd }: { onAdd: (imgs: ProjectImage[]) => void }) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlValue, setUrlValue] = useState("");
  const [sizeWarning, setSizeWarning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setSizeWarning(files.some((f) => f.size > 800_000));
    const promises = files.map(
      (file) =>
        new Promise<ProjectImage>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const result = ev.target?.result;
            if (typeof result === "string") {
              resolve({ url: result, cropX: 50, cropY: 50, cropScale: 1 });
            }
          };
          reader.readAsDataURL(file);
        })
    );
    Promise.all(promises).then((imgs) => {
      onAdd(imgs);
      e.target.value = "";
    });
  }

  function handleUrl() {
    const url = urlValue.trim();
    if (!url) return;
    onAdd([{ url, cropX: 50, cropY: 50, cropScale: 1 }]);
    setUrlValue("");
  }

  return (
    <div className="border border-dashed border-border/50 p-3 space-y-2">
      <div className="flex items-center gap-1 border-b border-border/30">
        {(["upload", "url"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 text-xs transition-colors ${
              mode === m
                ? "text-foreground border-b-2 border-foreground -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "upload" ? "Upload" : "URL"}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 shrink-0" />
            Choose image(s) from device
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />
          {sizeWarning && (
            <p className="text-xs text-amber-600">Large image (&gt;800KB) may slow the site.</p>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="/images/project.jpg or https://..."
            className="text-xs h-8"
            onKeyDown={(e) => e.key === "Enter" && handleUrl()}
          />
          <Button type="button" size="sm" onClick={handleUrl} disabled={!urlValue.trim()}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── Multi-image editor ─────────────────────────────── */
function MultiImageEditor({
  images,
  onChange,
}: {
  images: ProjectImage[];
  onChange: (imgs: ProjectImage[]) => void;
}) {
  const [cropTarget, setCropTarget] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  function moveImage(idx: number, direction: "up" | "down") {
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;
    const updated = [...images];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    onChange(updated);
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function addImage(imgs: ProjectImage[]) {
    onChange([...images, ...imgs]);
    setShowAddForm(false);
  }

  function saveCrop(updated: ProjectImage) {
    if (cropTarget === null) return;
    const newImgs = images.map((img, i) => (i === cropTarget ? updated : img));
    onChange(newImgs);
    setCropTarget(null);
  }

  return (
    <div className="space-y-2">
      {images.length === 0 && (
        <p className="text-xs text-muted-foreground py-2">No images yet. Add one below.</p>
      )}

      {images.map((img, idx) => (
        <ImageRow
          key={idx}
          image={img}
          index={idx}
          isFirst={idx === 0}
          isLast={idx === images.length - 1}
          isPrimary={idx === 0}
          onCrop={() => setCropTarget(idx)}
          onRemove={() => removeImage(idx)}
          onMoveUp={() => moveImage(idx, "up")}
          onMoveDown={() => moveImage(idx, "down")}
        />
      ))}

      {showAddForm ? (
        <div className="space-y-2">
          <AddImageForm onAdd={addImage} />
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/40 px-3 py-2 w-full justify-center hover:border-foreground/30"
        >
          <Plus className="w-3.5 h-3.5" />
          Add image
        </button>
      )}

      {cropTarget !== null && images[cropTarget] && (
        <ImageCropModal
          image={images[cropTarget]}
          onSave={saveCrop}
          onCancel={() => setCropTarget(null)}
        />
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground/60">
          First image is shown in the gallery and on the card front.
        </p>
      )}
    </div>
  );
}

/* ─── Add / Edit form ───────────────────────────────── */
const BLANK: Omit<Project, "id" | "orderIndex" | "published"> = {
  title: "",
  description: "",
  imageUrl: "",
  images: [],
  category: "",
  medium: "",
  year: new Date().getFullYear().toString(),
};

function ProjectForm({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial?: Partial<Project>;
  categories: Category[];
  onSave: (data: Omit<Project, "id" | "orderIndex">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...BLANK, ...initial });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setImages(imgs: ProjectImage[]) {
    setForm((f) => ({ ...f, images: imgs, imageUrl: imgs[0]?.url ?? "" }));
  }

  return (
    <div className="border border-border/60 p-6 space-y-4 bg-card">
      <h3 className="text-sm font-medium">{initial?.id ? "Edit project" : "Add project"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Title *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Project title" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Year</label>
          <Input value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2025" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Practice Area</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            title="Practice Area"
            className="w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Select practice area</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Medium / Type</label>
          <Input value={form.medium} onChange={(e) => set("medium", e.target.value)} placeholder="ADU - New Construction" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Description</label>
          <textarea
            className="w-full border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            rows={3}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Brief description of this project..."
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-xs text-muted-foreground">Images</label>
          <MultiImageEditor images={form.images} onChange={setImages} />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          size="sm"
          onClick={() =>
            form.title.trim() && onSave({ ...form, published: initial?.published ?? true })
          }
          disabled={!form.title.trim()}
        >
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* ─── Main admin panel ──────────────────────────────── */
function AdminPanel() {
  const {
    projects,
    categories,
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
    saveError,
    clearSaveError,
  } = useProjects();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);

  function confirmSave(id: string) {
    setSavedId(id);
    setTimeout(() => setSavedId((cur) => (cur === id ? null : cur)), 2000);
  }

  async function handleDeployExport() {
    setExporting(true);
    try { await exportForDeploy(); } finally { setExporting(false); }
  }

  const sortedIds = [...projects]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((p) => p.id);

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-10 py-14 space-y-10">
      {/* Save error banner */}
      {saveError && (
        <div className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive flex items-start justify-between gap-4">
          <span>{saveError}</span>
          <button
            type="button"
            onClick={clearSaveError}
            className="shrink-0 hover:opacity-60 transition-opacity"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-light">Project Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} projects total</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 border border-border/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Site
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="/work"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 border border-border/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Work
            <ExternalLink className="w-3 h-3" />
          </a>
          <Button type="button" size="sm" variant="outline" onClick={handleDeployExport} disabled={exporting} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Packaging..." : "Deploy Package"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={exportJson} className="gap-1.5 text-muted-foreground">
            <Download className="w-3.5 h-3.5" />
            Raw JSON
          </Button>
          <Button type="button" size="sm" onClick={() => setAdding(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add project
          </Button>
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <ProjectForm
          categories={categories}
          onSave={(data) => {
            const newProject = addProject(data);
            setAdding(false);
            confirmSave(newProject.id);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {/* ─── Practice Areas management ─────────────────── */}
      <div className="border border-border/60 p-6 space-y-4 bg-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Practice Areas</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => { setAddingCategory(true); setNewCatName(""); setNewCatDesc(""); }}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add category
          </Button>
        </div>

        {/* Add category inline form */}
        {addingCategory && (
          <div className="flex flex-col sm:flex-row gap-2 border border-dashed border-border/50 p-3">
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name"
              className="text-xs h-8"
              autoFocus
            />
            <Input
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="Description (shown on landing hover)"
              className="text-xs h-8"
            />
            <div className="flex gap-1 shrink-0">
              <Button
                size="sm"
                disabled={!newCatName.trim()}
                onClick={() => {
                  addCategory(newCatName.trim(), newCatDesc.trim());
                  setAddingCategory(false);
                }}
              >
                Add
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAddingCategory(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Category rows */}
        <div className="space-y-1.5">
          {categories.map((cat, idx) => {
            const projectCount = projects.filter((p) => p.category === cat.name).length;
            const isEditing = editingCategoryId === cat.id;

            return (
              <div key={cat.id} className="flex items-center gap-3 border border-border/40 px-3 py-2">
                {/* Reorder arrows */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => reorderCategory(cat.id, "up")}
                    disabled={idx === 0}
                    className="p-0.5 hover:bg-muted rounded disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorderCategory(cat.id, "down")}
                    disabled={idx === categories.length - 1}
                    className="p-0.5 hover:bg-muted rounded disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Name + description */}
                {isEditing ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <Input
                      value={editCatName}
                      onChange={(e) => setEditCatName(e.target.value)}
                      placeholder="Category name"
                      className="text-xs h-8"
                      autoFocus
                    />
                    <Input
                      value={editCatDesc}
                      onChange={(e) => setEditCatDesc(e.target.value)}
                      placeholder="Description (optional)"
                      className="text-xs h-8"
                    />
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        disabled={!editCatName.trim()}
                        onClick={() => {
                          const nameChanged = editCatName.trim() !== cat.name;
                          updateCategory(
                            cat.id,
                            { name: editCatName.trim(), description: editCatDesc.trim() },
                            nameChanged // rename projects if name changed
                          );
                          setEditingCategoryId(null);
                        }}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCategoryId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{cat.name}</p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {projectCount} {projectCount === 1 ? "project" : "projects"}
                      </span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                    )}
                  </div>
                )}

                {/* Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(cat.id);
                        setEditCatName(cat.name);
                        setEditCatDesc(cat.description);
                      }}
                      className="p-1.5 hover:bg-muted rounded transition-colors text-xs text-muted-foreground hover:text-foreground"
                    >
                      Edit
                    </button>
                    {confirmDeleteCat === cat.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            deleteCategory(cat.id);
                            setConfirmDeleteCat(null);
                          }}
                          className="text-xs text-destructive hover:underline"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteCat(null)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteCat(cat.id)}
                        className="p-1.5 hover:bg-muted rounded transition-colors"
                        title={`Delete (${projectCount} projects use this)`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Project list */}
      <div className="space-y-2">
        {sortedIds.map((id, listIdx) => {
          const project = projects.find((p) => p.id === id)!;
          const isFirst = listIdx === 0;
          const isLast = listIdx === sortedIds.length - 1;
          const thumbUrl = project.images[0]?.url ?? project.imageUrl ?? "";

          return editingId === project.id ? (
            <ProjectForm
              key={project.id}
              initial={project}
              categories={categories}
              onSave={(data) => {
                updateProject(project.id, data);
                setEditingId(null);
                confirmSave(project.id);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={project.id}
              className="flex items-center gap-3 border border-border/40 bg-card px-4 py-3"
            >
              {/* Reorder */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  onClick={() => reorderProject(project.id, "up")}
                  disabled={isFirst}
                  className="p-0.5 hover:bg-muted rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => reorderProject(project.id, "down")}
                  disabled={isLast}
                  className="p-0.5 hover:bg-muted rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="w-12 h-12 shrink-0 bg-muted overflow-hidden">
                {thumbUrl && (
                  <img src={thumbUrl} alt={project.title} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{project.title}</p>
                  {savedId === project.id && (
                    <span className="text-xs text-green-600 shrink-0">Saved ✓</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {[project.category, project.medium, project.year].filter(Boolean).join(" · ")}
                  {project.images.length > 1 && (
                    <span className="ml-1 opacity-60">· {project.images.length} images</span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Publish toggle */}
                <button
                  onClick={() => updateProject(project.id, { published: !project.published })}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title={project.published ? "Hide from site" : "Show on site"}
                >
                  {project.published ? (
                    <Eye className="w-4 h-4 text-foreground/60" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {/* Landing page toggle */}
                <button
                  onClick={() =>
                    updateProject(project.id, {
                      showOnLanding: !(project.showOnLanding ?? false),
                    })
                  }
                  className={cn(
                    "px-2 py-1 text-xs border rounded transition-colors",
                    (project.showOnLanding ?? false)
                      ? "border-foreground/30 text-foreground/80 bg-foreground/5"
                      : "border-border/40 text-muted-foreground/50 hover:text-muted-foreground hover:border-border"
                  )}
                >
                  {(project.showOnLanding ?? false) ? "Landing: ON" : "Landing: OFF"}
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

              {/* Status badges */}
              {!project.published && (
                <span className="text-xs text-muted-foreground border border-border/40 px-2 py-0.5 shrink-0">
                  hidden
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground pt-4 border-t border-border/40">
        Changes auto-save to your browser. Click "Deploy Package" to download a ZIP.
        Unzip and copy <code className="bg-muted px-1">projects.json</code> to{" "}
        <code className="bg-muted px-1">src/data/</code> and{" "}
        <code className="bg-muted px-1">images/</code> to{" "}
        <code className="bg-muted px-1">public/images/</code>, then git push.
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
