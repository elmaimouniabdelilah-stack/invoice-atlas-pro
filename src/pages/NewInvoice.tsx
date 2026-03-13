import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, FileDown, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { Invoice, Article, VendorInfo, BuyerInfo } from "@/types/invoice";
import { saveInvoice, generateInvoiceNumber, getVendorInfo } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

function createEmptyInvoice(): Invoice {
  const vendor = getVendorInfo();
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  return {
    id: crypto.randomUUID(),
    number: generateInvoiceNumber(),
    date: dateStr,
    dueDate: dateStr,
    isAutoEntrepreneur: false,
    vendor: vendor || {
      raisonSociale: "",
      ice: "",
      adresse: "",
      telephone: "",
      email: "",
      ifNumber: "",
      rc: "",
      cnss: "",
    },
    buyer: { nomClient: "", ice: "", adresse: "" },
    articles: [
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        tvaRate: 20,
        total: 0,
      },
    ],
    discountType: "percentage",
    discountValue: 0,
    logo: undefined,
    totalHT: 0,
    totalTVA: 0,
    totalTTC: 0,
    status: "draft",
    createdAt: now.toISOString(),
  };
}

function calcTotals(articles: Article[], discountType: string, discountValue: number, isAutoEntrepreneur: boolean) {
  let totalHT = 0;
  let totalTVA = 0;

  articles.forEach((a) => {
    const lineTotal = a.quantity * a.unitPrice;
    totalHT += lineTotal;
    if (!isAutoEntrepreneur) {
      totalTVA += lineTotal * (a.tvaRate / 100);
    }
  });

  let discount = 0;
  if (discountType === "percentage") {
    discount = totalHT * (discountValue / 100);
  } else {
    discount = discountValue;
  }

  totalHT = Math.max(0, totalHT - discount);
  if (discount > 0 && !isAutoEntrepreneur) {
    totalTVA = 0;
    articles.forEach((a) => {
      const lineTotal = a.quantity * a.unitPrice;
      const ratio = totalHT > 0 ? lineTotal / (totalHT + discount) : 0;
      totalTVA += (lineTotal - discount * ratio) * (a.tvaRate / 100);
    });
  }

  return { totalHT, totalTVA, totalTTC: totalHT + totalTVA };
}

export default function NewInvoice() {
  const [invoice, setInvoice] = useState<Invoice>(createEmptyInvoice);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateInvoice = useCallback((partial: Partial<Invoice>) => {
    setInvoice((prev) => {
      const next = { ...prev, ...partial };
      const totals = calcTotals(
        next.articles,
        next.discountType,
        next.discountValue,
        next.isAutoEntrepreneur
      );
      next.articles = next.articles.map((a) => ({
        ...a,
        total: a.quantity * a.unitPrice * (1 + (next.isAutoEntrepreneur ? 0 : a.tvaRate / 100)),
      }));
      return { ...next, ...totals };
    });
  }, []);

  const handleSave = () => {
    saveInvoice(invoice);
    toast({ title: "Facture sauvegardée" });
    navigate("/historique");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <h1 className="text-xl font-semibold">Nouvelle facture</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-[480px] xl:w-[520px] flex-shrink-0 border-r overflow-y-auto max-h-[calc(100vh-7rem)]">
          <InvoiceForm invoice={invoice} onChange={updateInvoice} />
        </div>
        <div className="flex-1 bg-muted/30 p-6 overflow-y-auto max-h-[calc(100vh-7rem)]">
          <InvoicePreview invoice={invoice} />
        </div>
      </div>
    </div>
  );
}
