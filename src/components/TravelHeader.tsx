"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, Mountain, X } from "lucide-react";

const navItems = [
  { label: "Trekking", href: "/trips" },
  { label: "Tours", href: "/trips?style=Culture" },
  { label: "Destinations", href: "#destinations" },
  { label: "About", href: "#about" },
];

export default function TravelHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="travel-header">
      <Link className="travel-brand" href="/" onClick={() => setMenuOpen(false)}>
        <span className="brand-emblem"><Mountain size={21} /></span>
        <span><strong>Himalaya</strong><small>TRAVEL COMPANY · NEPAL</small></span>
      </Link>
      <nav className="travel-nav" aria-label="Main navigation">
        {navItems.map((item) => <Link href={item.href} key={item.label}>{item.label}</Link>)}
      </nav>
      <div className="travel-header-actions">
        <Link className="header-inquiry" href="/plan-your-trip">Plan your trip <ArrowUpRight size={15} /></Link>
        <button className="mobile-menu-toggle" type="button" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-travel-nav" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {menuOpen && <nav className="mobile-travel-nav" id="mobile-travel-nav" aria-label="Mobile navigation">{navItems.map((item) => <Link href={item.href} key={item.label} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight size={15} /></Link>)}</nav>}
    </header>
  );
}