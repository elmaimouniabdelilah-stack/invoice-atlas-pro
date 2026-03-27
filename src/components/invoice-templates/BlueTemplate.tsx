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
  const red = '#c0392b';
  const isRtl = layoutSettings.direction === 'rtl';
  const fontFamily = fontMap[layoutSettings.font] || fontMap.inter;
  const textAlign = isRtl ? 'right' as const : 'left' as const;
  const textEnd = isRtl ? 'left' as const : 'right' as const;
  const formatNumber = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const renderLogo = (size: string) => {
    const logo = seller.logo && <img src={seller.logo} alt="Logo" className={`${size} object-contain`} />;
    const name = <h2 className={`${mobileView ? 'text-xs' : 'text-lg'} font-bold`} style={{ color: red }}>{seller.businessName || t('businessName')}</h2>;
    
    if (layoutSettings.logoPosition === 'center') {
      return <div className="flex justify-center items-center gap-2">{logo}{name}</div>;
    }
    if (layoutSettings.logoPosition === 'right') {
      return <div className={`flex items-center gap-2 ${isRtl ? '' : 'flex-row-reverse'}`}>{name}{logo}</div>;
    }
    return <div className="flex items-center gap-2">{logo}{name}</div>;
  };

  const invoiceTitleText = invoiceTexts.invoiceTitle?.replace(' N°', '') || t('docTypeInvoice');

  if (mobileView) {
    return (
      <div id="invoice-preview" dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-lg border" style={{ fontSize: '11px', color: '#1a1a1a', fontFamily }}>
        <div className="h-2" style={{ backgroundColor: navy }} />
        
        <div className="p-4">
          <div className={`flex items-start justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {renderLogo('h-10 w-10')}
            <h1 className="text-lg font-black" style={{ color: navy }}>{invoiceTitleText}</h1>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-[10px]">
            <span><strong>{t('invoiceLabel')}:</strong> {invoiceNumber}</span>
            <span><strong>{t('dateLabel')}:</strong> {invoiceDate}</span>
            {dueDate && <span><strong>{t('dueDateLabel')}:</strong> {dueDate}</span>}
            <span><strong>{t('dueTotalLabel')}:</strong> {formatNumber(totalTTC)} {t('dh')}</span>
          </div>

          <div className={`grid grid-cols-2 gap-3 mb-4 text-[10px] ${isRtl ? 'text-right' : ''}`}>
            <div>
              <h4 className="font-bold text-xs mb-1" style={{ color: navy }}>{t('invoiceTo')} :</h4>
              <p className="font-semibold">{buyer.clientName || '—'}</p>
              <p>{buyer.address}</p>
              {buyer.ice && <p>ICE: {buyer.ice}</p>}
            </div>
            {layoutSettings.showBankInfo && (invoiceTexts.rib || invoiceTexts.iban) && (
              <div>
                <h4 className="font-bold text-xs mb-1" style={{ color: navy }}>{t('paymentLabel')}:</h4>
                {invoiceTexts.bankName && <p><strong>{t('bankName')}:</strong> {invoiceTexts.bankName}</p>}
                {invoiceTexts.rib && <p><strong>RIB:</strong> {invoiceTexts.rib}</p>}
                {invoiceTexts.iban && <p><strong>IBAN:</strong> {invoiceTexts.iban}</p>}
                {invoiceTexts.swift && <p><strong>SWIFT:</strong> {invoiceTexts.swift}</p>}
              </div>
            )}
          </div>

          <table className="w-full text-[10px] mb-4">
            <thead>
              <tr style={{ backgroundColor: navy, color: 'white' }}>
                <th className="py-1.5 px-2 font-bold" style={{ textAlign }}>{t('designation')}</th>
                <th className="py-1.5 px-1 font-bold w-16" style={{ textAlign: textEnd }}>{t('unitPriceShort')}</th>
                <th className="py-1.5 px-1 text-center font-bold w-10">{t('qty')}</th>
                <th className="py-1.5 px-2 font-bold w-16" style={{ textAlign: textEnd }}>{t('total')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td className="py-2 px-2"><div className="font-semibold">{item.description || '—'}</div></td>
                  <td className="py-2 px-1" style={{ textAlign: textEnd }}>{formatNumber(item.unitPrice)}</td>
                  <td className="py-2 px-1 text-center">{item.quantity}</td>
                  <td className="py-2 px-2" style={{ textAlign: textEnd }}>{formatNumber(calculateItemTotal(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} mb-4`}>
            <div className="w-40 text-[10px]">
              <div className="flex justify-between py-1"><span>{t('totalHT')}</span><span>{formatNumber(totalHT)}</span></div>
              {!isAutoEntrepreneur && <div className="flex justify-between py-1"><span>{t('totalTVA')}</span><span>{formatNumber(adjustedTVA)}</span></div>}
              {discount > 0 && <div className="flex justify-between py-1"><span>{t('discount')} {discountType === 'percentage' ? `${discountValue}%` : ''}</span><span>{formatNumber(discount)}</span></div>}
              <div className="flex justify-between py-1.5 font-bold text-xs" style={{ backgroundColor: navy, color: 'white', margin: '0 -4px', padding: '6px 8px' }}>
                <span>{t('totalTTC')}</span><span>{formatNumber(totalTTC)}</span>
              </div>
            </div>
          </div>

          {layoutSettings.showAmountInWords && (
            <div className="p-2 mb-3 rounded text-[10px] italic" style={{ backgroundColor: '#f0f4f8' }}>
              {invoiceTexts.amountInWordsPhrase}: <span className="font-semibold">{amountInWords}</span>
            </div>
          )}

          {layoutSettings.showSellerIds && (seller.ice || seller.ifCode || seller.rc) && (
            <div className="text-[10px] mb-3">
              {seller.ice && <span className="mr-3">ICE: {seller.ice}</span>}
              {seller.ifCode && <span className="mr-3">IF: {seller.ifCode}</span>}
              {seller.rc && <span className="mr-3">RC: {seller.rc}</span>}
            </div>
          )}

          {isAutoEntrepreneur && <p className="text-[10px] italic mb-2">{invoiceTexts.taxExemption}</p>}

          {layoutSettings.showFooterNotes && invoiceTexts.footerNotes && <p className="text-[10px] mt-2 whitespace-pre-line">{invoiceTexts.footerNotes}</p>}

          {layoutSettings.showSignature && (
            <div className={`mt-4 pt-3 border-t flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
              <div className="text-center text-[10px]">
                <div className="h-12" />
                <p className="font-semibold">{seller.businessName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop A4
  return (
    <div id="invoice-preview" dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto w-[210mm] min-h-[297mm] bg-white invoice-shadow flex" style={{ fontSize: '11px', color: '#1a1a1a', fontFamily, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
      <div className="w-14 shrink-0 flex items-center justify-center" style={{ backgroundColor: navy }}>
        <span className="text-white font-black text-4xl tracking-[0.3em]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{invoiceTitleText}</span>
      </div>

      <div className="flex-1 p-10">
        <div className={`flex items-start justify-between mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {renderLogo('h-14 w-14')}
          <div style={{ textAlign: textEnd }} className="text-xs">
            <p>{seller.address}</p>
            {seller.phone && <p>📞 {seller.phone}</p>}
            {seller.email && <p>✉ {seller.email}</p>}
          </div>
        </div>

        <h1 className="text-2xl font-black mb-4" style={{ color: navy }}>{invoiceTitleText}</h1>

        <div className="flex gap-6 mb-6 text-xs" style={{ borderBottom: `2px solid ${navy}`, paddingBottom: '8px' }}>
          <span><strong>{t('dueTotalLabel')}:</strong> {formatNumber(totalTTC)} {t('dh')}</span>
          <span><strong>{t('dateLabel')}:</strong> {invoiceDate}</span>
          {dueDate && <span><strong>{t('dueDateLabel')}:</strong> {dueDate}</span>}
          <span><strong>{t('invoiceLabel')}:</strong> {invoiceNumber}</span>
        </div>

        <div className={`flex gap-12 mb-8 text-xs ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="flex-1">
            <h4 className="font-bold mb-2" style={{ color: navy }}>{t('invoiceTo')} :</h4>
            <table className="text-xs">
              <tbody>
                <tr><td className="font-bold pr-3 py-0.5">{t('name')}</td><td>{buyer.clientName || '—'}</td></tr>
                <tr><td className="font-bold pr-3 py-0.5">{t('address')}</td><td>{buyer.address}</td></tr>
                {buyer.ice && <tr><td className="font-bold pr-3 py-0.5">ICE</td><td>{buyer.ice}</td></tr>}
              </tbody>
            </table>
          </div>
          {layoutSettings.showBankInfo && (invoiceTexts.rib || invoiceTexts.iban) && (
            <div className="flex-1">
              <h4 className="font-bold mb-2" style={{ color: navy }}>{t('paymentLabel')}:</h4>
              <table className="text-xs">
                <tbody>
                  {invoiceTexts.bankName && <tr><td className="font-bold pr-3 py-0.5">{t('bankName')}</td><td>{invoiceTexts.bankName}</td></tr>}
                  {invoiceTexts.rib && <tr><td className="font-bold pr-3 py-0.5">RIB</td><td>{invoiceTexts.rib}</td></tr>}
                  {invoiceTexts.iban && <tr><td className="font-bold pr-3 py-0.5">IBAN</td><td>{invoiceTexts.iban}</td></tr>}
                  {invoiceTexts.swift && <tr><td className="font-bold pr-3 py-0.5">SWIFT</td><td>{invoiceTexts.swift}</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr style={{ backgroundColor: navy, color: 'white' }}>
              {detailedMode && <th className="py-2.5 px-3 text-xs font-bold w-16" style={{ textAlign }}>{t('reference')}</th>}
              <th className="py-2.5 px-3 text-xs font-bold" style={{ textAlign }}>{t('designation')}</th>
              <th className="py-2.5 px-3 text-xs font-bold w-20" style={{ textAlign: textEnd }}>{t('unitPriceShort')}</th>
              <th className="py-2.5 px-3 text-center text-xs font-bold w-14">{t('qty')}</th>
              {detailedMode && (
                <>
                  <th className="py-2.5 px-3 text-center text-xs font-bold w-12">L</th>
                  <th className="py-2.5 px-3 text-center text-xs font-bold w-12">H</th>
                  <th className="py-2.5 px-3 text-center text-xs font-bold w-14">M²</th>
                </>
              )}
              {!isAutoEntrepreneur && <th className="py-2.5 px-3 text-center text-xs font-bold w-14">{t('tvaRate')}</th>}
              <th className="py-2.5 px-3 text-xs font-bold w-24" style={{ textAlign: textEnd }}>{t('total')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                {detailedMode && <td className="py-3 px-3 text-xs">{item.reference || '—'}</td>}
                <td className="py-3 px-3"><div className="font-semibold">{item.description || '—'}</div></td>
                <td className="py-3 px-3" style={{ textAlign: textEnd }}>{formatNumber(item.unitPrice)}</td>
                <td className="py-3 px-3 text-center">{item.quantity}</td>
                {detailedMode && (
                  <>
                    <td className="py-3 px-3 text-center">{item.length || '—'}</td>
                    <td className="py-3 px-3 text-center">{item.height || '—'}</td>
                    <td className="py-3 px-3 text-center">{item.totalM2 || '—'}</td>
                  </>
                )}
                {!isAutoEntrepreneur && <td className="py-3 px-3 text-center">{item.tvaRate}%</td>}
                <td className="py-3 px-3 font-medium" style={{ textAlign: textEnd }}>{formatNumber(calculateItemTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} mb-8`}>
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm border-b"><span>{t('totalHT')}</span><span>{formatNumber(totalHT)}</span></div>
            {!isAutoEntrepreneur && <div className="flex justify-between py-2 text-sm border-b"><span>{t('totalTVA')}</span><span>{formatNumber(adjustedTVA)}</span></div>}
            {discount > 0 && <div className="flex justify-between py-2 text-sm border-b"><span>{t('discount')} {discountType === 'percentage' ? `${discountValue}%` : ''}</span><span>{formatNumber(discount)}</span></div>}
            <div className="flex justify-between py-2.5 text-sm font-bold" style={{ backgroundColor: navy, color: 'white', margin: '0 -8px', padding: '8px 16px' }}>
              <span>{t('totalTTC')}</span><span>{formatNumber(totalTTC)} {t('dh')}</span>
            </div>
          </div>
        </div>

        {layoutSettings.showAmountInWords && (
          <div className="rounded p-3 mb-6 text-xs italic" style={{ backgroundColor: '#f0f4f8' }}>
            {invoiceTexts.amountInWordsPhrase}: <span className="font-semibold">{amountInWords}</span>
          </div>
        )}

        {layoutSettings.showSellerIds && (seller.ice || seller.ifCode || seller.rc) && (
          <div className="flex gap-6 text-xs mb-6">
            {seller.ice && <span>ICE: {seller.ice}</span>}
            {seller.ifCode && <span>IF: {seller.ifCode}</span>}
            {seller.rc && <span>RC: {seller.rc}</span>}
            {seller.cnss && <span>CNSS: {seller.cnss}</span>}
          </div>
        )}

        {isAutoEntrepreneur && <p className="text-xs italic mb-4">{invoiceTexts.taxExemption}</p>}

        <div className={`flex justify-between mt-8 pt-4 border-t ${isRtl ? 'flex-row-reverse' : ''}`}>
          {layoutSettings.showFooterNotes && invoiceTexts.footerNotes && (
            <div className="flex-1">
              <h4 className="font-bold text-xs mb-2">{t('termsConditions')} :</h4>
              <p className="text-xs whitespace-pre-line">{invoiceTexts.footerNotes}</p>
            </div>
          )}
          {layoutSettings.showSignature && (
            <div className={`text-center ${isRtl ? 'mr-8' : 'ml-8'}`}>
              <div className="h-16" />
              <p className="font-semibold text-xs">{seller.businessName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
