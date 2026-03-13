import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check admin role
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        toast({ title: 'ليس لديك صلاحيات الأدمن', variant: 'destructive' });
        return;
      }

      navigate('/admin');
    } catch (err: any) {
      toast({ title: err.message || 'خطأ في تسجيل الدخول', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err: any) {
      toast({ title: err.message || 'خطأ', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Lock className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">لوحة الإدارة</h1>
          <p className="text-sm text-muted-foreground">FacturaPro Admin</p>
        </div>

        {resetMode ? (
          resetSent ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
              <p className="text-foreground font-medium">تم إرسال رابط إعادة تعيين كلمة المرور</p>
              <p className="text-sm text-muted-foreground">تحقق من بريدك الإلكتروني</p>
              <Button variant="ghost" onClick={() => { setResetMode(false); setResetSent(false); }}>
                العودة لتسجيل الدخول
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 rounded-xl border border-border bg-card p-6">
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                إرسال رابط إعادة التعيين
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setResetMode(false)}>
                العودة لتسجيل الدخول
              </Button>
            </form>
          )
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required dir="ltr" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              تسجيل الدخول
            </Button>
            <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setResetMode(true)}>
              نسيت كلمة المرور؟
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
