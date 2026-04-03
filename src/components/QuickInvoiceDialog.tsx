import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LanguageContext';
import { useInvoice } from '@/contexts/InvoiceContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Search, User, Package, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateInvoiceNumber } from '@/lib/invoiceTypes';

const DOC_TYPES = [
  { value: 'Facture', label: 'Facture', prefix: 'FAC' },
  { value: 'Devis', label: 'Devis', prefix: 'DEV' },
  { value: 'Bon de commande', label: 'Bon de commande', prefix: 'BC' },
  { value: 'Bon de livraison', label: 'Bon de livraison', prefix: 'BL' },
];

interface Props {
  trigger?: React.ReactNode;
}

export default function QuickInvoiceDialog({ trigger }: Props) {
  const { t } = useLang();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clients, savedProducts, setBuyer, setItems, setInvoiceNumber, setInvoiceDate, isAutoEntrepreneur, setInvoiceTexts } = useInvoice();

  const [open, setOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
  const [clientSearch, setClientSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [docType, setDocType] = useState('Facture');

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.ice.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredProducts = savedProducts.filter(p =>
    p.description.toLowerCase().includes(productSearch.toLowerCase())
  );

  const toggleProduct = (id: string, defaultQty: number) => {
    setSelectedProducts(prev => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, defaultQty);
      return next;
    });
  };

  const updateQuantity = (id: string, qty: number) => {
    setSelectedProducts(prev => {
      const next = new Map(prev);
      if (next.has(id)) next.set(id, Math.max(1, qty));
      return next;
    });
  };

  const handleGenerate = () => {
    if (!selectedClientId) {
      toast({ title: t('noClientSelected'), variant: 'destructive' });
      return;
    }
    if (selectedProducts.size === 0) {
      toast({ title: t('noProductSelected'), variant: 'destructive' });
      return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    setBuyer({ clientName: client.name, address: client.address, ice: client.ice });

    const invoiceItems = savedProducts
      .filter(p => selectedProducts.has(p.id))
      .map(p => ({
        id: crypto.randomUUID(),
        description: p.description,
        quantity: selectedProducts.get(p.id) ?? p.defaultQuantity,
        unitPrice: p.unitPrice,
        tvaRate: isAutoEntrepreneur ? 0 : p.tvaRate,
      }));

    setItems(invoiceItems);
    setInvoiceNumber(generateInvoiceNumber());
    setInvoiceDate(new Date().toISOString().split('T')[0]);

    setOpen(false);
    setSelectedClientId(null);
    setSelectedProducts(new Map());
    setClientSearch('');
    setProductSearch('');
    navigate('/invoice');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="h-9 gap-1.5">
            <Zap className="h-4 w-4" />
            {t('quickInvoice')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {t('quickInvoice')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Client Selection */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              {t('selectClient')}
            </h3>
            {clients.length > 3 && (
              <div className="relative mb-2">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={clientSearch}
                  onChange={e => setClientSearch(e.target.value)}
                  placeholder={t('searchClients')}
                  className="h-8 ps-8 text-xs"
                />
              </div>
            )}
            <div className="space-y-1 max-h-36 overflow-y-auto rounded-md border border-border p-1">
              {filteredClients.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">{t('noClients')}</p>
              ) : (
                filteredClients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`w-full text-start rounded-md px-3 py-2 text-xs transition-colors ${
                      selectedClientId === client.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <span className="font-medium">{client.name}</span>
                    {client.ice && <span className="ms-2 opacity-70">{client.ice}</span>}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              {t('selectProducts')}
              {selectedProducts.size > 0 && (
                <span className="text-xs font-normal text-primary">({selectedProducts.size} {t('selected')})</span>
              )}
            </h3>
            {savedProducts.length > 3 && (
              <div className="relative mb-2">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder={t('searchProducts')}
                  className="h-8 ps-8 text-xs"
                />
              </div>
            )}
            <div className="space-y-1 max-h-52 overflow-y-auto rounded-md border border-border p-1">
              {filteredProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">{t('noProducts')}</p>
              ) : (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-xs transition-colors ${
                      selectedProducts.has(product.id) ? 'bg-primary/10' : 'hover:bg-muted'
                    }`}
                  >
                    <Checkbox
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => toggleProduct(product.id, product.defaultQuantity)}
                    />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleProduct(product.id, product.defaultQuantity)}>
                      <span className="font-medium">{product.description}</span>
                    </div>
                    {selectedProducts.has(product.id) ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          className="h-5 w-5 rounded bg-muted flex items-center justify-center text-foreground hover:bg-muted-foreground/20"
                          onClick={() => updateQuantity(product.id, (selectedProducts.get(product.id) ?? 1) - 1)}
                        >−</button>
                        <Input
                          type="number"
                          min={1}
                          value={selectedProducts.get(product.id) ?? 1}
                          onChange={e => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                          className="h-5 w-10 text-center text-xs p-0 border-muted"
                        />
                        <button
                          type="button"
                          className="h-5 w-5 rounded bg-muted flex items-center justify-center text-foreground hover:bg-muted-foreground/20"
                          onClick={() => updateQuantity(product.id, (selectedProducts.get(product.id) ?? 1) + 1)}
                        >+</button>
                      </div>
                    ) : (
                      <span className="shrink-0 text-muted-foreground">
                        {product.unitPrice.toFixed(2)} {t('dh')}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            className="w-full gap-2"
            disabled={!selectedClientId || selectedProducts.size === 0}
          >
            <Zap className="h-4 w-4" />
            {t('generateInvoice')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
