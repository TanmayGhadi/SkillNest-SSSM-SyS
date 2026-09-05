import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Phone,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Camera,
  Star,
  Layers,
  Sparkles,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { supabase } from '../lib/supabase';
import { GPM_DEPARTMENTS, Service, Review } from '../types/database';

export const ProfilePage: React.FC = () => {
  const { user, profile, freelancerProfile, activityStats, updateProfile, activateFreelancer } = useAuth();
  const { mode } = useMode();

  const [activeTab, setActiveTab] = useState<'student' | 'freelancer' | 'activity'>('student');

  // Student form state
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [department, setDepartment] = useState(profile?.department || 'Computer Engineering');
  const [year, setYear] = useState<'FY' | 'SY' | 'TY'>((profile?.year as 'FY' | 'SY' | 'TY') || 'TY');
  const [enrollmentNo, setEnrollmentNo] = useState(profile?.enrollment_no || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

  // Freelancer form state
  const [headline, setHeadline] = useState(freelancerProfile?.headline || 'Student Freelancer at GPM Malvan');
  const [freelancerBio, setFreelancerBio] = useState(freelancerProfile?.bio || profile?.bio || '');
  const [skills, setSkills] = useState<string[]>(freelancerProfile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState(freelancerProfile?.hourly_rate || 150);

  // User's own services and reviews
  const [userServices, setUserServices] = useState<Service[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDepartment(profile.department || 'Computer Engineering');
      setYear((profile.year as 'FY' | 'SY' | 'TY') || 'TY');
      setEnrollmentNo(profile.enrollment_no || '');
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
    if (freelancerProfile) {
      setHeadline(freelancerProfile.headline || '');
      setFreelancerBio(freelancerProfile.bio || '');
      setSkills(freelancerProfile.skills || []);
      setHourlyRate(freelancerProfile.hourly_rate || 150);
    }
  }, [profile, freelancerProfile]);

  useEffect(() => {
    if (user) {
      loadUserActivityData();
    }
  }, [user]);

  const loadUserActivityData = async () => {
    if (!user) return;
    try {
      const [srvRes, revRes] = await Promise.all([
        supabase.from('services').select('*').eq('freelancer_id', user.id),
        supabase.from('reviews').select('*, student:profiles(*)').eq('freelancer_id', user.id),
      ]);
      if (srvRes.data) setUserServices(srvRes.data);
      if (revRes.data) setUserReviews(revRes.data);
    } catch (e) {
      console.error('Error loading user profile activity', e);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (!user) {
      setSaveError('Your session has expired. Please sign in again.');
      return;
    }
    const file = e.target.files[0];

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Profile photo size must be under 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSaveError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setIsUploadingPhoto(true);
    setSaveError('');

    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('[SkillNest Avatar] Supabase storage upload error:', {
          message: uploadError.message,
          name: uploadError.name,
        });
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // 2. Obtain clean public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // 3. Save avatar URL to profile in database
      const res = await updateProfile({ avatar_url: publicUrl });
      if (!res.success) {
        throw new Error(res.error || 'Photo uploaded but could not update avatar in profile.');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('[SkillNest Avatar] Failed to update profile photo:', err);
      setSaveError(err.message || 'Failed to upload profile photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleAddSkill = (skillToAdd?: string) => {
    const val = (skillToAdd || skillInput).trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const popularSkillsSuggestions = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Python', 'Java', 'C', 'C++', 'SQL',
    'AutoCAD', 'SolidWorks', 'UI/UX Design', 'Graphic Design', 'Video Editing',
    'PPT Design', 'Documentation', 'Printing', 'IoT Hardware', 'Surveying'
  ];

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSaveError('Your session has expired. Please sign in again.');
      return;
    }

    if (!fullName.trim()) {
      setSaveError('Full legal name is required.');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      // NOTE: enrollment_no, student_id, email, and id are immutable official identifiers and excluded from update
      const res = await updateProfile({
        full_name: fullName.trim(),
        department,
        year,
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || 'Could not update profile in database.');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSaveError('Your session has expired. Please sign in again.');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const success = await activateFreelancer({
        headline: headline.trim(),
        bio: freelancerBio.trim(),
        skills,
        hourlyRate: Number(hourlyRate) || 150,
      });

      if (!success) throw new Error('Could not update freelancer profile.');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update freelancer profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-20">
      
      {/* Profile Top Banner Card */}
      <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        
        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <svg width="180" height="180" viewBox="0 0 100 100" fill="none" stroke="#1B382B" strokeWidth="1.2">
            <path d="M50 90 C50 50 70 25 85 10" />
            <path d="M50 70 C65 65 78 68 82 60 C80 50 65 58 50 70" fill="#E5ECE6" />
          </svg>
        </div>

        {/* Profile Avatar with Photo Upload Button */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-3xl bg-[#EFEAE0] border-2 border-[#DDD5C5] flex items-center justify-center font-serif text-3xl font-bold text-[#1B382B] overflow-hidden shadow-sm">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || 'Student'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{fullName ? fullName.charAt(0).toUpperCase() : 'S'}</span>
            )}
          </div>

          <label 
            htmlFor="avatar-upload" 
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#1B382B] text-[#FBF9F4] flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-transform"
            title="Upload new profile photo"
          >
            <Camera className="w-4 h-4" />
            <input 
              type="file" 
              id="avatar-upload" 
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleAvatarFileChange} 
              className="hidden" 
            />
          </label>
        </div>

        {/* User Identity Details */}
        <div className="flex-1 text-center sm:text-left space-y-1.5 z-10">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B382B]">
              {profile?.full_name || 'GPM Student'}
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#E5ECE6] text-[#2D5A43] text-xs font-semibold border border-[#C5DCCE]">
              {profile?.department || 'Government Polytechnic Malvan'}
            </span>
          </div>

          <p className="text-xs text-[#5C6A60]">{profile?.email}</p>

          <div className="flex items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#717E73] font-medium flex-wrap">
            <span>{profile?.year || 'TY'} Diploma</span>
            <span>&bull;</span>
            <span className="font-mono text-[#1B382B]">ID: {profile?.enrollment_no || 'GPM Student'}</span>
            <span>&bull;</span>
            <span>Govt. Polytechnic Malvan &bull; Est. 1985</span>
          </div>
        </div>

        {/* Profile Completion Card */}
        <div className="shrink-0 text-center sm:text-right space-y-2 z-10 bg-[#FBF9F4] p-4 rounded-2xl border border-[#ECE7DC] min-w-[170px]">
          <div className="flex items-center justify-between text-xs font-semibold text-[#1B382B]">
            <span>Profile Completion</span>
            <span className="text-[#2D5A43] font-bold">{activityStats.profileCompletion}%</span>
          </div>
          <div className="w-full h-2 bg-[#EFEAE0] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#2D5A43] rounded-full transition-all duration-500" 
              style={{ width: `${activityStats.profileCompletion}%` }}
            />
          </div>
          <span className="text-[10px] text-[#717E73] block mt-1">
            {activityStats.profileCompletion === 100 ? 'Fully verified profile' : 'Add phone & bio to reach 100%'}
          </span>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-[#ECE7DC] pb-3">
        <button
          onClick={() => setActiveTab('student')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'student'
              ? 'bg-[#1B382B] text-[#FBF9F4] shadow-sm'
              : 'text-[#5C6A60] hover:text-[#1B382B] hover:bg-[#EFEAE0]'
          }`}
        >
          Student Identity
        </button>

        <button
          onClick={() => setActiveTab('freelancer')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'freelancer'
              ? 'bg-[#1B382B] text-[#FBF9F4] shadow-sm'
              : 'text-[#5C6A60] hover:text-[#1B382B] hover:bg-[#EFEAE0]'
          }`}
        >
          Freelancer Studio {profile?.is_freelancer ? '✓' : '(Inactive)'}
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'activity'
              ? 'bg-[#1B382B] text-[#FBF9F4] shadow-sm'
              : 'text-[#5C6A60] hover:text-[#1B382B] hover:bg-[#EFEAE0]'
          }`}
        >
          My Services & Reviews ({userServices.length})
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-[#E5ECE6] border border-[#C5DCCE] text-[#1B382B] text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2D5A43]" />
          <span>Profile changes saved successfully to Supabase!</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tab 1: Student Identity Form */}
      {activeTab === 'student' && (
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B382B]">Academic & Personal Records</h2>
            <p className="text-xs text-[#5C6A60] mt-0.5">Government Polytechnic Malvan Institutional Credentials</p>
          </div>

          <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Student ID / Enrollment Number (Official)</label>
                <input
                  type="text"
                  readOnly
                  value={enrollmentNo}
                  title="Official institutional Student ID is immutable after registration"
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#F4F1EA] text-[#5C6A60] text-sm cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Official Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-white text-[#1B382B] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 cursor-pointer"
                >
                  {GPM_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Diploma Year *</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-white text-[#1B382B] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 cursor-pointer"
                >
                  <option value="FY">First Year (FY)</option>
                  <option value="SY">Second Year (SY)</option>
                  <option value="TY">Third Year (TY)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Contact Phone / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Profile Photo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Personal Student Bio</label>
              <textarea
                rows={3}
                placeholder="Tell fellow students about your diploma projects, interests, and academic background..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] resize-y"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Updates...' : 'Save Student Identity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Freelancer Studio Form */}
      {activeTab === 'freelancer' && (
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B382B]">Freelancer Studio Profile</h2>
            <p className="text-xs text-[#5C6A60] mt-0.5">Showcase your technical and creative talents to peers</p>
          </div>

          <form onSubmit={handleSaveFreelancer} className="space-y-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Freelancer Headline *</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Full-Stack Web Developer & IoT Prototyper"
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Freelancer Bio</label>
              <textarea
                rows={4}
                value={freelancerBio}
                onChange={(e) => setFreelancerBio(e.target.value)}
                placeholder="Describe your practical experience, lab projects, tools you master, and turnaround reliability..."
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] resize-y"
              />
            </div>

            {/* Verified Skills Tag Cloud */}
            <div className="space-y-2">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                My Skills & Disciplines ({skills.length})
              </label>

              {/* Input for adding new skills */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter (e.g. AutoCAD, Python, React)..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill()}
                  className="px-4 py-2.5 rounded-2xl bg-[#1B382B] text-[#FBF9F4] font-semibold text-xs hover:bg-[#254B3A] transition"
                >
                  Add Skill
                </button>
              </div>

              {/* Active Skill Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5ECE6] text-[#1B382B] text-xs font-semibold border border-[#C5DCCE]"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-[#717E73] hover:text-rose-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggestions */}
              <div className="pt-2">
                <p className="text-[11px] text-[#717E73] mb-1.5 font-medium">Quick Suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {popularSkillsSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddSkill(sug)}
                      disabled={skills.includes(sug)}
                      className="px-2.5 py-1 rounded-full bg-[#F6F2E9] hover:bg-[#EAE5D8] disabled:opacity-40 text-[#1B382B] text-[11px] font-medium border border-[#ECE7DC] transition"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Updating Studio...' : 'Save Freelancer Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: My Services & Reviews */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          {/* User Services */}
          <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#1B382B]">My Published Services</h2>
            {userServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userServices.map((srv) => (
                  <div key={srv.id} className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE7DC] space-y-2">
                    <h4 className="font-serif font-bold text-sm text-[#1B382B]">{srv.title}</h4>
                    <p className="text-xs text-[#5C6A60] line-clamp-2">{srv.description}</p>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#ECE7DC]">
                      <span className="font-bold text-[#2D5A43]">₹{srv.price}</span>
                      <span className="text-[#717E73]">{srv.delivery_days} days turnaround</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-[#FBF9F4] rounded-2xl border border-dashed border-[#DDD5C5]">
                <p className="text-xs text-[#717E73]">You have not published any campus services yet.</p>
              </div>
            )}
          </div>

          {/* User Reviews */}
          <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#1B382B]">Reviews Received From Peers</h2>
            {userReviews.length > 0 ? (
              <div className="space-y-3">
                {userReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE7DC] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1B382B]">{(rev as any).student?.full_name || 'GPM Peer'}</span>
                      <div className="flex items-center gap-1 text-[#B7950B]">
                        <Star className="w-3.5 h-3.5 fill-[#B7950B]" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#5C6A60]">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-[#FBF9F4] rounded-2xl border border-dashed border-[#DDD5C5]">
                <p className="text-xs text-[#717E73]">No peer reviews received yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
