import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminTopBar } from "@/components/AdminTopBar";
import { listQuotes } from "@/lib/quotes/server";
import { computeTotals, rs } from "@/lib/quotes/compute";
import { deleteQuoteAction, duplicateQuoteAction } from "./actions";

export const metadata = { title: "Quotes" };
export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const session = await getSession();
  if (!session) return <AdminLogin />;

  const quotes = await listQuotes();

  return (
    <>
      <AdminTopBar title="Quote Builder" username={session.username} activeTab="quotes" />
      <div className="admin-wrap">
        <div className="admin-head">
          <div>
            <h1>Quotes</h1>
            <p className="muted">Create commercial quotations and download as PDF or Word.</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/admin/quotes/settings" className="btn btn-ghost"><i className="fas fa-gear" /> Settings</Link>
            <Link href="/admin/quotes/new" className="btn btn-primary"><i className="fas fa-plus" /> New quote</Link>
          </div>
        </div>

        {quotes.length === 0 ? (
          <div className="admin-empty">
            <p style={{ marginBottom: 14 }}>No quotes yet. Create your first one.</p>
            <Link href="/admin/quotes/new" className="btn btn-primary"><i className="fas fa-plus" /> New quote</Link>
          </div>
        ) : (
          <table className="qlist">
            <thead>
              <tr>
                <th>Quote No.</th><th>Client</th><th>Date</th><th style={{ textAlign: "right" }}>Total</th><th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => {
                const { total } = computeTotals(q.items, q.gst_rate);
                return (
                  <tr key={q.id}>
                    <td><Link href={`/admin/quotes/${q.id}/edit`} className="qno">{q.quote_no}</Link></td>
                    <td>{q.client_name}</td>
                    <td>{q.quote_date}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{rs(total)}</td>
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
                          <button type="submit" className="qlink danger"><i className="fas fa-trash" /></button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
