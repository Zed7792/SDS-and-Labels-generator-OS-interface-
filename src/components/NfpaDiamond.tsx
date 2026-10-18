import React from 'react';
import { NfpaRating } from '../types';

interface NfpaDiamondProps {
  rating: NfpaRating;
  size?: number; // width/height in px
  showLegend?: boolean;
  className?: string;
}

export const NfpaDiamond: React.FC<NfpaDiamondProps> = ({
  rating,
  size = 110,
  showLegend = false,
  className = '',
}) => {
  const { health, flammability, instability, special } = rating;

  // Diamond geometry based on standard 100x100 viewBox
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="drop-shadow-xs"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer border */}
        <polygon
          points="50,2 98,50 50,98 2,50"
          fill="#1E293B"
          stroke="#0F172A"
          strokeWidth="3"
        />

        {/* TOP: Flammability (RED) */}
        <polygon
          points="50,4 73,27 50,50 27,27"
          fill="#DC2626"
          stroke="#1E293B"
          strokeWidth="1.5"
        />
        <text
          x="50"
          y="34"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="20"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {flammability}
        </text>

        {/* LEFT: Health (BLUE) */}
        <polygon
          points="27,27 50,50 27,73 4,50"
          fill="#2563EB"
          stroke="#1E293B"
          strokeWidth="1.5"
        />
        <text
          x="27"
          y="57"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="20"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {health}
        </text>

        {/* RIGHT: Instability/Reactivity (YELLOW) */}
        <polygon
          points="73,27 96,50 73,73 50,50"
          fill="#FACC15"
          stroke="#1E293B"
          strokeWidth="1.5"
        />
        <text
          x="73"
          y="57"
          textAnchor="middle"
          fill="#0F172A"
          fontSize="20"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          {instability}
        </text>

        {/* BOTTOM: Special Notice (WHITE) */}
        <polygon
          points="50,50 73,73 50,96 27,73"
          fill="#F8FAFC"
          stroke="#1E293B"
          strokeWidth="1.5"
        />
        {special ? (
          special === 'W' ? (
            /* W with line through it for react-with-water */
            <g transform="translate(50, 80)">
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill="#0F172A"
                fontSize="15"
                fontWeight="bold"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                W
              </text>
              <line x1="-8" y1="-5" x2="8" y2="-5" stroke="#0F172A" strokeWidth="2" />
            </g>
          ) : (
            <text
              x="50"
              y="79"
              textAnchor="middle"
              fill="#0F172A"
              fontSize={special.length > 2 ? '11' : '15'}
              fontWeight="bold"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {special}
            </text>
          )
        ) : null}
      </svg>

      {showLegend && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[10px] text-neutral-600 font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" />
            <span>Health: {health}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-red-600 inline-block" />
            <span>Flam: {flammability}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-yellow-400 inline-block" />
            <span>Instab: {instability}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-neutral-200 border border-neutral-400 inline-block" />
            <span>Spec: {special || 'None'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
