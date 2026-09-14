import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Mail, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  KeyRound, 
  RefreshCw, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GPM_DEPARTMENTS } from '../../types/database';

export const SignUp: React.FC = () => {
  const { sendSignupOtp, verifySignupOtp } = useAuth();
  const navigate = useNavigate();

  // Step: 'details' | 'otp'
  const [step, setStep] = useState<'details' | 'otp'>('details');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Computer Engineering');
  const [year, setYear] = useState<'FY' | 'SY' | 'TY'>('FY');

  // OTP states
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Status
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: any;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!enrollmentNo.trim()) {
      setErrorMsg('Please enter your Student ID / Enrollment Number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid student email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await sendSignupOtp({
        fullName: fullName.trim(),
        studentId: enrollmentNo.trim(),
        enrollmentNo: enrollmentNo.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        department,
        year,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      } else {
        setDemoCode(res.demoOtp || '123456');
        setStep('otp');
        setCountdown(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtpDigits(pasted.split(''));
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleAutoFillDemo = () => {
    if (demoCode && demoCode.length === 6) {
      setOtpDigits(demoCode.split(''));
      otpInputsRef.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await verifySignupOtp(email.trim().toLowerCase(), code);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to verify registration code.');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#FBF9F4]">
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] shadow-xl max-w-lg w-full p-6 sm:p-10 space-y-6">
        
        {/* Brand header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EFEAE0] flex items-center justify-center mx-auto text-[#1B382B] border border-[#DDD5C5]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B382B]">
            {step === 'details' ? 'Join SkillNest' : 'Verify Email Address'}
          </h1>
          <p className="text-xs text-[#5C6A60]">
            {step === 'details' 
              ? 'Government Polytechnic Malvan Student Registration'
              : `Enter the 6-digit verification code sent to ${email}`}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'details' ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
                  Enrollment No. *
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
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
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
                We will send an immediate 6-digit OTP verification code to this address.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
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
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isLoading ? 'Generating OTP...' : 'Send Verification OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            {/* Demo/Dev Code Helper Banner */}
            {demoCode && (
              <div className="p-3.5 rounded-2xl bg-[#F0F5F1] border border-[#C5DCCE] text-[#1B382B] space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
                    Registration Code Ready!
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoFillDemo}
                    className="text-[11px] font-bold text-[#2D5A43] hover:underline bg-white px-2 py-0.5 rounded-lg border border-[#C5DCCE]"
                  >
                    Auto-Fill Code
                  </button>
                </div>
                <div className="text-[11px] text-[#4A5E4F] flex items-center gap-2">
                  <span>Your 6-digit registration code is:</span>
                  <span className="font-mono font-bold text-sm text-[#1B382B] bg-white px-2 py-0.5 rounded-md border border-[#D5E2D8] tracking-widest">
                    {demoCode}
                  </span>
                </div>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <div className="space-y-2">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px] block text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex justify-center gap-2 sm:gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-2xl border-2 border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#1B382B] transition"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otpDigits.join('').length !== 6}
              className="w-full py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isLoading ? 'Activating Account...' : 'Complete & Activate Account'}</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-[#5C6A60] pt-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-[#2D5A43] hover:underline font-semibold"
              >
                Edit Student Details
              </button>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="inline-flex items-center gap-1 font-semibold text-[#1B382B] hover:underline"
                >
                  <RefreshCw className="w-3 h-3" /> Resend Code
                </button>
              ) : (
                <span>Resend code in {countdown}s</span>
              )}
            </div>
          </form>
        )}

        <div className="text-center pt-3 border-t border-[#ECE7DC] text-xs text-[#5C6A60]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#1B382B] hover:underline">
            Sign In with OTP
          </Link>
        </div>

      </div>
    </div>
  );
};
