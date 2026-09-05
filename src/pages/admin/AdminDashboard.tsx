import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Layers,
  BookOpen,
  ShoppingBag,
  ShieldAlert,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    students: 0,
    freelancers: 0,
    services: 0,
    orders: 0,
    resources: 0,
    complaints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setIsLoading(true);
    try {
      const [pRes, fRes, sRes, oRes, rRes, cRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('freelancers').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('academic_resources').select('id', { count: 'exact', head: true }),
        supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        students: pRes.count || 0,
        freelancers: fRes.count || 0,
        services: sRes.count || 0,
        orders: oRes.count || 0,
        resources: rRes.count || 0,
        complaints: cRes.count || 0,
      });
    } catch (err) {
      console.error('Error loading admin overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const adminSections = [
    {
      title: 'Students Roster',
      desc: 'Verify institutional identity and department enrollments',
      count: stats.students,
      to: '/admin/students',
      icon: Users,
      color: 'bg-[#E5ECE6] text-[#2D5A43]',
    },
    {
      title: 'Freelancers Directory',
      desc: 'Peer freelancers, skill verification, and capability ratings',
      count: stats.freelancers,
      to: '/admin/freelancers',
      icon: Briefcase,
      color: 'bg-[#EFEAE0] text-[#1B382B]',
    },
    {
      title: 'Services Catalog',
      desc: 'Moderate campus offerings, pricing, and project turnaround',
      count: stats.services,
      to: '/admin/services',
      icon: Layers,
      color: 'bg-[#F2EDFB] text-[#7E57C2]',
    },
    {
      title: 'Academic Resources',
      desc: 'Manage syllabus, manuals, and question paper vault uploads',
      count: stats.resources,
      to: '/admin/resources',
      icon: BookOpen,
      color: 'bg-[#EBF5FB] text-[#2980B9]',
    },
    {
      title: 'Orders & Deliveries',
      desc: 'Monitor lifecycle fulfillment and milestone progression',
      count: stats.orders,
      to: '/admin/orders',
      icon: ShoppingBag,
      color: 'bg-[#FEFDE8] text-[#B7950B]',
    },
    {
      title: 'Grievance Desk',
      desc: 'Review student inquiries, disputes, and conduct tickets',
      count: stats.complaints,
      to: '/admin/complaints',
      icon: ShieldAlert,
      color: stats.complaints > 0 ? 'bg-[#FDF2E9] text-[#B85D36]' : 'bg-[#F6F2E9] text-[#717E73]',
    },
    {
      title: 'Institutional Reports',
      desc: 'Live analytical breakdown for MSBTE and college records',
      count: 'Live',
      to: '/admin/reports',
      icon: BarChart3,
      color: 'bg-[#F4F7F4] text-[#2D5A43]',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-[#1B382B] text-[#FBF9F4] rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="px-3.5 py-1 rounded-full bg-[#2D5A43] text-[#E5ECE6] text-xs font-semibold uppercase tracking-wider border border-[#3E6E50]">
            Faculty & Administrative Hub
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            GPM Malvan Admin Panel
          </h1>
          <p className="text-sm sm:text-base text-[#D0DCD2] leading-relaxed">
            Institutional moderation, real-time database verification, and service management for Government Polytechnic Malvan (MSBTE Institute Code: 0015).
          </p>
        </div>
      </div>

      {/* Admin Sections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Link
              key={sec.title}
              to={sec.to}
              className="bg-white rounded-3xl border border-[#ECE7DC] p-6 hover:shadow-xl hover:shadow-[#1B382B]/5 hover:border-[#2D5A43]/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sec.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-serif text-2xl font-bold text-[#1B382B]">
                    {sec.count}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#1B382B] group-hover:text-[#2D5A43] transition-colors">
                  {sec.title}
                </h3>
                <p className="text-xs text-[#5C6A60] mt-1 leading-relaxed">
                  {sec.desc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#ECE7DC] flex items-center justify-between text-xs font-semibold text-[#1B382B] group-hover:text-[#2D5A43]">
                <span>Manage</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
