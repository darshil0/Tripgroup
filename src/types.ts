export enum TripStatus {
  PLANNING = 'planning',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ParticipantRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum ParticipantStatus {
  INVITED = 'invited',
  JOINED = 'joined',
  DECLINED = 'declined'
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: any;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  budget: number;
  groupSize: number; // Added groupSize
  status: TripStatus;
  adminId: string;
  createdAt: any;
  updatedAt: any;
  totalAmountDue?: number;
  paidAmount?: number;
}

export interface Participant {
  id?: string;
  userId: string;
  displayName: string;
  photoURL?: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  paid: boolean;
  amountPaid: number;
  insuranceSelected?: boolean;
  joinedAt?: any;
}

export interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: any;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: any;
  completed: boolean;
  createdAt: any;
  createdBy: string;
}

export interface TripDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedById: string;
  createdAt: number;
}
