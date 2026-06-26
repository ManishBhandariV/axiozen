"use client";

import { useActionState, useRef, useState } from "react";
import { saveQuoteState, type SaveQuoteState } from "@/app/admin/quotes/actions";
import { computeTotals, lineAmount, rs } from "@/lib/quotes/compute";
import type { QuoteItem, QuoteRecord } from "@/lib/quotes/types";

type Props = {
  initial?: QuoteRecord;
  suggestedNumber: string;
  today: string; // ISO yyyy-mm-dd
  defaults: { gstRate: number; validity: string; scopeOfWork: string };
};

const EMPTY: QuoteItem = { item: "", qty: 1, unitPrice: 0 };
const INITIAL: SaveQuoteState | null = null;

function fullQuoteId(quoteNo: string, version: number): string {
  const v = Math.max(1, Math.floor(Number(version) || 1));
  return `${quoteNo}-${String(v).padStart(2, "0")}`;
}

function Banner({ state, dl }: { state: SaveQuoteState | null; dl: string | null }) {
  if (dl) {
    return (
      <div className="saved-banner" role="status" style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)", color: "#fca5a5" }}>
        <i className="fas fa-circle-exclamation" /> {dl}
      </div>
    );
  }
  if (!state) return null;
  if (!state.ok) {
    return (
      <div className="saved-banner" role="alert" style={{ background: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)", color: "#fca5a5" }}>
        <i className="fas fa-circle-exclamation" /> {state.error}
      </div>
    );
  }
  const msg = state.changed
    ? `Saved as revision ${String(state.version).padStart(2, "0")}.`
    : "Saved (no changes).";
  return (
    <div className="saved-banner" role="status">
      <i className="fas fa-circle-check" /> {msg}
    </div>
  );
}

