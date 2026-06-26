import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminTopBar } from "@/components/AdminTopBar";
import { QuoteForm } from "@/components/QuoteForm";
import { getQuote } from "@/lib/quotes/server";
import { loadQuoteSettings } from "@/lib/quotes/settings-server";

export const metadata = { title: "Edit Quote" };
export const dynamic = "force-dynamic";

export default async function EditQuotePage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await getSession();
  if (!session) return <AdminLogin />;

  const { id } = await params;
  const { saved } = await searchParams;
  const q = await getQuote(Number(id));
  if (!q) notFound();
  const cfg = await loadQuoteSettings();
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <AdminTopBar title={`Quote ${q.quote_no}`} username={session.username} activeTab="quotes" />
      <div className="admin-wrap">
        <div className="admin-head">
          <div>
            <h1>Edit quote</h1>
            <p className="muted">{q.quote_no} · {q.client_name}</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href={`/admin/quotes/${q.id}/pdf`} target="_blank" rel="noopener" className="btn btn-ghost"><i className="fas fa-file-pdf" /> PDF</a>
            <a href={`/admin/quotes/${q.id}/docx`} className="btn btn-ghost"><i className="fas fa-file-word" /> Word</a>
            <a href="/admin/quotes" className="btn btn-ghost">← Back</a>
          </div>
        </div>
        {saved && (
          <div className="saved-banner"><i className="fas fa-circle-check" /> Quote saved. Use the PDF / Word buttons above to download.</div>
        )}
        <QuoteForm initial={q} suggestedNumber={q.quote_no} today={today} defaults={{ gstRate: cfg.gstRate, validity: cfg.validity }} />
      </div>
    </>
  );
}
