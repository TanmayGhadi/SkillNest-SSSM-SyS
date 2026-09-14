import { 
  INITIAL_CATEGORIES, 
  INITIAL_PROFILES, 
  INITIAL_FREELANCERS, 
  INITIAL_SERVICES, 
  INITIAL_ORDERS, 
  INITIAL_RESOURCES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_REVIEWS 
} from './localData';

export const isUsingCloudSupabase = false;

// Storage key prefixes
const DB_PREFIX = 'skillnest_db_';
const AUTH_KEY = 'skillnest_auth_session';

// Initialize default local storage tables if not present
function initializeDatabase() {
  if (typeof window === 'undefined') return;

  const initTable = (key: string, defaultData: any) => {
    const fullKey = DB_PREFIX + key;
    if (!localStorage.getItem(fullKey)) {
      try {
        localStorage.setItem(fullKey, JSON.stringify(defaultData));
      } catch (e) {
        console.warn(`[LocalDB] Error seeding ${fullKey}:`, e);
      }
    }
  };

  initTable('profiles', INITIAL_PROFILES);
  initTable('freelancers', INITIAL_FREELANCERS);
  initTable('freelancer_profiles', INITIAL_FREELANCERS);
  initTable('services', INITIAL_SERVICES);
  initTable('service_categories', INITIAL_CATEGORIES);
  initTable('orders', INITIAL_ORDERS);
  initTable('resources', INITIAL_RESOURCES);
  initTable('academic_resources', INITIAL_RESOURCES);
  initTable('notifications', INITIAL_NOTIFICATIONS);
  initTable('reviews', INITIAL_REVIEWS);
  initTable('favorites', []);
  initTable('complaints', []);
  initTable('submissions', []);
  initTable('messages', []);
}

initializeDatabase();

// Helper to get table rows
function getTableData(tableName: string): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DB_PREFIX + tableName);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Helper to save table rows
function setTableData(tableName: string, data: any[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DB_PREFIX + tableName, JSON.stringify(data));
  } catch (e) {
    console.warn(`[LocalDB] Failed saving table ${tableName}:`, e);
  }
}

// Relational expander to populate joined objects like freelancer, profile, etc.
function expandRelations(row: any, tableName: string): any {
  if (!row) return row;
  const clone = { ...row };

  if (tableName === 'services') {
    // Populate freelancer
    const allFreelancers = getTableData('freelancer_profiles');
    const allProfiles = getTableData('profiles');
    const fProfile = allFreelancers.find(f => f.user_id === clone.freelancer_id || f.id === clone.freelancer_id);
    const uProfile = allProfiles.find(p => p.id === clone.freelancer_id || (fProfile && p.id === fProfile.user_id));
    
    if (fProfile || uProfile) {
      clone.freelancer = {
        ...(fProfile || {}),
        profile: uProfile || null
      };
    }
    // Populate category
    const categories = getTableData('service_categories');
    const cat = categories.find(c => c.id === clone.category_id || c.slug === clone.category_id);
    if (cat) clone.category = cat;
  }

  if (tableName === 'freelancers' || tableName === 'freelancer_profiles') {
    const allProfiles = getTableData('profiles');
    const uProfile = allProfiles.find(p => p.id === clone.user_id || p.id === clone.profile_id);
    if (uProfile) clone.profile = uProfile;
  }

  if (tableName === 'orders') {
    const allProfiles = getTableData('profiles');
    const allFreelancers = getTableData('freelancer_profiles');
    const student = allProfiles.find(p => p.id === clone.student_id);
    const freelancerProf = allFreelancers.find(f => f.user_id === clone.freelancer_id || f.id === clone.freelancer_id);
    const freelancerUser = allProfiles.find(p => p.id === clone.freelancer_id || (freelancerProf && p.id === freelancerProf.user_id));

    if (student) clone.student = student;
    if (freelancerProf || freelancerUser) {
      clone.freelancer = {
        ...(freelancerProf || {}),
        profile: freelancerUser || null
      };
    }
  }

  if (tableName === 'resources' || tableName === 'academic_resources') {
    const allProfiles = getTableData('profiles');
    const uploader = allProfiles.find(p => p.id === clone.uploader_id);
    if (uploader) clone.uploader = uploader;
  }

  if (tableName === 'reviews') {
    const allProfiles = getTableData('profiles');
    const reviewer = allProfiles.find(p => p.id === clone.reviewer_id);
    if (reviewer) clone.reviewer = reviewer;
  }

  return clone;
}

// Chainable query builder emulating Supabase postgREST
class LocalQueryBuilder {
  private tableName: string;
  private filters: ((item: any) => boolean)[] = [];
  private orderConfig: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private isCountExact = false;
  private isHeadOnly = false;
  private mutationData: any = null;
  private mutationType: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select';

  constructor(tableName: string) {
    // Normalize aliases
    if (tableName === 'academic_resources') this.tableName = 'resources';
    else if (tableName === 'freelancer_profiles') this.tableName = 'freelancers';
    else this.tableName = tableName;
  }

