import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FreelancerProfile, Profile } from '../../types/database';

export const AdminFreelancers: React.FC = () => {
  const [freelancers, setFreelancers] = useState<(FreelancerProfile & { profile?: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFreelancers();
  }, []);

  const loadFreelancers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('freelancers')
        .select('*, profile:profiles(*)')
        .order('rating', { ascending: false });

      if (error) throw error;
      setFreelancers((data as (FreelancerProfile & { profile?: Profile })[]) || []);
    } catch (err) {
      console.error('Error fetching freelancers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6A60] hover:text-[#1B382B] mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#1B382B]">Student Freelancers Administration</h1>
        <p className="text-xs sm:text-sm text-[#5C6A60] mt-0.5">
          Peer freelancer profiles, capabilities, and reputation monitoring ({freelancers.length} active freelancers).
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#ECE7DC] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#717E73]">Loading freelancer directory...</div>
        ) : freelancers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#ECE7DC] bg-[#FBF9F4] text-[#5C6A60] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Freelancer</th>
                  <th className="py-3.5 px-5">Headline / Title</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Rating</th>
                  <th className="py-3.5 px-5">Orders Completed</th>
                  <th className="py-3.5 px-5">Skills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DC]">
                {freelancers.map((f) => (
                  <tr key={f.id} className="hover:bg-[#FBF9F4] transition">
                    <td className="py-4 px-5 font-semibold text-[#1B382B]">
                      <div className="flex items-center gap-2">
                        <span>{f.profile?.full_name || 'GPM Student'}</span>
                        <ShieldCheck className="w-4 h-4 text-[#2D5A43]" />
                      </div>
                    </td>
                    <td className="py-4 px-5 text-[#5C6A60]">{f.title || 'Student Freelancer'}</td>
                    <td className="py-4 px-5 text-[#5C6A60]">{f.profile?.department || 'GPM Malvan'}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1 font-bold text-[#1B382B]">
                        <Star className="w-3.5 h-3.5 text-[#B85D36] fill-[#B85D36]" />
                        <span>{(f.rating || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-[#5C6A60] font-semibold">
                      {f.completed_orders || f.completed_orders_count || 0} orders
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {f.skills?.slice(0, 3).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-full bg-[#EFEAE0] text-[#1B382B] text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#717E73]">
            No student freelancer profiles registered yet.
          </div>
        )}
      </div>
    </div>
  );
};
