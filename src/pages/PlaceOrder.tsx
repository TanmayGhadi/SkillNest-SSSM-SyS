import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Service, FreelancerProfile, Profile } from '../types/database';
import { useAuth } from '../context/AuthContext';

export const PlaceOrder: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState<(Service & { freelancer?: FreelancerProfile & { profile?: Profile } }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // 3-Step Wizard state: 1 Details -> 2 Requirements -> 3 Confirm
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (serviceId) {
      loadService(serviceId);
    }
  }, [serviceId, user]);

  const loadService = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, freelancer:freelancers(*, profile:profiles(*))')
        .eq('id', id)
        .single();

      if (error) throw error;
      setService(data);

      // Suggest default deadline based on service turnaround
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + (data.delivery_days || 3));
      setDeadline(defaultDate.toISOString().split('T')[0]);
    } catch (err) {
      console.error('Error fetching service:', err);
      setErrorMsg('Could not load service information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Generate simulated attachment URL or file name
      setAttachmentUrl(`attachment://${file.name}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !service) return;

    if (!requirements.trim()) {
      setErrorMsg('Please describe your project requirements in detail.');
      return;
    }

    if (!deadline) {
      setErrorMsg('Please choose a realistic target deadline.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        order_no: orderNumber,
        student_id: user.id,
        freelancer_id: service.freelancer_id,
        service_id: service.id,
        service_title: service.title,
        amount: service.price,
        requirements: requirements.trim(),
        deadline: new Date(deadline).toISOString().split('T')[0],
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/student/requests');
      }, 1800);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg(err.message || 'Failed to submit service request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-6 bg-[#EAE5D8] rounded-full w-1/4" />
        <div className="h-72 bg-[#EAE5D8] rounded-3xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#9AA59D] mx-auto" />
        <h2 className="font-serif text-3xl font-bold text-[#1B382B]">Service Not Found</h2>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B382B] text-[#FBF9F4] font-semibold text-xs hover:bg-[#254B3A]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-[#E5ECE6] border border-[#C5DCCE] text-[#2D5A43] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1B382B]">
            Service Requested Successfully!
          </h2>
          <p className="text-sm text-[#5C6A60] max-w-md mx-auto leading-relaxed">
            Your request has been dispatched to <strong>{service.freelancer?.profile?.full_name || 'the student freelancer'}</strong>. Redirecting you to your active requests tracker...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to={`/services/${service.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C6A60] hover:text-[#1B382B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Service Details
        </Link>
      </div>

      {/* 3-Step Progress Indicator */}
      <div className="bg-white rounded-3xl border border-[#ECE7DC] p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          
          <button 
            type="button" 
            onClick={() => setCurrentStep(1)} 
            className="flex items-center gap-2.5 text-xs font-semibold focus:outline-none"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep >= 1 ? 'bg-[#1B382B] text-[#FBF9F4]' : 'bg-[#EFEAE0] text-[#717E73]'
            }`}>
              1
            </div>
            <span className={currentStep >= 1 ? 'text-[#1B382B]' : 'text-[#717E73]'}>Details</span>
          </button>

          <div className={`flex-1 h-[2px] mx-3 transition-colors ${currentStep >= 2 ? 'bg-[#1B382B]' : 'bg-[#EFEAE0]'}`} />

          <button 
            type="button" 
            onClick={() => setCurrentStep(2)} 
            className="flex items-center gap-2.5 text-xs font-semibold focus:outline-none"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep >= 2 ? 'bg-[#1B382B] text-[#FBF9F4]' : 'bg-[#EFEAE0] text-[#717E73]'
            }`}>
              2
            </div>
            <span className={currentStep >= 2 ? 'text-[#1B382B]' : 'text-[#717E73]'}>Requirements</span>
          </button>

          <div className={`flex-1 h-[2px] mx-3 transition-colors ${currentStep >= 3 ? 'bg-[#1B382B]' : 'bg-[#EFEAE0]'}`} />

          <button 
            type="button" 
            onClick={() => {
              if (requirements.trim() && deadline) setCurrentStep(3);
            }} 
            className="flex items-center gap-2.5 text-xs font-semibold focus:outline-none"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              currentStep === 3 ? 'bg-[#1B382B] text-[#FBF9F4]' : 'bg-[#EFEAE0] text-[#717E73]'
            }`}>
              3
            </div>
            <span className={currentStep === 3 ? 'text-[#1B382B]' : 'text-[#717E73]'}>Confirm</span>
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="space-y-1 border-b border-[#ECE7DC] pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE0] text-[#1B382B] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#2D5A43]" />
              Government Polytechnic Malvan
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B382B]">
              Place Service Request
            </h1>
            <p className="text-xs text-[#5C6A60]">
              Provide project guidelines and reference files for your peer freelancer.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Details & Deadline */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1B382B] uppercase tracking-wider">
                    Service Title
                  </label>
                  <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#ECE7DC] text-[#1B382B] text-sm font-medium">
                    {service.title}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1B382B] uppercase tracking-wider">
                    Target Completion Deadline *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={deadline}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition"
                    />
                  </div>
                  <p className="text-[11px] text-[#717E73]">
                    Standard turnaround specified by freelancer: {service.delivery_days} days.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs shadow-md transition-all group"
                  >
                    <span>Proceed to Requirements</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Requirements & Botanical Drop-Zone */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1B382B] uppercase tracking-wider">
                    Detailed Requirements / Guidelines *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Describe exactly what you need: e.g. 'Need a Python Flask REST API for MSBTE 5th semester capstone with login and SQLite database', or 'Draft AutoCAD floor plan for residential building with dimension annotations'..."
                    className="w-full px-4 py-3.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] text-sm transition-all resize-y"
                  />
                  <p className="text-[11px] text-[#717E73]">
                    Be clear about MSBTE syllabus requirements, code formatting, or drawing standards.
                  </p>
                </div>

                {/* Botanical Drop-Zone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1B382B] uppercase tracking-wider">
                    Project Reference Files / Sketches (Optional)
                  </label>
                  <div className="relative border-2 border-dashed border-[#DDD5C5] hover:border-[#2D5A43] rounded-3xl p-6 text-center bg-[#FBF9F4] transition-colors cursor-pointer group">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#EFEAE0] flex items-center justify-center mx-auto text-[#2D5A43] group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1B382B]">
                          {selectedFile ? selectedFile.name : 'Click to select project files or drag & drop'}
                        </p>
                        <p className="text-[11px] text-[#717E73] mt-0.5">
                          PDF, DOCX, ZIP, PNG, or DWG up to 25 MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#1B382B] uppercase tracking-wider">
                    Or Share Cloud Drive Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or GitHub URL"
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 rounded-full border border-[#ECE7DC] text-[#1B382B] font-semibold text-xs hover:bg-[#F3EFE6] transition"
                  >
                    Back to Details
                  </button>
                  <button
                    type="button"
                    disabled={!requirements.trim()}
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs shadow-md transition-all disabled:opacity-50 group"
                  >
                    <span>Review & Confirm</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review & Confirm */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="p-5 rounded-2xl bg-[#FBF9F4] border border-[#ECE7DC] space-y-3 text-xs">
                  <h3 className="font-semibold text-sm text-[#1B382B]">Request Confirmation Overview</h3>
                  <div className="grid grid-cols-2 gap-2 text-[#5C6A60]">
                    <span>Target Deadline:</span>
                    <span className="font-semibold text-[#1B382B] text-right">{deadline}</span>
                    <span>Requirements Preview:</span>
                    <span className="font-medium text-[#1B382B] text-right line-clamp-2">{requirements}</span>
                    <span>Attachment:</span>
                    <span className="font-medium text-[#1B382B] text-right">{selectedFile ? selectedFile.name : (attachmentUrl || 'None attached')}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#E5ECE6]/60 border border-[#C5DCCE] text-xs text-[#1B382B] flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#2D5A43] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Academic Collaboration Pledge:</strong> This service request adheres to Government Polytechnic Malvan peer-learning standards for learning support, debugging, and academic guidance.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-full border border-[#ECE7DC] text-[#1B382B] font-semibold text-xs hover:bg-[#F3EFE6] transition"
                  >
                    Edit Requirements
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting Request...' : 'Confirm & Send Request'}
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Summary Card Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#717E73]">
              Order Summary
            </h2>

            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-[#1B382B] text-base leading-snug">
                {service.title}
              </h3>
              <p className="text-xs text-[#2D5A43] font-medium">
                Offered by {service.freelancer?.profile?.full_name || 'GPM Student Freelancer'}
              </p>
            </div>

            <div className="py-4 border-y border-[#ECE7DC] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#5C6A60]">
                <span>Turnaround:</span>
                <span className="font-medium text-[#1B382B]">{service.delivery_days} days</span>
              </div>
              <div className="flex items-center justify-between text-[#5C6A60]">
                <span>Target Deadline:</span>
                <span className="font-medium text-[#1B382B]">{deadline || 'Pending'}</span>
              </div>
              <div className="flex items-center justify-between text-[#1B382B] font-bold pt-2 border-t border-[#ECE7DC] text-sm">
                <span>Agreed Service Fee:</span>
                <span className="text-[#2D5A43] text-lg font-serif">₹{service.price}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F6F2E9] border border-[#EAE3D2] flex items-start gap-2 text-[11px] text-[#5C6A60]">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#2D5A43]" />
              <span>
                SkillNest protects peer collaborations at Government Polytechnic Malvan. Revisions can be requested upon work delivery.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
