import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminShell from '@/components/admin/AdminShell';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Monitor, Clock } from 'lucide-react';

interface CodeRow {
  id: string;
  code: string;
  max_devices: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  device_count: number;
}

export default function ModerationPage() {
  const [rows, setRows] = useState<CodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const { data: codes } = await supabase
        .from('activation_codes')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: devices } = await supabase.from('device_activations').select('code_id');
      const counts = (devices ?? []).reduce<Record<string, number>>((a, d) => {
        a[d.code_id] = (a[d.code_id] ?? 0) + 1;
        return a;
      }, {});
      setRows((codes ?? []).map(c => ({ ...c, device_count: counts[c.id] ?? 0 })));
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter(r => r.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminShell title="المتابعة" subtitle="لوحة المشرف — عرض فقط">
      <Input
        placeholder="بحث بالكود..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="rounded-xl"
      />
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">لا توجد نتائج</div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => {
            const expired = c.expires_at && new Date(c.expires_at) < new Date();
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <code className="truncate font-mono text-sm font-bold tracking-wider" dir="ltr">{c.code}</code>
                  <Badge variant={c.is_active && !expired ? 'default' : 'outline'} className="text-[10px]">
                    {expired ? 'منتهية' : c.is_active ? 'نشط' : 'موقوف'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Monitor className="h-3 w-3" />{c.device_count} / {c.max_devices}
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <Clock className="h-3 w-3" />
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('ar-MA') : 'دائم'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
