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
  const hasVendorAdmin = invoice.vendor.ifNumber || invoice.vendor.rc || invoice.vendor.cnss;

  return (
    <div id="invoice-preview" className="bg-white max-w-4xl mx-auto print:shadow-none" style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000" }}>
      <div className="p-10">

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            {invoice.logo && (
              <img src={invoice.logo} alt="Logo" className="h-14 mb-3 object-contain" />
            )}
            <p className="text-lg font-bold">{invoice.vendor.raisonSociale || "Nom de l'entreprise"}</p>
            {invoice.vendor.adresse && <p className="text-sm mt-1">{invoice.vendor.adresse}</p>}
            {invoice.vendor.telephone && <p className="text-sm">Tél: {invoice.vendor.telephone}</p>}
            {invoice.vendor.email && <p className="text-sm">{invoice.vendor.email}</p>}
            {invoice.vendor.ice && <p className="text-sm mt-1">ICE: {invoice.vendor.ice}</p>}
            {invoice.vendor.ifNumber && <p className="text-sm">IF: {invoice.vendor.ifNumber}</p>}
            {invoice.vendor.rc && <p className="text-sm">RC: {invoice.vendor.rc}</p>}
            {invoice.vendor.cnss && <p className="text-sm">CNSS: {invoice.vendor.cnss}</p>}
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold tracking-tight">FACTURE</p>
            <p className="text-sm mt-2">N° <span className="font-bold">{invoice.number}</span></p>
            <p className="text-sm mt-1">Date: {invoice.date}</p>
            {invoice.dueDate && invoice.dueDate !== invoice.date && (
              <p className="text-sm">Échéance: {invoice.dueDate}</p>
            )}
            {invoice.isAutoEntrepreneur && (
              <p className="text-xs mt-2 font-semibold">Auto-entrepreneur</p>
            )}
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-black mb-6" />

        {/* Buyer */}
        <div className="mb-8">
          <div className="border border-black p-4">
            <p className="text-xs font-bold uppercase mb-2">Facturé à</p>
            <p className="text-base font-bold">{invoice.buyer.nomClient || "—"}</p>
            {invoice.buyer.ice && <p className="text-sm">ICE: {invoice.buyer.ice}</p>}
            {invoice.buyer.adresse && <p className="text-sm">{invoice.buyer.adresse}</p>}
          </div>
        </div>

        {/* Articles table */}
        <table className="w-full mb-8 border-collapse" style={{ borderColor: "#000" }}>
          <thead>
            <tr>
              <th className="border border-black py-2 px-3 text-left text-xs font-bold uppercase bg-gray-100">Description</th>
              <th className="border border-black py-2 px-3 text-center text-xs font-bold uppercase w-16 bg-gray-100">Qté</th>
              <th className="border border-black py-2 px-3 text-right text-xs font-bold uppercase w-24 bg-gray-100">P.U. (DH)</th>
              <th className="border border-black py-2 px-3 text-right text-xs font-bold uppercase w-16 bg-gray-100">TVA</th>
              <th className="border border-black py-2 px-3 text-right text-xs font-bold uppercase w-24 bg-gray-100">Total (DH)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.articles.map((article) => (
              <tr key={article.id}>
                <td className="border border-black py-2 px-3 text-sm">{article.description || "—"}</td>
                <td className="border border-black py-2 px-3 text-center text-sm">{article.quantity}</td>
                <td className="border border-black py-2 px-3 text-right text-sm">{article.unitPrice.toFixed(2)}</td>
                <td className="border border-black py-2 px-3 text-right text-sm">{invoice.isAutoEntrepreneur ? "0" : article.tvaRate}%</td>
                <td className="border border-black py-2 px-3 text-right text-sm font-bold">{(article.quantity * article.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72">
            <div className="flex justify-between py-1.5 text-sm">
              <span>Total HT</span>
              <span>{invoice.totalHT.toFixed(2)} DH</span>
            </div>
            <div className="flex justify-between py-1.5 text-sm">
              <span>Total TVA</span>
              <span>{invoice.totalTVA.toFixed(2)} DH</span>
            </div>
            {invoice.discountValue > 0 && (
              <div className="flex justify-between py-1.5 text-sm">
                <span>Remise</span>
                <span>-{invoice.discountType === "percentage" ? `${invoice.discountValue}%` : `${invoice.discountValue.toFixed(2)} DH`}</span>
              </div>
            )}
            <div className="flex justify-between py-2 text-base font-bold border-t-2 border-black mt-1">
              <span>Total TTC</span>
              <span>{invoice.totalTTC.toFixed(2)} DH</span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div className="border border-black p-3 mb-8">
          <p className="text-xs font-bold uppercase mb-1">Arrêtée la présente facture à la somme de</p>
          <p className="text-sm italic">{amountInWords(invoice.totalTTC)}</p>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-black text-center text-xs">
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
