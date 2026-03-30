import React, { createContext, useContext, useState, useEffect } from 'react';
import { SellerInfo, BuyerInfo, InvoiceItem, Client, Invoice, SavedProduct, generateInvoiceNumber } from '@/lib/invoiceTypes';

const STORAGE_KEY = 'facturapro-data';

export interface InvoiceTexts {
  invoiceTitle: string;
  amountInWordsPhrase: string;
  footerNotes: string;
  taxExemption: string;
  bankName: string;
  rib: string;
  iban: string;
  swift: string;
}

const defaultTexts: InvoiceTexts = {
  invoiceTitle: 'Facture N°',
  amountInWordsPhrase: 'Arrêtée la présente facture à la somme de',
  footerNotes: '',
  taxExemption: 'TVA non applicable, article 89-I-12° du Code Général des Impôts.',
  bankName: '',
  rib: '',
  iban: '',
  swift: '',
};

export type InvoiceTemplate = 'green' | 'blue' | 'classic';
export type InvoiceDirection = 'ltr' | 'rtl';
export type LogoPosition = 'left' | 'center' | 'right';
export type BankInfoPosition = 'bottom' | 'afterTotals';
export type InvoiceFont = 'inter' | 'cairo' | 'amiri' | 'roboto' | 'playfair';

export interface InvoiceLayoutSettings {
  direction: InvoiceDirection;
  logoPosition: LogoPosition;
  font: InvoiceFont;
  showSignature: boolean;
  showBankInfo: boolean;
  showFooterNotes: boolean;
  showSellerIds: boolean;
  showAmountInWords: boolean;
  showThankYou: boolean;
  bankInfoPosition: BankInfoPosition;
}

const defaultLayoutSettings: InvoiceLayoutSettings = {
  direction: 'ltr',
  logoPosition: 'left',
  font: 'inter',
  showSignature: true,
  showBankInfo: true,
  showFooterNotes: true,
  showSellerIds: true,
  showAmountInWords: true,
  showThankYou: true,
  bankInfoPosition: 'bottom',
};

interface StoredData {
  seller: SellerInfo;
  clients: Client[];
  invoicesCreated: number;
  isAutoEntrepreneur: boolean;
  invoices: Invoice[];
  invoiceTexts: InvoiceTexts;
  savedProducts: SavedProduct[];
  defaultTvaRate: number;
  invoiceTemplate: InvoiceTemplate;
  templateColor: string;
  layoutSettings: InvoiceLayoutSettings;
}

