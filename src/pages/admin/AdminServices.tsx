import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft, Trash2, Eye, CheckCircle2, PauseCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Service } from '../../types/database';

export const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching admin services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      loadServices();
    } catch (err) {
      console.error('Error toggling service status:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6A60] hover:text-[#1B382B] mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#1B382B]">Services Moderation</h1>
        <p className="text-xs sm:text-sm text-[#5C6A60] mt-0.5">
          Review, pause, or reinstate student service offerings across all categories ({services.length} services).
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#ECE7DC] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#717E73]">Loading services catalog...</div>
        ) : services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#ECE7DC] bg-[#FBF9F4] text-[#5C6A60] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Title</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Price (₹)</th>
                  <th className="py-3.5 px-5">Turnaround</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DC]">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FBF9F4] transition">
                    <td className="py-4 px-5 font-semibold text-[#1B382B] max-w-sm truncate">{s.title}</td>
                    <td className="py-4 px-5 text-[#5C6A60]">{s.category}</td>
                    <td className="py-4 px-5 font-bold text-[#1B382B]">₹{s.price}</td>
                    <td className="py-4 px-5 text-[#5C6A60]">{s.delivery_days} days</td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.is_active ? 'bg-[#E5ECE6] text-[#2D5A43]' : 'bg-[#FDF2E9] text-[#B85D36]'
                      }`}>
                        {s.is_active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleToggle(s.id, s.is_active)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                          s.is_active
                            ? 'bg-[#FDF2E9] text-[#B85D36] hover:bg-[#FBE4D6]'
                            : 'bg-[#E5ECE6] text-[#2D5A43] hover:bg-[#D5E4D7]'
                        }`}
                      >
                        {s.is_active ? 'Pause Service' : 'Activate Service'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#717E73]">
            No services currently listed in the database.
          </div>
        )}
      </div>
    </div>
  );
};
