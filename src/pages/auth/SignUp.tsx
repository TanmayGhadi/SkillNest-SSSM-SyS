import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Lock, Mail, User, Phone, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GPM_DEPARTMENTS } from '../../types/database';

export const SignUp: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Engineering');
  const [year, setYear] = useState<'FY' | 'SY' | 'TY'>('FY');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }

    if (!enrollmentNo.trim()) {
      setErrorMsg('Please enter your Student ID / Enrollment Number.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please provide a valid, deliverable email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await signUp({
        fullName: fullName.trim(),
        studentId: enrollmentNo.trim(),
        enrollmentNo: enrollmentNo.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        department,
        year,
        password,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Could not complete student registration.');
      } else if (res.requiresEmailConfirmation) {
        setIsVerificationSent(true);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setErrorMsg(err.message || 'Could not complete student registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#FBF9F4]">
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] shadow-xl max-w-lg w-full p-8 sm:p-10 space-y-6">
        
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#EFEAE0] flex items-center justify-center mx-auto text-[#1B382B] border border-[#DDD5C5]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#1B382B]">Join SkillNest</h1>
          <p className="text-xs text-[#5C6A60]">
            Government Polytechnic Malvan Student Registration
          </p>
        </div>

        {isVerificationSent ? (
          <div className="p-6 rounded-2xl bg-[#F4F7F4] border border-[#C5DCCE] text-center space-y-4 animate-in fade-in">
            <CheckCircle2 className="w-12 h-12 text-[#2D5A43] mx-auto" />
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-xl text-[#1B382B]">Account Created Successfully!</h3>
              <p className="text-xs text-[#5C6A60] leading-relaxed">
                Your student account has been registered in Supabase Auth.
                A confirmation link has been sent to <strong className="text-[#1B382B]">{email}</strong>.
              </p>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-[#ECE7DC] text-[11px] text-[#5C6A60] text-left">
              <strong>Next step:</strong> Please open your email inbox (or spam folder) and click the confirmation link to activate your account, then sign in below.
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs shadow-md transition"
            >
              <span>Proceed to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Atharva Tendulkar"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                    Student ID / Enrollment No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    placeholder="e.g. 2200150042"
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                  Student Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@gmail.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>
                <p className="text-[10px] text-[#5C6A60]">
                  Enter a valid, active email address to receive your Supabase verification link.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                    Department *
                  </label>
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
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                    Diploma Year *
                  </label>
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
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
              >
                <UserPlus className="w-4 h-4" />
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>

            <div className="text-center pt-3 border-t border-[#ECE7DC] text-xs text-[#5C6A60]">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-[#1B382B] hover:underline">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
