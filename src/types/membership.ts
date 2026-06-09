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
  creditsTotal: number;
  status: MembershipStatus;
  createdAt: string;
  lastPaymentId: number | null;
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
