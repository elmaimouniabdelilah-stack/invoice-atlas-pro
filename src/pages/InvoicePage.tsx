import AppLayout from '@/components/AppLayout';
import InvoiceForm from '@/components/InvoiceForm';
import TrialLimitModal, { isActivated } from '@/components/TrialLimitModal';
import InvoicePreview from '@/components/InvoicePreview';
import { Button } from '@/components/ui/button';
import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { calculateTotalTTCWithDiscount, generateInvoiceNumber } from '@/lib/invoiceTypes';
import { Download, Printer, FileDown, Eye, Edit3, Share2, Mail, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

const TRIAL_LIMIT = 3;

export default function InvoicePage() {
  const { t } = useLang();
  const {
    seller, buyer, items, isAutoEntrepreneur,
    clients, setClients,
    invoiceNumber, invoiceDate,
    invoicesCreated, setInvoicesCreated,
    invoices, setInvoices,
    setBuyer, setItems, setInvoiceNumber, setInvoiceDate,
    dueDate, setDueDate,
    editingInvoiceId, setEditingInvoiceId,
    discountType, discountValue, setDiscountType, setDiscountValue,
  } = useInvoice();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const handleExportPdf = async () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoiceNumber}.pdf`);
      toast({ title: t('pdfExported') });
    } catch {
      toast({ title: t('pdfExportError'), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getInvoiceCanvas = async () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return null;
    return html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  };

  const handleShareImage = async () => {
    if (!navigator.share) {
      toast({ title: t('shareNotSupported'), variant: 'destructive' });
      return;
    }
    setExporting(true);
    try {
      const canvas = await getInvoiceCanvas();
      if (!canvas) return;
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
      if (!blob) return;
      const file = new File([blob], `${invoiceNumber}.png`, { type: 'image/png' });
      await navigator.share({ title: invoiceNumber, files: [file] });
    } catch (e: any) {
      if (e?.name !== 'AbortError') toast({ title: t('shareError'), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleSharePdf = async () => {
    if (!navigator.share) {
      toast({ title: t('shareNotSupported'), variant: 'destructive' });
      return;
    }
    setExporting(true);
    try {
      const canvas = await getInvoiceCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${invoiceNumber}.pdf`, { type: 'application/pdf' });
      await navigator.share({ title: invoiceNumber, files: [file] });
    } catch (e: any) {
      if (e?.name !== 'AbortError') toast({ title: t('shareError'), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setExporting(true);
    try {
      const canvas = await getInvoiceCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${invoiceNumber}.pdf`, { type: 'application/pdf' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: invoiceNumber, files: [file] });
      } else {
        const totalTTC = calculateTotalTTCWithDiscount(items, isAutoEntrepreneur, discountType, discountValue);
        const message = encodeURIComponent(`${t('invoiceLabel')} ${invoiceNumber}\n${t('totalTTC')}: ${totalTTC.toFixed(2)} ${t('dh')}\n${t('dateLabel')}: ${invoiceDate}`);
        window.open(`https://wa.me/?text=${message}`, '_blank');
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') toast({ title: t('shareError'), variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleShareEmail = async () => {
    const totalTTC = calculateTotalTTCWithDiscount(items, isAutoEntrepreneur, discountType, discountValue);
    const subject = encodeURIComponent(`${t('invoiceLabel')} ${invoiceNumber}`);
    const body = encodeURIComponent(
      `${t('invoiceLabel')}: ${invoiceNumber}\n${t('clientLabel')}: ${buyer.clientName}\n${t('dateLabel')}: ${invoiceDate}\n${t('totalTTC')}: ${totalTTC.toFixed(2)} ${t('dh')}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  const handleSaveAndExport = async () => {
    if (!buyer.clientName) {
      toast({ title: 'يرجى إدخال اسم العميل', variant: 'destructive' });
      return;
    }
    const totalTTC = calculateTotalTTCWithDiscount(items, isAutoEntrepreneur, discountType, discountValue);

    await handleExportPdf();

    if (editingInvoiceId) {
      setInvoices(prev => prev.map(inv => inv.id === editingInvoiceId ? {
        ...inv,
        number: invoiceNumber,
        date: invoiceDate,
        seller: { ...seller },
        buyer: { ...buyer },
        items: items.map(i => ({ ...i })),
        isAutoEntrepreneur,
        totalTTC,
        discountType,
        discountValue,
      } : inv));
      setEditingInvoiceId(null);
      toast({ title: t('invoiceUpdated') });
    } else {
      setInvoices(prev => [...prev, {
        id: crypto.randomUUID(),
        number: invoiceNumber,
        date: invoiceDate,
        seller: { ...seller },
        buyer: { ...buyer },
        items: items.map(i => ({ ...i })),
        isAutoEntrepreneur,
        totalTTC,
        discountType,
        discountValue,
      }]);

      setClients(prev => {
        const existing = prev.find(c => c.ice === buyer.ice && buyer.ice);
        if (existing) {
          return prev.map(c => c.id === existing.id ? {
            ...c, totalBilled: c.totalBilled + totalTTC, invoiceCount: c.invoiceCount + 1,
          } : c);
        }
        return [...prev, {
          id: crypto.randomUUID(), name: buyer.clientName, address: buyer.address,
          ice: buyer.ice, totalBilled: totalTTC, invoiceCount: 1,
        }];
      });

      setInvoicesCreated(prev => prev + 1);
      toast({ title: t('invoiceSaved') });
    }

    setBuyer({ clientName: '', address: '', ice: '' });
    setItems([{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, tvaRate: isAutoEntrepreneur ? 0 : 20 }]);
    setInvoiceNumber(generateInvoiceNumber());
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setDiscountType('percentage');
    setDiscountValue(0);
  };

  const trialExceeded = invoicesCreated >= TRIAL_LIMIT && !editingInvoiceId && !isActivated();

  if (isMobile) {
    return (
      <AppLayout>
        {trialExceeded && <TrialLimitModal />}
        <div className="flex flex-col h-full">
          {/* Mobile tab switcher */}
          <div className="flex items-center justify-center border-b border-border px-4 py-2.5">
            <div className="flex gap-1 rounded-lg border border-border p-0.5 bg-muted/50 w-full max-w-xs">
              <button
                onClick={() => setMobileTab('form')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mobileTab === 'form' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Edit3 className="h-4 w-4" />
                {editingInvoiceId ? t('editInvoice') : t('newInvoice')}
              </button>
              <button
                onClick={() => setMobileTab('preview')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mobileTab === 'preview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Eye className="h-4 w-4" />
                {t('preview')}
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto relative">
            <div className={mobileTab === 'form' ? '' : 'hidden'}>
              <InvoiceForm />
            </div>
            <div className={mobileTab === 'preview' ? 'p-3' : ''}>
              {mobileTab !== 'preview' && (
                <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                  <InvoicePreview mobileView />
                </div>
              )}
              {mobileTab === 'preview' && <InvoicePreview mobileView />}
            </div>
          </div>

          {/* Fixed bottom action bar */}
          <div className="flex items-center gap-2 border-t border-border bg-card px-4 py-3 safe-area-bottom">
            <Button variant="outline" onClick={handlePrint} disabled={trialExceeded} className="h-10 w-10 p-0 shrink-0">
              <Printer className="h-4.5 w-4.5" />
            </Button>
            <Button variant="outline" onClick={handleExportPdf} disabled={exporting || trialExceeded} className="h-10 px-3 text-sm">
              <FileDown className="h-4 w-4" />
              PDF
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exporting || trialExceeded} className="h-10 w-10 p-0 shrink-0">
                  <Share2 className="h-4.5 w-4.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShareImage}>
                  {t('shareAsImage')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSharePdf}>
                  {t('shareAsPdf')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleSaveAndExport} disabled={exporting || trialExceeded} className="h-10 flex-1 text-sm font-semibold">
              <Download className="h-4 w-4" />
              {editingInvoiceId ? t('updateInvoice') : t('exportPdf')}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {trialExceeded && <TrialLimitModal />}
      <div className="flex h-full">
        <div className="w-[440px] shrink-0 overflow-y-auto border-e border-border">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-foreground">
              {editingInvoiceId ? t('editInvoice') : t('newInvoice')}
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handlePrint} disabled={trialExceeded}>
                <Printer className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportPdf} disabled={exporting || trialExceeded}>
                <FileDown className="h-3.5 w-3.5" />
                PDF
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" disabled={exporting || trialExceeded}>
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleShareImage}>
                    {t('shareAsImage')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSharePdf}>
                    {t('shareAsPdf')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={handleSaveAndExport} disabled={exporting || trialExceeded}>
                <Download className="h-3.5 w-3.5" />
                {editingInvoiceId ? t('updateInvoice') : t('exportPdf')}
              </Button>
            </div>
          </div>
          <InvoiceForm />
        </div>
        <div className="flex-1 overflow-y-auto bg-invoice-bg p-8">
          <InvoicePreview />
        </div>
      </div>
    </AppLayout>
  );
}
