import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { calculateItemTotal, calculateTotalHT, calculateTotalTVA, calculateDiscount, calculateTotalTTCWithDiscount } from '@/lib/invoiceTypes';
import { numberToWordsFr, numberToWordsAr } from '@/lib/numberToWords';

const fontMap: Record<string, string> = {
  inter: 'Inter, sans-serif',
  cairo: 'Cairo, sans-serif',
  amiri: 'Amiri, serif',
  roboto: 'Roboto, sans-serif',
  playfair: 'Playfair Display, serif',
};

interface Props {
  mobileView?: boolean;
}

export default function BlueTemplate({ mobileView = false }: Props) {
  const { t, lang } = useLang();
  const { seller, buyer, items, isAutoEntrepreneur, invoiceNumber, invoiceDate, dueDate, invoiceTexts, discountType, discountValue, detailedMode, templateColor, layoutSettings } = useInvoice();

  const totalHT = calculateTotalHT(items);
  const discount = calculateDiscount(totalHT, discountType, discountValue);
  const discountedHT = totalHT - discount;
  const totalTVA = calculateTotalTVA(items, isAutoEntrepreneur);
  const tvaRatio = totalHT > 0 ? discountedHT / totalHT : 0;
  const adjustedTVA = isAutoEntrepreneur ? 0 : totalTVA * tvaRatio;
  const totalTTC = calculateTotalTTCWithDiscount(items, isAutoEntrepreneur, discountType, discountValue);
  const amountInWords = lang === 'ar' ? numberToWordsAr(totalTTC) : numberToWordsFr(totalTTC);

  const navy = templateColor;
  const isRtl = layoutSettings.direction === 'rtl';
  const fontFamily = fontMap[layoutSettings.font] || fontMap.inter;
  const textAlign = isRtl ? 'right' as const : 'left' as const;
  const textEnd = isRtl ? 'left' as const : 'right' as const;
  const formatNumber = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (mobileView) {
    return (
      <div id="invoice-preview" dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-lg border p-4" style={{ fontSize: '10px', color: '#222', fontFamily }}>
        <div className="h-2 -mx-4 -mt-4 mb-3" style={{ backgroundColor: navy }} />

        {/* Header: Seller left, Title right */}
        <div className={`flex justify-between mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1">
            {seller.logo && <img src={seller.logo} alt="Logo" className="h-10 w-10 object-contain mb-1" />}
            <h2 className="text-sm font-black uppercase leading-tight" style={{ color: navy }}>{seller.businessName || t('businessName')}</h2>
            <div className="mt-1 space-y-0.5 text-[9px]" style={{ color: '#444' }}>
              {seller.address && <p>{seller.address}</p>}
              {seller.ice && <p>ICE: {seller.ice}</p>}
              {seller.ifCode && <p>I.F: {seller.ifCode}</p>}
              {seller.rc && <p>R.C: {seller.rc}</p>}
              {seller.cnss && <p>CNSS: {seller.cnss}</p>}
              {seller.phone && <p>Tél: {seller.phone}</p>}
              {seller.email && <p>Email: {seller.email}</p>}
            </div>
          </div>
          <div style={{ textAlign: textEnd }} className="flex-shrink-0">
            <h1 className="text-base font-black uppercase" style={{ color: navy }}>{invoiceTexts.invoiceTitle?.replace(' N°', '') || t('docTypeInvoice')}</h1>
            <p className="text-[9px] mt-1">{t('dateLabel')}: {invoiceDate}</p>
            <p className="text-[9px]">N° {t('invoiceLabel')}: {invoiceNumber}</p>
            {dueDate && <p className="text-[9px]">{t('dueDateLabel')}: {dueDate}</p>}
          </div>
        </div>

        {/* Client box */}
        <div className="border-2 p-2 mb-3" style={{ borderColor: navy }}>
          <p className="font-bold text-[10px] uppercase">{t('clientLabel')} :</p>
          <p className="text-[10px]">{buyer.clientName || '—'}</p>
          <p className="text-[9px]">{buyer.address}</p>
          {buyer.ice && <p className="text-[9px]">ICE Client: {buyer.ice}</p>}
        </div>

        {/* Items table */}
        <table className="w-full mb-3 text-[10px]">
          <thead>
            <tr style={{ backgroundColor: navy, color: 'white' }}>
              <th className="py-1.5 px-1 font-bold" style={{ textAlign }}>{t('designation')}</th>
              <th className="py-1.5 px-1 text-center font-bold w-8">{t('qty')}</th>
              <th className="py-1.5 px-1 font-bold w-16" style={{ textAlign: textEnd }}>P.U. HT ({t('dh')})</th>
              <th className="py-1.5 px-1 font-bold w-18" style={{ textAlign: textEnd }}>{t('total')} HT ({t('dh')})</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                <td className="py-1.5 px-1">{item.description || '—'}</td>
                <td className="py-1.5 px-1 text-center">{item.quantity}</td>
                <td className="py-1.5 px-1" style={{ textAlign: textEnd }}>{formatNumber(item.unitPrice)}</td>
                <td className="py-1.5 px-1" style={{ textAlign: textEnd }}>{formatNumber(calculateItemTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} mb-3`}>
          <div className="text-[10px]" style={{ minWidth: '140px' }}>
            <div className="flex justify-between py-0.5 px-2" style={{ backgroundColor: navy + '15' }}>
              <span className="font-bold">{t('totalHT')}</span>
              <span>{formatNumber(totalHT)} {t('dh')}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-0.5 px-2">
                <span>{t('discount')}</span>
                <span style={{ color: '#c0392b' }}>-{formatNumber(discount)} {t('dh')}</span>
              </div>
            )}
            {!isAutoEntrepreneur && (
              <div className="flex justify-between py-0.5 px-2" style={{ backgroundColor: navy + '15' }}>
                <span className="font-bold">TVA ({items[0]?.tvaRate || 20}%)</span>
                <span>{formatNumber(adjustedTVA)} {t('dh')}</span>
              </div>
            )}
            <div className="flex justify-between py-1 px-2 font-bold" style={{ backgroundColor: navy, color: 'white' }}>
              <span>{t('totalTTC')}</span>
              <span>{formatNumber(totalTTC)} {t('dh')}</span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        {layoutSettings.showAmountInWords && (
          <div className="mb-3 text-[9px]">
            <p>{invoiceTexts.amountInWordsPhrase}: <span className="font-semibold">{amountInWords}</span></p>
            <p className="mt-1 italic">Arrêtée la présente facture à la somme de: {amountInWords} ({formatNumber(totalTTC)} {t('dh')}).</p>
          </div>
        )}

        {isAutoEntrepreneur && <p className="text-[9px] italic mb-2">{invoiceTexts.taxExemption}</p>}

        {/* Bank info + Signature */}
        <div className={`flex justify-between mt-3 gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1 text-[9px]">
            {layoutSettings.showBankInfo && (invoiceTexts.rib || invoiceTexts.iban) && (
              <div>
                <p className="font-bold mb-0.5">Mode de Règlement: Virement Bancaire</p>
                <div className="font-mono" style={{ color: '#444' }}>
                  {invoiceTexts.bankName && <p>(RIB: {invoiceTexts.rib} - {invoiceTexts.bankName})</p>}
                  {invoiceTexts.iban && <p>IBAN: {invoiceTexts.iban}</p>}
                  {invoiceTexts.swift && <p>SWIFT: {invoiceTexts.swift}</p>}
                </div>
              </div>
            )}
          </div>
          {layoutSettings.showSignature && (
            <div className="text-[9px]" style={{ textAlign: textEnd }}>
              <p className="font-bold">{t('stampSignature')}</p>
              <div className="h-12" />
            </div>
          )}
        </div>

        {layoutSettings.showFooterNotes && invoiceTexts.footerNotes && (
          <div className="border-t pt-2 mt-2 text-[9px]" style={{ color: '#666' }}>
            <p className="whitespace-pre-line">{invoiceTexts.footerNotes}</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop A4 — same layout as Classic but with blue sidebar accent
  return (
    <div id="invoice-preview" dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto w-[210mm] min-h-[297mm] bg-white invoice-shadow flex" style={{ fontSize: '11px', color: '#222', fontFamily, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
      {/* Side accent bar */}
      <div className="w-14 shrink-0 flex items-center justify-center" style={{ backgroundColor: navy }}>
        <span className="text-white font-black text-4xl tracking-[0.3em]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          {invoiceTexts.invoiceTitle?.replace(' N°', '') || t('docTypeInvoice')}
        </span>
      </div>

      <div className="flex-1 p-10">
        {/* Header: Seller info LEFT, Invoice title RIGHT */}
        <div className={`flex justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1 max-w-[55%]">
            <div className="flex items-start gap-3 mb-2">
              {seller.logo && layoutSettings.logoPosition !== 'right' && (
                <img src={seller.logo} alt="Logo" className="h-16 w-16 object-contain" />
              )}
              <h2 className="text-xl font-black uppercase leading-tight" style={{ color: navy }}>{seller.businessName || t('businessName')}</h2>
              {seller.logo && layoutSettings.logoPosition === 'right' && (
                <img src={seller.logo} alt="Logo" className="h-16 w-16 object-contain" />
              )}
            </div>
            {layoutSettings.showSellerIds && (
              <div className="text-xs space-y-0.5 mt-1" style={{ color: '#444' }}>
                {seller.address && <p>Siège Social: {seller.address}</p>}
                {seller.ice && <p>ICE: {seller.ice}</p>}
                {seller.ifCode && <p>I.F: {seller.ifCode}</p>}
                {seller.rc && <p>R.C: {seller.rc}</p>}
                {seller.cnss && <p>CNSS: {seller.cnss}</p>}
                {seller.phone && <p>Tél: {seller.phone}</p>}
                {seller.email && <p>Email: {seller.email}</p>}
              </div>
            )}
          </div>

          <div style={{ textAlign: textEnd }} className="flex-shrink-0">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-2" style={{ color: navy }}>{invoiceTexts.invoiceTitle?.replace(' N°', '') || t('docTypeInvoice')}</h1>
            <p className="text-sm">{t('dateLabel')}: {invoiceDate}</p>
            <p className="text-sm">N° {t('invoiceLabel')}: {invoiceNumber}</p>
            {dueDate && <p className="text-sm">{t('dueDateLabel')}: {dueDate}</p>}
          </div>
        </div>

        {/* Client box — right-aligned */}
        <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} mb-8`}>
          <div className="border-2 p-4 w-[45%]" style={{ borderColor: navy }}>
            <p className="font-bold text-sm uppercase mb-1">{t('clientLabel')} :</p>
            <p className="text-sm font-semibold">{buyer.clientName || '—'}</p>
            <p className="text-xs" style={{ color: '#444' }}>{t('address')}: {buyer.address}</p>
            {buyer.ice && <p className="text-xs" style={{ color: '#444' }}>ICE Client: {buyer.ice}</p>}
          </div>
        </div>

        {/* Items table */}
        <table className="w-full mb-2">
          <thead>
            <tr style={{ backgroundColor: navy, color: 'white' }}>
              {detailedMode && <th className="py-2.5 px-3 text-xs font-bold" style={{ textAlign }}>{t('reference')}</th>}
              <th className="py-2.5 px-3 text-xs font-bold" style={{ textAlign }}>{t('designation')}</th>
              <th className="py-2.5 px-3 text-xs font-bold text-center w-14">{t('qty')}</th>
              {detailedMode && (
                <>
                  <th className="py-2.5 px-3 text-xs font-bold text-center w-14">L</th>
                  <th className="py-2.5 px-3 text-xs font-bold text-center w-14">H</th>
                  <th className="py-2.5 px-3 text-xs font-bold text-center w-14">M²</th>
                </>
              )}
              <th className="py-2.5 px-3 text-xs font-bold w-28" style={{ textAlign: textEnd }}>P.U. HT ({t('dh')})</th>
              {!isAutoEntrepreneur && <th className="py-2.5 px-3 text-xs font-bold text-center w-14">{t('tvaRate')}</th>}
              <th className="py-2.5 px-3 text-xs font-bold w-28" style={{ textAlign: textEnd }}>{t('total')} HT ({t('dh')})</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                {detailedMode && <td className="py-3 px-3 text-xs">{item.reference || '—'}</td>}
                <td className="py-3 px-3">{item.description || '—'}</td>
                <td className="py-3 px-3 text-center">{item.quantity}</td>
                {detailedMode && (
                  <>
                    <td className="py-3 px-3 text-center">{item.length || '—'}</td>
                    <td className="py-3 px-3 text-center">{item.height || '—'}</td>
                    <td className="py-3 px-3 text-center">{item.totalM2 || '—'}</td>
                  </>
                )}
                <td className="py-3 px-3" style={{ textAlign: textEnd }}>{formatNumber(item.unitPrice)}</td>
                {!isAutoEntrepreneur && <td className="py-3 px-3 text-center">{item.tvaRate}%</td>}
                <td className="py-3 px-3 font-medium" style={{ textAlign: textEnd }}>{formatNumber(calculateItemTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals — right side */}
        <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} mb-8`}>
          <div style={{ minWidth: '280px' }}>
            <div className="flex py-2 px-3" style={{ backgroundColor: navy + '15' }}>
              <span className="flex-1 font-bold text-sm uppercase">{t('totalHT')}</span>
              <span className="font-bold text-sm w-32" style={{ textAlign: textEnd }}>{formatNumber(totalHT)} {t('dh')}</span>
            </div>
            {discount > 0 && (
              <>
                <div className="flex py-1.5 px-3">
                  <span className="flex-1 text-sm">{t('discount')} {discountType === 'percentage' ? `(${discountValue}%)` : ''}</span>
                  <span className="text-sm w-32" style={{ textAlign: textEnd, color: '#c0392b' }}>-{formatNumber(discount)} {t('dh')}</span>
                </div>
                <div className="flex py-1.5 px-3">
                  <span className="flex-1 text-sm">{t('netHT')}</span>
                  <span className="text-sm w-32" style={{ textAlign: textEnd }}>{formatNumber(discountedHT)} {t('dh')}</span>
                </div>
              </>
            )}
            {!isAutoEntrepreneur && (
              <div className="flex py-2 px-3" style={{ backgroundColor: navy + '15' }}>
                <span className="flex-1 font-bold text-sm uppercase">TVA ({items[0]?.tvaRate || 20}%)</span>
                <span className="font-bold text-sm w-32" style={{ textAlign: textEnd }}>{formatNumber(adjustedTVA)} {t('dh')}</span>
              </div>
            )}
            <div className="flex py-2.5 px-3 font-black" style={{ backgroundColor: navy, color: 'white' }}>
              <span className="flex-1 text-sm uppercase">{t('totalTTC')}</span>
              <span className="text-sm w-32" style={{ textAlign: textEnd }}>{formatNumber(totalTTC)} {t('dh')}</span>
            </div>
          </div>
        </div>

        {/* Bank info AFTER TOTALS position */}
        {layoutSettings.showBankInfo && layoutSettings.bankInfoPosition === 'afterTotals' && (invoiceTexts.rib || invoiceTexts.iban) && (
          <div className="mb-6 p-3 rounded text-xs" style={{ border: `1px solid ${navy}30` }}>
            <p className="font-bold mb-1">Mode de Règlement: Virement Bancaire</p>
            <div className="font-mono" style={{ color: '#444' }}>
              {invoiceTexts.rib && invoiceTexts.bankName && <p>(RIB: {invoiceTexts.rib} - {invoiceTexts.bankName})</p>}
              {invoiceTexts.rib && !invoiceTexts.bankName && <p>RIB: {invoiceTexts.rib}</p>}
              {invoiceTexts.iban && <p>IBAN: {invoiceTexts.iban}</p>}
              {invoiceTexts.swift && <p>SWIFT: {invoiceTexts.swift}</p>}
            </div>
          </div>
        )}

        {/* Amount in words */}
        {layoutSettings.showAmountInWords && (
          <div className="mb-6 text-xs">
            <p>{invoiceTexts.amountInWordsPhrase}: <span className="font-semibold">{amountInWords}</span></p>
            <p className="mt-2 italic">Arrêtée la présente facture à la somme de: {amountInWords} ({formatNumber(totalTTC)} {t('dh')}).</p>
          </div>
        )}

        {isAutoEntrepreneur && <p className="text-xs italic mb-4">{invoiceTexts.taxExemption}</p>}

        {layoutSettings.showThankYou && (
          <p className="text-center italic text-sm my-4" style={{ color: '#666' }}>{t('thankYou')}</p>
        )}

        {/* Bank info BOTTOM position + Signature */}
        <div className={`flex justify-between items-start mt-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1 text-xs">
            {layoutSettings.showBankInfo && layoutSettings.bankInfoPosition !== 'afterTotals' && (invoiceTexts.rib || invoiceTexts.iban) && (
              <div>
                <p className="font-bold mb-1">Mode de Règlement: Virement Bancaire</p>
                <div className="font-mono text-xs" style={{ color: '#444' }}>
                  {invoiceTexts.rib && invoiceTexts.bankName && <p>(RIB: {invoiceTexts.rib} - {invoiceTexts.bankName})</p>}
                  {invoiceTexts.rib && !invoiceTexts.bankName && <p>RIB: {invoiceTexts.rib}</p>}
                  {invoiceTexts.iban && <p>IBAN: {invoiceTexts.iban}</p>}
                  {invoiceTexts.swift && <p>SWIFT: {invoiceTexts.swift}</p>}
                </div>
              </div>
            )}
          </div>

          {layoutSettings.showSignature && (
            <div style={{ textAlign: textEnd }}>
              <p className="font-bold text-xs mb-1">{t('stampSignature')}</p>
              <div className="h-24 w-48 border border-dashed" style={{ borderColor: '#ccc' }} />
            </div>
          )}
        </div>

        {layoutSettings.showFooterNotes && invoiceTexts.footerNotes && (
          <div className="border-t pt-4 mt-6" style={{ borderColor: '#ddd' }}>
            <p className="text-xs whitespace-pre-line" style={{ color: '#666' }}>{invoiceTexts.footerNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
