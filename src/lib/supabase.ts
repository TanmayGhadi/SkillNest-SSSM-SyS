import { createClient } from '@supabase/supabase-js';
import type { Profile, Service, Order, AcademicResource, Complaint, Review, Notification, OrderMessage } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref') && 
  !supabaseAnonKey.includes('your-supabase-anon-key')
);

// Native Supabase Client if configured
const realSupabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Persistent Local Database Store for seamless evaluation if cloud keys are pending
const LOCAL_STORAGE_KEY = 'malvanskill_db_v1';

interface LocalDB {
  users: Array<{ id: string; email: string; password: string }>;
  profiles: Profile[];
  freelancer_profiles: any[];
  services: Service[];
  orders: Order[];
  order_messages: OrderMessage[];
  resources: AcademicResource[];
  reviews: Review[];
  notifications: Notification[];
  complaints: Complaint[];
  activeSessionUser: Profile | null;
}

const defaultCategories = [
  { id: 'cat-1', name: 'Web Development & Coding', slug: 'web-development', icon: 'Code2', description: 'Frontend UI, React, PHP, and project debugging assistance.' },
  { id: 'cat-2', name: 'CAD & Engineering Drafting', slug: 'cad-drafting', icon: 'Compass', description: 'AutoCAD 2D plans, Civil drawing sheets, and Mechanical models.' },
  { id: 'cat-3', name: 'PPT & Seminar Decks', slug: 'ppt-seminar', icon: 'Presentation', description: 'MSBTE formatted seminar presentations, slide styling, and defense notes.' },
  { id: 'cat-4', name: 'Academic Notes & PYQ Solutions', slug: 'notes-academic', icon: 'BookOpen', description: 'Curated chapter summaries and solved MSBTE previous year papers.' },
  { id: 'cat-5', name: 'Graphic & Poster Design', slug: 'graphic-design', icon: 'Palette', description: 'Departmental tech fest banners, event posters, and visual club branding.' },
  { id: 'cat-6', name: 'Lab Manual Documentation', slug: 'documentation', icon: 'FileText', description: 'Executed laboratory manual writeups and project report formatting.' }
];

function getLocalDB(): LocalDB {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading local DB', e);
  }
  // Initialize completely empty (ZERO fake users, ZERO fake orders, ZERO fake services)
  const emptyDB: LocalDB = {
    users: [],
    profiles: [],
    freelancer_profiles: [],
    services: [],
    orders: [],
    order_messages: [],
    resources: [],
    reviews: [],
    notifications: [],
    complaints: [],
    activeSessionUser: null
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(emptyDB));
  return emptyDB;
}

function saveLocalDB(db: LocalDB) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
}

