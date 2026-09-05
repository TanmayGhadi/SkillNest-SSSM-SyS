import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Star,
  Plus,
  Clock,
  Layers,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order, Service, FreelancerProfile, Profile } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';

export const FreelancerDashboard: React.FC = () => {
  const { user, freelancerProfile } = useAuth();

  const [orders, setOrders] = useState<(Order & { student?: Profile })[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (freelancerProfile) {
      loadFreelancerData();
    }
  }, [freelancerProfile]);

  const loadFreelancerData = async () => {
    if (!freelancerProfile) return;
    setIsLoading(true);
    try {
      // 1. Fetch orders for this freelancer
      const { data: oData, error: oError } = await supabase
        .from('orders')
        .select('*, student:profiles!orders_student_id_fkey(*)')
        .eq('freelancer_id', freelancerProfile.id)
        .order('created_at', { ascending: false });

      if (oError) throw oError;
      setOrders(oData || []);

      // 2. Fetch active services by this freelancer
      const { data: sData, error: sError } = await supabase
        .from('services')
        .select('*')
        .eq('freelancer_id', freelancerProfile.id);

      if (sError) throw sError;
      setServices(sData || []);
    } catch (err) {
      console.error('Error loading freelancer dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const activeOrders = orders.filter((o) => ['requested', 'accepted', 'in_progress', 'submitted', 'revision_requested'].includes(o.status));
  const totalEarnings = completedOrders.reduce((acc, o) => acc + (o.agreed_price || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'requested');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Freelancer Header Banner */}
      <div className="bg-[#1B382B] text-[#FBF9F4] rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-[#A7C1A9] uppercase tracking-wider">
            Freelancer Studio
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            {freelancerProfile?.title || 'Student Freelancer'}
          </h1>
          <p className="text-xs sm:text-sm text-[#D0DCD2]">
            Fulfill client milestones, draft CAD/code deliverables, and earn from your skills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/freelancer/services/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E5ECE6] hover:bg-white text-[#1B382B] font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Create Service
          </Link>
          <Link
            to="/freelancer/orders"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-[#FBF9F4] font-semibold text-xs border border-white/20 transition"
          >
            Active Orders
          </Link>
        </div>
      </div>

      {/* Real Dynamic Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#1B382B]">
            ₹{totalEarnings}
          </p>
          <p className="text-xs text-[#717E73] font-medium">Total Earned</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#2D5A43]">
            {activeOrders.length}
          </p>
          <p className="text-xs text-[#717E73] font-medium">Active Jobs</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <p className="font-serif text-3xl font-bold text-[#1B382B]">
            {services.length}
          </p>
          <p className="text-xs text-[#717E73] font-medium">Published Services</p>
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Star className="w-5 h-5 text-[#B85D36] fill-[#B85D36]" />
            <p className="font-serif text-3xl font-bold text-[#1B382B]">
              {freelancerProfile?.rating ? freelancerProfile.rating.toFixed(1) : 'New'}
            </p>
          </div>
          <p className="text-xs text-[#717E73] font-medium">
            Rating ({freelancerProfile?.reviews_count || 0} reviews)
          </p>
        </div>
      </div>

      {/* Pending Requests Alert */}
      {pendingOrders.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#FDF2E9] border border-[#F6D7C3] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#B85D36] shrink-0" />
            <div>
              <h4 className="font-serif font-bold text-[#1B382B] text-base">
                You have {pendingOrders.length} pending service request{pendingOrders.length > 1 ? 's' : ''}!
              </h4>
              <p className="text-xs text-[#5C6A60]">Review requirements and accept or decline the project.</p>
            </div>
          </div>
          <Link
            to="/freelancer/orders"
            className="px-5 py-2.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] text-xs font-semibold shrink-0 transition"
          >
            Review Requests
          </Link>
        </div>
      )}

      {/* Active Deliveries & Services Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Active Orders */}
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#1B382B]">Active Deliveries</h2>
            <Link
              to="/freelancer/orders"
              className="text-xs font-semibold text-[#1B382B] hover:text-[#2D5A43] flex items-center gap-1"
            >
              All Orders <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {activeOrders.length > 0 ? (
            <div className="space-y-4 divide-y divide-[#ECE7DC]">
              {activeOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F6F2E9] text-[#1B382B] capitalize">
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-serif font-bold text-[#1B382B]">₹{order.agreed_price}</span>
                  </div>
                  <h4 className="font-serif font-bold text-[#1B382B] text-base">{order.title}</h4>
                  <div className="flex items-center justify-between text-xs text-[#717E73]">
                    <span>Client: {order.student?.full_name || 'GPM Student'}</span>
                    <span>Due: {order.deadline ? new Date(order.deadline).toLocaleDateString('en-IN') : 'Flexible'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-2">
              <Briefcase className="w-8 h-8 text-[#717E73] mx-auto opacity-40" />
              <p className="text-xs text-[#5C6A60]">No active client jobs in progress.</p>
            </div>
          )}
        </div>

        {/* Right: Published Services */}
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-[#1B382B]">Your Published Services</h2>
            <Link
              to="/freelancer/services"
              className="text-xs font-semibold text-[#1B382B] hover:text-[#2D5A43] flex items-center gap-1"
            >
              Manage <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {services.length > 0 ? (
            <div className="space-y-4 divide-y divide-[#ECE7DC]">
              {services.slice(0, 4).map((service) => (
                <div key={service.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif font-bold text-[#1B382B] text-sm line-clamp-1">{service.title}</h4>
                    <p className="text-xs text-[#717E73]">{typeof service.category === 'object' ? service.category?.name : (service.category || 'General')} &bull; ₹{service.price}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                      service.is_active
                        ? 'bg-[#E5ECE6] text-[#2D5A43]'
                        : 'bg-[#F6F2E9] text-[#717E73]'
                    }`}
                  >
                    {service.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-3">
              <Layers className="w-8 h-8 text-[#717E73] mx-auto opacity-40" />
              <p className="text-xs text-[#5C6A60]">Your freelancer dashboard is ready.</p>
              <Link
                to="/freelancer/services/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#1B382B] text-[#FBF9F4] font-semibold text-xs shadow-sm hover:bg-[#254B3A] transition"
              >
                <Plus className="w-4 h-4" /> Create your first service to get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
