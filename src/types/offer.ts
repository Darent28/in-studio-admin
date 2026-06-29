export interface Offer {
  offerId: number;
  planId: number;
  planName: string;
  discountPercent: number;
  /** Bitmask: bit 0 = Mon, bit 1 = Tue, … bit 6 = Sun. null/0 = no day filter. */
  daysOfWeek: number | null;
  startDate: string | null;
  endDate: string | null;
  startHour: string | null;
  endHour: string | null;
  active: boolean;
}

export interface OfferPayload {
  planId: number;
  discountPercent: number;
  daysOfWeek?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  startHour?: string | null;
  endHour?: string | null;
  active?: boolean;
}
