import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Axiozen is a Mysuru-based security & automation company — biometric access, CCTV, gate automation, websites, hosting, apps and workforce software, delivered end-to-end.",
};

const VALUES = [
  { icon: "fa-handshake", title: "One accountable partner", desc: "We own the whole journey — survey, supply, installation, integration and support. No vendor finger-pointing." },
  { icon: "fa-shield-halved", title: "Genuine, warrantied hardware", desc: "Authorised partner for leading brands; every unit covered by manufacturer warranty." },
  { icon: "fa-headset", title: "Service that stays", desc: "Responsive after-sales support and AMC so your systems keep running long after install." },
  { icon: "fa-bolt", title: "Security + automation, together", desc: "From the camera at your gate to the payroll on your desk — one connected ecosystem." },
];

const FACTS: Array<[string, string, string]> = [
  ["fa-location-dot", "Address", siteConfig.companyAddress],
  ["fa-receipt", "GSTIN", siteConfig.companyGstin],
  ["fa-phone", "Phone", siteConfig.companyPhone],
  ["fa-envelope", "Email", siteConfig.companyEmail],
];

export default function AboutPage() {
  const telHref = `tel:${siteConfig.companyPhone.replace(/\s/g, "")}`;
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">About us</span>
          <h1 className="page-title">Securing &amp; automating businesses,<br /><span className="gradient-text">one partner for it all</span></h1>
          <p className="page-subtitle">
            Axiozen is a Mysuru-based technology company delivering security and automation
            systems — and the software that ties them together — to organisations across India.
          </p>
        </div>
      </section>

      {/* Story + facts */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="container">
          <div className="sol-row" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 40, alignItems: "start" }}>
            <div>
              <h2 className="section-title" style={{ fontSize: "1.7rem" }}>Who we are</h2>
              <p className="section-subtitle" style={{ margin: "14px 0 0" }}>
                We started Axiozen with a simple idea: businesses shouldn&apos;t need a different
                vendor for every lock, camera, gate and piece of software. They need one team that
                understands how it all fits together — and stands behind it.
              </p>
              <p className="section-subtitle" style={{ margin: "14px 0 0" }}>
                Today we design and deploy biometric access control, CCTV surveillance, gate
                automation, intrusion and security systems, and the attendance, payroll and HRMS
                software that runs on top of them. We also build the websites, hosting and custom
                apps that keep our customers&apos; businesses moving online.
              </p>
              <p className="section-subtitle" style={{ margin: "14px 0 0" }}>
                Every engagement is end-to-end: a proper site survey, the right genuine hardware,
                clean installation and integration, and support that doesn&apos;t disappear after
                handover.
              </p>
              <div className="hero-cta" style={{ marginTop: 26 }}>
                <Link href="/solutions" className="btn btn-primary">Explore our solutions <i className="fas fa-arrow-right" style={{ fontSize: "0.8em" }} /></Link>
                <Link href="/contact" className="btn btn-ghost">Get in touch</Link>
              </div>
            </div>

            <div className="card-panel">
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 16 }}>Company details</h3>
              <div style={{ display: "grid", gap: 14 }}>
                {FACTS.map(([icon, label, value]) => (
                  <div key={label} style={{ display: "flex", gap: 12 }}>
                    <span className="info-icon"><i className={`fas ${icon}`} /></span>
                    <div>
                      <div className="muted" style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: "0.92rem", fontWeight: 500 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section alt">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">What drives us</span>
            <h2 className="section-title">How we work</h2>
          </div>
          <div className="features-grid">
            {VALUES.map((v) => (
              <div className="feature-card" key={v.title}>
                <div className="feature-icon"><i className={`fas ${v.icon}`} /></div>
                <h3 className="feature-title">{v.title}</h3>
                <p className="feature-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Find us</span>
            <h2 className="section-title">Visit us in Mysuru</h2>
          </div>
          <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)" }}>
            <iframe src={siteConfig.googleMapsEmbed} width="100%" height={340} style={{ border: 0, display: "block", filter: "grayscale(0.3) contrast(1.05)" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <h2>Let&apos;s secure &amp; automate your business</h2>
            <p>Get a free site consultation and a no-obligation quote within 24 hours.</p>
            <div className="cta-buttons">
              <Link href="/contact" className="btn btn-primary btn-lg">Get a free quote <i className="fas fa-arrow-right" style={{ fontSize: "0.8em" }} /></Link>
              <a href={telHref} className="btn btn-ghost btn-lg"><i className="fas fa-phone" /> Call us</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
