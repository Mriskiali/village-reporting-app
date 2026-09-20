export enum Role {
  PETUGAS = 'PETUGAS',
  ADMIN = 'ADMIN'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum ReportCategory {
  KEBERSIHAN = 'KEBERSIHAN',
  KERUSAKAN = 'KERUSAKAN',
  TAMAN = 'TAMAN',
  SALURAN = 'SALURAN',
  LAINNYA = 'LAINNYA'
}

export interface User {
  id: string;
  pjlpNumber: string;
  name: string;
  role: Role;
  isActive: boolean;
  phone?: string;
  avatarUrl?: string;
  password?: string;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  category: ReportCategory;
  description: string;
  imageUrl: string;
  location: string;
  coordinates?: [number, number];
  status: ReportStatus;
  createdAt: string;
  feedback?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}