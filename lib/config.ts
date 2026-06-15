export const siteConfig = {
  companyName: "Axiozen",
  companyEmail: "info@axiozen.com",
  companyPhone: "+91 00000 00000",
  companyAddress: "Your Street Address, City, State PIN, India",
  siteTitle: "Axiozen - Solutions That Secure, Automate & Empower",
  siteDescription:
    "Axiozen delivers website design, hosting, app development, biometric devices, CCTV, gate automation, security solutions, and attendance & payroll software.",
  social: {
    linkedin: "#",
    facebook: "#",
    instagram: "#",
    youtube: "#",
    x: "#",
    threads: "#",
  },
  // Placeholder map link — replace with your real Google Maps place URL.
  googleMapsLink: "https://www.google.com/maps",
  // Placeholder embed — replace with your real Google Maps embed URL.
  googleMapsEmbed: "https://www.google.com/maps?output=embed&q=India",
  // Analytics intentionally disabled. Add your own IDs to enable.
  gtmId: "",
  gaMeasurementId: "",
} as const;

export type SiteConfig = typeof siteConfig;
