import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminShell from '@/components/admin/AdminShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import { UserCircle, Home, KeyRound, CalendarClock, FileText, Wallet, Loader2 } from 'lucide-react';

interface SubInfo {
  code: string;
  isTrial: boolean;
  expiresAt: string | null;
  active: boolean;
}

interface InvoiceStats {
  count: number;
  total: number;
  last: { number: string; date: string; totalTTC: number } | null;
}

function readInvoiceStats(): InvoiceStats {
  try {
    const raw = localStorage.getItem('facturapro-data');
    const data = raw ? JSON.parse(raw) : {};
    const invoices = Array.isArray(data.invoices) ? data.invoices : [];
    const total = invoices.reduce((s: number, i: any) => s + (Number(i.totalTTC) || 0), 0);
    const last = invoices.length ? invoices[invoices.length - 1] : null;
    return {
      count: invoices.length,
      total,
      last: last ? { number: last.number, date: last.date, totalTTC: Number(last.totalTTC) || 0 } : null,
    };
  } catch {
    return { count: 0, total: 0, last: null };
  }
}

export default function AccountPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const stats = readInvoiceStats();

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (active) setEmail(user?.email ?? null);

      const fp = getDeviceFingerprint();
      const { data } = await supabase.functions.invoke('check-activation', {
        body: { deviceFingerprint: fp },
      });
      const subscription = (data as any)?.subscription;
      if (active && subscription) {
        setSub({
          code: subscription.code,
          isTrial: !!subscription.isTrial,
          expiresAt: subscription.expiresAt ?? null,
          active: !!subscription.active,
        });
      }

      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const money = (n: number) => `${n.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH`;

  return (
    <AdminShell title="حسابي" subtitle="تفاصيل الاشتراك والفواتير">
      <div className="space-y-4">
        {/* Identity */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <UserCircle className="h-7 w-7 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold" dir="ltr">{email ?? '—'}</p>
              <p className="text-xs text-muted-foreground">مرحباً بك في FacturaPro</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="h-4 w-4 text-muted-foreground" /> تفاصيل الاشتراك
          </p>
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : !sub ? (
            <p className="py-2 text-sm text-muted-foreground">لا يوجد اشتراك مفعّل على هذا الجهاز.</p>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
                <span className="text-sm">كود التفعيل</span>
                <code className="font-mono text-sm font-semibold" dir="ltr">{sub.code}</code>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
                <span className="text-sm">نوع الاشتراك</span>
                <Badge variant={sub.isTrial ? 'outline' : 'secondary'}>{sub.isTrial ? 'تجريبي' : 'كامل'}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
                <span className="text-sm">الحالة</span>
                <Badge className={sub.active ? 'bg-green-600 text-white hover:bg-green-700' : ''} variant={sub.active ? 'default' : 'destructive'}>
                  {sub.active ? 'نشط' : 'منتهي'}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm"><CalendarClock className="h-4 w-4 text-muted-foreground" />تاريخ الانتهاء</span>
                <span className="text-sm text-muted-foreground">
                  {sub.expiresAt ? new Date(sub.expiresAt).toLocaleString('ar-MA') : 'غير محدود'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-muted-foreground" /> معلومات الفواتير
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-secondary/50 px-3 py-3 text-center">
              <p className="text-xl font-bold">{stats.count}</p>
              <p className="text-[11px] text-muted-foreground">عدد الفواتير</p>
            </div>
            <div className="rounded-xl bg-secondary/50 px-3 py-3 text-center">
              <p className="text-xl font-bold">{money(stats.total)}</p>
              <p className="text-[11px] text-muted-foreground">إجمالي المبالغ</p>
            </div>
          </div>
          {stats.last && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm"><Wallet className="h-4 w-4 text-muted-foreground" />آخر فاتورة</span>
              <span className="text-sm text-muted-foreground" dir="ltr">
                {stats.last.number} · {money(stats.last.totalTTC)}
              </span>
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full gap-2" onClick={() => navigate('/')}>
          <Home className="h-4 w-4" /> العودة إلى التطبيق
        </Button>
      </div>
    </AdminShell>
  );
}
