import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Globe, Settings, History, Menu, X, Users, Package, Moon, Sun } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import ActivationDialog from './ActivationDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';
import logoImg from '@/assets/logo.png';

export default function AppSidebar() {
  const { t, lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/invoice', icon: FilePlus, label: t('newInvoice') },
    { to: '/clients', icon: Users, label: t('clients') },
    { to: '/products', icon: Package, label: t('products') },
    { to: '/history', icon: History, label: t('invoiceHistory') },
    { to: '/settings', icon: Settings, label: t('settings') },
  ];

  const mobileLinks = [
    { to: '/', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/invoice', icon: FilePlus, label: t('newInvoice') },
    { to: '/clients', icon: Users, label: t('clients') },
    { to: '/history', icon: History, label: t('invoiceHistory') },
    { to: '/settings', icon: Settings, label: t('settings') },
  ];

  // Mobile: bottom navigation bar
  if (isMobile) {
    return (
      <>
        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-card px-1 py-1.5 safe-area-bottom">
          {mobileLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors',
                location.pathname === to
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate max-w-[56px]">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile menu overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-border bg-card p-6 pb-8 animate-in slide-in-from-bottom duration-300"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onDoubleClick={() => { setMobileOpen(false); window.location.href = '/admin/login'; }}
                >
                  <img src={logoImg} alt="FacturaPro" className="h-8 w-8 rounded-md object-contain" />
                  <span className="text-sm font-semibold text-foreground">{t('appName')}</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => { toggleTheme(); setMobileOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {theme === 'light' ? t('darkMode') : t('lightMode')}
                </button>
                <ActivationDialog />
                <button
                  onClick={() => { setLang(lang === 'fr' ? 'ar' : 'fr'); setMobileOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  {lang === 'fr' ? 'العربية' : 'Français'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop: side navigation
  return (
    <aside className="flex h-screen w-64 flex-col border-e border-border bg-card">
      <div
        className="flex items-center gap-2 border-b border-border px-6 py-5 cursor-pointer select-none"
        onDoubleClick={() => window.location.href = '/admin/login'}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md overflow-hidden">
          <img src={logoImg} alt="FacturaPro" className="h-8 w-8 object-contain" />
        </div>
        <span className="text-lg font-semibold text-foreground">{t('appName')}</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              location.pathname === to
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        <ActivationDialog />
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === 'light' ? t('darkMode') : t('lightMode')}
        </button>
        <button
          onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          {lang === 'fr' ? 'العربية' : 'Français'}
        </button>
      </div>
    </aside>
  );
}
