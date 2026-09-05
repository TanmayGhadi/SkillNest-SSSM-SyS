-- ============================================================================
-- SKILLNEST — POSTGRESQL PRODUCTION SCHEMA FOR SUPABASE
-- Institution: Government Polytechnic Malvan (GPM Malvan)
-- Project: Student Skill & Service Management System (SSSM)
-- Tagline: "By GPM Students, For GPM Students."
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES TABLE (Linked 1-to-1 with Supabase auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  enrollment_no TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL CHECK (department IN (
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Food Technology',
    'Science & Humanities',
    'Workshop'
  )),
  year TEXT NOT NULL CHECK (year IN ('FY', 'SY', 'TY')),
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_freelancer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_enrollment ON public.profiles(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);

-- ============================================================================
-- 2. FREELANCER PROFILES TABLE (Linked 1-to-1 with public.profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline TEXT DEFAULT 'GPM Student Freelancer',
  bio TEXT,
  specializations TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC(10,2) DEFAULT 150.00,
  rating_avg NUMERIC(3,2) DEFAULT 0.00,
  rating_count INT DEFAULT 0,
  completed_orders INT DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_freelancer_user_id ON public.freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_rating ON public.freelancer_profiles(rating_avg DESC);

-- ============================================================================
-- 3. SKILLS MASTER TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. STUDENT SKILLS (Many-to-Many join between profiles and skills)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.student_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level TEXT DEFAULT 'Intermediate' CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_student_skills_student ON public.student_skills(student_id);

-- ============================================================================
-- 5. SERVICE CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT 'Layers',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. SERVICES TABLE (Created by registered student freelancers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  delivery_days INT NOT NULL DEFAULT 2 CHECK (delivery_days >= 1),
  skills TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  requirements TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_freelancer ON public.services(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status);

-- ============================================================================
-- 7. SERVICE REQUESTS TABLE (Initial inquiries before order conversion)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requirements TEXT NOT NULL,
  deadline DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'converted_to_order')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_student ON public.service_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_freelancer ON public.service_requests(freelancer_id);

-- ============================================================================
-- 8. ORDERS TABLE (Unified Order & Request Workflow)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT UNIQUE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'submitted', 'revision_requested', 'completed', 'cancelled')),
  deadline DATE NOT NULL,
  requirements TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_student ON public.orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_freelancer ON public.orders(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ============================================================================
-- 9. ORDER FILES TABLE (Requirement files & attachments uploaded by students)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_files_order ON public.order_files(order_id);

-- ============================================================================
-- 10. SUBMISSIONS TABLE (Freelancer Work Deliverables)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notes TEXT,
  file_url TEXT,
  file_name TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_order ON public.submissions(order_id);

-- ============================================================================
-- 11. REVISIONS TABLE (Student Revision Requests)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revisions_order ON public.revisions(order_id);

-- ============================================================================
-- 12. MESSAGES TABLE (Real-time student-to-freelancer communications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_order ON public.messages(order_id);

-- ============================================================================
-- 13. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'order', 'message', 'review', 'system')),
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- ============================================================================
-- 14. RESOURCES TABLE (MSBTE Academic Vault for GPM Malvan)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN (
    'Civil Engineering',
    'Computer Engineering',
    'Electrical Engineering',
    'Electronics and Communication Engineering',
    'Mechanical Engineering',
    'Food Technology',
    'Science & Humanities',
    'Workshop'
  )),
  semester TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('Notes', 'PYQs', 'Manuals', 'Study Material', 'Reference Material', 'Syllabus', 'Other')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size TEXT DEFAULT '2.5 MB',
  downloads_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_department ON public.resources(department);
CREATE INDEX IF NOT EXISTS idx_resources_semester ON public.resources(semester);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(resource_type);

-- ============================================================================
-- 15. RESOURCE DOWNLOADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.resource_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_downloads_res ON public.resource_downloads(resource_id);

-- ============================================================================
-- 16. REVIEWS TABLE (Peer Ratings for Completed Orders)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_freelancer ON public.reviews(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON public.reviews(service_id);

-- ============================================================================
-- 17. COMPLAINTS TABLE (Academic Grievance Desk)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved')),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_user ON public.complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);

-- ============================================================================
-- 18. FAVORITES TABLE (Saved Services)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

-- ============================================================================
-- AUTOMATED PROFILE CREATION ON SUPABASE AUTH SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    enrollment_no,
    email,
    department,
    year,
    phone
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'GPM Student'),
    COALESCE(new.raw_user_meta_data->>'enrollment_no', 'GPM-' || substr(new.id::text, 1, 6)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'department', 'Computer Engineering'),
    COALESCE(new.raw_user_meta_data->>'year', 'TY'),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Freelancer Profiles Policies
CREATE POLICY "Freelancer profiles are viewable by everyone" ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Freelancers can manage own profile" ON public.freelancer_profiles FOR ALL USING (auth.uid() = user_id);

-- Skills & Categories (Public read, admin write)
CREATE POLICY "Skills readable by all" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admin can manage skills" ON public.skills FOR ALL USING (public.is_admin());

CREATE POLICY "Categories readable by all" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.service_categories FOR ALL USING (public.is_admin());

-- Student Skills Policies
CREATE POLICY "Student skills viewable by all" ON public.student_skills FOR SELECT USING (true);
CREATE POLICY "Students manage own skills" ON public.student_skills FOR ALL USING (auth.uid() = student_id);

-- Services Policies
CREATE POLICY "Active services are viewable by everyone" ON public.services FOR SELECT USING (is_active = true OR auth.uid() = freelancer_id OR public.is_admin());
CREATE POLICY "Freelancers manage own services" ON public.services FOR ALL USING (auth.uid() = freelancer_id);