  select(columns: string = '*', options?: { count?: string; head?: boolean }) {
    if (options?.count === 'exact') this.isCountExact = true;
    if (options?.head) this.isHeadOnly = true;
    return this;
  }

  insert(data: any) {
    this.mutationType = 'insert';
    this.mutationData = data;
    return this;
  }

  upsert(data: any) {
    this.mutationType = 'upsert';
    this.mutationData = data;
    return this;
  }

  update(data: any) {
    this.mutationType = 'update';
    this.mutationData = data;
    return this;
  }

  delete() {
    this.mutationType = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item: any) => {
      if (item[column] === undefined && column === 'user_id') {
        return item['id'] === value || item['user_id'] === value;
      }
      return String(item[column]) === String(value);
    });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item: any) => String(item[column]) !== String(value));
    return this;
  }

  in(column: string, values: any[]) {
    const stringValues = values.map(v => String(v));
    this.filters.push((item: any) => stringValues.includes(String(item[column])));
    return this;
  }

  ilike(column: string, pattern: string) {
    const cleanPattern = pattern.replace(/%/g, '').toLowerCase();
    this.filters.push((item: any) => {
      const val = item[column];
      if (typeof val === 'string') return val.toLowerCase().includes(cleanPattern);
      if (typeof val === 'object' && val?.name) return String(val.name).toLowerCase().includes(cleanPattern);
      return false;
    });
    return this;
  }

  or(conditions: string) {
    // Handles formats like "student_id.eq.XYZ,enrollment_no.eq.XYZ"
    const subParts = conditions.split(',').map(c => c.trim());
    this.filters.push((item: any) => {
      return subParts.some(part => {
        const [col, op, val] = part.split('.');
        if (op === 'eq') return String(item[col]) === String(val);
        return false;
      });
    });
    return this;
  }

  order(column: string, config?: { ascending?: boolean }) {
    this.orderConfig = {
      column,
      ascending: config?.ascending ?? true
    };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  // Resolves the operation into { data, error, count }
  private async execute(): Promise<{ data: any; error: any; count?: number }> {
    let rows = getTableData(this.tableName);

    // Apply mutations if any
    if (this.mutationType === 'insert') {
      const itemsToInsert = Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData];
      const stampedItems = itemsToInsert.map(it => ({
        id: it.id || 'id-' + Math.random().toString(36).substring(2, 9),
        created_at: it.created_at || new Date().toISOString(),
        ...it,
      }));
      rows = [...stampedItems, ...rows];
      setTableData(this.tableName, rows);
      return { data: Array.isArray(this.mutationData) ? stampedItems : stampedItems[0], error: null };
    }

    if (this.mutationType === 'upsert') {
      const items = Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData];
      for (const item of items) {
        const existingIdx = rows.findIndex(r => (item.id && r.id === item.id) || (item.user_id && r.user_id === item.user_id));
        if (existingIdx >= 0) {
          rows[existingIdx] = { ...rows[existingIdx], ...item, updated_at: new Date().toISOString() };
        } else {
          rows.unshift({
            id: item.id || 'id-' + Math.random().toString(36).substring(2, 9),
            created_at: item.created_at || new Date().toISOString(),
            ...item
          });
        }
      }
      setTableData(this.tableName, rows);
      return { data: this.mutationData, error: null };
    }

    if (this.mutationType === 'update') {
      let updatedRows = 0;
      rows = rows.map(r => {
        const matches = this.filters.every(f => f(r));
        if (matches) {
          updatedRows++;
          return { ...r, ...this.mutationData, updated_at: new Date().toISOString() };
        }
        return r;
      });
      setTableData(this.tableName, rows);
      return { data: rows, error: null, count: updatedRows };
    }

    if (this.mutationType === 'delete') {
      const initialLen = rows.length;
      rows = rows.filter(r => !this.filters.every(f => f(r)));
      setTableData(this.tableName, rows);
      return { data: null, error: null, count: initialLen - rows.length };
    }

    // Default: SELECT query
    let filtered = rows.filter(r => this.filters.every(f => f(r)));
    const totalCount = filtered.length;

    if (this.orderConfig) {
      const { column, ascending } = this.orderConfig;
      filtered.sort((a, b) => {
        const valA = a[column] || '';
        const valB = b[column] || '';
        if (valA < valB) return ascending ? -1 : 1;
        if (valA > valB) return ascending ? 1 : -1;
        return 0;
      });
    }

    if (this.limitCount !== null) {
      filtered = filtered.slice(0, this.limitCount);
    }

    // Expand relationships
    const expanded = filtered.map(item => expandRelations(item, this.tableName));

    if (this.isHeadOnly) {
      return { data: null, error: null, count: totalCount };
    }

    return { 
      data: expanded, 
      error: null, 
      count: this.isCountExact ? totalCount : undefined 
    };
  }

  // Make query awaitable directly like Promise
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  async single() {
    const res = await this.execute();
    const item = Array.isArray(res.data) ? res.data[0] || null : res.data;
    return { data: item, error: null };
  }

  async maybeSingle() {
    const res = await this.execute();
    const item = Array.isArray(res.data) ? res.data[0] || null : res.data;
    return { data: item, error: null };
  }
}

