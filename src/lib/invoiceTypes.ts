export interface SellerInfo {
  businessName: string;
  address: string;
  ice: string;
  ifCode: string;
  rc: string;
  cnss: string;
  phone: string;
  email: string;
  logo: string | null;
}

export interface BuyerInfo {
  clientName: string;
  address: string;
  ice: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
  reference?: string;
  length?: number;
  height?: number;
  totalM2?: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  seller: SellerInfo;
  buyer: BuyerInfo;
  items: InvoiceItem[];
  isAutoEntrepreneur: boolean;
  totalTTC: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  ice: string;
  totalBilled: number;
  invoiceCount: number;
}

export interface SavedProduct {
  id: string;
  description: string;
  unitPrice: number;
  tvaRate: number;
  defaultQuantity: number;
}

export const TVA_RATES = [0, 7, 10, 14, 20];

export function calculateItemTotal(item: InvoiceItem): number {
  return item.quantity * item.unitPrice;
}

export function calculateItemTVA(item: InvoiceItem, isAutoEntrepreneur: boolean): number {
  if (isAutoEntrepreneur) return 0;
  return calculateItemTotal(item) * (item.tvaRate / 100);
}

export function calculateTotalHT(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
}

export function calculateTotalTVA(items: InvoiceItem[], isAutoEntrepreneur: boolean): number {
  if (isAutoEntrepreneur) return 0;
  return items.reduce((sum, item) => sum + calculateItemTVA(item, isAutoEntrepreneur), 0);
}

export function calculateTotalTTC(items: InvoiceItem[], isAutoEntrepreneur: boolean): number {
  return calculateTotalHT(items) + calculateTotalTVA(items, isAutoEntrepreneur);
}

export function calculateDiscount(totalHT: number, discountType: 'percentage' | 'fixed', discountValue: number): number {
  if (discountValue <= 0) return 0;
  if (discountType === 'percentage') return totalHT * (discountValue / 100);
  return Math.min(discountValue, totalHT);
}

export function calculateTotalTTCWithDiscount(
  items: InvoiceItem[], isAutoEntrepreneur: boolean,
  discountType: 'percentage' | 'fixed', discountValue: number
): number {
  const totalHT = calculateTotalHT(items);
  const discount = calculateDiscount(totalHT, discountType, discountValue);
  const discountedHT = totalHT - discount;
  if (isAutoEntrepreneur) return discountedHT;
  // Recalculate TVA on discounted amount proportionally
  const totalTVA = calculateTotalTVA(items, isAutoEntrepreneur);
  const tvaRatio = totalHT > 0 ? discountedHT / totalHT : 0;
  return discountedHT + totalTVA * tvaRatio;
}

export function getInvoicePrefix(invoiceTitle: string): string {
  if (invoiceTitle.startsWith('Devis')) return 'DEV';
  if (invoiceTitle.startsWith('Bon de commande')) return 'BC';
  if (invoiceTitle.startsWith('Bon de livraison')) return 'BL';
  return 'FAC';
}

export function generateInvoiceNumber(invoiceTitle?: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  const prefix = getInvoicePrefix(invoiceTitle || 'Facture');
  return `${prefix}-${year}${month}-${rand}`;
}
