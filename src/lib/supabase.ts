import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgtqbffzehpdbfrimbmz.supabase.co';
const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_qCCE6hsD8Gs_g33Pq05QVQ_JJwcKvUn';

export const isUsingCloudSupabase = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const defaultCategories = [
  { id: 'cat-1', name: 'Web Development & Coding', slug: 'web-development', icon: 'Code2', description: 'Frontend UI, React, PHP, and project debugging assistance.' },
  { id: 'cat-2', name: 'CAD & Engineering Drafting', slug: 'cad-drafting', icon: 'Compass', description: 'AutoCAD 2D plans, Civil drawing sheets, and Mechanical models.' },
  { id: 'cat-3', name: 'PPT & Seminar Decks', slug: 'ppt-seminar', icon: 'Presentation', description: 'MSBTE formatted seminar presentations, slide styling, and defense notes.' },
  { id: 'cat-4', name: 'Academic Notes & PYQ Solutions', slug: 'notes-academic', icon: 'BookOpen', description: 'Curated chapter summaries and solved MSBTE previous year papers.' },
  { id: 'cat-5', name: 'Graphic & Poster Design', slug: 'graphic-design', icon: 'Palette', description: 'Departmental tech fest banners, event posters, and visual club branding.' },
  { id: 'cat-6', name: 'Lab Manual Documentation', slug: 'documentation', icon: 'FileText', description: 'Executed laboratory manual writeups and project report formatting.' }
];

