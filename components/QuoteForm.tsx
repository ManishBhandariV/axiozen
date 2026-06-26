"use client";

import { useState } from "react";
import { saveQuoteAction } from "@/app/admin/quotes/actions";
import { computeTotals, lineAmount, rs } from "@/lib/quotes/compute";
import type { QuoteItem, QuoteRecord } from "@/lib/quotes/types";

type Props = {
  initial?: QuoteRecord;
  suggestedNumber: string;
  today: string;
  defaults: { gstRate: number; validity: string };
};

const EMPTY: QuoteItem = { item: "", qty: 1, unitPrice: 0 };

export function QuoteForm({ initial, suggestedNumber, today, defaults }: Props) {
  const [items, setItems] = useState<QuoteItem[]>(
    initial?.items?.length ? initial.items : [{ ...EMPTY }],
  );
  const [gstRate, setGstRate] = useState<number>(initial?.gst_rate ?? defaults.gstRate);

  const { net, gst, total } = computeTotals(items, gstRate);

  const setItem = (i: number, patch: Partial<QuoteItem>) =>
    setItems((arr) => arr.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const addItem = () => setItems((arr) => [...arr, { ...EMPTY }]);
  const removeItem = (i: number) => setItems((arr) => arr.filter((_, j) => j !== i));

  return (
    <form action={saveQuoteAction} className="quote-form">
      <input type="hidden" name="id" value={initial?.id ?? ""} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="gst_rate" value={gstRate} />

      <div className="card-panel" style={{ marginBottom: 18 }}>
        <h3 className="qf-h">Quote details</h3>
        <div className="qf-grid">
          <div className="field">
            <label>Quotation No.</label>
            <input className="input" name="quote_no" defaultValue={initial?.quote_no ?? suggestedNumber} required />
          </div>
          <div className="field">
            <label>Date</label>
            <input className="input" name="quote_date" defaultValue={initial?.quote_date ?? today} required />
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
              <input className="input qt-gst" type="number" min={0} step="0.5" value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} />%
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
          Bank details, GST default and Terms &amp; Conditions come from <a href="/admin/quotes/settings" style={{ color: "var(--cyan)" }}>Quote settings</a>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="submit" className="btn btn-primary">
          <i className="fas fa-floppy-disk" /> Save quote
        </button>
        <a href="/admin/quotes" className="btn btn-ghost">Cancel</a>
      </div>
    </form>
  );
}