-- Service Requests Policies
CREATE POLICY "Requests viewable by participants" ON public.service_requests FOR SELECT USING (auth.uid() = student_id OR auth.uid() = freelancer_id OR public.is_admin());
CREATE POLICY "Students can create service requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Participants can update service requests" ON public.service_requests FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = freelancer_id);

-- Orders Policies
CREATE POLICY "Orders viewable by participants and admin" ON public.orders FOR SELECT USING (auth.uid() = student_id OR auth.uid() = freelancer_id OR public.is_admin());
CREATE POLICY "Students can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Participants can update orders" ON public.orders FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = freelancer_id OR public.is_admin());

-- Order Files Policies
CREATE POLICY "Order files viewable by order participants" ON public.order_files FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = order_files.order_id AND (student_id = auth.uid() OR freelancer_id = auth.uid() OR public.is_admin())));
CREATE POLICY "Participants can upload order files" ON public.order_files FOR INSERT 
  WITH CHECK (auth.uid() = uploader_id AND EXISTS (SELECT 1 FROM public.orders WHERE id = order_files.order_id AND (student_id = auth.uid() OR freelancer_id = auth.uid())));

-- Submissions Policies
CREATE POLICY "Submissions viewable by order participants" ON public.submissions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = submissions.order_id AND (student_id = auth.uid() OR freelancer_id = auth.uid() OR public.is_admin())));
CREATE POLICY "Freelancers can insert submissions" ON public.submissions FOR INSERT 
  WITH CHECK (auth.uid() = freelancer_id AND EXISTS (SELECT 1 FROM public.orders WHERE id = submissions.order_id AND freelancer_id = auth.uid()));

-- Revisions Policies
CREATE POLICY "Revisions viewable by order participants" ON public.revisions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.orders WHERE id = revisions.order_id AND (student_id = auth.uid() OR freelancer_id = auth.uid() OR public.is_admin())));
CREATE POLICY "Students can request revisions" ON public.revisions FOR INSERT 
  WITH CHECK (auth.uid() = student_id AND EXISTS (SELECT 1 FROM public.orders WHERE id = revisions.order_id AND student_id = auth.uid()));

-- Messages Policies
CREATE POLICY "Messages viewable by sender or receiver" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id OR public.is_admin());
CREATE POLICY "Authenticated users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receiver can mark message as read" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Notifications Policies
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Academic Resources Policies
CREATE POLICY "Resources viewable by everyone" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Authenticated students can upload resources" ON public.resources FOR INSERT WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "Uploaders and admin can delete resources" ON public.resources FOR DELETE USING (auth.uid() = uploader_id OR public.is_admin());

-- Resource Downloads Policies
CREATE POLICY "Downloads viewable by admin and resource uploader" ON public.resource_downloads FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin() OR EXISTS (SELECT 1 FROM public.resources WHERE id = resource_downloads.resource_id AND uploader_id = auth.uid()));
CREATE POLICY "Anyone can record a download" ON public.resource_downloads FOR INSERT WITH CHECK (true);

-- Reviews Policies
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Students can review orders they completed" ON public.reviews FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id AND EXISTS (SELECT 1 FROM public.orders WHERE id = reviews.order_id AND student_id = auth.uid() AND status = 'completed'));

-- Complaints Policies
CREATE POLICY "Users can view own complaints, admin can view all" ON public.complaints FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can submit complaints" ON public.complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can update complaints" ON public.complaints FOR UPDATE USING (public.is_admin());

-- Favorites Policies
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('services', 'services', true),
  ('resources', 'resources', true),
  ('orders', 'orders', false),
  ('submissions', 'submissions', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage RLS
CREATE POLICY "Avatars are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Service images are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'services');
CREATE POLICY "Freelancers can upload service images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'services' AND auth.role() = 'authenticated');

CREATE POLICY "Resources are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'resources');
CREATE POLICY "Students can upload academic resources" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resources' AND auth.role() = 'authenticated');

CREATE POLICY "Order files accessible by authenticated users" ON storage.objects FOR ALL USING (bucket_id = 'orders' AND auth.role() = 'authenticated');
CREATE POLICY "Submissions accessible by authenticated users" ON storage.objects FOR ALL USING (bucket_id = 'submissions' AND auth.role() = 'authenticated');

-- ============================================================================
-- INITIAL SERVICE CATEGORIES SEEDS (Government Polytechnic Malvan)
-- ============================================================================
INSERT INTO public.service_categories (name, slug, icon, description) VALUES
  ('Projects & Development', 'projects-development', 'Code', 'Final year diploma capstone projects, React, Python, PHP, Arduino, and IoT hardware prototyping.'),
  ('CAD & Engineering Drafting', 'cad-drafting', 'Compass', 'AutoCAD 2D structural plans, Civil survey drawings, and Mechanical SolidWorks 3D models.'),
  ('PPT & Seminar Decks', 'ppt-seminar', 'Presentation', 'MSBTE syllabus formatted technical seminar slides, defense notes, and executive summaries.'),
  ('Academic Notes & PYQ Solutions', 'notes-academic', 'BookOpen', 'Curated chapter summaries and step-by-step solved MSBTE previous year papers.'),
  ('Graphic & Media Design', 'graphic-media', 'Palette', 'Departmental tech fest posters, cultural banners, and visual club branding.'),
  ('Lab Manual & Documentation', 'lab-documentation', 'FileText', 'Laboratory manual writeups, calculation charts, and formal project report formatting.')
ON CONFLICT (slug) DO NOTHING;
