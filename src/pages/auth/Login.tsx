import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter your email or Student ID, and your password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await login(identifier.trim(), password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials. Please verify your Student ID / Email and password.');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#FBF9F4]">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] shadow-xl overflow-hidden">
        
        {/* Left Column: Subtle GPM Malvan Visual & Botanical Decoration */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1B382B] to-[#254B3A] p-8 sm:p-10 text-[#FBF9F4] flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle botanical decorative SVG watermark */}
          <div className="absolute -top-12 -right-12 opacity-15 pointer-events-none">
            <svg width="240" height="240" viewBox="0 0 100 100" fill="none" stroke="#FFFFFF" strokeWidth="1.2">
              <path d="M50 90 C50 50 70 25 85 10" />
              <path d="M50 70 C65 65 78 68 82 60 C80 50 65 58 50 70" fill="#FFFFFF" fillOpacity="0.15" />
              <path d="M50 50 C35 45 22 48 18 40 C20 30 35 38 50 50" fill="#FFFFFF" fillOpacity="0.15" />
              <path d="M50 30 C62 25 72 28 75 20 C72 12 60 18 50 30" fill="#FFFFFF" fillOpacity="0.15" />
            </svg>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5ECE6] animate-pulse" />
              Government Polytechnic Malvan
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                Learn.<br />
                Share.<br />
                <span className="italic font-serif text-[#C5DCCE]">Grow Together.</span>
              </h2>
              <p className="text-xs text-[#E5ECE6]/80 leading-relaxed max-w-xs font-sans">
                Access your campus services, academic resource vault, and collaborate with student peers across all 8 diploma departments.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 mt-auto border-t border-white/10 space-y-2">
            <div className="font-handwriting text-xl text-[#F2F6F3]">
              “By GPM Students, For GPM Students.” 🌿
            </div>
            <p className="text-[10px] text-[#E5ECE6]/60 tracking-wider uppercase">
              MSBTE Institute Code: 0015 &bull; Est. 1985
            </p>
          </div>
        </div>

        {/* Right Column: Clean, Minimal Login Card */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFEAE0] text-[#1B382B] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#2D5A43]" />
              SkillNest Authentication
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1B382B]">
              Welcome Back!
            </h1>
            <p className="text-xs text-[#5C6A60]">
              Sign in with your registered GPM email or Student ID / Enrollment Number.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
                Email / Student ID
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="student@gpmalvan.ac.in or 2200150042"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition"
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
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 group"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Signing In...' : 'Login'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-[#ECE7DC] text-xs text-[#5C6A60]">
            Don't have a SkillNest account yet?{' '}
            <Link to="/signup" className="font-semibold text-[#1B382B] hover:underline ml-1">
              Sign Up
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
