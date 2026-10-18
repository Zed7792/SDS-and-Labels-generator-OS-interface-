import React, { useState, useId } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Ruler,
  Check,
  Tag,
  Shield,
  Layers,
  CheckCircle2,
  Clock,
  AlertOctagon,
} from 'lucide-react';
import { Chemical, LabelConfig, CompanySettings, LabelSize, LabelOrientation, LabelDimensionUnit } from '../types';
import { GhsPictogram } from './GhsPictogram';
import { NfpaDiamond } from './NfpaDiamond';
import { HmisBar } from './HmisBar';
import { QrCodeSvg } from './QrCodeSvg';
import { PpeIconBadge, PpeItemId } from './PpeIconBadge';
import { OilservLogo } from './OilservLogo';
import { UNIT_CONVERSIONS } from '../data/defaultTemplates';

export interface LabelPreviewProps {
  chemical?: Partial<Chemical>;
  config?: Partial<LabelConfig>;
  settings?: Partial<CompanySettings>;
  id?: string;
  ratingSystem?: 'nfpa' | 'hmis' | 'both';
  onRatingSystemChange?: (val: 'nfpa' | 'hmis' | 'both') => void;
  selectedPpeItems?: PpeItemId[];
  hideActions?: boolean;
  showDimensionGuides?: boolean;

  // Phase 1 Extensions: Dynamic dimensions, orientation and templates
  templateWidth?: number;
  templateHeight?: number;
  templateUnit?: LabelDimensionUnit;
  templateOrientation?: LabelOrientation;
  templateName?: string;
  templateId?: string;
  showGhs?: boolean;
  showNfpa?: boolean;
  showHmis?: boolean;
  showPpe?: boolean;
  showEmergency?: boolean;
  showQr?: boolean;
  showBatchLot?: boolean;

  // Phase 2: Workflow & Approval Stamp / Watermark
  approvalStatus?: string;
  showApprovalStamp?: boolean;
}

// Physical dimension specifications for each supported label size
export interface DimensionSpec {
  id: LabelSize;
  name: string;
  desc: string;
  inchesWidth: number;
  inchesHeight: number;
  mmWidth: number;
  mmHeight: number;
  aspectRatio: string;
  basePixelWidth: number;
  basePixelHeight: number;
  scaleClass: {
    containerMax: string;
    headerTitle: string;
    subTitle: string;
    signalWord: string;
    metaGrid: string;
    statementText: string;
    ghsSize: number;
    qrSize: number;
    nfpaSize: number;
    hmisWidth: number;
    ppeSize: number;
  };
}

