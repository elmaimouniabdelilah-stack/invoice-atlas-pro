import { useEffect, useState } from "react";
import { FileText, Users, DollarSign, Download, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getInvoices, getClients, exportData, importData } from "@/lib/store";
import { Invoice, Client } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setInvoices(getInvoices());
    setClients(getClients());
  }, []);

  const totalFacture = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "facturapro-export.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Données exportées avec succès" });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const success = importData(ev.target?.result as string);
        if (success) {
          setInvoices(getInvoices());
          setClients(getClients());
          toast({ title: "Données importées avec succès" });
        } else {
          toast({ title: "Erreur lors de l'importation", variant: "destructive" });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Tableau de bord</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exporter les données
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            Importer les données
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nombre de factures</p>
              <p className="text-2xl font-semibold font-mono">{invoices.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clients</p>
              <p className="text-2xl font-semibold font-mono">{clients.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total facturé</p>
              <p className="text-2xl font-semibold font-mono">
                {totalFacture.toFixed(2)} DH
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-semibold mb-4">Clients</h2>
        {clients.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun client enregistré
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Nom</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">ICE</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Adresse</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Factures</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2 px-3">{client.name}</td>
                    <td className="py-2 px-3 font-mono text-xs">{client.ice || "—"}</td>
                    <td className="py-2 px-3">{client.adresse || "—"}</td>
                    <td className="py-2 px-3 text-right font-mono">{client.invoiceCount}</td>
                    <td className="py-2 px-3 text-right font-mono">{client.totalAmount.toFixed(2)} DH</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
