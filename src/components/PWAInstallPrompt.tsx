import { useEffect, useState } from "react";
import { Download, X, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWA_DISMISSED_KEY = "pwa-install-dismissed";

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true;

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (localStorage.getItem(PWA_DISMISSED_KEY) || isInStandaloneMode()) return;

    // For iOS Safari (no beforeinstallprompt)
    if (isIOS()) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS()) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setShowIOSGuide(false);
    localStorage.setItem(PWA_DISMISSED_KEY, "true");
  };

  if (!visible) return null;

  // iOS install guide overlay
  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm p-4 safe-area-bottom">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl animate-in slide-in-from-bottom-4 duration-300 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Smartphone className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">تثبيت التطبيق</span>
            </div>
            <button onClick={handleDismiss} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <span>اضغط على</span>
                <Share className="h-4 w-4 text-primary" />
                <span>مشاركة</span>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
              <span className="text-sm text-foreground">اختر "إضافة إلى الشاشة الرئيسية"</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed z-50 animate-in slide-in-from-bottom-4 duration-500 ${
      isMobile 
        ? "bottom-16 left-3 right-3 safe-area-bottom" 
        : "bottom-4 left-4 right-4 mx-auto max-w-md"
    }`}>
      <div className={`flex items-center gap-3 rounded-xl border border-border bg-card shadow-lg ${
        isMobile ? "p-3" : "p-4"
      }`}>
        <div className={`flex shrink-0 items-center justify-center rounded-lg bg-primary ${
          isMobile ? "h-9 w-9" : "h-10 w-10"
        }`}>
          <Download className={isMobile ? "h-4 w-4 text-primary-foreground" : "h-5 w-5 text-primary-foreground"} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
            {isMobile ? "تثبيت FacturaPro" : "Installer FacturaPro"}
          </p>
          <p className={`text-muted-foreground ${isMobile ? "text-[10px]" : "text-xs"}`}>
            {isMobile ? "استخدم التطبيق بدون إنترنت" : "Accédez à l'app hors ligne depuis votre bureau"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button size="sm" onClick={handleInstall} className={isMobile ? "h-7 px-2.5 text-[10px]" : "h-8 px-3 text-xs"}>
            {isMobile ? "تثبيت" : "Installer"}
          </Button>
          <button onClick={handleDismiss} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
