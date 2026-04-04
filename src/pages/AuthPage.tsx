import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLang } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, KeyRound, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast({ title: t('fillAllFields'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: t('loginError'), description: error.message, variant: 'destructive' });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !activationCode) {
      toast({ title: t('fillAllFields'), variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: t('passwordTooShort'), variant: 'destructive' });
      return;
    }

    setLoading(true);

    // Validate activation code first
    const { data: codeResult, error: codeError } = await supabase.functions.invoke('validate-activation-code', {
      body: { code: activationCode.trim().toUpperCase(), deviceFingerprint: `auth_${email}` },
    });

    if (codeError || codeResult?.error) {
      setLoading(false);
      const errKey = codeResult?.error || 'invalidActivationCode';
      const messages: Record<string, string> = {
        invalid_code: t('invalidActivationCode'),
        code_disabled: t('codeDisabled'),
        max_devices_reached: t('maxDevicesReached'),
      };
      toast({ title: messages[errKey] || t('invalidActivationCode'), variant: 'destructive' });
      return;
    }

    // Code valid, proceed with signup
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      toast({ title: t('signupError'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('signupSuccess') });
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('appName')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isLogin ? t('loginSubtitle') : t('signupSubtitle')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail className="h-4 w-4" />{t('email')}</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Lock className="h-4 w-4" />{t('password')}</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><KeyRound className="h-4 w-4" />{t('activationCode')}</Label>
              <Input
                placeholder="XXXX-XXXX"
                value={activationCode}
                onChange={e => setActivationCode(e.target.value.toUpperCase())}
                disabled={loading}
                className="tracking-widest font-mono text-center"
              />
              <p className="text-xs text-muted-foreground">{t('activationCodeRequired')}</p>
            </div>
          )}

          <Button
            onClick={isLogin ? handleLogin : handleSignup}
            className="w-full gap-2"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
            ) : isLogin ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {isLogin ? t('login') : t('signup')}
          </Button>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              {isLogin ? t('noAccountSignup') : t('haveAccountLogin')}
            </button>
          </div>

          {isLogin && (
            <div className="text-center">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={async () => {
                  if (!email) {
                    toast({ title: t('enterEmailFirst'), variant: 'destructive' });
                    return;
                  }
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  if (error) toast({ title: error.message, variant: 'destructive' });
                  else toast({ title: t('resetEmailSent') });
                }}
              >
                {t('forgotPassword')}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
