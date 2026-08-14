import { useEffect, useState } from "react";
import { Download, X, Share, Smartphone, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWA_DISMISSED_KEY = "pwa-install-dismissed";
const PWA_DISMISSED_TS_KEY = "pwa-install-dismissed-ts";
// Re-show the bar after this many days even if previously dismissed.
const RESHOW_DAYS = 7;

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true;

const wasRecentlyDismissed = (): boolean => {
  const ts = Number(localStorage.getItem(PWA_DISMISSED_TS_KEY) || 0);
  if (!ts) return false;
  const days = (Date.now() - ts) / (1000 * 60 * 60 * 24);
  return days < RESHOW_DAYS;
};

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isInStandaloneMode()) return;
    // Respect a fresh dismissal, but resurface after RESHOW_DAYS.
    if (localStorage.getItem(PWA_DISMISSED_KEY) && wasRecentlyDismissed()) return;

    // iOS Safari never fires beforeinstallprompt.
    if (isIOS()) {
      const timer = setTimeout(() => setVisible(true), 2500);
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
    localStorage.setItem(PWA_DISMISSED_TS_KEY, String(Date.now()));
  };

  if (!visible) return null;

  // iOS install guide overlay (unchanged full-screen modal).
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

  // Slim persistent install bar — shown on all pages.
  return (
    <div
      className={`fixed z-40 inset-x-0 animate-in slide-in-from-bottom-3 duration-400 ${
        isMobile ? "bottom-16" : "bottom-0"
      }`}
    >
      <div className="mx-auto flex items-center gap-2.5 border-t border-primary/30 bg-gradient-to-r from-primary/95 to-primary text-primary-foreground px-3 py-2 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.35)]">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/15">
            <Download className="h-3.5 w-3.5" />
          </div>
          {!isMobile && <WifiOff className="h-3.5 w-3.5 opacity-70" />}
        </div>
        <div className="flex-1 min-w-0 leading-tight">
          <p className="font-semibold truncate text-[12px] sm:text-sm">
            {isMobile ? "ثبّت FacturaPro على جهازك" : "ثبّت FacturaPro للاستخدام بدون إنترنت"}
          </p>
          <p className="truncate text-[10px] sm:text-[11px] text-primary-foreground/75">
            {isMobile ? "يعمل بدون إنترنت بعد التثبيت" : "وصول مباشر من شاشتك الرئيسية — بدون اتصال"}
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleInstall}
          className="h-8 shrink-0 rounded-full bg-primary-foreground px-3 text-[11px] font-bold text-primary hover:bg-primary-foreground/90 sm:text-xs"
        >
          {isMobile ? "تثبيت" : "تثبيت الآن"}
        </Button>
        <button
          onClick={handleDismiss}
          aria-label="إغلاق"
          className="shrink-0 rounded-full p-1.5 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
