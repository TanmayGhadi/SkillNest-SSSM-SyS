import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order, Profile } from '../../types/database';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<(Order & { student?: Profile; freelancer?: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, student:profiles!orders_student_id_fkey(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
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
        <h1 className="font-serif text-3xl font-bold text-[#1B382B]">Orders Management</h1>
        <p className="text-xs sm:text-sm text-[#5C6A60] mt-0.5">
          Campus order tracking, lifecycle stages, and delivery satisfaction ({orders.length} total orders).
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#ECE7DC] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#717E73]">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#ECE7DC] bg-[#FBF9F4] text-[#5C6A60] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-5">Project Title</th>
                  <th className="py-3.5 px-5">Student Client</th>
                  <th className="py-3.5 px-5">Price (₹)</th>
                  <th className="py-3.5 px-5">Lifecycle Status</th>
                  <th className="py-3.5 px-5">Date Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DC]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FBF9F4] transition">
                    <td className="py-4 px-5 font-mono text-[#2D5A43] font-semibold">#{o.id.slice(0, 8)}</td>
                    <td className="py-4 px-5 font-semibold text-[#1B382B] max-w-xs truncate">{o.title}</td>
                    <td className="py-4 px-5 text-[#5C6A60]">{o.student?.full_name || 'GPM Student'}</td>
                    <td className="py-4 px-5 font-bold text-[#1B382B]">₹{o.agreed_price}</td>
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        o.status === 'completed'
                          ? 'bg-[#E5ECE6] text-[#2D5A43]'
                          : o.status === 'in_progress'
                          ? 'bg-[#EBF5FB] text-[#2980B9]'
                          : o.status === 'submitted'
                          ? 'bg-[#FEFDE8] text-[#B7950B]'
                          : 'bg-[#F6F2E9] text-[#717E73]'
                      }`}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[#717E73]">
                      {new Date(o.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#717E73]">
            No service orders placed yet in the database.
          </div>
        )}
      </div>
    </div>
  );
};
