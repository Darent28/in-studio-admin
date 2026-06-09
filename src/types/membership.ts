export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FROZEN';

export interface Membership {
  membershipId: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  startDate: string;
  endDate: string;
  creditsLeft: number;
  status: MembershipStatus;
  paymentMethod: string | null;
  paymentStatus: string | null;
  stripePaymentIntentId: string | null;
  createdAt: string;
}

export interface MembershipPayload {
  userId: number;
  startDate: string;
  endDate: string;
}

export interface AdjustCreditsPayload {
  delta: number;
}

export interface ChangePeriodPayload {
  startDate: string;
  endDate: string;
}
