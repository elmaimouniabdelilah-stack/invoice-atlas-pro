import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

interface Props {
  expiresAt: string;
  onExpired: () => void;
}

export default function TrialCountdownBanner({ expiresAt, onExpired }: Props) {
  const { t } = useLang();
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const left = getTimeLeft(expiresAt);
      setTimeLeft(left);
      if (left.total <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  if (timeLeft.total <= 0) return null;

  const isUrgent = timeLeft.total < 3600000; // less than 1 hour

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium ${
        isUrgent
          ? "bg-destructive/10 text-destructive border-b border-destructive/20"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-b border-amber-500/20"
      }`}
      dir="rtl"
    >
      {isUrgent ? (
        <AlertTriangle className="h-4 w-4 shrink-0" />
      ) : (
        <Clock className="h-4 w-4 shrink-0" />
      )}
      <span>
        {t("trialTimeRemaining")}:{" "}
        <span className="font-mono font-bold tabular-nums" dir="ltr">
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </span>
    </div>
  );
}

function getTimeLeft(expiresAt: string) {
  const total = Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor(total / 1000 / 60 / 60);
  return { total, hours, minutes, seconds };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
