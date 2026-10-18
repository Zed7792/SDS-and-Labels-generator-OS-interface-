import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { Chemical, ValidationItem, ValidationStatus } from '../types';
import { validateChemicalLabel } from '../utils/validationEngine';

interface ValidationPanelProps {
  chemical: Chemical | null;
  onPublishApproved?: () => void;
  className?: string;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  chemical,
  onPublishApproved,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const summary = validateChemicalLabel(chemical);

  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />;
      case 'missing':
        return <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />;
      case 'requires_verification':
        return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    }
  };

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'complete':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
            Complete
          </span>
        );
      case 'missing':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 uppercase">
            Missing
          </span>
        );
      case 'requires_verification':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">
            Requires Verification
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden ${className}`}>
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/70 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-slate-600" />
          <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
            Compliance Validation Panel
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              summary.canPublish
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {summary.canPublish ? 'READY FOR SIGN-OFF' : 'DEFICIENCIES DETECTED'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="text-emerald-700 font-bold">{summary.completeCount} Complete</span>
            <span>•</span>
            <span className={summary.missingCount > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'}>
              {summary.missingCount} Missing
            </span>
            <span>•</span>
            <span className={summary.requiresVerificationCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-500'}>
              {summary.requiresVerificationCount} Verify
            </span>
          </div>

          <button className="text-slate-400 hover:text-slate-700 p-0.5">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Critical Legal Disclaimer */}
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">EHS Legal Notice & Human Verification Mandatory:</span>
              <p className="text-[11px] leading-relaxed text-amber-800">
                {summary.complianceNotice}
              </p>
            </div>
          </div>

          {/* Verification Items Checklist */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
            {summary.items.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                  item.status === 'missing'
                    ? 'bg-rose-50/30'
                    : item.status === 'requires_verification'
                    ? 'bg-amber-50/20'
                    : ''
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.field}</span>
                      <span className="text-[10px] text-slate-400">({item.category})</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{item.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.valueDescription && (
                    <span className="hidden sm:inline-block font-mono text-[10px] text-slate-500 max-w-[140px] truncate bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.valueDescription}
                    </span>
                  )}
                  {getStatusBadge(item.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Action Sign-off prompt */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Audit Rule: Dual human sign-off required for high-hazard Class 1 & 2 chemicals.
            </span>

            {summary.canPublish && onPublishApproved && (
              <button
                onClick={onPublishApproved}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md shadow-2xs transition-colors self-end sm:self-auto"
              >
                Certify & Approve for Print
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
