export type SessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface ClassSession {
  sessionId: number;
  instructorId: number;
  instructorFirstName: string;
  instructorLastName: string;
  roomId: number;
  roomName: string;
  startTime: string;
  endTime: string;
  days: DayOfWeek[];
  scheduledCount: number;
  title: string | null;
  status: SessionStatus;
  notes: string | null;
  createdAt: string;
}

export interface ClassSessionPayload {
  instructorId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  days: DayOfWeek[];
  title?: string;
  status?: SessionStatus;
  notes?: string;
}
