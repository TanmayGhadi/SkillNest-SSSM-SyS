import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  UploadCloud,
  X,
  PlayCircle,
  Send,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order, Profile, Submission, Revision } from '../../types/database';
import { OrderTimeline } from '../../components/OrderTimeline';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';

export const ActiveOrders: React.FC = () => {
  const { freelancerProfile, user } = useAuth();

  const [orders, setOrders] = useState<(Order & { student?: Profile; latest_revision?: Revision })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Delivery Modal state
  const [deliveryOrder, setDeliveryOrder] = useState<Order | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliveryFileUrl, setDeliveryFileUrl] = useState('');
  const [isDelivering, setIsDelivering] = useState(false);

  useEffect(() => {
    if (freelancerProfile) {
      loadOrders();
    }
  }, [freelancerProfile]);

  const loadOrders = async () => {
    if (!freelancerProfile) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, student:profiles!orders_student_id_fkey(*)')
        .eq('freelancer_id', freelancerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersWithRevisions = await Promise.all(
        (data || []).map(async (ord) => {
          if (ord.status === 'revision_requested') {
            const { data: revData } = await supabase
              .from('revisions')
              .select('*')
              .eq('order_id', ord.id)
              .order('created_at', { ascending: false })
              .limit(1);

            return {
              ...ord,
              latest_revision: revData?.[0] || null,
            };
          }
          return ord;
        })
      );

      setOrders(ordersWithRevisions);
    } catch (err) {
      console.error('Error fetching freelancer orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      loadOrders();
    } catch (err) {
      console.error('Update order status error:', err);
    }
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryOrder) return;

    if (!deliveryNotes.trim() && !deliveryFileUrl.trim()) {
      alert('Please provide delivery notes or a file link.');
      return;
    }

    setIsDelivering(true);
    try {
      await supabase.from('submissions').insert({
        order_id: deliveryOrder.id,
        file_url: deliveryFileUrl.trim() || null,
        notes: deliveryNotes.trim() || null,
      });

      await supabase
        .from('orders')
        .update({ status: 'submitted' })
        .eq('id', deliveryOrder.id);

      setDeliveryOrder(null);
      setDeliveryNotes('');
      setDeliveryFileUrl('');
      loadOrders();
    } catch (err) {
      console.error('Deliver work error:', err);
    } finally {
      setIsDelivering(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1B382B]">
          Client Orders & Deliveries
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6A60] mt-1">
          Review incoming requests, advance project stages, and upload project deliverables.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-[#ECE7DC] h-64 animate-pulse p-6" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const student = order.student;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-6 shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE7DC] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#B85D36] uppercase tracking-wider">
                        Order #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-[#717E73]">&bull;</span>
                      <span className="text-xs text-[#717E73]">
                        Received {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-[#1B382B] text-xl mt-1">
                      {order.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-[#717E73]">Your Compensation</p>
                      <p className="font-serif font-bold text-[#1B382B] text-lg">₹{order.agreed_price}</p>
                    </div>

                    {student && (
                      <Link
                        to={`/messages?recipient=${student.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EAE5D8] hover:bg-[#DDD5C5] text-[#1B382B] text-xs font-semibold transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#2D5A43]" />
                        Chat with Client
                      </Link>
                    )}
                  </div>
                </div>

                {/* 6-stage lifecycle progress tracker */}
                <OrderTimeline
                  status={order.status}
                  createdAt={order.created_at}
                  deadline={order.deadline}
                  completedAt={order.completed_at}
                />

                {/* Client Requirements Box */}
                <div className="bg-[#FBF9F4] rounded-2xl p-5 text-xs space-y-2 border border-[#ECE7DC]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1B382B] uppercase tracking-wider">
                      Student Specifications:
                    </span>
                    <span className="text-[#717E73]">
                      Client: <strong className="text-[#1B382B]">{student?.full_name || 'GPM Student'}</strong> ({student?.department})
                    </span>
                  </div>
                  <p className="text-[#5C6A60] leading-relaxed whitespace-pre-line font-sans">
                    {order.requirements}
                  </p>
                  {order.attachment_url && (
                    <div className="pt-2">
                      <a
                        href={order.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#2D5A43] font-semibold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Student Reference Material
                      </a>
                    </div>
                  )}
                </div>

                {/* Revision Notice */}
                {order.status === 'revision_requested' && order.latest_revision && (
                  <div className="p-4 rounded-2xl bg-[#FEFDE8] border border-[#F9E79F] text-xs space-y-2">
                    <div className="flex items-center gap-2 text-[#B7950B] font-bold">
                      <AlertCircle className="w-4 h-4" /> Student Requested Revision
                    </div>
                    <p className="text-[#7D6608] bg-white/70 p-3 rounded-xl">
                      {order.latest_revision.notes}
                    </p>
                  </div>
                )}

                {/* Stage Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#ECE7DC]">
                  <div className="text-xs text-[#717E73]">
                    Deadline: <strong className="text-[#1B382B]">{order.deadline ? new Date(order.deadline).toLocaleDateString('en-IN') : 'Flexible'}</strong>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.status === 'requested' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          className="px-4 py-2 rounded-full border border-[#ECE7DC] hover:bg-rose-50 text-rose-700 text-xs font-semibold transition"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'accepted')}
                          className="px-6 py-2 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] text-xs font-semibold shadow-sm transition"
                        >
                          Accept Project
                        </button>
                      </>
                    )}

                    {order.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                        className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] text-xs font-semibold shadow-sm transition"
                      >
                        <PlayCircle className="w-4 h-4" /> Start Working
                      </button>
                    )}

                    {(order.status === 'in_progress' || order.status === 'revision_requested') && (
                      <button
                        onClick={() => setDeliveryOrder(order)}
                        className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] text-xs font-semibold shadow-sm transition"
                      >
                        <UploadCloud className="w-4 h-4" /> Deliver Finished Work
                      </button>
                    )}

                    {order.status === 'submitted' && (
                      <span className="text-xs font-medium text-[#B7950B] bg-[#FEFDE8] border border-[#F9E79F] px-4 py-1.5 rounded-full">
                        Awaiting Student Approval
                      </span>
                    )}

                    {order.status === 'completed' && (
                      <span className="text-xs font-medium text-[#2D5A43] bg-[#E5ECE6] border border-[#C5DCCE] px-4 py-1.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Project Completed & Cleared
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No orders yet."
          description="You don't have any client orders at the moment. Share your services with peers in your GPM department!"
          actionLabel="View My Services"
          actionTo="/freelancer/services"
        />
      )}

      {/* Deliver Work Modal */}
      {deliveryOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14261C]/50 backdrop-blur-sm p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-[#1B382B] text-xl">Deliver Completed Work</h3>
                <p className="text-xs text-[#717E73] mt-0.5">{deliveryOrder.title}</p>
              </div>
              <button
                onClick={() => setDeliveryOrder(null)}
                className="p-1.5 rounded-full hover:bg-[#F3EFE6] text-[#717E73]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDelivery} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                  Deliverable Files / Google Drive URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/drive/folders/... or GitHub repository"
                  value={deliveryFileUrl}
                  onChange={(e) => setDeliveryFileUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                  Delivery Notes & Instructions *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain how to run the code, open the CAD file, or view the report. Mention that you're open to any questions."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeliveryOrder(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#5C6A60]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDelivering}
                  className="px-6 py-2.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs transition shadow-sm disabled:opacity-50"
                >
                  {isDelivering ? 'Submitting...' : 'Submit Deliverable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
