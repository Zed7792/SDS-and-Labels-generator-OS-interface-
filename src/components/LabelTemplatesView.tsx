import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  LayoutTemplate,
  Copy,
  Edit2,
  Archive,
  Eye,
  CheckCircle2,
  Shield,
  Layers,
  Ruler,
  Maximize2,
  X,
  Sparkles,
  ArrowRight,
  Sliders,
  Check,
  AlertCircle,
  Clock,
  RotateCw,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';
import { LabelTemplate, TemplateComponentsConfig, LabelSizePreset, LabelDimensionUnit, LabelOrientation, TemplateType } from '../types';
import { PRESET_DIMENSIONS, UNIT_CONVERSIONS, DEFAULT_COMPONENTS_CONFIG } from '../data/defaultTemplates';
import LabelPreview from './LabelPreview';

export const LabelTemplatesView: React.FC = () => {
  const {
    templates,
    activeTemplateId,
    setActiveTemplateId,
    addTemplate,
    updateTemplate,
    duplicateTemplate,
    archiveTemplate,
    setCurrentView,
    chemicals,
    activeLabelConfig,
    setActiveLabelConfig,
  } = useChemicals();

  // Search, filter & view state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals state
  const [previewTemplate, setPreviewTemplate] = useState<LabelTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [archiveConfirmTemplate, setArchiveConfirmTemplate] = useState<LabelTemplate | null>(null);

  // Form state for creating / editing
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<TemplateType>('custom');
  const [formPreset, setFormPreset] = useState<LabelSizePreset>('6x4');
  const [formWidth, setFormWidth] = useState<number>(6.0);
  const [formHeight, setFormHeight] = useState<number>(4.0);
  const [formUnit, setFormUnit] = useState<LabelDimensionUnit>('in');
  const [formOrientation, setFormOrientation] = useState<LabelOrientation>('landscape');
  const [formComponents, setFormComponents] = useState<TemplateComponentsConfig>({ ...DEFAULT_COMPONENTS_CONFIG });
  const [formError, setFormError] = useState<string | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchesSearch =
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedTypeFilter === 'all' || tpl.type === selectedTypeFilter;
      const matchesStatus = selectedStatusFilter === 'all' || tpl.status === selectedStatusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [templates, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter((t) => t.status === 'active').length;
    const system = templates.filter((t) => t.isSystemTemplate).length;
    const custom = total - system;
    return { total, active, system, custom };
  }, [templates]);

  // Start Create Flow
  const handleStartCreate = () => {
    setFormName('');
    setFormDescription('');
    setFormType('custom');
    setFormPreset('6x4');
    setFormWidth(6.0);
    setFormHeight(4.0);
    setFormUnit('in');
    setFormOrientation('landscape');
    setFormComponents({ ...DEFAULT_COMPONENTS_CONFIG });
    setFormError(null);
    setEditingTemplate(null);
    setIsCreatingNew(true);
  };

  // Start Edit Flow (for custom templates)
  const handleStartEdit = (tpl: LabelTemplate) => {
    setFormName(tpl.name);
    setFormDescription(tpl.description);
    setFormType(tpl.type);
    setFormPreset(tpl.sizePreset);
    setFormWidth(tpl.width);
    setFormHeight(tpl.height);
    setFormUnit(tpl.unit);
    setFormOrientation(tpl.orientation);
    setFormComponents({ ...tpl.components });
    setFormError(null);
    setEditingTemplate(tpl);
    setIsCreatingNew(false);
  };

  // Preset selection handler
  const handlePresetSelect = (preset: LabelSizePreset) => {
    setFormPreset(preset);
    if (preset !== 'custom') {
      const p = PRESET_DIMENSIONS[preset];
      if (p) {
        if (formOrientation === 'landscape') {
          const w = Math.max(p.widthIn, p.heightIn);
          const h = Math.min(p.widthIn, p.heightIn);
          setFormWidth(UNIT_CONVERSIONS.convert(w, 'in', formUnit));
          setFormHeight(UNIT_CONVERSIONS.convert(h, 'in', formUnit));
        } else {
          const w = Math.min(p.widthIn, p.heightIn);
          const h = Math.max(p.widthIn, p.heightIn);
          setFormWidth(UNIT_CONVERSIONS.convert(w, 'in', formUnit));
          setFormHeight(UNIT_CONVERSIONS.convert(h, 'in', formUnit));
        }
      }
    }
  };

  // Orientation toggle handler
  const handleOrientationToggle = (newOrientation: LabelOrientation) => {
    if (newOrientation !== formOrientation) {
      setFormOrientation(newOrientation);
      // Swap width and height automatically
      const currentW = formWidth;
      const currentH = formHeight;
      setFormWidth(currentH);
      setFormHeight(currentW);
    }
  };

  // Save template handler
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Template Name is required.');
      return;
    }
    if (formWidth <= 0 || formHeight <= 0) {
      setFormError('Width and Height must be positive numbers greater than 0.');
      return;
    }

    if (editingTemplate) {
      // Update existing
      updateTemplate(editingTemplate.id, {
        name: formName.trim(),
        description: formDescription.trim(),
        type: formType,
        sizePreset: formPreset,
        width: formWidth,
        height: formHeight,
        unit: formUnit,
        orientation: formOrientation,
        components: formComponents,
      });
      setEditingTemplate(null);
    } else {
      // Create new
      const created = addTemplate({
        name: formName.trim(),
        type: formType,
        description: formDescription.trim(),
        sizePreset: formPreset,
        width: formWidth,
        height: formHeight,
        unit: formUnit,
        orientation: formOrientation,
        isSystemTemplate: false,
        status: 'active',
        version: '1.0',
        createdBy: 'Zineddine (HSE Specialist)',
        components: formComponents,
      });
      setIsCreatingNew(false);
      setActiveTemplateId(created.id);
    }
  };

  // Use Template to Create Label
  const handleUseTemplate = (tpl: LabelTemplate) => {
    setActiveTemplateId(tpl.id);
    // Map preset to size for editor
    let editorSize: any = '4x6';
    if (tpl.sizePreset === '4x3') editorSize = '3x5';
    else if (tpl.sizePreset === '8x6' || tpl.sizePreset === '10x8') editorSize = '8.5x11';

    setActiveLabelConfig((prev) => ({
      ...prev,
      size: editorSize,
      showGhs: tpl.components.ghsPictograms,
      showNfpa: tpl.components.nfpaDiamond,
      showHmis: tpl.components.hmis,
      showPpe: tpl.components.ppe,
      showBatchLot: tpl.components.batchLot,
      showEmergency: tpl.components.emergencyInfo,
      showQr: tpl.components.qrCode,
      ratingSystem: tpl.components.nfpaDiamond && tpl.components.hmis ? 'both' : tpl.components.hmis ? 'hmis' : 'nfpa',
    }));

    setCurrentView('add_chemical');
  };

  const sampleChemical = chemicals[0];

  return (
    <div className="space-y-6 select-none">
      {/* 1. Top Section: Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-orange-50 text-[#f25100] border border-orange-200">
              <LayoutTemplate className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Label Templates Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardized chemical label blueprints, container size presets, and proportional physical architectures.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Badges & Create Button */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500">Templates:</span>
            <strong className="text-slate-900 font-bold">{stats.total}</strong>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-600 font-semibold">{stats.active} Active</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500">System:</span>
            <strong className="text-blue-700 font-bold">{stats.system}</strong>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">{stats.custom} Custom</span>
          </div>

          <button
            type="button"
            onClick={handleStartCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#f25100] hover:bg-[#ea580c] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Template</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates by name, ID, or size..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters & View Switcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="border border-slate-300 rounded-md px-2 py-1 text-xs bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">All Types</option>
              <option value="oilserv_standard">OILSERV Standard</option>
              <option value="standard_ghs">Standard GHS</option>
              <option value="small_container">Small Container</option>
              <option value="drum">Chemical Drum</option>
              <option value="ibc_tank">IBC / Tank</option>
              <option value="secondary_container">Secondary Container</option>
              <option value="waste">Chemical Waste</option>
              <option value="custom">Custom Templates</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="text-xs text-slate-600">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-md px-2 py-1 text-xs bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-slate-400"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="draft">Drafts</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded-sm text-xs transition-colors ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1 rounded-sm text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Structured Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Templates Display: Cards vs Table */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-dashed border-slate-300">
          <LayoutTemplate className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No label templates match your filter criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your search terms or filters, or create a new custom template for your facility.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTypeFilter('all');
              setSelectedStatusFilter('all');
            }}
            className="mt-4 px-3 py-1.5 text-xs font-semibold text-[#f25100] hover:text-[#ea580c] cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => {
            const isDefaultActive = tpl.id === activeTemplateId;
            return (
              <div
                key={tpl.id}
                className={`bg-white rounded-lg border transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                  isDefaultActive ? 'border-orange-400 ring-1 ring-orange-300' : 'border-slate-200'
                } ${tpl.status === 'archived' ? 'opacity-65' : ''}`}
              >
                {/* Card Top: Template Type & Status Header */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {tpl.id}
                      </span>
                      {tpl.isSystemTemplate ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          <Shield className="w-2.5 h-2.5" />
                          System
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          <Sliders className="w-2.5 h-2.5" />
                          Custom
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-semibold text-slate-500">v{tpl.version}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug truncate" title={tpl.name}>
                      {tpl.name}
                    </h3>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {tpl.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Active
                      </span>
                    ) : tpl.status === 'draft' ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Middle: Physical Spec & Description */}
                <div className="p-4 space-y-3 flex-1">
                  {/* Physical Dimension Banner */}
                  <div className="bg-slate-50 p-2.5 rounded-md border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="font-bold text-slate-800">
                        {tpl.width} × {tpl.height} {tpl.unit}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({UNIT_CONVERSIONS.convert(tpl.width, tpl.unit, 'mm')} × {UNIT_CONVERSIONS.convert(tpl.height, tpl.unit, 'mm')} mm)
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 font-semibold uppercase text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      <RotateCw className="w-2.5 h-2.5" />
                      {tpl.orientation}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed" title={tpl.description}>
                    {tpl.description}
                  </p>

                  {/* Component Badges Preview */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Enabled Components:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tpl.components.ghsPictograms && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-semibold border border-red-100">
                          GHS Diamonds
                        </span>
                      )}
                      {tpl.components.nfpaDiamond && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                          NFPA 704
                        </span>
                      )}
                      {tpl.components.hmis && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-semibold border border-cyan-100">
                          HMIS III
                        </span>
                      )}
                      {tpl.components.ppe && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                          PPE Icons
                        </span>
                      )}
                      {tpl.components.qrCode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                          SDS QR
                        </span>
                      )}
                      {tpl.components.batchLot && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-100">
                          Batch/Lot
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Usage metadata */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Used by <strong className="text-slate-800">{tpl.usedCount} labels</strong></span>
                    <span>By: {tpl.createdBy}</span>
                  </div>
                </div>

                {/* Card Bottom: Action Buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(tpl)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded transition-colors"
                      title="Preview Template Layout"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const dup = duplicateTemplate(tpl.id);
                        handleStartEdit(dup);
                      }}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded transition-colors"
                      title="Duplicate & Customize"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {!tpl.isSystemTemplate && tpl.status !== 'archived' && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(tpl)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded transition-colors"
                        title="Edit Custom Template"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {!tpl.isSystemTemplate && tpl.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => setArchiveConfirmTemplate(tpl)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Archive Template"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Primary Call-to-Action */}
                  <button
                    type="button"
                    onClick={() => handleUseTemplate(tpl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Template Name & ID</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Dimensions</th>
                  <th className="px-4 py-3">Orientation</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTemplates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{tpl.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-500 font-semibold">{tpl.id}</span>
                        {tpl.isSystemTemplate && (
                          <span className="text-[10px] text-blue-700 font-semibold">● System Template</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 capitalize font-medium text-slate-800">
                      {tpl.type.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {tpl.width} × {tpl.height} {tpl.unit}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {UNIT_CONVERSIONS.convert(tpl.width, tpl.unit, 'mm')} × {UNIT_CONVERSIONS.convert(tpl.height, tpl.unit, 'mm')} mm
                      </div>
                    </td>
                    <td className="px-4 py-3.5 capitalize font-medium text-slate-700">
                      {tpl.orientation}
                    </td>
                    <td className="px-4 py-3.5">
                      {tpl.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                          {tpl.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-600">
                      v{tpl.version}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {tpl.usedCount} labels
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewTemplate(tpl)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const dup = duplicateTemplate(tpl.id);
                            handleStartEdit(dup);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUseTemplate(tpl)}
                          className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors ml-1 cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: TEMPLATE PREVIEW MODAL ================= */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-orange-100 text-[#f25100]">
                  <Eye className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{previewTemplate.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono font-semibold">{previewTemplate.id}</span>
                    <span>•</span>
                    <span>{previewTemplate.width} × {previewTemplate.height} {previewTemplate.unit}</span>
                    <span>•</span>
                    <span className="capitalize font-semibold">{previewTemplate.orientation}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content: Live Label Canvas with Template configuration applied */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-100 flex flex-col items-center justify-center">
              <div className="max-w-[850px] w-full bg-white p-3 rounded-lg shadow-sm border border-slate-300">
                <LabelPreview
                  chemical={sampleChemical}
                  showGhs={previewTemplate.components.ghsPictograms}
                  showNfpa={previewTemplate.components.nfpaDiamond}
                  showHmis={previewTemplate.components.hmis}
                  showPpe={previewTemplate.components.ppe}
                  showBatchLot={previewTemplate.components.batchLot}
                  showEmergency={previewTemplate.components.emergencyInfo}
                  showQr={previewTemplate.components.qrCode}
                  ratingSystem={
                    previewTemplate.components.nfpaDiamond && previewTemplate.components.hmis
                      ? 'both'
                      : previewTemplate.components.hmis
                      ? 'hmis'
                      : 'nfpa'
                  }
                  templateWidth={previewTemplate.width}
                  templateHeight={previewTemplate.height}
                  templateUnit={previewTemplate.unit}
                  templateOrientation={previewTemplate.orientation}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-200 bg-white flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Rendering preview with sample chemical: <strong className="text-slate-800">{sampleChemical?.productName}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50"
                >
                  Close Preview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-[#f25100] hover:bg-[#ea580c] text-white rounded-md shadow-2xs"
                >
                  Create Label with this Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: TEMPLATE BUILDER / COMPONENT CONFIGURATOR ================= */}
      {(isCreatingNew || editingTemplate) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-lg bg-orange-100 text-[#f25100]">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create Custom Label Template'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure layout geometry, container dimensions, and individual safety components.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingTemplate(null);
                }}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveTemplate} className="overflow-y-auto flex-1 p-6 space-y-6">
              {formError && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: General Information */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  1. Template Identification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-800">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Drilling Fluid Drum Hazard Placard"
                      className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-800">Description / Usage Purpose</label>
                    <textarea
                      rows={2}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Describe target container, department, or regulatory requirements..."
                      className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Template Category</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as TemplateType)}
                      className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-slate-400 bg-white"
                    >
                      <option value="custom">Custom Template</option>
                      <option value="oilserv_standard">OILSERV Standard</option>
                      <option value="standard_ghs">Standard GHS</option>
                      <option value="drum">Chemical Drum</option>
                      <option value="ibc_tank">IBC / Tank</option>
                      <option value="small_container">Small Container</option>
                      <option value="secondary_container">Secondary Container</option>
                      <option value="waste">Chemical Waste</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Size & Physical Dimensions */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  2. Physical Size & Orientation (Proportional Canvas)
                </h4>

                {/* Preset Chips */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Container Size Preset</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(Object.keys(PRESET_DIMENSIONS) as LabelSizePreset[]).map((key) => {
                      const isSelected = formPreset === key;
                      const p = PRESET_DIMENSIONS[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handlePresetSelect(key)}
                          className={`px-2.5 py-2 rounded-md text-left text-xs border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-bold truncate">{p.name}</div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            {p.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Orientation Buttons */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Label Orientation</label>
                  <div className="inline-flex rounded-md border border-slate-300 bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => handleOrientationToggle('landscape')}
                      className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        formOrientation === 'landscape'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="w-4 h-2.5 border border-current inline-block rounded-xs" />
                      Landscape (Horizontal)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOrientationToggle('portrait')}
                      className={`px-4 py-1.5 rounded-sm text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        formOrientation === 'portrait'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="w-2.5 h-4 border border-current inline-block rounded-xs" />
                      Portrait (Vertical)
                    </button>
                  </div>
                </div>

                {/* Dimensions with Unit Selector */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Width ({formUnit})</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={formWidth}
                      onChange={(e) => {
                        setFormWidth(parseFloat(e.target.value) || 0);
                        setFormPreset('custom');
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Height ({formUnit})</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={formHeight}
                      onChange={(e) => {
                        setFormHeight(parseFloat(e.target.value) || 0);
                        setFormPreset('custom');
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Unit of Measure</label>
                    <select
                      value={formUnit}
                      onChange={(e) => {
                        const newUnit = e.target.value as LabelDimensionUnit;
                        const convertedW = UNIT_CONVERSIONS.convert(formWidth, formUnit, newUnit);
                        const convertedH = UNIT_CONVERSIONS.convert(formHeight, formUnit, newUnit);
                        setFormUnit(newUnit);
                        setFormWidth(convertedW);
                        setFormHeight(convertedH);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white font-semibold"
                    >
                      <option value="in">Inches (in)</option>
                      <option value="mm">Millimeters (mm)</option>
                      <option value="cm">Centimeters (cm)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Component Toggles */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
                  3. Component Visibility Configurator
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                  {[
                    { key: 'companyLogo', label: 'OILSERV Corporate Logo' },
                    { key: 'productName', label: 'Product Name / Identifier' },
                    { key: 'chemicalName', label: 'Chemical / Technical Name' },
                    { key: 'signalWord', label: 'Signal Word Banner (Danger/Warning)' },
                    { key: 'ghsPictograms', label: 'GHS Hazard Diamonds' },
                    { key: 'hazardStatements', label: 'Hazard (H) Statements' },
                    { key: 'precautionaryStatements', label: 'Precautionary (P) Statements' },
                    { key: 'ppe', label: 'PPE Protective Equipment Badges' },
                    { key: 'nfpaDiamond', label: 'NFPA 704 Standard Diamond' },
                    { key: 'hmis', label: 'HMIS III Physical Rating Bar' },
                    { key: 'batchLot', label: 'Batch / OS Number & Dates' },
                    { key: 'qrCode', label: 'Direct SDS QR Code Matrix' },
                    { key: 'supplier', label: 'Facility & Manufacturer Address' },
                    { key: 'emergencyPhone', label: '24/7 Emergency Dispatch Phone' },
                    { key: 'controlledFooter', label: 'Regulatory Compliance Footer' },
                  ].map((comp) => {
                    const isChecked = formComponents[comp.key as keyof TemplateComponentsConfig];
                    return (
                      <label
                        key={comp.key}
                        className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-slate-50 border-slate-300 text-slate-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setFormComponents((prev) => ({
                              ...prev,
                              [comp.key]: e.target.checked,
                            }))
                          }
                          className="rounded border-slate-300 text-[#f25100] focus:ring-[#f25100]"
                        />
                        <span className="truncate">{comp.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-[#f25100] hover:bg-[#ea580c] text-white rounded-md shadow-2xs transition-colors cursor-pointer"
                >
                  {editingTemplate ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ARCHIVE CONFIRMATION MODAL ================= */}
      {archiveConfirmTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-red-600">
              <span className="p-2 rounded-full bg-red-50 border border-red-200">
                <Archive className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">Archive Template?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to archive <strong>{archiveConfirmTemplate.name}</strong> ({archiveConfirmTemplate.id})?
              This template will no longer appear in the active template selector for new labels. Existing printed and saved labels will remain completely unchanged.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setArchiveConfirmTemplate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  archiveTemplate(archiveConfirmTemplate.id);
                  setArchiveConfirmTemplate(null);
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md shadow-2xs"
              >
                Archive Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabelTemplatesView;
