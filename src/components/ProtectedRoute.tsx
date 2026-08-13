import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import ActivationPromptDialog from '@/components/ActivationPromptDialog';
import TrialCountdownBanner from '@/components/TrialCountdownBanner';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const [activationChecked, setActivationChecked] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [showActivation, setShowActivation] = useState(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<string | null>(null);

  const checkActivation = useCallback(async () => {
    try {
      const fingerprint = getDeviceFingerprint();

      const { data, error } = await supabase.functions.invoke('check-activation', {
        body: { deviceFingerprint: fingerprint },
      });
      if (error) throw error;

      const activated = !!(data as any)?.activated;
      const expiresAt = (data as any)?.subscription?.expiresAt ?? null;

      if (activated) {
        setIsActivated(true);
        setShowActivation(false);
        setTrialExpiresAt(expiresAt);
        localStorage.setItem('facturapro-activated', 'true');
      } else {
        setIsActivated(false);
        setShowActivation(true);
        setTrialExpiresAt(null);
        localStorage.removeItem('facturapro-activated');
      }
    } catch {
      const local = localStorage.getItem('facturapro-activated');
      setIsActivated(local === 'true');
      setShowActivation(local !== 'true');
    }
    setActivationChecked(true);
  }, []);


  useEffect(() => {
    if (session) {
      checkActivation();
    }
  }, [session, checkActivation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (!activationChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <ActivationPromptDialog
        open={showActivation}
        onActivated={() => {
          setIsActivated(true);
          setShowActivation(false);
          checkActivation();
        }}
        onSkip={() => setShowActivation(false)}
      />
      {trialExpiresAt && (
        <TrialCountdownBanner
          expiresAt={trialExpiresAt}
          onExpired={() => {
            setIsActivated(false);
            setShowActivation(true);
            setTrialExpiresAt(null);
            localStorage.removeItem('facturapro-activated');
          }}
        />
      )}
      {children}
    </>
  );
}
