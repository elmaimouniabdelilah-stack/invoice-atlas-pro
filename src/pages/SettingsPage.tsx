import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getVendorInfo, saveVendorInfo } from "@/lib/store";
import { VendorInfo } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorInfo>({
    raisonSociale: "",
    ice: "",
    adresse: "",
    telephone: "",
    email: "",
    ifNumber: "",
    rc: "",
    cnss: "",
  });

  useEffect(() => {
    const saved = getVendorInfo();
    if (saved) setVendor(saved);
  }, []);

  const handleSave = () => {
    saveVendorInfo(vendor);
    toast({ title: "Paramètres sauvegardés" });
  };

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <h1 className="text-2xl font-semibold mb-6">Paramètres</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Informations du vendeur</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Ces informations seront pré-remplies dans chaque nouvelle facture.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Raison sociale</Label>
              <Input value={vendor.raisonSociale} onChange={(e) => setVendor({ ...vendor, raisonSociale: e.target.value })} />
            </div>
            <div>
              <Label>ICE</Label>
              <Input value={vendor.ice} onChange={(e) => setVendor({ ...vendor, ice: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Adresse</Label>
            <Input value={vendor.adresse} onChange={(e) => setVendor({ ...vendor, adresse: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Téléphone</Label>
              <Input value={vendor.telephone} onChange={(e) => setVendor({ ...vendor, telephone: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={vendor.email} onChange={(e) => setVendor({ ...vendor, email: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>IF</Label>
              <Input value={vendor.ifNumber} onChange={(e) => setVendor({ ...vendor, ifNumber: e.target.value })} />
            </div>
            <div>
              <Label>RC</Label>
              <Input value={vendor.rc} onChange={(e) => setVendor({ ...vendor, rc: e.target.value })} />
            </div>
            <div>
              <Label>CNSS</Label>
              <Input value={vendor.cnss} onChange={(e) => setVendor({ ...vendor, cnss: e.target.value })} />
            </div>
          </div>

          <Button onClick={handleSave} className="mt-2">Sauvegarder</Button>
        </div>
      </Card>
    </div>
  );
}
