import { getSession } from "@/lib/auth";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminTopBar } from "@/components/AdminTopBar";
import { loadQuoteSettings } from "@/lib/quotes/settings-server";
import { saveSettingsAction } from "../actions";

export const metadata = { title: "Quote Settings" };
export const dynamic = "force-dynamic";

function Field({ name, label, value, type = "text" }: { name: string; label: string; value: string | number; type?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input className="input" name={name} defaultValue={String(value)} type={type} />
    </div>
  );
}

export default async function QuoteSettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const session = await getSession();
  if (!session) return <AdminLogin />;
  const { saved } = await searchParams;
  const cfg = await loadQuoteSettings();

  return (
    <>
      <AdminTopBar title="Quote Settings" username={session.username} activeTab="quotes" />
      <div className="admin-wrap">
        <div className="admin-head">
          <div>
            <h1>Quote settings</h1>
            <p className="muted">Defaults used on every quote — company header, bank details, GST &amp; terms.</p>
          </div>
          <a href="/admin/quotes" className="btn btn-ghost">← Back</a>
        </div>

        {saved && <div className="saved-banner"><i className="fas fa-circle-check" /> Settings saved.</div>}

        <form action={saveSettingsAction}>
          <div className="card-panel" style={{ marginBottom: 18 }}>
            <h3 className="qf-h">Company header</h3>
            <div className="qf-grid">
              <Field name="companyName" label="Company name" value={cfg.companyName} />
              <Field name="gstin" label="GSTIN" value={cfg.gstin} />
              <Field name="phone" label="Contact no." value={cfg.phone} />
              <Field name="website" label="Website" value={cfg.website} />
            </div>
            <div className="field" style={{ marginTop: 6 }}>
              <label>Address</label>
              <input className="input" name="address" defaultValue={cfg.address} />
            </div>
          </div>

          <div className="card-panel" style={{ marginBottom: 18 }}>
            <h3 className="qf-h">Bank / payment details</h3>
            <div className="qf-grid">
              <Field name="accountName" label="Account name" value={cfg.accountName} />
              <Field name="accountNo" label="Account no." value={cfg.accountNo} />
              <Field name="ifsc" label="IFSC code" value={cfg.ifsc} />
              <Field name="branch" label="Branch" value={cfg.branch} />
              <Field name="accountType" label="Account type" value={cfg.accountType} />
              <Field name="upiNote" label="UPI caption" value={cfg.upiNote} />
            </div>
            <p className="muted" style={{ fontSize: "0.8rem", marginTop: 10 }}>
              The UPI QR image is embedded from your template. To change it, replace the asset and redeploy.
            </p>
          </div>

          <div className="card-panel" style={{ marginBottom: 18 }}>
            <h3 className="qf-h">Defaults</h3>
            <div className="qf-grid">
              <Field name="gstRate" label="GST rate (%)" value={cfg.gstRate} type="number" />
              <Field name="validity" label="Validity text" value={cfg.validity} />
              <Field name="numberPrefix" label="Quote no. prefix" value={cfg.numberPrefix} />
              <Field name="numberPadding" label="Number padding" value={cfg.numberPadding} type="number" />
              <Field name="numberStart" label="Start number" value={cfg.numberStart} type="number" />
            </div>
          </div>

          <div className="card-panel" style={{ marginBottom: 18 }}>
            <h3 className="qf-h">Terms &amp; Conditions (advanced)</h3>
            <p className="muted" style={{ fontSize: "0.82rem", marginBottom: 10 }}>
              JSON array of sections: <code>{`[{ "heading": "...", "points": [{ "label": "...", "text": "..." }] }]`}</code>
            </p>
            <textarea className="textarea" name="terms_json" rows={16} defaultValue={JSON.stringify(cfg.terms, null, 2)} style={{ fontFamily: "monospace", fontSize: "0.82rem", minHeight: 280 }} />
          </div>

          <button type="submit" className="btn btn-primary"><i className="fas fa-floppy-disk" /> Save settings</button>
        </form>
      </div>
    </>
  );
}
