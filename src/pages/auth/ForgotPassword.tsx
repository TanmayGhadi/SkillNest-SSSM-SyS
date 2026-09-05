import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      // Still show friendly feedback
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FBF9F4]">
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] shadow-xl max-w-md w-full p-8 sm:p-10 space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6A60] hover:text-[#1B382B] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="space-y-2 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#1B382B]">Reset Password</h1>
          <p className="text-xs text-[#5C6A60] leading-relaxed">
            Enter your registered student email and we'll transmit a secure password recovery instruction link.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-[#F4F7F4] border border-[#C5DCCE] text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#2D5A43] mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#1B382B]">Reset Instructions Dispatched</h3>
            <p className="text-xs text-[#5C6A60]">
              If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-6 py-2.5 rounded-full bg-[#1B382B] text-[#FBF9F4] text-xs font-semibold"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                Student Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@gpmalvan.ac.in"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] placeholder:text-[#9AA59D] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'Transmitting Link...' : 'Send Recovery Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
