import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FilePlus, Globe, Settings, History } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import ActivationDialog from './ActivationDialog';

export default function AppSidebar() {
  const { t, lang, setLang } = useLang();
  const location = useLocation();

  const links = [
    { to: '/', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/invoice', icon: FilePlus, label: t('newInvoice') },
    { to: '/history', icon: History, label: t('invoiceHistory') },
    { to: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-e border-border bg-card">
      <div
        className="flex items-center gap-2 border-b border-border px-6 py-5 cursor-pointer select-none"
        onDoubleClick={() => window.location.href = '/admin/login'}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <span className="text-sm font-bold text-primary-foreground">F</span>
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
