import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  RefreshCw,
  CheckCircle,
  Star,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Heart,
  MessageSquare,
  AlertCircle,
  Briefcase,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Service, Review, FreelancerProfile, Profile } from '../types/database';
import { useAuth } from '../context/AuthContext';

export const ServiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState<(Service & { freelancer?: FreelancerProfile & { profile?: Profile } }) | null>(null);
  const [reviews, setReviews] = useState<(Review & { student?: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      loadServiceDetails(id);
    }
  }, [id]);

  const loadServiceDetails = async (serviceId: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch service details
      const { data: srvData, error: srvError } = await supabase
        .from('services')
        .select('*, freelancer:freelancers(*, profile:profiles(*))')
        .eq('id', serviceId)
        .single();

      if (srvError) throw srvError;
      setService(srvData);

      // 2. Fetch reviews for this service
      const { data: revData } = await supabase
        .from('reviews')
        .select('*, student:profiles(*)')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (revData) {
        setReviews(revData);
      }
    } catch (err) {
      console.error('Error loading service:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleSave = () => {
    setIsSaved(!isSaved);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-6 bg-[#EAE5D8] rounded-full w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-80 bg-[#EAE5D8] rounded-3xl" />
            <div className="h-6 bg-[#EAE5D8] rounded w-3/4" />
          </div>
          <div className="lg:col-span-4 h-96 bg-[#EAE5D8] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#9AA59D] mx-auto" />
        <h2 className="font-serif text-3xl font-bold text-[#1B382B]">Service Not Found</h2>
        <p className="text-[#5C6A60] text-sm">This service may have been paused or is no longer offered.</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B382B] text-[#FBF9F4] font-semibold text-xs hover:bg-[#254B3A] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>
    );
  }

  const isOwnService = user?.id === service.freelancer_id;
  const freelancerProfile = service.freelancer?.profile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C6A60] hover:text-[#1B382B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Services
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSave}
            className={`p-2.5 rounded-full border border-[#ECE7DC] text-xs font-medium flex items-center gap-1.5 transition-all ${
              isSaved ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white hover:bg-[#F3EFE6] text-[#5C6A60]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full border border-[#ECE7DC] bg-white hover:bg-[#F3EFE6] text-[#5C6A60] text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>{isCopied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-[#E5ECE6] text-[#2D5A43] text-xs font-semibold uppercase tracking-wider border border-[#C5DCCE]">
                {typeof service.category === 'object' ? service.category?.name : (service.category || 'General')}
              </span>
              <span className="text-xs text-[#717E73]">
                Posted {new Date(service.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1B382B] leading-tight">
              {service.title}
            </h1>
          </div>

          {/* Cover Photo */}
          {service.cover_image && (
            <div className="rounded-3xl overflow-hidden border border-[#ECE7DC] shadow-md max-h-96 w-full bg-[#EAE5D8]">
              <img
                src={service.cover_image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Service Description */}
          <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#1B382B]">
              About This Service
            </h2>
            <div className="text-sm sm:text-base text-[#4A5E4F] leading-relaxed whitespace-pre-line font-sans">
              {service.description}
            </div>

            {/* Skills / Tags */}
            {service.tags && service.tags.length > 0 && (
              <div className="pt-4 border-t border-[#ECE7DC] space-y-2">
                <p className="text-xs font-semibold text-[#717E73] uppercase tracking-wider">
                  Relevant Skills & Software
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[#F6F2E9] text-[#1B382B] text-xs font-medium border border-[#ECE7DC]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Freelancer Profile Card */}
          <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#1B382B]">
              Offered by Student Freelancer
            </h2>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EFEAE0] border border-[#DDD5C5] flex items-center justify-center font-serif text-xl font-bold text-[#1B382B] shrink-0">
                {freelancerProfile?.avatar_url ? (
                  <img
                    src={freelancerProfile.avatar_url}
                    alt={freelancerProfile.full_name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  freelancerProfile?.full_name?.charAt(0).toUpperCase() || 'S'
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-[#1B382B] text-lg">
                    {freelancerProfile?.full_name || 'GPM Student'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#E5ECE6] text-[#2D5A43] text-[10px] font-bold border border-[#C5DCCE]">
                    GPM Student
                  </span>
                </div>
                <p className="text-xs text-[#2D5A43] font-medium mt-0.5">
                  {service.freelancer?.title || 'Student Freelancer'}
                </p>
                <p className="text-xs text-[#717E73] mt-0.5">
                  {freelancerProfile?.department || 'Government Polytechnic Malvan'}
                  {freelancerProfile?.year_of_study ? ` &bull; Year ${freelancerProfile.year_of_study}` : ''}
                </p>
              </div>

              <Link
                to={`/freelancers/${service.freelancer_id}`}
                className="text-xs font-semibold text-[#1B382B] bg-[#EFEAE0] hover:bg-[#E3DCCE] px-4 py-2 rounded-full border border-[#DDD5C5] transition-all shrink-0"
              >
                View Profile
              </Link>
            </div>

            {service.freelancer?.bio && (
              <p className="text-xs sm:text-sm text-[#5C6A60] leading-relaxed border-t border-[#ECE7DC] pt-4">
                {service.freelancer.bio}
              </p>
            )}
          </div>

          {/* Student Reviews Section */}
          <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1B382B]">Student Reviews</h2>
                <p className="text-xs text-[#717E73] mt-0.5">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} from fellow students
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-[#FEFDE8] border border-[#F6EAA8] px-3 py-1.5 rounded-full text-xs font-bold text-[#1B382B]">
                <Star className="w-4 h-4 text-[#B7950B] fill-[#B7950B]" />
                <span>
                  {reviews.length > 0 ? (service.rating || 0).toFixed(1) : 'New'}
                </span>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-4 divide-y divide-[#ECE7DC]">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#EFEAE0] flex items-center justify-center text-xs font-bold text-[#1B382B]">
                          {rev.student?.full_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#1B382B]">{rev.student?.full_name || 'GPM Student'}</p>
                          <p className="text-[10px] text-[#717E73]">{new Date(rev.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'text-[#B7950B] fill-[#B7950B]' : 'text-[#DDD5C5]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#5C6A60] leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-[#FBF9F4] rounded-2xl border border-dashed border-[#DDD5C5]">
                <p className="text-xs text-[#717E73]">No peer reviews yet for this service.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Pricing & Order Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 shadow-md sticky top-24 space-y-6">
            <div>
              <span className="text-xs font-semibold text-[#717E73] uppercase tracking-wider">Service Fee</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#1B382B]">
                  ₹{service.price}
                </span>
                <span className="text-xs text-[#717E73]">/ completion</span>
              </div>
            </div>

            {/* Specs Checklist */}
            <div className="space-y-3 py-4 border-y border-[#ECE7DC] text-xs">
              <div className="flex items-center justify-between text-[#5C6A60]">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2D5A43]" /> Turnaround Time
                </span>
                <span className="font-semibold text-[#1B382B]">{service.delivery_days} days</span>
              </div>
              <div className="flex items-center justify-between text-[#5C6A60]">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#2D5A43]" /> Revisions Allowed
                </span>
                <span className="font-semibold text-[#1B382B]">{service.revisions_allowed} revisions</span>
              </div>
              <div className="flex items-center justify-between text-[#5C6A60]">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A43]" /> Student Safe
                </span>
                <span className="font-semibold text-[#2D5A43]">GPM Verified</span>
              </div>
            </div>

            {/* Action CTAs */}
            {isOwnService ? (
              <Link
                to={`/freelancer/services/edit/${service.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#EFEAE0] hover:bg-[#E3DCCE] text-[#1B382B] border border-[#DDD5C5] font-semibold text-sm transition-all"
              >
                Edit Your Service
              </Link>
            ) : (
              <div className="space-y-3">
                <Link
                  to={user ? `/orders/new/${service.id}` : '/login'}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Briefcase className="w-4 h-4" />
                  Request This Service
                </Link>

                {user && (
                  <Link
                    to="/messages"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full border border-[#ECE7DC] hover:bg-[#F3EFE6] text-[#1B382B] font-medium text-xs transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-[#2D5A43]" />
                    Message Freelancer
                  </Link>
                )}
              </div>
            )}

            <div className="p-3.5 rounded-2xl bg-[#F6F2E9] border border-[#EAE3D2] flex items-start gap-2 text-[11px] text-[#5C6A60]">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#2D5A43]" />
              <span>
                By GPM Students, For GPM Students. Milestone reviews ensure quality academic guidance and peer satisfaction.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
