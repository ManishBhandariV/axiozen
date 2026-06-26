import Link from "next/link";
import { logout } from "@/app/admin/actions";

export function AdminTopBar({
  title,
  username,
  activeTab,
  pendingReviewCount,
}: {
  title: string;
  username: string;
  activeTab:
    | "products"
    | "quotes"
    | "featured"
    | "carousel"
    | "reviews"
    | "enquiries"
    | "gallery"
    | "brands"
    | "categories"
    | "downloads-page";
  pendingReviewCount?: number;
}) {
  const tabs = [
    { id: "products",       label: "Products",  href: "/admin" },
    { id: "quotes",         label: "Quotes",    href: "/admin/quotes" },
    { id: "featured",       label: "Featured",  href: "/admin/featured" },
    { id: "carousel",       label: "Carousel",  href: "/admin/carousel" },
    { id: "gallery",        label: "Gallery",   href: "/admin/gallery" },
    { id: "brands",         label: "Brands",    href: "/admin/brands" },
    { id: "categories",     label: "Categories", href: "/admin/categories" },
    { id: "downloads-page", label: "Downloads", href: "/admin/downloads-page" },
    { id: "reviews",        label: "Reviews",   href: "/admin/reviews" },
    { id: "enquiries",      label: "Enquiries", href: "/admin/enquiries" },
  ] as const;

  return (
    <div
      style={{
        background: "rgba(8,12,24,0.92)",
        backdropFilter: "blur(12px)",
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.09)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <h1 style={{ fontSize: "1rem", color: "#e6ecf7", fontWeight: 700 }}>{title}</h1>
        <nav style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {tabs.map((t) => {
            const active = t.id === activeTab;
            return (
              <Link
                key={t.id}
                href={t.href}
                style={{
                  fontSize: "0.85rem",
                  color: active ? "#22d3ee" : "#8a97b1",
                  textDecoration: "none",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {t.label}
                {t.id === "reviews" && pendingReviewCount != null && pendingReviewCount > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      borderRadius: 10,
                      padding: "1px 7px",
                      fontSize: "0.7rem",
                      marginLeft: 6,
                    }}
                  >
                    {pendingReviewCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      <div>
        <span style={{ color: "#5e6b80", fontSize: "0.82rem", marginRight: 16 }}>
          Logged in as <strong style={{ color: "#8a97b1" }}>{username}</strong>
        </span>
        <form action={logout} style={{ display: "inline" }}>
          <button
            type="submit"
            style={{
              background: "none",
              border: "none",
              color: "#8a97b1",
              fontSize: "0.85rem",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </form>
      </div>
    </div>
  );
}
