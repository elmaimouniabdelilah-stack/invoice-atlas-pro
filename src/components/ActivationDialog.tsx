import { useState } from "react";
import { KeyRound, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint } from "@/lib/deviceFingerprint";
import { isActivated } from "@/components/TrialLimitModal";

const ActivationDialog = () => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const activated = isActivated();

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
        localStorage.setItem("facturapro-activated", "true");
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
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setCode(""); setError(""); setSuccess(false); } }}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <KeyRound className="h-4 w-4" />
          {activated ? "✅ مفعّل" : "تفعيل التطبيق"}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>{activated ? "التطبيق مفعّل" : "تفعيل التطبيق"}</DialogTitle>
        </DialogHeader>

        {activated ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-sm text-muted-foreground">التطبيق مفعّل بالكامل، استمتع بالاستخدام!</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="font-semibold text-foreground">تم التفعيل بنجاح! 🎉</p>
            <p className="text-sm text-muted-foreground">جاري إعادة تحميل التطبيق...</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">أدخل كود التفعيل الذي حصلت عليه بعد الشراء</p>
            <div className="flex gap-2" dir="ltr">
              <Input
                placeholder="أدخل الكود"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                className="text-center font-mono text-lg tracking-widest"
                maxLength={20}
              />
              <Button onClick={handleActivate} disabled={loading || !code.trim()} className="shrink-0 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                تفعيل
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ActivationDialog;
