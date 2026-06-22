import Link from "next/link";
import { BrandsSection } from "@/components/BrandsSection";
import { CustomersCarousel } from "@/components/CustomersCarousel";
import { siteConfig } from "@/lib/config";
import {
  productCategories,
  getCategoryUrl,
  getProductUrl,
} from "@/lib/data/products";
import { getCustomerLogos } from "@/lib/data/images";
import { loadProductMeta, sortByMeta, bestProductImage, displayName } from "@/lib/data/product-meta";
import { loadApprovedReviews } from "@/lib/data/reviews-server";
import { getGoogleReviews, getWriteReviewUrl } from "@/lib/data/google-reviews";
import { loadEffectiveCategories } from "@/lib/data/products-server";
import { loadProductImagesMap } from "@/lib/data/product-images-server";
import { loadFeaturedProductIds } from "@/lib/data/home-server";
import { loadGalleryImages } from "@/lib/data/gallery-server";

const SOLUTIONS = [
  { slug: "biometric", name: "Biometric Devices", icon: "fa-fingerprint", desc: "Face, fingerprint & RFID access and attendance terminals." },
  { slug: "cctv", name: "CCTV Surveillance", icon: "fa-video", desc: "HD/4K cameras, NVRs and remote monitoring setups." },
  { slug: "gate-automation", name: "Gate Automation", icon: "fa-road-barrier", desc: "Boom barriers, sliding gates, bollards & turnstiles." },
  { slug: "security", name: "Security Solutions", icon: "fa-shield-halved", desc: "Intrusion alarms, locks & integrated access control." },
  { slug: "web-design", name: "Website Designing", icon: "fa-display", desc: "Fast, modern, responsive sites that convert." },
  { slug: "hosting", name: "Hosting", icon: "fa-server", desc: "Reliable managed hosting with uptime you can trust." },
  { slug: "app-development", name: "App Development", icon: "fa-mobile-screen", desc: "Custom mobile & web apps for your operations." },
  { slug: "attendance-payroll", name: "Attendance & Payroll", icon: "fa-calendar-check", desc: "Workforce, HRMS & payroll software, end to end." },
];

const DEFAULT_FEATURED_CATEGORIES = [
  "fingerprint", "face", "boom-barrier", "turnstiles",
  "access-control", "fingerprint-door-lock", "metal-detectors", "software-solutions",
];

