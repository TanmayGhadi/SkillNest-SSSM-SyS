import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Star,
  Clock,
  Layers,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Service } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';

export const MyServices: React.FC = () => {
  const { freelancerProfile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (freelancerProfile) {
      loadServices();
    }
  }, [freelancerProfile]);

  const loadServices = async () => {
    if (!freelancerProfile) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('freelancer_id', freelancerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching freelancer services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      loadServices();
    } catch (err) {
      console.error('Error toggling service status:', err);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? All existing requests will remain.')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      loadServices();
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1B382B]">
            My Published Services
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6A60] mt-1">
            Manage your project offerings, pricing, and availability on SkillNest.
          </p>
        </div>

        <Link
          to="/freelancer/services/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs shadow-md transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create New Service
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-white rounded-3xl border border-[#ECE7DC] animate-pulse" />
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-3xl border border-[#ECE7DC] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#2D5A43]/40 transition-all"
            >
              <div className="flex items-start gap-4 flex-1">
                {service.cover_image && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#F4EFE6] border border-[#ECE7DC] shrink-0 hidden sm:block">
                    <img
                      src={service.cover_image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-[#EFEAE0] text-[#1B382B] text-xs font-semibold border border-[#E2D9C8]">
                      {service.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        service.is_active
                          ? 'bg-[#E5ECE6] text-[#2D5A43]'
                          : 'bg-[#F6F2E9] text-[#717E73]'
                      }`}
                    >
                      {service.is_active ? 'Publicly Visible' : 'Draft / Paused'}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-[#1B382B] text-lg line-clamp-1">
                    {service.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-[#717E73] flex-wrap">
                    <span className="font-serif font-bold text-[#1B382B] text-base">₹{service.price}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2D5A43]" /> {service.delivery_days} days
                    </span>
                    <span>&bull;</span>
                    <span>{service.revisions_allowed} revisions</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-[#B85D36] fill-[#B85D36]" />{' '}
                      {(service.rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Link
                  to={`/services/${service.id}`}
                  target="_blank"
                  className="p-2.5 rounded-full border border-[#ECE7DC] hover:bg-[#F3EFE6] text-[#5C6A60] transition"
                  title="Preview Service Page"
                >
                  <Eye className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleToggleActive(service)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                    service.is_active
                      ? 'bg-[#F6F2E9] hover:bg-[#EAE5D8] text-[#1B382B]'
                      : 'bg-[#E5ECE6] text-[#2D5A43] hover:bg-[#D5E4D7]'
                  }`}
                >
                  {service.is_active ? 'Pause' : 'Activate'}
                </button>

                <Link
                  to={`/freelancer/services/edit/${service.id}`}
                  className="p-2.5 rounded-full border border-[#ECE7DC] hover:bg-[#F3EFE6] text-[#1B382B] transition"
                  title="Edit Service"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="p-2.5 rounded-full border border-[#ECE7DC] hover:bg-rose-50 text-rose-600 transition"
                  title="Delete Service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No services available yet."
          description="Create your first gig on SkillNest to offer project mentoring, AutoCAD drafting, or MSBTE lab practical assistance."
          actionLabel="Create Service"
          actionTo="/freelancer/services/new"
        />
      )}
    </div>
  );
};
