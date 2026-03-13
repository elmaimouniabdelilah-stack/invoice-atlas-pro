export interface Article {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tvaRate: number;
  total: number;
}

export interface VendorInfo {
  raisonSociale: string;
  ice: string;
  adresse: string;
  telephone: string;
  email: string;
  ifNumber: string;
  rc: string;
  cnss: string;
}

export interface BuyerInfo {
  nomClient: string;
  ice: string;
  adresse: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  isAutoEntrepreneur: boolean;
  vendor: VendorInfo;
  buyer: BuyerInfo;
  articles: Article[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  logo?: string;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  ice: string;
  adresse: string;
  invoiceCount: number;
  totalAmount: number;
}
