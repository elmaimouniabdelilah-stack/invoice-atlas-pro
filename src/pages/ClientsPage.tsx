import AppLayout from '@/components/AppLayout';
import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FileText, Search, UserPlus, X, Edit2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Client } from '@/lib/invoiceTypes';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export default function ClientsPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { clients, setClients, setBuyer, setItems, isAutoEntrepreneur } = useInvoice();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', address: '', ice: '' });

  const filteredClients = clients.filter(c => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.ice.toLowerCase().includes(q) || c.address.toLowerCase().includes(q);
  });

  const resetForm = () => {
    setForm({ name: '', address: '', ice: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (editingId) {
      setClients(prev => prev.map(c => c.id === editingId
        ? { ...c, name: form.name, address: form.address, ice: form.ice }
        : c
      ));
    } else {
      setClients(prev => [...prev, {
        id: crypto.randomUUID(),
        name: form.name,
        address: form.address,
        ice: form.ice,
        totalBilled: 0,
        invoiceCount: 0,
      }]);
    }
    resetForm();
  };

  const handleEdit = (client: Client) => {
    setForm({ name: client.name, address: client.address, ice: client.ice });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const handleCreateInvoice = (client: Client) => {
    setBuyer({ clientName: client.name, address: client.address, ice: client.ice });
    setItems([{ id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, tvaRate: isAutoEntrepreneur ? 0 : 20 }]);
    navigate('/invoice');
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-8 max-w-3xl space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">{t('clients')}</h1>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="h-9">
            <UserPlus className="h-4 w-4" />
            {t('addClient')}
          </Button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                {editingId ? t('editClient') : t('addClient')}
              </h2>
              <button onClick={resetForm} className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t('clientName')}>
                <Input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder={t('clientName')}
                  className="h-9 text-sm"
                  autoFocus
                />
              </Field>
              <Field label={t('ice')}>
                <Input
                  value={form.ice}
                  onChange={e => setForm(p => ({ ...p, ice: e.target.value }))}
                  placeholder="ICE"
                  className="h-9 text-sm"
                />
              </Field>
            </div>
            <Field label={t('address')}>
              <Input
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder={t('address')}
                className="h-9 text-sm"
              />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={resetForm}>{t('cancel')}</Button>
              <Button size="sm" onClick={handleSave} disabled={!form.name.trim()}>
                {editingId ? t('updateClient') : t('saveClient')}
              </Button>
            </div>
          </div>
        )}

        {/* Search */}
        {clients.length > 0 && (
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchClients')}
              className="h-9 ps-9 text-sm"
            />
          </div>
        )}

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <UserPlus className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t('noClients')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredClients.map(client => (
              <div key={client.id} className="rounded-lg border border-border bg-card p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground truncate">{client.name}</h3>
                      {client.ice && (
                        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                          {client.ice}
                        </span>
                      )}
                    </div>
                    {client.address && (
                      <p className="text-xs text-muted-foreground truncate">{client.address}</p>
                    )}
                    <div className="flex gap-3 mt-1.5 text-[11px] text-muted-foreground">
                      <span>{t('invoicesCount')}: {client.invoiceCount}</span>
                      <span>{t('totalBilled')}: {client.totalBilled.toFixed(2)} {t('dh')}</span>
                    </div>
                  </div>
                  <div className={`flex shrink-0 ${isMobile ? 'flex-col gap-1' : 'gap-1'}`}>
                    <Button
                      size="sm"
                      onClick={() => handleCreateInvoice(client)}
                      className="h-8 px-2.5 text-xs"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {!isMobile && t('createInvoice')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(client)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(client.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
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
