import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  FileText,
  MessageSquare,
  Star,
  RefreshCw,
  ExternalLink,
  X,
  ThumbsUp,
  Download,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order, FreelancerProfile, Profile, Submission } from '../../types/database';
import { OrderTimeline } from '../../components/OrderTimeline';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../../components/EmptyState';

export const MyRequests: React.FC = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState<(Order & { freelancer?: FreelancerProfile & { profile?: Profile }; latest_submission?: Submission })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Revision request modal state
  const [revisionOrder, setRevisionOrder] = useState<Order | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, freelancer:freelancers(*, profile:profiles(*))')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersWithSubmissions = await Promise.all(
        (data || []).map(async (ord) => {
          const { data: subData } = await supabase
            .from('submissions')
            .select('*')
            .eq('order_id', ord.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...ord,
            latest_submission: subData?.[0] || null,
          };
        })
      );

      setOrders(ordersWithSubmissions);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveWork = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (err) {
      console.error('Error approving work:', err);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
    }
  };

  const handleRequestRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionOrder || !revisionNotes.trim()) return;

    setIsSubmittingRevision(true);
    try {
      await supabase.from('revisions').insert({
        order_id: revisionOrder.id,
        requested_by: user!.id,
        notes: revisionNotes.trim(),
      });

      await supabase
        .from('orders')
        .update({ status: 'revision_requested' })
        .eq('id', revisionOrder.id);

      setRevisionOrder(null);
      setRevisionNotes('');
      fetchOrders();
    } catch (err) {
      console.error('Error requesting revision:', err);
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !user) return;

    setIsSubmittingReview(true);
    try {
      await supabase.from('reviews').insert({
        order_id: reviewOrder.id,
        service_id: reviewOrder.service_id,
        freelancer_id: reviewOrder.freelancer_id,
        student_id: user.id,
        rating,
        comment: comment.trim() || 'Great peer guidance and prompt delivery!',
      });

      setReviewOrder(null);
      setComment('');
      fetchOrders();
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1B382B]">
          My Service Requests
        </h1>
        <p className="text-xs sm:text-sm text-[#5C6A60] mt-1">
          Monitor your project orders, review delivered milestones, and request revisions.
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
            const freelancer = order.freelancer;
            const profile = freelancer?.profile;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#ECE7DC] p-6 sm:p-8 space-y-6 shadow-sm"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE7DC] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#2D5A43] uppercase tracking-wider">
                        Order #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-[#717E73]">&bull;</span>
                      <span className="text-xs text-[#717E73]">
                        Placed {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-[#1B382B] text-xl mt-1">
                      {order.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-[#717E73]">Agreed Price</p>
                      <p className="font-serif font-bold text-[#1B382B] text-lg">₹{order.agreed_price}</p>
                    </div>

                    {profile && (
                      <Link
                        to={`/messages?recipient=${profile.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#EAE5D8] hover:bg-[#DDD5C5] text-[#1B382B] text-xs font-semibold transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#2D5A43]" />
                        Chat
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

                {/* Requirements Summary */}
                <div className="bg-[#FBF9F4] rounded-2xl p-5 text-xs space-y-2 border border-[#ECE7DC]">
                  <span className="font-semibold text-[#1B382B] uppercase tracking-wider block">
                    Your Instructions:
                  </span>
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
                        <ExternalLink className="w-3.5 h-3.5" /> View Reference Attachment
                      </a>
                    </div>
                  )}
                </div>

                {/* Submission Deliverable Review Box */}
                {order.latest_submission && (
                  <div className="bg-[#EBF5FB] border border-[#D4E6F1] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1B4F72] flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#2980B9]" /> Deliverable Submitted
                      </span>
                      <span className="text-[11px] text-[#5499C7]">
                        {new Date(order.latest_submission.submitted_at || order.latest_submission.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    {order.latest_submission.notes && (
                      <p className="text-xs text-[#1B4F72] bg-white/80 p-3 rounded-xl">
                        {order.latest_submission.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      {order.latest_submission.file_url ? (
                        <a
                          href={order.latest_submission.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#AED6F1] text-[#1B4F72] text-xs font-semibold hover:bg-[#EBF5FB] shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5 text-[#2980B9]" /> Access Delivered Files
                        </a>
                      ) : (
                        <span className="text-xs text-[#717E73]">Direct notes delivery</span>
                      )}

                      {order.status === 'submitted' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRevisionOrder(order)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FEFDE8] text-[#B7950B] border border-[#F9E79F] text-xs font-semibold hover:bg-[#FCF3CF] transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Request Revision
                          </button>
                          <button
                            onClick={() => handleApproveWork(order.id)}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] text-xs font-semibold transition shadow-sm"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" /> Accept & Complete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-[#717E73]">
                    Freelancer: <strong className="text-[#1B382B]">{profile?.full_name || 'GPM Student'}</strong> ({profile?.department})
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'requested' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-4 py-1.5 rounded-full border border-[#ECE7DC] hover:bg-rose-50 text-rose-700 text-xs font-semibold transition"
                      >
                        Cancel Request
                      </button>
                    )}

                    {order.status === 'completed' && (
                      <button
                        onClick={() => setReviewOrder(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E5ECE6] text-[#2D5A43] text-xs font-semibold hover:bg-[#D5E4D7] transition"
                      >
                        <Star className="w-3.5 h-3.5 text-[#B85D36] fill-[#B85D36]" /> Leave Review
                      </button>
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
          description="Browse peer services to request MSBTE capstone assistance, technical drafting, or solved practical manuals."
          actionLabel="Find Services"
          actionTo="/services"
        />
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14261C]/50 backdrop-blur-sm p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-[#1B382B] text-xl">Leave Peer Feedback</h3>
                <p className="text-xs text-[#717E73] mt-0.5">{reviewOrder.title}</p>
              </div>
              <button onClick={() => setReviewOrder(null)} className="p-1.5 rounded-full hover:bg-[#F3EFE6] text-[#717E73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider block">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button type="button" key={s} onClick={() => setRating(s)} className="p-1 hover:scale-110 transition">
                      <Star className={`w-7 h-7 ${s <= rating ? 'text-[#B85D36] fill-[#B85D36]' : 'text-[#DDD5C5]'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Comment & Review *</label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the project guidance? Were syllabus standards met?"
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setReviewOrder(null)} className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#5C6A60]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingReview} className="px-6 py-2.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs transition shadow-sm">
                  {isSubmittingReview ? 'Posting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {revisionOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#14261C]/50 backdrop-blur-sm p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-[#1B382B] text-xl">Request Project Revision</h3>
                <p className="text-xs text-[#717E73] mt-0.5">{revisionOrder.title}</p>
              </div>
              <button onClick={() => setRevisionOrder(null)} className="p-1.5 rounded-full hover:bg-[#F3EFE6] text-[#717E73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestRevision} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1B382B] uppercase tracking-wider">Required Modifications *</label>
                <textarea
                  rows={4}
                  required
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Explain what changes are needed: e.g. adjust column dimensions on CAD plan..."
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-xs focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setRevisionOrder(null)} className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#5C6A60]">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingRevision} className="px-6 py-2.5 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs transition shadow-sm">
                  {isSubmittingRevision ? 'Sending...' : 'Request Revision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
