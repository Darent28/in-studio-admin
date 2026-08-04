export interface Attendee {
  reservationId: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  status: 'RESERVED' | 'ON_HOLD';
  spotNumber: string | null;
}

export interface SessionSchedule {
  sessionId: number;
  title: string | null;
  instructorId: number;
  instructorFirstName: string;
  instructorLastName: string;
  roomName: string;
  startTime: string;
  endTime: string;
  capacity: number;
  reservedCount: number;
  onHoldCount: number;
  attendees: Attendee[];
}
