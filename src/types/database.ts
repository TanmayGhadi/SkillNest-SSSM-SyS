export type UserRole = 'student' | 'admin';
export type AcademicYear = 'FY' | 'SY' | 'TY';

export const GPM_DEPARTMENTS = [
  'Civil Engineering',
  'Computer Engineering',
  'Electrical Engineering',
  'Electronics and Communication Engineering',
  'Mechanical Engineering',
  'Food Technology',
  'Science & Humanities',
  'Workshop',
] as const;

export type GPMDepartment = typeof GPM_DEPARTMENTS[number];

export type OrderStatus = 
  | 'requested'
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'submitted'
  | 'revision_requested'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  student_id?: string;
  enrollment_no: string;
  email: string;
  department: string;
  year: AcademicYear;
  year_of_study?: string;
  semester?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  role: UserRole;
  is_freelancer: boolean;
  created_at: string;
  updated_at?: string;
}

export interface FreelancerProfile {
  id: string;
  user_id?: string;
  profile_id?: string;
  title?: string;
  headline: string;
  bio: string;
  specializations: string[];
  skills: string[];
  hourly_rate: number;
  rating_avg: number;
  rating?: number;
  rating_count: number;
  reviews_count?: number;
  completed_orders: number;
  completed_orders_count?: number;
  available: boolean;
  is_verified?: boolean;
  profile?: Profile;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface Service {
  id: string;
  freelancer_id: string;
  category_id?: string;
  title: string;
  description: string;
  price: number;
  delivery_days: number;
  skills: string[];
  tags?: string[];
  images: string[];
  cover_image?: string;
  is_active?: boolean;
  revisions_allowed?: number;
  rating?: number;
  reviews_count?: number;
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  freelancer?: any;
  category?: any;
}

export interface Order {
  id: string;
  order_no: string;
  service_id?: string;
  student_id: string;
  freelancer_id: string;
  service_title: string;
  title?: string;
  amount: number;
  agreed_price?: number;
  attachment_url?: string;
  status: OrderStatus;
  deadline: string;
  requirements: string;
  created_at: string;
  completed_at?: string;
  student?: Profile;
  freelancer?: any;
  submissions?: Submission[];
  latest_submission?: Submission;
  revisions?: Revision[];
  latest_revision?: Revision;
}

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Submission {
  id: string;
  order_id: string;
  freelancer_id: string;
  notes?: string;
  file_url?: string;
  file_name?: string;
  submitted_at: string;
  created_at?: string;
}

export interface Revision {
  id: string;
  order_id: string;
  student_id: string;
  feedback: string;
  notes?: string;
  status: 'pending' | 'fulfilled';
  created_at: string;
}

export interface AcademicResource {
  id: string;
  uploader_id: string;
  title: string;
  description?: string;
  subject: string;
  department: string;
  semester: string;
  resource_type: 'Notes' | 'PYQs' | 'Manuals' | 'Syllabus' | 'Other';
  file_url: string;
  file_name: string;
  file_size: string;
  downloads_count: number;
  downloads?: number;
  created_at: string;
  uploader?: Profile;
}

export interface Review {
  id: string;
  order_id: string;
  service_id?: string;
  reviewer_id: string;
  freelancer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface Complaint {
  id: string;
  user_id: string;
  order_id?: string;
  subject: string;
  description: string;
  category: string;
  status: 'pending' | 'investigating' | 'resolved';
  resolution_notes?: string;
  created_at: string;
  user?: Profile;
}
