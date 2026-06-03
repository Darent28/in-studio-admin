export type UserRole = 'CLIENT' | 'ADMIN' | 'STAFF';

export interface AdminUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthdate: string | null;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  birthdate?: string;
  role?: UserRole;
  active?: boolean;
}
