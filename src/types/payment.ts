export type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER' | 'PAYPAL' | 'STRIPE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  paymentId: number;
  membershipId: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  planId: number;
  planName: string;
  planCredits: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionRef: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface PaymentPayload {
  userId: number;
  planId: number;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  transactionRef?: string;
}
