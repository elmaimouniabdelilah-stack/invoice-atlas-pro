import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import AdminShell from '@/components/admin/AdminShell';
import {
  ArrowLeft, Loader2, RefreshCw, Shield, ShieldCheck, UserPlus, X, Users,
} from 'lucide-react';

type Role = 'super_admin' | 'admin' | 'moderator' | 'user';

interface AppUser {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: Role[];
}

const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'سوبر أدمن',
  admin: 'أدمن',
  moderator: 'مشرف',
  user: 'مستخدم',
};

const roleBadge = (role: Role) => {
  if (role === 'super_admin') return 'default';
  if (role === 'admin') return 'secondary';
  return 'outline';
};

export default function AdminRolesPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuper, setIsSuper] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('admin');
  const navigate = useNavigate();
  const { toast } = useToast();

  const call = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('manage-roles', { body });
    if (error) throw error;
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as any;
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/admin/login'); return; }
      const res = await call({ action: 'list' });
      setUsers(res.users ?? []);
      setIsSuper(!!res.isSuper);
    } catch (e) {
      toast({ title: 'تعذر تحميل المستخدمين', description: (e as Error).message, variant: 'destructive' });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeRole = async (action: 'grant' | 'revoke', userId: string, role: Role, email?: string) => {
    setBusy(userId + role);
    try {
      await call({ action, userId, role, email });
      toast({ title: action === 'grant' ? 'تم منح الصلاحية' : 'تم سحب الصلاحية' });
      await load();
    } catch (e) {
      toast({ title: 'فشلت العملية', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const grantByEmail = async () => {
    if (!inviteEmail.trim()) return;
    setBusy('invite');
    try {
      await call({ action: 'grant', email: inviteEmail.trim(), role: inviteRole });
      toast({ title: 'تم منح الصلاحية بنجاح' });
      setInviteOpen(false);
      setInviteEmail('');
      await load();
    } catch (e) {
      toast({ title: 'فشل منح الصلاحية', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const filtered = users.filter((u) =>
    (u.email ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const RoleControls = ({ u }: { u: AppUser }) => (
    <div className="flex flex-wrap gap-2">
      {(['super_admin', 'admin'] as Role[]).map((r) => {
        const has = u.roles.includes(r);
        return (
          <Button
            key={r}
            size="sm"
            variant={has ? 'destructive' : 'outline'}
            disabled={!isSuper || busy === u.id + r}
            onClick={() => changeRole(has ? 'revoke' : 'grant', u.id, r)}
          >
            {busy === u.id + r ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : has ? <X className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
            <span className="ms-1">{has ? `سحب ${ROLE_LABELS[r]}` : ROLE_LABELS[r]}</span>
          </Button>
        );
      })}
    </div>
  );

  return (
    <AdminShell
      title="الأدوار والصلاحيات"
      subtitle={`${users.length} مستخدم`}
      actions={
        <>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {isSuper && (
            <Button size="icon" className="h-9 w-9" onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {!isSuper && (
          <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            أنت أدمن عادي: يمكنك الاطلاع على الأدوار فقط. تعديل الصلاحيات متاح للسوبر أدمن.
          </div>
        )}

        <Input
          placeholder="بحث بالبريد الإلكتروني..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <Users className="h-8 w-8" /> لا يوجد مستخدمون
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((u) => (
                <div key={u.id} className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{u.email}</p>
                      <p className="text-xs text-muted-foreground">
                        انضم في {new Date(u.created_at).toLocaleDateString('fr-MA')}
                      </p>
                    </div>
                    {u.roles.includes('super_admin') && <ShieldCheck className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {u.roles.length ? u.roles.map((r) => (
                      <Badge key={r} variant={roleBadge(r)}>{ROLE_LABELS[r]}</Badge>
                    )) : <Badge variant="outline">بدون دور</Badge>}
                  </div>
                  <RoleControls u={u} />
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right">الأدوار</TableHead>
                    <TableHead className="text-right">آخر دخول</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.length ? u.roles.map((r) => (
                            <Badge key={r} variant={roleBadge(r)}>{ROLE_LABELS[r]}</Badge>
                          )) : <Badge variant="outline">بدون دور</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('fr-MA') : '—'}
                      </TableCell>
                      <TableCell><RoleControls u={u} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="w-[95vw] max-w-md" dir="rtl">
          <DialogHeader><DialogTitle>منح صلاحية عبر البريد</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>الدور</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">سوبر أدمن</SelectItem>
                  <SelectItem value="admin">أدمن</SelectItem>
                  <SelectItem value="moderator">مشرف</SelectItem>
                  <SelectItem value="user">مستخدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={grantByEmail} disabled={busy === 'invite'}>
              {busy === 'invite' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'منح الصلاحية'}
            </Button>
            <p className="text-xs text-muted-foreground">
              يجب أن يكون صاحب البريد مسجلاً في التطبيق مسبقاً.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
