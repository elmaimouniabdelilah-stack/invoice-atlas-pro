import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { calculateItemTotal, calculateTotalHT, calculateTotalTVA, calculateDiscount, calculateTotalTTCWithDiscount } from '@/lib/invoiceTypes';
import { numberToWordsFr, numberToWordsAr } from '@/lib/numberToWords';

interface Props {
  mobileView?: boolean;
}

export default function BlueTemplate({ mobileView = false }: Props) {
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

  const navy = '#1b2a4a';
  const red = '#c0392b';
  const formatNumber = (n: number) => n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (mobileView) {
    return (
      <div id="invoice-preview" className="bg-white rounded-lg border font-latin" style={{ fontSize: '11px', color: '#1a1a1a' }}>
        {/* Navy accent bar */}
        <div className="h-2" style={{ backgroundColor: navy }} />
        
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {seller.logo && <img src={seller.logo} alt="Logo" className="h-10 w-10 object-contain" />}
              <div>
                <h2 className="text-xs font-bold" style={{ color: red }}>{seller.businessName || 'COMPANY NAME'}</h2>
              </div>
            </div>
            <h1 className="text-lg font-black" style={{ color: navy }}>INVOICE</h1>
          </div>

          {/* Invoice meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-[10px]">
            <span><strong>INVOICE NO:</strong> {invoiceNumber}</span>
            <span><strong>DATE:</strong> {invoiceDate}</span>
            {dueDate && <span><strong>DUE:</strong> {dueDate}</span>}
            <span><strong>DUE TOTAL:</strong> {formatNumber(totalTTC)} DH</span>
          </div>

          {/* Client + Payment */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-[10px]">
            <div>
              <h4 className="font-bold text-xs mb-1" style={{ color: navy }}>INVOICE TO :</h4>
              <p className="font-semibold">{buyer.clientName || '—'}</p>
              <p>{buyer.address}</p>
              {buyer.ice && <p>ICE: {buyer.ice}</p>}
            </div>
            {(invoiceTexts.rib || invoiceTexts.iban) && (
              <div>
                <h4 className="font-bold text-xs mb-1" style={{ color: navy }}>PAYMENT:</h4>
                {invoiceTexts.bankName && <p><strong>Bank:</strong> {invoiceTexts.bankName}</p>}
                {invoiceTexts.rib && <p><strong>RIB:</strong> {invoiceTexts.rib}</p>}
                {invoiceTexts.iban && <p><strong>IBAN:</strong> {invoiceTexts.iban}</p>}
                {invoiceTexts.swift && <p><strong>SWIFT:</strong> {invoiceTexts.swift}</p>}
              </div>
            )}
          </div>

          {/* Items */}
          <table className="w-full text-[10px] mb-4">
            <thead>
              <tr style={{ backgroundColor: navy, color: 'white' }}>
                <th className="py-1.5 px-2 text-start font-bold">ITEM DESCRIPTION</th>
                <th className="py-1.5 px-1 text-end font-bold w-16">PRICE</th>
                <th className="py-1.5 px-1 text-center font-bold w-10">QTY</th>
                <th className="py-1.5 px-2 text-end font-bold w-16">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td className="py-2 px-2">
                    <div className="font-semibold">{item.description || '—'}</div>
                  </td>
                  <td className="py-2 px-1 text-end">{formatNumber(item.unitPrice)}</td>
                  <td className="py-2 px-1 text-center">{item.quantity}</td>
                  <td className="py-2 px-2 text-end font-medium">{formatNumber(calculateItemTotal(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-4">
            <div className="w-40 text-[10px]">
              <div className="flex justify-between py-1"><span>SUB TOTAL</span><span>{formatNumber(totalHT)}</span></div>
              {!isAutoEntrepreneur && <div className="flex justify-between py-1"><span>TAX</span><span>{formatNumber(adjustedTVA)}</span></div>}
              {discount > 0 && <div className="flex justify-between py-1"><span>DISC. {discountType === 'percentage' ? `${discountValue}%` : ''}</span><span>{formatNumber(discount)}</span></div>}
              <div className="flex justify-between py-1.5 font-bold text-xs" style={{ backgroundColor: navy, color: 'white', margin: '0 -4px', padding: '6px 8px' }}>
                <span>TOTAL</span><span>{formatNumber(totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="p-2 mb-3 rounded text-[10px] italic" style={{ backgroundColor: '#f0f4f8' }}>
            {invoiceTexts.amountInWordsPhrase}: <span className="font-semibold">{amountInWords}</span>
          </div>

          {/* Seller IDs */}
          {(seller.ice || seller.ifCode || seller.rc) && (
            <div className="text-[10px] mb-3">
              {seller.ice && <span className="mr-3">ICE: {seller.ice}</span>}
              {seller.ifCode && <span className="mr-3">IF: {seller.ifCode}</span>}
              {seller.rc && <span className="mr-3">RC: {seller.rc}</span>}
            </div>
          )}

          {isAutoEntrepreneur && <p className="text-[10px] italic mb-2">{invoiceTexts.taxExemption}</p>}

          {invoiceTexts.footerNotes && <p className="text-[10px] mt-2 whitespace-pre-line">{invoiceTexts.footerNotes}</p>}

          {/* Signature */}
          <div className="mt-4 pt-3 border-t flex justify-end">
            <div className="text-center text-[10px]">
              <div className="h-12" />
              <p className="font-semibold">{seller.businessName}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop A4
  return (
    <div id="invoice-preview" className="mx-auto w-[210mm] min-h-[297mm] bg-white invoice-shadow font-latin flex" style={{ fontSize: '11px', color: '#1a1a1a' }}>
      {/* Navy sidebar */}
      <div className="w-14 shrink-0 flex items-center justify-center" style={{ backgroundColor: navy }}>
        <span className="text-white font-black text-4xl tracking-[0.3em]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>INVOICE</span>
      </div>

      {/* Main content */}
      <div className="flex-1 p-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {seller.logo && <img src={seller.logo} alt="Logo" className="h-14 w-14 object-contain" />}
            <div>
              <h2 className="text-lg font-bold" style={{ color: red }}>{seller.businessName || 'COMPANY NAME'}</h2>
            </div>
          </div>
          <div className="text-end text-xs">
            <p>{seller.address}</p>
            {seller.phone && <p>📞 {seller.phone}</p>}
            {seller.email && <p>✉ {seller.email}</p>}
          </div>
        </div>

        <h1 className="text-2xl font-black mb-4" style={{ color: navy }}>INVOICE</h1>

        {/* Meta row */}
        <div className="flex gap-6 mb-6 text-xs" style={{ borderBottom: `2px solid ${navy}`, paddingBottom: '8px' }}>
          <span><strong>DUE TOTAL:</strong> {formatNumber(totalTTC)} DH</span>
          <span><strong>DATE:</strong> {invoiceDate}</span>
          {dueDate && <span><strong>DUE DATE:</strong> {dueDate}</span>}
          <span><strong>INVOICE NO:</strong> {invoiceNumber}</span>
        </div>

        {/* Invoice To + Payment */}
        <div className="flex gap-12 mb-8 text-xs">
          <div className="flex-1">
            <h4 className="font-bold mb-2" style={{ color: navy }}>INVOICE TO :</h4>
            <table className="text-xs">
              <tbody>
                <tr><td className="font-bold pr-3 py-0.5">Name</td><td>{buyer.clientName || '—'}</td></tr>
                <tr><td className="font-bold pr-3 py-0.5">Address</td><td>{buyer.address}</td></tr>
                {buyer.ice && <tr><td className="font-bold pr-3 py-0.5">ICE</td><td>{buyer.ice}</td></tr>}
              </tbody>
            </table>
          </div>
          {(invoiceTexts.rib || invoiceTexts.iban) && (
            <div className="flex-1">
              <h4 className="font-bold mb-2" style={{ color: navy }}>PAYMENT:</h4>
              <table className="text-xs">
                <tbody>
                  {invoiceTexts.bankName && <tr><td className="font-bold pr-3 py-0.5">Bank Name</td><td>{invoiceTexts.bankName}</td></tr>}
                  {invoiceTexts.rib && <tr><td className="font-bold pr-3 py-0.5">RIB</td><td>{invoiceTexts.rib}</td></tr>}
                  {invoiceTexts.iban && <tr><td className="font-bold pr-3 py-0.5">IBAN</td><td>{invoiceTexts.iban}</td></tr>}
                  {invoiceTexts.swift && <tr><td className="font-bold pr-3 py-0.5">Swift Code</td><td>{invoiceTexts.swift}</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr style={{ backgroundColor: navy, color: 'white' }}>
              {detailedMode && <th className="py-2.5 px-3 text-start text-xs font-bold w-16">RÉF</th>}
              <th className="py-2.5 px-3 text-start text-xs font-bold">ITEM DESCRIPTION</th>
              <th className="py-2.5 px-3 text-end text-xs font-bold w-20">PRICE</th>
              <th className="py-2.5 px-3 text-center text-xs font-bold w-14">QTY</th>
              {detailedMode && (
                <>
                  <th className="py-2.5 px-3 text-center text-xs font-bold w-12">L</th>
                  <th className="py-2.5 px-3 text-center text-xs font-bold w-12">H</th>
                  <th className="py-2.5 px-3 text-center text-xs font-bold w-14">M²</th>
                </>
              )}
              {!isAutoEntrepreneur && <th className="py-2.5 px-3 text-center text-xs font-bold w-14">TVA</th>}
              <th className="py-2.5 px-3 text-end text-xs font-bold w-24">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                {detailedMode && <td className="py-3 px-3 text-xs">{item.reference || '—'}</td>}
                <td className="py-3 px-3">
                  <div className="font-semibold">{item.description || '—'}</div>
                </td>
                <td className="py-3 px-3 text-end">{formatNumber(item.unitPrice)}</td>
                <td className="py-3 px-3 text-center">{item.quantity}</td>
                {detailedMode && (
                  <>
                    <td className="py-3 px-3 text-center">{item.length || '—'}</td>
                    <td className="py-3 px-3 text-center">{item.height || '—'}</td>
                    <td className="py-3 px-3 text-center">{item.totalM2 || '—'}</td>
                  </>
                )}
                {!isAutoEntrepreneur && <td className="py-3 px-3 text-center">{item.tvaRate}%</td>}
                <td className="py-3 px-3 text-end font-medium">{formatNumber(calculateItemTotal(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 text-sm border-b"><span>SUB TOTAL</span><span>{formatNumber(totalHT)}</span></div>
            {!isAutoEntrepreneur && <div className="flex justify-between py-2 text-sm border-b"><span>TAX</span><span>{formatNumber(adjustedTVA)}</span></div>}
            {discount > 0 && <div className="flex justify-between py-2 text-sm border-b"><span>DISC. {discountType === 'percentage' ? `${discountValue}%` : ''}</span><span>{formatNumber(discount)}</span></div>}
            <div className="flex justify-between py-2.5 text-sm font-bold" style={{ backgroundColor: navy, color: 'white', margin: '0 -8px', padding: '8px 16px' }}>
              <span>TOTAL</span><span>{formatNumber(totalTTC)} DH</span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div className="rounded p-3 mb-6 text-xs italic" style={{ backgroundColor: '#f0f4f8' }}>
          {invoiceTexts.amountInWordsPhrase}: <span className="font-semibold">{amountInWords}</span>
        </div>

        {/* Seller IDs */}
        {(seller.ice || seller.ifCode || seller.rc) && (
          <div className="flex gap-6 text-xs mb-6">
            {seller.ice && <span>ICE: {seller.ice}</span>}
            {seller.ifCode && <span>IF: {seller.ifCode}</span>}
            {seller.rc && <span>RC: {seller.rc}</span>}
            {seller.cnss && <span>CNSS: {seller.cnss}</span>}
          </div>
        )}

        {isAutoEntrepreneur && <p className="text-xs italic mb-4">{invoiceTexts.taxExemption}</p>}

        {/* Terms + Signature */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          {invoiceTexts.footerNotes && (
            <div className="flex-1">
              <h4 className="font-bold text-xs mb-2">Terms & Conditions :</h4>
              <p className="text-xs whitespace-pre-line">{invoiceTexts.footerNotes}</p>
            </div>
          )}
          <div className="text-center ml-8">
            <div className="h-16" />
            <p className="font-semibold text-xs">{seller.businessName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
