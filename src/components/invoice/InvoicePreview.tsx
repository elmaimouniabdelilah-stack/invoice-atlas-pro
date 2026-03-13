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
    if (t === 7 || t === 9) {
      return tens[t - 1] + "-" + teens[u + (t === 9 ? 0 : 0)];
    }
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
    <div id="invoice-preview" className="bg-card rounded-lg shadow-sm border max-w-4xl mx-auto print:shadow-none print:border-none">
      <div className="p-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            {invoice.logo && (
              <img src={invoice.logo} alt="Logo" className="h-20 mb-3 object-contain" />
            )}
            <h2 className="text-2xl font-bold text-foreground">
              {invoice.vendor.raisonSociale || "Nom de l'entreprise"}
            </h2>
            {invoice.vendor.adresse && (
              <p className="text-sm text-muted-foreground mt-1">{invoice.vendor.adresse}</p>
            )}
            {(invoice.vendor.telephone || invoice.vendor.email) && (
              <p className="text-sm text-muted-foreground">
                {invoice.vendor.telephone}{invoice.vendor.telephone && invoice.vendor.email ? " • " : ""}{invoice.vendor.email}
              </p>
            )}
            {invoice.vendor.ice && (
              <p className="text-xs text-muted-foreground mt-1">ICE: {invoice.vendor.ice}</p>
            )}
            {(invoice.vendor.ifNumber || invoice.vendor.rc || invoice.vendor.cnss) && (
              <p className="text-xs text-muted-foreground">
                {invoice.vendor.ifNumber ? `IF: ${invoice.vendor.ifNumber}` : ""}
                {invoice.vendor.rc ? ` • RC: ${invoice.vendor.rc}` : ""}
                {invoice.vendor.cnss ? ` • CNSS: ${invoice.vendor.cnss}` : ""}
              </p>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold">Facture N°</h3>
            <p className="font-mono text-base font-semibold">{invoice.number}</p>
            <p className="text-sm text-muted-foreground mt-1">Date: {invoice.date}</p>
            {invoice.dueDate && invoice.dueDate !== invoice.date && (
              <p className="text-sm text-muted-foreground">Échéance: {invoice.dueDate}</p>
            )}
          </div>
        </div>

        {/* Buyer info box */}
        <div className="border rounded-lg p-5 mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Informations de l'acheteur
          </p>
          <p className="text-base font-medium">{invoice.buyer.nomClient || "—"}</p>
          {invoice.buyer.ice && <p className="text-sm text-muted-foreground">ICE: {invoice.buyer.ice}</p>}
          {invoice.buyer.adresse && <p className="text-sm text-muted-foreground">{invoice.buyer.adresse}</p>}
        </div>

        {/* Articles table */}
        <table className="w-full text-base mb-8">
          <thead>
            <tr className="border-b-2">
              <th className="text-left py-3 font-semibold text-muted-foreground uppercase text-xs">Description</th>
              <th className="text-center py-3 font-semibold text-muted-foreground uppercase text-xs">Quantité</th>
              <th className="text-right py-3 font-semibold text-muted-foreground uppercase text-xs">Prix unitaire</th>
              <th className="text-right py-3 font-semibold text-muted-foreground uppercase text-xs">Taux TVA</th>
              <th className="text-right py-3 font-semibold text-muted-foreground uppercase text-xs">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.articles.map((article) => (
              <tr key={article.id} className="border-b">
                <td className="py-3">{article.description || "—"}</td>
                <td className="py-3 text-center font-mono">{article.quantity}</td>
                <td className="py-3 text-right font-mono">{article.unitPrice.toFixed(2)}</td>
                <td className="py-3 text-right font-mono">{invoice.isAutoEntrepreneur ? "0" : article.tvaRate}%</td>
                <td className="py-3 text-right font-mono font-medium">{(article.quantity * article.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-base">
              <span>Total HT</span>
              <span className="font-mono font-medium">{invoice.totalHT.toFixed(2)} DH</span>
            </div>
            <div className="flex justify-between text-base text-muted-foreground">
              <span>Total TVA</span>
              <span className="font-mono">{invoice.totalTVA.toFixed(2)} DH</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total TTC</span>
              <span className="font-mono">{invoice.totalTTC.toFixed(2)} DH</span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-base italic">
            Arrêtée la présente facture à la somme de: <strong>{amountInWords(invoice.totalTTC)}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
