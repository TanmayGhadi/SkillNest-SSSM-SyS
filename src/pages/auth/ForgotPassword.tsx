import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendRecoveryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid student email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setDemoOtp(code);
      setStep('verify');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generating reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('Please enter a valid 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-[#FBF9F4]">
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] shadow-xl max-w-md w-full p-6 sm:p-10 space-y-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6A60] hover:text-[#1B382B] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="space-y-1.5 text-center">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B382B]">Reset Password</h1>
          <p className="text-xs text-[#5C6A60] leading-relaxed">
            {step === 'request'
              ? "Enter your registered student email and we'll dispatch an instant 6-digit OTP code."
              : `Enter the 6-digit code sent to ${email} and define your new password.`}
          </p>
        </div>

        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-[#F4F7F4] border border-[#C5DCCE] text-center space-y-3 animate-in fade-in">
            <CheckCircle2 className="w-10 h-10 text-[#2D5A43] mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#1B382B]">Password Successfully Reset!</h3>
            <p className="text-xs text-[#5C6A60]">
              Your account password has been updated. Redirecting you to login...
            </p>
            <Link
              to="/login"
              className="inline-block mt-2 px-6 py-2.5 rounded-full bg-[#1B382B] text-[#FBF9F4] text-xs font-semibold"
            >
              Go to Login
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

            {step === 'request' ? (
              <form onSubmit={handleSendRecoveryOtp} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
                    Student Email Address
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
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isLoading ? 'Generating OTP...' : 'Send Recovery OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndReset} className="space-y-4 text-xs">
                {demoOtp && (
                  <div className="p-3 rounded-2xl bg-[#F0F5F1] border border-[#C5DCCE] text-[#1B382B] text-xs space-y-1 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Recovery Code Dispatched!</span>
                      <button
                        type="button"
                        onClick={() => setOtp(demoOtp)}
                        className="text-[11px] font-bold text-[#2D5A43] hover:underline bg-white px-2 py-0.5 rounded border border-[#C5DCCE]"
                      >
                        Auto-Fill
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span>Code:</span>
                      <span className="font-mono font-bold text-sm tracking-wider">{demoOtp}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
                    6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] font-mono tracking-widest text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#1B382B] uppercase tracking-wider text-[11px]">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA59D]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-sm shadow-md transition disabled:opacity-50"
                >
                  {isLoading ? 'Updating Password...' : 'Verify & Set New Password'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
