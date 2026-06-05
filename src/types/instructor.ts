export interface Instructor {
  instructorId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string | null;
  bio: string | null;
  active: boolean;
}

export interface InstructorPayload {
  userId: number;
  bio?: string;
  specialty?: string;
}

export interface InstructorUpdatePayload {
  bio?: string;
  specialty?: string;
  active?: boolean;
}

export interface UserSearchResult {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
}
