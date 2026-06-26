import { getSession } from "@/lib/auth";
import { getQuote } from "@/lib/quotes/server";
import { loadQuoteSettings } from "@/lib/quotes/settings-server";
import { renderQuoteDocx } from "@/lib/quotes/docx";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const q = await getQuote(Number(id));
  if (!q) return new Response("Not found", { status: 404 });

  const cfg = await loadQuoteSettings();
  const buf = await renderQuoteDocx(q, cfg);
  const filename = (q.quote_no || "quote").replace(/[^\w.-]+/g, "_") + ".docx";

  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
