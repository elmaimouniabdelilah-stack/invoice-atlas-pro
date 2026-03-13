import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className={cn("flex-1 overflow-y-auto bg-background", isMobile && "pb-16")}>
        {children}
      </main>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
