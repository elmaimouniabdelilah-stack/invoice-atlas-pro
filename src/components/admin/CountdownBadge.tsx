import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface CountdownBadgeProps {
  expiresAt: string | null;
  compact?: boolean;
}

interface Remaining {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function getRemaining(expiresAt: string): Remaining {
  const now = Date.now();
  const target = new Date(expiresAt).getTime();
  const totalMs = target - now;

  if (totalMs <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  const totalSec = Math.floor(totalMs / 1000);
  return {
    expired: false,
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    totalMs,
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatRemaining(r: Remaining): string {
  if (r.expired) return 'منتهية';
  if (r.days > 0) return `${r.days}ي ${pad(r.hours)}:${pad(r.minutes)}:${pad(r.seconds)}`;
  return `${pad(r.hours)}:${pad(r.minutes)}:${pad(r.seconds)}`;
}

function getVariant(r: Remaining): 'destructive' | 'secondary' | 'outline' {
  if (r.expired) return 'destructive';
  // under 1 hour → destructive (urgent), under 1 day → secondary, else outline
  if (r.totalMs < 3600_000) return 'destructive';
  if (r.totalMs < 86400_000) return 'secondary';
  return 'outline';
}

export default function CountdownBadge({ expiresAt, compact = false }: CountdownBadgeProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) {
    return <Badge variant="outline" className="text-[10px]">دائم</Badge>;
  }

  const r = getRemaining(expiresAt);
  const variant = getVariant(r);
  const label = formatRemaining(r);

  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant={variant} className={`gap-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        <Clock className="h-3 w-3" />
        {label}
      </Badge>
      {!compact && !r.expired && (
        <span className="text-[10px] text-muted-foreground" dir="ltr">
          {new Date(expiresAt).toLocaleString('ar-MA', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      )}
      {!compact && r.expired && (
        <span className="text-[10px] text-muted-foreground" dir="ltr">
          {new Date(expiresAt).toLocaleString('ar-MA', { dateStyle: 'short', timeStyle: 'short' })}
        </span>
      )}
    </div>
  );
}