// Local mock Auth manager
class LocalAuthManager {
  private listeners: ((event: string, session: any) => void)[] = [];

  getSession(): { data: { session: any }; error: null } {
    if (typeof window === 'undefined') return { data: { session: null }, error: null };
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (!stored) return { data: { session: null }, error: null };
      return { data: { session: JSON.parse(stored) }, error: null };
    } catch {
      return { data: { session: null }, error: null };
    }
  }

  setSession(session: any) {
    if (typeof window === 'undefined') return;
    if (session) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
    this.notify('SIGNED_IN', session);
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private notify(event: string, session: any) {
    this.listeners.forEach(cb => {
      try {
        cb(event, session);
      } catch (e) {
        console.error('[LocalAuth] Listener error:', e);
      }
    });
  }

  async signInWithPassword({ email, password }: { email: string; password?: string }) {
    const profiles = getTableData('profiles');
    const user = profiles.find(p => p.email.toLowerCase() === email.toLowerCase() || p.student_id === email || p.enrollment_no === email);
    
    if (!user) {
      return { data: { user: null, session: null }, error: { message: 'No student account found with this email or enrollment number.' } };
    }

    const session = {
      access_token: 'local-jwt-' + user.id,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { ...user },
        created_at: user.created_at
      }
    };

    this.setSession(session);
    return { data: { session, user: session.user }, error: null };
  }

  async signUp({ email, password, options }: { email: string; password?: string; options?: any }) {
    const profiles = getTableData('profiles');
    const existing = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return { data: { user: null, session: null }, error: { message: 'An account with this email address already exists.' } };
    }

    const newId = 'user-stu-' + Date.now().toString(36);
    const meta = options?.data || {};

    const newProfile = {
      id: newId,
      full_name: meta.full_name || 'Student',
      student_id: meta.student_id || meta.enrollment_no || '2200150' + Math.floor(100 + Math.random() * 900),
      enrollment_no: meta.enrollment_no || meta.student_id || '2200150' + Math.floor(100 + Math.random() * 900),
      email: email.toLowerCase(),
      department: meta.department || 'Computer Engineering',
      year: meta.year || 'TY',
      semester: meta.semester || 'Sem 5',
      phone: meta.phone || '',
      bio: meta.bio || '',
      avatar_url: meta.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: 'student',
      is_freelancer: false,
      created_at: new Date().toISOString()
    };

    profiles.unshift(newProfile);
    setTableData('profiles', profiles);

    const session = {
      access_token: 'local-jwt-' + newId,
      user: {
        id: newId,
        email: newProfile.email,
        user_metadata: { ...newProfile },
        created_at: newProfile.created_at
      }
    };

    this.setSession(session);
    return { data: { session, user: session.user }, error: null };
  }

  async signOut() {
    this.setSession(null);
    this.notify('SIGNED_OUT', null);
    return { error: null };
  }

  async resend() {
    return { error: null };
  }

  async resetPasswordForEmail(email: string) {
    return { error: null };
  }

  async updateUser(data: any) {
    const curr = this.getSession().data.session;
    if (curr?.user) {
      const profiles = getTableData('profiles');
      const idx = profiles.findIndex(p => p.id === curr.user.id);
      if (idx >= 0) {
        profiles[idx] = { ...profiles[idx], ...(data.data || {}) };
        setTableData('profiles', profiles);
      }
    }
    return { data: null, error: null };
  }
}

// Local mock Storage manager
class LocalStorageManager {
  from(bucket: string) {
    return {
      upload: async (filePath: string, file: File, options?: any): Promise<{ data: { path: string } | null; error: any }> => {
        // Convert to data URL for immediate local display
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const resultUrl = reader.result as string;
            try {
              localStorage.setItem(`skillnest_file_${bucket}_${filePath}`, resultUrl);
            } catch {
              // Ignore quota limit in demo
            }
            resolve({ data: { path: filePath }, error: null });
          };
          reader.onerror = () => {
            resolve({ data: { path: filePath }, error: null });
          };
          reader.readAsDataURL(file);
        });
      },
      getPublicUrl: (filePath: string) => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(`skillnest_file_${bucket}_${filePath}`) : null;
        return {
          data: {
            publicUrl: stored || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`
          }
        };
      }
    };
  }
}

// Export drop-in replacement client for supabase
export const supabase = {
  from: (tableName: string) => new LocalQueryBuilder(tableName),
  storage: new LocalStorageManager(),
  auth: new LocalAuthManager(),
  channel: (name: string) => ({
    on: () => ({
      subscribe: () => ({ unsubscribe: () => {} })
    }),
    subscribe: () => {}
  }),
  removeChannel: (channel?: any) => {}
};

export const defaultCategories = INITIAL_CATEGORIES;
