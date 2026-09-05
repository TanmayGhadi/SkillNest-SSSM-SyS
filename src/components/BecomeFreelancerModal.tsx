import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { Sparkles, X, Briefcase, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BecomeFreelancerModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { activateFreelancer, profile } = useAuth();
  const { switchMode } = useMode();
  
  const [title, setTitle] = useState('Student Freelancer & Peer Mentor');
  const [bio, setBio] = useState(profile?.bio || '');
  const [skillsInput, setSkillsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
    
    try {
      await activateFreelancer({
        title,
        bio,
        skills,
      });

      switchMode('freelancer');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error activating freelancer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14261C]/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF9] border border-[#ECE7DC] rounded-3xl max-w-lg w-full p-7 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#717E73] hover:text-[#1B382B] rounded-full hover:bg-[#F3EFE6] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EFEAE0] text-[#1B382B] flex items-center justify-center border border-[#DDD5C5]">
            <Briefcase className="w-6 h-6 text-[#2D5A43]" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-[#1B382B]">Activate Freelancer Profile</h3>
            <p className="text-xs text-[#5C6A60]">Share your skills and earn by assisting GPM peers.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#1B382B] uppercase tracking-wider mb-1.5">
              Freelancer Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. MSBTE Project Mentor & AutoCAD Specialist"
              required
              className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1B382B] uppercase tracking-wider mb-1.5">
              Skills (comma separated) *
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={e => setSkillsInput(e.target.value)}
              placeholder="e.g. AutoCAD, Python, React, Lab Manuals, Report Writing"
              required
              className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1B382B] uppercase tracking-wider mb-1.5">
              Department
            </label>
            <input
              type="text"
              disabled
              value={profile?.department || 'Government Polytechnic Malvan'}
              className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#ECE7DC] bg-[#F3EFE6] text-[#717E73]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#1B382B] uppercase tracking-wider mb-1.5">
              Short Bio & Experience
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Describe how you help other students with MSBTE coursework, formatting, CAD plans, or software code..."
              className="w-full px-4 py-2.5 text-sm rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition resize-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-[#ECE7DC]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-[#5C6A60] hover:bg-[#F3EFE6] rounded-full transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-semibold bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] rounded-full transition-all shadow-sm"
            >
              {isSubmitting ? 'Activating...' : 'Activate Freelancer Mode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
