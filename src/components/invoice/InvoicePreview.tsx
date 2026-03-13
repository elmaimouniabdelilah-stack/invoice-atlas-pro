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
      return tens[t - 1] + "-" + teens[u];
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
  const hasVendorContact = invoice.vendor.telephone || invoice.vendor.email;
  const hasVendorAdmin = invoice.vendor.ifNumber || invoice.vendor.rc || invoice.vendor.cnss;

  return (
    <div id="invoice-preview" className="bg-card max-w-4xl mx-auto print:shadow-none print:border-none" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
      {/* Top accent bar */}
      <div className="h-1.5 bg-primary rounded-t-lg print:rounded-none" />

      <div className="p-10">
        {/* Header: Logo/Company + Invoice Info */}
        <div className="flex justify-between items-start mb-10">
          {/* Left: Company */}
          <div className="flex-1">
            {invoice.logo && (
              <img src={invoice.logo} alt="Logo" className="h-16 mb-4 object-contain" />
            )}
            <h2 className="text-xl font-bold tracking-tight" style={{ color: "hsl(var(--foreground))" }}>
              {invoice.vendor.raisonSociale || "Nom de l'entreprise"}
            </h2>
            {invoice.vendor.adresse && (
              <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{invoice.vendor.adresse}</p>
            )}
            {hasVendorContact && (
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                {invoice.vendor.telephone}
                {invoice.vendor.telephone && invoice.vendor.email ? " · " : ""}
                {invoice.vendor.email}
              </p>
            )}
            {(invoice.vendor.ice || hasVendorAdmin) && (
              <div className="mt-2 text-xs space-y-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                {invoice.vendor.ice && <p>ICE: <span className="font-mono">{invoice.vendor.ice}</span></p>}
                {invoice.vendor.ifNumber && <p>IF: <span className="font-mono">{invoice.vendor.ifNumber}</span></p>}
                {invoice.vendor.rc && <p>RC: <span className="font-mono">{invoice.vendor.rc}</span></p>}
                {invoice.vendor.cnss && <p>CNSS: <span className="font-mono">{invoice.vendor.cnss}</span></p>}
              </div>
            )}
          </div>

          {/* Right: Invoice details */}
          <div className="text-right flex-shrink-0 ml-8">
            <div className="inline-block text-left rounded-lg p-5" style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
              <p className="text-xs uppercase tracking-widest font-medium opacity-80 mb-1">Facture</p>
              <p className="text-lg font-bold font-mono tracking-tight">{invoice.number}</p>
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between gap-6">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Date</span>
                <span className="font-mono font-medium">{invoice.date}</span>
              </div>
              {invoice.dueDate && invoice.dueDate !== invoice.date && (
                <div className="flex justify-between gap-6">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>Échéance</span>
                  <span className="font-mono font-medium">{invoice.dueDate}</span>
                </div>
              )}
              {invoice.isAutoEntrepreneur && (
                <div className="mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "hsl(var(--warning) / 0.15)", color: "hsl(var(--warning))" }}>
                    Auto-entrepreneur
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-8" style={{ backgroundColor: "hsl(var(--border))" }} />

        {/* Buyer info */}
        <div className="mb-8">
          <div className="rounded-lg border p-5" style={{ borderColor: "hsl(var(--border))" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
              Facturé à
            </p>
            <p className="text-base font-semibold" style={{ color: "hsl(var(--foreground))" }}>
              {invoice.buyer.nomClient || "—"}
            </p>
            {invoice.buyer.ice && (
              <p className="text-sm mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                ICE: <span className="font-mono">{invoice.buyer.ice}</span>
              </p>
            )}
            {invoice.buyer.adresse && (
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{invoice.buyer.adresse}</p>
            )}
          </div>
        </div>

        {/* Articles table */}
        <div className="mb-8 rounded-lg overflow-hidden border" style={{ borderColor: "hsl(var(--border))" }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "hsl(var(--muted))" }}>
                <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider" style={{ color: "hsl(var(--muted-foreground))" }}>Description</th>
                <th className="text-center py-3 px-3 font-semibold text-[11px] uppercase tracking-wider w-20" style={{ color: "hsl(var(--muted-foreground))" }}>Qté</th>
                <th className="text-right py-3 px-4 font-semibold text-[11px] uppercase tracking-wider w-28" style={{ color: "hsl(var(--muted-foreground))" }}>P.U.</th>
                <th className="text-right py-3 px-3 font-semibold text-[11px] uppercase tracking-wider w-20" style={{ color: "hsl(var(--muted-foreground))" }}>TVA</th>
                <th className="text-right py-3 px-4 font-semibold text-[11px] uppercase tracking-wider w-28" style={{ color: "hsl(var(--muted-foreground))" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.articles.map((article, i) => (
                <tr key={article.id} style={{ backgroundColor: i % 2 === 1 ? "hsl(var(--muted) / 0.3)" : "transparent", borderTop: "1px solid hsl(var(--border) / 0.5)" }}>
                  <td className="py-3.5 px-4 text-sm" style={{ color: "hsl(var(--foreground))" }}>{article.description || "—"}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-sm">{article.quantity}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm">{article.unitPrice.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-sm">{invoice.isAutoEntrepreneur ? "0" : article.tvaRate}%</td>
                  <td className="py-3.5 px-4 text-right font-mono text-sm font-semibold">{(article.quantity * article.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1.5 px-4">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Total HT</span>
                <span className="font-mono font-medium">{invoice.totalHT.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between py-1.5 px-4">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Total TVA</span>
                <span className="font-mono">{invoice.totalTVA.toFixed(2)} DH</span>
              </div>
              {invoice.discountValue > 0 && (
                <div className="flex justify-between py-1.5 px-4">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>Remise</span>
                  <span className="font-mono" style={{ color: "hsl(var(--destructive))" }}>
                    -{invoice.discountType === "percentage" ? `${invoice.discountValue}%` : `${invoice.discountValue.toFixed(2)} DH`}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3 px-4 rounded-lg text-base font-bold" style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                <span>Total TTC</span>
                <span className="font-mono">{invoice.totalTTC.toFixed(2)} DH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div className="rounded-lg p-4 border" style={{ borderColor: "hsl(var(--border))", backgroundColor: "hsl(var(--muted) / 0.3)" }}>
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            Arrêtée la présente facture à la somme de
          </p>
          <p className="text-sm font-semibold italic" style={{ color: "hsl(var(--foreground))" }}>
            {amountInWords(invoice.totalTTC)}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 text-center" style={{ borderTop: "1px solid hsl(var(--border))" }}>
          <p className="text-[10px] tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
            {invoice.vendor.raisonSociale && `${invoice.vendor.raisonSociale}`}
            {invoice.vendor.ice && ` · ICE: ${invoice.vendor.ice}`}
            {invoice.vendor.telephone && ` · Tél: ${invoice.vendor.telephone}`}
          </p>
          {invoice.vendor.adresse && (
            <p className="text-[10px] tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
              {invoice.vendor.adresse}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
