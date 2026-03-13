import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { TVA_RATES, calculateTotalHT, calculateTotalTVA, calculateTotalTTC, calculateDiscount, calculateTotalTTCWithDiscount } from '@/lib/invoiceTypes';
import { useState, useRef, useMemo } from 'react';

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function InvoiceForm() {
  const { t } = useLang();
  const {
    seller, setSeller,
    buyer, setBuyer,
    items, setItems,
    isAutoEntrepreneur, setIsAutoEntrepreneur,
    invoiceNumber, setInvoiceNumber,
    invoiceDate, setInvoiceDate,
    dueDate, setDueDate,
    clients,
    discountType, setDiscountType,
    discountValue, setDiscountValue,
    savedProducts,
    defaultTvaRate,
    detailedMode, setDetailedMode,
  } = useInvoice();

  const [showAdminFields, setShowAdminFields] = useState(false);
  const [clientQuery, setClientQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredClients = useMemo(() => {
    if (!clientQuery.trim()) return [];
    const q = clientQuery.toLowerCase();
    return clients.filter(c => c.name.toLowerCase().includes(q) || c.ice.toLowerCase().includes(q)).slice(0, 5);
  }, [clientQuery, clients]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSeller(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      tvaRate: isAutoEntrepreneur ? 0 : defaultTvaRate,
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalHT = calculateTotalHT(items);
  const discount = calculateDiscount(totalHT, discountType, discountValue);
  const totalTVA = calculateTotalTVA(items, isAutoEntrepreneur);
  const totalTTC = calculateTotalTTCWithDiscount(items, isAutoEntrepreneur, discountType, discountValue);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Auto-entrepreneur + TVA Control */}
      <div className="rounded-lg border border-border bg-card p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{t('autoEntrepreneur')}</p>
            <p className="text-xs text-muted-foreground">TVA 0%</p>
          </div>
          <Switch
            checked={isAutoEntrepreneur}
            onCheckedChange={(checked) => {
              setIsAutoEntrepreneur(checked);
              if (checked) {
                setItems(prev => prev.map(item => ({ ...item, tvaRate: 0 })));
              }
            }}
          />
        </div>

        {/* TVA Rate Control - always visible */}
        <div className="pt-2 border-t border-border space-y-2">
          <p className="text-sm font-medium text-foreground">
            {isAutoEntrepreneur ? 'TVA verrouillée à 0% (Auto-entrepreneur)' : `${t('tvaRate')} — ${t('items')}`}
          </p>
          <div className={`flex flex-wrap items-center gap-2 ${isAutoEntrepreneur ? 'opacity-50 pointer-events-none' : ''}`}>
            {TVA_RATES.map(rate => (
              <button
                key={rate}
                type="button"
                onClick={() => setItems(prev => prev.map(item => ({ ...item, tvaRate: rate })))}
                className="h-8 px-3 rounded-md border border-input bg-background text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                {rate}%
              </button>
            ))}
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                placeholder={t('tvaRate')}
                className="h-8 w-20 text-sm"
                onChange={e => {
                  const rate = Number(e.target.value);
                  if (rate >= 0 && rate <= 100) setItems(prev => prev.map(item => ({ ...item, tvaRate: rate })));
                }}
                disabled={isAutoEntrepreneur}
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isAutoEntrepreneur 
              ? 'Désactivez Auto-entrepreneur pour modifier le taux TVA' 
              : `${t('tvaRate')} appliqué à tous les articles`}
          </p>
        </div>
      </div>

      {/* Invoice meta */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <FieldGroup label={t('invoiceNumber')}>
          <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="h-9 text-sm" />
        </FieldGroup>
        <FieldGroup label={t('invoiceDate')}>
          <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="h-9 text-sm" />
        </FieldGroup>
      </div>
      <FieldGroup label={t('dueDate')}>
        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-9 text-sm" />
      </FieldGroup>

      {/* Logo Upload */}
      <div className="flex items-center gap-3">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" />
          {t('uploadLogo')}
        </Button>
        {seller.logo && (
          <img src={seller.logo} alt="Logo" className="h-10 w-10 rounded-md object-contain" />
        )}
      </div>

      {/* Seller Info */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{t('sellerInfo')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FieldGroup label={t('businessName')}>
            <Input value={seller.businessName} onChange={e => setSeller(p => ({ ...p, businessName: e.target.value }))} className="h-9 text-sm" />
          </FieldGroup>
          <FieldGroup label={t('ice')}>
            <Input value={seller.ice} onChange={e => setSeller(p => ({ ...p, ice: e.target.value }))} className="h-9 text-sm" />
          </FieldGroup>
        </div>
        <FieldGroup label={t('address')}>
          <Input value={seller.address} onChange={e => setSeller(p => ({ ...p, address: e.target.value }))} className="h-9 text-sm" />
        </FieldGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FieldGroup label={t('phone')}>
            <Input value={seller.phone} onChange={e => setSeller(p => ({ ...p, phone: e.target.value }))} className="h-9 text-sm" />
          </FieldGroup>
          <FieldGroup label={t('email')}>
            <Input value={seller.email} onChange={e => setSeller(p => ({ ...p, email: e.target.value }))} className="h-9 text-sm" />
          </FieldGroup>
        </div>

        {/* Collapsible Admin Fields */}
        <button
          onClick={() => setShowAdminFields(!showAdminFields)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {showAdminFields ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {t('adminFields')} (IF, RC, CNSS)
        </button>
        {showAdminFields && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            <FieldGroup label={t('ifLabel')}>
              <Input value={seller.ifCode} onChange={e => setSeller(p => ({ ...p, ifCode: e.target.value }))} className="h-9 text-sm" />
            </FieldGroup>
            <FieldGroup label={t('rc')}>
              <Input value={seller.rc} onChange={e => setSeller(p => ({ ...p, rc: e.target.value }))} className="h-9 text-sm" />
            </FieldGroup>
            <FieldGroup label={t('cnss')}>
              <Input value={seller.cnss} onChange={e => setSeller(p => ({ ...p, cnss: e.target.value }))} className="h-9 text-sm" />
            </FieldGroup>
          </div>
        )}
      </section>

      {/* Buyer Info */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{t('buyerInfo')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FieldGroup label={t('clientName')}>
            <div className="relative">
              <Input
                value={buyer.clientName}
                onChange={e => {
                  const val = e.target.value;
                  setBuyer(p => ({ ...p, clientName: val }));
                  setClientQuery(val);
                  setShowSuggestions(true);
                }}
                onFocus={() => { if (clientQuery) setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="h-9 text-sm"
              />
              {showSuggestions && filteredClients.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                  {filteredClients.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-accent transition-colors"
                      onMouseDown={() => {
                        setBuyer({ clientName: c.name, address: c.address, ice: c.ice });
                        setClientQuery('');
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="font-medium text-foreground">{c.name}</span>
                      {c.ice && <span className="text-xs text-muted-foreground">{c.ice}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FieldGroup>
          <FieldGroup label={t('ice')}>
            <Input value={buyer.ice} onChange={e => setBuyer(p => ({ ...p, ice: e.target.value }))} className="h-9 text-sm" />
          </FieldGroup>
        </div>
        <FieldGroup label={t('address')}>
          <Input value={buyer.address} onChange={e => setBuyer(p => ({ ...p, address: e.target.value }))} className="h-9 text-sm" />
        </FieldGroup>
      </section>

      {/* Items */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{t('items')}</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border border-border bg-card p-3 space-y-2">
              {/* Description - full width */}
              <div>
                <Label className="text-xs text-muted-foreground">{t('description')}</Label>
                <Input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="h-8 text-sm" />
              </div>
              {/* Quantity, Price, TVA, Total in a responsive grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                <div>
                  <Label className="text-xs text-muted-foreground">{t('quantity')}</Label>
                  <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('unitPrice')}</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice || ''}
                    onFocus={e => { if (item.unitPrice === 0) e.currentTarget.value = ''; }}
                    onBlur={e => { if (e.currentTarget.value === '') updateItem(item.id, 'unitPrice', 0); }}
                    onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">{t('tvaRate')}</Label>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={item.tvaRate}
                      onChange={e => updateItem(item.id, 'tvaRate', Number(e.target.value))}
                      disabled={isAutoEntrepreneur}
                      className="h-8 text-sm"
                    />
                    <span className="flex items-center text-xs text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-1">
                  <span className="pb-1 text-sm font-medium text-foreground">
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3.5 w-3.5" />
            {t('addItem')}
          </Button>
          {savedProducts.length > 0 && (
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowProductPicker(!showProductPicker)} onBlur={() => setTimeout(() => setShowProductPicker(false), 200)}>
                <Package className="h-3.5 w-3.5" />
                {t('addFromSaved')}
              </Button>
              {showProductPicker && (
                <div className="absolute z-[100] mt-1 w-64 rounded-md border border-border bg-popover shadow-lg max-h-48 overflow-y-auto">
                  {savedProducts.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className="flex w-full items-center justify-between px-3 py-2 text-start text-sm hover:bg-accent transition-colors"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setItems(prev => [...prev, {
                          id: crypto.randomUUID(),
                          description: p.description,
                          quantity: p.defaultQuantity,
                          unitPrice: p.unitPrice,
                          tvaRate: isAutoEntrepreneur ? 0 : p.tvaRate,
                        }]);
                        setShowProductPicker(false);
                      }}
                    >
                      <span className="font-medium text-foreground truncate">{p.description}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ms-2">{p.unitPrice.toFixed(2)} {t('dh')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Discount */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">{t('discount')}</Label>
          <div className="flex gap-2">
            <select
              value={discountType}
              onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="percentage">{t('discountPercentage')} (%)</option>
              <option value="fixed">{t('discountFixed')} ({t('dh')})</option>
            </select>
            <Input
              type="number"
              min={0}
              max={discountType === 'percentage' ? 100 : undefined}
              step={0.01}
              value={discountValue}
              onChange={e => setDiscountValue(Number(e.target.value))}
              className="h-9 w-28 text-sm"
            />
          </div>
        </div>
        {discount > 0 && (
          <span className="text-sm font-medium text-destructive">-{discount.toFixed(2)} {t('dh')}</span>
        )}
      </div>


      {/* Totals */}
      <div className="space-y-2 rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t('totalHT')}</span>
          <span className="font-medium text-foreground">{totalHT.toFixed(2)} {t('dh')}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('discount')}</span>
            <span className="font-medium text-destructive">-{discount.toFixed(2)} {t('dh')}</span>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('totalAfterDiscount')}</span>
            <span className="font-medium text-foreground">{(totalHT - discount).toFixed(2)} {t('dh')}</span>
          </div>
        )}
        {!isAutoEntrepreneur && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('totalTVA')}</span>
            <span className="font-medium text-foreground">{(totalTVA * (totalHT > 0 ? (totalHT - discount) / totalHT : 0)).toFixed(2)} {t('dh')}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2 text-sm">
          <span className="font-semibold text-foreground">{t('totalTTC')}</span>
          <span className="font-bold text-foreground">{totalTTC.toFixed(2)} {t('dh')}</span>
        </div>
      </div>
    </div>
  );
}
