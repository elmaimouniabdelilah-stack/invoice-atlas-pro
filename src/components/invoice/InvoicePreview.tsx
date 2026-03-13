import { Invoice } from "@/types/invoice";

interface InvoicePreviewProps {
  invoice: Invoice;
}

function numberToWords(n: number): string {
  if (n === 0) return "zéro";
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];

  if (n < 10) return units[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (t === 7 || t === 9) return tens[t - 1] + "-" + teens[u];
    return tens[t] + (u ? "-" + units[u] : "");
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return (h === 1 ? "cent" : units[h] + " cent") + (rest ? " " + numberToWords(rest) : "");
  }
  if (n < 1000000) {
    const th = Math.floor(n / 1000);
    const rest = n % 1000;
    return (th === 1 ? "mille" : numberToWords(th) + " mille") + (rest ? " " + numberToWords(rest) : "");
  }
  return String(n);
}

function amountInWords(amount: number): string {
  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);
  let result = numberToWords(intPart);
  if (decPart > 0) {
    result += " dirhams et " + numberToWords(decPart) + " centimes";
  } else {
    result += " dirhams";
  }
  return result;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  return (
    <div id="invoice-preview" className="bg-white max-w-4xl mx-auto print:shadow-none" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: "#000", fontSize: "13px" }}>
      <div className="p-10">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          {/* Left: Logo + Company */}
          <div>
            {invoice.logo && (
              <img src={invoice.logo} alt="Logo" className="h-16 mb-3 object-contain" />
            )}
            <div style={{ fontSize: "18px", fontWeight: 700 }}>
              {invoice.vendor.raisonSociale || "Nom de l'entreprise"}
            </div>
            {invoice.vendor.adresse && (
              <div style={{ fontSize: "12px", marginTop: "4px" }}>{invoice.vendor.adresse}</div>
            )}
            {invoice.vendor.telephone && (
              <div style={{ fontSize: "12px" }}>Tél: {invoice.vendor.telephone}</div>
            )}
            {invoice.vendor.email && (
              <div style={{ fontSize: "12px" }}>{invoice.vendor.email}</div>
            )}
          </div>

          {/* Right: Invoice info */}
          <div className="text-right">
            <div style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>FACTURE</div>
            <div style={{ fontSize: "15px", fontWeight: 600 }}>{invoice.number}</div>
            <div style={{ fontSize: "12px", marginTop: "8px" }}>Date: {invoice.date}</div>
            {invoice.dueDate && invoice.dueDate !== invoice.date && (
              <div style={{ fontSize: "12px" }}>Échéance: {invoice.dueDate}</div>
            )}
          </div>
        </div>

        {/* Seller admin details */}
        <div className="flex gap-6 mb-6" style={{ fontSize: "11px" }}>
          {invoice.vendor.ice && <span>ICE: {invoice.vendor.ice}</span>}
          {invoice.vendor.ifNumber && <span>IF: {invoice.vendor.ifNumber}</span>}
          {invoice.vendor.rc && <span>RC: {invoice.vendor.rc}</span>}
          {invoice.vendor.cnss && <span>CNSS: {invoice.vendor.cnss}</span>}
        </div>

        {/* Buyer */}
        <div className="mb-6 border border-black p-4">
          <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px", color: "#555" }}>
            Client
          </div>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>
            {invoice.buyer.nomClient || "—"}
          </div>
          {invoice.buyer.adresse && (
            <div style={{ fontSize: "12px", marginTop: "2px" }}>{invoice.buyer.adresse}</div>
          )}
          {invoice.buyer.ice && (
            <div style={{ fontSize: "12px", marginTop: "2px" }}>ICE: {invoice.buyer.ice}</div>
          )}
        </div>

        {/* Auto-entrepreneur notice */}
        {invoice.isAutoEntrepreneur && (
          <div className="mb-4 p-3 border border-black" style={{ fontSize: "11px" }}>
            Auto-entrepreneur — Exonéré de TVA conformément aux dispositions de l'article 89-I-12° du Code Général des Impôts.
          </div>
        )}

        {/* Items Table */}
        <table className="w-full mb-6" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th className="text-left p-2" style={{ borderBottom: "2px solid #000", fontSize: "11px", fontWeight: 600 }}>Description</th>
              <th className="text-center p-2" style={{ borderBottom: "2px solid #000", fontSize: "11px", fontWeight: 600, width: "70px" }}>Quantité</th>
              <th className="text-right p-2" style={{ borderBottom: "2px solid #000", fontSize: "11px", fontWeight: 600, width: "100px" }}>Prix unitaire</th>
              {!invoice.isAutoEntrepreneur && (
                <th className="text-center p-2" style={{ borderBottom: "2px solid #000", fontSize: "11px", fontWeight: 600, width: "70px" }}>TVA</th>
              )}
              <th className="text-right p-2" style={{ borderBottom: "2px solid #000", fontSize: "11px", fontWeight: 600, width: "100px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.articles.map((article) => (
              <tr key={article.id}>
                <td className="p-2" style={{ borderBottom: "1px solid #ddd" }}>{article.description || "—"}</td>
                <td className="text-center p-2" style={{ borderBottom: "1px solid #ddd" }}>{article.quantity}</td>
                <td className="text-right p-2" style={{ borderBottom: "1px solid #ddd" }}>{article.unitPrice.toFixed(2)}</td>
                {!invoice.isAutoEntrepreneur && (
                  <td className="text-center p-2" style={{ borderBottom: "1px solid #ddd" }}>{article.tvaRate}%</td>
                )}
                <td className="text-right p-2" style={{ borderBottom: "1px solid #ddd", fontWeight: 600 }}>
                  {(article.quantity * article.unitPrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div style={{ width: "280px" }}>
            <div className="flex justify-between py-1" style={{ fontSize: "13px" }}>
              <span>Total HT</span>
              <span>{invoice.totalHT.toFixed(2)} DH</span>
            </div>
            {invoice.discountValue > 0 && (
              <div className="flex justify-between py-1" style={{ fontSize: "13px" }}>
                <span>Remise {invoice.discountType === "percentage" ? `(${invoice.discountValue}%)` : ""}</span>
                <span>-{invoice.discountType === "percentage"
                  ? (invoice.totalHT * invoice.discountValue / 100).toFixed(2)
                  : invoice.discountValue.toFixed(2)} DH</span>
              </div>
            )}
            {!invoice.isAutoEntrepreneur && (
              <div className="flex justify-between py-1" style={{ fontSize: "13px" }}>
                <span>Total TVA</span>
                <span>{invoice.totalTVA.toFixed(2)} DH</span>
              </div>
            )}
            <div className="flex justify-between py-2 mt-1" style={{ borderTop: "2px solid #000", fontSize: "14px", fontWeight: 700 }}>
              <span>Total TTC</span>
              <span>{invoice.totalTTC.toFixed(2)} DH</span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div className="mb-6 p-3" style={{ border: "1px solid #000", fontSize: "12px" }}>
          Arrêtée la présente facture à la somme de: <strong>{amountInWords(invoice.totalTTC)}</strong>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-3 text-center" style={{ borderTop: "1px solid #000", fontSize: "10px" }}>
          <div>
            {invoice.vendor.raisonSociale}
            {invoice.vendor.ice && ` — ICE: ${invoice.vendor.ice}`}
            {invoice.vendor.ifNumber && ` — IF: ${invoice.vendor.ifNumber}`}
            {invoice.vendor.rc && ` — RC: ${invoice.vendor.rc}`}
          </div>
          {invoice.vendor.adresse && <div>{invoice.vendor.adresse}</div>}
          {invoice.vendor.telephone && <div>Tél: {invoice.vendor.telephone}</div>}
        </div>
      </div>
    </div>
  );
}
