export interface Room {
  roomId: number;
  name: string;
  capacity: number;
  location: string | null;
  equipment: string | null;
  active: boolean;
  layoutRows: number;
  layoutCols: number;
  layoutData: string | null;
}

export interface RoomPayload {
  name: string;
  capacity: number;
  location?: string;
  equipment?: string;
  active?: boolean;
  layoutRows?: number;
  layoutCols?: number;
  layoutData?: string;
}
