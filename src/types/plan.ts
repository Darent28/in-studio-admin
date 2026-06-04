export type PlanType = 'PACK' | 'UNLIMITED' | 'MONTHLY' | 'DROP_IN';

export interface Plan {
  planId: number;
  name: string;
  credits: number;
  price: number;
  durationDays: number;
  type: PlanType;
  disciplineId: number | null;
  disciplineName: string | null;
  active: boolean;
}

export interface PlanPayload {
  name: string;
  credits: number;
  price: number;
  durationDays: number;
  type: PlanType;
  disciplineId?: number | null;
  active?: boolean;
}
