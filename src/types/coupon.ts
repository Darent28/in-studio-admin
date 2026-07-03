export interface Coupon {
  couponId: number;
  code: string;
  discountPercent: number;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  planIds: number[];
  planNames: string[];
}

export interface CouponPayload {
  code: string;
  discountPercent: number;
  active?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  planIds?: number[];
}
