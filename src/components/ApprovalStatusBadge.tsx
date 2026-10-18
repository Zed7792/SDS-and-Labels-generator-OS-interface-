import React from 'react';
import { CheckCircle2, Clock, FileEdit, AlertOctagon, Archive } from 'lucide-react';
import { ChemicalStatus } from '../types';

interface ApprovalStatusBadgeProps {
  status: ChemicalStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  pulse?: boolean;
}

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
  pulse = true,
}) => {
  const norm = (status || 'draft').toLowerCase();

  let config = {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    label: 'Draft',
    icon: FileEdit,
  };

  if (norm === 'approved') {
    config = {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Approved for Use',
      icon: CheckCircle2,
    };
  } else if (norm === 'under_review' || norm === 'requires_review') {
    config = {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      label: 'Under Review',
      icon: Clock,
    };
  } else if (norm === 'rejected') {
    config = {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      label: 'Revision Requested',
      icon: AlertOctagon,
    };
  } else if (norm === 'archived' || norm === 'obsolete' || norm === 'superseded') {
    config = {
      bg: 'bg-slate-100',
      text: 'text-slate-500',
      border: 'border-slate-300',
      dot: 'bg-slate-400',
      label: 'Archived / Superseded',
      icon: Archive,
    };
  }

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} shadow-2xs select-none`}
    >
      <span className="relative flex items-center justify-center">
        {pulse && (norm === 'under_review' || norm === 'requires_review') && (
          <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full ${config.dot} opacity-75`} />
        )}
        <Icon className={`${iconSizes} flex-shrink-0`} />
      </span>
      {showLabel && <span className="whitespace-nowrap">{config.label}</span>}
    </span>
  );
};
