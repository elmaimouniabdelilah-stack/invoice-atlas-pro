import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { calculateItemTotal, calculateTotalHT, calculateTotalTVA, calculateDiscount, calculateTotalTTCWithDiscount } from '@/lib/invoiceTypes';
import { numberToWordsFr, numberToWordsAr } from '@/lib/numberToWords';
import { MapPin, Phone, Mail } from 'lucide-react';

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

export default function GreenTemplate({ mobileView = false }: Props) {
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

  const accentColor = templateColor;
  const accentBg = templateColor + '15';
  const accentBorder = templateColor + '40';
  const isRtl = layoutSettings.direction === 'rtl';
  const fontFamily = fontMap[layoutSettings.font] || fontMap.inter;
  const textAlign = isRtl ? 'right' as const : 'left' as const;
  const textEnd = isRtl ? 'left' as const : 'right' as const;

  const formatNumber = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const renderHeader = (logoSize: string, titleSize: string, isMobile: boolean) => {
    const logo = seller.logo && <img src={seller.logo} alt="Logo" className={`${logoSize} object-contain`} />;
    const name = <h2 className={`${isMobile ? 'text-sm' : 'text-xl'} font-black`} style={{ color: accentColor }}>{seller.businessName || t('businessName')}</h2>;
    const title = <h1 className={`${titleSize} font-black tracking-tight`}>{invoiceTexts.invoiceTitle?.replace(' N°', '') || t('docTypeInvoice')}</h1>;

    if (layoutSettings.logoPosition === 'center') {
      return (
        <div className="text-center mb-2">
          <div className="flex justify-center items-center gap-3 mb-2">
            {logo}
            {name}
          </div>
          {title}
        </div>
      );
    }
    
    const logoBlock = (
      <div className="flex items-center gap-3">
        {layoutSettings.logoPosition === 'left' ? <>{logo}{name}</> : <>{name}{logo}</>}
      </div>
    );

    return (
      <div className={`flex items-start justify-between mb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {logoBlock}
        {title}
      </div>
    );
  };

  if (mobileView) {
    return (
      <div id="invoice-preview" dir={isRtl ? 'rtl' : 'ltr'} className="bg-white rounded-lg border" style={{ fontSize: '11px', color: '#1a1a1a', fontFamily }}>
        <div className="p-4 pb-0">
          {renderHeader('h-12 w-12', 'text-lg', true)}

          <div className="h-0.5 mb-3" style={{ backgroundColor: accentColor }} />

          <div className={`flex justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div className="space-y-1 text-[10px]">
              {seller.address && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" style={{ color: accentColor }} />{seller.address}</div>}
              {seller.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" style={{ color: accentColor }} />{seller.phone}</div>}
              {seller.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" style={{ color: accentColor }} />{seller.email}</div>}
            </div>
            <div className="border text-[10px]" style={{ borderColor: accentBorder }}>
              <div className="flex"><span className="px-2 py-1 font-semibold" style={{ backgroundColor: accentBg }}>{t('invoiceLabel')}:</span><span className="px-2 py-1">{invoiceNumber}</span></div>
              <div className="flex border-t" style={{ borderColor: accentBorder }}><span className="px-2 py-1 font-semibold" style={{ backgroundColor: accentBg }}>{t('dateLabel')}:</span><span className="px-2 py-1">{invoiceDate}</span></div>
              {dueDate && <div className="flex border-t" style={{ borderColor: accentBorder }}><span className="px-2 py-1 font-semibold" style={{ backgroundColor: accentBg }}>{t('dueDateLabel')}:</span><span className="px-2 py-1">{dueDate}</span></div>}
            </div>
          </div>
        </div>

        <div className="mx-4 mb-4 border p-3" style={{ borderColor: accentBorder }}>
          <h3 className="font-bold text-xs mb-1">{t('clientLabel')} :</h3>
          <p className="font-semibold text-xs">{buyer.clientName || '—'}</p>
          <p className="text-[10px]">{buyer.address}</p>
          {buyer.ice && <p className="text-[10px]">ICE: {buyer.ice}</p>}
        </div>

        <div className="mx-4 mb-4">
          <table className="w-full text-[10px]">
            <thead>
              <tr style={{ backgroundColor: accentColor, color: 'white' }}>
                <th className="py-1.5 px-2 font-bold" style={{ textAlign }}>{t('designation')}</th>
                <th className="py-1.5 px-1 text-center font-bold w-10">{t('qty')}</th>
                <th className="py-1.5 px-1 font-bold w-20" style={{ textAlign: textEnd }}>{t('unitPriceShort')} ({t('dh')})</th>
                <th className="py-1.5 px-2 font-bold w-20" style={{ textAlign: textEnd }}>{t('total')} ({t('dh')})</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td className="py-2 px-2">{item.description || '—'}</td>
                  <td className="py-2 px-1 text-center">{item.quantity}</td>
                  <td className="py-2 px-1" style={{ textAlign: textEnd }}>{formatNumber(item.unitPrice)} {t('dh')}</td>
                  <td className="py-2 px-2" style={{ textAlign: textEnd }}>{formatNumber(calculateItemTotal(item))} {t('dh')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`mx-4 mb-4 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
          <div className="text-[11px] w-48">
            <div className="flex justify-between py-1"><span className="font-bold">{t('totalHT')}:</span><span>{formatNumber(totalHT)} {t('dh')}</span></div>
            {discount > 0 && (
              <>
                <div className="flex justify-between py-1"><span>{t('discount')} {discountType === 'percentage' ? `(${discountValue}%)` : ''}:</span><span style={{ color: '#c0392b' }}>-{formatNumber(discount)} {t('dh')}</span></div>
                <div className="flex justify-between py-1"><span>{t('netHT')}:</span><span>{formatNumber(discountedHT)} {t('dh')}</span></div>
              </>
            )}
            {!isAutoEntrepreneur && <div className="flex justify-between py-1"><span className="font-bold">{t('totalTVA')} {items[0]?.tvaRate || 20}%:</span><span>{formatNumber(adjustedTVA)} {t('dh')}</span></div>}
            <div className="flex justify-between py-1.5 font-bold text-xs border-t-2" style={{ borderColor: accentColor }}>
              <span>{t('totalTTC')}:</span><span style={{ color: accentColor }}>{formatNumber(totalTTC)} {t('dh')}</span>
            </div>
          </div>
        </div>

        {layoutSettings.showAmountInWords && (
          <div className="mx-4 mb-3 p-2 rounded text-[10px] italic" style={{ backgroundColor: accentBg }}>
            {invoiceTexts.amountInWordsPhrase}: <span className="font-semibold">{amountInWords}</span>
          </div>
        )}

        <div className="mx-4 mb-3">
          {layoutSettings.showSellerIds && (seller.ice || seller.ifCode || seller.rc) && (
            <div className="border p-2 mb-3 text-[10px]" style={{ borderColor: accentBorder }}>
              <h4 className="font-bold mb-1">{t('paymentMethod')} :</h4>
              <div className="space-y-0.5">
                {seller.ice && <p>ICE : {seller.ice}</p>}
                {seller.ifCode && <p>IF : {seller.ifCode}</p>}
                {seller.rc && <p>RC : {seller.rc}</p>}
                {seller.cnss && <p>CNSS : {seller.cnss}</p>}
              </div>
            </div>
          )}

          {layoutSettings.showBankInfo && (invoiceTexts.rib || invoiceTexts.iban) && (
            <div className="border p-2 mb-3 text-[10px] font-mono" style={{ borderColor: accentBorder }}>
              {invoiceTexts.bankName && <p>{t('bankName')}: {invoiceTexts.bankName}</p>}
              {invoiceTexts.rib && <p>RIB: {invoiceTexts.rib}</p>}
              {invoiceTexts.iban && <p>IBAN: {invoiceTexts.iban}</p>}
              {invoiceTexts.swift && <p>SWIFT: {invoiceTexts.swift}</p>}
            </div>
          )}

          {isAutoEntrepreneur && <p className="text-[10px] italic mb-2">{invoiceTexts.taxExemption}</p>}

          {layoutSettings.showThankYou && (
            <p className="text-center italic text-[11px] my-3" style={{ color: accentColor }}>{t('thankYou')}</p>
          )}

          {layoutSettings.showSignature && (
            <div className="border-t pt-2 text-[10px]" style={{ borderColor: accentBorder }}>
              <p className="font-semibold">{t('stampSignature')} :</p>
            </div>
          )}

          {layoutSettings.showFooterNotes && invoiceTexts.footerNotes && <p className="text-[10px] mt-2 whitespace-pre-line">{invoiceTexts.footerNotes}</p>}
        </div>
      </div>
    );
  }

  // Desktop A4
  return (
    <div id="invoice-preview" dir={isRtl ? 'rtl' : 'ltr'} className="mx-auto w-[210mm] min-h-[297mm] bg-white p-10 invoice-shadow" style={{ fontSize: '11px', color: '#1a1a1a', fontFamily }}>
      {renderHeader('h-16 w-16', 'text-3xl', false)}

      <div className="h-1 mb-5" style={{ backgroundColor: accentColor }} />

      <div className={`flex justify-between mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className="space-y-1.5 text-xs">
          {seller.address && <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}><MapPin className="h-3.5 w-3.5" style={{ color: accentColor }} />{seller.address}</div>}
          {seller.phone && <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}><Phone className="h-3.5 w-3.5" style={{ color: accentColor }} />{seller.phone}</div>}
          {seller.email && <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}><Mail className="h-3.5 w-3.5" style={{ color: accentColor }} />{seller.email}</div>}
        </div>
        <div className="border" style={{ borderColor: accentBorder }}>
          <div className="flex"><span className="px-4 py-2 text-xs font-semibold w-28" style={{ backgroundColor: accentBg }}>{t('invoiceLabel')}:</span><span className="px-4 py-2 text-xs w-36" style={{ textAlign: textEnd }}>{invoiceNumber}</span></div>
          <div className="flex border-t" style={{ borderColor: accentBorder }}><span className="px-4 py-2 text-xs font-semibold w-28" style={{ backgroundColor: accentBg }}>{t('dateLabel')}:</span><span className="px-4 py-2 text-xs w-36" style={{ textAlign: textEnd }}>{invoiceDate}</span></div>
          {dueDate && <div className="flex border-t" style={{ borderColor: accentBorder }}><span className="px-4 py-2 text-xs font-semibold w-28" style={{ backgroundColor: accentBg }}>{t('dueDateLabel')}:</span><span className="px-4 py-2 text-xs w-36" style={{ textAlign: textEnd }}>{dueDate}</span></div>}
        </div>
      </div>

      <div className="border p-5 mb-8" style={{ borderColor: accentBorder }}>
        <h3 className="font-bold text-sm mb-2">{t('clientLabel')} :</h3>
        <p className="font-semibold">{buyer.clientName || '—'}</p>
        <p className="text-xs">{buyer.address}</p>
        {buyer.ice && <p className="text-xs">ICE: {buyer.ice}</p>}
      </div>

      <table className="w-full mb-6">
        <thead>
          <tr style={{ backgroundColor: accentColor, color: 'white' }}>
            {detailedMode && <th className="py-2.5 px-3 text-xs font-bold uppercase" style={{ textAlign }}>{t('reference')}</th>}
            <th className="py-2.5 px-3 text-xs font-bold uppercase" style={{ textAlign }}>{t('designation')}</th>
            <th className="py-2.5 px-3 text-center text-xs font-bold uppercase w-16">{t('qty')}</th>
            {detailedMode && (
              <>
                <th className="py-2.5 px-3 text-center text-xs font-bold uppercase w-14">L</th>
                <th className="py-2.5 px-3 text-center text-xs font-bold uppercase w-14">H</th>
                <th className="py-2.5 px-3 text-center text-xs font-bold uppercase w-16">M²</th>
              </>
            )}
            <th className="py-2.5 px-3 text-xs font-bold uppercase w-28" style={{ textAlign: textEnd }}>{t('unitPriceShort')} ({t('dh')})</th>
            {!isAutoEntrepreneur && <th className="py-2.5 px-3 text-center text-xs font-bold uppercase w-16">{t('tvaRate')}</th>}
            <th className="py-2.5 px-3 text-xs font-bold uppercase w-28" style={{ textAlign: textEnd }}>{t('total')} ({t('dh')})</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: i % 2 === 1 ? '#f9f9f9' : 'white' }}>
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
              <td className="py-3 px-3" style={{ textAlign: textEnd }}>{formatNumber(item.unitPrice)} {t('dh')}</td>
              {!isAutoEntrepreneur && <td className="py-3 px-3 text-center">{item.tvaRate}%</td>}
              <td className="py-3 px-3 font-medium" style={{ textAlign: textEnd }}>{formatNumber(calculateItemTotal(item))} {t('dh')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} mb-8`}>
        <div className="w-72">
          <div className="flex justify-between py-2 text-sm"><span className="font-bold">{t('totalHT')}:</span><span>{formatNumber(totalHT)} {t('dh')}</span></div>
          {discount > 0 && (
            <>
              <div className="flex justify-between py-1 text-sm"><span>{t('discount')} {discountType === 'percentage' ? `(${discountValue}%)` : ''}:</span><span style={{ color: '#c0392b' }}>-{formatNumber(discount)} {t('dh')}</span></div>
              <div className="flex justify-between py-1 text-sm"><span>{t('netHT')}:</span><span>{formatNumber(discountedHT)} {t('dh')}</span></div>
            </>
          )}
          {!isAutoEntrepreneur && (
            <div className="flex justify-between py-2 text-sm"><span className="font-bold">{t('totalTVA')} {items[0]?.tvaRate || 20}%:</span><span>{formatNumber(adjustedTVA)} {t('dh')}</span></div>
          )}
          <div className="flex justify-between py-2.5 text-base font-bold border-t-2" style={{ borderColor: accentColor }}>
            <span>{t('totalTTC')}:</span><span style={{ color: accentColor }}>{formatNumber(totalTTC)} {t('dh')}</span>
          </div>
        </div>
      </div>

      {layoutSettings.showAmountInWords && (
        <div className="rounded p-3 mb-6 text-xs italic" style={{ backgroundColor: accentBg }}>
          {invoiceTexts.amountInWordsPhrase}: <span className="font-semibold">{amountInWords}</span>
        </div>
      )}

      <div className={`flex justify-between mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
        {layoutSettings.showSellerIds && (seller.ice || seller.ifCode || seller.rc) && (
          <div className={`border p-4 flex-1 ${isRtl ? 'ml-4' : 'mr-4'} text-xs`} style={{ borderColor: accentBorder }}>
            <h4 className="font-bold mb-2">{t('paymentMethod')} :</h4>
            {seller.ice && <p>ICE : {seller.ice}</p>}
            {seller.ifCode && <p>IF : {seller.ifCode}</p>}
            {seller.rc && <p>RC : {seller.rc}</p>}
            {seller.cnss && <p>CNSS : {seller.cnss}</p>}
          </div>
        )}
        {layoutSettings.showBankInfo && (invoiceTexts.rib || invoiceTexts.iban) && (
          <div className="border p-4 flex-1 text-xs font-mono" style={{ borderColor: accentBorder }}>
            <h4 className="font-bold mb-2 font-sans">{t('bankInfo')}</h4>
            {invoiceTexts.bankName && <p>{invoiceTexts.bankName}</p>}
            {invoiceTexts.rib && <p>RIB: {invoiceTexts.rib}</p>}
            {invoiceTexts.iban && <p>IBAN: {invoiceTexts.iban}</p>}
            {invoiceTexts.swift && <p>SWIFT: {invoiceTexts.swift}</p>}
          </div>
        )}
      </div>

      {isAutoEntrepreneur && <p className="text-xs italic mb-4">{invoiceTexts.taxExemption}</p>}

      {layoutSettings.showThankYou && (
        <div className="my-6" style={{ borderTop: `1px solid ${accentBorder}`, borderBottom: `1px solid ${accentBorder}` }}>
          <p className="text-center italic text-sm py-3" style={{ color: accentColor }}>{t('thankYou')}</p>
        </div>
      )}

      {layoutSettings.showSignature && (
        <div className="mt-6 pt-4">
          <p className="font-semibold text-xs">{t('stampSignature')} :</p>
          <div className="h-20" />
        </div>
      )}

      {layoutSettings.showFooterNotes && invoiceTexts.footerNotes && (
        <div className="border-t pt-4 mt-4" style={{ borderColor: accentBorder }}>
          <p className="text-xs whitespace-pre-line">{invoiceTexts.footerNotes}</p>
        </div>
      )}
    </div>
  );
}
