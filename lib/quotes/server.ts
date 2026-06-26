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
  return {
    ...r,
    items,
    gst_rate: Number(r.gst_rate),
    version: Number(r.version) || 1,
    scope_of_work: r.scope_of_work ?? "",
  };
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
  scope_of_work: string;
  notes: string;
};

/** Full document id including the zero-padded revision, e.g. "AXZ/2026/0103-02". */
export function fullQuoteId(quoteNo: string, version: number): string {
  const v = Math.max(1, Math.floor(Number(version) || 1));
  return `${quoteNo}-${String(v).padStart(2, "0")}`;
}

export async function createQuote(input: QuoteInput): Promise<number> {
  const db = await getDb();
  const quote_no = input.quote_no?.trim() || (await nextQuoteNumber());
  const res = await db.run(
    `INSERT INTO quotes (quote_no, quote_date, valid_until, location, client_name, client_contact, items, gst_rate, scope_of_work, notes, version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      quote_no, input.quote_date, input.valid_until, input.location,
      input.client_name, input.client_contact, JSON.stringify(input.items),
      input.gst_rate, input.scope_of_work, input.notes,
    ],
  );
  return res.insertId ?? 0;
}

/** True if the incoming input differs from the stored quote's content. */
function contentChanged(existing: QuoteRecord, next: QuoteInput): boolean {
  return (
    (existing.quote_no ?? "") !== (next.quote_no ?? "") ||
    existing.quote_date !== next.quote_date ||
    existing.valid_until !== next.valid_until ||
    existing.location !== next.location ||
    existing.client_name !== next.client_name ||
    existing.client_contact !== next.client_contact ||
    Number(existing.gst_rate) !== Number(next.gst_rate) ||
    (existing.scope_of_work ?? "") !== (next.scope_of_work ?? "") ||
    (existing.notes ?? "") !== (next.notes ?? "") ||
    JSON.stringify(existing.items) !== JSON.stringify(next.items)
  );
}

export type UpdateResult = { version: number; changed: boolean };

/**
 * Update a quote. The revision (`version`) is bumped by 1 only when the content
 * actually changed, so repeated saves / save-before-download don't inflate it.
 */
export async function updateQuote(id: number, input: QuoteInput): Promise<UpdateResult> {
  const db = await getDb();
  const existing = await getQuote(id);
  const changed = existing ? contentChanged(existing, input) : true;
  const baseVersion = existing?.version ?? 1;
  const nextVersion = changed ? baseVersion + 1 : baseVersion;
  await db.run(
    `UPDATE quotes SET quote_no=?, quote_date=?, valid_until=?, location=?, client_name=?, client_contact=?, items=?, gst_rate=?, scope_of_work=?, notes=?, version=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [
      input.quote_no ?? "", input.quote_date, input.valid_until, input.location,
      input.client_name, input.client_contact, JSON.stringify(input.items),
      input.gst_rate, input.scope_of_work, input.notes, nextVersion, id,
    ],
  );
  return { version: nextVersion, changed };
}

export async function deleteQuote(id: number): Promise<void> {
  const db = await getDb();
  await db.run("DELETE FROM quotes WHERE id = ?", [id]);
}
