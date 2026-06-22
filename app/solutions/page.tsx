import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "End-to-end security & automation solutions from Axiozen — biometric access, CCTV, gate automation, security systems, web design, hosting, app development and attendance & payroll software.",
};

type Solution = {
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  desc: string;
  features: string[];
  cta: { label: string; href: string };
};

const SOLUTIONS: Solution[] = [
  {
    slug: "biometric",
    name: "Biometric Devices",
    icon: "fa-fingerprint",
    tagline: "Access & attendance",
    desc: "Face, fingerprint, palm and RFID terminals for secure access control and accurate time-attendance — from single-door setups to multi-site enterprise rollouts.",
    features: ["Face & fingerprint recognition", "RFID / card readers", "Cloud & on-prem attendance", "Multi-door access control"],
    cta: { label: "Browse biometric products", href: "/products/fingerprint" },
  },
  {
    slug: "cctv",
    name: "CCTV Surveillance",
    icon: "fa-video",
    tagline: "See everything",
    desc: "HD and 4K camera systems with network video recorders, remote viewing and analytics — designed, cabled and commissioned for full coverage.",
    features: ["HD / 4K IP & analog cameras", "NVR / DVR recording", "Mobile remote monitoring", "ANPR & motion analytics"],
    cta: { label: "Talk to us about CCTV", href: "/contact" },
  },
  {
    slug: "gate-automation",
    name: "Gate Automation",
    icon: "fa-road-barrier",
    tagline: "Controlled entry",
    desc: "Boom barriers, sliding gate motors, bollards and turnstiles that move traffic and people smoothly while keeping unauthorized vehicles out.",
    features: ["High-cycle boom barriers", "Flap & tripod turnstiles", "Sliding & swing gate motors", "Integrated with access control"],
    cta: { label: "Browse barriers & turnstiles", href: "/products/boom-barrier" },
  },
  {
    slug: "security",
    name: "Security Solutions",
    icon: "fa-shield-halved",
    tagline: "Protect the perimeter",
    desc: "Intrusion alarms, electromagnetic and hotel locks, metal detectors and integrated access control — a complete security layer for your premises.",
    features: ["Intrusion & alarm systems", "EM locks & hotel locks", "Metal detectors", "Integrated access control"],
    cta: { label: "Browse security products", href: "/products/access-control" },
  },
  {
    slug: "web-design",
    name: "Website Designing",
    icon: "fa-display",
    tagline: "Your digital front door",
    desc: "Fast, modern, responsive websites that look great on every device and turn visitors into enquiries — built to rank and built to convert.",
    features: ["Responsive, mobile-first design", "SEO-ready structure", "CMS & easy updates", "Performance optimized"],
    cta: { label: "Start a website project", href: "/contact" },
  },
  {
    slug: "hosting",
    name: "Hosting",
    icon: "fa-server",
    tagline: "Always online",
    desc: "Reliable managed hosting with strong uptime, backups and support — so your website and applications stay fast and available.",
    features: ["Managed hosting", "SSL & daily backups", "High uptime", "Email & domain setup"],
    cta: { label: "Ask about hosting", href: "/contact" },
  },
  {
    slug: "app-development",
    name: "App Development",
    icon: "fa-mobile-screen",
    tagline: "Custom software",
    desc: "Custom mobile and web applications tailored to your operations — from internal tools to customer-facing apps, designed and delivered end to end.",
    features: ["iOS & Android apps", "Web applications", "API & system integration", "Ongoing maintenance"],
    cta: { label: "Discuss your app", href: "/contact" },
  },
  {
    slug: "attendance-payroll",
    name: "Attendance & Payroll",
    icon: "fa-calendar-check",
    tagline: "Workforce, simplified",
    desc: "Attendance, HRMS and payroll software that connects directly to your biometric devices — automated timesheets, leave, and accurate payroll every cycle.",
    features: ["Biometric-linked attendance", "Leave & shift management", "Automated payroll", "HRMS & reports"],
    cta: { label: "Browse software solutions", href: "/products/software-solutions" },
  },
];

export default function SolutionsPage() {
  const telHref = `tel:${siteConfig.companyPhone.replace(/\s/g, "")}`;
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">Solutions</span>
          <h1 className="page-title">Everything you need to secure,<br /><span className="gradient-text">automate &amp; empower</span></h1>
          <p className="page-subtitle">
            Axiozen is a single partner across hardware and software — we survey, supply,
            install, integrate and support every system below.
          </p>
          <div className="hero-cta" style={{ marginTop: 26 }}>
            <Link href="/contact" className="btn btn-primary">Get a free consultation <i className="fas fa-arrow-right" style={{ fontSize: "0.8em" }} /></Link>
            <a href={telHref} className="btn btn-ghost"><i className="fas fa-phone" /> Call us</a>
          </div>
        </div>
      </section>

      {/* Quick nav chips */}
      <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
        {SOLUTIONS.map((s) => (
          <a key={s.slug} href={`#${s.slug}`} className="chip"><i className={`fas ${s.icon}`} /> {s.name}</a>
        ))}
      </div>

      {SOLUTIONS.map((s, idx) => (
        <section className={`section ${idx % 2 ? "alt" : ""}`} id={s.slug} key={s.slug} style={{ scrollMarginTop: 90 }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 40, alignItems: "center" }} className="sol-row">
              <div style={{ order: idx % 2 ? 2 : 1 }}>
                <div className="sol-ic" style={{ width: 56, height: 56, fontSize: "1.4rem" }}><i className={`fas ${s.icon}`} /></div>
                <span className="eyebrow" style={{ marginTop: 16 }}>{s.tagline}</span>
                <h2 className="section-title" style={{ marginTop: 6 }}>{s.name}</h2>
                <p className="section-subtitle" style={{ margin: "12px 0 0" }}>{s.desc}</p>
                <Link href={s.cta.href} className="btn btn-ghost" style={{ marginTop: 22 }}>{s.cta.label} <i className="fas fa-arrow-right" /></Link>
              </div>
              <div style={{ order: idx % 2 ? 1 : 2 }}>
                <div className="card-panel">
                  <div style={{ display: "grid", gap: 12 }}>
                    {s.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ width: 32, height: 32, borderRadius: 9, display: "grid", placeItems: "center", background: "rgba(34,211,238,0.12)", color: "var(--cyan)", flexShrink: 0 }}>
                          <i className="fas fa-check" />
                        </span>
                        <span style={{ fontWeight: 500 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>Not sure where to start?</h2>
            <p>Tell us about your premises and we&apos;ll recommend the right mix of systems.</p>
            <div className="cta-buttons">
              <Link href="/contact" className="btn btn-primary btn-lg">Get a free quote <i className="fas fa-arrow-right" style={{ fontSize: "0.8em" }} /></Link>
              <Link href="/products" className="btn btn-ghost btn-lg">Browse products</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
