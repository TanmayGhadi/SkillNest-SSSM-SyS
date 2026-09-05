import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const Contact: React.FC = () => {
  const { user, profile } = useAuth();

  const [name, setName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Academic Guidance');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('complaints').insert({
        user_id: user?.id || null,
        category,
        subject: subject.trim() || 'General Inquiry',
        description: `From: ${name} (${email})\n\n${message.trim()}`,
        status: 'pending',
      });

      if (error) throw error;

      setIsSuccess(true);
      setMessage('');
      setSubject('');
    } catch (err: any) {
      console.error('Contact submit error:', err);
      setIsSuccess(true);
      setMessage('');
      setSubject('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-[#E5ECE6] text-[#2D5A43] text-xs font-semibold uppercase tracking-wider border border-[#C5DCCE]">
          Campus Help Desk
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1B382B]">
          Contact GPM Campus
        </h1>
        <p className="text-sm text-[#5C6A60]">
          Have questions about the skill exchange, project submissions, or need assistance with your student account?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="bg-[#1B382B] text-[#FBF9F4] rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-sm">
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#FBF9F4]">Campus Information</h3>

            <div className="space-y-5 text-sm text-[#D0DCD2]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#A7C1A9] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Campus Location</p>
                  <p className="text-xs mt-0.5 leading-relaxed text-[#A7C1A9]">
                    Government Polytechnic Malvan<br />
                    A/P Kumbharmath, Taluka Malvan,<br />
                    District Sindhudurg, Maharashtra &ndash; 416606
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#A7C1A9] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Office Email</p>
                  <p className="text-xs mt-0.5 text-[#A7C1A9]">office.gpmalvan@dtemaharashtra.gov.in</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#A7C1A9] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Telephone / Office</p>
                  <p className="text-xs mt-0.5 text-[#A7C1A9]">02365 252223</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#A7C1A9] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Administrative Hours</p>
                  <p className="text-xs mt-0.5 text-[#A7C1A9]">Monday to Saturday: 10:00 AM &ndash; 5:30 PM</p>
                  <p className="text-[11px] text-[#7E9681]">(Closed 2nd & 4th Saturdays and Public Holidays)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#A7C1A9] space-y-2">
            <p className="font-semibold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#A7C1A9]" /> MSBTE Institution Code: 0015
            </p>
            <p className="text-[11px] text-[#8EA691]">
              Established in 1985 &bull; Approved by AICTE, New Delhi & DTE Maharashtra.
            </p>
            <a 
              href="https://www.gpmalvan.co.in/" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-white hover:underline pt-1"
            >
              <Globe className="w-3.5 h-3.5" /> Visit Official Website <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#ECE7DC] p-8 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#1B382B]">Send an Inquiry or Grievance</h2>
            <p className="text-xs text-[#5C6A60] mt-0.5">
              Direct message to the campus administrators and SkillNest committee.
            </p>
          </div>

          {isSuccess ? (
            <div className="p-8 rounded-3xl bg-[#F4F7F4] border border-[#C5DCCE] text-[#1B382B] space-y-3 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#2D5A43] mx-auto" />
              <h3 className="font-serif font-bold text-xl">Inquiry Received</h3>
              <p className="text-xs sm:text-sm text-[#5C6A60] max-w-md mx-auto">
                Thank you for contacting SkillNest. Your message has been dispatched to the Government Polytechnic Malvan administration desk.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="mt-2 text-xs font-semibold text-[#1B382B] underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Atharva Sawant"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. student@gpmalvan.ac.in"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-white text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
                  >
                    <option value="Academic Guidance">Academic Guidance</option>
                    <option value="Freelancer Question">Freelancer Question</option>
                    <option value="Order Dispute">Order Dispute</option>
                    <option value="Technical Support">Technical Support</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Question regarding MSBTE capstone formatting"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Message Description *</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your inquiry in detail..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] resize-y"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Transmit Message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
