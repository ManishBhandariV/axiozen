"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  createQuote, updateQuote, deleteQuote, getQuote, type QuoteInput,
} from "@/lib/quotes/server";
import { loadQuoteSettings, saveQuoteSettings } from "@/lib/quotes/settings-server";
import type { QuoteItem, QuoteSettings } from "@/lib/quotes/types";

async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin");
}

function parseItems(raw: string): QuoteItem[] {
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr
        .map((x) => ({ item: String(x.item ?? ""), qty: Number(x.qty) || 0, unitPrice: Number(x.unitPrice) || 0 }))
        .filter((x) => x.item.trim() || x.qty || x.unitPrice);
    }
  } catch { /* ignore */ }
  return [];
}

function readInput(formData: FormData): QuoteInput {
  return {
    quote_no: String(formData.get("quote_no") ?? "").trim(),
    quote_date: String(formData.get("quote_date") ?? "").trim(),
    valid_until: String(formData.get("valid_until") ?? "").trim(),
    location: String(formData.get("location") ?? "").trim(),
    client_name: String(formData.get("client_name") ?? "").trim(),
    client_contact: String(formData.get("client_contact") ?? "").trim(),
    items: parseItems(String(formData.get("items") ?? "[]")),
    gst_rate: Number(formData.get("gst_rate")) || 0,
    scope_of_work: String(formData.get("scope_of_work") ?? "").trim(),
    notes: String(formData.get("notes") ?? "").trim(),
  };
}

/** Result returned to the form's useActionState (no redirect — lets the form download). */
export type SaveQuoteState = {
  ok: boolean;
  id?: number;
  version?: number;
  changed?: boolean;
  error?: string;
};

/**
 * Validate + save a quote, returning state instead of redirecting. Used by the
 * QuoteForm for "Save", "Save & PDF" and "Save & Word" (save-then-download).
 */
export async function saveQuoteState(
  _prev: SaveQuoteState | null,
  formData: FormData,
): Promise<SaveQuoteState> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Unauthorized." };

  const id = Number(formData.get("id") || 0);
  const input = readInput(formData);

  if (!input.client_name) return { ok: false, error: "Client name is required." };
  if (!input.quote_date) return { ok: false, error: "Quote date is required." };
  if (input.items.length === 0)
    return { ok: false, error: "Add at least one line item." };
  if (!Number.isFinite(input.gst_rate) || input.gst_rate < 0 || input.gst_rate > 100)
    return { ok: false, error: "GST % must be between 0 and 100." };

  try {
    if (id) {
      const res = await updateQuote(id, input);
      revalidatePath("/admin/quotes");
      revalidatePath(`/admin/quotes/${id}/edit`);
      return { ok: true, id, version: res.version, changed: res.changed };
    }
    const newId = await createQuote(input);
    revalidatePath("/admin/quotes");
    return { ok: true, id: newId, version: 1, changed: true };
  } catch (e) {
    console.error("[saveQuoteState]", e);
    return { ok: false, error: `Save failed: ${(e as Error).message}` };
  }
}

export async function saveQuoteAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const input = readInput(formData);
  let qid = id;
  if (id) await updateQuote(id, input);
  else qid = await createQuote(input);
  revalidatePath("/admin/quotes");
  redirect(`/admin/quotes/${qid}/edit?saved=1`);
}

export async function deleteQuoteAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  if (id) await deleteQuote(id);
  revalidatePath("/admin/quotes");
  redirect("/admin/quotes");
}

export async function duplicateQuoteAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id") || 0);
  const q = id ? await getQuote(id) : null;
  if (!q) redirect("/admin/quotes");
  const newId = await createQuote({
    quote_no: "", quote_date: q.quote_date, valid_until: q.valid_until,
    location: q.location, client_name: `${q.client_name} (copy)`, client_contact: q.client_contact,
    items: q.items, gst_rate: q.gst_rate, scope_of_work: q.scope_of_work, notes: q.notes,
  });
  revalidatePath("/admin/quotes");
  redirect(`/admin/quotes/${newId}/edit`);
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  const cur = await loadQuoteSettings();
  let terms = cur.terms;
  const termsRaw = String(formData.get("terms_json") ?? "");
  if (termsRaw.trim()) {
    try {
      const t = JSON.parse(termsRaw);
      if (Array.isArray(t)) terms = t;
    } catch { /* keep current on invalid JSON */ }
  }
  const str = (k: string, d: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v || d;
  };
  const num = (k: string, d: number) => {
    const v = Number(formData.get(k));
    return Number.isFinite(v) ? v : d;
  };
  // About paragraphs: textarea split on blank lines (paragraph breaks).
  const aboutRaw = String(formData.get("aboutParagraphs") ?? "");
  const aboutParagraphs = aboutRaw.trim()
    ? aboutRaw.split(/\n\s*\n/).map((p) => p.trim().replace(/\s*\n\s*/g, " ")).filter(Boolean)
    : cur.aboutParagraphs;
  const s: QuoteSettings = {
    companyName: str("companyName", cur.companyName),
    address: str("address", cur.address),
    gstin: str("gstin", cur.gstin),
    phone: str("phone", cur.phone),
    website: str("website", cur.website),
    accountName: str("accountName", cur.accountName),
    accountNo: str("accountNo", cur.accountNo),
    ifsc: str("ifsc", cur.ifsc),
    branch: str("branch", cur.branch),
    accountType: str("accountType", cur.accountType),
    upiNote: str("upiNote", cur.upiNote),
    gstRate: num("gstRate", cur.gstRate),
    validity: str("validity", cur.validity),
    numberPrefix: str("numberPrefix", cur.numberPrefix),
    numberPadding: num("numberPadding", cur.numberPadding),
    numberStart: num("numberStart", cur.numberStart),
    aboutHeading: str("aboutHeading", cur.aboutHeading),
    aboutParagraphs,
    scopeOfWorkDefault: String(formData.get("scopeOfWorkDefault") ?? "").trim(),
    showCustomers: formData.get("showCustomers") != null,
    terms,
  };
  await saveQuoteSettings(s);
  revalidatePath("/admin/quotes");
  redirect("/admin/quotes/settings?saved=1");
}
