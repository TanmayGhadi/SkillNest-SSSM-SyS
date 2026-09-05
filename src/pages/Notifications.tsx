import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Notification } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/EmptyState';

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1B382B]">Notifications</h1>
          <p className="text-xs sm:text-sm text-[#5C6A60] mt-1">
            Real-time updates regarding service requests, deliverables, messages, and campus announcements.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#ECE7DC] hover:bg-[#F3EFE6] text-xs font-semibold text-[#1B382B] transition self-start sm:self-auto"
          >
            <Check className="w-4 h-4 text-[#2D5A43]" />
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-[#ECE7DC] h-20 animate-pulse" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="bg-white rounded-3xl border border-[#ECE7DC] divide-y divide-[#ECE7DC] shadow-sm overflow-hidden">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-5 sm:p-6 flex items-start justify-between gap-4 transition-colors ${
                !item.is_read ? 'bg-[#FBF9F4]' : 'hover:bg-[#FFFDF9]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  !item.is_read ? 'bg-[#EFEAE0] text-[#1B382B]' : 'bg-[#F4EFE6] text-[#717E73]'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className={`text-sm font-semibold ${!item.is_read ? 'text-[#1B382B]' : 'text-[#5C6A60]'}`}>
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#5C6A60] leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-[#717E73] pt-1">
                    {new Date(item.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.link && (
                  <Link
                    to={item.link}
                    className="p-2 text-xs font-semibold text-[#1B382B] hover:text-[#2D5A43] transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                {!item.is_read && (
                  <button
                    onClick={() => markAsRead(item.id)}
                    className="p-2 text-[#717E73] hover:text-[#2D5A43] transition"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notifications yet"
          description="You're all caught up! Updates regarding service orders, milestone reviews, and peer messages will appear here."
          actionLabel="Explore Services"
          actionTo="/services"
        />
      )}
    </div>
  );
};
