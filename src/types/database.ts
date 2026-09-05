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
  | 'accepted'
  | 'in_progress'
  | 'submitted'
  | 'revision_requested'
  | 'completed'
  | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  enrollment_no: string;
  email: string;
  department: string;
  year: AcademicYear;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  role: UserRole;
  is_freelancer: boolean;
  created_at: string;
}

export interface FreelancerProfile {
  id: string;
  headline: string;
  bio: string;
  specializations: string[];
  skills: string[];
  hourly_rate: number;
  rating_avg: number;
  rating_count: number;
  completed_orders: number;
  available: boolean;
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
  images: string[];
  status: 'active' | 'paused' | 'archived';
  created_at: string;
  freelancer?: Profile;
  category?: ServiceCategory;
}

export interface Order {
  id: string;
  order_no: string;
  service_id?: string;
  student_id: string;
  freelancer_id: string;
  service_title: string;
  amount: number;
  status: OrderStatus;
  deadline: string;
  requirements: string;
  created_at: string;
  completed_at?: string;
  student?: Profile;
  freelancer?: Profile;
  submissions?: Submission[];
  revisions?: Revision[];
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
}

export interface Revision {
  id: string;
  order_id: string;
  student_id: string;
  feedback: string;
  status: 'pending' | 'fulfilled';
  created_at: string;
}

export interface AcademicResource {
  id: string;
  uploader_id: string;
  title: string;
  subject: string;
  department: string;
  semester: string;
  resource_type: 'Notes' | 'PYQs' | 'Manuals' | 'Syllabus' | 'Other';
  file_url: string;
  file_name: string;
  file_size: string;
  downloads_count: number;
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
