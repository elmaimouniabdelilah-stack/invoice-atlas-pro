import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { calculateItemTotal, calculateItemTVA, calculateTotalHT, calculateTotalTVA, calculateTotalTTC, calculateDiscount, calculateTotalTTCWithDiscount } from '@/lib/invoiceTypes';
import { numberToWordsFr, numberToWordsAr } from '@/lib/numberToWords';

interface InvoicePreviewProps {
  mobileView?: boolean;
}

export default function InvoicePreview({ mobileView = false }: InvoicePreviewProps) {
  const { t, lang } = useLang();
  const { seller, buyer, items, isAutoEntrepreneur, invoiceNumber, invoiceDate, dueDate, invoiceTexts, discountType, discountValue } = useInvoice();

  const totalHT = calculateTotalHT(items);
  const discount = calculateDiscount(totalHT, discountType, discountValue);
  const discountedHT = totalHT - discount;
  const totalTVA = calculateTotalTVA(items, isAutoEntrepreneur);
  const tvaRatio = totalHT > 0 ? discountedHT / totalHT : 0;
  const adjustedTVA = isAutoEntrepreneur ? 0 : totalTVA * tvaRatio;
  const totalTTC = calculateTotalTTCWithDiscount(items, isAutoEntrepreneur, discountType, discountValue);
  const amountInWords = lang === 'ar' ? numberToWordsAr(totalTTC) : numberToWordsFr(totalTTC);

  if (mobileView) {
    return (
      <div id="invoice-preview" className="bg-card rounded-lg border border-border p-4 font-latin" style={{ fontSize: '12px' }}>
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-start gap-3 mb-3">
            {seller.logo && (
              <img src={seller.logo} alt="Logo" className="h-12 w-12 object-contain rounded" />
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-foreground truncate">{seller.businessName || 'Nom de l\'entreprise'}</h2>
              <p className="text-xs text-muted-foreground truncate">{seller.address}</p>
              {seller.phone && <p className="text-xs text-muted-foreground">{seller.phone}</p>}
            </div>
          </div>
          <div className="rounded-md bg-secondary p-3 mb-3">
            <h1 className="text-sm font-bold text-foreground">{invoiceTexts.invoiceTitle} {invoiceNumber}</h1>
            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
              <span>{t('invoiceDate')}: {invoiceDate}</span>
              {dueDate && <span>{t('dueDate')}: {dueDate}</span>}
            </div>
          </div>
        </div>

        {/* Seller IDs */}
        {(seller.ice || seller.ifCode || seller.rc) && (
          <div className="flex flex-wrap gap-2 mb-4 text-[10px] text-muted-foreground">
            {seller.ice && <span className="rounded bg-muted px-1.5 py-0.5">ICE: {seller.ice}</span>}
            {seller.ifCode && <span className="rounded bg-muted px-1.5 py-0.5">IF: {seller.ifCode}</span>}
            {seller.rc && <span className="rounded bg-muted px-1.5 py-0.5">RC: {seller.rc}</span>}
            {seller.cnss && <span className="rounded bg-muted px-1.5 py-0.5">CNSS: {seller.cnss}</span>}
          </div>
        )}

        {/* Buyer */}
        <div className="rounded-md border border-border p-3 mb-5">
          <h3 className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('buyerInfo')}</h3>
          <p className="text-sm font-semibold text-foreground">{buyer.clientName || '—'}</p>
          <p className="text-xs text-muted-foreground">{buyer.address}</p>
          {buyer.ice && <p className="text-xs text-muted-foreground">ICE: {buyer.ice}</p>}
        </div>

        {/* Items as cards */}
        <div className="space-y-2 mb-5">
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('items')}</h3>
          {items.map((item) => (
            <div key={item.id} className="rounded-md border border-border p-2.5">
              <p className="text-xs font-medium text-foreground mb-1">{item.description || '—'}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{item.quantity} × {item.unitPrice.toFixed(2)}</span>
                {!isAutoEntrepreneur && <span>TVA {item.tvaRate}%</span>}
                <span className="font-semibold text-foreground">{calculateItemTotal(item).toFixed(2)} {t('dh')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1.5 rounded-md bg-secondary p-3 mb-5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{t('totalHT')}</span>
            <span className="text-foreground">{totalHT.toFixed(2)} {t('dh')}</span>
          </div>
          {discount > 0 && (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t('discount')} {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span>
                <span className="text-destructive">-{discount.toFixed(2)} {t('dh')}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t('totalAfterDiscount')}</span>
                <span className="text-foreground">{discountedHT.toFixed(2)} {t('dh')}</span>
              </div>
            </>
          )}
          {!isAutoEntrepreneur && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('totalTVA')}</span>
              <span className="text-foreground">{adjustedTVA.toFixed(2)} {t('dh')}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-sm">
            <span className="font-bold text-foreground">{t('totalTTC')}</span>
            <span className="font-bold text-foreground">{totalTTC.toFixed(2)} {t('dh')}</span>
          </div>
        </div>

        {/* Amount in words */}
        <div className="rounded-md bg-muted p-2.5 mb-4">
          <p className="text-[10px] text-muted-foreground italic">
            {invoiceTexts.amountInWordsPhrase}: <span className="font-medium text-foreground">{amountInWords}</span>
          </p>
        </div>

        {isAutoEntrepreneur && (
          <p className="text-[10px] text-muted-foreground italic mb-3">{invoiceTexts.taxExemption}</p>
        )}

        {(invoiceTexts.rib || invoiceTexts.iban) && (
          <div className="border-t border-border pt-3 mt-3 mb-3">
            <h4 className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">{t('bankInfo')}</h4>
            <div className="text-[10px] text-muted-foreground space-y-0.5 font-mono">
              {invoiceTexts.bankName && <p>{t('bankName')}: <span className="text-foreground">{invoiceTexts.bankName}</span></p>}
              {invoiceTexts.rib && <p>RIB: <span className="text-foreground">{invoiceTexts.rib}</span></p>}
              {invoiceTexts.iban && <p>IBAN: <span className="text-foreground">{invoiceTexts.iban}</span></p>}
              {invoiceTexts.swift && <p>SWIFT: <span className="text-foreground">{invoiceTexts.swift}</span></p>}
            </div>
          </div>
        )}

        {invoiceTexts.footerNotes && (
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-[10px] text-muted-foreground whitespace-pre-line">{invoiceTexts.footerNotes}</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop A4 preview (unchanged)
  return (
    <div id="invoice-preview" className="mx-auto w-[210mm] min-h-[297mm] bg-card p-10 invoice-shadow font-latin" style={{ fontSize: '11px' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          {seller.logo && (
            <img src={seller.logo} alt="Logo" className="h-16 w-16 object-contain rounded" />
          )}
          <div>
            <h2 className="text-lg font-bold text-foreground">{seller.businessName || 'Nom de l\'entreprise'}</h2>
            <p className="text-muted-foreground">{seller.address}</p>
            {seller.phone && <p className="text-muted-foreground">{seller.phone}</p>}
            {seller.email && <p className="text-muted-foreground">{seller.email}</p>}
          </div>
        </div>
        <div className="text-end">
          <h1 className="text-xl font-bold text-foreground mb-1">{invoiceTexts.invoiceTitle}</h1>
          <p className="text-base font-semibold text-foreground">{invoiceNumber}</p>
          <p className="text-muted-foreground mt-1">{t('invoiceDate')}: {invoiceDate}</p>
          {dueDate && <p className="text-muted-foreground">{t('dueDate')}: {dueDate}</p>}
        </div>
      </div>

      {/* Seller admin details */}
      <div className="flex gap-4 mb-6 text-xs text-muted-foreground">
        {seller.ice && <span>ICE: {seller.ice}</span>}
        {seller.ifCode && <span>IF: {seller.ifCode}</span>}
        {seller.rc && <span>RC: {seller.rc}</span>}
        {seller.cnss && <span>CNSS: {seller.cnss}</span>}
      </div>

      {/* Buyer */}
      <div className="rounded-md border border-border p-4 mb-8">
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">{t('buyerInfo')}</h3>
        <p className="font-semibold text-foreground">{buyer.clientName || '—'}</p>
        <p className="text-muted-foreground">{buyer.address}</p>
        {buyer.ice && <p className="text-muted-foreground">ICE: {buyer.ice}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b border-foreground/20">
            <th className="pb-2 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('description')}</th>
            <th className="pb-2 text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">{t('quantity')}</th>
            <th className="pb-2 text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">{t('unitPrice')}</th>
            {!isAutoEntrepreneur && (
              <th className="pb-2 text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">{t('tvaRate')}</th>
            )}
            <th className="pb-2 text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">{t('total')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border">
              <td className="py-3 text-foreground">{item.description || '—'}</td>
              <td className="py-3 text-end text-foreground">{item.quantity}</td>
              <td className="py-3 text-end text-foreground">{item.unitPrice.toFixed(2)}</td>
              {!isAutoEntrepreneur && (
                <td className="py-3 text-end text-foreground">{item.tvaRate}%</td>
              )}
              <td className="py-3 text-end font-medium text-foreground">{calculateItemTotal(item).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('totalHT')}</span>
            <span className="text-foreground">{totalHT.toFixed(2)} {t('dh')}</span>
          </div>
          {discount > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('discount')} {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span>
                <span className="text-destructive">-{discount.toFixed(2)} {t('dh')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('totalAfterDiscount')}</span>
                <span className="text-foreground">{discountedHT.toFixed(2)} {t('dh')}</span>
              </div>
            </>
          )}
          {!isAutoEntrepreneur && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('totalTVA')}</span>
              <span className="text-foreground">{adjustedTVA.toFixed(2)} {t('dh')}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-foreground/20 pt-2 text-sm">
            <span className="font-bold text-foreground">{t('totalTTC')}</span>
            <span className="font-bold text-foreground">{totalTTC.toFixed(2)} {t('dh')}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div className="rounded-md bg-secondary p-3 mb-6">
        <p className="text-xs text-muted-foreground italic">
          {invoiceTexts.amountInWordsPhrase}: <span className="font-medium text-foreground">{amountInWords}</span>
        </p>
      </div>

      {isAutoEntrepreneur && (
        <p className="text-xs text-muted-foreground italic mb-4">{invoiceTexts.taxExemption}</p>
      )}

      {(invoiceTexts.rib || invoiceTexts.iban) && (
        <div className="border-t border-border pt-4 mt-6 mb-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{t('bankInfo')}</h4>
          <div className="text-xs text-muted-foreground space-y-0.5 font-mono">
            {invoiceTexts.bankName && <p>{t('bankName')}: <span className="text-foreground">{invoiceTexts.bankName}</span></p>}
            {invoiceTexts.rib && <p>RIB: <span className="text-foreground">{invoiceTexts.rib}</span></p>}
            {invoiceTexts.iban && <p>IBAN: <span className="text-foreground">{invoiceTexts.iban}</span></p>}
            {invoiceTexts.swift && <p>SWIFT: <span className="text-foreground">{invoiceTexts.swift}</span></p>}
          </div>
        </div>
      )}

      {invoiceTexts.footerNotes && (
        <div className="border-t border-border pt-4 mt-4">
          <p className="text-xs text-muted-foreground whitespace-pre-line">{invoiceTexts.footerNotes}</p>
        </div>
      )}
    </div>
  );
}
