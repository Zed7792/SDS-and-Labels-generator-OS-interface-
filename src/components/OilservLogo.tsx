import React from 'react';

interface OilservLogoProps {
  className?: string;
  color?: string; // default is brand orange #EA580C
}

/**
 * Pixel-accurate, razor-sharp scalable SVG vector rendition of the official OILSERV logo mark.
 * ViewBox: 170 x 24 matches the exact geometric master specification.
 */
export const OilservLogo: React.FC<OilservLogoProps> = ({
  className = "h-10 sm:h-12 md:h-14 w-auto max-w-[210px]",
  color = "#ea580c",
}) => {
  return (
    <svg
      viewBox="0 0 170 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="OILSERV"
      role="img"
    >
      {/* Letter 'O': Rounded rectangular outer shape with clean hollow inner counter */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 0H21.5C24.5 0 27 2.5 27 5.5V18.5C27 21.5 24.5 24 21.5 24H5.5C2.5 24 0 21.5 0 18.5V5.5C0 2.5 2.5 0 5.5 0ZM7.2 5.8H19.8C20.5 5.8 21.2 6.5 21.2 7.2V16.8C21.2 17.5 20.5 18.2 19.8 18.2H7.2C6.5 18.2 5.8 17.5 5.8 16.8V7.2C5.8 6.5 6.5 5.8 7.2 5.8Z"
      />

      {/* Letter 'i': Distinctive square dot over rectangular stem */}
      <rect x="30" y="0" width="7" height="6.2" rx="0.5" />
      <rect x="30" y="8" width="7" height="16" rx="0.5" />

      {/* Letter 'L': Heavy industrial block L */}
      <path d="M40 0H47V18H58.5V24H40V0Z" />

      {/* Letter 'S': Geometric block S with horizontal center stroke */}
      <path d="M62 0H82.5V6.2H69V9H82.5V24H62V17.8H75.5V15H62V0Z" />

      {/* Letter 'E': Heavy 3-bar block E */}
      <path d="M86 0H106.5V6H93V9H105V15H93V18H106.5V24H86V0Z" />

      {/* Letter 'R': Angular industrial block R */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M110 0H127C129.5 0 131.5 2 131.5 4.5V9.5C131.5 11.5 130 13.2 128 13.8L132 24H124.5L121 14.5H117V24H110V0ZM117 5.5H124C124.8 5.5 125.5 6.2 125.5 7V7.5C125.5 8.3 124.8 9 124 9H117V5.5Z"
      />

      {/* Letter 'V': Bold angled wedge V */}
      <path d="M135 0H142.5L149.5 18L156.5 0H164L153.5 24H145.5L135 0Z" />
    </svg>
  );
};

export default OilservLogo;
