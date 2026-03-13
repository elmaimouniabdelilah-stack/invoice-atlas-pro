import AppLayout from '@/components/AppLayout';
import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { FileText, Users, DollarSign, Download, Upload, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRef, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
  'hsl(var(--chart-5, 340 75% 55%))',
];

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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLang();
  const { clients, invoicesCreated, seller, isAutoEntrepreneur, invoices, setClients, setInvoicesCreated, setSeller, setIsAutoEntrepreneur, setInvoices } = useInvoice();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const totalBilled = clients.reduce((sum, c) => sum + c.totalBilled, 0);
  const avgInvoice = invoices.length > 0 ? totalBilled / invoices.length : 0;

  const monthNames = useMemo(() => [
    t('month1'), t('month2'), t('month3'), t('month4'), t('month5'), t('month6'),
    t('month7'), t('month8'), t('month9'), t('month10'), t('month11'), t('month12'),
  ], [t]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { name: string; revenue: number; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const matching = invoices.filter(inv => inv.date.startsWith(key));
      months.push({
        name: monthNames[d.getMonth()],
        revenue: matching.reduce((s, inv) => s + inv.totalTTC, 0),
        count: matching.length,
      });
    }
    return months;
  }, [invoices, monthNames]);

  const topClientsData = useMemo(() => {
    return [...clients]
      .sort((a, b) => b.totalBilled - a.totalBilled)
      .slice(0, 5)
      .map(c => ({ name: c.name, value: c.totalBilled }));
  }, [clients]);

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
      <div className="p-4 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={FileText} label={t('invoicesCount')} value={String(invoicesCreated)} />
          <StatCard icon={Users} label={t('clients')} value={String(clients.length)} />
          <StatCard icon={DollarSign} label={t('totalBilled')} value={`${totalBilled.toFixed(2)} ${t('dh')}`} />
          <StatCard icon={TrendingUp} label={t('averageInvoice')} value={`${avgInvoice.toFixed(2)} ${t('dh')}`} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Revenue Area Chart */}
          <ChartCard title={t('monthlyRevenue')}>
            {invoices.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">{t('noData')}</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGrad)" name={t('revenue')} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Invoices per Month Bar Chart */}
          <ChartCard title={t('invoicesPerMonth')}>
            {invoices.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">{t('noData')}</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name={t('count')} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Top Clients Pie Chart */}
          <ChartCard title={t('topClients')}>
            {topClientsData.length === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">{t('noData')}</div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={topClientsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {topClientsData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                        fontSize: 12,
                      }}
                      formatter={(value: number) => `${value.toFixed(2)} ${t('dh')}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center sm:flex-col sm:gap-1.5 min-w-[120px]">
                  {topClientsData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-muted-foreground truncate max-w-[100px]">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Clients list */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground">{t('clients')}</h2>
          </div>
          {clients.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">{t('noClients')}</div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-5 py-2.5 text-start font-medium">{t('clientName')}</th>
                      <th className="px-5 py-2.5 text-start font-medium">ICE</th>
                      <th className="px-5 py-2.5 text-end font-medium">{t('invoicesCount')}</th>
                      <th className="px-5 py-2.5 text-end font-medium">{t('totalBilled')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(client => (
                      <tr key={client.id} className="border-b border-border last:border-b-0">
                        <td className="px-5 py-3 text-sm text-foreground">{client.name}</td>
                        <td className="px-5 py-3 text-sm text-muted-foreground">{client.ice || '—'}</td>
                        <td className="px-5 py-3 text-end text-sm text-foreground">{client.invoiceCount}</td>
                        <td className="px-5 py-3 text-end text-sm font-medium text-foreground">{client.totalBilled.toFixed(2)} {t('dh')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden divide-y divide-border">
                {clients.map(client => (
                  <div key={client.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.ice || '—'} · {client.invoiceCount} {t('invoicesCount')}</p>
                    </div>
                    <span className="text-sm font-medium text-foreground">{client.totalBilled.toFixed(2)} {t('dh')}</span>
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
