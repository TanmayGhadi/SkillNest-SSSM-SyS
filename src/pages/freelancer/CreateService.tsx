import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Save,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export const CreateService: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { freelancerProfile, user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Projects & Development');
  const [price, setPrice] = useState(499);
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [revisionsAllowed, setRevisionsAllowed] = useState(2);
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'Projects & Development',
    'PPT & Documents',
    'Academic Support',
    'Design & Media',
    'Printing Services',
    'Career & Professional',
  ];

  useEffect(() => {
    if (isEditing && id) {
      loadExistingService(id);
    }
  }, [id, isEditing]);

  const loadExistingService = async (serviceId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) throw error;
      if (data) {
        setTitle(data.title);
        setCategory(data.category);
        setPrice(data.price);
        setDeliveryDays(data.delivery_days);
        setRevisionsAllowed(data.revisions_allowed);
        setDescription(data.description);
        setTagsInput(data.tags ? data.tags.join(', ') : '');
        setCoverImage(data.cover_image || '');
      }
    } catch (err: any) {
      console.error('Error loading service:', err);
      setErrorMsg('Failed to load existing service data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freelancerProfile) {
      setErrorMsg('Please activate your freelancer profile first.');
      return;
    }

    if (!title.trim() || !description.trim() || price <= 0) {
      setErrorMsg('Please provide a title, price, and clear description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const servicePayload = {
      freelancer_id: freelancerProfile.id,
      title: title.trim(),
      category,
      price: Number(price),
      delivery_days: Number(deliveryDays),
      revisions_allowed: Number(revisionsAllowed),
      description: description.trim(),
      tags,
      cover_image: coverImage.trim() || null,
      is_active: true,
    };

    try {
      if (isEditing && id) {
        const { error } = await supabase
          .from('services')
          .update(servicePayload)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert(servicePayload);

        if (error) throw error;
      }

      navigate('/freelancer/services');
    } catch (err: any) {
      console.error('Save service error:', err);
      setErrorMsg(err.message || 'Failed to save service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        <div className="h-6 bg-[#EAE5D8] rounded w-1/4" />
        <div className="h-80 bg-[#EAE5D8] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/freelancer/services"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#5C6A60] hover:text-[#1B382B] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Services
        </Link>
      </div>

      <div className="bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1B382B]">
            {isEditing ? 'Edit Service Offering' : 'Publish a New Service'}
          </h1>
          <p className="text-xs text-[#5C6A60] mt-1">
            Offer your technical or academic skills to fellow students at Government Polytechnic Malvan.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
              Service Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AutoCAD 2D Drafting & Civil Plans for 4th Sem Project"
              className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-white text-[#1B382B] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min={50}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                Delivery Turnaround (Days) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={30}
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
                Revisions Allowed *
              </label>
              <input
                type="number"
                required
                min={0}
                max={10}
                value={revisionsAllowed}
                onChange={(e) => setRevisionsAllowed(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
              Service Description & Inclusions *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail what is included: e.g. source files, PDF deliverables, 1-on-1 code walkthrough, MSBTE synopsis compliance..."
              className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43] resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
              Search Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. AutoCAD, Civil, 2D Drawing, Floor Plan, MSBTE"
              className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#1B382B] uppercase tracking-wider">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-3 rounded-2xl border border-[#ECE7DC] bg-[#FBF9F4] text-[#1B382B] text-sm focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/20 focus:border-[#2D5A43]"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-[#ECE7DC]">
            <Link
              to="/freelancer/services"
              className="px-6 py-3 rounded-full border border-[#ECE7DC] hover:bg-[#F3EFE6] text-[#5C6A60] text-xs font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs shadow-md transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Service' : 'Publish Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
