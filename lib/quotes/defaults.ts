import type { QuoteSettings } from "./types";

/**
 * Default quote settings, seeded from the real AXZ quotation template.
 * These are editable from /admin/quotes/settings (stored in app_settings).
 */
export const DEFAULT_QUOTE_SETTINGS: QuoteSettings = {
  companyName: "AXIOZEN",
  address: "395, College Road, T Narsipura, Mysuru, Karnataka, 571124",
  gstin: "29ADEPB1056A1ZA",
  phone: "9423629412",
  website: "www.axiozen.in",

  accountName: "SHRI ARIHANT TRADERS",
  accountNo: "1548264732",
  ifsc: "KKBK0008305",
  branch: "Kotak Bank, T.Narsipura, Mysore",
  accountType: "Current Account",
  upiNote: "Scan QR Code to Pay via UPI",

  gstRate: 18,
  validity: "7 Days from Issue",
  numberPrefix: "AXZ/2026/",
  numberPadding: 4,
  numberStart: 103,

  aboutHeading: "About Axiozen",
  aboutParagraphs: [
    "Axiozen is a Mysuru-based technology company specialising in security, surveillance and workplace automation solutions. We design and deliver reliable hardware and software ecosystems tailored to each client's operational needs.",
    "From biometric access control and CCTV surveillance to attendance and automation systems, our focus is on dependable, future-ready deployments backed by responsive local support.",
  ],
  scopeOfWorkDefault: "",
  showCustomers: false,

  terms: [
    {
      heading: "General Information",
      points: [
        { label: "Jurisdiction", text: "This quotation and any resulting agreement are subject exclusively to Bangalore jurisdiction." },
        { label: "Amendments", text: "We reserve the right to modify these terms and conditions at any time. Revised terms will be posted directly on our Service platform. Continued use of the Service following such updates constitutes your acceptance of the revised terms." },
        { label: "Validity", text: "This quotation is valid for 7 days from the date of issue and is subject to change without prior notice." },
        { label: "Technical Support", text: "Remote telephonic support is provided for troubleshooting and issue resolution. On-site visits are not included free of charge. If required, all onsite deployment or support visits will be pre-authorised and billed at a standard rate of Rs. 2,000 per day." },
      ],
    },
    {
      heading: "Delivery Timeline",
      points: [
        { label: "Standard Delivery", text: "Standard delivery will be executed within 7 business days from the date of receiving a confirmed purchase order alongside the required advance payment." },
      ],
    },
    {
      heading: "Payment Terms",
      points: [
        { label: "Advance Payment", text: "100% advance payment is required upon order confirmation prior to fulfillment." },
        { label: "Scope Changes", text: "Any additions, modifications, or deviations from the requirements explicitly mentioned in this document will incur additional charges." },
      ],
    },
    {
      heading: "Warranty & Liability",
      points: [
        { label: "Coverage", text: "A 1-year limited warranty from the invoice date covers manufacturing-related defects inherent to the unit." },
        { label: "Exclusions", text: "The client retains full responsibility for any physical, electrical, or liquid/water damage caused to the device or hardware. Such instances immediately void the warranty." },
        { label: "Specific Item Exemptions", text: "No warranty applies to the Prism. Power supply units and batteries are explicitly excluded from warranty coverage." },
        { label: "E-Commerce Policy", text: "Products purchased through unauthorised online channels or third-party e-commerce platforms are completely excluded from this warranty. Furthermore, such products will not be eligible for servicing, repairs, or customer support by either the manufacturer or our company." },
        { label: "Annual Maintenance Contract (AMC)", text: "AMC pricing is subject to revision without prior notice. The charges outlined in this quotation represent current rates and are valid strictly within the 7-day validity window of this quote." },
      ],
    },
  ],
};
