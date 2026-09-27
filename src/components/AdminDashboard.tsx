"use client";

import { Check, ChevronDown, Clock3, FileText, ImagePlus, LoaderCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import AdminShell from "@/components/AdminShell";

type Post = {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: "Draft" | "Published";
  cover: string;
  readTime: number;
  createdAt: string;
  updatedAt: string;
};

type PostForm = Omit<Post, "_id" | "createdAt" | "updatedAt">;
const blankForm: PostForm = { title: "", excerpt: "", content: "", category: "General", status: "Draft", cover: "", readTime: 4 };
const formatDate = (date: string) => new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));

async function readError(response: Response) {
  const body = await response.json().catch(() => null);
  return body?.error || "Something went wrong. Please try again.";
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All posts");
  const [category, setCategory] = useState("All categories");
  const [modal, setModal] = useState<"create" | "edit" | "view" | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [form, setForm] = useState<PostForm>(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState("");
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const parameters = new URLSearchParams();
    if (query.trim()) parameters.set("q", query.trim());
    if (status !== "All posts") parameters.set("status", status);
    if (category !== "All categories") parameters.set("category", category);
    fetch(`/api/admin/posts?${parameters}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(await readError(response));
        return response.json() as Promise<Post[]>;
      })
      .then((data) => { setPosts(data); setError(""); })
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name !== "AbortError") setError(cause.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query, status, category, refreshKey]);

  const categories = useMemo(() => [...new Set(posts.map((post) => post.category))].sort(), [posts]);
  const publishedCount = posts.filter((post) => post.status === "Published").length;
  const draftCount = posts.filter((post) => post.status === "Draft").length;

  function openCreate() {
    setForm(blankForm);
    setActivePost(null);
    setUploadPreview("");
    setModal("create");
  }

  function openEdit(post: Post) {
    setActivePost(post);
    setUploadPreview("");
    setForm({ title: post.title, excerpt: post.excerpt, content: post.content, category: post.category, status: post.status, cover: post.cover, readTime: post.readTime });
    setModal("edit");
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(activePost ? `/api/admin/posts/${activePost._id}` : "/api/admin/posts", {
        method: activePost ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(await readError(response));
      setModal(null);
      setRefreshKey((key) => key + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save this post.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadCover(file: File | undefined) {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.set("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body: data });
      if (!response.ok) throw new Error(await readError(response));
      const result = await response.json() as { url: string };
      setForm((current) => ({ ...current, cover: result.url }));
      setUploadPreview("");
    } catch (cause) {
      setUploadPreview("");
      setError(cause instanceof Error ? cause.message : "Unable to upload this image.");
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploading(false);
    }
  }

  async function deletePost(post: Post) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/posts/${post._id}`, { method: "DELETE" });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    setModal(null);
    setRefreshKey((key) => key + 1);
  }

  const databaseUnavailable = error.includes("MONGODB_URI");

  return (
    <AdminShell>
      <div className="workspace">
        <section className="page-title-row">
          <div><p className="page-kicker">CONTENT MANAGEMENT</p><h1>Posts</h1><p className="page-description">Create and manage your blog posts.</p></div>
          <button className="primary-button" onClick={openCreate}><Plus size={16} />New post</button>
        </section>

        {databaseUnavailable && <section className="connection-notice" role="status"><div className="connection-indicator" /><div><strong>Database not configured</strong><p>Add <code>MONGODB_URI</code> to <code>.env.local</code>, then restart the app to load and save posts.</p></div></section>}
        {error && !databaseUnavailable && <section className="connection-notice connection-error" role="alert"><div className="connection-indicator" /><div><strong>Could not load posts</strong><p>{error}</p><button className="inline-action" onClick={() => setRefreshKey((key) => key + 1)}>Try again</button></div></section>}

        <section className="post-workspace" id="posts" aria-label="Blog posts">
          <div className="list-toolbar">
            <div className="post-count"><strong>{posts.length}</strong> {posts.length === 1 ? "post" : "posts"}<span className="count-breakdown">{publishedCount} published <i /> {draftCount} drafts</span></div>
            <div className="list-controls">
              <label className="search-control"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts" aria-label="Search posts" /></label>
              <label className="filter-control"><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All posts</option><option>Published</option><option>Draft</option></select><ChevronDown size={14} /></label>
              {categories.length > 0 && <label className="filter-control category-filter"><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option>All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>}
            </div>
          </div>

          <div className="posts-table">
            <div className="table-header"><span>Title</span><span>Category</span><span>Status</span><span>Updated</span><span /></div>
            {loading && posts.length === 0 && !error ? <div className="table-message"><LoaderCircle className="spin" size={18} />Loading posts</div> : posts.length > 0 ? posts.map((post) => (
              <article className="post-row" key={post._id}>
                <button className="post-title-cell" onClick={() => { setActivePost(post); setModal("view"); }}><span className={`post-file-icon ${post.cover ? "has-cover" : ""}`} style={post.cover ? { backgroundImage: `url("${post.cover.replaceAll('"', "%22")}")` } : undefined}>{!post.cover && <FileText size={17} />}</span><span><strong>{post.title}</strong><small>{post.excerpt}</small></span></button>
                <span className="post-category">{post.category}</span>
                <span><span className={`post-status ${post.status.toLowerCase()}`}><i />{post.status}</span></span>
                <span className="post-date"><Clock3 size={14} />{formatDate(post.updatedAt)}</span>
                <div className="post-actions"><button title="Edit post" aria-label={`Edit ${post.title}`} onClick={() => openEdit(post)}><Pencil size={15} /></button><button title="Delete post" aria-label={`Delete ${post.title}`} onClick={() => deletePost(post)}><Trash2 size={15} /></button></div>
              </article>
            )) : error ? <div className="table-message">{databaseUnavailable ? "Posts will appear here after the database is connected." : "Posts could not be loaded."}</div> : <div className="empty-state"><div className="empty-symbol"><FileText size={21} /></div><h2>{query || status !== "All posts" || category !== "All categories" ? "No matching posts" : "No posts yet"}</h2><p>{query || status !== "All posts" || category !== "All categories" ? "Adjust the search or filters and try again." : "Create a post to get started."}</p>{!query && status === "All posts" && category === "All categories" && <button className="secondary-button" onClick={openCreate}><Plus size={15} />Create your first post</button>}</div>}
          </div>
          <footer className="list-footer"><span>{posts.length ? `Showing ${posts.length} ${posts.length === 1 ? "post" : "posts"}` : ""}</span><button onClick={() => setRefreshKey((key) => key + 1)} disabled={loading}><span className={loading ? "spin" : ""}>↻</span>Refresh</button></footer>
        </section>
      </div>

      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header className="modal-header"><div><p>{modal === "view" ? activePost?.status : modal === "edit" ? "EDIT POST" : "NEW POST"}</p><h2 id="modal-title">{modal === "view" ? activePost?.title : modal === "edit" ? "Edit post" : "Create a post"}</h2></div><button className="close-button" aria-label="Close" onClick={() => setModal(null)}><X size={19} /></button></header>
        {modal === "view" && activePost ? <div className="preview-content">{activePost.cover && <div className="published-cover-preview" role="img" aria-label="Post cover image" style={{ backgroundImage: `url("${activePost.cover.replaceAll('"', "%22")}")` }} />}<div className="preview-meta">{activePost.category} <span /> {formatDate(activePost.createdAt)} <span /> {activePost.readTime} min read</div><p className="preview-excerpt">{activePost.excerpt}</p><div className="preview-body" dangerouslySetInnerHTML={{ __html: activePost.content }} /><div className="modal-actions"><button className="secondary-button" onClick={() => openEdit(activePost)}><Pencil size={15} />Edit post</button><button className="delete-button" onClick={() => deletePost(activePost)}><Trash2 size={15} />Delete</button></div></div> : <form className="post-form" onSubmit={savePost}>
          <label>Title<input required maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Post title" /></label>
          <label>Excerpt<textarea required maxLength={240} rows={2} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} placeholder="A short summary" /></label>
          <label>Content<RichTextEditor value={form.content} onChange={(content) => setForm((current) => ({ ...current, content }))} /></label>
          <div className="form-grid"><label>Category<input required maxLength={40} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="General" /></label><label>Reading time (minutes)<input type="number" min={1} max={60} value={form.readTime} onChange={(event) => setForm({ ...form, readTime: Number(event.target.value) })} /></label></div>
          <div className="cover-field"><span className="cover-label">Cover image</span><div className="cover-upload-row">{(uploadPreview || form.cover) && <div className={`cover-preview ${uploading ? "is-uploading" : ""}`} role="img" aria-label={uploading ? "Image preview while uploading" : "Selected cover preview"} style={{ backgroundImage: `url("${(uploadPreview || form.cover).replaceAll('"', "%22")}")` }}>{uploading && <span className="uploading-indicator"><LoaderCircle size={14} />Uploading</span>}</div>}<label className="secondary-button upload-button"><ImagePlus size={15} />{uploading ? "Uploading..." : form.cover ? "Replace image" : "Choose image"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(event) => { void uploadCover(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>{form.cover && <button type="button" className="remove-cover" onClick={() => setForm((current) => ({ ...current, cover: "" }))}>Remove</button>}</div><label className="cover-url-label">Or use an image URL<input type="url" value={form.cover.startsWith("/uploads/") ? "" : form.cover} onChange={(event) => setForm({ ...form, cover: event.target.value })} placeholder="https://..." /></label><small className="cover-help">PNG, JPEG or WebP. Maximum 5 MB.</small></div>
          <label className="status-field">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PostForm["status"] })}><option>Draft</option><option>Published</option></select></label>
          {error && <p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="spin" size={16} /> : form.status === "Published" ? <Check size={16} /> : <FileText size={16} />}{saving ? "Saving..." : form.status === "Published" ? "Publish" : "Save draft"}</button></div>
        </form>}</section></div>}
    </AdminShell>
  );
}