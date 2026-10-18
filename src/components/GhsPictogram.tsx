import React from 'react';
import { GhsPictogramId } from '../types';

export interface GhsPictogramProps {
  id: GhsPictogramId;
  size?: number; // size in pixels of the diamond container
  showLabel?: boolean;
  className?: string;
  format?: 'svg' | 'png';
}

export interface PictogramMetadata {
  id: GhsPictogramId;
  code: string;
  name: string;
  filename: string;
  svgFile: string;
  description: string;
}

export const PICTOGRAM_META: Record<GhsPictogramId, PictogramMetadata> = {
  'exploding-bomb': {
    id: 'exploding-bomb',
    code: 'GHS01',
    name: 'Exploding Bomb',
    filename: 'ghs-01-explosive.png',
    svgFile: 'ghs-01-explosive.svg',
    description: 'Explosives, Self-Reactives, Organic Peroxides',
  },
  'flame': {
    id: 'flame',
    code: 'GHS02',
    name: 'Flammable',
    filename: 'ghs-02-flammable.png',
    svgFile: 'ghs-02-flammable.svg',
    description: 'Flammables, Self-Reactives, Pyrophorics, Organic Peroxides',
  },
  'flame-over-circle': {
    id: 'flame-over-circle',
    code: 'GHS03',
    name: 'Flame Over Circle (Oxidizing)',
    filename: 'ghs-03-oxidizing.png',
    svgFile: 'ghs-03-oxidizing.svg',
    description: 'Oxidizers (Gases, Liquids, Solids)',
  },
  'gas-cylinder': {
    id: 'gas-cylinder',
    code: 'GHS04',
    name: 'Gas Cylinder',
    filename: 'ghs-04-compressed-gas.png',
    svgFile: 'ghs-04-compressed-gas.svg',
    description: 'Gases Under Pressure (Compressed, Liquefied, Dissolved, Refrigerated)',
  },
  'corrosion': {
    id: 'corrosion',
    code: 'GHS05',
    name: 'Corrosion',
    filename: 'ghs-05-corrosive.png',
    svgFile: 'ghs-05-corrosive.svg',
    description: 'Skin Corrosion/Burns, Serious Eye Damage, Corrosive to Metals',
  },
  'skull-and-crossbones': {
    id: 'skull-and-crossbones',
    code: 'GHS06',
    name: 'Skull and Crossbones (Toxic)',
    filename: 'ghs-06-toxic.png',
    svgFile: 'ghs-06-toxic.svg',
    description: 'Acute Toxicity (Fatal or Toxic, Oral, Dermal, Inhalation)',
  },
  'exclamation-mark': {
    id: 'exclamation-mark',
    code: 'GHS07',
    name: 'Harmful (Exclamation Mark)',
    filename: 'ghs-07-harmful.png',
    svgFile: 'ghs-07-harmful.svg',
    description: 'Irritant (Skin/Eye), Skin Sensitizer, Acute Toxicity (Harmful), Narcotic Effects',
  },
  'health-hazard': {
    id: 'health-hazard',
    code: 'GHS08',
    name: 'Health Hazard',
    filename: 'ghs-08-health-hazard.png',
    svgFile: 'ghs-08-health-hazard.svg',
    description: 'Carcinogen, Mutagenicity, Reproductive Toxicity, Target Organ Toxicity, Aspiration',
  },
  'environment': {
    id: 'environment',
    code: 'GHS09',
    name: 'Environment',
    filename: 'ghs-09-environmental.png',
    svgFile: 'ghs-09-environmental.svg',
    description: 'Aquatic Toxicity (Acute and Chronic Ecological Hazards)',
  },
};

export const GhsPictogram: React.FC<GhsPictogramProps> = ({
  id,
  size = 48,
  showLabel = false,
  className = '',
  format = 'svg',
}) => {
  const meta = PICTOGRAM_META[id] || {
    id,
    code: 'GHS',
    name: id,
    filename: 'ghs-02-flammable.png',
    svgFile: 'ghs-02-flammable.svg',
    description: 'GHS Hazard',
  };

  const primarySrc = format === 'png' ? `/pictograms/${meta.filename}` : `/pictograms/${meta.svgFile}`;
  const fallbackSrc = format === 'png' ? `/pictograms/${meta.svgFile}` : `/pictograms/${meta.filename}`;

  return (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
      title={`[${meta.code}] ${meta.name}: ${meta.description}`}
    >
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img
          src={primarySrc}
          alt={`GHS Pictogram: ${meta.name}`}
          className="w-full h-full object-contain pointer-events-none select-none transition-transform"
          referrerPolicy="no-referrer"
          loading="eager"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== fallbackSrc) {
              target.src = fallbackSrc;
            }
          }}
        />
      </div>

      {showLabel && (
        <span className="text-[10px] font-semibold tracking-tight text-neutral-700 mt-1 max-w-[70px] text-center leading-tight">
          {meta.name}
        </span>
      )}
    </div>
  );
};

export const GHS_PICTOGRAM_LIST: GhsPictogramId[] = [
  'flame',
  'flame-over-circle',
  'exploding-bomb',
  'corrosion',
  'gas-cylinder',
  'skull-and-crossbones',
  'exclamation-mark',
  'health-hazard',
  'environment',
];
