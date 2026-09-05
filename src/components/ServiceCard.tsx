import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { Service, FreelancerProfile, Profile } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface ServiceCardProps {
  service: Service & { freelancer?: FreelancerProfile & { profile?: Profile } };
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  const freelancer = service.freelancer;
  const profile = freelancer?.profile;
  const rating = service.rating || 0;
  const reviewsCount = service.reviews_count || 0;

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    
    setIsFavorite(!isFavorite);
    try {
      if (!isFavorite) {
        await supabase.from('favorites').insert({
          user_id: user.id,
          service_id: service.id,
        });
      } else {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('service_id', service.id);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-[#ECE7DC] p-5 hover:shadow-xl hover:shadow-[#1B382B]/5 transition-all duration-300 flex flex-col justify-between hover:border-[#2D5A43]/40 relative overflow-hidden">
      
      {/* Decorative subtle leaf watermark */}
      <div className="absolute top-2 right-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <svg className="w-24 h-24 text-[#1B382B]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.4C8 21.4 10 22 12 22c5.5 0 10-4.5 10-10 0-5.5-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8 0-2.4 1-4.5 2.7-6 1.8 2.5 4.5 4 7.6 4.2-.3 1.8-.1 3.7.8 5.4.3.6.7 1.2 1.2 1.7-1.3 1.7-3.4 2.7-5.3 2.7z"/>
        </svg>
      </div>

      <div>
        {/* Cover Photo if present */}
        {service.cover_image && (
          <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-[#F4EFE6] border border-[#ECE7DC] relative">
            <img 
              src={service.cover_image} 
              alt={service.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <button
              onClick={handleFavoriteToggle}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-[#717E73] hover:text-[#B85D36] transition shadow-sm"
              title="Save Service"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'text-[#B85D36] fill-[#B85D36]' : ''}`} />
            </button>
          </div>
        )}

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-3 py-1 rounded-full bg-[#EFEAE0] text-[#1B382B] text-xs font-semibold uppercase tracking-wider border border-[#E2D9C8]">
            {typeof service.category === 'object' ? service.category?.name : (service.category || 'General')}
          </span>

          {!service.cover_image && (
            <button
              onClick={handleFavoriteToggle}
              className="p-1.5 rounded-full hover:bg-[#F4EFE6] text-[#717E73] hover:text-[#B85D36] transition"
              title="Save Service"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'text-[#B85D36] fill-[#B85D36]' : ''}`} />
            </button>
          )}
        </div>

        {/* Service Title */}
        <Link to={`/services/${service.id}`}>
          <h3 className="font-serif text-lg font-bold text-[#1B382B] group-hover:text-[#2D5A43] transition-colors line-clamp-2 leading-snug">
            {service.title}
          </h3>
        </Link>

        {/* Description Snippet */}
        <p className="text-xs text-[#5C6A60] mt-2 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        {/* Turnaround specs */}
        <div className="flex items-center gap-3 mt-4 text-xs text-[#717E73]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#2D5A43]" />
            {service.delivery_days} days
          </span>
          <span>&bull;</span>
          <span>{service.revisions_allowed} revisions</span>
        </div>
      </div>

      {/* Footer: Freelancer info & Price */}
      <div className="mt-5 pt-4 border-t border-[#ECE7DC] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#EAE5D8] border border-[#DDD5C5] flex items-center justify-center font-bold text-xs text-[#1B382B] overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
            ) : (
              profile?.full_name?.charAt(0).toUpperCase() || 'S'
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1B382B] truncate max-w-[110px]">
              {profile?.full_name || 'GPM Student'}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[#717E73]">
              <Star className="w-3 h-3 text-[#B85D36] fill-[#B85D36]" />
              <span className="font-bold text-[#1B382B]">{reviewsCount > 0 ? rating.toFixed(1) : 'New'}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#717E73] block uppercase tracking-wider font-medium">Starts at</span>
          <span className="font-serif text-lg font-bold text-[#1B382B]">₹{service.price}</span>
        </div>
      </div>
    </div>
  );
};
