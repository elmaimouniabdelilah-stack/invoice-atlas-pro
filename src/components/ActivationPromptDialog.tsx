import { useState } from "react";
import { KeyRound, Loader2, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint } from "@/lib/deviceFingerprint";
import { useLang } from "@/contexts/LanguageContext";

const WHATSAPP_NUMBER = "212677765847";
const WHATSAPP_MESSAGE = encodeURIComponent("مرحباً، أريد شراء النسخة الكاملة من FacturaPro");

interface Props {
  open: boolean;
  onActivated: () => void;
  onSkip: () => void;
}

const ActivationPromptDialog = ({ open, onActivated, onSkip }: Props) => {
  const { t } = useLang();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    try {
      const deviceFingerprint = getDeviceFingerprint();
      const { data, error: fnError } = await supabase.functions.invoke("validate-activation-code", {
        body: { code: code.trim(), deviceFingerprint },
      });

      if (fnError) {
        setError(t('connectionError'));
        return;
      }

      if (data?.error) {
        const messages: Record<string, string> = {
          invalid_code: t('invalidActivationCode'),
          code_disabled: t('codeDisabled'),
          code_expired: t('codeExpired'),
          max_devices_reached: t('maxDevicesReached'),
          activation_failed: t('connectionError'),
        };
        setError(messages[data.error] || t('connectionError'));
        return;
      }

      if (data?.success) {
        localStorage.setItem("facturapro-activated", "true");
        setSuccess(true);
        setTimeout(() => onActivated(), 1500);
      }
    } catch {
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onSkip(); }}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center">{t('activateApp')}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="font-semibold text-foreground">{t('activationSuccess')} 🎉</p>
            <p className="text-sm text-muted-foreground">{t('redirecting')}</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground text-center">
              {t('enterActivationCodeAfterSignup')}
            </p>
            <div className="flex gap-2" dir="ltr">
              <Input
                placeholder={t('enterCode')}
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                className="text-center font-mono text-lg tracking-widest"
                maxLength={20}
              />
              <Button onClick={handleActivate} disabled={loading || !code.trim()} className="shrink-0 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                {t('activate')}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">{t('or')}</span></div>
            </div>

            <Button
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, "_blank")}
              variant="outline"
              className="w-full gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {t('contactWhatsapp')}
            </Button>

            <Button variant="ghost" className="w-full text-muted-foreground" onClick={onSkip}>
              {t('skipForNow')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActivationPromptDialog;
