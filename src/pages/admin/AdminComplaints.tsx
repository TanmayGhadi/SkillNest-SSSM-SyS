import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Complaint } from '../../types/database';

export const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      console.error('Error fetching admin complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await supabase
        .from('complaints')
        .update({ status })
        .eq('id', id);
      loadComplaints();
    } catch (err) {
      console.error('Error updating complaint:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6A60] hover:text-[#1B382B] mb-2">
          <ArrowLeft className="w-4 h-4" /> Back to Admin Overview
        </Link>
        <h1 className="font-serif text-3xl font-bold text-[#1B382B]">Complaints & Grievances Desk</h1>
        <p className="text-xs sm:text-sm text-[#5C6A60] mt-0.5">
          Student grievance reports, dispute resolutions, and platform feedback ({complaints.length} tickets).
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#ECE7DC] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#717E73]">Loading tickets...</div>
        ) : complaints.length > 0 ? (
          <div className="divide-y divide-[#ECE7DC]">
            {complaints.map((c) => (
              <div key={c.id} className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1B382B] text-sm">{c.subject}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                      c.status === 'resolved'
                        ? 'bg-[#E5ECE6] text-[#2D5A43]'
                        : 'bg-[#FDF2E9] text-[#B85D36]'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <span className="text-xs text-[#717E73]">
                    {new Date(c.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>

                <p className="text-xs text-[#5C6A60] bg-[#FBF9F4] p-4 rounded-2xl whitespace-pre-line border border-[#ECE7DC]">
                  {c.description}
                </p>

                {c.status !== 'resolved' && (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleStatus(c.id, 'resolved')}
                      className="px-4 py-1.5 rounded-full bg-[#1B382B] text-[#FBF9F4] text-xs font-semibold hover:bg-[#254B3A] transition"
                    >
                      Mark as Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#717E73]">
            No student complaints or grievances logged.
          </div>
        )}
      </div>
    </div>
  );
};
