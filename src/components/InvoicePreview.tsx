import { useInvoice } from '@/contexts/InvoiceContext';
import GreenTemplate from './invoice-templates/GreenTemplate';
import BlueTemplate from './invoice-templates/BlueTemplate';
import ClassicTemplate from './invoice-templates/ClassicTemplate';

interface InvoicePreviewProps {
  mobileView?: boolean;
}

export default function InvoicePreview({ mobileView = false }: InvoicePreviewProps) {
  const { invoiceTemplate } = useInvoice();

  switch (invoiceTemplate) {
    case 'green':
      return <GreenTemplate mobileView={mobileView} />;
    case 'blue':
      return <BlueTemplate mobileView={mobileView} />;
    case 'classic':
    default:
      return <ClassicTemplate mobileView={mobileView} />;
  }
}
