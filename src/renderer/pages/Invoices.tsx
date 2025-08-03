import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { prisma } from '../utils/prisma';

type Invoice = {
  name: string;
  id: string;
  createdAt: Date | null;
  content: string;
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const fetchInvoices = async () => {
    try {
      const data = await prisma.invoiceTemplates.findMany({});
      setInvoices(data);
    } catch {
      toast.error('Failed to fetch invoices');
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <ul className="space-y-4">
        {invoices?.length && invoices.map((inv) => (
          <li key={inv.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold">{inv.name}</h2>
            <div
              className="mt-2 text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: inv.content }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
