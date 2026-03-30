import { useInvoice, InvoiceDirection, LogoPosition, InvoiceFont, BankInfoPosition } from '@/contexts/InvoiceContext';
import { Switch } from '@/components/ui/switch';
import { 
  AlignLeft, AlignRight, AlignCenter, 
  Eye, EyeOff, Type, Layout, 
  ArrowLeftRight, ArrowUpDown
} from 'lucide-react';

const fonts: { id: InvoiceFont; label: string; family: string }[] = [
  { id: 'inter', label: 'Inter', family: 'Inter, sans-serif' },
  { id: 'cairo', label: 'Cairo', family: 'Cairo, sans-serif' },
  { id: 'amiri', label: 'Amiri', family: 'Amiri, serif' },
  { id: 'roboto', label: 'Roboto', family: 'Roboto, sans-serif' },
  { id: 'playfair', label: 'Playfair', family: 'Playfair Display, serif' },
];

const sections = [
  { key: 'showSignature' as const, label: 'Cachet / Signature', labelAr: 'التوقيع والختم' },
  { key: 'showBankInfo' as const, label: 'Infos bancaires', labelAr: 'المعلومات البنكية' },
  { key: 'showFooterNotes' as const, label: 'Notes de bas', labelAr: 'ملاحظات أسفل الصفحة' },
  { key: 'showSellerIds' as const, label: 'IDs entreprise', labelAr: 'معرفات الشركة' },
  { key: 'showAmountInWords' as const, label: 'Montant en lettres', labelAr: 'المبلغ بالحروف' },
  { key: 'showThankYou' as const, label: 'Message remerciement', labelAr: 'رسالة الشكر' },
];

export default function InvoiceLayoutPanel() {
  const { layoutSettings, setLayoutSettings } = useInvoice();

  const update = <K extends keyof typeof layoutSettings>(key: K, value: typeof layoutSettings[K]) => {
    setLayoutSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Layout className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium text-foreground">Mise en page</p>
      </div>

      {/* Direction RTL/LTR */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <ArrowLeftRight className="h-3 w-3" /> Sens du texte
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: 'ltr' as InvoiceDirection, label: 'Gauche → Droite', icon: AlignLeft },
            { id: 'rtl' as InvoiceDirection, label: 'Droite → Gauche', icon: AlignRight },
          ]).map(dir => (
            <button
              key={dir.id}
              type="button"
              onClick={() => update('direction', dir.id)}
              className={`flex items-center gap-1.5 rounded-md border-2 px-2.5 py-2 text-[11px] transition-all ${
                layoutSettings.direction === dir.id
                  ? 'border-primary bg-primary/5 text-foreground font-semibold'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <dir.icon className="h-3.5 w-3.5" />
              {dir.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logo Position */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Position du logo</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { id: 'left' as LogoPosition, label: 'Gauche', icon: AlignLeft },
            { id: 'center' as LogoPosition, label: 'Centre', icon: AlignCenter },
            { id: 'right' as LogoPosition, label: 'Droite', icon: AlignRight },
          ]).map(pos => (
            <button
              key={pos.id}
              type="button"
              onClick={() => update('logoPosition', pos.id)}
              className={`flex flex-col items-center gap-1 rounded-md border-2 px-2 py-2 text-[11px] transition-all ${
                layoutSettings.logoPosition === pos.id
                  ? 'border-primary bg-primary/5 text-foreground font-semibold'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              <pos.icon className="h-3.5 w-3.5" />
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <Type className="h-3 w-3" /> Police
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {fonts.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => update('font', f.id)}
              className={`rounded-md border-2 px-2.5 py-1.5 text-[11px] transition-all ${
                layoutSettings.font === f.id
                  ? 'border-primary bg-primary/5 font-semibold text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
              style={{ fontFamily: f.family }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Visibility */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <Eye className="h-3 w-3" /> Afficher / Masquer
        </p>
        <div className="space-y-2">
          {sections.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-xs text-foreground">{s.label}</span>
              <Switch
                checked={layoutSettings[s.key]}
                onCheckedChange={(val) => update(s.key, val)}
                className="scale-90"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bank Info Position */}
      {layoutSettings.showBankInfo && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" /> Position infos bancaires
          </p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: 'bottom' as BankInfoPosition, label: 'En bas (défaut)' },
              { id: 'afterTotals' as BankInfoPosition, label: 'Après les totaux' },
            ]).map(pos => (
              <button
                key={pos.id}
                type="button"
                onClick={() => update('bankInfoPosition', pos.id)}
                className={`rounded-md border-2 px-2.5 py-2 text-[11px] transition-all ${
                  layoutSettings.bankInfoPosition === pos.id
                    ? 'border-primary bg-primary/5 text-foreground font-semibold'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
