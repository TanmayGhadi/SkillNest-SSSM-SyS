import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, FreelancerProfile } from '../types/database';

export interface UserActivityStats {
  profileCompletion: number;
  ordersGiven: number;
  activeOrders: number;
  completedOrders: number;
  savedServicesCount: number;
  unreadNotificationsCount: number;
  activeGigs: number;
  ordersReceived: number;
  completedGigs: number;
  rating: number;
}

interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  freelancerProfile: FreelancerProfile | null;
  activityStats: UserActivityStats;
  isLoading: boolean;
  isAdmin: boolean;
  isFreelancer: boolean;
  sendLoginOtp: (identifier: string) => Promise<{ success: boolean; error?: string; email?: string; demoOtp?: string }>;
  verifyLoginOtp: (identifier: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  sendSignupOtp: (data: any) => Promise<{ success: boolean; error?: string; email?: string; demoOtp?: string }>;
  verifySignupOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  quickDemoLogin: (role: 'student' | 'freelancer' | 'admin') => Promise<{ success: boolean; error?: string }>;
  signUp: (arg1: any, password?: string, extraData?: any) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean; message?: string }>;
  login: (credentials: any, password?: string) => Promise<{ success: boolean; error?: string; isUnconfirmedEmail?: boolean; email?: string }>;
  logout: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string; profile?: Profile }>;
  activateFreelancer: (freelancerData: any) => Promise<boolean>;
  refreshStats: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const initialStats: UserActivityStats = {
  profileCompletion: 0,
  ordersGiven: 0,
  activeOrders: 0,
  completedOrders: 0,
  savedServicesCount: 0,
  unreadNotificationsCount: 0,
  activeGigs: 0,
  ordersReceived: 0,
  completedGigs: 0,
  rating: 0,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Temporary OTP in-memory & session storage helper
const OTP_STORE_KEY = 'skillnest_pending_otps';

interface StoredOtp {
  code: string;
  expiresAt: number;
  payload?: any;
}

function savePendingOtp(key: string, code: string, payload?: any) {
  try {
    const existingRaw = sessionStorage.getItem(OTP_STORE_KEY);
    const store: Record<string, StoredOtp> = existingRaw ? JSON.parse(existingRaw) : {};
    store[key.toLowerCase()] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      payload
    };
    sessionStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('[Auth] Failed saving pending OTP:', e);
  }
}

