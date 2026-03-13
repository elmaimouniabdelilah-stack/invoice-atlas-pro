import { useState } from "react";
import { Lock, MessageCircle, KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint } from "@/lib/deviceFingerprint";

const WHATSAPP_NUMBER = "212677765847";
const WHATSAPP_MESSAGE = encodeURIComponent("مرحباً، أريد شراء النسخة الكاملة من FacturaPro");
const ACTIVATION_KEY = "facturapro-activated";

export function isActivated(): boolean {
  return localStorage.getItem(ACTIVATION_KEY) === "true";
}

const TrialLimitModal = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, "_blank");
  };

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
        setError("خطأ في الاتصال، حاول مرة أخرى");
        return;
      }

      if (data?.error) {
        const messages: Record<string, string> = {
          invalid_code: "كود التفعيل غير صحيح",
          code_disabled: "هذا الكود معطّل",
          max_devices_reached: `تم استنفاد عدد الأجهزة المسموح بها (${data.max || 2})`,
          activation_failed: "فشل التفعيل، حاول مرة أخرى",
        };
        setError(messages[data.error] || "خطأ غير متوقع");
        return;
      }

      if (data?.success) {
        localStorage.setItem(ACTIVATION_KEY, "true");
        setSuccess(true);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setError("خطأ في الاتصال، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        {success ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">تم التفعيل بنجاح! 🎉</h2>
            <p className="text-sm text-muted-foreground">جاري إعادة تحميل التطبيق...</p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">انتهت الفترة التجريبية</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              لقد استخدمت 3 فواتير مجانية. أدخل كود التفعيل أو تواصل معنا للشراء.
            </p>

            {/* Activation code input */}
            <div className="mb-4 space-y-3" dir="ltr">
              <div className="flex gap-2">
                <Input
                  placeholder="أدخل كود التفعيل"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                  className="text-center font-mono text-lg tracking-widest"
                  maxLength={20}
                  dir="ltr"
                />
                <Button onClick={handleActivate} disabled={loading || !code.trim()} className="shrink-0 gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  تفعيل
                </Button>
              </div>
              {error && <p className="text-sm text-destructive" dir="rtl">{error}</p>}
            </div>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">أو</span></div>
            </div>

            <Button onClick={handleWhatsApp} variant="outline" className="w-full gap-2" size="lg">
              <MessageCircle className="h-5 w-5" />
              تواصل معنا عبر واتساب
            </Button>
            <p className="mt-3 text-xs text-muted-foreground" dir="ltr">+212 677 765 847</p>
          </>
        )}
      </div>
    </div>
  );
};

export default TrialLimitModal;
