import { useNavigate } from 'react-router-dom';
import AdminShell from '@/components/admin/AdminShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS, Role, useRoles } from '@/hooks/use-roles';
import { UserCircle, Mail, ShieldCheck, Home } from 'lucide-react';

export default function AccountPage() {
  const { email, roles, userId } = useRoles();
  const navigate = useNavigate();

  return (
    <AdminShell title="حسابي" subtitle="معلومات الحساب والصلاحيات">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <UserCircle className="h-7 w-7 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{email ?? '—'}</p>
            <p className="truncate font-mono text-[10px] text-muted-foreground" dir="ltr">{userId?.slice(0, 18)}…</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />البريد</span>
            <span className="truncate text-sm text-muted-foreground" dir="ltr">{email}</span>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="mb-2 flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-muted-foreground" />أدواري</p>
            <div className="flex flex-wrap gap-1.5">
              {roles.length ? roles.map((r: Role) => (
                <Badge key={r} variant="secondary">{ROLE_LABELS[r]}</Badge>
              )) : <Badge variant="outline">مستخدم عادي</Badge>}
            </div>
          </div>
        </div>

        <Button variant="outline" className="mt-5 w-full gap-2" onClick={() => navigate('/')}>
          <Home className="h-4 w-4" /> العودة إلى التطبيق
        </Button>
      </div>
    </AdminShell>
  );
}
