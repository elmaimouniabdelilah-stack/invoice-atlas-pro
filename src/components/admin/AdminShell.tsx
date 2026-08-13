import { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  KeyRound, ShieldCheck, LayoutDashboard, Eye, UserCircle, LogOut, Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Role, ROLE_HOME, ROLE_LABELS, useRoles } from '@/hooks/use-roles';

const NAV: Record<Role, { to: string; label: string; icon: typeof KeyRound }[]> = {
  super_admin: [
    { to: '/admin/overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { to: '/admin', label: 'الأكواد', icon: KeyRound },
    { to: '/admin/roles', label: 'الأدوار', icon: ShieldCheck },
    { to: '/admin/account', label: 'حسابي', icon: UserCircle },
  ],
  admin: [
    { to: '/admin', label: 'الأكواد', icon: KeyRound },
    { to: '/admin/roles', label: 'الأدوار', icon: ShieldCheck },
    { to: '/admin/account', label: 'حسابي', icon: UserCircle },
  ],
  moderator: [
    { to: '/admin/moderation', label: 'المتابعة', icon: Eye },
    { to: '/admin/account', label: 'حسابي', icon: UserCircle },
  ],
  user: [
    { to: '/admin/account', label: 'حسابي', icon: UserCircle },
  ],
};

interface Props {
  title: string;
  subtitle?: string;
  /** Minimum role required to view this page */
  children: ReactNode;
  actions?: ReactNode;
}

export default function AdminShell({ title, subtitle, actions, children }: Props) {
  const { availableRoles, topRole, email, loading } = useRoles();
  const location = useLocation();
  const navigate = useNavigate();

  const activeRole: Role =
    availableRoles.find(r => NAV[r].some(n => n.to === location.pathname)) ?? topRole;
  const items = NAV[activeRole];

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/40 to-background" dir="rtl">
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
              <KeyRound className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-foreground sm:text-lg">{title}</h1>
              <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                {subtitle ?? email ?? 'FacturaPro Admin'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {availableRoles.length > 1 && (
              <Select
                value={activeRole}
                onValueChange={(v) => navigate(ROLE_HOME[v as Role])}
              >
                <SelectTrigger className="h-9 w-[118px] rounded-full text-xs sm:w-[150px] sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {availableRoles.map(r => (
                    <SelectItem key={r} value={r} className="text-xs sm:text-sm">
                      لوحة {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {actions}
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="mx-auto hidden max-w-6xl gap-1 px-6 pb-2 md:flex">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                location.pathname === to
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <Badge variant="outline" className="ms-auto self-center">
            {ROLE_LABELS[activeRole]}
          </Badge>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 p-3 pb-28 sm:p-6 sm:pb-28 md:pb-10">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 backdrop-blur-xl md:hidden">
        {items.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span className={cn('rounded-lg p-1.5 transition-colors', active && 'bg-primary/10')}>
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
