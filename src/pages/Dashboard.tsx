import AppLayout from '@/components/AppLayout';
import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { FileText, Users, DollarSign, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

function StatCard({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLang();
  const { clients, invoicesCreated, seller, isAutoEntrepreneur, invoices, setClients, setInvoicesCreated, setSeller, setIsAutoEntrepreneur, setInvoices } = useInvoice();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const totalBilled = clients.reduce((sum, c) => sum + c.totalBilled, 0);

  const handleExport = () => {
    const data = JSON.stringify({ seller, clients, invoicesCreated, isAutoEntrepreneur, invoices }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facturapro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: t('exportSuccess') });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.seller) setSeller(data.seller);
        if (data.clients) setClients(data.clients);
        if (typeof data.invoicesCreated === 'number') setInvoicesCreated(data.invoicesCreated);
        if (typeof data.isAutoEntrepreneur === 'boolean') setIsAutoEntrepreneur(data.isAutoEntrepreneur);
        if (data.invoices) setInvoices(data.invoices);
        toast({ title: t('importSuccess') });
      } catch {
        toast({ title: t('importError'), variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-foreground">{t('dashboard')}</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 me-1.5" />
              {t('exportData')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 me-1.5" />
              {t('importData')}
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard icon={FileText} label={t('invoicesCount')} value={String(invoicesCreated)} />
          <StatCard icon={Users} label={t('clients')} value={String(clients.length)} />
          <StatCard icon={DollarSign} label={t('totalBilled')} value={`${totalBilled.toFixed(2)} ${t('dh')}`} />
        </div>

        {/* Clients list */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">{t('clients')}</h2>
          </div>
          {clients.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">{t('noClients')}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-5 py-2.5 text-start font-medium">{t('clientName')}</th>
                  <th className="px-5 py-2.5 text-start font-medium">ICE</th>
                  <th className="px-5 py-2.5 text-end font-medium">{t('invoicesCount')}</th>
                  <th className="px-5 py-2.5 text-end font-medium">{t('totalBilled')}</th>
                  <th className="px-5 py-2.5 text-end font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} className="border-b border-border last:border-b-0">
                    <td className="px-5 py-3 text-sm text-foreground">{client.name}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{client.ice || '—'}</td>
                    <td className="px-5 py-3 text-end text-sm text-foreground">{client.invoiceCount}</td>
                    <td className="px-5 py-3 text-end text-sm font-medium text-foreground">{client.totalBilled.toFixed(2)} {t('dh')}</td>
                    <td className="px-5 py-3 text-end">
                      <Button size="sm" variant="ghost" onClick={() => setClients(prev => prev.filter(c => c.id !== client.id))}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