export const DIMENSION_SPECS: Record<LabelSize, DimensionSpec> = {
  '4x6': {
    id: '4x6',
    name: '4" × 6" Drum (Standard)',
    desc: '55-gal Drum, Intermediate Bulk Container (IBC), Tote',
    inchesWidth: 6.0,
    inchesHeight: 4.0,
    mmWidth: 152.4,
    mmHeight: 101.6,
    aspectRatio: '6 / 4',
    basePixelWidth: 960,
    basePixelHeight: 640,
    scaleClass: {
      containerMax: 'max-w-[960px]',
      headerTitle: 'text-2xl sm:text-3xl',
      subTitle: 'text-sm sm:text-base',
      signalWord: 'text-sm sm:text-base px-8 py-1',
      metaGrid: 'text-[11px] sm:text-[12px]',
      statementText: 'text-[11.5px] sm:text-[12px]',
      ghsSize: 58,
      qrSize: 64,
      nfpaSize: 84,
      hmisWidth: 145,
      ppeSize: 34,
    },
  },
  '3x5': {
    id: '3x5',
    name: '3" × 5" Canister',
    desc: 'Carboys, Pails, Secondary Tanks & Storage Jars',
    inchesWidth: 5.0,
    inchesHeight: 3.0,
    mmWidth: 127.0,
    mmHeight: 76.2,
    aspectRatio: '5 / 3',
    basePixelWidth: 840,
    basePixelHeight: 504,
    scaleClass: {
      containerMax: 'max-w-[840px]',
      headerTitle: 'text-xl sm:text-2xl',
      subTitle: 'text-xs sm:text-sm',
      signalWord: 'text-xs sm:text-sm px-6 py-0.5',
      metaGrid: 'text-[10px] sm:text-[11px]',
      statementText: 'text-[10.5px] sm:text-[11px]',
      ghsSize: 48,
      qrSize: 56,
      nfpaSize: 72,
      hmisWidth: 130,
      ppeSize: 30,
    },
  },
  '2x4': {
    id: '2x4',
    name: '2" × 4" Bottle',
    desc: 'Secondary Wash Bottles, Reagent Vials, Spray Dispensers',
    inchesWidth: 4.0,
    inchesHeight: 2.0,
    mmWidth: 101.6,
    mmHeight: 50.8,
    aspectRatio: '4 / 2',
    basePixelWidth: 760,
    basePixelHeight: 380,
    scaleClass: {
      containerMax: 'max-w-[760px]',
      headerTitle: 'text-lg sm:text-xl',
      subTitle: 'text-[11px] sm:text-xs',
      signalWord: 'text-[11px] sm:text-xs px-5 py-0.5',
      metaGrid: 'text-[9.5px] sm:text-[10px]',
      statementText: 'text-[9.5px] sm:text-[10px]',
      ghsSize: 40,
      qrSize: 48,
      nfpaSize: 62,
      hmisWidth: 115,
      ppeSize: 26,
    },
  },
  '8.5x11': {
    id: '8.5x11',
    name: '8.5" × 11" Bay Placard',
    desc: 'Drum Bay Safety Board, Warehouse Storage Wall Placard',
    inchesWidth: 11.0,
    inchesHeight: 8.5,
    mmWidth: 279.4,
    mmHeight: 215.9,
    aspectRatio: '11 / 8.5',
    basePixelWidth: 980,
    basePixelHeight: 757,
    scaleClass: {
      containerMax: 'max-w-[980px]',
      headerTitle: 'text-2xl sm:text-3xl md:text-4xl',
      subTitle: 'text-base sm:text-lg',
      signalWord: 'text-base sm:text-lg px-10 py-1.5',
      metaGrid: 'text-[12px] sm:text-[13px]',
      statementText: 'text-[12.5px] sm:text-[13px]',
      ghsSize: 68,
      qrSize: 76,
      nfpaSize: 96,
      hmisWidth: 165,
      ppeSize: 40,
    },
  },
  letter: {
    id: 'letter',
    name: '8.5" × 11" Bay Placard',
    desc: 'Drum Bay Safety Board, Warehouse Storage Wall Placard',
    inchesWidth: 11.0,
    inchesHeight: 8.5,
    mmWidth: 279.4,
    mmHeight: 215.9,
    aspectRatio: '11 / 8.5',
    basePixelWidth: 980,
    basePixelHeight: 757,
    scaleClass: {
      containerMax: 'max-w-[980px]',
      headerTitle: 'text-2xl sm:text-3xl md:text-4xl',
      subTitle: 'text-base sm:text-lg',
      signalWord: 'text-base sm:text-lg px-10 py-1.5',
      metaGrid: 'text-[12px] sm:text-[13px]',
      statementText: 'text-[12.5px] sm:text-[13px]',
      ghsSize: 68,
      qrSize: 76,
      nfpaSize: 96,
      hmisWidth: 165,
      ppeSize: 40,
    },
  },
};

