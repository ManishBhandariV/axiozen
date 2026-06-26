import { getSession } from "@/lib/auth";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminTopBar } from "@/components/AdminTopBar";
import { QuoteForm } from "@/components/QuoteForm";
import { nextQuoteNumber } from "@/lib/quotes/server";
import { loadQuoteSettings } from "@/lib/quotes/settings-server";

export const metadata = { title: "New Quote" };
export const dynamic = "force-dynamic";

export default async function NewQuotePage() {
  const session = await getSession();
  if (!session) return <AdminLogin />;

  const [num, cfg] = await Promise.all([nextQuoteNumber(), loadQuoteSettings()]);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <AdminTopBar title="New Quote" username={session.username} activeTab="quotes" />
      <div className="admin-wrap">
        <div className="admin-head">
          <div>
            <h1>New quote</h1>
            <p className="muted">Fill in the details and save — then download as PDF or Word.</p>
          </div>
          <a href="/admin/quotes" className="btn btn-ghost">← Back</a>
        </div>
        <QuoteForm suggestedNumber={num} today={today} defaults={{ gstRate: cfg.gstRate, validity: cfg.validity }} />
      </div>
    </>
  );
}
