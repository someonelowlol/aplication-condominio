import { useState } from 'react';

export interface Payment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export function usePayments() {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([
    {
      id: 'mock-1',
      description: 'Expensas Enero 2026',
      amount: 150000,
      dueDate: '2026-01-10',
      status: 'PENDING'
    },
    {
      id: 'mock-2',
      description: 'Cuota Extraordinaria (Pintura)',
      amount: 50000,
      dueDate: '2026-02-15',
      status: 'PENDING'
    }
  ]);

  const initiatePayment = async () => {
    setIsLoading(true);
    // Simulating API loading
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    
    // Redirect to Bancolombia
    window.open('https://www.bancolombia.com/personas', '_blank');
    setPendingPayments([]); // Mark as paid locally for demo
  };

  return { pendingPayments, initiatePayment, isLoading };
}
