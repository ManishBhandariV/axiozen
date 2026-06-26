import "server-only";
import { getDb } from "@/lib/db";
import type { QuoteRecord, QuoteRow, QuoteItem } from "./types";
import { loadQuoteSettings } from "./settings-server";

function parseRow(r: QuoteRow): QuoteRecord {
  let items: QuoteItem[] = [];
  try {
    items = JSON.parse(r.items || "[]");
  } catch {
    /* ignore malformed json */
  }
  return { ...r, items, gst_rate: Number(r.gst_rate) };
}

export async function listQuotes(): Promise<QuoteRecord[]> {
  try {
    const db = await getDb();
    const rows = await db.all<QuoteRow>("SELECT * FROM quotes ORDER BY id DESC");
    return rows.map(parseRow);
  } catch (e) {
    console.warn("[quotes] list failed", e);
    return [];
  }
}

export async function getQuote(id: number): Promise<QuoteRecord | null> {
  const db = await getDb();
  const row = await db.get<QuoteRow>("SELECT * FROM quotes WHERE id = ?", [id]);
  return row ? parseRow(row) : null;
}

/** Next sequential quote number, continuing from existing ones (or numberStart). */
export async function nextQuoteNumber(): Promise<string> {
  const settings = await loadQuoteSettings();
  let maxN = settings.numberStart - 1;
  try {
    const db = await getDb();
    const rows = await db.all<{ quote_no: string }>("SELECT quote_no FROM quotes");
    for (const r of rows) {
      const m = (r.quote_no || "").match(/(\d+)\s*$/);
      if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
    }
  } catch {
    /* no quotes yet */
  }
  const n = maxN + 1;
  return settings.numberPrefix + String(n).padStart(settings.numberPadding, "0");
}

export type QuoteInput = {
  quote_no?: string;
  quote_date: string;
  valid_until: string;
  location: string;
  client_name: string;
  client_contact: string;
  items: QuoteItem[];
  gst_rate: number;
  notes: string;
};

export async function createQuote(input: QuoteInput): Promise<number> {
  const db = await getDb();
  const quote_no = input.quote_no?.trim() || (await nextQuoteNumber());
  const res = await db.run(
    `INSERT INTO quotes (quote_no, quote_date, valid_until, location, client_name, client_contact, items, gst_rate, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      quote_no, input.quote_date, input.valid_until, input.location,
      input.client_name, input.client_contact, JSON.stringify(input.items),
      input.gst_rate, input.notes,
    ],
  );
  return res.insertId ?? 0;
}

export async function updateQuote(id: number, input: QuoteInput): Promise<void> {
  const db = await getDb();
  await db.run(
    `UPDATE quotes SET quote_no=?, quote_date=?, valid_until=?, location=?, client_name=?, client_contact=?, items=?, gst_rate=?, notes=? WHERE id=?`,
    [
      input.quote_no ?? "", input.quote_date, input.valid_until, input.location,
      input.client_name, input.client_contact, JSON.stringify(input.items),
      input.gst_rate, input.notes, id,
    ],
  );
}

export async function deleteQuote(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM quotes WHERE id = ?", [id]);
}
