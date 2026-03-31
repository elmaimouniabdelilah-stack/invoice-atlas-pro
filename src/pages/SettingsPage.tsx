import AppLayout from '@/components/AppLayout';
import { TVA_RATES, generateInvoiceNumber } from '@/lib/invoiceTypes';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Moon, Sun, Globe } from 'lucide-react';
import { useRef } from 'react';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { t, lang, setLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { seller, setSeller, isAutoEntrepreneur, setIsAutoEntrepreneur, invoiceTexts, setInvoiceTexts, defaultTvaRate, setDefaultTvaRate } = useInvoice();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSeller(p => ({ ...p, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const updateText = (key: keyof typeof invoiceTexts, value: string) => {
    setInvoiceTexts(p => ({ ...p, [key]: value }));
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-8 max-w-2xl space-y-4 sm:space-y-6">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">{t('settings')}</h1>

        {/* Theme & Language */}
        <div className="flex gap-3">
          <button
            onClick={toggleTheme}
            className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-card p-3 sm:p-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {theme === 'light' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
            {theme === 'light' ? t('darkMode') : t('lightMode')}
          </button>
          <button
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-card p-3 sm:p-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Globe className="h-5 w-5 text-muted-foreground" />
            {lang === 'fr' ? 'العربية' : 'Français'}
          </button>
        </div>

        {/* Auto-entrepreneur & Default TVA */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 sm:p-4">
          <div>
            <p className="text-sm font-medium text-foreground">{t('autoEntrepreneur')}</p>
            <p className="text-xs text-muted-foreground">TVA 0%</p>
          </div>
          <Switch checked={isAutoEntrepreneur} onCheckedChange={setIsAutoEntrepreneur} />
        </div>

        {!isAutoEntrepreneur && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 sm:p-4">
            <div>
              <p className="text-sm font-medium text-foreground">{t('tvaRate')} {t('settings').toLowerCase()}</p>
              <p className="text-xs text-muted-foreground">TVA {defaultTvaRate}%</p>
            </div>
            <select
              value={defaultTvaRate}
              onChange={e => setDefaultTvaRate(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {TVA_RATES.map(rate => (
                <option key={rate} value={rate}>{rate}%</option>
              ))}
            </select>
          </div>
        )}

        {/* Seller info */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">{t('sellerInfo')}</h2>

          <div className="flex items-center gap-3 sm:gap-4">
            {seller.logo ? (
              <img src={seller.logo} alt="Logo" className="h-12 w-12 sm:h-16 sm:w-16 rounded-md object-contain border border-border" />
            ) : (
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-md border border-dashed border-border bg-secondary text-xs text-muted-foreground">Logo</div>
            )}
            <div className="space-y-1">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3.5 w-3.5 me-1.5" />
                {t('uploadLogo')}
              </Button>
              {seller.logo && (
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSeller(p => ({ ...p, logo: null }))}>
                  {t('deleteItem')}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label={t('businessName')}>
              <Input value={seller.businessName} onChange={e => setSeller(p => ({ ...p, businessName: e.target.value }))} className="h-9 text-sm" />
            </Field>
            <Field label={t('ice')}>
              <Input value={seller.ice} onChange={e => setSeller(p => ({ ...p, ice: e.target.value }))} className="h-9 text-sm" />
            </Field>
          </div>

          <Field label={t('address')}>
            <Input value={seller.address} onChange={e => setSeller(p => ({ ...p, address: e.target.value }))} className="h-9 text-sm" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label={t('phone')}>
              <Input value={seller.phone} onChange={e => setSeller(p => ({ ...p, phone: e.target.value }))} className="h-9 text-sm" />
            </Field>
            <Field label={t('email')}>
              <Input value={seller.email} onChange={e => setSeller(p => ({ ...p, email: e.target.value }))} className="h-9 text-sm" />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Field label={t('ifLabel')}>
              <Input value={seller.ifCode} onChange={e => setSeller(p => ({ ...p, ifCode: e.target.value }))} className="h-9 text-sm" />
            </Field>
            <Field label={t('rc')}>
              <Input value={seller.rc} onChange={e => setSeller(p => ({ ...p, rc: e.target.value }))} className="h-9 text-sm" />
            </Field>
            <Field label={t('cnss')}>
              <Input value={seller.cnss} onChange={e => setSeller(p => ({ ...p, cnss: e.target.value }))} className="h-9 text-sm" />
            </Field>
          </div>
        </div>

        {/* Invoice Texts */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">{t('invoiceTexts')}</h2>

          <Field label={t('invoiceTitleLabel')}>
            <div className="space-y-2">
              <select
                value={['Facture N°', 'Devis N°', 'Bon de commande N°', 'Bon de livraison N°'].includes(invoiceTexts.invoiceTitle) ? invoiceTexts.invoiceTitle : '__custom__'}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    updateText('invoiceTitle', '');
                  } else {
                    updateText('invoiceTitle', val);
                  }
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Facture N°">{t('docTypeInvoice')} — Facture N°</option>
                <option value="Devis N°">{t('docTypeQuote')} — Devis N°</option>
                <option value="Bon de commande N°">{t('docTypePurchaseOrder')} — Bon de commande N°</option>
                <option value="Bon de livraison N°">{t('docTypeDelivery')} — Bon de livraison N°</option>
                <option value="__custom__">{t('docTypeCustom')}</option>
              </select>
              {!['Facture N°', 'Devis N°', 'Bon de commande N°', 'Bon de livraison N°'].includes(invoiceTexts.invoiceTitle) && (
                <Input
                  value={invoiceTexts.invoiceTitle}
                  onChange={e => updateText('invoiceTitle', e.target.value)}
                  placeholder={t('invoiceTitleLabel')}
                  className="h-9 text-sm"
                />
              )}
            </div>
          </Field>

          <Field label={t('amountInWordsLabel')}>
            <Input
              value={invoiceTexts.amountInWordsPhrase}
              onChange={e => updateText('amountInWordsPhrase', e.target.value)}
              placeholder="Arrêtée la présente facture à la somme de"
              className="h-9 text-sm"
            />
          </Field>

          <Field label={t('taxExemptionLabel')}>
            <Input
              value={invoiceTexts.taxExemption}
              onChange={e => updateText('taxExemption', e.target.value)}
              placeholder="TVA non applicable, article 89-I-12°..."
              className="h-9 text-sm"
            />
          </Field>

          <Field label={t('footerNotesLabel')}>
            <Textarea
              value={invoiceTexts.footerNotes}
              onChange={e => updateText('footerNotes', e.target.value)}
              placeholder="Conditions de paiement, coordonnées bancaires..."
              className="text-sm min-h-[80px]"
            />
          </Field>
        </div>

        {/* Bank Info */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">{t('bankInfo')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field label={t('bankName')}>
              <Input value={invoiceTexts.bankName} onChange={e => updateText('bankName', e.target.value)} placeholder="Attijariwafa Bank" className="h-9 text-sm" />
            </Field>
            <Field label={t('swift')}>
              <Input value={invoiceTexts.swift} onChange={e => updateText('swift', e.target.value)} className="h-9 text-sm" />
            </Field>
          </div>
          <Field label={t('rib')}>
            <Input value={invoiceTexts.rib} onChange={e => updateText('rib', e.target.value)} placeholder="000 000 0000000000000000 00" className="h-9 text-sm font-mono" />
          </Field>
          <Field label={t('iban')}>
            <Input value={invoiceTexts.iban} onChange={e => updateText('iban', e.target.value)} placeholder="MA00 0000 0000 0000 0000 0000 000" className="h-9 text-sm font-mono" />
          </Field>
        </div>

        <p className="text-xs text-muted-foreground">
          {t('settingsSaved')}
        </p>

        {/* Admin access */}
        <div className="pt-4 sm:pt-6 border-t border-border pb-8">
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            لوحة الإدارة
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
