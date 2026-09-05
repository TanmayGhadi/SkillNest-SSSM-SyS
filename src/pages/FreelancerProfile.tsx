import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  MessageSquare,
  ArrowLeft,
  Briefcase,
  Layers,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FreelancerProfile as IFreelancerProfile, Profile, Service, Review } from '../types/database';
import { ServiceCard } from '../components/ServiceCard';
import { useAuth } from '../context/AuthContext';

export const FreelancerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [freelancer, setFreelancer] = useState<(IFreelancerProfile & { profile?: Profile }) | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<(Review & { student?: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadFreelancer(id);
    }
  }, [id]);

  const loadFreelancer = async (freelancerId: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch freelancer profile
      const { data: fData, error: fError } = await supabase
        .from('freelancers')
        .select('*, profile:profiles(*)')
        .eq('id', freelancerId)
        .single();

      if (fError) throw fError;
      setFreelancer(fData);

      // 2. Fetch services by this freelancer
      const { data: sData } = await supabase
        .from('services')
        .select('*')
        .eq('freelancer_id', freelancerId)
        .eq('is_active', true);

      if (sData) {
        setServices(sData);
      }

      // 3. Fetch reviews
      const { data: rData } = await supabase
        .from('reviews')
        .select('*, student:profiles(*)')
        .eq('freelancer_id', freelancerId)
        .order('created_at', { ascending: false });

      if (rData) {
        setReviews(rData);
      }
    } catch (err) {
      console.error('Error fetching freelancer profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-sand-200 rounded w-1/4" />
        <div className="h-48 bg-sand-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-sand-200 rounded-2xl" />
          <div className="h-40 bg-sand-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-sand-400 mx-auto" />
        <h2 className="text-2xl font-bold font-heading text-navy-900">Freelancer Not Found</h2>
        <p className="text-sand-600 text-sm">This student freelancer profile may have been deactivated.</p>
        <Link
          to="/freelancers"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium text-sm hover:bg-teal-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Freelancers
        </Link>
      </div>
    );
  }

  const profile = freelancer.profile;
  const isSelf = user?.id === freelancer.profile_id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Back Link */}
      <div>
        <Link
          to="/freelancers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-sand-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Talent Directory
        </Link>
      </div>

      {/* Hero Profile Header */}
      <div className="bg-white rounded-3xl border border-sand-200 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-50 border-2 border-teal-100 flex items-center justify-center font-heading text-2xl sm:text-3xl font-bold text-teal-700 shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                profile?.full_name?.charAt(0).toUpperCase() || 'F'
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-navy-900">
                  {profile?.full_name}
                </h1>
                {freelancer.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> GPM Verified Student
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-teal-700">
                {freelancer.title || 'Student Freelancer'}
              </p>

              <p className="text-xs text-sand-500">
                {profile?.department} {profile?.year_of_study ? `• Year ${profile.year_of_study}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!isSelf && user && (
              <Link
                to={`/messages?recipient=${freelancer.profile_id}`}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Message Freelancer
              </Link>
            )}

            {isSelf && (
              <Link
                to="/profile"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-sand-200 hover:bg-sand-50 text-navy-800 font-semibold text-xs transition-all"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Bio */}
        {freelancer.bio && (
          <div className="mt-6 pt-6 border-t border-sand-100">
            <h3 className="text-xs font-semibold text-sand-500 uppercase tracking-wider mb-2">About Freelancer</h3>
            <p className="text-sm text-sand-700 leading-relaxed max-w-3xl whitespace-pre-line">
              {freelancer.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        <div className="mt-6 pt-6 border-t border-sand-100">
          <h3 className="text-xs font-semibold text-sand-500 uppercase tracking-wider mb-3">Skills & Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {freelancer.skills && freelancer.skills.length > 0 ? (
              freelancer.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 rounded-xl bg-sand-100 text-navy-800 text-xs font-medium border border-sand-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-sand-400 italic">No skills listed yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Services by this Freelancer */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold font-heading text-navy-900">
            Services by {profile?.full_name} ({services.length})
          </h2>
          <p className="text-xs text-sand-500 mt-0.5">Active gigs and project offerings</p>
        </div>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <ServiceCard
                key={srv.id}
                service={{
                  ...srv,
                  freelancer: freelancer,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-sand-200 p-8 text-center">
            <Briefcase className="w-10 h-10 text-sand-300 mx-auto mb-2" />
            <p className="text-sm text-sand-600 font-medium">No services currently published by this freelancer.</p>
          </div>
        )}
      </div>

      {/* Reviews by other students */}
      <div className="bg-white rounded-3xl border border-sand-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-heading text-navy-900">Peer Reviews ({reviews.length})</h2>
            <p className="text-xs text-sand-500 mt-0.5">Feedback from students who received deliverables</p>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold text-navy-900">
              {reviews.length > 0 ? (freelancer.rating || 0).toFixed(1) : 'No reviews'}
            </span>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4 divide-y divide-sand-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-800 text-xs font-bold flex items-center justify-center">
                      {rev.student?.full_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-navy-900">{rev.student?.full_name || 'GPM Student'}</p>
                      <p className="text-[10px] text-sand-500">{new Date(rev.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-sand-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-sand-700 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center bg-sand-50 rounded-2xl border border-dashed border-sand-200">
            <p className="text-xs text-sand-500">No reviews yet for this student freelancer.</p>
          </div>
        )}
      </div>
    </div>
  );
};
