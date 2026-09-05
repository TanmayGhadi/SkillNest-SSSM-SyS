import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}) => {
  return (
    <div className="w-full bg-[#FFFDF9] rounded-3xl border border-[#ECE7DC] p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-sm my-6 relative overflow-hidden">
      
      {/* Decorative botanical sprig */}
      <div className="w-16 h-16 rounded-full bg-[#EFEAE0] flex items-center justify-center mx-auto mb-5 text-[#2D5A43] shadow-inner">
        <svg className="w-8 h-8 text-[#2D5A43]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 4 13C4 7 11 2 11 2s7 5 7 11a7 7 0 0 1-7 7Z"/>
          <path d="M11 2v18"/>
        </svg>
      </div>

      <h3 className="font-serif text-2xl font-bold text-[#1B382B] tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-[#5C6A60] max-w-md mx-auto mt-2 leading-relaxed font-sans">
        {description}
      </p>

      {actionLabel && (
        <div className="mt-6 flex justify-center">
          {actionTo ? (
            <Link
              to={actionTo}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs transition-all shadow-sm hover:shadow-md group"
            >
              {actionLabel}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B382B] hover:bg-[#254B3A] text-[#FBF9F4] font-semibold text-xs transition-all shadow-sm hover:shadow-md group"
            >
              {actionLabel}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
