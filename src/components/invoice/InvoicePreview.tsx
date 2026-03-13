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
    <div id="invoice-preview" className="bg-white max-w-4xl mx-auto print:shadow-none" style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#222" }}>
      <div className="px-12 py-10">

        {/* Header: Company name left, Invoice info right */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {invoice.logo && (
              <img src={invoice.logo} alt="Logo" className="h-12 mb-2 object-contain" />
            )}
            <p className="text-lg font-bold" style={{ color: "#111" }}>
              {invoice.vendor.raisonSociale || "Nom de l'entreprise"}
            </p>
            {invoice.vendor.adresse && <p className="text-xs mt-0.5" style={{ color: "#555" }}>{invoice.vendor.adresse}</p>}
            {invoice.vendor.telephone && <p className="text-xs" style={{ color: "#555" }}>Tél: {invoice.vendor.telephone}</p>}
            {invoice.vendor.email && <p className="text-xs" style={{ color: "#555" }}>{invoice.vendor.email}</p>}
            {invoice.vendor.ice && <p className="text-xs mt-1" style={{ color: "#555" }}>ICE: {invoice.vendor.ice}</p>}
            {invoice.vendor.ifNumber && <p className="text-xs" style={{ color: "#555" }}>IF: {invoice.vendor.ifNumber}</p>}
            {invoice.vendor.rc && <p className="text-xs" style={{ color: "#555" }}>RC: {invoice.vendor.rc}</p>}
            {invoice.vendor.cnss && <p className="text-xs" style={{ color: "#555" }}>CNSS: {invoice.vendor.cnss}</p>}
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-sm font-medium" style={{ color: "#555" }}>Facture N°</p>
            <p className="text-xl font-bold" style={{ color: "#111" }}>{invoice.number}</p>
            <p className="text-xs mt-1" style={{ color: "#888" }}>Date: {invoice.date}</p>
            {invoice.dueDate && invoice.dueDate !== invoice.date && (
              <p className="text-xs" style={{ color: "#888" }}>Échéance: {invoice.dueDate}</p>
            )}
            {invoice.isAutoEntrepreneur && (
              <p className="text-xs mt-1 font-medium" style={{ color: "#555" }}>Auto-entrepreneur · TVA 0%</p>
            )}
          </div>
        </div>

        {/* Buyer info box */}
        <div className="mb-6 border rounded px-5 py-4" style={{ borderColor: "#ddd" }}>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#888" }}>
            Informations de l'acheteur
          </p>
          <p className="text-sm font-semibold" style={{ color: "#111" }}>
            {invoice.buyer.nomClient || "—"}
          </p>
          {invoice.buyer.ice && <p className="text-xs" style={{ color: "#555" }}>ICE: {invoice.buyer.ice}</p>}
          {invoice.buyer.adresse && <p className="text-xs" style={{ color: "#555" }}>{invoice.buyer.adresse}</p>}
        </div>

        {/* Articles table - clean, no borders, just lines */}
        <div className="mb-6">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th className="text-left py-2.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#555" }}>Description</th>
                <th className="text-center py-2.5 text-[11px] font-semibold uppercase tracking-wider w-20" style={{ color: "#555" }}>Quantité</th>
                <th className="text-right py-2.5 text-[11px] font-semibold uppercase tracking-wider w-24" style={{ color: "#555" }}>Prix unitaire</th>
                <th className="text-right py-2.5 text-[11px] font-semibold uppercase tracking-wider w-20" style={{ color: "#555" }}>Taux TVA</th>
                <th className="text-right py-2.5 text-[11px] font-semibold uppercase tracking-wider w-24" style={{ color: "#555" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.articles.map((article) => (
                <tr key={article.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td className="py-3 text-sm" style={{ color: "#222" }}>{article.description || "—"}</td>
                  <td className="py-3 text-center text-sm" style={{ color: "#222" }}>{article.quantity}</td>
                  <td className="py-3 text-right text-sm" style={{ color: "#222" }}>{article.unitPrice.toFixed(2)}</td>
                  <td className="py-3 text-right text-sm" style={{ color: "#222" }}>{invoice.isAutoEntrepreneur ? "0" : article.tvaRate}%</td>
                  <td className="py-3 text-right text-sm font-semibold" style={{ color: "#111" }}>{(article.quantity * article.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals - right aligned, simple */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-1.5 text-sm">
              <span style={{ color: "#555" }}>Total HT</span>
              <span style={{ color: "#222" }}>{invoice.totalHT.toFixed(2)} DH</span>
            </div>
            <div className="flex justify-between py-1.5 text-sm">
              <span style={{ color: "#555" }}>Total TVA</span>
              <span style={{ color: "#222" }}>{invoice.totalTVA.toFixed(2)} DH</span>
            </div>
            {invoice.discountValue > 0 && (
              <div className="flex justify-between py-1.5 text-sm">
                <span style={{ color: "#555" }}>Remise</span>
                <span style={{ color: "#222" }}>-{invoice.discountType === "percentage" ? `${invoice.discountValue}%` : `${invoice.discountValue.toFixed(2)} DH`}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-sm font-bold" style={{ borderTop: "2px solid #222", marginTop: "4px", color: "#111" }}>
              <span>Total TTC</span>
              <span>{invoice.totalTTC.toFixed(2)} DH</span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div className="rounded px-4 py-3 mb-6" style={{ backgroundColor: "#f7f7f7" }}>
          <p className="text-sm italic" style={{ color: "#444" }}>
            Arrêtée la présente facture à la somme de: <span className="font-bold" style={{ color: "#111" }}>{amountInWords(invoice.totalTTC)}</span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 text-center text-[10px]" style={{ borderTop: "1px solid #ddd", color: "#888" }}>
          <p>
            {invoice.vendor.raisonSociale}
            {invoice.vendor.ice && ` · ICE: ${invoice.vendor.ice}`}
            {invoice.vendor.telephone && ` · Tél: ${invoice.vendor.telephone}`}
          </p>
          {invoice.vendor.adresse && <p>{invoice.vendor.adresse}</p>}
        </div>
      </div>
    </div>
  );
}
