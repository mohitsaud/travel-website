"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ExternalLink, LayoutDashboard, LayoutTemplate, LogOut, Mountain } from "lucide-react";
import type { ReactNode } from "react";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/login");
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin"><span className="admin-brand-icon"><Mountain size={19} /></span><span><strong>Himalaya</strong><small>CONTENT STUDIO</small></span></Link>
        <div className="admin-nav-label">WORKSPACE</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <Link className={pathname === "/admin/dashboard" ? "active" : ""} href="/admin/dashboard"><LayoutDashboard size={17} /><span>Dashboard</span></Link>
          <Link className={pathname === "/admin" ? "active" : ""} href="/admin"><BookOpen size={17} /><span>Blog posts</span></Link>
          <Link className={pathname.startsWith("/admin/components") ? "active" : ""} href="/admin/components"><LayoutTemplate size={17} /><span>Homepage sections</span></Link>
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/" target="_blank"><ExternalLink size={16} /><span>View website</span></Link>
          <button onClick={logout}><LogOut size={16} /><span>Sign out</span></button>
        </div>
      </aside>
      <section className="admin-main"><header className="admin-topbar"><span>{pathname === "/admin/dashboard" ? "Dashboard" : pathname.startsWith("/admin/components") ? "Homepage sections" : "Blog posts"}</span><Link href="/" target="_blank">Open website <ExternalLink size={13} /></Link></header>{children}</section>
    </main>
  );
}