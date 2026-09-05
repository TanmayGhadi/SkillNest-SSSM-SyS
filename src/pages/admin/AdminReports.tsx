import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowLeft, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GPM_DEPARTMENTS } from '../../types/database';

export const AdminReports: React.FC = () => {
  const [stats, setStats] = useState({
    students: 0,
    freelancers: 0,
    services: 0,
    orders: 0,
    completedOrders: 0,
    resources: 0,
    totalDownloads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const [pRes, fRes, sRes, oRes, rRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('freelancers').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*'),
        supabase.from('academic_resources').select('downloads'),
      ]);

      const ordersData = oRes.data || [];
      const completed = ordersData.filter((o: any) => o.status === 'completed').length;
      const downloadsSum = (rRes.data || []).reduce((acc: number, r: any) => acc + (r.downloads || 0), 0);

      setStats({
        students: pRes.count || 0,
        freelancers: fRes.count || 0,
        services: sRes.count || 0,
        orders: ordersData.length,
        completedOrders: completed,
        resources: rRes.data?.length || 0,
        totalDownloads: downloadsSum,
      });
    } catch (err) {
      console.error('Error generating reports:', err);
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
        <h1 className="font-serif text-3xl font-bold text-[#1B382B]">Institutional Analytics & Reports</h1>
        <p className="text-xs sm:text-sm text-[#5C6A60] mt-0.5">
          Live institutional database metrics for Government Polytechnic Malvan (MSBTE Institute Code: 0015).
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#1B382B]">{stats.students}</p>
          <p className="text-xs text-[#717E73]">Registered Students</p>
        </div>
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#2D5A43]">{stats.services}</p>
          <p className="text-xs text-[#717E73]">Services Created</p>
        </div>
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#1B382B]">{stats.completedOrders}</p>
          <p className="text-xs text-[#717E73]">Completed Deliveries</p>
        </div>
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#2D5A43]">{stats.totalDownloads}</p>
          <p className="text-xs text-[#717E73]">Total Resource Downloads</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#ECE7DC] p-8 shadow-sm space-y-6">
        <h3 className="font-serif text-xl font-bold text-[#1B382B]">Official Department Enrollment Coverage</h3>
        <p className="text-xs text-[#5C6A60]">
          Active technical departments under Government Polytechnic Malvan diploma curriculum.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GPM_DEPARTMENTS.map((dept) => (
            <div key={dept} className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE7DC] space-y-1">
              <h4 className="font-semibold text-xs text-[#1B382B]">{dept}</h4>
              <p className="text-[11px] text-[#2D5A43]">MSBTE Curriculum Active</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
