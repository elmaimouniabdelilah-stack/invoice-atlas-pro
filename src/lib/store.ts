import { Invoice, Client } from '@/types/invoice';

const STORAGE_KEY = 'facturapro_invoices';
const VENDOR_KEY = 'facturapro_vendor';

export function getInvoices(): Invoice[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  const index = invoices.findIndex(i => i.id === invoice.id);
  if (index >= 0) {
    invoices[index] = invoice;
  } else {
    invoices.push(invoice);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function deleteInvoice(id: string): void {
  const invoices = getInvoices().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function getClients(): Client[] {
  const invoices = getInvoices();
  const clientMap = new Map<string, Client>();

  invoices.forEach(inv => {
    const key = inv.buyer.nomClient || 'unknown';
    if (!key || key === 'unknown') return;
    const existing = clientMap.get(key);
    if (existing) {
      existing.invoiceCount++;
      existing.totalAmount += inv.totalTTC;
    } else {
      clientMap.set(key, {
        id: key,
        name: inv.buyer.nomClient,
        ice: inv.buyer.ice,
        adresse: inv.buyer.adresse,
        invoiceCount: 1,
        totalAmount: inv.totalTTC,
      });
    }
  });

  return Array.from(clientMap.values());
}

export function getVendorInfo() {
  const data = localStorage.getItem(VENDOR_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveVendorInfo(vendor: any) {
  localStorage.setItem(VENDOR_KEY, JSON.stringify(vendor));
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `FAC-${y}${m}${d}-${rand}`;
}

export function exportData(): string {
  const invoices = getInvoices();
  const vendor = getVendorInfo();
  return JSON.stringify({ invoices, vendor }, null, 2);
}

export function importData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.invoices) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.invoices));
    }
    if (data.vendor) {
      localStorage.setItem(VENDOR_KEY, JSON.stringify(data.vendor));
    }
    return true;
  } catch {
    return false;
  }
}
