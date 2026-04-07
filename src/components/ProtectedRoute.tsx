import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';
import ActivationPromptDialog from '@/components/ActivationPromptDialog';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const [activationChecked, setActivationChecked] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [showActivation, setShowActivation] = useState(false);

  const checkActivation = useCallback(async () => {
    try {
      const fingerprint = getDeviceFingerprint();

      // Find device activations for this device
      const { data: activations } = await supabase
        .from('device_activations')
        .select('code_id')
        .eq('device_fingerprint', fingerprint);

      if (!activations || activations.length === 0) {
        // No activation found
        setIsActivated(false);
        setShowActivation(true);
        setActivationChecked(true);
        localStorage.removeItem('facturapro-activated');
        return;
      }

      // Check if any linked code is still valid (active + not expired)
      const codeIds = activations.map(a => a.code_id);
      const { data: codes } = await supabase
        .from('activation_codes')
        .select('id, is_active, expires_at')
        .in('id', codeIds);

      const hasValidCode = codes?.some(c => {
        if (!c.is_active) return false;
        if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
        return true;
      });

      if (hasValidCode) {
        setIsActivated(true);
        setShowActivation(false);
        localStorage.setItem('facturapro-activated', 'true');
      } else {
        setIsActivated(false);
        setShowActivation(true);
        localStorage.removeItem('facturapro-activated');
      }
    } catch {
      // On error, allow access if previously activated locally
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
        }}
        onSkip={() => setShowActivation(false)}
      />
      {children}
    </>
  );
}
