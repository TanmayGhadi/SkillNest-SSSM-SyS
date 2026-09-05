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
  signUp: (arg1: any, password?: string, extraData?: any) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean; message?: string }>;
  login: (credentials: any, password?: string) => Promise<{ success: boolean; error?: string; isUnconfirmedEmail?: boolean; email?: string }>;
  logout: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
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
      // 1. Fetch profile from Supabase PostgreSQL database
      const { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      let activeProfile: Profile | null = prof;

      // 2. Resilient fallback to authUser.user_metadata if table row not yet created
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

        // Try to insert/upsert into profiles if database table exists
        try {
          await supabase.from('profiles').upsert(activeProfile);
        } catch {
          // In case table is still pending creation
        }
      }

      setProfile(activeProfile);

      // 3. Load freelancer profile if user is a freelancer
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

    // Listen to real-time auth state changes
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

  // Realtime updates for notifications and orders
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`user-${user.id}-live-updates`)
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        if (user) fetchLiveStats(user.id, Boolean(profile?.is_freelancer), profile);
      })
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        if (user) fetchLiveStats(user.id, Boolean(profile?.is_freelancer), profile);
      })
      ?.subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, profile, fetchLiveStats]);

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

  const signUp = async (arg1: any, arg2?: string, arg3?: any) => {
    try {
      let email = '';
      let password = '';
      let metadata: any = {};

      if (typeof arg1 === 'string') {
        email = arg1.trim();
        password = (arg2 || '').trim();
        metadata = arg3 || {};
      } else if (arg1 && typeof arg1 === 'object') {
        email = (arg1.email || '').trim();
        password = (arg1.password || '').trim();
        metadata = {
          full_name: arg1.fullName || arg1.full_name,
          student_id: arg1.studentId || arg1.student_id || arg1.enrollmentNo || arg1.enrollment_no,
          enrollment_no: arg1.enrollmentNo || arg1.enrollment_no || arg1.studentId || arg1.student_id,
          department: arg1.department,
          year: arg1.year,
          semester: arg1.semester || 'Sem 1',
          phone: arg1.phone,
          ...arg1,
        };
      }

      if (!email || !password) {
        return { success: false, error: 'Email and password are required.' };
      }

      const fullName = metadata.full_name || metadata.fullName || 'Student';
      const enrollmentNo = metadata.enrollment_no || metadata.student_id || 'STU-' + Math.floor(1000 + Math.random() * 9000);
      const studentId = metadata.student_id || enrollmentNo;
      const department = metadata.department || 'Computer Engineering';
      const year = metadata.year || 'TY';
      const semester = metadata.semester || 'Sem 1';
      const phone = metadata.phone || '';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            student_id: studentId,
            enrollment_no: enrollmentNo,
            department,
            year,
            semester,
            phone,
          },
        },
      });

      if (error) {
        if (error.message?.toLowerCase().includes('rate limit') || (error as any).code === 'over_email_send_rate_limit') {
          return { success: false, error: 'Email delivery rate limit reached. Please wait a few minutes before trying again.' };
        }
        if (error.message?.toLowerCase().includes('already registered') || error.message?.toLowerCase().includes('user already exists')) {
          return { success: false, error: 'An account with this email address already exists. Please sign in.' };
        }
        if (error.message?.toLowerCase().includes('invalid') || (error as any).code === 'email_address_invalid') {
          return { success: false, error: 'Please enter a valid email address with an active domain (e.g. @gmail.com or @outlook.com).' };
        }
        if (error.message?.toLowerCase().includes('password')) {
          return { success: false, error: error.message };
        }
        return { success: false, error: error.message || 'Registration failed. Please check your credentials.' };
      }

      if (!data?.user) {
        return { success: false, error: 'Failed to create user account. Please try again.' };
      }

      // Check whether email confirmation is required (session is null)
      if (!data.session) {
        return {
          success: true,
          requiresEmailConfirmation: true,
          message: 'Your account has been created! Please check your email to verify your account before logging in.',
        };
      }

      // If auto-confirmed and session exists
      await loadUserData(data.user);
      return { success: true, requiresEmailConfirmation: false, message: 'Account created successfully!' };
    } catch (e: any) {
      console.error('SignUp exception:', e);
      return { success: false, error: e.message || 'An error occurred during registration.' };
    }
  };

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

      let loginEmail = identifier;

      // If user enters Student ID / Enrollment Number instead of Email
      if (!loginEmail.includes('@')) {
        try {
          const { data: matchedProfile } = await supabase
            .from('profiles')
            .select('email')
            .or(`student_id.eq.${loginEmail},enrollment_no.eq.${loginEmail}`)
            .maybeSingle();

          if (matchedProfile?.email) {
            loginEmail = matchedProfile.email;
          } else {
            return {
              success: false,
              error: `Student ID "${identifier}" not found. Please sign in using your registered email address or sign up.`,
            };
          }
        } catch {
          // If profiles table query fails, inform user to use their email
          return {
            success: false,
            error: 'Please sign in using your registered email address.',
          };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes('email not confirmed') || (error as any).code === 'email_not_confirmed') {
          return {
            success: false,
            isUnconfirmedEmail: true,
            email: loginEmail,
            error: 'Your email address has not been confirmed yet. Please check your inbox or spam folder for the Supabase confirmation link.',
          };
        }
        if (error.message?.toLowerCase().includes('invalid login credentials')) {
          return {
            success: false,
            error: 'Invalid email or password. Please verify your credentials.',
          };
        }
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setSession(data.session);
        await loadUserData(data.user);
      }
      return { success: true };
    } catch (e: any) {
      console.error('Login error:', e);
      return { success: false, error: e.message || 'Invalid student credentials.' };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to resend confirmation email.' };
    }
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

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile || !user) return false;
    try {
      const { error } = await supabase.from('profiles').update(data).eq('id', user.id);
      if (!error) {
        const newProfile = { ...profile, ...data };
        setProfile(newProfile);
        setActivityStats(prev => ({ ...prev, profileCompletion: calculateProfileCompletion(newProfile) }));
        return true;
      }
    } catch (e) {
      console.error('Profile update error:', e);
    }
    return false;
  };

  const activateFreelancer = async (freelancerData: any) => {
    if (!profile || !user) return false;
    try {
      // Update profile
      await supabase.from('profiles').update({ is_freelancer: true }).eq('id', user.id);
      // Upsert freelancer_profiles
      await supabase.from('freelancer_profiles').upsert({
        user_id: user.id,
        headline: freelancerData.headline || 'Student Freelancer at GPM Malvan',
        bio: freelancerData.bio || profile.bio || '',
        skills: freelancerData.skills || [],
        hourly_rate: freelancerData.hourlyRate || 150,
        specializations: freelancerData.specializations || [],
      });

      const updatedProfile = { ...profile, is_freelancer: true };
      setProfile(updatedProfile);
      await loadUserData(user);
      return true;
    } catch (e) {
      console.error('Activate freelancer error:', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      freelancerProfile,
      activityStats,
      isLoading,
      isAdmin: profile?.role === 'admin',
      isFreelancer: Boolean(profile?.is_freelancer),
      signUp,
      login,
      logout,
      resendVerification,
      updateProfile,
      activateFreelancer,
      refreshStats,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
