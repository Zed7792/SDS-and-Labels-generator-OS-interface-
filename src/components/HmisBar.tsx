import React from 'react';
import { HmisRating } from '../types';

interface HmisBarProps {
  rating: HmisRating;
  width?: number; // width in px
  showLegend?: boolean;
  className?: string;
}

export const PPE_CODE_DESCRIPTIONS: Record<string, string> = {
  A: 'Safety glasses',
  B: 'Safety glasses + gloves',
  C: 'Safety glasses + gloves + chemical apron',
  D: 'Face shield + gloves + chemical apron',
  E: 'Safety glasses + gloves + dust respirator',
  F: 'Safety glasses + gloves + apron + dust respirator',
  G: 'Safety glasses + gloves + vapor respirator',
  H: 'Splash goggles + gloves + apron + vapor respirator',
  I: 'Safety glasses + gloves + dust & vapor respirator',
  J: 'Splash goggles + gloves + apron + combination dust/vapor respirator',
  K: 'Airline hood/mask or SCBA + gloves + full suit + boots',
  X: 'Special handling — Consult EHS supervisor',
};

export const HmisBar: React.FC<HmisBarProps> = ({
  rating,
  width = 170,
  showLegend = false,
  className = '',
}) => {
  const { health, isChronic, flammability, physicalHazard, ppeCode } = rating;

  return (
    <div className={`inline-flex flex-col select-none ${className}`} style={{ width: `${width}px` }}>
      {/* Container with black outline */}
      <div className="border-2 border-neutral-900 rounded-sm overflow-hidden bg-white shadow-xs">
        {/* HMIS Header */}
        <div className="bg-neutral-900 text-white text-[9px] font-black uppercase tracking-wider text-center py-0.5">
          HMIS® III
        </div>

        {/* HEALTH (Blue) */}
        <div className="flex border-b border-neutral-900 h-6">
          <div className="w-6 bg-blue-600 flex items-center justify-center text-white font-bold text-xs border-r border-neutral-900">
            {isChronic ? '*' : ''}
          </div>
          <div className="flex-1 bg-blue-600 px-1.5 flex items-center justify-between text-white">
            <span className="text-[10px] font-bold tracking-tight uppercase">Health</span>
            <span className="text-sm font-black mr-1">{health}</span>
          </div>
        </div>

        {/* FLAMMABILITY (Red) */}
        <div className="flex border-b border-neutral-900 h-6">
          <div className="w-6 bg-red-600 border-r border-neutral-900" />
          <div className="flex-1 bg-red-600 px-1.5 flex items-center justify-between text-white">
            <span className="text-[10px] font-bold tracking-tight uppercase">Flammability</span>
            <span className="text-sm font-black mr-1">{flammability}</span>
          </div>
        </div>

        {/* PHYSICAL HAZARD (Orange) */}
        <div className="flex border-b border-neutral-900 h-6">
          <div className="w-6 bg-amber-500 border-r border-neutral-900" />
          <div className="flex-1 bg-amber-500 px-1.5 flex items-center justify-between text-neutral-950">
            <span className="text-[10px] font-bold tracking-tight uppercase">Physical Haz.</span>
            <span className="text-sm font-black mr-1">{physicalHazard}</span>
          </div>
        </div>

        {/* PERSONAL PROTECTION (White) */}
        <div className="flex h-6">
          <div className="w-6 bg-neutral-100 border-r border-neutral-900" />
          <div className="flex-1 bg-white px-1.5 flex items-center justify-between text-neutral-900">
            <span className="text-[10px] font-bold tracking-tight uppercase">Personal Prot.</span>
            <span className="text-sm font-black mr-1">{ppeCode || 'A'}</span>
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="text-[10px] text-neutral-600 mt-1.5 leading-tight">
          <span className="font-semibold text-neutral-800">PPE [{ppeCode}]:</span>{' '}
          {PPE_CODE_DESCRIPTIONS[ppeCode] || 'Standard industrial PPE'}
        </div>
      )}
    </div>
  );
};
