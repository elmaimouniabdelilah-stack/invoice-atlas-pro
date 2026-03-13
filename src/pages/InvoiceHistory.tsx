import { useEffect, useState } from "react";
import { getInvoices, deleteInvoice } from "@/lib/store";
import { Invoice } from "@/types/invoice";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusConfig = {
  draft: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
  sent: { label: "Envoyée", className: "bg-primary/10 text-primary" },
  paid: { label: "Payée", className: "bg-success/10 text-success" },
  overdue: { label: "En retard", className: "bg-destructive/10 text-destructive" },
};

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setInvoices(getInvoices().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, []);

  const handleDelete = (id: string) => {
    deleteInvoice(id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Facture supprimée" });
  };

  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-semibold mb-6">Historique des factures</h1>

      {invoices.length === 0 ? (
        <Card className="p-8">
          <p className="text-center text-muted-foreground">Aucune facture enregistrée</p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">N° Facture</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Total TTC</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const status = statusConfig[inv.status];
                  return (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-xs">{inv.number}</td>
                      <td className="py-3 px-4">{inv.buyer.nomClient || "—"}</td>
                      <td className="py-3 px-4 font-mono text-xs">{inv.date}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className={status.className}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium">
                        {inv.totalTTC.toFixed(2)} DH
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(inv.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