function loadStored(): Partial<StoredData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStored(data: StoredData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

interface InvoiceContextType {
  seller: SellerInfo;
  setSeller: React.Dispatch<React.SetStateAction<SellerInfo>>;
  buyer: BuyerInfo;
  setBuyer: React.Dispatch<React.SetStateAction<BuyerInfo>>;
  items: InvoiceItem[];
  setItems: React.Dispatch<React.SetStateAction<InvoiceItem[]>>;
  isAutoEntrepreneur: boolean;
  setIsAutoEntrepreneur: React.Dispatch<React.SetStateAction<boolean>>;
  invoiceNumber: string;
  setInvoiceNumber: React.Dispatch<React.SetStateAction<string>>;
  invoiceDate: string;
  setInvoiceDate: React.Dispatch<React.SetStateAction<string>>;
  dueDate: string;
  setDueDate: React.Dispatch<React.SetStateAction<string>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  invoicesCreated: number;
  setInvoicesCreated: React.Dispatch<React.SetStateAction<number>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  loadInvoice: (invoice: Invoice) => void;
  invoiceTexts: InvoiceTexts;
  setInvoiceTexts: React.Dispatch<React.SetStateAction<InvoiceTexts>>;
  editingInvoiceId: string | null;
  setEditingInvoiceId: React.Dispatch<React.SetStateAction<string | null>>;
  discountType: 'percentage' | 'fixed';
  setDiscountType: React.Dispatch<React.SetStateAction<'percentage' | 'fixed'>>;
  discountValue: number;
  setDiscountValue: React.Dispatch<React.SetStateAction<number>>;
  savedProducts: SavedProduct[];
  setSavedProducts: React.Dispatch<React.SetStateAction<SavedProduct[]>>;
  defaultTvaRate: number;
  setDefaultTvaRate: React.Dispatch<React.SetStateAction<number>>;
  detailedMode: boolean;
  setDetailedMode: React.Dispatch<React.SetStateAction<boolean>>;
  invoiceTemplate: InvoiceTemplate;
  setInvoiceTemplate: React.Dispatch<React.SetStateAction<InvoiceTemplate>>;
  templateColor: string;
  setTemplateColor: React.Dispatch<React.SetStateAction<string>>;
  layoutSettings: InvoiceLayoutSettings;
  setLayoutSettings: React.Dispatch<React.SetStateAction<InvoiceLayoutSettings>>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const defaultSeller: SellerInfo = {
  businessName: '',
  address: '',
  ice: '',
  ifCode: '',
  rc: '',
  cnss: '',
  phone: '',
  email: '',
  logo: null,
};

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const stored = loadStored();

  const [seller, setSeller] = useState<SellerInfo>(stored.seller || defaultSeller);
  const [buyer, setBuyer] = useState<BuyerInfo>({ clientName: '', address: '', ice: '' });
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, tvaRate: stored.defaultTvaRate ?? 20 },
  ]);
  const [isAutoEntrepreneur, setIsAutoEntrepreneur] = useState(stored.isAutoEntrepreneur ?? false);
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [clients, setClients] = useState<Client[]>(stored.clients || []);
  const [invoicesCreated, setInvoicesCreated] = useState(stored.invoicesCreated ?? 0);
  const [invoices, setInvoices] = useState<Invoice[]>(stored.invoices || []);
  const [invoiceTexts, setInvoiceTexts] = useState<InvoiceTexts>(stored.invoiceTexts || defaultTexts);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>(stored.savedProducts || []);
  const [defaultTvaRate, setDefaultTvaRate] = useState<number>(stored.defaultTvaRate ?? 20);
  const [detailedMode, setDetailedMode] = useState(false);
  const [invoiceTemplate, setInvoiceTemplate] = useState<InvoiceTemplate>(stored.invoiceTemplate || 'green');
  const [templateColor, setTemplateColor] = useState<string>(stored.templateColor || '#2d6a4f');
  const [layoutSettings, setLayoutSettings] = useState<InvoiceLayoutSettings>({
    ...defaultLayoutSettings,
    ...(stored.layoutSettings || {}),
  });

  const loadInvoice = (invoice: Invoice) => {
    setBuyer(invoice.buyer);
    setItems(invoice.items);
    setInvoiceNumber(invoice.number);
    setInvoiceDate(invoice.date);
    setIsAutoEntrepreneur(invoice.isAutoEntrepreneur);
    setDiscountType(invoice.discountType || 'percentage');
    setDiscountValue(invoice.discountValue || 0);
  };

  useEffect(() => {
    saveStored({ seller, clients, invoicesCreated, isAutoEntrepreneur, invoices, invoiceTexts, savedProducts, defaultTvaRate, invoiceTemplate, templateColor, layoutSettings });
  }, [seller, clients, invoicesCreated, isAutoEntrepreneur, invoices, invoiceTexts, savedProducts, defaultTvaRate, invoiceTemplate, templateColor, layoutSettings]);

  return (
    <InvoiceContext.Provider value={{
      seller, setSeller,
      buyer, setBuyer,
      items, setItems,
      isAutoEntrepreneur, setIsAutoEntrepreneur,
      invoiceNumber, setInvoiceNumber,
      invoiceDate, setInvoiceDate,
      dueDate, setDueDate,
      clients, setClients,
      invoicesCreated, setInvoicesCreated,
      invoices, setInvoices,
      loadInvoice,
      invoiceTexts, setInvoiceTexts,
      editingInvoiceId, setEditingInvoiceId,
      discountType, setDiscountType,
      discountValue, setDiscountValue,
      savedProducts, setSavedProducts,
      defaultTvaRate, setDefaultTvaRate,
      detailedMode, setDetailedMode,
      invoiceTemplate, setInvoiceTemplate,
      templateColor, setTemplateColor,
      layoutSettings, setLayoutSettings,
    }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error('useInvoice must be used within InvoiceProvider');
  return ctx;
}
