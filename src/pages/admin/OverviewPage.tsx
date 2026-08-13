import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminShell from '@/components/admin/AdminShell';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoles, ROLE_LABELS, Role } from '@/hooks/use-roles';
import {
  KeyRound, Monitor, Users, ShieldCheck, Loader2, ArrowLeft, Activity,
} from 'lucide-react';

interface Stats {
  codes: number;
  activeCodes: number;
  devices: number;
  users: number;
  admins: number;
}

export default function OverviewPage() {
  const { isSuper, loading: rolesLoading } = useRoles();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<{ id: string; code: string; created_at: string; is_active: boolean }[]>([]);
  const [roleRows, setRoleRows] = useState<{ role: Role; count: number }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const [codesRes, devicesRes, rolesRes] = await Promise.all([
        supabase.from('activation_codes').select('id, code, created_at, is_active').order('created_at', { ascending: false }),
        supabase.from('device_activations').select('id', { count: 'exact', head: true }),
        supabase.from('user_roles').select('role, user_id'),
      ]);
      const codes = codesRes.data ?? [];
      const roles = (rolesRes.data ?? []) as { role: Role; user_id: string }[];
      const counts = roles.reduce<Record<string, number>>((acc, r) => {
        acc[r.role] = (acc[r.role] ?? 0) + 1;
        return acc;
      }, {});
      setRoleRows((['super_admin', 'admin', 'moderator', 'user'] as Role[]).map(r => ({ role: r, count: counts[r] ?? 0 })));
      setRecent(codes.slice(0, 5));
      setStats({
        codes: codes.length,
        activeCodes: codes.filter(c => c.is_active).length,
        devices: devicesRes.count ?? 0,
        users: new Set(roles.map(r => r.user_id)).size,
        admins: roles.filter(r => r.role === 'admin' || r.role === 'super_admin').length,
      });
    })();
  }, []);

  if (!rolesLoading && !isSuper) {
    return (
      <AdminShell title="نظرة عامة">
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          هذه اللوحة مخصّصة للسوبر أدمن فقط.
        </div>
      </AdminShell>
    );
  }

  const cards = [
    { label: 'إجمالي الأكواد', value: stats?.codes, icon: KeyRound },
    { label: 'أكواد نشطة', value: stats?.activeCodes, icon: Activity },
    { label: 'الأجهزة المفعّلة', value: stats?.devices, icon: Monitor },
    { label: 'مستخدمون بأدوار', value: stats?.users, icon: Users },
  ];

  return (
    <AdminShell title="نظرة عامة" subtitle="لوحة السوبر أدمن">
      {!stats ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {cards.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-[11px] text-muted-foreground sm:text-xs">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" /> توزيع الأدوار
                </h2>
                <Button size="sm" variant="ghost" onClick={() => navigate('/admin/roles')}>
                  إدارة <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-2">
                {roleRows.map(({ role, count }) => (
                  <div key={role} className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2">
                    <span className="text-sm">{ROLE_LABELS[role]}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <KeyRound className="h-4 w-4 text-primary" /> أحدث الأكواد
                </h2>
                <Button size="sm" variant="ghost" onClick={() => navigate('/admin')}>
                  الكل <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-2">
                {recent.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">لا توجد أكواد</p>}
                {recent.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2">
                    <code className="font-mono text-sm font-bold" dir="ltr">{c.code}</code>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString('ar-MA')}
                      </span>
                      <Badge variant={c.is_active ? 'default' : 'outline'} className="text-[10px]">
                        {c.is_active ? 'نشط' : 'موقوف'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminShell>
  );
}
