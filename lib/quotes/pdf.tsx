import {
  Document, Page, View, Text, Image, StyleSheet, renderToBuffer,
} from "@react-pdf/renderer";
import type { QuoteRecord, QuoteSettings } from "./types";
import { computeTotals, lineAmount, rs } from "./compute";
import { LOGO_DATA_URI, QR_DATA_URI, BANNER_DATA_URI } from "./assets";

const NAVY = "#16223f";
const BLUE = "#2563eb";
const LIGHT = "#eef2f8";
const BORDER = "#cbd5e1";
const MUTED = "#64748b";

const s = StyleSheet.create({
  page: { paddingTop: 30, paddingBottom: 88, paddingHorizontal: 34, fontSize: 9, color: "#1f2937", fontFamily: "Helvetica" },
  logo: { width: 230, alignSelf: "center", marginBottom: 6 },
  headLine: { textAlign: "center", fontSize: 8.5, color: MUTED },
  headStrong: { textAlign: "center", fontSize: 8.5, color: NAVY, marginTop: 2 },
  rule: { borderBottomWidth: 1.5, borderBottomColor: BLUE, marginTop: 8, marginBottom: 12 },

  titleBar: { backgroundColor: NAVY, paddingVertical: 7, borderRadius: 3, marginBottom: 12 },
  titleText: { color: "#fff", textAlign: "center", fontSize: 13, fontFamily: "Helvetica-Bold", letterSpacing: 1 },

  sectionBar: { backgroundColor: NAVY, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 2, marginTop: 14, marginBottom: 7 },
  sectionText: { color: "#fff", fontSize: 10, fontFamily: "Helvetica-Bold" },

  // meta table
  metaRow: { flexDirection: "row", borderBottomWidth: 1, borderRightWidth: 1, borderColor: BORDER },
  metaLabel: { width: 120, backgroundColor: LIGHT, padding: 5, fontFamily: "Helvetica-Bold", color: NAVY, borderLeftWidth: 1, borderTopWidth: 1, borderColor: BORDER },
  metaValue: { flex: 1, padding: 5, borderTopWidth: 1, borderColor: BORDER },

  // pricing table
  tHead: { flexDirection: "row", backgroundColor: NAVY },
  th: { color: "#fff", padding: 6, fontFamily: "Helvetica-Bold", fontSize: 9 },
  tRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER },
  td: { padding: 6 },
  cItem: { width: "46%" },
  cQty: { width: "12%", textAlign: "center" },
  cUnit: { width: "21%", textAlign: "right" },
  cAmt: { width: "21%", textAlign: "right" },
  totRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER },
  totLabel: { width: "79%", padding: 6, textAlign: "right", fontFamily: "Helvetica-Bold", color: NAVY },
  totVal: { width: "21%", padding: 6, textAlign: "right", fontFamily: "Helvetica-Bold" },
  grandRow: { flexDirection: "row", backgroundColor: LIGHT },
  grandLabel: { width: "79%", padding: 7, textAlign: "right", fontFamily: "Helvetica-Bold", color: NAVY, fontSize: 10.5 },
  grandVal: { width: "21%", padding: 7, textAlign: "right", fontFamily: "Helvetica-Bold", color: BLUE, fontSize: 10.5 },

  payWrap: { flexDirection: "row", gap: 14 },
  payCol: { flex: 1 },
  payLine: { marginBottom: 3 },
  payKey: { fontFamily: "Helvetica-Bold", color: NAVY },
  qrBox: { width: 120, alignItems: "center" },
  qr: { width: 104, height: 104 },
  qrCap: { fontSize: 7.5, color: MUTED, marginTop: 4, textAlign: "center" },

  termHeading: { fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 7, marginBottom: 2, fontSize: 9.5 },
  termPoint: { marginBottom: 2.5, lineHeight: 1.4 },
  termLabel: { fontFamily: "Helvetica-Bold" },

  footer: { position: "absolute", bottom: 0, left: 0, right: 0 },
  footerImg: { width: "100%" },
});

