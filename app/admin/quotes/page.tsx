import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminTopBar } from "@/components/AdminTopBar";
import { listQuotes } from "@/lib/quotes/server";
import { computeTotals } from "@/lib/quotes/compute";
import { QuotesTableClient, type QuoteRowView } from "@/components/QuotesTableClient";

export const metadata = { title: "Quotes" };
export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const session = await getSession();
  if (!session) return <AdminLogin />;

  const quotes = await listQuotes();
  const rows: QuoteRowView[] = quotes.map((q) => ({
    id: q.id,
    quoteNo: q.quote_no,
    version: q.version,
    client: q.client_name,
    location: q.location,
    date: q.quote_date,
    total: computeTotals(q.items, q.gst_rate).total,
  }));

  return (
    <>
      <AdminTopBar title="Quote Builder" username={session.username} activeTab="quotes" />
      <div className="admin-wrap">
        <div className="admin-head">
          <div>
            <h1>Quotes</h1>
            <p className="muted">Create commercial quotations and download as PDF or Word. Click a column header to sort.</p>
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
          <QuotesTableClient quotes={rows} />
        )}
      </div>
    </>
  );
}
