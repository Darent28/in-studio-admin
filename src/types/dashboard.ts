import type { SessionSchedule } from './sessionSchedule';
import type { Payment } from './payment';

export interface TopAttendee {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  attendanceCount: number;
}

export interface TopPackage {
  planId: number;
  planName: string;
  purchaseCount: number;
}

export interface RecentMember {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface MemberCredits {
  membershipId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  creditsLeft: number;
  creditsTotal: number;
  status: string;
}

export interface Dashboard {
  totalEarningsCard: number;
  totalEarningsCash: number;
  totalEarnings: number;
  totalMembers: number;
  todayClasses: SessionSchedule[];
  recentPurchases: Payment[];
  topAttendees: TopAttendee[];
  topPackages: TopPackage[];
  recentMembers: RecentMember[];
  memberCredits: MemberCredits[];
}
