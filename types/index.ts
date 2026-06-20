// types/index.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  departmentId?: string;
  roleId?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: string;
  number: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
  qrCode?: string;
  metadata?: any;
  userId: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface BirthRecord {
  id: string;
  number: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  gender: string;
  fatherName: string;
  motherName: string;
  fatherProfession?: string;
  motherProfession?: string;
  address?: string;
  declarantName: string;
  declarantRelation: string;
  witness1?: string;
  witness2?: string;
  documentId?: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  validatedAt?: string;
  validatedBy?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
