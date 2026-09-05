import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  FileText,
  Search,
  ArrowRight,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order, FreelancerProfile, Profile } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();

  const [orders, setOrders] = useState<(Order & { freelancer?: FreelancerProfile & { profile?: Profile } })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStudentOrders();
    }
  }, [user]);

  const loadStudentOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, freelancer:freelancers(*, profile:profiles(*))')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching student orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeOrders = orders.filter((o) => ['requested', 'accepted', 'in_progress', 'submitted', 'revision_requested'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.agreed_price || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#1B382B] text-[#FBF9F4] rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#A7C1A9] uppercase tracking-wider">
            Student Workspace
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-[#D0DCD2]">
            {profile?.department} &bull; Year {profile?.year || 'FY'} Diploma
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E5ECE6] hover:bg-white text-[#1B382B] font-semibold text-xs transition shadow-sm"
          >
            <Search className="w-4 h-4" /> Browse Services
          </Link>
          <Link
            to="/student/requests"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-[#FBF9F4] font-semibold text-xs border border-white/20 transition"
          >
            My Requests
          </Link>
        </div>
      </div>

      {/* Real Dynamic Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#1B382B]">
            {orders.length}
          </p>
          <p className="text-xs text-[#717E73] font-medium">Total Orders Placed</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#2D5A43]">
            {activeOrders.length}
          </p>
          <p className="text-xs text-[#717E73] font-medium">Active In-Flight</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#1B382B]">
            {completedOrders.length}
          </p>
          <p className="text-xs text-[#717E73] font-medium">Completed Deliveries</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#2D5A43]">
            ₹{totalSpent}
          </p>
          <p className="text-xs text-[#717E73] font-medium">Invested in Peer Guidance</p>
        </div>
      </div>

      {/* Recent In-Flight Orders */}
      <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B382B]">Recent Service Requests</h2>
            <p className="text-xs text-[#5C6A60] mt-0.5">Track lifecycle milestones and submissions</p>
          </div>
          <Link
            to="/student/requests"
            className="text-xs font-semibold text-[#1B382B] hover:text-[#2D5A43] flex items-center gap-1"
          >
            Manage All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-20 bg-[#F6F2E9] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="divide-y divide-[#ECE7DC]">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        order.status === 'completed'
                          ? 'bg-[#E5ECE6] text-[#2D5A43]'
                          : order.status === 'submitted'
                          ? 'bg-[#FEFDE8] text-[#B7950B]'
                          : order.status === 'in_progress'
                          ? 'bg-[#EBF5FB] text-[#2980B9]'
                          : 'bg-[#F6F2E9] text-[#717E73]'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[#717E73]">
                      Due {order.deadline ? new Date(order.deadline).toLocaleDateString('en-IN') : 'Flexible'}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-[#1B382B] text-base">{order.title}</h4>
                  <p className="text-xs text-[#5C6A60]">
                    Freelancer: {order.freelancer?.profile?.full_name || 'GPM Student'} &bull; Agreed: ₹{order.agreed_price}
                  </p>
                </div>

                <Link
                  to="/student/requests"
                  className="px-4 py-2 rounded-full bg-[#EAE5D8] hover:bg-[#DDD5C5] text-[#1B382B] text-xs font-semibold transition shrink-0 self-start sm:self-center"
                >
                  View Details & Status
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No orders yet."
            description="You have not requested any technical services or project help yet. Explore active services from peers at Government Polytechnic Malvan."
            actionLabel="Browse Services"
            actionTo="/services"
          />
        )}
      </div>
    </div>
  );
};
