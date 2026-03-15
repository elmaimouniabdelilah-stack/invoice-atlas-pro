import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { calculateItemTotal, calculateTotalHT, calculateTotalTVA, calculateDiscount, calculateTotalTTCWithDiscount } from '@/lib/invoiceTypes';
import { numberToWordsFr, numberToWordsAr } from '@/lib/numberToWords';

interface Props {
  mobileView?: boolean;
}

export default function ClassicTemplate({ mobileView = false }: Props) {
  const { t, lang } = useLang();
  const { seller, buyer, items, isAutoEntrepreneur, invoiceNumber, invoiceDate, dueDate, invoiceTexts, discountType, discountValue, detailedMode } = useInvoice();

  const totalHT = calculateTotalHT(items);
  const discount = calculateDiscount(totalHT, discountType, discountValue);
  const discountedHT = totalHT - discount;
  const totalTVA = calculateTotalTVA(items, isAutoEntrepreneur);
  const tvaRatio = totalHT > 0 ? discountedHT / totalHT : 0;
  const adjustedTVA = isAutoEntrepreneur ? 0 : totalTVA * tvaRatio;
  const totalTTC = calculateTotalTTCWithDiscount(items, isAutoEntrepreneur, discountType, discountValue);
  const amountInWords = lang === 'ar' ? numberToWordsAr(totalTTC) : numberToWordsFr(totalTTC);

  const formatNumber = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (mobileView) {
    return (
      <div id="invoice-preview" className="bg-white rounded-lg border font-latin p-4" style={{ fontSize: '12px', color: '#222' }}>
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-start gap-3 mb-3">
            {seller.logo && <img src={seller.logo} alt="Logo" className="h-12 w-12 object-contain rounded" />}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold truncate">{seller.businessName || 'Nom de l\'entreprise'}</h2>
              <p className="text-xs truncate" style={{ color: '#666' }}>{seller.address}</p>
              {seller.phone && <p className="text-xs" style={{ color: '#666' }}>{seller.phone}</p>}
            </div>
          </div>
          <div className="rounded-md p-3 mb-3" style={{ backgroundColor: '#f5f5f5' }}>
            <h1 className="text-sm font-bold">{invoiceTexts.invoiceTitle} {invoiceNumber}</h1>
            <div className="flex gap-3 mt-1 text-xs" style={{ color: '#666' }}>
              <span>{t('invoiceDate')}: {invoiceDate}</span>
              {dueDate && <span>{t('dueDate')}: {dueDate}</span>}
            </div>
          </div>
        </div>

        {/* Seller IDs */}
        {(seller.ice || seller.ifCode || seller.rc) && (
          <div className="flex flex-wrap gap-2 mb-4 text-[10px]" style={{ color: '#666' }}>
            {seller.ice && <span className="rounded px-1.5 py-0.5" style={{ backgroundColor: '#f0f0f0' }}>ICE: {seller.ice}</span>}
            {seller.ifCode && <span className="rounded px-1.5 py-0.5" style={{ backgroundColor: '#f0f0f0' }}>IF: {seller.ifCode}</span>}
            {seller.rc && <span className="rounded px-1.5 py-0.5" style={{ backgroundColor: '#f0f0f0' }}>RC: {seller.rc}</span>}
            {seller.cnss && <span className="rounded px-1.5 py-0.5" style={{ backgroundColor: '#f0f0f0' }}>CNSS: {seller.cnss}</span>}
          </div>
        )}

        {/* Buyer */}
        <div className="rounded-md border p-3 mb-5" style={{ borderColor: '#ddd' }}>
          <h3 className="text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: '#999' }}>{t('buyerInfo')}</h3>
          <p className="text-sm font-semibold">{buyer.clientName || '—'}</p>
          <p className="text-xs" style={{ color: '#666' }}>{buyer.address}</p>
          {buyer.ice && <p className="text-xs" style={{ color: '#666' }}>ICE: {buyer.ice}</p>}
        </div>

        {/* Items as cards */}
        <div className="space-y-2 mb-5">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border p-2.5" style={{ borderColor: '#ddd' }}>
              <p className="text-xs font-medium">{item.description || '—'}</p>
              <div className="flex items-center justify-between text-[11px] mt-1" style={{ color: '#666' }}>
                <span>{item.quantity} × {item.unitPrice.toFixed(2)}</span>
                {!isAutoEntrepreneur && <span>TVA {item.tvaRate}%</span>}
                <span className="font-semibold" style={{ color: '#222' }}>{formatNumber(calculateItemTotal(item))} {t('dh')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1.5 rounded-md p-3 mb-5" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="flex justify-between text-xs"><span style={{ color: '#666' }}>{t('totalHT')}</span><span>{formatNumber(totalHT)} {t('dh')}</span></div>
          {discount > 0 && (
            <>
              <div className="flex justify-between text-xs"><span style={{ color: '#666' }}>{t('discount')}</span><span style={{ color: '#c0392b' }}>-{formatNumber(discount)} {t('dh')}</span></div>
              <div className="flex justify-between text-xs"><span style={{ color: '#666' }}>{t('totalAfterDiscount')}</span><span>{formatNumber(discountedHT)} {t('dh')}</span></div>
            </>
          )}
          {!isAutoEntrepreneur && <div className="flex justify-between text-xs"><span style={{ color: '#666' }}>{t('totalTVA')}</span><span>{formatNumber(adjustedTVA)} {t('dh')}</span></div>}
          <div className="flex justify-between border-t pt-2 text-sm font-bold" style={{ borderColor: '#ccc' }}>
            <span>{t('totalTTC')}</span><span>{formatNumber(totalTTC)} {t('dh')}</span>
          </div>
        </div>

        <div className="rounded-md p-2.5 mb-4" style={{ backgroundColor: '#f0f0f0' }}>
          <p className="text-[10px] italic" style={{ color: '#666' }}>
            {invoiceTexts.amountInWordsPhrase}: <span className="font-medium" style={{ color: '#222' }}>{amountInWords}</span>
          </p>
        </div>

        {isAutoEntrepreneur && <p className="text-[10px] italic mb-3" style={{ color: '#666' }}>{invoiceTexts.taxExemption}</p>}

        {(invoiceTexts.rib || invoiceTexts.iban) && (
          <div className="border-t pt-3 mt-3 mb-3" style={{ borderColor: '#ddd' }}>
            <h4 className="text-[10px] font-semibold mb-1 uppercase tracking-wider" style={{ color: '#999' }}>{t('bankInfo')}</h4>
            <div className="text-[10px] space-y-0.5 font-mono" style={{ color: '#666' }}>
              {invoiceTexts.bankName && <p>{t('bankName')}: {invoiceTexts.bankName}</p>}
              {invoiceTexts.rib && <p>RIB: {invoiceTexts.rib}</p>}
              {invoiceTexts.iban && <p>IBAN: {invoiceTexts.iban}</p>}
              {invoiceTexts.swift && <p>SWIFT: {invoiceTexts.swift}</p>}
            </div>
          </div>
        )}

        {invoiceTexts.footerNotes && (
          <div className="border-t pt-3 mt-3" style={{ borderColor: '#ddd' }}>
            <p className="text-[10px] whitespace-pre-line" style={{ color: '#666' }}>{invoiceTexts.footerNotes}</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop A4
  return (
    <div id="invoice-preview" className="mx-auto w-[210mm] min-h-[297mm] bg-white p-10 invoice-shadow font-latin" style={{ fontSize: '11px', color: '#222' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          {seller.logo && <img src={seller.logo} alt="Logo" className="h-16 w-16 object-contain rounded" />}
          <div>
            <h2 className="text-lg font-bold">{seller.businessName || 'Nom de l\'entreprise'}</h2>
            <p style={{ color: '#666' }}>{seller.address}</p>
            {seller.phone && <p style={{ color: '#666' }}>{seller.phone}</p>}
            {seller.email && <p style={{ color: '#666' }}>{seller.email}</p>}
          </div>
        </div>
        <div className="text-end">
          <h1 className="text-xl font-bold mb-1">{invoiceTexts.invoiceTitle}</h1>
          <p className="text-base font-semibold">{invoiceNumber}</p>
          <p className="mt-1" style={{ color: '#666' }}>{t('invoiceDate')}: {invoiceDate}</p>
          {dueDate && <p style={{ color: '#666' }}>{t('dueDate')}: {dueDate}</p>}
        </div>
      </div>

      {/* Seller admin details */}
      <div className="flex gap-4 mb-6 text-xs" style={{ color: '#666' }}>
        {seller.ice && <span>ICE: {seller.ice}</span>}
        {seller.ifCode && <span>IF: {seller.ifCode}</span>}
        {seller.rc && <span>RC: {seller.rc}</span>}
        {seller.cnss && <span>CNSS: {seller.cnss}</span>}
      </div>

      {/* Buyer */}
      <div className="rounded-md border p-4 mb-8" style={{ borderColor: '#ddd' }}>
        <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#999' }}>{t('buyerInfo')}</h3>
        <p className="font-semibold">{buyer.clientName || '—'}</p>
        <p style={{ color: '#666' }}>{buyer.address}</p>
        {buyer.ice && <p style={{ color: '#666' }}>ICE: {buyer.ice}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full mb-6">
        <thead>
          <tr style={{ borderBottom: '2px solid #333' }}>
            {detailedMode && <th className="pb-2 text-start text-xs font-semibold uppercase tracking-wider w-20" style={{ color: '#999' }}>Réf</th>}
            <th className="pb-2 text-start text-xs font-semibold uppercase tracking-wider" style={{ color: '#999' }}>{t('description')}</th>
            <th className="pb-2 text-end text-xs font-semibold uppercase tracking-wider w-16" style={{ color: '#999' }}>{t('quantity')}</th>
            {detailedMode && (
              <>
                <th className="pb-2 text-end text-xs font-semibold uppercase tracking-wider w-16" style={{ color: '#999' }}>L</th>
                <th className="pb-2 text-end text-xs font-semibold uppercase tracking-wider w-16" style={{ color: '#999' }}>H</th>
                <th className="pb-2 text-end text-xs font-semibold uppercase tracking-wider w-16" style={{ color: '#999' }}>M²</th>
              </>
            )}
            <th className="pb-2 text-end text-xs font-semibold uppercase tracking-wider w-24" style={{ color: '#999' }}>{t('unitPrice')}</th>
            {!isAutoEntrepreneur && <th className="pb-2 text-end text-xs font-semibold uppercase tracking-wider w-16" style={{ color: '#999' }}>{t('tvaRate')}</th>}
            <th className="pb-2 text-end text-xs font-semibold uppercase tracking-wider w-24" style={{ color: '#999' }}>{t('total')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
              {detailedMode && <td className="py-3 text-xs">{item.reference || '—'}</td>}
              <td className="py-3">{item.description || '—'}</td>
              <td className="py-3 text-end">{item.quantity}</td>
              {detailedMode && (
                <>
                  <td className="py-3 text-end">{item.length || '—'}</td>
                  <td className="py-3 text-end">{item.height || '—'}</td>
                  <td className="py-3 text-end">{item.totalM2 || '—'}</td>
                </>
              )}
              <td className="py-3 text-end">{item.unitPrice.toFixed(2)}</td>
              {!isAutoEntrepreneur && <td className="py-3 text-end">{item.tvaRate}%</td>}
              <td className="py-3 text-end font-medium">{formatNumber(calculateItemTotal(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-1.5">
          <div className="flex justify-between text-sm"><span style={{ color: '#666' }}>{t('totalHT')}</span><span>{formatNumber(totalHT)} {t('dh')}</span></div>
          {discount > 0 && (
            <>
              <div className="flex justify-between text-sm"><span style={{ color: '#666' }}>{t('discount')} {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span><span style={{ color: '#c0392b' }}>-{formatNumber(discount)} {t('dh')}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: '#666' }}>{t('totalAfterDiscount')}</span><span>{formatNumber(discountedHT)} {t('dh')}</span></div>
            </>
          )}
          {!isAutoEntrepreneur && <div className="flex justify-between text-sm"><span style={{ color: '#666' }}>{t('totalTVA')}</span><span>{formatNumber(adjustedTVA)} {t('dh')}</span></div>}
          <div className="flex justify-between border-t pt-2 text-sm" style={{ borderColor: '#333' }}>
            <span className="font-bold">{t('totalTTC')}</span><span className="font-bold">{formatNumber(totalTTC)} {t('dh')}</span>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div className="rounded-md p-3 mb-6" style={{ backgroundColor: '#f5f5f5' }}>
        <p className="text-xs italic" style={{ color: '#666' }}>
          {invoiceTexts.amountInWordsPhrase}: <span className="font-medium" style={{ color: '#222' }}>{amountInWords}</span>
        </p>
      </div>

      {isAutoEntrepreneur && <p className="text-xs italic mb-4" style={{ color: '#666' }}>{invoiceTexts.taxExemption}</p>}

      {(invoiceTexts.rib || invoiceTexts.iban) && (
        <div className="border-t pt-4 mt-6 mb-4" style={{ borderColor: '#ddd' }}>
          <h4 className="text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#999' }}>{t('bankInfo')}</h4>
          <div className="text-xs space-y-0.5 font-mono" style={{ color: '#666' }}>
            {invoiceTexts.bankName && <p>{t('bankName')}: {invoiceTexts.bankName}</p>}
            {invoiceTexts.rib && <p>RIB: {invoiceTexts.rib}</p>}
            {invoiceTexts.iban && <p>IBAN: {invoiceTexts.iban}</p>}
            {invoiceTexts.swift && <p>SWIFT: {invoiceTexts.swift}</p>}
          </div>
        </div>
      )}

      {invoiceTexts.footerNotes && (
        <div className="border-t pt-4 mt-4" style={{ borderColor: '#ddd' }}>
          <p className="text-xs whitespace-pre-line" style={{ color: '#666' }}>{invoiceTexts.footerNotes}</p>
        </div>
      )}
    </div>
  );
}
