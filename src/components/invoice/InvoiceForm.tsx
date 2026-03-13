import { Invoice, Article } from "@/types/invoice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface InvoiceFormProps {
  invoice: Invoice;
  onChange: (partial: Partial<Invoice>) => void;
}

export function InvoiceForm({ invoice, onChange }: InvoiceFormProps) {
  const [showAdmin, setShowAdmin] = useState(false);

  const updateVendor = (field: string, value: string) => {
    onChange({ vendor: { ...invoice.vendor, [field]: value } });
  };

  const updateBuyer = (field: string, value: string) => {
    onChange({ buyer: { ...invoice.buyer, [field]: value } });
  };

  const updateArticle = (index: number, field: keyof Article, value: string | number) => {
    const articles = [...invoice.articles];
    articles[index] = { ...articles[index], [field]: value };
    onChange({ articles });
  };

  const addArticle = () => {
    onChange({
      articles: [
        ...invoice.articles,
        { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, tvaRate: 20, total: 0 },
      ],
    });
  };

  const removeArticle = (index: number) => {
    if (invoice.articles.length <= 1) return;
    const articles = invoice.articles.filter((_, i) => i !== index);
    onChange({ articles });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange({ logo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-5 space-y-6">
      {/* Auto-entrepreneur toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium text-sm">Auto-entrepreneur</p>
          <p className="text-xs text-muted-foreground">TVA 0%</p>
        </div>
        <Switch
          checked={invoice.isAutoEntrepreneur}
          onCheckedChange={(checked) => onChange({ isAutoEntrepreneur: checked })}
        />
      </div>

      {/* Invoice number & dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs">Facture N°</Label>
          <Input value={invoice.number} onChange={(e) => onChange({ number: e.target.value })} className="font-mono text-sm" />
        </div>
        <div>
          <Label className="text-xs">Date</Label>
          <Input type="date" value={invoice.date} onChange={(e) => onChange({ date: e.target.value })} className="font-mono text-sm" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Date d'échéance</Label>
        <Input type="date" value={invoice.dueDate} onChange={(e) => onChange({ dueDate: e.target.value })} className="font-mono text-sm" />
      </div>

      {/* Logo */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground border rounded-lg px-3 py-2 w-fit">
          <Upload className="h-4 w-4" />
          Télécharger le logo
          <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </label>
      </div>

      {/* Vendor info */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Informations du vendeur</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Raison sociale</Label>
              <Input value={invoice.vendor.raisonSociale} onChange={(e) => updateVendor("raisonSociale", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">ICE</Label>
              <Input value={invoice.vendor.ice} onChange={(e) => updateVendor("ice", e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Adresse</Label>
            <Input value={invoice.vendor.adresse} onChange={(e) => updateVendor("adresse", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Téléphone</Label>
              <Input value={invoice.vendor.telephone} onChange={(e) => updateVendor("telephone", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={invoice.vendor.email} onChange={(e) => updateVendor("email", e.target.value)} />
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAdmin(!showAdmin)}
          className="flex items-center gap-1 text-xs text-muted-foreground mt-3 hover:text-foreground"
        >
          {showAdmin ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          Champs administratifs (IF, RC, CNSS)
        </button>

        {showAdmin && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div>
              <Label className="text-xs">IF</Label>
              <Input value={invoice.vendor.ifNumber} onChange={(e) => updateVendor("ifNumber", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">RC</Label>
              <Input value={invoice.vendor.rc} onChange={(e) => updateVendor("rc", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">CNSS</Label>
              <Input value={invoice.vendor.cnss} onChange={(e) => updateVendor("cnss", e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Buyer info */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Informations de l'acheteur</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nom du client</Label>
              <Input value={invoice.buyer.nomClient} onChange={(e) => updateBuyer("nomClient", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">ICE</Label>
              <Input value={invoice.buyer.ice} onChange={(e) => updateBuyer("ice", e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Adresse</Label>
            <Input value={invoice.buyer.adresse} onChange={(e) => updateBuyer("adresse", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Articles */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Articles</h3>
        <div className="space-y-3">
          {invoice.articles.map((article, index) => (
            <div key={article.id} className="border rounded-lg p-3">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 items-end text-xs">
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input value={article.description} onChange={(e) => updateArticle(index, "description", e.target.value)} />
                </div>
                <div className="w-16">
                  <Label className="text-xs">Quantité</Label>
                  <Input type="number" min={1} value={article.quantity} onChange={(e) => updateArticle(index, "quantity", Number(e.target.value))} className="font-mono" />
                </div>
                <div className="w-20">
                  <Label className="text-xs">Prix unitaire</Label>
                  <Input type="number" min={0} step={0.01} value={article.unitPrice} onChange={(e) => updateArticle(index, "unitPrice", Number(e.target.value))} className="font-mono" />
                </div>
                <div className="w-16">
                  <Label className="text-xs">Taux TVA</Label>
                  <Input type="number" min={0} max={100} value={invoice.isAutoEntrepreneur ? 0 : article.tvaRate} disabled={invoice.isAutoEntrepreneur} onChange={(e) => updateArticle(index, "tvaRate", Number(e.target.value))} className="font-mono" />
                </div>
                <div className="w-20">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="font-mono text-sm h-9 flex items-center">
                    {(article.quantity * article.unitPrice).toFixed(2)}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeArticle(index)} disabled={invoice.articles.length <= 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3" onClick={addArticle}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un article
        </Button>
      </div>

      {/* Discount */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-3">Remise</h3>
        <div className="flex gap-3 items-end">
          <div className="w-40">
            <Select value={invoice.discountType} onValueChange={(v) => onChange({ discountType: v as 'percentage' | 'fixed' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                <SelectItem value="fixed">Montant fixe (DH)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-24">
            <Input type="number" min={0} value={invoice.discountValue} onChange={(e) => onChange({ discountValue: Number(e.target.value) })} className="font-mono" />
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="border rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total HT</span>
          <span className="font-mono font-medium">{invoice.totalHT.toFixed(2)} DH</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total TVA</span>
          <span className="font-mono">{invoice.totalTVA.toFixed(2)} DH</span>
        </div>
        <div className="flex justify-between text-sm font-semibold border-t pt-2">
          <span>Total TTC</span>
          <span className="font-mono">{invoice.totalTTC.toFixed(2)} DH</span>
        </div>
      </div>
    </div>
  );
}
