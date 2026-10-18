import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  AlertTriangle,
  Plus,
  Trash2,
  Send,
  Search,
  CheckCircle2,
  ShieldAlert,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useChemicals } from '../context/ChemicalContext';
import { GhsPictogram } from './GhsPictogram';
import { GhsPictogramId, GhsSignalWord } from '../types';

interface ComponentRow {
  id: string;
  substanceId: string;
  substanceName: string;
  casNumber: string;
  concentration: string; // string for input control
}

export const CreateMixtureView: React.FC = () => {
  const { chemicals, addChemical, submitForApproval, setCurrentView, setSelectedChemicalId, currentUser } = useChemicals();

  // Form Fields
  const [mixtureName, setMixtureName] = useState('');
  const [casNumber, setCasNumber] = useState('');
  const [oilservCode, setOilservCode] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('OILSERV Energy Ltd');
  const [supplierAddress, setSupplierAddress] = useState('Plot 10, Trans Amadi Industrial Layout, Port Harcourt');
  const [emergencyPhone, setEmergencyPhone] = useState('+234-1-234-5678 / CHEMTREC +1-800-424-9300');

  // Mixture Components (initially 2 empty rows matching Image 2)
  const [components, setComponents] = useState<ComponentRow[]>([
    {
      id: 'comp-1',
      substanceId: '',
      substanceName: '',
      casNumber: '',
      concentration: '',
    },
    {
      id: 'comp-2',
      substanceId: '',
      substanceName: '',
      casNumber: '',
      concentration: '',
    },
  ]);

  // Validation / Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Calculate Total Concentration
  const totalConcentration = useMemo(() => {
    return components.reduce((sum, item) => {
      const val = parseFloat(item.concentration);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [components]);

  // Calculate Combined Hazards from selected database substances
  const combinedHazards = useMemo(() => {
    const selectedChems = components
      .map((c) => chemicals.find((chem) => chem.id === c.substanceId))
      .filter(Boolean);

    if (selectedChems.length === 0) {
      return null;
    }

    // Combine Pictograms (unique)
    const pictogramsSet = new Set<GhsPictogramId>();
    selectedChems.forEach((c) => {
      c?.pictograms?.forEach((p) => pictogramsSet.add(p));
    });

    // Combine Hazard Classes
    const hazardClassesSet = new Set<string>();
    selectedChems.forEach((c) => {
      c?.hazardClasses?.forEach((hc) => hazardClassesSet.add(hc));
    });

    // Determine Signal Word (DANGER takes precedence)
    let signalWord: GhsSignalWord = 'WARNING';
    if (selectedChems.some((c) => c?.signalWord === 'DANGER')) {
      signalWord = 'DANGER';
    }

    // Combine H Statements
    const hStatements = selectedChems.flatMap((c) => c?.hStatements || []);
    const uniqueH = Array.from(new Map(hStatements.map((h) => [h.code, h])).values());

    return {
      pictograms: Array.from(pictogramsSet),
      hazardClasses: Array.from(hazardClassesSet),
      signalWord,
      hStatements: uniqueH,
    };
  }, [components, chemicals]);

  const handleAddSubstance = () => {
    setComponents((prev) => [
      ...prev,
      {
        id: `comp-${Date.now()}`,
        substanceId: '',
        substanceName: '',
        casNumber: '',
        concentration: '',
      },
    ]);
  };

  const handleRemoveSubstance = (id: string) => {
    if (components.length <= 1) return;
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSelectSubstance = (rowId: string, chemicalId: string) => {
    const selected = chemicals.find((c) => c.id === chemicalId);
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === rowId) {
          return {
            ...c,
            substanceId: chemicalId,
            substanceName: selected ? selected.productName : '',
            casNumber: selected ? selected.casNumber : '',
          };
        }
        return c;
      })
    );
  };

  const handleConcentrationChange = (rowId: string, val: string) => {
    // Only allow numbers and decimal point
    if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === rowId) {
          return { ...c, concentration: val };
        }
        return c;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!mixtureName.trim()) {
      setErrorMessage('Please enter a mixture name.');
      return;
    }

    const filledComponents = components.filter((c) => c.substanceName.trim() !== '');
    if (filledComponents.length < 2) {
      setErrorMessage('Please select at least 2 substances for the mixture.');
      return;
    }

    // Auto-generate mixture record
    const pictograms = combinedHazards?.pictograms.length
      ? combinedHazards.pictograms
      : (['flame', 'exclamation-mark'] as GhsPictogramId[]);
    const signalWord = combinedHazards?.signalWord || 'WARNING';

    const newChemical = addChemical({
      productName: mixtureName.trim(),
      manufacturer: supplier.trim() || 'OILSERV Energy Ltd',
      productCode: oilservCode.trim() || `OS-MIX-${Math.floor(100 + Math.random() * 900)}`,
      casNumber: casNumber.trim() || 'Mixture',
      physicalState: 'Liquid',
      sdsRevisionDate: new Date().toISOString().split('T')[0],
      status: 'under_review',
      lastReviewedDate: new Date().toISOString().split('T')[0],
      lastReviewedBy: currentUser.name,
      signalWord,
      pictograms,
      hazardClasses: combinedHazards?.hazardClasses.length ? combinedHazards.hazardClasses : ['Flammable Liquid Cat. 2'],
      hStatements: combinedHazards?.hStatements || [],
      pStatements: [],
      nfpa: { health: 2, flammability: 2, instability: 0, special: '' },
      hmis: { health: 2, flammability: 2, physicalHazard: 0, ppeCode: 'H' },
      ppe: {
        eye: 'Chemical Splash Goggles',
        hand: 'Nitrile / Neoprene Gloves',
        respiratory: 'Half-mask Organic Vapor Respirator',
        body: 'Chemical-Resistant Apron',
        foot: 'Steel-toe Rubber Boots',
      },
      emergency: {
        firstAidInhalation: 'Move victim to fresh air. Provide oxygen if breathing is labored.',
        firstAidSkin: 'Flush with copious water for at least 15 minutes. Remove contaminated garments.',
        firstAidEye: 'Rinse cautiously with water for several minutes. Seek immediate ophthalmology consultation.',
        firstAidIngestion: 'Do NOT induce vomiting. Rinse mouth thoroughly with water and seek medical attention.',
        fireResponse: 'Use dry chemical, CO2, water spray or alcohol-resistant foam.',
        spillResponse: 'Absorb with inert material (vermiculite, dry sand) and transfer to dedicated hazardous container.',
        storageHandling: 'Store in cool, well-ventilated secondary containment area away from ignition sources.',
        emergencyContact: 'OILSERV Emergency Operations Center (EOC)',
        emergencyPhone: emergencyPhone || '+234-1-234-5678',
      },
      notes: `Mixture composed of: ${filledComponents.map((c) => `${c.substanceName} (${c.concentration || 0}%)`).join(', ')}. Intended use: ${intendedUse || 'Industrial operations'}.`,
    });

    // Initiate approval workflow
    submitForApproval(
      newChemical.id,
      `Submitted newly formulated chemical mixture "${mixtureName}" for corporate HSE review and field release authorization.`,
      currentUser
    );

    setSelectedChemicalId(newChemical.id);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-4 sm:py-6 px-2 space-y-6">
      {/* Error alert if validation fails */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Notification Modal */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Mixture Submitted!</h3>
            <p className="text-sm text-slate-600 mb-6">
              <strong>{mixtureName}</strong> has been created and submitted to the 5-step approval workflow. Its initial status is marked as <strong>Under Review</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setCurrentView('workflow_submission')}
                className="px-5 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Go to Approval Review →
              </button>
              <button
                onClick={() => setCurrentView('library')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                View in Labels Library
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. MIXTURE INFORMATION CARD */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="text-base font-bold text-[#7c3aed] tracking-tight">
              Mixture Information
            </h2>
          </div>

          <div className="space-y-4">
            {/* Row 1: Mixture Name & CAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mixture Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mixtureName}
                  onChange={(e) => setMixtureName(e.target.value)}
                  placeholder="Enter mixture name"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mixture CAS Number (if applicable)
                </label>
                <input
                  type="text"
                  value={casNumber}
                  onChange={(e) => setCasNumber(e.target.value)}
                  placeholder="e.g., 12345-67-8"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Row 2: Oilserv Code & Intended Use */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Oilserv Code
                </label>
                <input
                  type="text"
                  value={oilservCode}
                  onChange={(e) => setOilservCode(e.target.value)}
                  placeholder="Enter Oilserv code"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Intended Use
                </label>
                <input
                  type="text"
                  value={intendedUse}
                  onChange={(e) => setIntendedUse(e.target.value)}
                  placeholder="e.g., Industrial cleaning, drilling fluid"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Enter mixture description"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Row 4: Supplier, Address, Phone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Supplier
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="Enter supplier name"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Supplier Address
                </label>
                <input
                  type="text"
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  placeholder="Enter supplier address"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Emergency Phone
                </label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g., +1-800-XXX-XXXX"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. MIXTURE COMPONENTS CARD */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-[#7c3aed] tracking-tight">
                Mixture Components
              </h2>
            </div>

            <button
              type="button"
              onClick={handleAddSubstance}
              className="px-3.5 py-1.5 bg-[#7c3aed] hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Substance</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-5">
            Select at least 2 substances from the chemical database and set their concentrations.
          </p>

          {/* Component Rows List */}
          <div className="space-y-3">
            {components.map((comp, idx) => (
              <div
                key={comp.id}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-white border border-dashed border-slate-300 rounded-xl hover:border-purple-300 transition-colors"
              >
                {/* Index badge */}
                <div className="flex items-center justify-between sm:justify-start">
                  <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 font-bold text-xs">
                    #{idx + 1}
                  </span>
                  <div className="sm:hidden">
                    <button
                      type="button"
                      onClick={() => handleRemoveSubstance(comp.id)}
                      disabled={components.length <= 2}
                      className="p-1 text-rose-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                      title="Remove component"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Substance Selector Dropdown / Search */}
                <div className="flex-1 relative">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={comp.substanceId}
                      onChange={(e) => handleSelectSubstance(comp.id, e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="">Select substance from database...</option>
                      {chemicals.map((chem) => (
                        <option key={chem.id} value={chem.id}>
                          {chem.productName} ({chem.casNumber}) - {chem.signalWord}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Concentration Input */}
                <div className="w-full sm:w-36 flex items-center gap-1.5">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={comp.concentration}
                      onChange={(e) => handleConcentrationChange(comp.id, e.target.value)}
                      placeholder="0.0"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-right font-mono font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      %
                    </span>
                  </div>
                </div>

                {/* Desktop Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveSubstance(comp.id)}
                  disabled={components.length <= 2}
                  className="hidden sm:flex p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                  title="Remove component"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Yellow/Amber Banner: Total Concentration */}
          <div className="mt-5 p-3.5 rounded-lg bg-[#fefce8] border border-[#fef08a] flex items-center justify-between text-amber-900">
            <span className="font-bold text-sm">Total Concentration:</span>
            <span
              className={`font-bold text-sm ${
                totalConcentration === 100
                  ? 'text-emerald-700'
                  : totalConcentration > 100
                  ? 'text-rose-600'
                  : 'text-amber-800'
              }`}
            >
              {totalConcentration.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* 3. COMBINED HAZARD CLASSIFICATION (AUTO-CALCULATED) CARD */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-6">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-[#7c3aed] tracking-tight">
              Combined Hazard Classification (Auto-Calculated)
            </h2>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Based on the hazard classes of all component substances.
          </p>

          {!combinedHazards ? (
            <p className="text-xs sm:text-sm text-slate-500 italic py-2">
              No hazard classes calculated yet. Add substances with concentrations to see combined hazards.
            </p>
          ) : (
            <div className="space-y-4 pt-1 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center gap-3">
                {/* Signal Word */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Calculated Signal Word:</span>
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-0.5 rounded shadow-2xs ${
                      combinedHazards.signalWord === 'DANGER'
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {combinedHazards.signalWord}
                  </span>
                </div>

                <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                {/* Pictograms */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Applicable Pictograms:</span>
                  <div className="flex items-center gap-1.5">
                    {combinedHazards.pictograms.map((p) => (
                      <GhsPictogram key={p} id={p} size={28} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Hazard Classes */}
              {combinedHazards.hazardClasses.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Combined Hazard Categories:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {combinedHazards.hazardClasses.map((hc, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200"
                      >
                        {hc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. BOTTOM ACTION BAR */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setCurrentView('create_hub')}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white font-semibold text-xs sm:text-sm rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Submit for Approval</span>
          </button>
        </div>
      </form>
    </div>
  );
};
