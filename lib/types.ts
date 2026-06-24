export interface Resident {
  id: string;
  name: string;
  apartment: string;
  tower: string;
  email: string;
  phone: string;
  avatar: string;
  balance: number; // outstanding balance
}

export type PaymentStatus = 'pending' | 'paid' | 'under_review';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash';

export interface Payment {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  category: 'maintenance' | 'amenity' | 'fine' | 'other';
  reference?: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  proofFile?: string; // simulator file name
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  iconName: string; // name of Lucide icon
  hourlyRate: number;
  capacity: number;
  rules: string[];
  image: string;
  requiresReview: boolean;
}

export interface Booking {
  id: string;
  amenityId: string;
  amenityName: string; // denormalized for ease
  date: string;
  timeSlot: string; // e.g. "14:00 - 16:00"
  durationHours: number;
  totalCost: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  residentId: string;
  guestCount: number;
  createdAt: string;
  qrCode?: string; // simulated QR token
}

export type IncidentCategory = 'plumbing' | 'electricity' | 'elevator' | 'security' | 'common_area' | 'other';
export type IncidentPriority = 'low' | 'medium' | 'high';
export type IncidentStatus = 'reported' | 'assigned' | 'in_progress' | 'resolved';

export interface IncidentComment {
  id: string;
  authorName: string;
  authorRole: 'resident' | 'admin' | 'technician';
  content: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  location: string;
  description: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  images: string[]; // simulation base64 or names
  comments: IncidentComment[];
  technicianName?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'info' | 'maintenance' | 'urgente' | 'event';
  author: string;
  isRead?: boolean;
}
