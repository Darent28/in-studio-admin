export interface Offer {
  offerId: number;
  planId: number;
  planName: string;
  discountPercent: number;
  dayOfWeek: number | null;
  startHour: string | null;
  endHour: string | null;
  active: boolean;
}

export interface OfferPayload {
  planId: number;
  discountPercent: number;
  dayOfWeek?: number | null;
  startHour?: string | null;
  endHour?: string | null;
  active?: boolean;
}
