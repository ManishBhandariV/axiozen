"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { deleteQuoteAction, duplicateQuoteAction } from "@/app/admin/quotes/actions";
import { rs } from "@/lib/quotes/compute";

export type QuoteRowView = {
  id: number;
  quoteNo: string;
  version: number;
  client: string;
  location: string;
  date: string; // ISO yyyy-mm-dd (may also be a legacy display string)
  total: number;
};

type SortKey = "quote" | "client" | "date" | "total";
type SortDir = "asc" | "desc";

function prettyDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : iso;
}

export function QuotesTableClient({ quotes }: { quotes: QuoteRowView[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? quotes.filter(
          (r) =>
            r.quoteNo.toLowerCase().includes(q) ||
            r.client.toLowerCase().includes(q) ||
            r.location.toLowerCase().includes(q) ||
            r.date.toLowerCase().includes(q) ||
            prettyDate(r.date).includes(q),
        )
      : quotes.slice();

    const dir = sortDir === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "quote":
          cmp = a.quoteNo.localeCompare(b.quoteNo, undefined, { numeric: true });
          break;
        case "client":
          cmp = a.client.localeCompare(b.client, undefined, { sensitivity: "base" });
          break;
        case "date":
          cmp = a.date.localeCompare(b.date) || a.id - b.id;
          break;
        case "total":
          cmp = a.total - b.total;
          break;
      }
      return cmp * dir;
    });
    return filtered;
  }, [quotes, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "client" || key === "quote" ? "asc" : "desc");
    }
  }

  const arrow = (key: SortKey) => (key === sortKey ? (sortDir === "asc" ? " ▲" : " ▼") : "");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <i className="fas fa-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)", fontSize: "0.8rem" }} />
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by quote #, client, location or date…"
            style={{ width: "100%", paddingLeft: 32 }}
          />
        </div>
        <span className="muted" style={{ fontSize: "0.8rem" }}>{rows.length} of {quotes.length}</span>
      </div>

      <table className="qlist">
        <thead>
          <tr>
            <Th label={`Quote No.${arrow("quote")}`} onClick={() => toggleSort("quote")} />
            <Th label={`Client${arrow("client")}`} onClick={() => toggleSort("client")} />
            <Th label={`Date${arrow("date")}`} onClick={() => toggleSort("date")} />
            <Th label={`Total${arrow("total")}`} onClick={() => toggleSort("total")} align="right" />
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((q) => (
            <tr key={q.id}>
              <td>
                <Link href={`/admin/quotes/${q.id}/edit`} className="qno">{q.quoteNo}</Link>
                <span className="muted" style={{ fontWeight: 600, fontSize: "0.74rem" }}>{"  ·  "}rev {String(q.version).padStart(2, "0")}</span>
              </td>
              <td>
                {q.client}
                {q.location ? <span className="muted"> · {q.location}</span> : null}
              </td>
              <td>{prettyDate(q.date)}</td>
              <td style={{ textAlign: "right", fontWeight: 600 }}>{rs(q.total)}</td>
              <td>
                <div className="qactions">
                  <Link href={`/admin/quotes/${q.id}/edit`} className="qlink"><i className="fas fa-pen" /> Edit</Link>
                  <a href={`/admin/quotes/${q.id}/pdf`} className="qlink pdf" target="_blank" rel="noopener"><i className="fas fa-file-pdf" /> PDF</a>
                  <a href={`/admin/quotes/${q.id}/docx`} className="qlink doc"><i className="fas fa-file-word" /> Word</a>
                  <form action={duplicateQuoteAction}>
                    <input type="hidden" name="id" value={q.id} />
                    <button type="submit" className="qlink"><i className="fas fa-copy" /> Duplicate</button>
                  </form>
                  <form action={deleteQuoteAction}>
                    <input type="hidden" name="id" value={q.id} />
                    <button
                      type="submit"
                      className="qlink danger"
                      onClick={(e) => {
                        if (!confirm(`Delete quote ${q.quoteNo}? This cannot be undone.`)) e.preventDefault();
                      }}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 28 }}>
                No quotes match &ldquo;{query}&rdquo;.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Th({ label, onClick, align }: { label: string; onClick: () => void; align?: "right" }) {
  return (
    <th onClick={onClick} style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", textAlign: align }}>
      {label}
    </th>
  );
}
