import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Upload,
  Search,
  BookOpen,
  Plus,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AcademicResource, Profile, GPM_DEPARTMENTS } from '../types/database';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

export const Resources: React.FC = () => {
  const { user } = useAuth();

  const [resources, setResources] = useState<(AcademicResource & { uploader?: Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSem, setSelectedSem] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Computer Engineering');
  const [semester, setSemester] = useState(1);
  const [subject, setSubject] = useState('');
  const [resourceType, setResourceType] = useState<'Notes' | 'PYQs' | 'Manuals' | 'Study Material' | 'Reference Material'>('Notes');
  const [fileUrl, setFileUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const resourceTypes = [
    { id: 'All', label: 'All Resources' },
    { id: 'Notes', label: 'Notes' },
    { id: 'PYQs', label: 'PYQs' },
    { id: 'Manuals', label: 'Manuals' },
    { id: 'Study Material', label: 'Study Material' },
    { id: 'Reference Material', label: 'Reference Material' },
  ];

  useEffect(() => {
    fetchResources();
  }, [selectedDept, selectedSem, selectedType]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('academic_resources')
        .select('*, uploader:profiles(*)')
        .order('created_at', { ascending: false });

      if (selectedDept !== 'All') {
        query = query.eq('department', selectedDept);
      }
      if (selectedSem !== 'All') {
        query = query.eq('semester', selectedSem);
      }
      if (selectedType !== 'All') {
        query = query.eq('resource_type', selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      setResources((data as (AcademicResource & { uploader?: Profile })[]) || []);
    } catch (err) {
      console.error('Error loading academic resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (resource: AcademicResource) => {
    try {
      await supabase
        .from('academic_resources')
        .update({ downloads: (resource.downloads || 0) + 1 })
        .eq('id', resource.id);

      window.open(resource.file_url, '_blank');
      fetchResources();
    } catch (err) {
      window.open(resource.file_url, '_blank');
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || !fileUrl.trim()) {
      setUploadError('Please provide a title and document link.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const newRes = {
        title: title.trim(),
        description: description.trim() || null,
        department,
        semester: semester.toString(),
        subject: subject.trim() || null,
        resource_type: resourceType,
        file_url: fileUrl.trim(),
        file_name: title.trim(),
        uploaded_by: user.id,
        downloads: 0,
      };

      const { error } = await supabase.from('academic_resources').insert(newRes);
      if (error) throw error;

      setIsUploadOpen(false);
      setTitle('');
      setDescription('');
      setSubject('');
      setFileUrl('');
      fetchResources();
    } catch (err: any) {
      console.error('Upload resource error:', err);
      setUploadError(err.message || 'Failed to upload resource.');
    } finally {
      setIsUploading(false);
    }
  };

  const filteredResources = resources.filter((res) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      res.title.toLowerCase().includes(q) ||
      (res.subject && res.subject.toLowerCase().includes(q)) ||
      (res.description && res.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#1B382B] text-[#FBF9F4] rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="px-3 py-1 rounded-full bg-[#2D5A43] text-[#E5ECE6] text-xs font-semibold uppercase tracking-wider border border-[#3E6E50]">
            MSBTE Academic Vault
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Academic Resources
          </h1>
          <p className="text-sm sm:text-base text-[#D0DCD2] leading-relaxed">
            Verified study materials, solved lab practicals, previous MSBTE examination question papers, and seminar documentation for Government Polytechnic Malvan students.
          </p>
        </div>

        {user && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E5ECE6] hover:bg-white text-[#1B382B] font-semibold text-xs shrink-0 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Share Study Material
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl border border-[#ECE7DC] p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
            <input
              type="text"
              placeholder="Search by subject code, title, or topic (e.g. Applied Mechanics, 22415, Python Lab)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Semester Filter */}
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="px-4 py-2.5 rounded-full border border-[#ECE7DC] bg-white text-[#1B382B] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 cursor-pointer"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <option key={s} value={s.toString()}>
                  Semester {s}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 rounded-full border border-[#ECE7DC] bg-white text-[#1B382B] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 cursor-pointer"
            >
              {resourceTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Department Chips */}
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

      {/* Resources Table / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-[#ECE7DC] h-52 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-3xl border border-[#ECE7DC] p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-[#1B382B]/5 transition-all duration-300 hover:border-[#2D5A43]/40 group relative"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#EFEAE0] text-[#1B382B] text-[11px] font-semibold border border-[#E2D9C8]">
                    {res.resource_type}
                  </span>
                  <span className="text-[11px] font-semibold text-[#717E73]">
                    Sem {res.semester}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1B382B] group-hover:text-[#2D5A43] transition-colors line-clamp-2">
                    {res.title}
                  </h3>
                  {res.subject && (
                    <p className="text-xs text-[#5C6A60] mt-1 font-medium">Subject: {res.subject}</p>
                  )}
                  <p className="text-xs text-[#2D5A43] font-semibold mt-0.5">{res.department}</p>
                </div>

                {res.description && (
                  <p className="text-xs text-[#717E73] line-clamp-2 leading-relaxed">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[#ECE7DC] flex items-center justify-between text-xs">
                <div className="text-[#717E73] text-[11px]">
                  <span>{res.downloads || 0} downloads</span>
                  {res.uploader && <span> &bull; {res.uploader.full_name}</span>}
                </div>

                <button
                  onClick={() => handleDownload(res)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAE5D8] hover:bg-[#1B382B] hover:text-[#FBF9F4] text-[#1B382B] font-semibold transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? `No resources match "${searchQuery}"` : 'No resources uploaded yet.'}
          description={
            searchQuery
              ? 'Try modifying your search keywords or branch selection.'
              : 'Be the first student to upload past MSBTE question papers, solved lab manuals, or lecture summaries!'
          }
          actionLabel={user ? 'Share Academic Resource' : 'Sign In to Share Materials'}
          onAction={user ? () => setIsUploadOpen(true) : undefined}
          actionTo={user ? undefined : '/login'}
        />
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14261C]/50 backdrop-blur-sm p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-[#1B382B] text-xl">Share Academic Resource</h3>
                <p className="text-xs text-[#5C6A60] mt-0.5">Upload notes, solutions, or guides for GPM peers</p>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F3EFE6] text-[#717E73] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleCreateResource} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 22415 Microprocessor Solved Manual Experiments 1-10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#ECE7DC] bg-white text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
                  >
                    {GPM_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Semester *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(parseInt(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#ECE7DC] bg-white text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Subject Name / Code</label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures (22317)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Resource Category *</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-[#ECE7DC] bg-white text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
                  >
                    <option value="Notes">Notes</option>
                    <option value="Manuals">Manuals</option>
                    <option value="PYQs">PYQs</option>
                    <option value="Study Material">Study Material</option>
                    <option value="Reference Material">Reference Material</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Document / Drive URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/file/... or PDF link"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ECE7DC]">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#5C6A60] hover:bg-[#F3EFE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  {isUploading ? 'Publishing...' : 'Publish Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
