import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, ImageRun, BorderStyle, VerticalAlign, ShadingType,
  Header, TabStopType, TabStopPosition,
} from "docx";
import type { QuoteRecord, QuoteSettings, QuoteTermsSection } from "./types";
import { computeTotals, lineAmount, rs } from "./compute";
import { fullQuoteId } from "./server";
import { LOGO_DATA_URI, QR_DATA_URI, BANNER_DATA_URI } from "./assets";

// Customer-logo data URIs for the "Our Esteemed Customers" wall. Empty until
// real Axiozen client logos are embedded — gated on cfg.showCustomers.
const CUSTOMER_DATA_URIS: string[] = [];

const NAVY = "16223F";
const BLUE = "2563EB";
const LIGHT = "EEF2F8";
const BORDER = "CBD5E1";

function buf(dataUri: string): Buffer {
  return Buffer.from(dataUri.split(",")[1], "base64");
}

/** ISO yyyy-mm-dd → "June 23, 2026"; pass through anything non-ISO. */
function prettyDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

const thin = { style: BorderStyle.SINGLE, size: 4, color: BORDER };
const cellBorders = { top: thin, bottom: thin, left: thin, right: thin };

function cell(opts: {
  text?: string; runs?: TextRun[]; width?: number; bold?: boolean;
  fill?: string; color?: string; align?: (typeof AlignmentType)[keyof typeof AlignmentType];
}): TableCell {
  const runs = opts.runs ?? [new TextRun({ text: opts.text ?? "", bold: opts.bold, color: opts.color, size: 18 })];
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    borders: cellBorders,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: opts.align, children: runs })],
  });
}

function sectionBar(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 220, after: 120 },
    shading: { fill: NAVY, type: ShadingType.CLEAR, color: "auto" },
    children: [new TextRun({ text: `  ${text}`, bold: true, color: "FFFFFF", size: 21 })],
  });
}

function termSection(sec: QuoteTermsSection, n: number): Paragraph[] {
  const out: Paragraph[] = [
    new Paragraph({
      spacing: { before: 120, after: 40 },
      children: [new TextRun({ text: `${n}. ${sec.heading}`, bold: true, color: NAVY, size: 19 })],
    }),
  ];
  for (const p of sec.points) {
    out.push(new Paragraph({
      spacing: { after: 40 }, indent: { left: 180 },
      children: [
        ...(p.label ? [new TextRun({ text: `${p.label}: `, bold: true, size: 17 })] : []),
        new TextRun({ text: p.text, size: 17 }),
      ],
    }));
  }
  return out;
}

