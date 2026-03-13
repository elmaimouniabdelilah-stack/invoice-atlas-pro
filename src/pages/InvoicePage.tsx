import AppLayout from '@/components/AppLayout';
import InvoiceForm from '@/components/InvoiceForm';
import TrialLimitModal, { isActivated } from '@/components/TrialLimitModal';
import InvoicePreview from '@/components/InvoicePreview';
import { Button } from '@/components/ui/button';
import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { calculateTotalTTCWithDiscount, generateInvoiceNumber } from '@/lib/invoiceTypes';
import { Download, Printer, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

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

  const handleSaveAndExport = async () => {
    if (!buyer.clientName) {
      toast({ title: 'يرجى إدخال اسم العميل', variant: 'destructive' });
      return;
    }
    const totalTTC = calculateTotalTTCWithDiscount(items, isAutoEntrepreneur, discountType, discountValue);

    // Export PDF first (before resetting the form)
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

    // Reset form completely for a new invoice
    setBuyer({ clientName: '', address: '', ice: '' });
    setItems([{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, tvaRate: isAutoEntrepreneur ? 0 : 20 }]);
    setInvoiceNumber(generateInvoiceNumber());
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setDiscountType('percentage');
    setDiscountValue(0);
  };

  const trialExceeded = invoicesCreated >= TRIAL_LIMIT && !editingInvoiceId && !isActivated();

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
