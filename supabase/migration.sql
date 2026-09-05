-- ============================================================================
-- SKILLNEST — POSTGRESQL PRODUCTION MIGRATION FOR SUPABASE
-- Institution: Government Polytechnic Malvan (GPM Malvan)
-- Project: Student Skill & Service Management System (SSSM)
-- Copy and paste this script directly into Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Profiles Table (Linked 1-to-1 with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  enrollment_no TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL DEFAULT 'TY',
  semester TEXT NOT NULL DEFAULT 'Sem 5',
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_freelancer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_enrollment_no ON public.profiles(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Create Freelancer Profiles Table
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

-- 4. Create Service Categories Table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT 'Layers',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Categories
INSERT INTO public.service_categories (name, slug, icon, description)
VALUES
  ('Web Development & Coding', 'web-development', 'Code2', 'Frontend UI, React, PHP, and project debugging assistance.'),
  ('CAD & Engineering Drafting', 'cad-drafting', 'Compass', 'AutoCAD 2D plans, Civil drawing sheets, and Mechanical models.'),
  ('PPT & Seminar Decks', 'ppt-seminar', 'Presentation', 'MSBTE formatted seminar presentations, slide styling, and defense notes.'),
  ('Academic Notes & PYQ Solutions', 'notes-academic', 'BookOpen', 'Curated chapter summaries and solved MSBTE previous year papers.'),
  ('Graphic & Poster Design', 'graphic-design', 'Palette', 'Departmental tech fest banners, event posters, and visual club branding.'),
  ('Lab Manual Documentation', 'documentation', 'FileText', 'Executed laboratory manual writeups and project report formatting.')
ON CONFLICT (slug) DO NOTHING;

-- 5. Create Services Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 100.00 CHECK (price >= 0),
  delivery_days INT NOT NULL DEFAULT 2 CHECK (delivery_days >= 1),
  skills TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_freelancer ON public.services(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category_id);

-- 6. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT UNIQUE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('requested', 'pending', 'accepted', 'in_progress', 'submitted', 'revision_requested', 'completed', 'cancelled')),
  deadline DATE,
  requirements TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_student ON public.orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_freelancer ON public.orders(freelancer_id);

-- 7. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- 8. Create Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

-- 9. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_freelancer ON public.reviews(freelancer_id);

-- 10. Automated Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_student_id TEXT;
  v_enrollment_no TEXT;
  v_full_name TEXT;
  v_department TEXT;
  v_year TEXT;
  v_semester TEXT;
  v_phone TEXT;
BEGIN
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', 'GPM Student');
  v_student_id := COALESCE(
    new.raw_user_meta_data->>'student_id',
    new.raw_user_meta_data->>'enrollment_no',
    'GPM-' || UPPER(substr(md5(random()::text), 1, 8))
  );
  v_enrollment_no := COALESCE(
    new.raw_user_meta_data->>'enrollment_no',
    new.raw_user_meta_data->>'student_id',
    v_student_id
  );
  v_department := COALESCE(new.raw_user_meta_data->>'department', 'Computer Engineering');
  v_year := COALESCE(new.raw_user_meta_data->>'year', 'TY');
  v_semester := COALESCE(new.raw_user_meta_data->>'semester', 'Sem 5');
  v_phone := COALESCE(new.raw_user_meta_data->>'phone', '');

  INSERT INTO public.profiles (
    id,
    full_name,
    student_id,
    enrollment_no,
    email,
    department,
    year,
    semester,
    phone,
    role,
    is_freelancer
  )
  VALUES (
    new.id,
    v_full_name,
    v_student_id,
    v_enrollment_no,
    new.email,
    v_department,
    v_year,
    v_semester,
    v_phone,
    'student',
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never let profile insert abort the auth.users signup
  RAISE WARNING 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 12. RLS Policies
-- Profiles: readable by all, writable by user
DROP POLICY IF EXISTS "Public profiles viewable by all" ON public.profiles;
CREATE POLICY "Public profiles viewable by all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Freelancer Profiles: readable by all, managed by owner
DROP POLICY IF EXISTS "Freelancer profiles viewable by all" ON public.freelancer_profiles;
CREATE POLICY "Freelancer profiles viewable by all" ON public.freelancer_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Freelancers can manage own profile" ON public.freelancer_profiles;
CREATE POLICY "Freelancers can manage own profile" ON public.freelancer_profiles FOR ALL USING (auth.uid() = user_id);

-- Categories: readable by all
DROP POLICY IF EXISTS "Categories viewable by all" ON public.service_categories;
CREATE POLICY "Categories viewable by all" ON public.service_categories FOR SELECT USING (true);

-- Services: readable by all, managed by freelancer
DROP POLICY IF EXISTS "Services viewable by all" ON public.services;
CREATE POLICY "Services viewable by all" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Freelancers manage own services" ON public.services;
CREATE POLICY "Freelancers manage own services" ON public.services FOR ALL USING (auth.uid() = freelancer_id);

-- Orders: viewable by participants, insertable by students
DROP POLICY IF EXISTS "Orders viewable by participants" ON public.orders;
CREATE POLICY "Orders viewable by participants" ON public.orders FOR SELECT USING (auth.uid() = student_id OR auth.uid() = freelancer_id);

DROP POLICY IF EXISTS "Students can create orders" ON public.orders;
CREATE POLICY "Students can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Participants can update orders" ON public.orders;
CREATE POLICY "Participants can update orders" ON public.orders FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = freelancer_id);

-- Notifications: managed by owner
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Favorites: managed by owner
DROP POLICY IF EXISTS "Users manage own favorites" ON public.favorites;
CREATE POLICY "Users manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- Reviews: viewable by all, insertable by student
DROP POLICY IF EXISTS "Reviews viewable by all" ON public.reviews;
CREATE POLICY "Reviews viewable by all" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Students can add reviews" ON public.reviews;
CREATE POLICY "Students can add reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