export async function renderQuoteDocx(q: QuoteRecord, cfg: QuoteSettings): Promise<Buffer> {
  const { net, gst, total } = computeTotals(q.items, q.gst_rate);
  const docId = fullQuoteId(q.quote_no, q.version);

  const meta: Array<[string, string]> = [
    ["Quotation No:", docId],
    ["Date:", prettyDate(q.quote_date)],
    ["Valid Until:", q.valid_until],
    ["Location:", q.location],
    ["Client Name:", q.client_name],
    ["Email / Phone:", q.client_contact],
  ];

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: meta.map(([k, v]) => new TableRow({
      children: [
        cell({ text: k, width: 28, bold: true, fill: LIGHT, color: NAVY }),
        cell({ text: v, width: 72 }),
      ],
    })),
  });

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cell({ text: "Item", width: 46, bold: true, color: "FFFFFF", fill: NAVY }),
      cell({ text: "Qty", width: 12, bold: true, color: "FFFFFF", fill: NAVY, align: AlignmentType.CENTER }),
      cell({ text: "Price / Unit", width: 21, bold: true, color: "FFFFFF", fill: NAVY, align: AlignmentType.RIGHT }),
      cell({ text: "Amount", width: 21, bold: true, color: "FFFFFF", fill: NAVY, align: AlignmentType.RIGHT }),
    ],
  });
  const itemRows = q.items.map((it) => new TableRow({
    children: [
      cell({ text: it.item, width: 46 }),
      cell({ text: String(it.qty), width: 12, align: AlignmentType.CENTER }),
      cell({ text: rs(it.unitPrice), width: 21, align: AlignmentType.RIGHT }),
      cell({ text: rs(lineAmount(it)), width: 21, align: AlignmentType.RIGHT }),
    ],
  }));
  const totalRow = (label: string, value: string, grand = false) => new TableRow({
    children: [
      new TableCell({
        width: { size: 79, type: WidthType.PERCENTAGE }, columnSpan: 3, borders: cellBorders,
        shading: grand ? { fill: LIGHT, type: ShadingType.CLEAR, color: "auto" } : undefined,
        margins: { top: 60, bottom: 60, left: 90, right: 90 },
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: label, bold: true, color: NAVY, size: grand ? 21 : 18 })] })],
      }),
      new TableCell({
        width: { size: 21, type: WidthType.PERCENTAGE }, borders: cellBorders,
        shading: grand ? { fill: LIGHT, type: ShadingType.CLEAR, color: "auto" } : undefined,
        margins: { top: 60, bottom: 60, left: 90, right: 90 },
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: value, bold: true, color: grand ? BLUE : "000000", size: grand ? 21 : 18 })] })],
      }),
    ],
  });

  const pricingTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      headerRow, ...itemRows,
      totalRow("Net Amount", rs(net)),
      totalRow(`GST (${q.gst_rate}%)`, rs(gst)),
      totalRow("Total Amount", rs(total), true),
    ],
  });

  // Payment: 2-col table (bank details | QR)
  const payTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
    },
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          ["Account Name", cfg.accountName], ["Account No", cfg.accountNo],
          ["IFSC Code", cfg.ifsc], ["Branch", cfg.branch], ["Account Type", cfg.accountType],
        ].map(([k, v]) => new Paragraph({ spacing: { after: 40 }, children: [
          new TextRun({ text: `${k}: `, bold: true, color: NAVY, size: 18 }),
          new TextRun({ text: v, size: 18 }),
        ] })),
      }),
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE }, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: "jpg", data: buf(QR_DATA_URI), transformation: { width: 120, height: 119 } })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cfg.upiNote, size: 15, color: "64748B" })] }),
        ],
      }),
    ] })],
  });

  // About section
  const aboutBlocks: Paragraph[] = cfg.aboutParagraphs.length
    ? [
        ...([sectionBar(cfg.aboutHeading)] as Paragraph[]),
        ...cfg.aboutParagraphs.map((p) => new Paragraph({
          spacing: { after: 80 }, alignment: AlignmentType.JUSTIFIED,
          children: [new TextRun({ text: p, size: 17, color: "334155" })],
        })),
      ]
    : [];

  // Our Esteemed Customers (gated)
  const showCustomers = cfg.showCustomers && CUSTOMER_DATA_URIS.length > 0;
  const customerBlocks: Array<Paragraph | Table> = [];
  if (showCustomers) {
    customerBlocks.push(sectionBar("Our Esteemed Customers"));
    const perRow = 6;
    const rows: TableRow[] = [];
    for (let i = 0; i < CUSTOMER_DATA_URIS.length; i += perRow) {
      const slice = CUSTOMER_DATA_URIS.slice(i, i + perRow);
      rows.push(new TableRow({
        children: Array.from({ length: perRow }).map((_, j) => new TableCell({
          width: { size: Math.floor(100 / perRow), type: WidthType.PERCENTAGE },
          margins: { top: 40, bottom: 40, left: 40, right: 40 },
          verticalAlign: VerticalAlign.CENTER,
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: slice[j]
              ? [new ImageRun({ type: "png", data: buf(slice[j]), transformation: { width: 80, height: 30 } })]
              : [new TextRun("")],
          })],
        })),
      }));
    }
    customerBlocks.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
      rows,
    }));
  }

  // Scope of Work
  const scopeBlocks: Paragraph[] = q.scope_of_work
    ? [
        ...([sectionBar("Scope of Work")] as Paragraph[]),
        new Paragraph({ spacing: { after: 80 }, alignment: AlignmentType.JUSTIFIED, children: [new TextRun({ text: q.scope_of_work, size: 17, color: "334155" })] }),
      ]
    : [];

  // Running header with the logo — repeats on every page.
  const runningHeader = new Header({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 40 },
      children: [new ImageRun({ type: "png", data: buf(LOGO_DATA_URI), transformation: { width: 200, height: 31 } })],
    })],
  });

  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new ImageRun({ type: "png", data: buf(LOGO_DATA_URI), transformation: { width: 300, height: 46 } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [new TextRun({ text: cfg.address, size: 17, color: "64748B" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: `GSTIN: ${cfg.gstin}  |  Contact No: ${cfg.phone}  |  Website: ${cfg.website}`, size: 17, color: NAVY })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 60, after: 160 },
      shading: { fill: NAVY, type: ShadingType.CLEAR, color: "auto" },
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: "COMMERCIAL QUOTATION", bold: true, color: "FFFFFF", size: 28 }),
        new TextRun({ text: `\t${docId}`, bold: true, color: "CBD5E1", size: 18 }),
      ],
    }),
    metaTable,
    ...aboutBlocks,
    ...customerBlocks,
    ...scopeBlocks,
    sectionBar("Product & Service Pricing Details"),
    pricingTable,
    sectionBar("Payment Information"),
    payTable,
    sectionBar("Terms & Conditions"),
    ...cfg.terms.flatMap((sec, i) => termSection(sec, i + 1)),
    ...(q.notes ? [new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: q.notes, size: 17 })] })] : []),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 260 }, children: [new ImageRun({ type: "png", data: buf(BANNER_DATA_URI), transformation: { width: 540, height: 119 } })] }),
  ];

  const doc = new Document({
    creator: cfg.companyName,
    title: `Quotation ${docId}`,
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      headers: { default: runningHeader },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}
