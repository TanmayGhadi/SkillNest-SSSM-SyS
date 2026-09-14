import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LogIn, 
  Mail, 
  Lock, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  UserCheck, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const { sendLoginOtp, verifyLoginOtp, login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'otp' | 'password'
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');

  // OTP flow states
  const [identifier, setIdentifier] = useState('atharva.gpm@gmail.com');
  const [otpStep, setOtpStep] = useState<'input_id' | 'verify_otp'>('input_id');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [resolvedEmail, setResolvedEmail] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Password flow states
  const [password, setPassword] = useState('');

  // General states
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const from = (location.state as any)?.from?.pathname || '/';

  // Timer countdown for resend OTP
  useEffect(() => {
    let timer: any;
    if (otpStep === 'verify_otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpStep, countdown]);

  // Handle requesting OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your email or Student ID.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await sendLoginOtp(identifier.trim());
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to dispatch verification code.');
      } else {
        setResolvedEmail(res.email || identifier.trim());
        setDemoCode(res.demoOtp || '123456');
        setOtpStep('verify_otp');
        setCountdown(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        // Focus first OTP box
        setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP individual digit change
  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    // Auto-advance to next input
    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation across digits
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle paste full 6-digit code
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  // Fill demo code helper
  const handleAutoFillDemo = () => {
    if (demoCode && demoCode.length === 6) {
      setOtpDigits(demoCode.split(''));
      otpInputsRef.current[5]?.focus();
    }
  };

  // Submit OTP Verification
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
      const res = await verifyLoginOtp(resolvedEmail || identifier.trim(), code);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid verification code.');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Password login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter both your identifier and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await login(identifier.trim(), password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid student credentials.');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Demo Login
  const handleQuickLogin = async (role: 'student' | 'freelancer' | 'admin') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await quickDemoLogin(role);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg('Failed to log in as demo user.');
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#FBF9F4]">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] shadow-xl overflow-hidden">
        
        {/* Left Column: GPM Malvan Branding */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1B382B] to-[#254B3A] p-6 sm:p-10 text-[#FBF9F4] flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5ECE6] animate-pulse" />
              Government Polytechnic Malvan
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
                SkillNest <br />
                <span className="italic font-serif text-[#C5DCCE]">Student Portal.</span>
              </h2>
              <p className="text-xs text-[#E5ECE6]/85 leading-relaxed max-w-xs font-sans">
                Access your campus gigs, academic study notes, and collaborate with student peers across all GPM diploma departments.
              </p>
            </div>

            {/* Quick Demo Logins Box */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[10px] text-[#C5DCCE] uppercase font-bold tracking-wider block">
                Instant 1-Click Demo Login
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('student')}
                  disabled={isLoading}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-[#C5DCCE]" />
                    <span className="font-medium">Student (Atharva - TY Comp)</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-white/50 group-hover:translate-x-1 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('freelancer')}
                  disabled={isLoading}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#C5DCCE]" />
                    <span className="font-medium">Freelancer (Tanmay - TY Web)</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-white/50 group-hover:translate-x-1 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5DCCE]" />
                    <span className="font-medium">Faculty Admin (Prof. Sawant)</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-white/50 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-6 border-t border-white/10">
            <p className="text-[10px] text-[#E5ECE6]/60 uppercase tracking-wider">
              MSBTE Institute Code: 0015 &bull; Malvan, Sindhudurg
            </p>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-5">
          
          {/* Header & Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEAE0] text-[#1B382B] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#2D5A43]" />
                SkillNest Sign In
              </div>
              
              {/* Method Switcher */}
              <div className="flex items-center p-1 bg-[#EFEAE0] rounded-full text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setAuthMode('otp'); setErrorMsg(''); }}
                  className={`px-3 py-1 rounded-full transition ${
                    authMode === 'otp' ? 'bg-[#1B382B] text-white shadow-xs' : 'text-[#4A5E4F] hover:text-[#1B382B]'
                  }`}
                >
                  Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('password'); setErrorMsg(''); }}
                  className={`px-3 py-1 rounded-full transition ${
                    authMode === 'password' ? 'bg-[#1B382B] text-white shadow-xs' : 'text-[#4A5E4F] hover:text-[#1B382B]'
                  }`}
                >
                  Password
                </button>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B382B]">
              {authMode === 'otp' 
                ? (otpStep === 'input_id' ? 'Sign In with Email OTP' : 'Verify Security Code')
                : 'Sign In with Password'}
            </h1>
            <p className="text-xs text-[#5C6A60]">
              {authMode === 'otp'
                ? (otpStep === 'input_id' 
                    ? 'Enter your registered student email or enrollment number to receive a 6-digit verification code.' 
                    : `We sent a 6-digit code to ${resolvedEmail}. Enter it below to access your account.`)
                : 'Enter your student credentials to log into your SkillNest dashboard.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* MODE 1: EMAIL OTP FLOW */}
          {authMode === 'otp' && (
            <>
              {otpStep === 'input_id' ? (
                <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
                      Student Email / Enrollment No.
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. atharva.gpm@gmail.com or 2200150042"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isLoading ? 'Generating OTP...' : 'Send Verification Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                  {/* Demo/Dev Code Helper Banner */}
                  {demoCode && (
                    <div className="p-3 rounded-2xl bg-[#F0F5F1] border border-[#C5DCCE] text-[#1B382B] space-y-1.5 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
                          Verification Code Dispatched!
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
                        <span>Your 6-digit OTP code is:</span>
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
                    <span>{isLoading ? 'Verifying...' : 'Verify & Sign In'}</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-[#5C6A60] pt-2">
                    <button
                      type="button"
                      onClick={() => setOtpStep('input_id')}
                      className="text-[#2D5A43] hover:underline font-semibold"
                    >
                      Change Email / ID
                    </button>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
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
            </>
          )}

          {/* MODE 2: TRADITIONAL PASSWORD FLOW */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
                  Student Email / ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="student@gmail.com or 2200150042"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[11px] text-[#2D5A43] hover:underline font-medium">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Signing In...' : 'Login with Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-3 border-t border-[#ECE7DC] text-xs text-[#5C6A60]">
            Don't have a SkillNest account yet?{' '}
            <Link to="/signup" className="font-semibold text-[#1B382B] hover:underline ml-1">
              Join SkillNest
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
