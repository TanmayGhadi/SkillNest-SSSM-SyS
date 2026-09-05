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
  profile: Profile | null;
  freelancerProfile: FreelancerProfile | null;
  activityStats: UserActivityStats;
  isLoading: boolean;
  isAdmin: boolean;
  isFreelancer: boolean;
  signUp: (data: any) => Promise<{ success: boolean; error?: string }>;
  login: (credentials: any, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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

      const revList = reviewsRes.data || [];
      const totalRev = revList.length;
      const avgRating = totalRev > 0
        ? revList.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / totalRev
        : 0;

      setActivityStats({
        profileCompletion: calculateProfileCompletion(prof),
        ordersGiven: ordersGivenRes.count || 0,
        activeOrders: activeOrdersRes.count || 0,
        completedOrders: completedOrdersRes.count || 0,
        savedServicesCount: favsRes.count || 0,
        unreadNotificationsCount: notifsRes.count || 0,
        activeGigs: servicesRes.count || 0,
        ordersReceived: ordersReceivedRes.count || 0,
        completedGigs: completedGigsRes.count || 0,
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
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      setProfile(prof || null);

      let fProf: FreelancerProfile | null = null;
      if (prof?.is_freelancer) {
        const { data: freelancerData } = await supabase
          .from('freelancer_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single();
        fProf = freelancerData || null;
        setFreelancerProfile(fProf);
      } else {
        setFreelancerProfile(null);
      }

      await fetchLiveStats(authUser.id, Boolean(prof?.is_freelancer), prof || null);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  }, [fetchLiveStats]);

  useEffect(() => {
    async function initAuth() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        await loadUserData(authUser);
      } catch (err) {
        console.error('Error checking auth state:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();

    // Listen to real-time auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange?.(async (_event: string, session: any) => {
      if (session?.user) {
        await loadUserData(session.user);
      } else {
        await loadUserData(null);
      }
      setIsLoading(false);
    }) || { data: { subscription: null } };

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, [loadUserData]);

  // Realtime updates for notifications and orders
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel?.(`user-${user.id}-live-updates`)
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        if (user) fetchLiveStats(user.id, Boolean(profile?.is_freelancer), profile);
      })
      ?.on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        if (user) fetchLiveStats(user.id, Boolean(profile?.is_freelancer), profile);
      })
      ?.subscribe?.();

    return () => {
      if (channel) supabase.removeChannel?.(channel);
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

  const signUp = async (formData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName || formData.full_name,
            enrollment_no: formData.enrollmentNo || formData.enrollment_no,
            department: formData.department,
            year: formData.year,
            phone: formData.phone || '',
          },
        },
      });

      if (error) return { success: false, error: error.message };

      if (data?.user) {
        await loadUserData(data.user);
      }
      return { success: true };
    } catch (e: any) {
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
        const { data: matchedProfile } = await supabase
          .from('profiles')
          .select('email')
          .ilike('enrollment_no', loginEmail)
          .single();

        if (matchedProfile?.email) {
          loginEmail = matchedProfile.email;
        } else {
          return { success: false, error: 'Student ID / Enrollment Number not found. Please verify or sign up.' };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error) return { success: false, error: error.message };

      if (data?.user) {
        await loadUserData(data.user);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid student credentials.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setFreelancerProfile(null);
    setActivityStats(initialStats);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) return false;
    const { data: updated, error } = await supabase.from('profiles').update(data).eq('id', profile.id);
    if (!error) {
      const newProfile = { ...profile, ...data };
      setProfile(newProfile);
      setActivityStats(prev => ({ ...prev, profileCompletion: calculateProfileCompletion(newProfile) }));
      return true;
    }
    return false;
  };

  const activateFreelancer = async (freelancerData: any) => {
    if (!profile) return false;
    // Update profile
    await supabase.from('profiles').update({ is_freelancer: true }).eq('id', profile.id);
    // Insert/update freelancer_profiles
    await supabase.from('freelancer_profiles').upsert({
      user_id: profile.id,
      headline: freelancerData.headline || 'Student Freelancer at GPM Malvan',
      bio: freelancerData.bio || profile.bio || '',
      skills: freelancerData.skills || [],
      hourly_rate: freelancerData.hourlyRate || 150,
      specializations: freelancerData.specializations || [],
    });

    const updatedProfile = { ...profile, is_freelancer: true };
    setProfile(updatedProfile);
    if (user) await loadUserData(user);
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      freelancerProfile,
      activityStats,
      isLoading,
      isAdmin: profile?.role === 'admin',
      isFreelancer: Boolean(profile?.is_freelancer),
      signUp,
      login,
      logout,
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
