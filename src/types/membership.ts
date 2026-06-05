export type MembershipStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FROZEN';

export interface Membership {
  membershipId: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  planId: number;
  planName: string;
  planType: string;
  planCredits: number;
  startDate: string;
  endDate: string;
  creditsLeft: number;
  status: MembershipStatus;
  createdAt: string;
}

export interface MembershipPayload {
  userId: number;
  planId: number;
  startDate: string;
}

export interface AdjustCreditsPayload {
  delta: number;
}
