import AppLayout from '@/components/AppLayout';
import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2, X, Package, Search } from 'lucide-react';
import { useState } from 'react';
import { TVA_RATES, SavedProduct } from '@/lib/invoiceTypes';
import { useIsMobile } from '@/hooks/use-mobile';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function ProductsPage() {
  const { t } = useLang();
  const isMobile = useIsMobile();
  const { savedProducts, setSavedProducts, isAutoEntrepreneur } = useInvoice();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ description: '', unitPrice: 0, tvaRate: isAutoEntrepreneur ? 0 : 20, defaultQuantity: 1 });

  const filtered = savedProducts.filter(p =>
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ description: '', unitPrice: 0, tvaRate: isAutoEntrepreneur ? 0 : 20, defaultQuantity: 1 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.description.trim()) return;
    if (editingId) {
      setSavedProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...form } : p));
    } else {
      setSavedProducts(prev => [...prev, { id: crypto.randomUUID(), ...form }]);
    }
    resetForm();
  };

  const handleEdit = (p: SavedProduct) => {
    setForm({ description: p.description, unitPrice: p.unitPrice, tvaRate: p.tvaRate, defaultQuantity: p.defaultQuantity });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setSavedProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-8 max-w-3xl space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">{t('products')}</h1>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="h-9">
            <Plus className="h-4 w-4" />
            {t('addProduct')}
          </Button>
        </div>

        {showForm && (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                {editingId ? t('editProduct') : t('addProduct')}
              </h2>
              <button onClick={resetForm} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Field label={t('description')}>
              <Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder={t('description')} className="h-9 text-sm" autoFocus />
            </Field>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Field label={t('unitPrice')}>
                <Input type="number" min={0} step={0.01} value={form.unitPrice} onChange={e => setForm(p => ({ ...p, unitPrice: Number(e.target.value) }))} className="h-9 text-sm" />
              </Field>
              <Field label={t('defaultQuantity')}>
                <Input type="number" min={1} value={form.defaultQuantity} onChange={e => setForm(p => ({ ...p, defaultQuantity: Number(e.target.value) }))} className="h-9 text-sm" />
              </Field>
              <Field label={t('tvaRate')}>
                <select
                  value={form.tvaRate}
                  onChange={e => setForm(p => ({ ...p, tvaRate: Number(e.target.value) }))}
                  disabled={isAutoEntrepreneur}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                >
                  {TVA_RATES.map(rate => (
                    <option key={rate} value={rate}>{rate}%</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={resetForm}>{t('cancel')}</Button>
              <Button size="sm" onClick={handleSave} disabled={!form.description.trim()}>
                {editingId ? t('updateProduct') : t('saveProduct')}
              </Button>
            </div>
          </div>
        )}

        {savedProducts.length > 0 && (
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchProducts')} className="h-9 ps-9 text-sm" />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t('noProducts')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(product => (
              <div key={product.id} className="rounded-lg border border-border bg-card p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{product.description}</h3>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-0.5">{t('unitPrice')}: {product.unitPrice.toFixed(2)} {t('dh')}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5">{t('quantity')}: {product.defaultQuantity}</span>
                      {!isAutoEntrepreneur && (
                        <span className="rounded bg-muted px-1.5 py-0.5">TVA: {product.tvaRate}%</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="h-8 w-8 p-0">
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
