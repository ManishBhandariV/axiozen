export const siteConfig = {
  companyName: "Axiozen",
  companyEmail: "axiozenindia@gmail.com",
  companyPhone: "+91 94808 26479",
  companyAddress: "395, College Road, T Narsipura, Mysuru, Karnataka, 571124",
  companyGstin: "29ADEPB1056A1ZA",
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
  // Google Search Console site verification token.
  googleSiteVerification: "GrqZ2e2PjkxQSkUR5Yzp6x0f_rARfhaGusVmRD0wYcg",
  googleMapsLink:
    "https://www.google.com/maps/search/?api=1&query=395+College+Road+T+Narsipura+Mysuru+Karnataka+571124",
  googleMapsEmbed:
    "https://www.google.com/maps?output=embed&q=395+College+Road+T+Narsipura+Mysuru+Karnataka+571124",
  // Analytics intentionally disabled. Add your own IDs to enable.
  gtmId: "",
  gaMeasurementId: "",
} as const;

export type SiteConfig = typeof siteConfig;