function QuoteDoc({ q, cfg }: { q: QuoteRecord; cfg: QuoteSettings }) {
  const { net, gst, total } = computeTotals(q.items, q.gst_rate);
  const meta: Array<[string, string]> = [
    ["Quotation No:", q.quote_no],
    ["Date:", q.quote_date],
    ["Valid Until:", q.valid_until],
    ["Location:", q.location],
    ["Client Name:", q.client_name],
    ["Email / Phone:", q.client_contact],
  ];
  return (
    <Document title={q.quote_no} author={cfg.companyName}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={s.logo} src={LOGO_DATA_URI} />
        <Text style={s.headLine}>{cfg.address}</Text>
        <Text style={s.headStrong}>GSTIN: {cfg.gstin}  |  Contact No: {cfg.phone}  |  Website: {cfg.website}</Text>
        <View style={s.rule} />

        {/* Title */}
        <View style={s.titleBar}><Text style={s.titleText}>COMMERCIAL QUOTATION</Text></View>

        {/* Meta */}
        <View>
          {meta.map(([k, v]) => (
            <View style={s.metaRow} key={k}>
              <Text style={s.metaLabel}>{k}</Text>
              <Text style={s.metaValue}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={s.sectionBar}><Text style={s.sectionText}>Product &amp; Service Pricing Details</Text></View>
        <View>
          <View style={s.tHead}>
            <Text style={[s.th, s.cItem]}>Item</Text>
            <Text style={[s.th, s.cQty]}>Qty</Text>
            <Text style={[s.th, s.cUnit]}>Price / Unit</Text>
            <Text style={[s.th, s.cAmt]}>Amount</Text>
          </View>
          {q.items.map((it, i) => (
            <View style={s.tRow} key={i}>
              <Text style={[s.td, s.cItem]}>{it.item}</Text>
              <Text style={[s.td, s.cQty]}>{it.qty}</Text>
              <Text style={[s.td, s.cUnit]}>{rs(it.unitPrice)}</Text>
              <Text style={[s.td, s.cAmt]}>{rs(lineAmount(it))}</Text>
            </View>
          ))}
          <View style={s.totRow}><Text style={s.totLabel}>Net Amount</Text><Text style={s.totVal}>{rs(net)}</Text></View>
          <View style={s.totRow}><Text style={s.totLabel}>GST ({q.gst_rate}%)</Text><Text style={s.totVal}>{rs(gst)}</Text></View>
          <View style={s.grandRow}><Text style={s.grandLabel}>Total Amount</Text><Text style={s.grandVal}>{rs(total)}</Text></View>
        </View>

        {/* Payment */}
        <View style={s.sectionBar}><Text style={s.sectionText}>Payment Information</Text></View>
        <View style={s.payWrap}>
          <View style={s.payCol}>
            <Text style={s.payLine}><Text style={s.payKey}>Account Name: </Text>{cfg.accountName}</Text>
            <Text style={s.payLine}><Text style={s.payKey}>Account No: </Text>{cfg.accountNo}</Text>
            <Text style={s.payLine}><Text style={s.payKey}>IFSC Code: </Text>{cfg.ifsc}</Text>
            <Text style={s.payLine}><Text style={s.payKey}>Branch: </Text>{cfg.branch}</Text>
            <Text style={s.payLine}><Text style={s.payKey}>Account Type: </Text>{cfg.accountType}</Text>
          </View>
          <View style={s.qrBox}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={s.qr} src={QR_DATA_URI} />
            <Text style={s.qrCap}>{cfg.upiNote}</Text>
          </View>
        </View>

        {/* Terms */}
        <View style={s.sectionBar}><Text style={s.sectionText}>Terms &amp; Conditions</Text></View>
        <View>
          {cfg.terms.map((sec, i) => (
            <View key={i} wrap={false}>
              <Text style={s.termHeading}>{i + 1}. {sec.heading}</Text>
              {sec.points.map((p, j) => (
                <Text style={s.termPoint} key={j}>
                  {p.label ? <Text style={s.termLabel}>{p.label}: </Text> : null}
                  {p.text}
                </Text>
              ))}
            </View>
          ))}
          {q.notes ? <Text style={[s.termPoint, { marginTop: 6 }]}>{q.notes}</Text> : null}
        </View>

        {/* Footer banner */}
        <View style={s.footer} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={s.footerImg} src={BANNER_DATA_URI} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderQuotePdf(q: QuoteRecord, cfg: QuoteSettings): Promise<Buffer> {
  return renderToBuffer(<QuoteDoc q={q} cfg={cfg} />);
}
