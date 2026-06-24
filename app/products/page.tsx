import Link from "next/link";
import { siteConfig } from "@/lib/config";
import {
  productCategories,
  getCategoryUrl,
  getProductUrl,
  type Product,
} from "@/lib/data/products";
import { loadEffectiveCategories } from "@/lib/data/products-server";
import { loadEffectiveBrands } from "@/lib/data/brands-effective";
import { loadProductImagesMap } from "@/lib/data/product-images-server";
import {
  loadProductMeta,
  sortByMeta,
  getBrandFor,
  bestProductImage,
  displayName,
} from "@/lib/data/product-meta";

type SP = { brand?: string };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }) {
  const { brand } = await searchParams;
  if (!brand) return { title: "All Products" };
  const brands = await loadEffectiveBrands();
  const b = brands.find((x) => x.slug === brand);
  return { title: b ? `${b.name} Products` : "All Products" };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const { brand } = await searchParams;
  const telHref = `tel:${siteConfig.companyPhone.replace(/\s/g, "")}`;
  const meta = await loadProductMeta();
  const effective = await loadEffectiveCategories(meta);
  const brandList = await loadEffectiveBrands();
  const imagesMap = await loadProductImagesMap();
  const selectedBrand = brand ? brandList.find((x) => x.slug === brand) : undefined;
  const total = Object.values(effective).reduce((s, c) => s + c.products.length, 0);

  const categoriesView = Object.entries(effective).map(([slug, cat]) => {
    const filtered: Product[] = selectedBrand
      ? cat.products.filter((p) => getBrandFor(p.id, meta) === selectedBrand.name)
      : cat.products;
    return { slug, cat, products: sortByMeta(filtered, meta) };
  });
  const visibleCategories = categoriesView.filter((c) => !selectedBrand || c.products.length > 0);
  const totalFiltered = categoriesView.reduce((s, c) => s + c.products.length, 0);

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <h1 className="page-title">{selectedBrand ? `${selectedBrand.name} Products` : "All Products"}</h1>
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            {selectedBrand ? (
              <>
                <Link href="/products">Products</Link>
                <span className="sep">/</span>
                <span>{selectedBrand.name}</span>
              </>
            ) : (
              <span>Products</span>
            )}
          </nav>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 18 }}>
        <div className="container">
          {/* ---- Filter bars (replaces the old sidebar) ---- */}
          <div className="filter-stack">
            <div className="filter-bar">
              <span className="filter-label">Categories</span>
              <div className="filter-chips">
                <a href="#all" className="chip">All</a>
                {Object.entries(productCategories).map(([slug, cat]) => (
                  <a key={slug} href={`#${slug}`} className="chip">
                    <i className={`fas ${cat.icon}`} /> {cat.name}
                  </a>
                ))}
              </div>
            </div>
            <div className="filter-bar">
              <span className="filter-label">Brands</span>
              <div className="filter-chips">
                <Link href="/products" className={`chip ${!selectedBrand ? "active" : ""}`}>All brands</Link>
                {brandList.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/products?brand=${encodeURIComponent(b.slug)}`}
                    className={`chip ${selectedBrand?.slug === b.slug ? "active" : ""}`}
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div id="all" />

          {selectedBrand && totalFiltered === 0 && (
            <div className="no-results">
              <i className="fas fa-search" />
              <h3>No products tagged with {selectedBrand.name} yet</h3>
              <p>Tag products with this brand from the admin panel to see them here.</p>
              <Link href="/products" className="btn btn-primary">See all products</Link>
            </div>
          )}

          {/* ---- Full-width category blocks (no sidebar) ---- */}
          {visibleCategories.map(({ slug, cat, products }) => {
            if (products.length === 0) return null;
            const showCount = selectedBrand ? products.length : Math.min(8, products.length);
            return (
              <div className="cat-block" id={slug} key={slug}>
                <div className="cat-block-head">
                  <div className="cat-block-title">
                    <span className="cat-block-icon"><i className={`fas ${cat.icon}`} /></span>
                    <div>
                      <h2>{cat.name}</h2>
                      <span className="cat-block-count">{products.length} product{products.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  {!selectedBrand && products.length > showCount && (
                    <Link href={getCategoryUrl(slug)} className="view-all-link">View all <i className="fas fa-arrow-right" /></Link>
                  )}
                </div>
                <div className="products-grid products-grid-4">
                  {products.slice(0, showCount).map((product) => {
                    const name = displayName(product, meta);
                    return (
                      <Link href={getProductUrl(slug, product.id)} className="product-card product-card-compact" key={product.id}>
                        <div className="product-image">
                          <img src={bestProductImage(product.id, meta, imagesMap)} alt={name} />
                          <div className="product-overlay"><span className="btn btn-primary btn-sm">View Details</span></div>
                        </div>
                        <div className="product-info">
                          <span className="product-category">{cat.name}</span>
                          <h3 className="product-name">{name}</h3>
                          <p className="product-desc">{product.short_desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <h2>Need help choosing the right product?</h2>
            <p>Our experts will help you find the perfect security solution for your needs.</p>
            <div className="cta-buttons">
              <Link href="/contact" className="btn btn-primary btn-lg">Contact us <i className="fas fa-arrow-right" style={{ fontSize: "0.8em" }} /></Link>
              <a href={telHref} className="btn btn-ghost btn-lg"><i className="fas fa-phone" /> {siteConfig.companyPhone}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
