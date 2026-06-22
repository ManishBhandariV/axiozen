"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";

const SOLUTIONS = [
  ["Biometric Devices", "/solutions#biometric"],
  ["CCTV Surveillance", "/solutions#cctv"],
  ["Gate Automation", "/solutions#gate-automation"],
  ["Security Solutions", "/solutions#security"],
  ["Attendance & Payroll", "/solutions#attendance-payroll"],
];

const COMPANY = [
  ["Products", "/products"],
  ["Work", "/gallery"],
  ["Reviews", "/reviews"],
  ["Downloads", "/downloads"],
  ["Contact", "/contact"],
];

const SOCIAL: Array<[keyof typeof siteConfig.social, string, string]> = [
  ["facebook", "fa-facebook-f", "Facebook"],
  ["instagram", "fa-instagram", "Instagram"],
  ["linkedin", "fa-linkedin-in", "LinkedIn"],
  ["youtube", "fa-youtube", "YouTube"],
  ["x", "fa-x-twitter", "X (Twitter)"],
];

export function Footer() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/admin")) return null;

  const year = new Date().getFullYear();
  const telHref = `tel:${siteConfig.companyPhone.replace(/\s/g, "")}`;

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <Link href="/" className="brand" aria-label="Axiozen home">
              <span className="brand-mark"><i className="fas fa-shield-halved" /></span>
              <span><span className="b">AXIO</span><span className="z">ZEN</span></span>
            </Link>
            <p className="footer-about">
              Solutions that secure, automate &amp; empower. End-to-end security &amp;
              automation systems and workforce software for businesses across India.
            </p>
            <div className="footer-social">
              {SOCIAL.map(([key, icon, title]) => (
                <a key={key} href={siteConfig.social[key]} target="_blank" rel="noopener" title={title}>
                  <i className={`fab ${icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="footer-title">Solutions</h3>
            <ul className="footer-links">
              {SOLUTIONS.map(([label, href]) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="footer-title">Company</h3>
            <ul className="footer-links">
              {COMPANY.map(([label, href]) => (
                <li key={href}><Link href={href}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="footer-title">Get in touch</h3>
            <ul className="footer-contact">
              <li><i className="fas fa-location-dot" /><span>{siteConfig.companyAddress}</span></li>
              <li><i className="fas fa-phone" /><a href={telHref}>{siteConfig.companyPhone}</a></li>
              <li><i className="fas fa-envelope" /><a href={`mailto:${siteConfig.companyEmail}`}>{siteConfig.companyEmail}</a></li>
              <li><i className="fas fa-map" /><a href={siteConfig.googleMapsLink} target="_blank" rel="noopener">View on Google Maps</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© {year} {siteConfig.companyName}. All rights reserved.</div>
          <div>Solutions that secure, automate &amp; empower.</div>
        </div>
      </div>
    </footer>
  );
}
