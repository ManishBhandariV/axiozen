"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { productCategories, getCategoryUrl } from "@/lib/data/products";

const SOLUTIONS = [
  { slug: "biometric", name: "Biometric Devices", icon: "fa-fingerprint" },
  { slug: "cctv", name: "CCTV Surveillance", icon: "fa-video" },
  { slug: "gate-automation", name: "Gate Automation", icon: "fa-road-barrier" },
  { slug: "security", name: "Security Solutions", icon: "fa-shield-halved" },
  { slug: "web-design", name: "Website Designing", icon: "fa-display" },
  { slug: "hosting", name: "Hosting", icon: "fa-server" },
  { slug: "app-development", name: "App Development", icon: "fa-mobile-screen" },
  { slug: "attendance-payroll", name: "Attendance & Payroll", icon: "fa-calendar-check" },
];

const SOCIAL: Array<[keyof typeof siteConfig.social, string, string]> = [
  ["facebook", "fa-facebook-f", "Facebook"],
  ["instagram", "fa-instagram", "Instagram"],
  ["linkedin", "fa-linkedin-in", "LinkedIn"],
  ["youtube", "fa-youtube", "YouTube"],
  ["x", "fa-x-twitter", "X (Twitter)"],
];

function isActive(pathname: string, prefix: string): boolean {
  if (prefix === "/") return pathname === "/";
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function Header() {
  const pathname = usePathname() ?? "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  if (pathname.startsWith("/admin")) return null;

  const categoryEntries = Object.entries(productCategories);

  return (
    <>
      {/* Top bar */}
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-left">
            <a href={`mailto:${siteConfig.companyEmail}`}>
              <i className="fas fa-envelope" /> {siteConfig.companyEmail}
            </a>
            <a className="addr" href={`tel:${siteConfig.companyPhone.replace(/\s/g, "")}`}>
              <i className="fas fa-phone" /> {siteConfig.companyPhone}
            </a>
          </div>
          <div className="topbar-right">
            {SOCIAL.map(([key, icon, title]) => (
              <a key={key} href={siteConfig.social[key]} target="_blank" rel="noopener" title={title}>
                <i className={`fab ${icon}`} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="site-header">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="Axiozen home">
            <span className="brand-mark"><i className="fas fa-shield-halved" /></span>
            <span><span className="b">AXIO</span><span className="z">ZEN</span></span>
          </Link>

          {/* Live search */}
          <div className="search-bar">
            <form action="/search" method="GET" className="search-form">
              <input
                type="text" name="q" id="searchInput"
                placeholder="Search products…" className="search-input" autoComplete="off"
              />
              <button type="submit" className="search-btn" aria-label="Search">
                <i className="fas fa-search" />
              </button>
            </form>
            <div className="search-results" id="searchResults" />
          </div>

          {/* Desktop nav */}
          <nav className="nav-menu">
            <div className={`nav-item has-dropdown ${isActive(pathname, "/solutions") ? "active" : ""}`}>
              <Link href="/solutions" className="nav-link">
                Solutions <i className="fas fa-chevron-down caret" />
              </Link>
              <div className="dropdown">
                {SOLUTIONS.map((s) => (
                  <Link key={s.slug} href={`/solutions#${s.slug}`} className="dropdown-item">
                    <i className={`fas ${s.icon}`} /> {s.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className={`nav-item has-dropdown ${isActive(pathname, "/products") ? "active" : ""}`}>
              <Link href="/products" className="nav-link">
                Products <i className="fas fa-chevron-down caret" />
              </Link>
              <div className="dropdown mega">
                {categoryEntries.map(([slug, category]) => (
                  <Link key={slug} href={getCategoryUrl(slug)} className="dropdown-item">
                    <i className={`fas ${category.icon}`} /> {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className={`nav-item ${isActive(pathname, "/gallery") ? "active" : ""}`}>
              <Link href="/gallery" className="nav-link">Work</Link>
            </div>

            <div className={`nav-item has-dropdown ${isActive(pathname, "/downloads") || isActive(pathname, "/reviews") ? "active" : ""}`}>
              <span className="nav-link">Resources <i className="fas fa-chevron-down caret" /></span>
              <div className="dropdown">
                <Link href="/downloads" className="dropdown-item"><i className="fas fa-download" /> Downloads</Link>
                <Link href="/reviews" className="dropdown-item"><i className="fas fa-star" /> Reviews</Link>
              </div>
            </div>

            <div className={`nav-item ${isActive(pathname, "/contact") ? "active" : ""}`}>
              <Link href="/contact" className="nav-link">Contact</Link>
            </div>
          </nav>

          <div className="nav-actions">
            <Link href="/contact" className="btn btn-primary">
              <span className="label">Get a Quote</span>
              <i className="fas fa-arrow-right" style={{ fontSize: "0.8em" }} />
            </Link>
            <button
              className="icon-btn menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <i className={`fas ${mobileOpen ? "fa-xmark" : "fa-bars"}`} />
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className={`mobile-nav ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)}>
          <form action="/search" method="GET" className="search-form" style={{ marginBottom: 8 }}>
            <input type="text" name="q" placeholder="Search products…" className="search-input" autoComplete="off" />
            <button type="submit" className="search-btn" aria-label="Search"><i className="fas fa-search" /></button>
          </form>
          <Link href="/solutions">Solutions</Link>
          <Link href="/products">Products</Link>
          <Link href="/gallery">Work</Link>
          <div className="group-label">Resources</div>
          <Link href="/downloads">Downloads</Link>
          <Link href="/reviews">Reviews</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </header>
    </>
  );
}
