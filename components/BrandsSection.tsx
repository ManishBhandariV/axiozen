import Link from "next/link";
import { loadBrandLogos, resolveBrandLogo } from "@/lib/data/brand-logos-server";
import { loadEffectiveBrands } from "@/lib/data/brands-effective";

export async function BrandsSection() {
  const [dbLogos, brands] = await Promise.all([
    loadBrandLogos(),
    loadEffectiveBrands(),
  ]);

  if (brands.length === 0) return null;

  // Duplicate the list so the marquee loops seamlessly.
  const loop = [...brands, ...brands];

  return (
    <section className="section tight">
      <div className="container">
        <p className="text-center muted" style={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 26 }}>
          Authorised partner for leading brands
        </p>
      </div>
      <div className="marquee">
        <div className="marquee-track">
          {loop.map((brand, i) => {
            const logo = resolveBrandLogo(brand.slug, dbLogos);
            return (
              <Link
                key={`${brand.slug}-${i}`}
                href={`/products?brand=${encodeURIComponent(brand.slug)}`}
                className="brand-card"
                style={{ width: 168, flex: "0 0 auto" }}
                title={`See all ${brand.name} products`}
                aria-hidden={i >= brands.length}
              >
                {logo ? (
                  <img src={logo} alt={`${brand.name} logo`} />
                ) : (
                  <span className="brand-card-text">{brand.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
