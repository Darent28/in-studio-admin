export type ReportType =
  | 'CLIENT_ALERTS'
  | 'CLIENT_ASSISTANCE_PER_CLASS'
  | 'CASH_REGISTER_INCOME_SPENT'
  | 'CLIENTS_QUANTITY_PER_CLASS'
  | 'DUE'
  | 'SPENTS'
  | 'CLIENTS_INFORMATION'
  | 'INCOME_PER_MEMBERSHIP'
  | 'ON_HOLD_PER_CLASS'
  | 'ON_HOLD_PER_CLIENT'
  | 'TRIAL_MEMBERSHIPS'
  | 'AUTOMATIC_MESSAGES'
  | 'INVENTORY_MOVEMENT'
  | 'NOTIFICATIONS'
  | 'STAFF_PAYMENT_CLASS'
  | 'STAFF_PAYMENT_COMMISSION'
  | 'STAFF_PAYMENT_SALARY'
  | 'STAFF_PAYMENT_HOUR'
  | 'USERS_ACTIVE_INACTIVE'
  | 'BOOKINGS'
  | 'MEMBERSHIP_SELLS'
  | 'SELLS_PER_PLAN'
  | 'CLIENT_INCOME_REGISTRY'
  | 'INCOME_OUTCOME_PER_STAFF';

export const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'CLIENT_ALERTS', label: 'Client alerts' },
  { value: 'CLIENT_ASSISTANCE_PER_CLASS', label: 'Client assistance per class' },
  { value: 'CASH_REGISTER_INCOME_SPENT', label: 'Cash register income-spent' },
  { value: 'CLIENTS_QUANTITY_PER_CLASS', label: 'Clients quantity per class' },
  { value: 'DUE', label: 'Due' },
  { value: 'SPENTS', label: 'Spents' },
  { value: 'CLIENTS_INFORMATION', label: 'Clients information' },
  { value: 'INCOME_PER_MEMBERSHIP', label: 'Income - cash register per membership' },
  { value: 'ON_HOLD_PER_CLASS', label: 'On hold status list per class' },
  { value: 'ON_HOLD_PER_CLIENT', label: 'On hold status list per client' },
  { value: 'TRIAL_MEMBERSHIPS', label: 'Assigned trial memberships' },
  { value: 'AUTOMATIC_MESSAGES', label: 'Send automatic messages' },
  { value: 'INVENTORY_MOVEMENT', label: 'Inventory movement' },
  { value: 'NOTIFICATIONS', label: 'Notifications' },
  { value: 'STAFF_PAYMENT_CLASS', label: 'Staff payment - class' },
  { value: 'STAFF_PAYMENT_COMMISSION', label: 'Staff payment - commission' },
  { value: 'STAFF_PAYMENT_SALARY', label: 'Staff payment - salary' },
  { value: 'STAFF_PAYMENT_HOUR', label: 'Staff payment - hour' },
  { value: 'USERS_ACTIVE_INACTIVE', label: 'Users active - inactive' },
  { value: 'BOOKINGS', label: 'Bookings' },
  { value: 'MEMBERSHIP_SELLS', label: 'Membership sells' },
  { value: 'SELLS_PER_PLAN', label: 'Sells per plan' },
  { value: 'CLIENT_INCOME_REGISTRY', label: 'Client income registry' },
  { value: 'INCOME_OUTCOME_PER_STAFF', label: 'Income/outcome registry per personal' },
];

// Report types with a real backend implementation today. Everything else in
// REPORT_TYPES needs new tables (inventory, payroll, expenses, notifications,
// messaging) before it can be built — see the reports implementation plan.
export const AVAILABLE_REPORT_TYPES: ReadonlySet<ReportType> = new Set<ReportType>([
  'BOOKINGS',
  'CLIENTS_QUANTITY_PER_CLASS',
  'ON_HOLD_PER_CLASS',
  'ON_HOLD_PER_CLIENT',
  'CLIENTS_INFORMATION',
  'USERS_ACTIVE_INACTIVE',
  'MEMBERSHIP_SELLS',
  'SELLS_PER_PLAN',
  'CLIENT_INCOME_REGISTRY',
  'DUE',
  'CLIENT_ALERTS',
]);

// Report types where filtering by room is meaningful (class-scoped reports).
export const ROOM_FILTERABLE_REPORT_TYPES: ReadonlySet<ReportType> = new Set<ReportType>([
  'BOOKINGS',
  'CLIENTS_QUANTITY_PER_CLASS',
  'ON_HOLD_PER_CLASS',
  'ON_HOLD_PER_CLIENT',
]);

export interface ReportFilters {
  type: ReportType;
  roomId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ReportResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
}
