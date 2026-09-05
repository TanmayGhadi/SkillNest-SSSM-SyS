import React, { useState } from 'react';
import { Shield, Bell, Lock, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const SettingsPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');

  const [emailNotify, setEmailNotify] = useState(true);
  const [orderNotify, setOrderNotify] = useState(true);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    setPassError('');
    setPassSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 4000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1B382B]">Account Settings</h1>
        <p className="text-xs sm:text-sm text-[#5C6A60] mt-1">
          Configure notifications, security credentials, and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Security / Password Card */}
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFEAE0] text-[#1B382B] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1B382B]">Security & Password</h3>
              <p className="text-xs text-[#5C6A60]">Update your account password</p>
            </div>
          </div>

          {passSuccess && (
            <div className="p-4 rounded-2xl bg-[#F4F7F4] border border-[#C5DCCE] text-[#1B382B] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          {passError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPass}
              className="px-6 py-2.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs transition shadow-sm disabled:opacity-50"
            >
              {isChangingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Notifications Preferences */}
        <div className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFEAE0] text-[#1B382B] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1B382B]">Notifications</h3>
              <p className="text-xs text-[#5C6A60]">Control how you receive updates</p>
            </div>
          </div>

          <div className="space-y-4 max-w-md text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#ECE7DC]">
              <div>
                <p className="font-semibold text-[#1B382B]">Service Order Updates</p>
                <p className="text-[#5C6A60]">Receive alerts when orders progress or deliverables arrive</p>
              </div>
              <input
                type="checkbox"
                checked={orderNotify}
                onChange={(e) => setOrderNotify(e.target.checked)}
                className="w-4 h-4 text-[#2D5A43] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[#ECE7DC]">
              <div>
                <p className="font-semibold text-[#1B382B]">Direct Chat Notifications</p>
                <p className="text-[#5C6A60]">Alerts when a student or freelancer sends a message</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="w-4 h-4 text-[#2D5A43] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-rose-900">Account Actions</h3>
              <p className="text-xs text-rose-700">Permanent account options</p>
            </div>
          </div>

          <p className="text-xs text-[#5C6A60]">
            Government Polytechnic Malvan student accounts are linked with institutional records. If you are graduating or leaving the diploma program, contact the campus administrator for record archiving.
          </p>
        </div>
      </div>
    </div>
  );
};