export default async function HomePage() {
  const meta = await loadProductMeta();
  const imagesMap = await loadProductImagesMap();
  const effective = await loadEffectiveCategories(meta);
  const customerLogos = getCustomerLogos();
  const reviews = await loadApprovedReviews(6);
  const { reviews: googleReviews, isReal: googleIsReal } = await getGoogleReviews();
  const writeReviewUrl = getWriteReviewUrl();
  const galleryImages = (await loadGalleryImages()).slice(0, 4);

  const totalProducts = Object.values(effective).reduce((n, c) => n + c.products.length, 0);

  // Featured products: admin-chosen if any, else first product of each default category.
  const featuredIds = await loadFeaturedProductIds();
  const featuredItems: Array<{ categorySlug: string; id: string; name: string; categoryName: string; short_desc: string }> = [];
  if (featuredIds.length > 0) {
    for (const fid of featuredIds) {
      for (const [slug, cat] of Object.entries(effective)) {
        const p = cat.products.find((x) => x.id === fid);
        if (p) {
          featuredItems.push({ categorySlug: slug, id: p.id, name: displayName(p, meta), categoryName: cat.name, short_desc: p.short_desc });
          break;
        }
      }
    }
  } else {
    for (const catSlug of DEFAULT_FEATURED_CATEGORIES) {
      const category = effective[catSlug];
      if (!category) continue;
      const p = sortByMeta(category.products, meta)[0];
      if (!p) continue;
      featuredItems.push({ categorySlug: catSlug, id: p.id, name: displayName(p, meta), categoryName: category.name, short_desc: p.short_desc });
    }
  }

  const heroTiles = featuredItems.slice(0, 4);
  const telHref = `tel:${siteConfig.companyPhone.replace(/\s/g, "")}`;

  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="eyebrow">Security · Automation · Trust</span>
            <h1 className="hero-title">
              Secure. Automate.<br /><span className="gradient-text">Empower.</span>
            </h1>
            <p className="hero-lead">
              Axiozen designs, installs and supports end-to-end security &amp; automation
              systems — biometric access, CCTV, gate automation and workforce software —
              for businesses across India.
            </p>
            <div className="hero-cta">
              <Link href="/contact" className="btn btn-primary btn-lg">
                Get a free consultation <i className="fas fa-arrow-right" style={{ fontSize: "0.8em" }} />
              </Link>
              <Link href="/products" className="btn btn-ghost btn-lg">Explore products</Link>
            </div>
            <div className="hero-stats">
              <div className="stat"><b className="gradient-text">{totalProducts}+</b><span>Products in catalogue</span></div>
              <div className="stat"><b className="gradient-text">24/7</b><span>Service &amp; support</span></div>
              <div className="stat"><b className="gradient-text">Pan-India</b><span>Delivery &amp; install</span></div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-frame">
              <div className="hero-frame-grid">
                {heroTiles.map((t) => (
                  <div className="hero-tile" key={t.id}>
                    <img src={bestProductImage(t.id, meta, imagesMap)} alt={t.name} />
                  </div>
                ))}
              </div>
            </div>
            <span className="hero-badge"><i className="fas fa-circle-check" /> Genuine · Warrantied · Installed</span>
          </div>
        </div>
      </section>

      {/* ===================== BRANDS MARQUEE ===================== */}
      <BrandsSection />

      {/* ===================== SOLUTIONS ===================== */}
      <section className="section" id="solutions">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">What we do</span>
            <h2 className="section-title">One partner for every layer of security &amp; automation</h2>
            <p className="section-subtitle">From the camera at your gate to the payroll on your desk — designed, deployed and supported by one team.</p>
          </div>
          <div className="sol-grid">
            {SOLUTIONS.map((s) => (
              <Link href={`/solutions#${s.slug}`} className="sol-card" key={s.slug}>
                <div className="sol-ic"><i className={`fas ${s.icon}`} /></div>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                <span className="more">Learn more <i className="fas fa-arrow-right" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED PRODUCTS ===================== */}
      <section className="section alt">
        <div className="container">
          <div className="section-header left" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: "none", gap: 20, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 560 }}>
              <span className="eyebrow">Catalogue</span>
              <h2 className="section-title">Featured products</h2>
              <p className="section-subtitle">A curated slice of {totalProducts}+ devices — browse the full catalogue by category.</p>
            </div>
            <Link href="/products" className="btn btn-ghost">View all products <i className="fas fa-arrow-right" /></Link>
          </div>
          <div className="products-grid">
            {featuredItems.map((item) => (
              <Link href={getProductUrl(item.categorySlug, item.id)} className="product-card" key={item.id}>
                <div className="product-image">
                  <img src={bestProductImage(item.id, meta, imagesMap)} alt={item.name} />
                  <div className="product-overlay"><span className="btn btn-primary">View Details</span></div>
                </div>
                <div className="product-info">
                  <span className="product-category">{item.categoryName}</span>
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-desc">{item.short_desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Browse</span>
            <h2 className="section-title">Shop by category</h2>
            <p className="section-subtitle">Find exactly what you need across {Object.keys(productCategories).length} product categories.</p>
          </div>
          <div className="categories-grid">
            {Object.entries(productCategories).map(([slug, category]) => (
              <Link key={slug} href={getCategoryUrl(slug)} className="category-card">
                <div className="category-icon"><i className={`fas ${category.icon}`} /></div>
                <div className="category-name">{category.name}</div>
                <span className="category-count">{category.products.length} products</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== WHY (BENTO) ===================== */}
      <section className="section alt">
        <div className="container">
          <div className="section-header left">
            <span className="eyebrow">Why Axiozen</span>
            <h2 className="section-title">Built for reliability, backed by people</h2>
          </div>
          <div className="bento">
            <div className="bento-item big">
              <div className="feature-icon"><i className="fas fa-shield-halved" /></div>
              <h3>End-to-end ownership</h3>
              <p>One accountable team from site survey and supply to installation, integration and lifetime AMC support — no finger-pointing between vendors.</p>
              <div style={{ marginTop: 22 }}>
                <span className="bento-num gradient-text">10+ yrs</span>
                <div className="muted" style={{ fontSize: "0.84rem" }}>of field deployments</div>
              </div>
            </div>
            <div className="bento-item"><div className="bento-num gradient-text">{totalProducts}+</div><p>Products across {Object.keys(productCategories).length} categories</p></div>
            <div className="bento-item"><div className="bento-num gradient-text">24/7</div><p>Service &amp; support desk</p></div>
            <div className="bento-item wide">
              <h3>Genuine, warrantied hardware</h3>
              <p>Authorised partner for leading manufacturers — every unit covered by manufacturer warranty and backed by on-ground service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WORK / GALLERY ===================== */}
      {galleryImages.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header left" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", maxWidth: "none", gap: 20, flexWrap: "wrap" }}>
              <div style={{ maxWidth: 560 }}>
                <span className="eyebrow">Our work</span>
                <h2 className="section-title">Installations &amp; projects</h2>
                <p className="section-subtitle">A look at deployments delivered across offices, factories and campuses.</p>
              </div>
              <Link href="/gallery" className="btn btn-ghost">Open gallery <i className="fas fa-arrow-right" /></Link>
            </div>
            <div className="products-grid">
              {galleryImages.map((g) => (
                <div className="product-card" key={g.id}>
                  <div className="product-image"><img src={g.image_url} alt={g.title} /></div>
                  <div className="product-info">
                    <h3 className="product-name">{g.title}</h3>
                    {g.location && <p className="product-desc"><i className="fas fa-location-dot" /> {g.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== REVIEWS ===================== */}
      {reviews.length > 0 && (
        <section className="section alt">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">Trusted by businesses</span>
              <h2 className="section-title">What our customers say</h2>
            </div>
            <div className="reviews-grid">
              {reviews.map((r, i) => (
                <div className="review-card" key={i}>
                  <div className="review-rating">
                    {Array.from({ length: 5 }).map((_, n) => (
                      <i key={n} className={`fas fa-star ${n < r.rating ? "filled" : "empty"}`} />
                    ))}
                  </div>
                  <p className="review-text">&quot;{r.review}&quot;</p>
                  <div className="review-author">
                    <div className="author-avatar">{r.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="author-name">{r.name}</div>
                      {(r.designation || r.company) && (
                        <div className="author-title">{[r.designation, r.company].filter(Boolean).join(", ")}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-cta"><Link href="/reviews" className="btn btn-ghost">View all reviews <i className="fas fa-arrow-right" /></Link></div>
          </div>
        </section>
      )}

      {/* ===================== CLIENTS ===================== */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Our clients</span>
            <h2 className="section-title">Proudly serving leading organizations</h2>
          </div>
          <CustomersCarousel logos={customerLogos} />
        </div>
      </section>

      {/* ===================== GOOGLE / MAP ===================== */}
      <section className="section alt">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Find us</span>
            <h2 className="section-title">Visit or review us on Google</h2>
          </div>
          {googleIsReal && (
            <div className="reviews-grid" style={{ marginBottom: 28 }}>
              {googleReviews.map((r, i) => (
                <div className="review-card" key={`${r.author_name}-${i}`}>
                  <div className="review-rating">{"★".repeat(r.rating)}</div>
                  <p className="review-text">{r.text}</p>
                  <div className="review-author">
                    <div className="author-avatar">{r.author_name.charAt(0).toUpperCase()}</div>
                    <div><div className="author-name">{r.author_name}</div><div className="author-title">{r.relative_time_description}</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)" }}>
            <iframe src={siteConfig.googleMapsEmbed} width="100%" height={340} style={{ border: 0, display: "block", filter: "grayscale(0.3) contrast(1.05)" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <div className="section-cta"><a href={writeReviewUrl} target="_blank" rel="noopener" className="btn btn-ghost"><i className="fab fa-google" /> Write a Google review</a></div>
        </div>
      </section>

      {/* ===================== CTA ===================== */}
      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>Ready to secure &amp; automate your premises?</h2>
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
