import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code,
  FileText,
  Palette,
  Printer,
  Briefcase,
  ChevronRight,
  Star,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Service, FreelancerProfile, Profile } from '../types/database';
import { ServiceCard } from '../components/ServiceCard';
import { FreelancerCard } from '../components/FreelancerCard';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { mode, switchMode } = useMode();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0,
    services: 0,
    resources: 0,
    rating: 0,
  });
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [featuredFreelancers, setFeaturedFreelancers] = useState<(FreelancerProfile & { profile?: Profile })[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch real dynamic counts from database
      const [studentsRes, servicesRes, resourcesRes, reviewsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('academic_resources').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('rating'),
      ]);

      const totalReviews = reviewsRes.data?.length || 0;
      const avgRating = totalReviews > 0
        ? reviewsRes.data!.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / totalReviews
        : 0;

      setStats({
        students: studentsRes.count || 0,
        services: servicesRes.count || 0,
        resources: resourcesRes.count || 0,
        rating: avgRating,
      });

      // 2. Fetch real active services (limit 6)
      const { data: sData } = await supabase
        .from('services')
        .select('*, freelancer:freelancers(*, profile:profiles(*))')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (sData) setFeaturedServices(sData as Service[]);

      // 3. Fetch real top freelancers (limit 3)
      const { data: fData } = await supabase
        .from('freelancers')
        .select('*, profile:profiles(*)')
        .order('rating', { ascending: false })
        .limit(3);

      if (fData) setFeaturedFreelancers(fData as (FreelancerProfile & { profile?: Profile })[]);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const categories = [
    {
      id: 'academic',
      name: 'Academic Resources',
      subtitle: `${stats.resources} Materials`,
      icon: BookOpen,
      iconBg: 'bg-[#F2EDFB] text-[#7E57C2]',
    },
    {
      id: 'projects',
      name: 'Projects & Development',
      subtitle: `${stats.services} Services`,
      icon: Code,
      iconBg: 'bg-[#EBF5FB] text-[#2980B9]',
    },
    {
      id: 'ppt',
      name: 'PPT & Documents',
      subtitle: 'Reports & Seminars',
      icon: FileText,
      iconBg: 'bg-[#FDF2E9] text-[#D35400]',
    },
    {
      id: 'design',
      name: 'Design & Media',
      subtitle: 'Posters & UI/UX',
      icon: Palette,
      iconBg: 'bg-[#E8F8F5] text-[#16A085]',
    },
    {
      id: 'printing',
      name: 'Printing Services',
      subtitle: 'Campus Notes Pickup',
      icon: Printer,
      iconBg: 'bg-[#FEFDE8] text-[#B7950B]',
    },
    {
      id: 'career',
      name: 'Career & Professional',
      subtitle: 'Resume & Mentorship',
      icon: Briefcase,
      iconBg: 'bg-[#FDEDEC] text-[#C0392B]',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-[#FBF9F4]">
        
        {/* Subtle Decorative Botanical Sprig SVG Watermark */}
        <div className="absolute top-8 right-6 opacity-20 pointer-events-none hidden lg:block">
          <svg width="220" height="260" viewBox="0 0 100 120" fill="none" stroke="#2D5A43" strokeWidth="1.2">
            <path d="M50 110 C50 60 70 30 85 10" />
            <path d="M50 85 C65 80 80 82 85 75 C82 65 65 72 50 85" fill="#E5ECE6" />
            <path d="M50 65 C35 58 20 60 15 52 C18 42 35 48 50 65" fill="#E5ECE6" />
            <path d="M50 45 C65 38 78 40 82 32 C78 22 62 30 50 45" fill="#E5ECE6" />
            <path d="M50 25 C38 18 25 20 20 12 C24 5 40 10 50 25" fill="#E5ECE6" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* College Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFEAE0] border border-[#DDD5C5] text-[#1B382B] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#2D5A43] animate-pulse" />
                Government Polytechnic Malvan &bull; MSBTE Code: 0015
              </div>

              {/* Editorial Title */}
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1B382B] leading-[1.08]">
                Learn.<br />
                Share.<br />
                <span className="italic font-serif text-[#2D5A43]">Grow Together.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-[#5C6A60] max-w-xl leading-relaxed font-sans">
                A student-driven platform for Government Polytechnic Malvan students to discover services, share your skills, access academic resources, and be a part of a stronger GPM community.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm transition-all shadow-md hover:shadow-lg group"
                >
                  Explore Services
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {user ? (
                  mode === 'student' ? (
                    <button
                      onClick={() => switchMode('freelancer')}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#EFEAE0] hover:bg-[#E3DCCE] text-[#1B382B] border border-[#DDD5C5] font-semibold text-sm transition-all"
                    >
                      <Briefcase className="w-4 h-4 text-[#2D5A43]" />
                      Switch to Freelancer Mode
                    </button>
                  ) : (
                    <Link
                      to="/freelancer/services/new"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#EFEAE0] hover:bg-[#E3DCCE] text-[#1B382B] border border-[#DDD5C5] font-semibold text-sm transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-[#B85D36]" />
                      Post a Service
                    </Link>
                  )
                ) : (
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#F3EFE6] text-[#1B382B] border border-[#DDD5C5] font-semibold text-sm transition-all shadow-sm"
                  >
                    Join SkillNest
                  </Link>
                )}
              </div>

              {/* Handwritten Note Annotation */}
              <div className="pt-2 flex items-center gap-2 text-[#2D5A43] font-handwriting text-lg sm:text-xl">
                <span>↳</span>
                <span>Exclusively for Government Polytechnic Malvan students ✨</span>
              </div>
            </div>

            {/* Right Campus Photo Card with Polaroid tilt */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              
              {/* Paper sticker */}
              <div className="absolute -top-4 -left-2 z-20 bg-[#FFFDF8] border border-[#EAE3D2] px-4 py-1.5 rounded-xl shadow-md rotate-[-4deg] font-handwriting text-lg text-[#1B382B]">
                “Students Help Students” 🌿
              </div>

              {/* Main Photo Card */}
              <div className="bg-white p-3.5 pb-5 rounded-3xl shadow-xl border border-[#ECE7DC] max-w-md w-full rotate-[1.5deg] hover:rotate-0 transition-transform duration-500">
                <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-[#EAE5D8] relative">
                  <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1000&q=80"
                    alt="Government Polytechnic Malvan Campus"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14261C]/50 via-transparent to-transparent" />
                </div>
                
                <div className="text-center pt-3">
                  <p className="font-handwriting text-xl text-[#1B382B]">
                    Government Polytechnic Malvan – Est. 1985
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Floating Search Pill Bar */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-4 sm:p-5 shadow-lg space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9AA59D]" />
              <input
                type="text"
                placeholder="Search for services, resources or students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/30 border border-[#EAE5D8]"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs transition shadow-sm shrink-0"
            >
              Search
            </button>
          </form>

          {/* Popular Tag Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-[#717E73] font-medium mr-1">Popular:</span>
            {[
              { label: 'PPT', query: 'ppt', icon: '📄' },
              { label: 'Notes', query: 'notes', icon: '📋' },
              { label: 'Projects', query: 'capstone', icon: '</>' },
              { label: 'Printing', query: 'printing', icon: '🖨️' },
              { label: 'Design', query: 'design', icon: '🎨' },
              { label: 'Web Development', query: 'web', icon: '💻' },
              { label: 'PYQs', query: 'question paper', icon: '❓' },
            ].map((tag) => (
              <Link
                key={tag.label}
                to={`/services?q=${encodeURIComponent(tag.query)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6F2E9] hover:bg-[#EAE5D8] text-[#1B382B] border border-[#ECE7DC] transition-all"
              >
                <span>{tag.icon}</span>
                <span>{tag.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid: "Campus Directory" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-[#E5ECE6] text-[#2D5A43] text-xs font-semibold uppercase tracking-wider border border-[#C5DCCE]">
            Campus Directory
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1B382B]">
            Explore by Department & Need
          </h2>
          <p className="text-sm text-[#5C6A60]">
            Everything you need for diploma excellence, shared right within our GPM corridors.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                to={`/services?category=${cat.id}`}
                className="bg-white rounded-2xl border border-[#ECE7DC] p-5 text-center flex flex-col items-center justify-center hover:shadow-md hover:border-[#2D5A43]/30 transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${cat.iconBg} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-xs text-[#1B382B] group-hover:text-[#2D5A43] transition-colors line-clamp-1">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-[#717E73] mt-1">
                  {cat.subtitle}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Real Dynamic Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-8 sm:p-10 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="font-serif text-3xl sm:text-4xl font-bold text-[#1B382B]">
              {stats.students}
            </p>
            <p className="text-xs font-medium text-[#717E73]">GPM Students</p>
          </div>
          <div className="space-y-1">
            <p className="font-serif text-3xl sm:text-4xl font-bold text-[#1B382B]">
              {stats.services}
            </p>
            <p className="text-xs font-medium text-[#717E73]">Campus Services</p>
          </div>
          <div className="space-y-1">
            <p className="font-serif text-3xl sm:text-4xl font-bold text-[#1B382B]">
              {stats.resources}
            </p>
            <p className="text-xs font-medium text-[#717E73]">Academic Resources</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 font-serif text-3xl sm:text-4xl font-bold text-[#1B382B]">
              <span>{stats.rating > 0 ? stats.rating.toFixed(1) : 'New'}</span>
              <Star className="w-6 h-6 text-[#2D5A43] fill-[#2D5A43]" />
            </div>
            <p className="text-xs font-medium text-[#717E73]">Community Rating</p>
          </div>
        </div>
      </section>

      {/* Featured Campus Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#FDF2E9] text-[#B85D36] text-xs font-semibold uppercase tracking-wider border border-[#F6D7C3]">
              Student Offerings
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1B382B] mt-2">
              Featured Campus Services
            </h2>
            <p className="text-sm text-[#5C6A60] mt-1">
              Discover trusted peer support for upcoming submissions and vivas.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#1B382B] text-[#1B382B] hover:bg-[#1B382B] hover:text-[#FBF9F4] font-semibold text-xs transition-all self-start sm:self-auto"
          >
            View All Services <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-[#ECE7DC] h-72 animate-pulse p-6" />
            ))}
          </div>
        ) : featuredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Services Available Yet"
            description="Be the first student from Government Polytechnic Malvan to offer your skills to peers."
            actionLabel={user ? (mode === 'freelancer' ? 'Create a Service' : 'Become a Freelancer') : 'Join SkillNest to Offer a Service'}
            actionTo={user ? (mode === 'freelancer' ? '/freelancer/services/new' : undefined) : '/signup'}
            onAction={user && mode === 'student' ? () => switchMode('freelancer') : undefined}
          />
        )}
      </section>

      {/* Top Student Freelancers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-[#E5ECE6] text-[#2D5A43] text-xs font-semibold uppercase tracking-wider border border-[#C5DCCE]">
              Campus Talent
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1B382B] mt-2">
              Student Freelancers
            </h2>
            <p className="text-sm text-[#5C6A60] mt-1">
              Skilled peers from Computer, Civil, Mechanical, and Electrical Engineering ready to collaborate.
            </p>
          </div>
          <Link
            to="/freelancers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#1B382B] text-[#1B382B] hover:bg-[#1B382B] hover:text-[#FBF9F4] font-semibold text-xs transition-all self-start sm:self-auto"
          >
            Explore All Freelancers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-[#ECE7DC] h-60 animate-pulse p-6" />
            ))}
          </div>
        ) : featuredFreelancers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFreelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Freelancers Found"
            description="Your SkillNest profile is ready to get started. Activate freelancer capabilities to showcase your coding, drafting, writing, or design skills."
            actionLabel={user ? (mode === 'freelancer' ? 'Edit Your Profile' : 'Become a Freelancer') : 'Register as GPM Student'}
            actionTo={user ? (mode === 'freelancer' ? '/profile' : undefined) : '/signup'}
            onAction={user && mode === 'student' ? () => switchMode('freelancer') : undefined}
          />
        )}
      </section>

      {/* Dual Mode Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1B382B] text-[#FBF9F4] rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-[#2D5A43] text-[#E5ECE6] text-xs font-semibold border border-[#3E6E50]">
              One Account &bull; Seamless Dual Modes
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              Learn in the morning,<br />
              <span className="font-serif italic text-[#A7C1A9]">Earn in the evening.</span>
            </h3>
            <p className="text-sm sm:text-base text-[#D0DCD2] leading-relaxed font-sans">
              Every student registered with Government Polytechnic Malvan can switch effortlessly between <strong>Student Mode</strong> (to request guidance, purchase study solutions, or browse services) and <strong>Freelancer Mode</strong> (to post gigs, accept orders, deliver milestones, and track earnings).
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E5ECE6] hover:bg-white text-[#1B382B] font-semibold text-xs transition-all shadow-sm"
              >
                Learn How SkillNest Works
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