function getPendingOtp(key: string): StoredOtp | null {
  try {
    const existingRaw = sessionStorage.getItem(OTP_STORE_KEY);
    if (!existingRaw) return null;
    const store: Record<string, StoredOtp> = JSON.parse(existingRaw);
    const item = store[key.toLowerCase()];
    if (!item) return null;
    if (Date.now() > item.expiresAt) return null;
    return item;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<FreelancerProfile | null>(null);
  const [activityStats, setActivityStats] = useState<UserActivityStats>(initialStats);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const calculateProfileCompletion = (p: Profile | null): number => {
    if (!p) return 0;
    let score = 40; // Base: Name, Email, Enrollment
    if (p.department) score += 15;
    if (p.year) score += 15;
    if (p.phone && p.phone.trim().length > 5) score += 10;
    if (p.bio && p.bio.trim().length > 10) score += 10;
    if (p.avatar_url && p.avatar_url.trim().length > 5) score += 10;
    return Math.min(score, 100);
  };

  const fetchLiveStats = useCallback(async (userId: string, isFreelancerFlag: boolean, prof: Profile | null) => {
    try {
      const [
        ordersGivenRes,
        activeOrdersRes,
        completedOrdersRes,
        favsRes,
        notifsRes,
        servicesRes,
        ordersReceivedRes,
        completedGigsRes,
        reviewsRes,
      ] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('student_id', userId).in('status', ['pending', 'accepted', 'in_progress', 'submitted', 'revision_requested']),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('student_id', userId).eq('status', 'completed'),
        supabase.from('favorites').select('service_id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false),
        isFreelancerFlag ? supabase.from('services').select('id', { count: 'exact', head: true }).eq('freelancer_id', userId).eq('is_active', true) : Promise.resolve({ count: 0 }),
        isFreelancerFlag ? supabase.from('orders').select('id', { count: 'exact', head: true }).eq('freelancer_id', userId) : Promise.resolve({ count: 0 }),
        isFreelancerFlag ? supabase.from('orders').select('id', { count: 'exact', head: true }).eq('freelancer_id', userId).eq('status', 'completed') : Promise.resolve({ count: 0 }),
        isFreelancerFlag ? supabase.from('reviews').select('rating').eq('freelancer_id', userId) : Promise.resolve({ data: [] }),
      ]);

      const revList = (reviewsRes as any)?.data || [];
      const totalRev = revList.length;
      const avgRating = totalRev > 0
        ? revList.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / totalRev
        : 0;

      setActivityStats({
        profileCompletion: calculateProfileCompletion(prof),
        ordersGiven: (ordersGivenRes as any)?.count || 0,
        activeOrders: (activeOrdersRes as any)?.count || 0,
        completedOrders: (completedOrdersRes as any)?.count || 0,
        savedServicesCount: (favsRes as any)?.count || 0,
        unreadNotificationsCount: (notifsRes as any)?.count || 0,
        activeGigs: (servicesRes as any)?.count || 0,
        ordersReceived: (ordersReceivedRes as any)?.count || 0,
        completedGigs: (completedGigsRes as any)?.count || 0,
        rating: avgRating,
      });
    } catch (e) {
      console.error('Error fetching live stats:', e);
    }
  }, []);

  const loadUserData = useCallback(async (authUser: any) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      setFreelancerProfile(null);
      setActivityStats(initialStats);
      return;
    }
    setUser(authUser);

    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      let activeProfile: Profile | null = prof;

      if (!activeProfile) {
        const meta = authUser.user_metadata || {};
        activeProfile = {
          id: authUser.id,
          full_name: meta.full_name || authUser.email?.split('@')[0] || 'GPM Student',
          student_id: meta.student_id || meta.enrollment_no || 'STU-' + authUser.id.substring(0, 8),
          enrollment_no: meta.enrollment_no || meta.student_id || 'STU-' + authUser.id.substring(0, 8),
          email: authUser.email || '',
          department: meta.department || 'Computer Engineering',
          year: meta.year || 'TY',
          semester: meta.semester || 'Sem 5',
          phone: meta.phone || '',
          bio: meta.bio || '',
          avatar_url: meta.avatar_url || '',
          role: meta.role || 'student',
          is_freelancer: Boolean(meta.is_freelancer),
          created_at: authUser.created_at || new Date().toISOString(),
        };

        try {
          await supabase.from('profiles').upsert(activeProfile);
        } catch {
          // ignore
        }
      }

      setProfile(activeProfile);

      if (activeProfile?.is_freelancer) {
        const { data: freelancerData } = await supabase
          .from('freelancer_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();
        setFreelancerProfile(freelancerData || null);
      } else {
        setFreelancerProfile(null);
      }

      await fetchLiveStats(authUser.id, Boolean(activeProfile?.is_freelancer), activeProfile);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }, [fetchLiveStats]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(currentSession);
          if (currentSession?.user) {
            await loadUserData(currentSession.user);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      if (currentSession?.user) {
        await loadUserData(currentSession.user);
      } else {
        setUser(null);
        setProfile(null);
        setFreelancerProfile(null);
        setActivityStats(initialStats);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`user-${user.id}-live-updates`);
    channel.subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const refreshStats = async () => {
    if (user) {
      await fetchLiveStats(user.id, Boolean(profile?.is_freelancer), profile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  // --- Email OTP Authentication Flow ---

  const sendLoginOtp = async (identifier: string) => {
    const cleanId = identifier.trim();
    if (!cleanId) {
      return { success: false, error: 'Please enter your email address or Student ID.' };
    }

    try {
      // Find matching profile in local store
      const { data: profiles } = await supabase.from('profiles').select('*');
      const allProfiles: Profile[] = profiles || [];
      const matched = allProfiles.find(
        p => p.email.toLowerCase() === cleanId.toLowerCase() ||
             p.student_id?.toLowerCase() === cleanId.toLowerCase() ||
             p.enrollment_no?.toLowerCase() === cleanId.toLowerCase()
      );

      const targetEmail = matched ? matched.email : (cleanId.includes('@') ? cleanId : null);

      if (!targetEmail) {
        return { 
          success: false, 
          error: `No student registered with ID "${cleanId}". Please check your ID or sign up below.` 
        };
      }

      // Generate realistic 6-digit OTP code
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      savePendingOtp(targetEmail, generatedOtp, { email: targetEmail, profile: matched });

      return {
        success: true,
        email: targetEmail,
        demoOtp: generatedOtp
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to dispatch verification code.' };
    }
  };

  const verifyLoginOtp = async (identifier: string, otp: string) => {
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return { success: false, error: 'Please enter a valid 6-digit verification code.' };
    }

    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const allProfiles: Profile[] = profiles || [];
      const cleanId = identifier.trim().toLowerCase();
      const matched = allProfiles.find(
        p => p.email.toLowerCase() === cleanId ||
             p.student_id?.toLowerCase() === cleanId ||
             p.enrollment_no?.toLowerCase() === cleanId
      );

      const targetEmail = matched ? matched.email : (cleanId.includes('@') ? cleanId : '');
      const pending = getPendingOtp(targetEmail);

      // Verify OTP (accept match or master dev code '123456')
      if (!pending && cleanOtp !== '123456') {
        return { success: false, error: 'Verification code expired or invalid. Please request a new one.' };
      }

      if (pending && pending.code !== cleanOtp && cleanOtp !== '123456') {
        return { success: false, error: 'Incorrect 6-digit verification code. Please try again.' };
      }

      // If user exists, sign in directly
      if (matched) {
        const res = await supabase.auth.signInWithPassword({ email: matched.email });
        if (res.data?.session) {
          setSession(res.data.session);
          await loadUserData(res.data.session.user);
          return { success: true };
        }
      }

      // If registered with email not yet in profiles, auto create profile
      const res = await supabase.auth.signUp({
        email: targetEmail,
        options: {
          data: {
            full_name: targetEmail.split('@')[0],
            email: targetEmail,
            department: 'Computer Engineering',
            year: 'TY'
          }
        }
      });

      if (res.data?.session) {
        setSession(res.data.session);
        await loadUserData(res.data.session.user);
        return { success: true };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to verify code.' };
    }
  };

  const sendSignupOtp = async (userData: any) => {
    const email = (userData.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const exists = (profiles || []).some((p: Profile) => p.email.toLowerCase() === email);
      if (exists) {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      savePendingOtp(email, generatedOtp, userData);

      return {
        success: true,
        email,
        demoOtp: generatedOtp
      };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to send registration code.' };
    }
  };

  const verifySignupOtp = async (email: string, otp: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const pending = getPendingOtp(cleanEmail);
    if (!pending && cleanOtp !== '123456') {
      return { success: false, error: 'Verification code has expired. Please register again.' };
    }

    if (pending && pending.code !== cleanOtp && cleanOtp !== '123456') {
      return { success: false, error: 'Incorrect 6-digit verification code.' };
    }

    const data = pending?.payload || {};

    const res = await supabase.auth.signUp({
      email: cleanEmail,
      options: {
        data: {
          full_name: data.fullName || data.full_name || 'Student',
          student_id: data.studentId || data.enrollmentNo || '2200150' + Math.floor(100 + Math.random() * 900),
          enrollment_no: data.enrollmentNo || data.studentId || '2200150' + Math.floor(100 + Math.random() * 900),
          department: data.department || 'Computer Engineering',
          year: data.year || 'TY',
          semester: data.semester || 'Sem 5',
          phone: data.phone || '',
        }
      }
    });

    if (res.data?.session) {
      setSession(res.data.session);
      await loadUserData(res.data.session.user);
      return { success: true };
    }

    return { success: true };
  };

  // 1-Click Fast Test Account Login
  const quickDemoLogin = async (role: 'student' | 'freelancer' | 'admin') => {
    let email = 'atharva.gpm@gmail.com';
    if (role === 'freelancer') email = 'tanmay.gpm@gmail.com';
    if (role === 'admin') email = 'admin@gpmalvan.ac.in';

    const res = await supabase.auth.signInWithPassword({ email });
    if (res.data?.session) {
      setSession(res.data.session);
      await loadUserData(res.data.session.user);
      return { success: true };
    }
    return { success: false, error: 'Demo account not found.' };
  };

  // Standard password login fallback
  const login = async (arg1: any, arg2?: string) => {
    try {
      let identifier = '';
      let password = '';

      if (typeof arg1 === 'string') {
        identifier = arg1.trim();
        password = arg2 || '';
      } else if (arg1 && typeof arg1 === 'object') {
        identifier = (arg1.identifier || arg1.email || '').trim();
        password = arg1.password || '';
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.session) {
        setSession(data.session);
        await loadUserData(data.session.user);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid student credentials.' };
    }
  };

  const signUp = async (arg1: any, arg2?: string, arg3?: any) => {
    let email = '';
    let password = '';
    let metadata: any = {};

    if (typeof arg1 === 'string') {
      email = arg1.trim();
      password = arg2 || '';
      metadata = arg3 || {};
    } else if (arg1 && typeof arg1 === 'object') {
      email = (arg1.email || '').trim();
      password = arg1.password || '';
      metadata = arg1;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.session) {
      setSession(data.session);
      await loadUserData(data.session.user);
    }

    return { success: true, requiresEmailConfirmation: false };
  };

  const resendVerification = async (email: string) => {
    return { success: true };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setFreelancerProfile(null);
      setActivityStats(initialStats);
    }
  };

  const updateProfile = async (data: Partial<Profile>): Promise<{ success: boolean; error?: string; profile?: Profile }> => {
    if (!user || !user.id) {
      return { success: false, error: 'No authenticated user session.' };
    }

    try {
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (data.full_name !== undefined) updatePayload.full_name = data.full_name.trim();
      if (data.department !== undefined) updatePayload.department = data.department;
      if (data.year !== undefined) updatePayload.year = data.year;
      if (data.semester !== undefined) updatePayload.semester = data.semester;
      if (data.phone !== undefined) updatePayload.phone = data.phone.trim();
      if (data.bio !== undefined) updatePayload.bio = data.bio.trim();
      if (data.avatar_url !== undefined) updatePayload.avatar_url = data.avatar_url.trim();

      const { data: updated, error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (error) throw error;

      await loadUserData(user);
      return { success: true, profile: { ...profile, ...updatePayload } as Profile };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile.' };
    }
  };

  const activateFreelancer = async (freelancerData: any): Promise<boolean> => {
    if (!user || !user.id) return false;
    try {
      await supabase.from('profiles').update({ is_freelancer: true }).eq('id', user.id);
      await supabase.from('freelancer_profiles').upsert({
        user_id: user.id,
        headline: freelancerData.headline || 'GPM Student Freelancer',
        bio: freelancerData.bio || '',
        specializations: freelancerData.specializations || [],
        skills: freelancerData.skills || [],
        hourly_rate: freelancerData.hourlyRate || 150.00,
        available: true,
      });

      await loadUserData(user);
      return true;
    } catch (err) {
      console.error('Error activating freelancer:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        freelancerProfile,
        activityStats,
        isLoading,
        isAdmin: profile?.role === 'admin',
        isFreelancer: Boolean(profile?.is_freelancer),
        sendLoginOtp,
        verifyLoginOtp,
        sendSignupOtp,
        verifySignupOtp,
        quickDemoLogin,
        signUp,
        login,
        logout,
        resendVerification,
        updateProfile,
        activateFreelancer,
        refreshStats,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
