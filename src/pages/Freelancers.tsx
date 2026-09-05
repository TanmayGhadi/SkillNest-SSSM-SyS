import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { FreelancerProfile, Profile, GPM_DEPARTMENTS } from '../types/database';
import { FreelancerCard } from '../components/FreelancerCard';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

export const Freelancers: React.FC = () => {
  const { user } = useAuth();
  const { mode, switchMode } = useMode();

  const [freelancers, setFreelancers] = useState<(FreelancerProfile & { profile?: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
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

  const filteredFreelancers = freelancers.filter((f) => {
    const profile = f.profile;
    const matchesDept = selectedDept === 'All' || profile?.department === selectedDept;

    if (!matchesDept) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const matchesName = profile?.full_name?.toLowerCase().includes(q);
    const matchesTitle = f.title?.toLowerCase().includes(q);
    const matchesBio = f.bio?.toLowerCase().includes(q);
    const matchesSkills = f.skills && f.skills.some((s) => s.toLowerCase().includes(q));

    return matchesName || matchesTitle || matchesBio || matchesSkills;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#1B382B] text-[#FBF9F4] rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="px-3 py-1 rounded-full bg-[#2D5A43] text-[#E5ECE6] text-xs font-semibold uppercase tracking-wider border border-[#3E6E50]">
            Talent Directory
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            GPM Student Freelancers
          </h1>
          <p className="text-sm sm:text-base text-[#D0DCD2] leading-relaxed">
            Collaborate directly with skilled diploma peers for software, mechanical CAD drafting, civil drawings, or seminar presentations.
          </p>
        </div>
      </div>

      {/* Search and Department Filter Bar */}
      <div className="bg-white rounded-3xl border border-[#ECE7DC] p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
          <input
            type="text"
            placeholder="Search by student name, technology, or skill (e.g. AutoCAD, Python, SolidWorks, UI/UX)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition"
          />
        </div>

        {/* Department Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {['All', ...GPM_DEPARTMENTS].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? 'bg-[#1B382B] text-[#FBF9F4] shadow-sm'
                  : 'bg-[#F6F2E9] hover:bg-[#EAE5D8] text-[#1B382B] border border-[#ECE7DC]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Freelancers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-[#ECE7DC] h-64 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredFreelancers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFreelancers.map((freelancer) => (
            <FreelancerCard key={freelancer.id} freelancer={freelancer} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? `No freelancers match "${searchQuery}"` : 'No freelancers found.'}
          description={
            searchQuery
              ? 'Try adjusting your search terms or selecting a different GPM department.'
              : 'Be the first student to activate your freelancer profile on SkillNest.'
          }
          actionLabel={user ? (mode === 'freelancer' ? 'Edit Your Skills' : 'Become a Freelancer') : 'Join SkillNest to Register'}
          actionTo={user ? (mode === 'freelancer' ? '/profile' : undefined) : '/signup'}
          onAction={user && mode === 'student' ? () => switchMode('freelancer') : undefined}
        />
      )}
    </div>
  );
};
