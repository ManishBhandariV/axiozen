export type QuoteItem = {
  item: string;
  qty: number;
  unitPrice: number;
};

export type QuoteRecord = {
  id: number;
  quote_no: string;
  quote_date: string; // ISO yyyy-mm-dd
  valid_until: string; // e.g. "7 Days from Issue"
  location: string;
  client_name: string;
  client_contact: string; // email / phone
  items: QuoteItem[];
  gst_rate: number; // percent
  scope_of_work: string;
  notes: string;
  version: number;
  created_at: string;
  updated_at: string;
};

/** Raw DB row (items stored as JSON string). */
export type QuoteRow = Omit<QuoteRecord, "items"> & { items: string };

export type QuoteTermsSection = {
  heading: string;
  points: { label?: string; text: string }[];
};

export type QuoteSettings = {
  // Company header
  companyName: string;
  address: string;
  gstin: string;
  phone: string;
  website: string;
  // Bank / payment
  accountName: string;
  accountNo: string;
  ifsc: string;
  branch: string;
  accountType: string;
  upiNote: string;
  // Defaults
  gstRate: number;
  validity: string;
  numberPrefix: string; // e.g. "AXZ/2026/"
  numberPadding: number; // e.g. 4 -> 0103
  numberStart: number; // first number to use, e.g. 103
  terms: QuoteTermsSection[];
  // About + scope + customers
  aboutHeading: string;
  aboutParagraphs: string[];
  scopeOfWorkDefault: string;
  showCustomers: boolean; // gates the "Our Esteemed Customers" wall (off by default)
};
