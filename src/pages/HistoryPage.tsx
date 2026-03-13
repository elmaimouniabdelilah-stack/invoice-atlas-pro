import AppLayout from '@/components/AppLayout';
import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { calculateTotalTTC } from '@/lib/invoiceTypes';
import { FileText, Eye, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const { t } = useLang();
  const { invoices, setInvoices, loadInvoice, setEditingInvoiceId } = useInvoice();
  const navigate = useNavigate();

  const handleView = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    loadInvoice(inv);
    setEditingInvoiceId(null);
    navigate('/invoice');
  };

  const handleEdit = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    loadInvoice(inv);
    setEditingInvoiceId(id);
    navigate('/invoice');
  };

  const handleDelete = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-8">
        <h1 className="text-xl font-semibold text-foreground mb-6">{t('invoiceHistory')}</h1>

        <div className="rounded-lg border border-border bg-card">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">{t('noInvoices')}</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-5 py-2.5 text-start font-medium">{t('invoiceNumber')}</th>
                      <th className="px-5 py-2.5 text-start font-medium">{t('invoiceDate')}</th>
                      <th className="px-5 py-2.5 text-start font-medium">{t('client')}</th>
                      <th className="px-5 py-2.5 text-end font-medium">{t('totalTTC')}</th>
                      <th className="px-5 py-2.5 text-end font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...invoices].reverse().map(inv => (
                      <tr key={inv.id} className="border-b border-border last:border-b-0">
                        <td className="px-5 py-3 text-sm font-medium text-foreground">{inv.number}</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{inv.date}</td>
                        <td className="px-5 py-3 text-sm text-foreground">{inv.buyer.clientName || '—'}</td>
                        <td className="px-5 py-3 text-end text-sm font-medium text-foreground">{inv.totalTTC.toFixed(2)} {t('dh')}</td>
                        <td className="px-5 py-3 text-end">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(inv.id)}>
                              <Pencil className="h-3.5 w-3.5 me-1" />
                              {t('editInvoice')}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleView(inv.id)}>
                              <Eye className="h-3.5 w-3.5 me-1" />
                              {t('viewInvoice')}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(inv.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-border">
                {[...invoices].reverse().map(inv => (
                  <div key={inv.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{inv.number}</span>
                      <span className="text-sm font-semibold text-foreground">{inv.totalTTC.toFixed(2)} {t('dh')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{inv.buyer.clientName || '—'}</span>
                      <span>{inv.date}</span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={() => handleEdit(inv.id)}>
                        <Pencil className="h-3 w-3 me-1" />
                        {t('editInvoice')}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs flex-1" onClick={() => handleView(inv.id)}>
                        <Eye className="h-3 w-3 me-1" />
                        {t('viewInvoice')}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDelete(inv.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
