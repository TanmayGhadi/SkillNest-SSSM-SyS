import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, ArrowRight, Briefcase } from 'lucide-react';
import { FreelancerProfile, Profile } from '../types/database';

interface FreelancerCardProps {
  freelancer: FreelancerProfile & { profile?: Profile };
}

export const FreelancerCard: React.FC<FreelancerCardProps> = ({ freelancer }) => {
  const profile = freelancer.profile;
  const rating = freelancer.rating || 0;
  const reviewsCount = freelancer.reviews_count || 0;

  return (
    <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 hover:shadow-xl hover:shadow-[#1B382B]/5 transition-all duration-300 flex flex-col justify-between group hover:border-[#2D5A43]/40 relative overflow-hidden">
      <div>
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#EAE5D8] border border-[#DDD5C5] flex items-center justify-center overflow-hidden font-serif text-2xl font-bold text-[#1B382B]">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile?.full_name?.charAt(0).toUpperCase() || 'F'
              )}
            </div>
            {freelancer.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-[#1B382B] text-[#FBF9F4] p-1 rounded-full shadow-sm" title="Verified GPM Student">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg font-bold text-[#1B382B] truncate group-hover:text-[#2D5A43] transition-colors">
              {profile?.full_name || 'GPM Student'}
            </h3>
            <p className="text-xs text-[#2D5A43] font-semibold truncate mt-0.5">
              {freelancer.title || 'Student Freelancer'}
            </p>
            <p className="text-xs text-[#717E73] mt-0.5">
              {profile?.department || 'Government Polytechnic Malvan'}
              {profile?.year_of_study ? ` • Year ${profile.year_of_study}` : ''}
            </p>
          </div>
        </div>

        {freelancer.bio && (
          <p className="text-xs sm:text-sm text-[#5C6A60] mt-4 line-clamp-2 leading-relaxed">
            {freelancer.bio}
          </p>
        )}

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {freelancer.skills && freelancer.skills.length > 0 ? (
            freelancer.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded-full bg-[#F6F2E9] text-[#1B382B] text-xs font-medium border border-[#ECE7DC]"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-xs text-[#717E73] italic">No skills listed yet</span>
          )}
          {freelancer.skills && freelancer.skills.length > 4 && (
            <span className="px-2 py-1 rounded-full bg-[#EFEAE0] text-[#717E73] text-xs font-medium">
              +{freelancer.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#ECE7DC] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-[#B85D36] fill-[#B85D36]" />
          <span className="text-sm font-bold text-[#1B382B]">
            {reviewsCount > 0 ? rating.toFixed(1) : 'New'}
          </span>
          <span className="text-xs text-[#717E73]">
            ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        <Link
          to={`/freelancers/${freelancer.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B382B] hover:text-[#2D5A43] bg-[#EAE5D8] hover:bg-[#DDD5C5] px-4 py-2 rounded-full transition-all"
        >
          View Profile
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
