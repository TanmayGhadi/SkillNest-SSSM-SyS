import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Service } from '../types/database';
import { ServiceCard } from '../components/ServiceCard';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

export const Services: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const queryParam = searchParams.get('q') || '';

  const { user } = useAuth();
  const { mode, switchMode } = useMode();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest');

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'projects', label: 'Projects & Development' },
    { id: 'ppt', label: 'PPT & Documents' },
    { id: 'academic', label: 'Academic Support' },
    { id: 'design', label: 'Design & Media' },
    { id: 'printing', label: 'Printing Services' },
    { id: 'career', label: 'Career & Professional' },
  ];

  useEffect(() => {
    fetchServices();
  }, [selectedCategory, sortBy]);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('services')
        .select('*, freelancer:freelancers(*, profile:profiles(*))')
        .eq('is_active', true);

      if (selectedCategory !== 'all') {
        query = query.ilike('category', `%${selectedCategory}%`);
      }

      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      } else if (sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setServices((data as Service[]) || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const filteredServices = services.filter((srv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const catName = (typeof srv.category === 'object' ? srv.category?.name : (srv.category || '')).toLowerCase();
    return (
      srv.title.toLowerCase().includes(q) ||
      srv.description.toLowerCase().includes(q) ||
      catName.includes(q) ||
      (srv.skills && srv.skills.some((t) => t.toLowerCase().includes(q))) ||
      (srv.tags && srv.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#1B382B] text-[#FBF9F4] rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="px-3 py-1 rounded-full bg-[#2D5A43] text-[#E5ECE6] text-xs font-semibold uppercase tracking-wider border border-[#3E6E50]">
            SkillNest Marketplace
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Explore Campus Services
          </h1>
          <p className="text-sm sm:text-base text-[#D0DCD2] leading-relaxed">
            Find peer-to-peer technical help, MSBTE capstone assistance, solved manuals, civil drawings, and custom engineering designs from Government Polytechnic Malvan peers.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl border border-[#ECE7DC] p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
            <input
              type="text"
              placeholder="Search by topic or skill (e.g. AutoCAD, Python, Civil Surveying, Microprocessor)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5C6A60] shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-[#717E73]" />
              <span>Sort:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 rounded-full border border-[#ECE7DC] bg-white text-[#1B382B] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#1B382B] text-[#FBF9F4] shadow-sm'
                  : 'bg-[#F6F2E9] hover:bg-[#EAE5D8] text-[#1B382B] border border-[#ECE7DC]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-[#ECE7DC] h-80 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? `No services match "${searchQuery}"` : 'No services available yet.'}
          description={
            searchQuery
              ? 'Try searching with different keywords or check other categories.'
              : 'Be the first student to offer a service to Government Polytechnic Malvan peers.'
          }
          actionLabel={user ? (mode === 'freelancer' ? 'Create a Service' : 'Become a Freelancer') : 'Sign In to Offer a Service'}
          actionTo={user ? (mode === 'freelancer' ? '/freelancer/services/new' : undefined) : '/login'}
          onAction={user && mode === 'student' ? () => switchMode('freelancer') : undefined}
        />
      )}
    </div>
  );
};
