import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, ImageRun, BorderStyle, VerticalAlign, ShadingType,
} from "docx";
import type { QuoteRecord, QuoteSettings, QuoteTermsSection } from "./types";
import { computeTotals, lineAmount, rs } from "./compute";
import { LOGO_DATA_URI, QR_DATA_URI, BANNER_DATA_URI } from "./assets";

const NAVY = "16223F";
const BLUE = "2563EB";
const LIGHT = "EEF2F8";
const BORDER = "CBD5E1";

function buf(dataUri: string): Buffer {
  return Buffer.from(dataUri.split(",")[1], "base64");
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

  const meta: Array<[string, string]> = [
    ["Quotation No:", q.quote_no],
    ["Date:", q.quote_date],
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

  const children = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new ImageRun({ type: "png", data: buf(LOGO_DATA_URI), transformation: { width: 300, height: 46 } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 }, children: [new TextRun({ text: cfg.address, size: 17, color: "64748B" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: `GSTIN: ${cfg.gstin}  |  Contact No: ${cfg.phone}  |  Website: ${cfg.website}`, size: 17, color: NAVY })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 60, after: 160 },
      shading: { fill: NAVY, type: ShadingType.CLEAR, color: "auto" },
      children: [new TextRun({ text: "COMMERCIAL QUOTATION", bold: true, color: "FFFFFF", size: 28 })],
    }),
    metaTable,
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
    title: q.quote_no,
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children }],
  });

  return Packer.toBuffer(doc);
}
