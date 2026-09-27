"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, LoaderCircle, Mountain, Pencil, Plus, Trash2, X } from "lucide-react";
import { trips } from "@/lib/trips";
import AdminShell from "@/components/AdminShell";

type ComponentType = "hero" | "trip-showcase" | "editorial" | "callout";
type HomeComponent = {
  _id: string;
  type: ComponentType;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  linkLabel: string;
  linkHref: string;
  tripSlugs: string[];
  enabled: boolean;
  order: number;
};

type ComponentForm = Omit<HomeComponent, "_id">;
const emptyForm: ComponentForm = { type: "hero", title: "", subtitle: "", body: "", image: "", linkLabel: "", linkHref: "", tripSlugs: [], enabled: true, order: 0 };
const componentLabels: Record<ComponentType, string> = { hero: "Hero", "trip-showcase": "Trip showcase", editorial: "Editorial feature", callout: "Inquiry callout" };

async function responseError(response: Response) {
  const data = await response.json().catch(() => null);
  return data?.error || "Something went wrong. Try again.";
}

export default function AdminComponentsPage() {
  const [components, setComponents] = useState<HomeComponent[]>([]);
  const [form, setForm] = useState<ComponentForm | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/components", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(await responseError(response));
        return response.json() as Promise<HomeComponent[]>;
      })
      .then((data) => { setComponents(data); setError(""); })
      .catch((cause: unknown) => { if (cause instanceof Error && cause.name !== "AbortError") setError(cause.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [refresh]);

  function startCreate() {
    setEditing(null);
    setForm({ ...emptyForm, order: components.length * 10 });
    setError("");
  }

  function startEdit(component: HomeComponent) {
    const { _id, ...editable } = component;
    setEditing(_id);
    setForm(editable);
    setError("");
  }

  async function saveComponent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(editing ? `/api/admin/components/${editing}` : "/api/admin/components", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(await responseError(response));
      setEditing(null);
      setRefresh((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save component.");
    } finally {
      setSaving(false);
    }
  }

  async function updateComponent(component: HomeComponent, changes: Partial<ComponentForm>) {
    const { _id, ...current } = component;
    const response = await fetch(`/api/admin/components/${_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...current, ...changes }),
    });
    if (!response.ok) setError(await responseError(response));
    else setRefresh((value) => value + 1);
  }

  async function moveComponent(component: HomeComponent, target: HomeComponent) {
    const updates = [
      { ...component, order: target.order },
      { ...target, order: component.order },
    ];
    const responses = await Promise.all(updates.map(({ _id, ...body }) => fetch(`/api/admin/components/${_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })));
    const failed = responses.find((response) => !response.ok);
    if (failed) setError(await responseError(failed));
    else setRefresh((value) => value + 1);
  }

  async function removeComponent(component: HomeComponent) {
    if (!window.confirm(`Delete the ${componentLabels[component.type]} section “${component.title}”?`)) return;
    const response = await fetch(`/api/admin/components/${component._id}`, { method: "DELETE" });
    if (!response.ok) setError(await responseError(response));
    else setRefresh((value) => value + 1);
  }

  return (
    <AdminShell>
      <div className="component-admin-layout">
        <section className="component-manager">
          <div className="component-page-heading"><div><p className="page-kicker">HOMEPAGE BUILDER</p><h1>Page sections</h1><p>Arrange and update the sections visitors see on your homepage.</p></div><button className="primary-button" onClick={startCreate}><Plus size={16} />Add section</button></div>
          {error && <p className="component-error" role="alert">{error}</p>}
          <div className="component-list">
            {loading ? <div className="table-message"><LoaderCircle className="spin" size={18} />Loading homepage sections</div> : components.length ? components.map((component, index) => <article className={`component-row ${component.enabled ? "" : "is-disabled"}`} key={component._id}><span className="component-order">{String(index + 1).padStart(2, "0")}</span>{component.image ? <span className="component-thumb" style={{ backgroundImage: `url("${component.image.replaceAll('"', "%22")}")` }} /> : <span className="component-thumb component-thumb-empty"><Mountain size={18} /></span>}<div className="component-summary"><span>{componentLabels[component.type]}{!component.enabled && <i>Hidden</i>}</span><strong>{component.title}</strong><small>Order {component.order}{component.type === "trip-showcase" ? ` · ${component.tripSlugs.length} trips selected` : ""}</small></div><div className="component-actions"><button title={component.enabled ? "Hide section" : "Show section"} aria-label={component.enabled ? `Hide ${component.title}` : `Show ${component.title}`} onClick={() => void updateComponent(component, { enabled: !component.enabled })}>{component.enabled ? <Eye size={16} /> : <EyeOff size={16} />}</button><button title="Move up" aria-label={`Move ${component.title} up`} disabled={index === 0} onClick={() => void moveComponent(component, components[index - 1])}><ArrowUp size={16} /></button><button title="Move down" aria-label={`Move ${component.title} down`} disabled={index === components.length - 1} onClick={() => void moveComponent(component, components[index + 1])}><ArrowDown size={16} /></button><button title="Edit section" aria-label={`Edit ${component.title}`} onClick={() => startEdit(component)}><Pencil size={15} /></button><button title="Delete section" aria-label={`Delete ${component.title}`} onClick={() => void removeComponent(component)}><Trash2 size={15} /></button></div></article>) : <div className="components-empty"><Mountain size={22} /><h2>No custom sections</h2><p>The homepage still has its built-in trip, trust and inquiry sections. Add a section to customize the page.</p><button className="secondary-button" onClick={startCreate}><Plus size={15} />Add the first section</button></div>}
          </div>
        </section>

        <aside className="component-editor">{form ? <><div className="component-editor-heading"><div><p className="page-kicker">{editing ? "EDIT SECTION" : "NEW SECTION"}</p><h2>{editing ? "Section details" : "Build a section"}</h2></div><button className="close-button" aria-label="Close editor" onClick={() => { setForm(null); setEditing(null); }}><X size={17} /></button></div><form className="component-form" onSubmit={saveComponent}><label>Layout<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ComponentType })}>{Object.entries(componentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Heading<input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Section heading" /></label><label>Eyebrow / short line<input maxLength={240} value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} placeholder="Optional introductory line" /></label><label>Body copy<textarea maxLength={1200} rows={4} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="A short description" /></label>{form.type !== "trip-showcase" && <label>Image URL<input type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="https://..." /></label>}{form.type === "trip-showcase" && <fieldset><legend>Trips to feature</legend>{trips.map((trip) => <label className="trip-choice" key={trip.slug}><input type="checkbox" checked={form.tripSlugs.includes(trip.slug)} onChange={(event) => setForm({ ...form, tripSlugs: event.target.checked ? [...form.tripSlugs, trip.slug] : form.tripSlugs.filter((slug) => slug !== trip.slug) })} /><span>{trip.title}</span></label>)}</fieldset>}<div className="form-pair"><label>Button label<input maxLength={40} value={form.linkLabel} onChange={(event) => setForm({ ...form, linkLabel: event.target.value })} placeholder="Explore" /></label><label>Button link<input value={form.linkHref} onChange={(event) => setForm({ ...form, linkHref: event.target.value })} placeholder="/trips" /></label></div><div className="form-pair"><label>Position<input type="number" min={0} max={10000} value={form.order} onChange={(event) => setForm({ ...form, order: Number(event.target.value) })} /></label><label className="component-enabled"><input type="checkbox" checked={form.enabled} onChange={(event) => setForm({ ...form, enabled: event.target.checked })} />Visible on website</label></div><div className="component-preview"><span>PREVIEW</span><strong>{form.title || "Section heading"}</strong>{form.subtitle && <small>{form.subtitle}</small>}{form.body && <p>{form.body}</p>}{form.image && <div style={{ backgroundImage: `url("${form.image.replaceAll('"', "%22")}")` }} />}</div>{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="spin" size={15} /> : null}{saving ? "Saving..." : editing ? "Save changes" : "Add section"}</button></form></> : <div className="component-empty-editor"><p className="page-kicker">HOMEPAGE BUILDER</p><h2>Select a section</h2><p>Choose a section to edit, or add a new one to customize the public homepage.</p></div>}</aside>
      </div>
    </AdminShell>
  );
}