// Local mock client conforming to Supabase JS SDK interface
class LocalSupabaseClient {
  public auth = {
    getUser: async () => {
      const db = getLocalDB();
      return { data: { user: db.activeSessionUser ? { id: db.activeSessionUser.id, email: db.activeSessionUser.email } : null }, error: null };
    },
    getSession: async () => {
      const db = getLocalDB();
      return { data: { session: db.activeSessionUser ? { user: { id: db.activeSessionUser.id } } : null }, error: null };
    },
    signUp: async ({ email, password, options }: any) => {
      const db = getLocalDB();
      if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { data: null, error: { message: 'Email already registered in GPM Malvan platform.' } };
      }
      if (options?.data?.enrollment_no && db.profiles.some(p => p.enrollment_no === options.data.enrollment_no)) {
        return { data: null, error: { message: 'Student Enrollment Number already exists.' } };
      }
      const newUserId = 'usr_' + Math.random().toString(36).substring(2, 9);
      db.users.push({ id: newUserId, email, password });
      
      const newProfile: Profile = {
        id: newUserId,
        email,
        full_name: options?.data?.full_name || 'Student',
        enrollment_no: options?.data?.enrollment_no || 'GPM-' + Math.floor(1000 + Math.random() * 9000),
        department: options?.data?.department || 'Computer Engineering',
        year: options?.data?.year || 'TY',
        phone: options?.data?.phone || '',
        bio: '',
        avatar_url: '',
        role: 'student',
        is_freelancer: false,
        created_at: new Date().toISOString()
      };
      db.profiles.push(newProfile);
      db.activeSessionUser = newProfile;
      saveLocalDB(db);
      return { data: { user: { id: newUserId, email } }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      const db = getLocalDB();
      // Built-in Admin quick check or registered user
      if (email === 'admin@gpmalvan.ac.in' && password === 'admin123') {
        let adminProfile = db.profiles.find(p => p.role === 'admin');
        if (!adminProfile) {
          adminProfile = {
            id: 'admin_gpm',
            email: 'admin@gpmalvan.ac.in',
            full_name: 'Prof. S. Rane (Admin)',
            enrollment_no: 'FACULTY-01',
            department: 'Academic Affairs',
            year: 'TY',
            role: 'admin',
            is_freelancer: false,
            created_at: new Date().toISOString()
          };
          db.profiles.push(adminProfile);
        }
        db.activeSessionUser = adminProfile;
        saveLocalDB(db);
        return { data: { user: { id: adminProfile.id, email: adminProfile.email } }, error: null };
      }

      const match = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!match) {
        return { data: null, error: { message: 'Invalid student email or password.' } };
      }
      const profile = db.profiles.find(p => p.id === match.id);
      db.activeSessionUser = profile || null;
      saveLocalDB(db);
      return { data: { user: { id: match.id, email: match.email } }, error: null };
    },
    signOut: async () => {
      const db = getLocalDB();
      db.activeSessionUser = null;
      saveLocalDB(db);
      return { error: null };
    }
  };

  public from(table: string) {
    const db = getLocalDB();

    return {
      select: (fields: string = '*') => ({
        eq: (col: string, val: any) => ({
          single: async () => {
            const list = (db as any)[table] || [];
            const item = list.find((x: any) => x[col] === val);
            return { data: item || null, error: null };
          },
          order: () => Promise.resolve({ data: ((db as any)[table] || []).filter((x: any) => x[col] === val), error: null }),
          then: (resolve: any) => resolve({ data: ((db as any)[table] || []).filter((x: any) => x[col] === val), error: null })
        }),
        order: (col: string, { ascending = true }: any = {}) => ({
          then: (resolve: any) => {
            const list = [...((db as any)[table] || [])];
            list.sort((a, b) => ascending ? (a[col] > b[col] ? 1 : -1) : (a[col] < b[col] ? 1 : -1));
            resolve({ data: list, error: null });
          }
        }),
        then: (resolve: any) => {
          if (table === 'service_categories') {
            resolve({ data: defaultCategories, error: null });
          } else {
            resolve({ data: (db as any)[table] || [], error: null });
          }
        }
      }),
      insert: async (records: any) => {
        const list = (db as any)[table] || [];
        const items = Array.isArray(records) ? records : [records];
        items.forEach(item => {
          if (!item.id) item.id = 'rec_' + Math.random().toString(36).substring(2, 9);
          if (!item.created_at) item.created_at = new Date().toISOString();
          list.unshift(item);
        });
        (db as any)[table] = list;
        saveLocalDB(db);
        return { data: items, error: null };
      },
      update: (updates: any) => ({
        eq: async (col: string, val: any) => {
          const list = (db as any)[table] || [];
          const idx = list.findIndex((x: any) => x[col] === val);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
            (db as any)[table] = list;
            saveLocalDB(db);
            return { data: list[idx], error: null };
          }
          return { data: null, error: { message: 'Item not found' } };
        }
      }),
      delete: () => ({
        eq: async (col: string, val: any) => {
          const list = (db as any)[table] || [];
          (db as any)[table] = list.filter((x: any) => x[col] !== val);
          saveLocalDB(db);
          return { data: null, error: null };
        }
      })
    };
  }

  public storage = {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        // Return simulated data URL or local object URL
        const simulatedUrl = URL.createObjectURL(file);
        return { data: { path, publicUrl: simulatedUrl }, error: null };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: path } };
      }
    })
  };
}

export const supabase = realSupabase || (new LocalSupabaseClient() as any);
export const isUsingCloudSupabase = isConfigured;
export { defaultCategories };