export function QuoteForm({ initial, suggestedNumber, today, defaults }: Props) {
  const [items, setItems] = useState<QuoteItem[]>(
    initial?.items?.length ? initial.items : [{ ...EMPTY }],
  );
  const [gstRate, setGstRate] = useState<number>(initial?.gst_rate ?? defaults.gstRate);
  const [state, action, pending] = useActionState(saveQuoteState, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);
  const [downloading, setDownloading] = useState<null | "pdf" | "docx">(null);
  const [dlError, setDlError] = useState<string | null>(null);

  const { net, gst, total } = computeTotals(items, gstRate);
  const cleanItems = items.filter((it) => it.item.trim() || it.qty || it.unitPrice);

  const setItem = (i: number, patch: Partial<QuoteItem>) =>
    setItems((arr) => arr.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const addItem = () => setItems((arr) => [...arr, { ...EMPTY }]);
  const removeItem = (i: number) => setItems((arr) => arr.filter((_, j) => j !== i));

  // Save the current form (via the state action), then open the download route.
  async function saveThenDownload(fmt: "pdf" | "docx") {
    if (!formRef.current) return;
    setDownloading(fmt);
    setDlError(null);
    try {
      const fd = new FormData(formRef.current);
      fd.set("items", JSON.stringify(cleanItems));
      fd.set("gst_rate", String(gstRate));
      const res = await saveQuoteState(null, fd);
      if (res.ok && res.id) {
        window.open(`/admin/quotes/${res.id}/${fmt}`, "_blank", "noopener");
        // Keep the user on a saved edit page so subsequent edits target this id.
        if (!initial) window.location.assign(`/admin/quotes/${res.id}/edit?saved=1`);
      } else {
        setDlError(res.error ?? "Save failed — nothing downloaded.");
      }
    } catch (e) {
      setDlError(`Download failed: ${(e as Error).message}`);
    } finally {
      setDownloading(null);
    }
  }

  const revId = initial ? fullQuoteId(initial.quote_no, state?.version ?? initial.version) : null;

  return (
    <form action={action} ref={formRef} className="quote-form">
      <input type="hidden" name="id" value={initial?.id ?? ""} />
      <input type="hidden" name="items" value={JSON.stringify(cleanItems)} />
      <input type="hidden" name="gst_rate" value={gstRate} />

      <Banner state={state} dl={dlError} />

      <div className="card-panel" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="qf-h" style={{ marginBottom: 0 }}>Quote details</h3>
          {revId && (
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--cyan)" }}>
              {revId}
            </span>
          )}
        </div>
        <div className="qf-grid" style={{ marginTop: 16 }}>
          <div className="field">
            <label>Quotation No.</label>
            <input className="input" name="quote_no" defaultValue={initial?.quote_no ?? suggestedNumber} required />
          </div>
          <div className="field">
            <label>Date</label>
            <input className="input" type="date" name="quote_date" defaultValue={initial?.quote_date ?? today} required />
          </div>
          <div className="field">
            <label>Valid Until</label>
            <input className="input" name="valid_until" defaultValue={initial?.valid_until ?? defaults.validity} />
          </div>
          <div className="field">
            <label>Location</label>
            <input className="input" name="location" defaultValue={initial?.location ?? ""} placeholder="e.g. Bangalore" />
          </div>
          <div className="field">
            <label>Client Name</label>
            <input className="input" name="client_name" defaultValue={initial?.client_name ?? ""} required placeholder="Client / company name" />
          </div>
          <div className="field">
            <label>Email / Phone</label>
            <input className="input" name="client_contact" defaultValue={initial?.client_contact ?? ""} placeholder="client@email.com / 90000 00000" />
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label>Scope of Work (optional)</label>
          <textarea className="textarea" name="scope_of_work" defaultValue={initial?.scope_of_work ?? defaults.scopeOfWork} placeholder="Supply and installation of …" />
        </div>
      </div>

      <div className="card-panel" style={{ marginBottom: 18 }}>
        <h3 className="qf-h">Line items</h3>
        <div className="qt-head">
          <span>Item</span><span>Qty</span><span>Price / Unit</span><span>Amount</span><span />
        </div>
        {items.map((it, i) => (
          <div className="qt-row" key={i}>
            <input className="input" value={it.item} onChange={(e) => setItem(i, { item: e.target.value })} placeholder="Product / service" />
            <input className="input" type="number" min={0} step="1" value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
            <input className="input" type="number" min={0} step="0.01" value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })} />
            <div className="qt-amt">{rs(lineAmount(it))}</div>
            <button type="button" className="qt-del" onClick={() => removeItem(i)} aria-label="Remove" disabled={items.length === 1}>
              <i className="fas fa-trash" />
            </button>
          </div>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={addItem}>
          <i className="fas fa-plus" /> Add item
        </button>

        <div className="qt-totals">
          <div className="qt-trow"><span>Net Amount</span><b>{rs(net)}</b></div>
          <div className="qt-trow">
            <span>GST
              <input className="input qt-gst" type="number" min={0} max={100} step="0.5" value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} />%
            </span>
            <b>{rs(gst)}</b>
          </div>
          <div className="qt-trow grand"><span>Total Amount</span><b>{rs(total)}</b></div>
        </div>
      </div>

      <div className="card-panel" style={{ marginBottom: 18 }}>
        <h3 className="qf-h">Notes (optional)</h3>
        <textarea className="textarea" name="notes" defaultValue={initial?.notes ?? ""} placeholder="Any extra note to print under Terms & Conditions…" />
        <p className="muted" style={{ fontSize: "0.8rem", marginTop: 8 }}>
          Bank details, GST default, About and Terms &amp; Conditions come from <a href="/admin/quotes/settings" style={{ color: "var(--cyan)" }}>Quote settings</a>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button type="submit" className="btn btn-primary" disabled={pending || cleanItems.length === 0}>
          <i className={`fas ${pending ? "fa-spinner fa-spin" : "fa-floppy-disk"}`} />{" "}
          {pending ? "Saving…" : initial ? "Save changes" : "Save quote"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => saveThenDownload("pdf")} disabled={downloading !== null || cleanItems.length === 0}>
          <i className={`fas ${downloading === "pdf" ? "fa-spinner fa-spin" : "fa-file-pdf"}`} />{" "}
          {downloading === "pdf" ? "Saving…" : "Save & PDF"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => saveThenDownload("docx")} disabled={downloading !== null || cleanItems.length === 0}>
          <i className={`fas ${downloading === "docx" ? "fa-spinner fa-spin" : "fa-file-word"}`} />{" "}
          {downloading === "docx" ? "Saving…" : "Save & Word"}
        </button>
        <a href="/admin/quotes" className="btn btn-ghost" style={{ marginLeft: "auto" }}>Cancel</a>
      </div>
      <p className="muted" style={{ fontSize: "0.78rem", marginTop: 10 }}>
        Save &amp; PDF / Word save your current edits first — a new revision is created only if something changed.
      </p>
    </form>
  );
}
