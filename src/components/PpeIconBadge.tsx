import React from 'react';

export type PpeItemId =
  | 'eye'
  | 'foot'
  | 'hand'
  | 'no_smoking'
  | 'face_shield'
  | 'respiratory'
  | 'clothing'
  | 'scba'
  | 'dust_mask'
  | 'apron';

export interface PpeItemDef {
  id: PpeItemId;
  title: string;
  subtitle: string;
}

export const PPE_ITEMS: PpeItemDef[] = [
  { id: 'eye', title: 'Eye Protection', subtitle: 'Safety Glasses/Goggles' },
  { id: 'foot', title: 'Safety Footwear', subtitle: 'Safety Boots' },
  { id: 'hand', title: 'Hand Protection', subtitle: 'Safety Gloves' },
  { id: 'no_smoking', title: 'No Smoking', subtitle: 'Prohibited in chemical zone' },
  { id: 'face_shield', title: 'Face Shield Protection', subtitle: 'Full face visor' },
  { id: 'respiratory', title: 'Respiratory Protection', subtitle: 'Gas Mask/Respirator' },
  { id: 'clothing', title: 'Protective Clothing', subtitle: 'Coveralls/Full Body Suit' },
  { id: 'scba', title: 'Self-Contained Breathing Apparatus', subtitle: 'SCBA' },
  { id: 'dust_mask', title: 'Dust Mask/Face Mask', subtitle: 'Particulate protection' },
  { id: 'apron', title: 'Protective Apron', subtitle: 'Chemical-resistant apron' },
];

interface PpeIconBadgeProps {
  id?: PpeItemId;
  size?: number;
  className?: string;
  placeholder?: boolean;
  showTitle?: boolean;
}

export const PpeIconBadge: React.FC<PpeIconBadgeProps> = ({
  id,
  size = 36,
  className = '',
  placeholder = false,
  showTitle = false,
}) => {
  if (placeholder || !id) {
    return (
      <div
        className={`rounded-full border-2 border-slate-300 bg-slate-100 flex-shrink-0 flex items-center justify-center ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  const renderIcon = () => {
    switch (id) {
      case 'eye':
        // Safety Goggles / Glasses
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%] text-white">
            <circle cx="7" cy="12" r="4" />
            <circle cx="17" cy="12" r="4" />
            <path d="M11 12h2" />
            <path d="M3 11l2-3h3" />
            <path d="M21 11l-2-3h-3" />
          </svg>
        );
      case 'foot':
        // Safety Boots
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%] text-white">
            <path d="M5 4h6v9a4 4 0 0 0 4 4h5v3H4a1 1 0 0 1-1-1V7a3 3 0 0 1 2-3Z" />
            <path d="M8 8h3" />
            <path d="M8 11h3" />
          </svg>
        );
      case 'hand':
        // Safety Gloves
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%] text-white">
            <path d="M8 12V6a2 2 0 0 1 4 0v6" />
            <path d="M12 11V4a2 2 0 0 1 4 0v7" />
            <path d="M16 11V6a2 2 0 0 1 4 0v9a6 6 0 0 1-12 0v-4a2 2 0 0 1 4 0v1" />
          </svg>
        );
      case 'no_smoking':
        // No Smoking sign
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%] text-white">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'face_shield':
        // Face shield
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%] text-white">
            <path d="M12 3a9 9 0 0 0-9 9c0 5 4 8 9 9s9-4 9-9a9 9 0 0 0-9-9Z" />
            <path d="M7 10h10" />
            <path d="M9 14h6" />
            <path d="M12 6v2" />
          </svg>
        );
      case 'respiratory':
        // Gas Mask / Respirator
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%] text-white">
            <circle cx="12" cy="8" r="4" />
            <path d="M8 12c-2 0-3 2-3 4v3h14v-3c0-2-1-4-3-4" />
            <circle cx="9" cy="16" r="1.5" />
            <circle cx="15" cy="16" r="1.5" />
          </svg>
        );
      case 'clothing':
        // Coveralls / Full body suit
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%] text-white">
            <path d="M12 2a2 2 0 0 1 2 2v1l4 2-1 4-3-1v12h-4V10L7 11 6 7l4-2V4a2 2 0 0 1 2-2Z" />
          </svg>
        );
      case 'scba':
        // Self-Contained Breathing Apparatus
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%] text-white">
            <rect x="8" y="5" width="8" height="14" rx="3" />
            <path d="M12 2v3" />
            <path d="M10 2h4" />
            <path d="M16 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
          </svg>
        );
      case 'dust_mask':
        // Dust Mask
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%] text-white">
            <path d="M6 10c0 4 3 8 6 8s6-4 6-8-2-4-6-4-6 0-6 4Z" />
            <path d="M4 11l2 1" />
            <path d="M20 11l-2 1" />
          </svg>
        );
      case 'apron':
        // Protective Apron
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[60%] h-[60%] text-white">
            <path d="M9 3h6v4l3 3-2 11H8L6 10l3-3V3Z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[60%] h-[60%] text-white">
            <circle cx="12" cy="12" r="8" />
          </svg>
        );
    }
  };

  const isProhibition = id === 'no_smoking';
  const bgColor = isProhibition ? 'bg-white border-2 border-red-600 text-red-600' : 'bg-[#1e3a8a] text-white border-2 border-[#1e3a8a]';

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`rounded-full flex items-center justify-center shadow-xs flex-shrink-0 ${bgColor} ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {renderIcon()}
      </div>
      {showTitle && (
        <span className="text-[8px] font-bold text-slate-700 max-w-[60px] leading-tight mt-1">
          {PPE_ITEMS.find((p) => p.id === id)?.title}
        </span>
      )}
    </div>
  );
};
