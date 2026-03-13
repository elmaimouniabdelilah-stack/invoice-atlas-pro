import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';
import DeveloperFooter from './DeveloperFooter';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppLayout({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className={cn("flex flex-1 flex-col overflow-hidden", isMobile && "pb-16")}>
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
        <DeveloperFooter />
      </div>
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
