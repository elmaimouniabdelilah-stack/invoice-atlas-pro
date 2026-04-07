import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Copy, LogOut, Loader2, Trash2, RefreshCw, KeyRound, Monitor, Clock,
} from 'lucide-react';

interface ActivationCode {
  id: string;
  code: string;
  max_devices: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  device_count?: number;
}

export default function AdminDashboard() {
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creatingTrial, setCreatingTrial] = useState(false);
  const [newMaxDevices, setNewMaxDevices] = useState(2);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<ActivationCode | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchCodes();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');
    if (!roles || roles.length === 0) {
      await supabase.auth.signOut();
      navigate('/admin/login');
    }
  };

  const fetchCodes = async () => {
    setLoading(true);
    const { data: codesData } = await supabase
      .from('activation_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (codesData) {
      // Get device counts
      const codesWithCounts = await Promise.all(
        codesData.map(async (code) => {
          const { count } = await supabase
            .from('device_activations')
            .select('*', { count: 'exact', head: true })
            .eq('code_id', code.id);
          return { ...code, device_count: count ?? 0 };
        })
      );
      setCodes(codesWithCounts);
    }
    setLoading(false);
  };

  const handleCreateCode = async () => {
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-code', {
        body: { length: 8 },
      });

      if (error) throw error;

      const { error: insertError } = await supabase
        .from('activation_codes')
        .insert({ code: data.code, max_devices: newMaxDevices });

      if (insertError) throw insertError;

      toast({ title: `تم إنشاء الكود: ${data.code}` });
      setDialogOpen(false);
      fetchCodes();
    } catch (err: any) {
      toast({ title: err.message || 'خطأ', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTrialCode = async () => {
    setCreatingTrial(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-trial-code');
      if (error) throw error;
      toast({ title: `تم إنشاء كود تجريبي: ${data.code}` });
      fetchCodes();
    } catch (err: any) {
      toast({ title: err.message || 'خطأ', variant: 'destructive' });
    } finally {
      setCreatingTrial(false);
    }

  const handleToggleActive = async (code: ActivationCode) => {
    await supabase
      .from('activation_codes')
      .update({ is_active: !code.is_active })
      .eq('id', code.id);
    fetchCodes();
  };

  const handleUpdateMaxDevices = async (code: ActivationCode, newMax: number) => {
    await supabase
      .from('activation_codes')
      .update({ max_devices: newMax })
      .eq('id', code.id);
    fetchCodes();
  };

  const handleDeleteCode = async (id: string) => {
    await supabase.from('activation_codes').delete().eq('id', id);
    fetchCodes();
  };

  const handleViewDevices = async (code: ActivationCode) => {
    setSelectedCode(code);
    setDevicesLoading(true);
    const { data } = await supabase
      .from('device_activations')
      .select('*')
      .eq('code_id', code.id)
      .order('activated_at', { ascending: false });
    setDevices(data || []);
    setDevicesLoading(false);
  };

  const handleRemoveDevice = async (deviceId: string) => {
    await supabase.from('device_activations').delete().eq('id', deviceId);
    if (selectedCode) handleViewDevices(selectedCode);
    fetchCodes();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'تم النسخ' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <KeyRound className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">إدارة أكواد التفعيل</h1>
              <p className="text-xs text-muted-foreground">FacturaPro Admin</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            خروج
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6 space-y-6">
        {/* Stats & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="rounded-xl border border-border bg-card px-5 py-3 text-center">
              <p className="text-2xl font-bold text-foreground">{codes.length}</p>
              <p className="text-xs text-muted-foreground">إجمالي الأكواد</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-5 py-3 text-center">
              <p className="text-2xl font-bold text-foreground">{codes.filter(c => c.is_active).length}</p>
              <p className="text-xs text-muted-foreground">أكواد نشطة</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إنشاء كود جديد
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>إنشاء كود تفعيل جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>عدد الأجهزة المسموح بها</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={newMaxDevices}
                    onChange={e => setNewMaxDevices(Number(e.target.value))}
                  />
                </div>
                <Button onClick={handleCreateCode} className="w-full" disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  إنشاء الكود
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Codes Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : codes.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد أكواد بعد</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">الاستعمال</TableHead>
                  <TableHead className="text-right">الأجهزة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map(code => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm font-bold tracking-wider">{code.code}</code>
                        <button onClick={() => handleCopy(code.code)} className="text-muted-foreground hover:text-foreground">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {code.device_count! > 0 ? (
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white gap-1">
                          <Monitor className="h-3 w-3" />
                          مُستعمل ({code.device_count} جهاز)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground gap-1">
                          غير مُستعمل
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={code.device_count! >= code.max_devices ? 'destructive' : 'secondary'}>
                          {code.device_count} / {code.max_devices}
                        </Badge>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={code.max_devices}
                          onChange={e => handleUpdateMaxDevices(code, Number(e.target.value))}
                          className="h-7 w-16 text-center text-xs"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={code.is_active}
                        onCheckedChange={() => handleToggleActive(code)}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(code.created_at).toLocaleDateString('ar-MA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" onClick={() => handleViewDevices(code)}>
                              <Monitor className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent dir="rtl">
                            <DialogHeader>
                              <DialogTitle>الأجهزة المفعّلة — {selectedCode?.code}</DialogTitle>
                            </DialogHeader>
                            {devicesLoading ? (
                              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
                            ) : devices.length === 0 ? (
                              <p className="py-6 text-center text-muted-foreground">لا توجد أجهزة مفعّلة</p>
                            ) : (
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {devices.map(d => (
                                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                                    <div>
                                      <p className="text-xs font-mono text-muted-foreground" dir="ltr">{d.device_fingerprint.slice(0, 12)}...</p>
                                      <p className="text-xs text-muted-foreground">{new Date(d.activated_at).toLocaleString('ar-MA')}</p>
                                    </div>
                                    <Button size="sm" variant="destructive" onClick={() => handleRemoveDevice(d.id)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteCode(code.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={fetchCodes} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
      </main>
    </div>
  );
}