export const LabelPreview: React.FC<LabelPreviewProps> = ({
  chemical,
  config,
  settings,
  id = 'oilserv-label-preview-canvas',
  ratingSystem: controlledRatingSystem,
  onRatingSystemChange,
  selectedPpeItems,
  hideActions = false,
  showDimensionGuides = false,
  templateWidth,
  templateHeight,
  templateUnit = 'in' as LabelDimensionUnit,
  templateOrientation,
  templateName,
  templateId,
  showGhs: propShowGhs,
  showNfpa: propShowNfpa,
  showHmis: propShowHmis,
  showPpe: propShowPpe,
  showEmergency: propShowEmergency,
  showQr: propShowQr,
  showBatchLot: propShowBatchLot,
  approvalStatus: propApprovalStatus,
  showApprovalStamp = true,
}) => {
  const componentId = useId();
  // State for zoom / display scale
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [showBleedGuides, setShowBleedGuides] = useState<boolean>(showDimensionGuides);
  const [fourPicLayout, setFourPicLayout] = useState<'diamond' | 'grid'>('diamond');

  // Rating system (NFPA 704, HMIS III, or Both)
  const [internalRatingSystem, setInternalRatingSystem] = useState<'nfpa' | 'hmis' | 'both'>('both');
  const activeRatingSystem = controlledRatingSystem || internalRatingSystem;

  const handleRatingChange = (sys: 'nfpa' | 'hmis' | 'both') => {
    if (onRatingSystemChange) {
      onRatingSystemChange(sys);
    } else {
      setInternalRatingSystem(sys);
    }
  };

  // Enforced dimensions spec & dynamic template calculation
  const currentSize: LabelSize = config?.labelSize || '4x6';
  const baseSpec = DIMENSION_SPECS[currentSize] || DIMENSION_SPECS['4x6'];

  const effectiveUnit = (templateUnit || 'in') as LabelDimensionUnit;
  const customWInches = templateWidth
    ? UNIT_CONVERSIONS.convert(templateWidth, effectiveUnit, 'in')
    : baseSpec.inchesWidth;
  const customHInches = templateHeight
    ? UNIT_CONVERSIONS.convert(templateHeight, effectiveUnit, 'in')
    : baseSpec.inchesHeight;

  const isPortrait =
    templateOrientation === 'portrait' ||
    (templateOrientation !== 'landscape' && customWInches < customHInches);

  const finalWInches = customWInches;
  const finalHInches = customHInches;
  const finalWMm = UNIT_CONVERSIONS.convert(finalWInches, 'in', 'mm');
  const finalHMm = UNIT_CONVERSIONS.convert(finalHInches, 'in', 'mm');

  let containerMax = 'max-w-[940px]';
  if (isPortrait) {
    containerMax = 'max-w-[580px]';
  } else if (finalWInches >= 10) {
    containerMax = 'max-w-[1020px]';
  } else if (finalWInches >= 8) {
    containerMax = 'max-w-[960px]';
  } else if (finalWInches <= 4.5) {
    containerMax = 'max-w-[760px]';
  }

  const spec = {
    ...baseSpec,
    name: templateName || `${finalWInches}" × ${finalHInches}" (${isPortrait ? 'Portrait' : 'Landscape'})`,
    inchesWidth: finalWInches,
    inchesHeight: finalHInches,
    mmWidth: finalWMm,
    mmHeight: finalHMm,
    aspectRatio: `${finalWInches} / ${finalHInches}`,
    scaleClass: {
      ...baseSpec.scaleClass,
      containerMax,
    },
  };

  // Visibility flags with template overrides
  const showGhs = propShowGhs !== undefined ? propShowGhs : config?.showGhs !== false;
  const showNfpa = propShowNfpa !== undefined ? propShowNfpa : config?.showNfpa !== false;
  const showHmis = propShowHmis !== undefined ? propShowHmis : config?.showHmis !== false;
  const showPpe = propShowPpe !== undefined ? propShowPpe : config?.showPpe !== false;
  const showEmergency = propShowEmergency !== undefined ? propShowEmergency : config?.showEmergency !== false;
  const showQr = propShowQr !== undefined ? propShowQr : config?.showQr !== false;
  const showBatchLot = propShowBatchLot !== undefined ? propShowBatchLot : config?.showBatchLot !== false;
  const effectiveStatus = (propApprovalStatus || chemical?.status || 'draft').toLowerCase();

  // Values from chemical / config / defaults
  const productName = chemical?.productName || 'PRODUCT NAME';
  const chemicalName = chemical?.chemicalName || '(CHEMICAL NAME)';
  const signalWord = chemical?.signalWord || 'WARNING';
  const isDanger = signalWord === 'DANGER';
  const signalBg = isDanger ? 'bg-red-600' : 'bg-[#f25100]';

  // Batch, dates, CAS, OS Code, Quantity
  const batchNum = chemical?.batchNumber || config?.batchNumber || 'LN2-2024-001';
  const mfgDate = chemical?.manufacturingDate || config?.fillDate || '2024-09-18';
  const expDate = chemical?.expiryDate || config?.expiryDate || '2025-10-23';
  const casNumber = chemical?.casNumber || '7727-37-9';
  const osNumber = chemical?.productCode || chemical?.osCode || 'N002';
  const quantity = chemical?.quantity || config?.containerSize || '30 M3';

  // Statements
  const hStatements = chemical?.hStatements || [];
  const pStatements = chemical?.pStatements || [];
  const pictograms = chemical?.pictograms || [];

  // Ratings
  const nfpa = chemical?.nfpa || { health: 3, flammability: 1, instability: 1, special: 'SA' };
  const hmis = chemical?.hmis || {
    health: nfpa.health || 3,
    isChronic: false,
    flammability: nfpa.flammability || 1,
    physicalHazard: nfpa.instability || 1,
    ppeCode: 'H',
  };

  // PPE items calculation
  const ppeList: PpeItemId[] =
    selectedPpeItems && selectedPpeItems.length > 0
      ? selectedPpeItems
      : [
          'eye',
          'foot',
          'hand',
          'clothing',
          'scba',
        ];

  // Company info
  const companyName = chemical?.manufacturer || settings?.companyName || 'OILSERV ENERGY LTD';
  const facility = chemical?.supplierAddress || 'cal gaz. hassi meseaoud .';
  const emergencyPhone = chemical?.emergency?.emergencyPhone || settings?.emergencyHotline24 || '+234-1-234-5678';
  const displayDate = chemical?.sdsRevisionDate || '16/08/2025';

  // QR Code payload (Standard Industrial SDS Data String)
  const qrData = `OILSERV-GHS|PROD:${productName}|CAS:${casNumber}|BATCH:${batchNum}|OS:${osNumber}|EXP:${expDate}|EMERGENCY:${emergencyPhone}`;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Controls & Dimension Header Bar */}
      {!hideActions && (
        <div className="w-full max-w-[980px] mb-3 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
          {/* Dimension Indicator Pill */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 font-semibold text-slate-800 shadow-2xs">
              <Ruler className="w-3.5 h-3.5 text-slate-500" />
              <span>{spec.inchesWidth}" × {spec.inchesHeight}" ({spec.mmWidth} × {spec.mmHeight} mm)</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium">
              Ratio: <strong className="text-slate-700">{spec.aspectRatio}</strong>
            </span>
          </div>

          {/* Quick Rating Selector & Zoom Bar */}
          <div className="flex items-center gap-3">
            {/* Rating System Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-600 font-medium hidden md:inline">Hazard Rating:</span>
              <div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleRatingChange('nfpa')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-sm transition-colors cursor-pointer ${
                    activeRatingSystem === 'nfpa'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  NFPA
                </button>
                <button
                  type="button"
                  onClick={() => handleRatingChange('hmis')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-sm transition-colors cursor-pointer ${
                    activeRatingSystem === 'hmis'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  HMIS
                </button>
                <button
                  type="button"
                  onClick={() => handleRatingChange('both')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-sm transition-colors cursor-pointer ${
                    activeRatingSystem === 'both'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Both
                </button>
              </div>
            </div>

            {/* Bleed Safety Line Toggle */}
            <button
              type="button"
              onClick={() => setShowBleedGuides(!showBleedGuides)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                showBleedGuides
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle 0.125-inch safe die-cut boundary"
            >
              <Layers className="w-3 h-3" />
              <span>Bleed Guide</span>
            </button>

            {/* Zoom Controls */}
            <div className="inline-flex items-center rounded-md border border-slate-300 bg-white p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(70, prev - 15))}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-700 px-1.5 min-w-[36px] text-center">
                {zoomScale}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(130, prev + 15))}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              {zoomScale !== 100 && (
                <button
                  type="button"
                  onClick={() => setZoomScale(100)}
                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-sm ml-0.5"
                  title="Reset 100%"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Outer Scaled Wrapper */}
      <div
        className="w-full flex justify-center transition-transform duration-150 origin-top overflow-visible"
        style={{
          transform: zoomScale !== 100 ? `scale(${zoomScale / 100})` : undefined,
          marginBottom: zoomScale < 100 ? `-${(100 - zoomScale) * 3}px` : zoomScale > 100 ? `${(zoomScale - 100) * 4}px` : 0,
        }}
      >
        {/* =========================================================================
            EXACT INDUSTRIAL CONTAINER LABEL CANVAS
            Enforcing the OSHA HazCom 1910.1200 / GHS Rev 10 Physical Architecture
            ========================================================================= */}
        <div
          id={id}
          className={`w-full ${spec.scaleClass.containerMax} relative bg-white text-black border-[3.5px] border-black rounded-none shadow-xl overflow-hidden font-sans select-none print:shadow-none print:border-[3px] print:max-w-none print:w-full`}
          style={{
            boxSizing: 'border-box',
          }}
        >
          {/* Optional Die-cut 0.125" Bleed Safe Margin Guide Overlay */}
          {showBleedGuides && (
            <div
              className="absolute inset-[8px] pointer-events-none border border-dashed border-cyan-500/80 z-20 flex flex-col justify-between"
              style={{ margin: 0 }}
            >
              <div className="text-[9px] font-mono font-bold text-cyan-600 bg-cyan-50/90 px-1.5 py-0.5 self-start uppercase tracking-tight">
                0.125" Die-Cut Safe Boundary ({spec.name})
              </div>
            </div>
          )}

          {/* Phase 2: Official Compliance & Approval Workflow Stamp Overlay */}
          {showApprovalStamp && effectiveStatus === 'draft' && (
            <div className="absolute top-2 right-4 z-20 pointer-events-none opacity-50 rotate-[-1.5deg] border-2 border-slate-700 bg-slate-100/90 px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-black tracking-widest text-slate-800 uppercase shadow-2xs">
              DRAFT • PRE-RELEASE SPECIFICATION
            </div>
          )}
          {showApprovalStamp && (effectiveStatus === 'under_review' || effectiveStatus === 'requires_review') && (
            <div className="absolute top-2 right-4 z-20 pointer-events-none opacity-90 rotate-[-1.5deg] border-2 border-amber-600 bg-amber-50/95 px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-black tracking-widest text-amber-900 uppercase shadow-2xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>UNDER REVIEW • PENDING HSE SIGN-OFF</span>
            </div>
          )}
          {showApprovalStamp && effectiveStatus === 'rejected' && (
            <div className="absolute top-2 right-4 z-20 pointer-events-none opacity-95 rotate-[-1.5deg] border-2 border-rose-600 bg-rose-50/95 px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-black tracking-widest text-rose-900 uppercase shadow-2xs flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-700" />
              <span>REVISION REQUESTED • NOT AUTHORIZED</span>
            </div>
          )}
          {showApprovalStamp && effectiveStatus === 'approved' && (
            <div className="absolute top-2 right-4 z-20 pointer-events-none opacity-90 border-2 border-emerald-600 bg-emerald-50/95 px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-emerald-900 uppercase shadow-2xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>OSHA HAZCOM / GHS REV 10 APPROVED</span>
            </div>
          )}

          {/* ================= SECTION 1: HEADER ZONE ================= */}
          <div className="px-5 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: OILSERV Logo */}
            <div className="flex-shrink-0 w-full md:w-1/4 flex items-center justify-start">
              <img
                src="/oilserv-logo.png"
                alt="OILSERV Corporate Logo"
                className="h-10 sm:h-12 md:h-14 w-auto max-w-[210px] object-contain select-none"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallback = (e.target as HTMLElement).nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="hidden w-auto">
                <OilservLogo className="h-10 sm:h-12 md:h-14 w-auto max-w-[210px]" color="#ea580c" />
              </div>
            </div>

            {/* Center: Product Identifier & Warning Signal Word Badge */}
            <div className="flex-1 text-center flex flex-col items-center justify-center">
              <h1 className={`${spec.scaleClass.headerTitle} font-black uppercase text-black tracking-wider leading-tight`}>
                {productName}
              </h1>
              <div className={`${spec.scaleClass.subTitle} font-bold text-black uppercase mt-0.5 tracking-wide`}>
                {chemicalName.startsWith('(') ? chemicalName : `(${chemicalName})`}
              </div>

              {/* Signal Word Banner (Warning / Danger) */}
              <div className="mt-2">
                <div
                  className={`${signalBg} text-white font-black ${spec.scaleClass.signalWord} uppercase tracking-widest rounded-none shadow-2xs`}
                >
                  {signalWord}
                </div>
              </div>
            </div>

            {/* Right: Operational Metadata Grid */}
            {showBatchLot ? (
              <div className={`flex-shrink-0 w-full md:w-auto ${spec.scaleClass.metaGrid} font-medium leading-relaxed`}>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 min-w-[280px]">
                  <div>
                    <span className="font-bold text-black">Batch Number : </span>
                    <span className="font-semibold text-slate-900">{batchNum}</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">Manufacture date: </span>
                    <span className="font-semibold text-slate-900">{mfgDate}</span>
                  </div>

                  <div>
                    <span className="font-bold text-black">CAS Number : </span>
                    <span className="font-semibold text-slate-900">{casNumber}</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">Expiry date : </span>
                    <span className="font-semibold text-slate-900">{expDate}</span>
                  </div>

                  <div>
                    <span className="font-bold text-black">OS Number : </span>
                    <span className="font-semibold text-slate-900">{osNumber}</span>
                  </div>
                  <div>
                    <span className="font-bold text-black">Quantity : </span>
                    <span className="font-semibold text-slate-900">{quantity}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 w-full md:w-auto text-right text-xs text-slate-400 italic">
                Batch/Lot metadata hidden
              </div>
            )}
          </div>

          {/* Top Horizontal Black Dividing Line */}
          <div className="border-b-[2.5px] border-black w-full" />

          {/* ================= SECTION 2: MIDDLE BODY ZONE ================= */}
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[260px] items-start">
            {/* Left Column (cols 3): GHS Pictograms in Red Diamonds */}
            <div className="md:col-span-3 flex flex-col items-center justify-center p-1">
              {showGhs && pictograms && pictograms.length > 0 ? (
                (() => {
                  const activePictograms = pictograms.slice(0, 6);
                  const picCount = activePictograms.length;
                  const baseSize = spec.scaleClass.ghsSize;
                  const diamond4Size = Math.max(30, Math.round(baseSize * 0.82));
                  const rectGhsSize = Math.max(26, Math.round(baseSize * 0.7));
                  const singleSize = Math.max(36, Math.round(baseSize * 1.05));

                  return (
                    <div className="w-full flex flex-col items-center justify-center">
                      {/* 1 Pictogram: Centered */}
                      {picCount === 1 && (
                        <div className="flex items-center justify-center p-2">
                          <GhsPictogram id={activePictograms[0]} size={singleSize} />
                        </div>
                      )}

                      {/* 2 Pictograms: Stacked Vertically */}
                      {picCount === 2 && (
                        <div className="flex flex-col items-center justify-center gap-2.5 p-2">
                          <GhsPictogram id={activePictograms[0]} size={baseSize} />
                          <GhsPictogram id={activePictograms[1]} size={baseSize} />
                        </div>
                      )}

                      {/* 3 Pictograms: Triangle Formation (1 Top, 2 Bottom) */}
                      {picCount === 3 && (
                        <div className="flex flex-col items-center justify-center p-1">
                          <div className="flex justify-center -mb-1 sm:-mb-1.5 z-10">
                            <GhsPictogram id={activePictograms[0]} size={diamond4Size} />
                          </div>
                          <div className="flex justify-center gap-1 sm:gap-1.5 z-20">
                            <GhsPictogram id={activePictograms[1]} size={diamond4Size} />
                            <GhsPictogram id={activePictograms[2]} size={diamond4Size} />
                          </div>
                        </div>
                      )}

                      {/* 4 Pictograms: "Style of Diamonds" layout (1 Top, 2 Middle, 1 Bottom forming a Diamond) */}
                      {picCount === 4 && (
                        <>
                          {fourPicLayout === 'diamond' ? (
                            <div className="flex flex-col items-center justify-center py-1">
                              {/* Top diamond: 1 */}
                              <div className="flex justify-center -mb-1 sm:-mb-1.5 z-10">
                                <GhsPictogram id={activePictograms[0]} size={diamond4Size} />
                              </div>
                              {/* Middle diamonds: 2 side by side */}
                              <div className="flex justify-center gap-1 sm:gap-1.5 z-20">
                                <GhsPictogram id={activePictograms[1]} size={diamond4Size} />
                                <GhsPictogram id={activePictograms[2]} size={diamond4Size} />
                              </div>
                              {/* Bottom diamond: 1 */}
                              <div className="flex justify-center -mt-1 sm:-mt-1.5 z-10">
                                <GhsPictogram id={activePictograms[3]} size={diamond4Size} />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 p-1 items-center justify-center">
                              {activePictograms.map((picId) => (
                                <div key={picId} className="flex items-center justify-center">
                                  <GhsPictogram id={picId} size={diamond4Size} />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 4-Pictogram Layout Toggle (Print-hidden) */}
                          <div className="mt-1.5 print:hidden flex items-center gap-1 bg-slate-100/90 p-0.5 rounded border border-slate-200 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setFourPicLayout('diamond')}
                              className={`px-1.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                                fourPicLayout === 'diamond'
                                  ? 'bg-slate-900 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                              title="Diamond shape formation (1 top, 2 middle, 1 bottom)"
                            >
                              ♦ Diamond Style
                            </button>
                            <button
                              type="button"
                              onClick={() => setFourPicLayout('grid')}
                              className={`px-1.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
                                fourPicLayout === 'grid'
                                  ? 'bg-slate-900 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                              title="2x2 Compact Grid"
                            >
                              ■ 2×2 Grid
                            </button>
                          </div>
                        </>
                      )}

                      {/* 5 or 6 Pictograms: "Vertical Rectangle" layout (2 columns x 3 rows) */}
                      {(picCount === 5 || picCount === 6) && (
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex flex-col items-center justify-center p-2 rounded border-[1.5px] border-black bg-white shadow-2xs">
                            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 items-center justify-center">
                              {activePictograms.map((picId, idx) => (
                                <div
                                  key={picId}
                                  className={`flex items-center justify-center ${
                                    picCount === 5 && idx === 4 ? 'col-span-2' : ''
                                  }`}
                                >
                                  <GhsPictogram id={picId} size={rectGhsSize} />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Indicator badge for vertical rectangle */}
                          <span className="mt-1.5 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded print:hidden">
                            ▮ Vertical Rectangle ({picCount}/6)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="w-full h-full min-h-[140px] flex items-center justify-center border border-dashed border-slate-200 rounded-sm p-4 text-center text-xs text-slate-400 italic">
                  {showGhs ? 'No GHS Pictograms assigned' : 'GHS Pictograms hidden'}
                </div>
              )}
            </div>

            {/* Center Column (cols 6): Hazard & Precautionary Statements */}
            <div className={`md:col-span-6 space-y-3.5 text-left ${spec.scaleClass.statementText} leading-snug`}>
              {/* Hazard Statements */}
              <div>
                <div className="font-black uppercase text-black text-xs sm:text-[13px] tracking-wide mb-1.5">
                  HAZARD STATEMENTS:
                </div>
                {hStatements && hStatements.length > 0 ? (
                  <ul className="space-y-1 pl-1 text-black font-normal">
                    {hStatements.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-black font-bold flex-shrink-0">•</span>
                        <span>
                          <strong className="font-bold text-black">{h.code}: </strong>
                          <span>{h.statement}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-400 italic text-xs pl-2">
                    No hazard statements specified
                  </div>
                )}
              </div>

              {/* Precautionary Statements */}
              <div>
                <div className="font-black uppercase text-black text-xs sm:text-[13px] tracking-wide mb-1.5">
                  PRECAUTIONARY STATEMENTS:
                </div>
                {pStatements && pStatements.length > 0 ? (
                  <ul className="space-y-1 pl-1 text-black font-normal">
                    {pStatements.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-black font-bold flex-shrink-0">•</span>
                        <span>
                          <strong className="font-bold text-black">
                            {p.code ? `${p.code}: ` : ''}
                          </strong>
                          <span>{p.statement}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-400 italic text-xs pl-2">
                    No precautionary statements specified
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (cols 3): NFPA 704 Diamond and/or HMIS III Bar */}
            <div className="md:col-span-3 flex flex-col items-center justify-center gap-3 p-1">
              {/* NFPA Diamond */}
              {showNfpa && (activeRatingSystem === 'nfpa' || activeRatingSystem === 'both') && (
                <div className="flex flex-col items-center">
                  <NfpaDiamond
                    rating={nfpa}
                    size={activeRatingSystem === 'both' ? spec.scaleClass.nfpaSize : spec.scaleClass.nfpaSize + 14}
                  />
                </div>
              )}

              {/* HMIS Bar */}
              {showHmis && (activeRatingSystem === 'hmis' || activeRatingSystem === 'both') && (
                <div className="flex flex-col items-center">
                  <HmisBar
                    rating={hmis}
                    width={activeRatingSystem === 'both' ? spec.scaleClass.hmisWidth : spec.scaleClass.hmisWidth + 20}
                  />
                </div>
              )}

              {!showNfpa && !showHmis && (
                <div className="text-xs text-slate-400 italic text-center p-4">
                  Hazard diamonds hidden in configuration
                </div>
              )}
            </div>
          </div>

          {/* Bottom Horizontal Black Dividing Line */}
          <div className="border-t-[2.5px] border-black w-full" />

          {/* ================= SECTION 3: FOOTER & PPE ZONE ================= */}
          <div className="px-5 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: PPE Section */}
            <div className="flex flex-col items-start gap-1.5 w-full md:w-auto">
              <div className="text-[11px] sm:text-[12px] font-black uppercase text-black tracking-wide">
                PERSONAL PROTECTIVE EQUIPMENT:
              </div>
              {showPpe ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {ppeList && ppeList.length > 0 ? (
                    ppeList.map((ppeId, idx) => (
                      <PpeIconBadge key={idx} id={ppeId} size={spec.scaleClass.ppeSize} />
                    ))
                  ) : (
                    <>
                      <PpeIconBadge placeholder size={spec.scaleClass.ppeSize} />
                      <PpeIconBadge placeholder size={spec.scaleClass.ppeSize} />
                      <PpeIconBadge placeholder size={spec.scaleClass.ppeSize} />
                      <PpeIconBadge placeholder size={spec.scaleClass.ppeSize} />
                      <PpeIconBadge placeholder size={spec.scaleClass.ppeSize} />
                    </>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">PPE indicators hidden</div>
              )}
            </div>

            {/* Right: Direct SDS QR Code & Facility / Emergency Dispatch */}
            <div className="flex items-center justify-end gap-5 w-full md:w-auto">
              {/* Direct SDS QR Code */}
              {showQr && (
                <div className="flex flex-col items-center justify-center flex-shrink-0" title="Direct SDS QR Code">
                  <QrCodeSvg value={qrData} size={spec.scaleClass.qrSize} />
                </div>
              )}

              {/* Facility & Emergency Info */}
              {showEmergency && (
                <div className="text-right text-[11px] sm:text-[12px] leading-tight text-black flex flex-col items-end">
                  <div className="font-black uppercase tracking-wide">{companyName}</div>
                  <div className="text-slate-800 lowercase font-medium">{facility}</div>
                  <div className="text-slate-800 font-medium">
                    Emergency: <span className="font-bold">{emergencyPhone}</span>
                  </div>
                  <div className="text-slate-800 font-medium">
                    Date: <span className="font-bold">{displayDate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelPreview;
