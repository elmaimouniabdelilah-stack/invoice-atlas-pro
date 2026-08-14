import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Role = 'super_admin' | 'admin' | 'moderator' | 'user';

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'سوبر أدمن',
  admin: 'أدمن',
  moderator: 'مشرف',
  user: 'مستخدم',
};

export const ROLE_HOME: Record<Role, string> = {
  super_admin: '/admin',
  admin: '/admin',
  moderator: '/admin/account',
  user: '/admin/account',
};

const RANK: Role[] = ['super_admin', 'admin', 'moderator', 'user'];

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { setLoading(false); return; }
      setEmail(user.email ?? null);
      setUserId(user.id);
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      if (!active) return;
      setRoles(((data ?? []).map(r => r.role) as Role[]));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const isSuper = roles.includes('super_admin');
  const isAdmin = isSuper || roles.includes('admin');
  // Roles the user is allowed to browse dashboards for
  const availableRoles: Role[] = isSuper
    ? RANK
    : isAdmin
      ? (['admin', 'moderator', 'user'] as Role[])
      : roles.includes('moderator')
        ? (['moderator', 'user'] as Role[])
        : (['user'] as Role[]);

  const topRole: Role = RANK.find(r => availableRoles.includes(r)) ?? 'user';

  return { roles, availableRoles, topRole, isSuper, isAdmin, email, userId, loading };
}
