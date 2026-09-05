import React from 'react';
import { CheckCircle2, Clock, PlayCircle, UploadCloud, RefreshCw, XCircle } from 'lucide-react';
import { OrderStatus } from '../types/database';

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
  deadline?: string;
  completedAt?: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  status,
  createdAt,
  deadline,
  completedAt,
}) => {
  const isCancelled = status === 'cancelled';

  const steps = [
    {
      id: 'requested',
      label: 'Order Placed',
      description: `Created on ${new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`,
      icon: Clock,
      isActive: true,
      isDone: status !== 'requested',
    },
    {
      id: 'accepted',
      label: 'Accepted',
      description: status === 'requested' ? 'Pending freelancer review' : 'Freelancer accepted project',
      icon: CheckCircle2,
      isActive: ['accepted', 'in_progress', 'submitted', 'revision_requested', 'completed'].includes(status),
      isDone: ['in_progress', 'submitted', 'revision_requested', 'completed'].includes(status),
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      description: status === 'in_progress' ? 'Work is underway' : (['submitted', 'revision_requested', 'completed'].includes(status) ? 'Development completed' : 'Awaiting start'),
      icon: PlayCircle,
      isActive: ['in_progress', 'submitted', 'revision_requested', 'completed'].includes(status),
      isDone: ['submitted', 'revision_requested', 'completed'].includes(status),
    },
    {
      id: 'submitted',
      label: status === 'revision_requested' ? 'Revision Needed' : 'Work Delivered',
      description: status === 'revision_requested' ? 'Student requested changes' : (status === 'submitted' ? 'Deliverables ready for review' : (status === 'completed' ? 'Delivered' : 'Pending submission')),
      icon: status === 'revision_requested' ? RefreshCw : UploadCloud,
      isActive: ['submitted', 'revision_requested', 'completed'].includes(status),
      isDone: status === 'completed',
      isWarning: status === 'revision_requested',
    },
    {
      id: 'completed',
      label: 'Completed',
      description: status === 'completed' ? `Approved on ${completedAt ? new Date(completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'recently'}` : (deadline ? `Due ${new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Awaiting student approval'),
      icon: CheckCircle2,
      isActive: status === 'completed',
      isDone: status === 'completed',
    },
  ];

  if (isCancelled) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center gap-4 text-rose-800">
        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
          <XCircle className="w-6 h-6 text-rose-600" />
        </div>
        <div>
          <h4 className="font-semibold text-rose-900">Order Cancelled</h4>
          <p className="text-sm text-rose-700">This request was cancelled. No further revisions or submissions can be made.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-sand-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-navy-900 text-lg">Project Lifecycle Tracker</h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${
          status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
          status === 'revision_requested' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
          status === 'in_progress' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
          status === 'submitted' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
          'bg-sand-100 text-sand-700 border border-sand-200'
        }`}>
          Current Status: {status.replace('_', ' ')}
        </span>
      </div>

      <div className="relative">
        {/* Step circles and line */}
        <div className="hidden md:flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-sand-200 -translate-y-1/2 z-0" />
          
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  step.isDone ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' :
                  step.isWarning ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-4 ring-amber-100' :
                  step.isActive ? 'bg-teal-50 text-teal-700 border-2 border-teal-600 ring-4 ring-teal-50' :
                  'bg-sand-100 text-sand-400 border border-sand-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-3 text-center max-w-[120px]">
                  <p className={`text-xs font-semibold ${step.isActive || step.isDone ? 'text-navy-900' : 'text-sand-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-sand-500 line-clamp-2 mt-0.5 leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile vertical timeline */}
        <div className="md:hidden space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  step.isDone ? 'bg-teal-600 text-white' :
                  step.isWarning ? 'bg-amber-500 text-white' :
                  step.isActive ? 'bg-teal-50 text-teal-700 border-2 border-teal-600' :
                  'bg-sand-100 text-sand-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${step.isActive || step.isDone ? 'text-navy-900' : 'text-sand-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-sand-500">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
