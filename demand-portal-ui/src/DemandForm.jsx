import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  DOMAINS, SERVICES, PROJECT_GROUPS, PROJECT_NAMES, DEMAND_TYPES,
  ROLES_LIST, STREAMS, PRIORITIES, PROBABILITIES, BILL_RATES,
  REPLACEMENT_REASONS, NEW_PROJECT_GROUPS, DELIVERY_PARTNERS, CLIENT_PARTNERS
} from './constants';

// Sanitization utilities
const sanitizeProjectLabel = (str) => {
  if (!str) return '';
  return str.replace(/^\d+[\.\-\s]+/, '').trim();
};

const formatRoleName = (str) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').trim();
};

function SearchableSelect({
  label, value, onChange, options = [], placeholder = 'Select option...',
  searchPlaceholder = '🔍 Search...', required = false, error = false, disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const cleanedOptions = useMemo(() => {
    const unique = Array.from(new Set(options.map(sanitizeProjectLabel)));
    return unique.filter(Boolean);
  }, [options]);

  const filteredOptions = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return cleanedOptions;
    return cleanedOptions.filter(opt => opt.toLowerCase().includes(query));
  }, [cleanedOptions, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
    else setSearchTerm('');
  }, [isOpen]);

  const cleanValue = sanitizeProjectLabel(value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5 tracking-wide">
        {label} {required && <span className="text-[#E01A8A] font-bold">*</span>}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-left flex items-center justify-between transition-all shadow-sm ${
          disabled ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : error ? 'border-[#E01A8A] ring-1 ring-[#E01A8A]'
            : isOpen ? 'border-[#00F0FF] ring-2 ring-[#00F0FF]/20 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
            : 'border-[#1E293B]/30 hover:border-[#00F0FF] text-[#0F172A]'
        }`}
      >
        <span className={cleanValue ? 'font-medium text-[#0F172A] truncate' : 'text-slate-400'}>
          {cleanValue || placeholder}
        </span>
        <span className={`ml-2 text-slate-400 transition-transform duration-200 text-[10px] ${isOpen ? 'rotate-180 text-[#00F0FF]' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-[#1E293B]/20 rounded-xl shadow-[0_10px_25px_-5px_rgba(15,23,42,0.12)] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-100 bg-[#F8FAFC]">
            <input
              ref={inputRef} type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-white border border-slate-200 text-[#0F172A] placeholder:text-slate-400 text-xs rounded-lg px-3 py-2 outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]"
            />
          </div>
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">No matching items found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = cleanValue === opt;
                return (
                  <button
                    key={opt} type="button"
                    onClick={() => { onChange(opt); setIsOpen(false); }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-[#00F0FF]/15 text-[#0F172A] font-bold border-l-4 border-[#00F0FF]' : 'text-slate-900 hover:bg-[#00F0FF]/10'
                    }`}
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected && <span className="text-[#00F0FF] font-bold text-xs">✓</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemandForm({ currentUser, onSubmitted }) {
  const [currentSection, setCurrentSection] = useState(1);
  const [historyStack, setHistoryStack] = useState([1]);
  const [submitting, setSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState(false);

  const [activeDemandTab, setActiveDemandTab] = useState(1);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    requestorEmail: currentUser?.email || 'Sample@tigeranalytics.com',
    domain: '',
    otherDomain: '',
    serviceRequired: '',

    // Stage 1: Dossier
    newProjectGroup: '', newProjectName: '', projectDescription: '',
    customer: 'PEPSICO', currency: '$', deliveryPartner: '', clientPartner: '',
    techPartner: '', engineeringPartner: '', programType: 'Managed Program',
    billingType: 'Fixed Price', projectTenure: 'Mid Term (up to 6 months)', sowApplicability: 'New SOW',

    // Stage 2: Demand Context
    projectGroup: '', projectName: '',
    clientRequestorName: currentUser?.name || 'Karthikeyan Jayaprakash',
    demandType: 'New',

    // Multi-Position & Single Role Config
    multiplePositionsRequired: 'No',
    selectedRoles: [], customRole: '', stream: '',
    primarySkills: '', secondarySkills: '', jobDescriptionName: '',
    
    // Fix #2: All breakdown counters start inactive with count 0
    headcountBreakdown: {
      'A1': { active: false, count: 0 },
      'A2': { active: false, count: 0 },
      'L1': { active: false, count: 0 },
      'L2': { active: false, count: 0 },
      'M1': { active: false, count: 0 },
      'M2': { active: false, count: 0 },
      'AD+': { active: false, count: 0 }
    },
    
    // Fix #3: Multi-Position Matrix initialized completely empty
    matrixPositions: [],

    // Timelines & Commercials
    customerRequestedDate: '', customerExpectedFulfillmentDate: '',
    demandStartDate: '', demandEndDate: '', billingStartDate: '',
    priority: 'P1', probability: '100%', billRate: '32', otherBillRate: '',
    clientInterview: 'Yes', isSowActive: 'Yes', contractorAllowed: 'No',

    // Conditional Fields
    investmentBusinessCase: '', investmentFromDate: '', investmentToDate: '',
    replacementName: '', replacementEmpId: '', resourceIdentified: '',
    replacementReason: '', additionalComments: ''
  });

  const handleChange = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  // Matrix Row Modifiers (Sub Stream and Track removed per Fix #3)
  const handleAddMatrixRow = () => {
    setFormData(prev => ({
      ...prev,
      matrixPositions: [
        ...prev.matrixPositions,
        {
          id: Date.now().toString(),
          stream: '', level: 'L1', noPos: 1,
          primarySkills: '', secondarySkills: '', sow: 'Yes', forecast: 'Not Forecasted'
        }
      ]
    }));
  };

  const handleUpdateMatrixRow = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      matrixPositions: prev.matrixPositions.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    }));
  };

  const handleDeleteMatrixRow = (id) => {
    setFormData(prev => ({
      ...prev,
      matrixPositions: prev.matrixPositions.filter(row => row.id !== id)
    }));
  };

  // CSV Importer for Multi-Position Matrix (Without Sub Stream and Track)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length <= 1) return;

      const parsedRows = lines.slice(1).map((line, idx) => {
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        return {
          id: `${Date.now()}_${idx}`,
          stream: parts[0] || 'Quality Engineering',
          level: parts[1] || 'L1',
          noPos: parseInt(parts[2]) || 1,
          primarySkills: parts[3] || 'React, Python',
          secondarySkills: parts[4] || '',
          sow: parts[5] || 'Yes',
          forecast: parts[6] || 'Not Forecasted'
        };
      });

      setFormData(prev => ({
        ...prev,
        matrixPositions: [...prev.matrixPositions, ...parsedRows]
      }));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Fix #2: Headcount activation toggle
  const handleToggleLevel = (level) => {
    setFormData(prev => {
      const current = prev.headcountBreakdown[level];
      const nextActive = !current.active;
      return {
        ...prev,
        headcountBreakdown: {
          ...prev.headcountBreakdown,
          [level]: {
            active: nextActive,
            count: nextActive ? (current.count > 0 ? current.count : 1) : 0
          }
        }
      };
    });
  };

  const handleUpdateLevelCount = (level, count) => {
    const parsed = Math.max(1, parseInt(count) || 1);
    setFormData(prev => ({
      ...prev,
      headcountBreakdown: {
        ...prev.headcountBreakdown,
        [level]: { ...prev.headcountBreakdown[level], count: parsed }
      }
    }));
  };

  // Computed Summaries
  const totalSingleHeadcount = useMemo(() => {
    return Object.values(formData.headcountBreakdown).reduce((acc, curr) => acc + (curr.active ? curr.count : 0), 0);
  }, [formData.headcountBreakdown]);

  const activeLevelSummary = useMemo(() => {
    return Object.entries(formData.headcountBreakdown)
      .filter(([_, data]) => data.active)
      .map(([lvl, data]) => `${lvl}-${data.count}`)
      .join(', ');
  }, [formData.headcountBreakdown]);

  const totalMatrixHeadcount = useMemo(() => {
    return formData.matrixPositions.reduce((acc, curr) => acc + (parseInt(curr.noPos) || 0), 0);
  }, [formData.matrixPositions]);

  const matrixSummaryText = useMemo(() => {
    if (formData.matrixPositions.length === 0) return 'No positions configured yet.';
    return formData.matrixPositions
      .map(r => `${r.stream || 'Role'} (${r.level || 'L1'} x ${r.noPos || 1})`)
      .slice(0, 3)
      .join(', ') + (formData.matrixPositions.length > 3 ? '...' : '');
  }, [formData.matrixPositions]);

  // Master Lists (Fix #2: Underscore removal in roles)
  const masterProjectGroups = useMemo(() => (PROJECT_GROUPS || []).map(sanitizeProjectLabel), []);
  const masterProjectNames = useMemo(() => (PROJECT_NAMES || []).map(sanitizeProjectLabel), []);
  
  const masterRolesList = useMemo(() => {
    const raw = (ROLES_LIST && ROLES_LIST.length > 0) ? ROLES_LIST : [
      'Data Engineer', 'Lead Data Scientist', 'Senior Data Scientist', 'Data Scientist',
      'UI/UX Engineer', 'Frontend Engineer (React)', 'Backend Engineer (Python/FastAPI)',
      'Full Stack Engineer', 'Cloud Solutions Architect', 'DevOps / MLOps Engineer',
      'Data Architect', 'Big Data Developer', 'Azure BDE Specialist', 'Snowflake Developer',
      'Databricks Specialist', 'PowerBI Developer', 'Tableau Specialist', 'QA Automation Engineer',
      'Business Analyst', 'Delivery Manager', 'Scrum Master', 'Product Owner', 'Other'
    ];
    return Array.from(new Set(raw.map(formatRoleName)));
  }, []);

  const masterStreamsList = useMemo(() => STREAMS || [
    'Engineering - AWS BDE', 'Engineering - Azure BDE', 'Quality Engineering', 'IPE',
    'AIML', 'Consulting', 'Data Engineering', 'Cloud & DevOps'
  ], []);

  const filteredRoles = useMemo(() => {
    return masterRolesList.filter(r => r.toLowerCase().includes(roleSearchTerm.toLowerCase()));
  }, [masterRolesList, roleSearchTerm]);

  const handleToggleRole = (role) => {
    const clean = formatRoleName(role);
    setFormData(prev => {
      const updated = prev.selectedRoles.includes(clean)
        ? prev.selectedRoles.filter(r => r !== clean)
        : [...prev.selectedRoles, clean];
      return { ...prev, selectedRoles: updated };
    });
  };

  // Fix #1: Tab 1 validation rule
  const isTab1Valid = useMemo(() => {
    if (currentSection === 'pipeline_demand') {
      return Boolean(formData.clientRequestorName.trim() && formData.demandType);
    }
    return Boolean(
      formData.projectGroup &&
      formData.projectName &&
      formData.clientRequestorName.trim() &&
      formData.demandType
    );
  }, [formData.projectGroup, formData.projectName, formData.clientRequestorName, formData.demandType, currentSection]);

  const isSection1Valid = () => Boolean(formData.domain && formData.serviceRequired && (formData.domain !== 'Other' || formData.otherDomain.trim()));
  const isDossierValid = () => Boolean(formData.newProjectGroup && formData.newProjectName.trim() && formData.customer && formData.currency && formData.deliveryPartner && formData.clientPartner && formData.techPartner.trim() && formData.engineeringPartner.trim() && formData.programType && formData.billingType && formData.projectTenure && formData.sowApplicability);

  const isInvestmentDemand = formData.demandType.includes('Investment');
  const isReplacementDemand = formData.demandType.includes('Replacement');
  const isConditionalRequired = isInvestmentDemand || isReplacementDemand;

  const isDemandValid = () => {
    if (!formData.projectGroup || !formData.projectName || !formData.clientRequestorName.trim() || !formData.demandType) return false;
    if (!formData.clientInterview || !formData.isSowActive || !formData.contractorAllowed) return false;
    if (isInvestmentDemand && !formData.investmentBusinessCase.trim()) return false;
    if (isReplacementDemand && (!formData.replacementName.trim() || !formData.replacementEmpId.trim())) return false;

    if (formData.multiplePositionsRequired === 'No') {
      if (formData.selectedRoles.length === 0 || totalSingleHeadcount <= 0 || !formData.primarySkills.trim()) return false;
    } else {
      if (formData.matrixPositions.length === 0) return false;
      const invalid = formData.matrixPositions.some(r => !r.stream || !r.level || r.noPos <= 0 || !r.primarySkills.trim());
      if (invalid) return false;
    }
    return true;
  };

  const getDemandValidationMessage = () => {
    if (!formData.projectGroup || !formData.projectName) return 'Please select Project Group and Project Name.';
    if (!formData.clientRequestorName.trim()) return 'Please enter Client Requestor Name.';
    if (!formData.demandType) return 'Please choose a Demand Type.';

    if (formData.multiplePositionsRequired === 'No') {
      if (formData.selectedRoles.length === 0) return 'Please select at least one Role.';
      if (totalSingleHeadcount <= 0) return 'Please select at least one level and specify headcount.';
      if (!formData.primarySkills.trim()) return 'Please enter Primary Skills.';
    } else {
      if (formData.matrixPositions.length === 0) return 'Please configure at least one position in the matrix.';
      if (formData.matrixPositions.some(r => !r.stream || !r.level || r.noPos <= 0 || !r.primarySkills.trim())) {
        return 'Multi-Position Matrix: Please fill Stream, Level, Count, and Primary Skills for all rows.';
      }
    }

    if (!formData.clientInterview || !formData.isSowActive || !formData.contractorAllowed) return 'Please complete compliance checks.';
    if (isInvestmentDemand && !formData.investmentBusinessCase.trim()) return 'Conditional Details Required: Enter Investment Business Case.';
    if (isReplacementDemand && (!formData.replacementName.trim() || !formData.replacementEmpId.trim())) return 'Conditional Details Required: Specify Replacement Resource Name and Employee ID.';
    return '';
  };

  const handleNext = () => {
    if (currentSection === 1) {
      if (!isSection1Valid()) { setTouchedFields(true); return; }
      setTouchedFields(false);
      let nextStep = formData.serviceRequired === 'Dossier Project Creation' ? 5 : formData.serviceRequired === 'Demand Creation' ? 2 : 'pipeline_dossier';
      setHistoryStack(prev => [...prev, nextStep]);
      setCurrentSection(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContinueToDemand = () => {
    if (!isDossierValid()) { setTouchedFields(true); return; }
    setTouchedFields(false);
    setFormData(prev => ({ ...prev, projectGroup: prev.newProjectGroup, projectName: prev.newProjectName }));
    setHistoryStack(prev => [...prev, 'pipeline_demand']);
    setCurrentSection('pipeline_demand');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (historyStack.length > 1) {
      const updated = [...historyStack];
      updated.pop();
      setHistoryStack(updated);
      setCurrentSection(updated[updated.length - 1]);
      setTouchedFields(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fix #4: Step back sequentially through tabs before leaving demand creation
  const handleDemandBack = () => {
    if (activeDemandTab > 1) {
      setActiveDemandTab(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleBack();
    }
  };

  const handleSubmit = async () => {
    const isBothFlow = currentSection === 'pipeline_demand';
    if ((isBothFlow || currentSection === 2) && !isDemandValid()) { setTouchedFields(true); return; }
    if (currentSection === 5 && !isDossierValid()) { setTouchedFields(true); return; }

    setSubmitting(true);

    const finalPayload = {
      ...formData,
      numPositions: formData.multiplePositionsRequired === 'Yes'
        ? totalMatrixHeadcount
        : totalSingleHeadcount,
      moreThanOneDemand: formData.multiplePositionsRequired === 'Yes'
        ? matrixSummaryText
        : activeLevelSummary,
      levelCounts: formData.multiplePositionsRequired === 'No'
        ? Object.entries(formData.headcountBreakdown).reduce((acc, [lvl, d]) => ({ ...acc, [lvl]: d.active ? d.count : 0 }), {})
        : {},
      matrixPositions: formData.multiplePositionsRequired === 'Yes'
        ? formData.matrixPositions
        : []
    };

    try {
      const res = await fetch('/api/v1/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload)
      });
      const result = await res.json();
      const generatedId = result.requirement_id || `REQ-2026-0${Math.floor(140 + Math.random() * 850)}`;
      onSubmitted(generatedId);
    } catch (err) {
      alert('Error submitting request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isBothWorkflow = currentSection === 'pipeline_dossier' || currentSection === 'pipeline_demand';
  const validationAlertMsg = getDemandValidationMessage();

  return (
    <div className="max-w-5xl mx-auto my-6 font-sans text-slate-900">
      
      {/* Hidden CSV File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* Stepper Header for Both Service */}
      {isBothWorkflow && (
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-soft-depth">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">✓</span>
              <div>
                <div className="text-xs font-bold text-[#0F172A] tracking-wide">Step 1: Service Type</div>
                <div className="text-xs text-emerald-600 font-medium">Selected: Both</div>
              </div>
            </div>
            <div className="hidden md:block h-0.5 w-12 bg-emerald-500" />
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentSection === 'pipeline_dossier' ? 'bg-[#E01A8A] text-white shadow-[0_0_15px_rgba(224,26,138,0.5)]' : 'bg-emerald-500 text-white'
              }`}>
                {currentSection === 'pipeline_demand' ? '✓' : '2'}
              </span>
              <div>
                <div className="text-xs font-bold text-[#0F172A] tracking-wide">Step 2: Dossier Creation</div>
                <div className="text-xs text-slate-500">13 Required Fields</div>
              </div>
            </div>
            <div className={`hidden md:block h-0.5 w-12 ${currentSection === 'pipeline_demand' ? 'bg-[#00F0FF]' : 'bg-slate-200'}`} />
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentSection === 'pipeline_demand' ? 'bg-[#00F0FF] text-[#05050A] shadow-[0_0_15px_rgba(0,240,255,0.6)]' : 'bg-slate-100 text-slate-400 border border-slate-300'
              }`}>3</span>
              <div>
                <div className="text-xs font-bold text-[#0F172A] tracking-wide">Step 3: Demand Creation</div>
                <div className="text-xs text-slate-500">Resourcing Config</div>
              </div>
            </div>
            <div className="hidden md:block h-0.5 w-12 bg-slate-200" />
            <div className="flex items-center gap-3 opacity-60">
              <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-300 flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <div className="text-xs font-bold text-slate-700 tracking-wide">Step 4: Submit & ID</div>
                <div className="text-xs text-slate-400">Auto-Generates REQ-ID</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-r from-[#00F0FF] via-[#8F00FF]/40 to-[#E01A8A] shadow-soft-depth">
        <div className="bg-white rounded-[23px] overflow-hidden border border-slate-200">

          {/* STEP 1: CONTEXT */}
          {currentSection === 1 && (
            <div className="p-8 md:p-10 space-y-7">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">Demand/Project Code Creation Request</h2>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-3">Domain <span className="text-[#E01A8A]">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {['Consumer and Commercial (C&C)', 'Supply Chain (SC)', 'Finance', 'Agro', 'ESG & EHS', 'IBP', 'AI Platforms', 'Data Platforms', 'EDF', 'Sector'].map((d) => (
                    <label key={d} onClick={() => handleChange('domain', d)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      formData.domain === d ? 'bg-[#00F0FF]/15 text-[#0F172A] font-bold border-[#00F0FF] shadow-sm' : 'bg-white text-[#1E293B] border-slate-200 hover:border-[#00F0FF] hover:bg-slate-50'
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${formData.domain === d ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`}>
                        {formData.domain === d && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-semibold text-[#0F172A] mb-3">Service Required <span className="text-[#E01A8A]">*</span></label>
                <div className="flex flex-wrap items-center gap-6 md:gap-10">
                  {['Dossier Project Creation', 'Demand Creation', 'Both'].map((svc) => (
                    <label key={svc} onClick={() => handleChange('serviceRequired', svc)} className="flex items-center gap-2.5 text-xs font-medium text-[#1E293B] cursor-pointer hover:text-[#00F0FF] transition">
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.serviceRequired === svc ? 'border-[#00F0FF] shadow-sm' : 'border-slate-300'}`}>
                        {formData.serviceRequired === svc && <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />}
                      </span>
                      <span>{svc}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-slate-200 mt-8">
                <button type="button" disabled={!isSection1Valid()} onClick={handleNext} className={`px-8 py-3 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                  isSection1Valid() ? 'bg-gradient-to-r from-[#E01A8A] to-[#9000FF] text-white shadow-[0_0_18px_rgba(224,26,138,0.35)] hover:scale-105 cursor-pointer' : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                }`}>
                  <span>Next Step</span><span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 1: DOSSIER PROJECT CODE CREATION */}
          {(currentSection === 5 || currentSection === 'pipeline_dossier') && (
            <div>
              <div className="bg-gradient-to-r from-[#E01A8A] to-[#9000FF] px-8 py-5 flex items-center justify-between text-white">
                <div>
                  <h2 className="text-2xl font-bold tracking-wide">{currentSection === 'pipeline_dossier' ? 'STAGE 1: Dossier Project Code Creation' : 'New Project Code Creation'}</h2>
                  <p className="text-xs text-purple-100 mt-1">Fill in the below details in case of new project code creation</p>
                </div>
              </div>
              <div className="p-8 space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SearchableSelect label="Project Group_New Project" value={formData.newProjectGroup} onChange={(val) => handleChange('newProjectGroup', val)} options={masterProjectGroups} required error={!formData.newProjectGroup && touchedFields} />
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Project Name_New <span className="text-[#E01A8A]">*</span></label>
                    <input type="text" placeholder="e.g. PEPSICO_CTO_Analytics_Engine" value={formData.newProjectName} onChange={(e) => handleChange('newProjectName', e.target.value)} className="w-full bg-white border border-[#1E293B]/30 focus:border-[#00F0FF] rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Project Description</label>
                  <textarea rows={2} value={formData.projectDescription} onChange={(e) => handleChange('projectDescription', e.target.value)} className="w-full bg-white border border-[#1E293B]/30 rounded-xl p-3 text-[#0F172A] focus:border-[#00F0FF] outline-none text-xs" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-2">Customer <span className="text-[#E01A8A]">*</span></label>
                    <div className="flex gap-4">{['PEPSICO', 'PEPSICO_APAC'].map(cust => (
                      <label key={cust} onClick={() => handleChange('customer', cust)} className={`flex items-center px-4 py-2 rounded-xl border text-xs cursor-pointer ${formData.customer === cust ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#0F172A] font-bold' : 'border-slate-200 bg-white text-[#1E293B]'}`}>
                        <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${formData.customer === cust ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />{cust}
                      </label>
                    ))}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-2">Currency <span className="text-[#E01A8A]">*</span></label>
                    <div className="flex gap-4">{['$', '₹'].map(curr => (
                      <label key={curr} onClick={() => handleChange('currency', curr)} className={`flex items-center px-5 py-2 rounded-xl border text-sm font-bold cursor-pointer ${formData.currency === curr ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#0F172A]' : 'border-slate-200 bg-white text-[#1E293B]'}`}>
                        <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${formData.currency === curr ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />{curr}
                      </label>
                    ))}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Delivery Partner <span className="text-[#E01A8A]">*</span></label>
                    <select value={formData.deliveryPartner} onChange={(e) => handleChange('deliveryPartner', e.target.value)} className="w-full p-2.5 bg-white border border-[#1E293B]/30 rounded-xl text-xs text-[#0F172A] focus:border-[#00F0FF] outline-none">
                      <option value="">Select...</option>
                      {(DELIVERY_PARTNERS || ['Karthikeyan Jayaprakash', 'Parag Shah', 'Rohit Sen']).map(dp => <option key={dp} value={dp}>{dp}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Client Partner <span className="text-[#E01A8A]">*</span></label>
                    <select value={formData.clientPartner} onChange={(e) => handleChange('clientPartner', e.target.value)} className="w-full p-2.5 bg-white border border-[#1E293B]/30 rounded-xl text-xs focus:border-[#00F0FF] outline-none">
                      <option value="">Select...</option>
                      {(CLIENT_PARTNERS || ['Parag Shah', 'Sandeep Sharma', 'Rohit Sen']).map(cp => <option key={cp} value={cp}>{cp}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Tech Partner <span className="text-[#E01A8A]">*</span></label>
                    <input type="text" value={formData.techPartner} onChange={(e) => handleChange('techPartner', e.target.value)} className="w-full bg-white border border-[#1E293B]/30 focus:border-[#00F0FF] rounded-xl px-3 py-2 text-xs text-[#0F172A] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Engineering Partner <span className="text-[#E01A8A]">*</span></label>
                    <input type="text" value={formData.engineeringPartner} onChange={(e) => handleChange('engineeringPartner', e.target.value)} className="w-full bg-white border border-[#1E293B]/30 focus:border-[#00F0FF] rounded-xl px-3 py-2 text-xs text-[#0F172A] outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-2">Program Type <span className="text-[#E01A8A]">*</span></label>
                    <div className="flex flex-col gap-2">{['Managed Program', 'COE', 'Team Extension'].map(type => (
                      <label key={type} onClick={() => handleChange('programType', type)} className="flex items-center text-xs text-[#1E293B] cursor-pointer">
                        <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${formData.programType === type ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />{type}
                      </label>
                    ))}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1E293B] mb-2">Billing Type <span className="text-[#E01A8A]">*</span></label>
                    <div className="flex flex-col gap-2">{['Fixed Price', 'T&M', 'Retainer'].map(type => (
                      <label key={type} onClick={() => handleChange('billingType', type)} className="flex items-center text-xs text-[#1E293B] cursor-pointer">
                        <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${formData.billingType === type ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />{type}
                      </label>
                    ))}</div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-2">Project Tenure <span className="text-[#E01A8A]">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{['Short Term (<= 3 months)', 'Short Term Extensible', 'Mid Term (up to 6 months)', 'Mid Term Extensible', 'Retainer (more than 6 months)', 'Retainer Extensible', 'No Visibility'].map(tenure => (
                    <label key={tenure} onClick={() => handleChange('projectTenure', tenure)} className="flex items-center text-xs text-[#1E293B] cursor-pointer">
                      <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${formData.projectTenure === tenure ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />{tenure}
                    </label>
                  ))}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-2">SOW Applicability <span className="text-[#E01A8A]">*</span></label>
                  <div className="flex flex-wrap gap-4">{['New SOW', 'Existing SOW', 'Not Applicable'].map(sow => (
                    <label key={sow} onClick={() => handleChange('sowApplicability', sow)} className={`flex items-center px-4 py-2 rounded-xl border text-xs cursor-pointer ${formData.sowApplicability === sow ? 'border-[#00F0FF] bg-[#00F0FF]/10 font-bold text-[#0F172A]' : 'border-slate-200 bg-white text-[#1E293B]'}`}>
                      <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${formData.sowApplicability === sow ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />{sow}
                    </label>
                  ))}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 mt-8">
                  <button type="button" onClick={handleBack} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-full transition text-[#1E293B]">← Back</button>
                  {currentSection === 'pipeline_dossier' ? (
                    <button type="button" disabled={!isDossierValid()} onClick={handleContinueToDemand} className={`px-8 py-3 rounded-full text-xs font-bold transition-all ${
                      isDossierValid() ? 'bg-[#00F0FF] text-[#05050A] shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:scale-105 cursor-pointer' : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                    }`}>
                      Continue to Demand Details →
                    </button>
                  ) : (
                    <button type="button" disabled={!isDossierValid() || submitting} onClick={handleSubmit} className={`px-10 py-3 rounded-full text-xs font-semibold transition-all ${
                      isDossierValid() && !submitting ? 'bg-gradient-to-r from-[#E01A8A] to-[#9000FF] text-white hover:scale-105 cursor-pointer' : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                    }`}>
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: DEMAND CREATION REQUEST */}
          {(currentSection === 2 || currentSection === 'pipeline_demand') && (
            <div>
              <div className="bg-gradient-to-r from-[#00F0FF] to-[#0090FF] px-8 py-5 flex items-center justify-between text-[#05050A]">
                <div>
                  <h2 className="text-2xl font-bold tracking-wide">
                    {currentSection === 'pipeline_demand' ? 'STAGE 2: Demand Creation Request' : 'Demand Creation Request'}
                  </h2>
                  <p className="text-xs font-semibold opacity-90 mt-1">Configure resource and skills requirements</p>
                </div>
                {currentSection === 'pipeline_demand' && (
                  <span className="text-xs bg-black/15 text-[#05050A] px-3 py-1.5 rounded-full font-extrabold">
                    Sequential Step 2 of 2
                  </span>
                )}
              </div>

              {currentSection === 'pipeline_demand' && (
                <div className="mx-8 mt-6 p-4 bg-[#F8FAFC] border border-[#00F0FF]/50 rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block tracking-wider uppercase">CASCADED PROJECT CONTEXT</span>
                    <span className="text-xs font-mono text-[#0F172A] font-bold">{formData.projectGroup} → {formData.projectName}</span>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full font-semibold">✓ Auto-Synced from Dossier</span>
                </div>
              )}

              {touchedFields && !isDemandValid() && validationAlertMsg && (
                <div className="mx-8 mt-4 p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <span>⚠</span><span>{validationAlertMsg}</span>
                </div>
              )}

              {/* Multi-Step Tabs */}
              <div className="bg-[#F8FAFC] border-b border-slate-200 px-6 pt-3 mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                {[
                  { id: 1, label: 'Project & Demand Context' },
                  { id: 2, label: 'Role & Skill Requirements' },
                  { id: 3, label: 'Timelines & Commercials' },
                  { id: 4, label: isConditionalRequired ? 'Conditional Details *' : 'Conditional Details', isRequired: isConditionalRequired }
                ].map((tab) => (
                  <button key={tab.id} type="button" onClick={() => setActiveDemandTab(tab.id)} className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer flex items-center gap-1 ${
                    activeDemandTab === tab.id ? 'bg-white text-[#0F172A] border-t-2 border-[#00F0FF] shadow-sm font-bold' : 'text-slate-500 hover:text-[#0F172A]'
                  }`}>
                    <span>{tab.label.replace(' *', '')}</span>
                    {tab.isRequired && <span className="text-[#E01A8A] font-bold text-sm leading-none">*</span>}
                  </button>
                ))}
              </div>

              <div className="p-8 space-y-8">
                
                {/* TAB 1: PROJECT CONTEXT */}
                {activeDemandTab === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-base font-bold text-[#0F172A] border-b border-slate-200 pb-2">Project & Demand Context</h3>

                    {currentSection !== 'pipeline_demand' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SearchableSelect label="Project Group" value={formData.projectGroup} onChange={(val) => handleChange('projectGroup', val)} options={masterProjectGroups} required error={!formData.projectGroup && touchedFields} />
                        <SearchableSelect label="Project Name" value={formData.projectName} onChange={(val) => handleChange('projectName', val)} options={masterProjectNames} required error={!formData.projectName && touchedFields} />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Client Requestor Name <span className="text-[#E01A8A] font-bold">*</span></label>
                      <textarea rows={2} value={formData.clientRequestorName} onChange={(e) => handleChange('clientRequestorName', e.target.value)} className={`w-full bg-white border rounded-xl p-3 text-[#0F172A] outline-none text-xs ${
                        !formData.clientRequestorName.trim() && touchedFields ? 'border-[#E01A8A] ring-1 ring-[#E01A8A]' : 'border-[#1E293B]/30 focus:border-[#00F0FF]'
                      }`} />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-2">Demand Type <span className="text-[#E01A8A] font-bold">*</span></label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {['New', 'Replacement', 'Replacement - POP', 'Investment - Delivery', 'Investment - Technical Delivery'].map((type) => (
                          <label key={type} onClick={() => handleChange('demandType', type)} className={`flex items-center p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                            formData.demandType === type ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#0F172A] font-bold shadow-sm' : 'border-slate-200 bg-white text-[#1E293B]'
                          }`}>
                            <span className={`w-3.5 h-3.5 rounded-full border mr-2.5 flex items-center justify-center ${formData.demandType === type ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />
                            <span className="truncate">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Fix #1: Disable Next Button until Tab 1 required fields are filled */}
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        disabled={!isTab1Valid}
                        onClick={() => isTab1Valid && setActiveDemandTab(2)}
                        className={`px-6 py-2.5 text-xs font-bold rounded-full transition shadow-sm ${
                          isTab1Valid
                            ? 'bg-[#00F0FF]/15 border border-[#00F0FF] text-[#0F172A] hover:bg-[#00F0FF] cursor-pointer'
                            : 'bg-slate-200 text-slate-400 border border-slate-300 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        Continue to Role & Skills →
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: ROLES, SKILLS & MULTI-POSITION */}
                {activeDemandTab === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="text-base font-bold text-[#0F172A]">Role, Skill & Position Requirements</h3>
                    </div>

                    {/* Multiple Positions Toggle */}
                    <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 shadow-sm">
                      <label className="block text-sm font-bold text-[#0F172A] mb-3">Multiple Positions Required? <span className="text-[#E01A8A]">*</span></label>
                      <div className="flex gap-6 mb-4">
                        {['No', 'Yes'].map(ans => (
                          <label key={ans} onClick={() => handleChange('multiplePositionsRequired', ans)} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#1E293B]">
                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.multiplePositionsRequired === ans ? 'border-[#E01A8A] bg-[#E01A8A]' : 'border-slate-300'}`} />
                            {ans}
                          </label>
                        ))}
                      </div>

                      {formData.multiplePositionsRequired === 'Yes' && (
                        <div className="pt-4 border-t border-slate-200 space-y-3">
                          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <button
                              type="button"
                              onClick={() => setIsMatrixOpen(true)}
                              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#00F0FF] to-[#0090FF] text-[#05050A] font-bold rounded-xl shadow-md hover:scale-[1.02] transition flex items-center justify-center gap-2"
                            >
                              <span>⚡</span> Open Multi-Position Matrix Grid ({totalMatrixHeadcount} Positions Configured)
                            </button>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2.5 border border-slate-300 text-slate-700 bg-white rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm transition"
                            >
                              <span>📥</span> Import XLSX / CSV
                            </button>
                          </div>

                          <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono shadow-inner flex items-center justify-between">
                            <span><strong className="text-[#0F172A] font-sans">Summary:</strong> {matrixSummaryText}</span>
                            <span className="text-[11px] font-sans font-bold text-[#E01A8A] bg-[#FCE7F3] px-2 py-0.5 rounded">
                              {formData.matrixPositions.length} Rows Configured
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Standard Single-Position Flow */}
                    {formData.multiplePositionsRequired === 'No' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div>
                          <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Roles <span className="text-[#E01A8A] font-bold">*</span></label>
                          <div className={`flex flex-wrap gap-2 mb-2 min-h-[36px] p-2 bg-[#F8FAFC] border rounded-xl ${
                            formData.selectedRoles.length === 0 && touchedFields ? 'border-[#E01A8A] ring-1 ring-[#E01A8A]' : 'border-slate-200'
                          }`}>
                            {formData.selectedRoles.length === 0 ? <span className="text-xs text-slate-400 italic">Type below to search roles...</span> : formData.selectedRoles.map(role => (
                              <span key={role} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00F0FF]/20 border border-[#00F0FF] text-slate-900 rounded-lg text-xs font-semibold">
                                {role} <button type="button" onClick={() => handleToggleRole(role)} className="text-slate-600 hover:text-[#E01A8A]">✕</button>
                              </span>
                            ))}
                          </div>
                          
                          {/* Search Input Box */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search & Select from 40+ Roles..."
                              value={roleSearchTerm}
                              onFocus={() => setIsRoleDropdownOpen(true)}
                              onChange={(e) => { setRoleSearchTerm(e.target.value); setIsRoleDropdownOpen(true); }}
                              className="w-full bg-white border border-[#1E293B]/30 rounded-xl p-3 text-slate-900 focus:border-[#00F0FF] outline-none text-xs"
                            />

                            {/* Fix #2: Clean Role Names without underscores */}
                            {isRoleDropdownOpen && (
                              <div className="absolute z-20 w-full mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-2.5">
                                <div className="flex justify-between items-center px-2 py-1.5 text-xs text-slate-600 border-b border-slate-200">
                                  <span className="font-semibold">Showing {filteredRoles.length} matching roles</span>
                                  <button type="button" onClick={() => setIsRoleDropdownOpen(false)} className="text-[#00F0FF] font-bold text-xs hover:underline">Close ✕</button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
                                  {filteredRoles.map(role => {
                                    const isChecked = formData.selectedRoles.includes(role);
                                    return (
                                      <label
                                        key={role}
                                        onClick={() => handleToggleRole(role)}
                                        className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                          isChecked
                                            ? 'bg-[#00F0FF]/15 text-slate-950 font-bold border border-[#00F0FF]/50'
                                            : 'text-slate-800 hover:bg-slate-100 hover:text-slate-950'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => {}}
                                          className="accent-[#00F0FF] w-4 h-4 rounded cursor-pointer"
                                        />
                                        <span className="truncate text-slate-900 font-medium">{role}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Stream</label>
                          <select
                            value={formData.stream}
                            onChange={(e) => handleChange('stream', e.target.value)}
                            className="w-full bg-white border border-[#1E293B]/30 rounded-xl p-2.5 text-slate-900 focus:border-[#00F0FF] outline-none text-xs cursor-pointer"
                          >
                            <option value="" className="text-slate-900 bg-white">Select Stream</option>
                            {masterStreamsList.map(s => <option key={s} value={s} className="text-slate-900 bg-white">{s}</option>)}
                          </select>
                        </div>

                        {/* Fix #2: All breakdown counters start inactive with count 0 */}
                        <div className="bg-white border border-[#1E293B]/20 rounded-xl p-5 shadow-sm">
                          <label className="block text-sm font-bold text-[#0F172A] mb-1">Level / Role Breakdown <span className="text-[#E01A8A] font-bold">*</span></label>
                          <p className="text-[11px] text-slate-500 mb-4">Select applicable levels and specify exact headcount target.</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.keys(formData.headcountBreakdown).map(level => {
                              const { active, count } = formData.headcountBreakdown[level];
                              return (
                                <div key={level} className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${
                                  active ? 'border-[#00F0FF] bg-[#00F0FF]/10 shadow-sm' : 'border-slate-200 bg-slate-50'
                                }`}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLevel(level)}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1 transition ${
                                      active ? 'bg-[#00F0FF] text-slate-950 shadow-sm' : 'text-slate-700 bg-white hover:bg-slate-200'
                                    }`}
                                  >
                                    {active && <span>✓</span>} {level}
                                  </button>
                                  {active && (
                                    <input
                                      type="number"
                                      min="1"
                                      value={count}
                                      onChange={(e) => handleUpdateLevelCount(level, e.target.value)}
                                      className="w-14 text-center text-xs font-mono font-black text-slate-950 bg-white border-2 border-[#00F0FF] rounded-md py-1.5 outline-none focus:ring-2 focus:ring-[#00F0FF]/40 shadow-sm"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-5 pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2">
                            <div className="text-xs font-semibold text-[#1E293B]">
                              Total Headcount (# of Positions): <span className="text-lg font-black text-[#00F0FF] ml-1">{totalSingleHeadcount}</span>
                            </div>
                            <div className="text-[11px] text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                              Summary: <span className="font-bold text-[#0F172A]">{activeLevelSummary || 'None selected'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-semibold text-[#1E293B] mb-1">Primary Skills (Must-have) <span className="text-[#E01A8A] font-bold">*</span></label>
                            <textarea rows={2} value={formData.primarySkills} onChange={(e) => handleChange('primarySkills', e.target.value)} placeholder="Type primary skills..." className={`w-full bg-white border rounded-xl p-2.5 text-slate-900 focus:border-[#00F0FF] outline-none text-xs ${
                              !formData.primarySkills.trim() && touchedFields ? 'border-[#E01A8A] ring-1 ring-[#E01A8A]' : 'border-[#1E293B]/30'
                            }`} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-[#1E293B] mb-1">Secondary Skills (Good-to-have)</label>
                            <textarea rows={2} value={formData.secondarySkills} onChange={(e) => handleChange('secondarySkills', e.target.value)} placeholder="Type secondary skills..." className="w-full bg-white border border-[#1E293B]/30 rounded-xl p-2.5 text-slate-900 focus:border-[#00F0FF] outline-none text-xs" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Job Description Upload</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#F8FAFC] border border-dashed border-slate-300 p-4 rounded-xl">
                        <input type="file" id="jd-upload" className="hidden" onChange={(e) => handleChange('jobDescriptionName', e.target.files[0]?.name || '')} />
                        <label htmlFor="jd-upload" className="px-5 py-2.5 bg-gradient-to-r from-[#E01A8A] to-[#9000FF] hover:scale-105 text-white rounded-full font-semibold text-xs cursor-pointer shadow-sm">+ Add File</label>
                        <span className="text-xs text-slate-600">{formData.jobDescriptionName ? <strong className="text-[#0F172A]">{formData.jobDescriptionName}</strong> : 'Upload supporting PDF/DOC (Max 100 MB)'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button type="button" onClick={() => setActiveDemandTab(1)} className="px-5 py-2 text-slate-500 hover:text-[#0F172A] text-xs font-semibold">← Back to Context</button>
                      <button type="button" onClick={() => setActiveDemandTab(3)} className="px-6 py-2.5 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#0F172A] text-xs font-bold rounded-full hover:bg-[#00F0FF] transition shadow-sm">
                        Continue to Timelines & Commercials →
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: TIMELINES & COMMERCIALS */}
                {activeDemandTab === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-base font-bold text-[#0F172A] border-b border-slate-200 pb-2">Timelines & Commercials</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div><label className="block text-xs font-medium text-slate-700 mb-1">Customer Requested Date</label><input type="date" value={formData.customerRequestedDate} onChange={(e) => handleChange('customerRequestedDate', e.target.value)} className="w-full bg-white border border-[#1E293B]/30 rounded-xl p-2.5 text-[#0F172A] focus:border-[#00F0FF] outline-none text-xs" /></div>
                      <div><label className="block text-xs font-medium text-slate-700 mb-1">Fulfillment Date</label><input type="date" value={formData.customerExpectedFulfillmentDate} onChange={(e) => handleChange('customerExpectedFulfillmentDate', e.target.value)} className="w-full bg-white border border-[#1E293B]/30 rounded-xl p-2.5 text-[#0F172A] focus:border-[#00F0FF] outline-none text-xs" /></div>
                      <div><label className="block text-xs font-medium text-slate-700 mb-1">Demand Start Date <span className="text-[#E01A8A] text-[10px]">(≥ 2 wks)</span></label><input type="date" value={formData.demandStartDate} onChange={(e) => handleChange('demandStartDate', e.target.value)} className="w-full bg-white border border-[#1E293B]/30 rounded-xl p-2.5 text-[#0F172A] focus:border-[#00F0FF] outline-none text-xs" /></div>
                      <div><label className="block text-xs font-medium text-slate-700 mb-1">Demand End Date</label><input type="date" value={formData.demandEndDate} onChange={(e) => handleChange('demandEndDate', e.target.value)} className="w-full bg-white border border-[#1E293B]/30 rounded-xl p-2.5 text-[#0F172A] focus:border-[#00F0FF] outline-none text-xs" /></div>
                      <div><label className="block text-xs font-medium text-slate-700 mb-1">Billing Start Date</label><input type="date" value={formData.billingStartDate} onChange={(e) => handleChange('billingStartDate', e.target.value)} className="w-full bg-white border border-[#1E293B]/30 rounded-xl p-2.5 text-[#0F172A] focus:border-[#00F0FF] outline-none text-xs" /></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-2">Priority</label>
                        <div className="flex flex-wrap gap-2.5">{['P1 - Existing SOW', 'P2 - SOW in Progress', 'P3 - RFP / Outreach'].map(p => (
                          <label key={p} onClick={() => handleChange('priority', p)} className={`flex items-center px-3 py-2 rounded-xl border text-xs cursor-pointer transition ${
                            formData.priority === p ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#0F172A] font-bold shadow-sm' : 'border-slate-200 bg-white text-[#1E293B]'
                          }`}><span className={`w-3 h-3 rounded-full border mr-2 flex items-center justify-center ${formData.priority === p ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />{p}</label>
                        ))}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-2">Probability</label>
                        <div className="flex gap-2.5">{['25%', '50%', '75%', '100%'].map(prob => (
                          <label key={prob} onClick={() => handleChange('probability', prob)} className={`flex-1 text-center py-2 rounded-xl border text-xs cursor-pointer font-bold transition ${
                            formData.probability === prob ? 'border-[#00F0FF] bg-[#00F0FF]/20 text-[#0F172A]' : 'border-slate-200 bg-white text-slate-500'
                          }`}>{prob}</label>
                        ))}</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-2">Bill Rate</label>
                      <div className="flex flex-wrap items-center gap-2.5">{['28', '30', '32', '35', '36', 'Other'].map(rate => (
                        <label key={rate} onClick={() => handleChange('billRate', rate)} className={`px-4 py-2 rounded-xl border text-xs cursor-pointer font-semibold transition ${
                          formData.billRate === rate ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#0F172A]' : 'border-slate-200 bg-white text-[#1E293B]'
                        }`}>{rate === 'Other' ? 'Other' : `$${rate}`}</label>
                      ))}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-slate-200">
                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-2">Client Interview <span className="text-[#E01A8A] font-bold">*</span></label>
                        <div className="flex gap-4">{['Yes', 'No'].map(val => (
                          <label key={val} onClick={() => handleChange('clientInterview', val)} className="flex items-center text-xs text-[#1E293B] cursor-pointer">
                            <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${formData.clientInterview === val ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />{val}
                          </label>
                        ))}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-2">Is SOW Active? <span className="text-[#E01A8A] font-bold">*</span></label>
                        <div className="flex gap-4">{['Yes', 'No'].map(val => (
                          <label key={val} onClick={() => handleChange('isSowActive', val)} className="flex items-center text-xs text-[#1E293B] cursor-pointer">
                            <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${formData.isSowActive === val ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />{val}
                          </label>
                        ))}</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#1E293B] mb-2">Contractor Allowed <span className="text-[#E01A8A] font-bold">*</span></label>
                        <div className="flex gap-4">{['Yes', 'No'].map(val => (
                          <label key={val} onClick={() => handleChange('contractorAllowed', val)} className="flex items-center text-xs text-[#1E293B] cursor-pointer">
                            <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${formData.contractorAllowed === val ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-300'}`} />{val}
                          </label>
                        ))}</div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button type="button" onClick={() => setActiveDemandTab(2)} className="px-5 py-2 text-slate-500 hover:text-[#0F172A] text-xs font-semibold">← Back to Roles</button>
                      <button type="button" onClick={() => setActiveDemandTab(4)} className="px-6 py-2.5 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#0F172A] text-xs font-bold rounded-full hover:bg-[#00F0FF] transition shadow-sm">
                        Continue to Conditional Details →
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: CONDITIONAL DETAILS */}
                {activeDemandTab === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-1.5">
                        <span>Conditional Details</span>{isConditionalRequired && <span className="text-[#E01A8A] font-bold text-base">*</span>}
                      </h3>
                      {isConditionalRequired ? (
                        <span className="text-[11px] font-bold text-[#E01A8A] bg-[#FCE7F3] border border-[#E01A8A]/30 px-3 py-1 rounded-full">
                          Required for {formData.demandType}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          Optional for New Demands
                        </span>
                      )}
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${isInvestmentDemand ? 'border-[#00F0FF] bg-[#00F0FF]/5 shadow-sm' : 'border-slate-200 bg-slate-50/60 opacity-80'}`}>
                      <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1 flex items-center gap-1"><span>Investment Details</span>{isInvestmentDemand && <span className="text-[#E01A8A]">*</span>}</h4>
                      <p className="text-[11px] text-slate-500 mb-3">{isInvestmentDemand ? 'Mandatory: Business Case must be filled.' : 'Applicable only for Investment requests.'}</p>
                      <textarea rows={2} value={formData.investmentBusinessCase} onChange={(e) => handleChange('investmentBusinessCase', e.target.value)} placeholder="Type business case justification..." className={`w-full bg-white border rounded-xl p-2.5 text-[#0F172A] text-xs outline-none ${
                        isInvestmentDemand && !formData.investmentBusinessCase.trim() && touchedFields ? 'border-[#E01A8A] ring-1 ring-[#E01A8A]' : 'border-slate-200 focus:border-[#00F0FF]'
                      }`} />
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${isReplacementDemand ? 'border-[#E01A8A] bg-[#E01A8A]/5 shadow-sm' : 'border-slate-200 bg-slate-50/60 opacity-80'}`}>
                      <h4 className="text-xs font-bold text-[#E01A8A] uppercase tracking-wider mb-1 flex items-center gap-1"><span>Replacement Details</span>{isReplacementDemand && <span>*</span>}</h4>
                      <p className="text-[11px] text-slate-500 mb-3">{isReplacementDemand ? 'Mandatory: Resource Name and Employee ID are required.' : 'Applicable only for Replacement demands.'}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" value={formData.replacementName} onChange={(e) => handleChange('replacementName', e.target.value)} placeholder="Resource Name *" className={`w-full bg-white border rounded-xl p-2.5 text-[#0F172A] text-xs outline-none ${
                          isReplacementDemand && !formData.replacementName.trim() && touchedFields ? 'border-[#E01A8A] ring-1 ring-[#E01A8A]' : 'border-slate-200 focus:border-[#E01A8A]'
                        }`} />
                        <input type="text" value={formData.replacementEmpId} onChange={(e) => handleChange('replacementEmpId', e.target.value)} placeholder="Emp ID *" className={`w-full bg-white border rounded-xl p-2.5 text-[#0F172A] text-xs outline-none ${
                          isReplacementDemand && !formData.replacementEmpId.trim() && touchedFields ? 'border-[#E01A8A] ring-1 ring-[#E01A8A]' : 'border-slate-200 focus:border-[#E01A8A]'
                        }`} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">Additional Comments</label>
                      <textarea rows={2} value={formData.additionalComments} onChange={(e) => handleChange('additionalComments', e.target.value)} placeholder="Enter any additional notes..." className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[#0F172A] text-xs outline-none focus:border-[#00F0FF]" />
                    </div>
                  </div>
                )}

                {/* Final Submission & Step Navigation Bar (Fix #4) */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 mt-8">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleDemandBack}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1E293B] text-xs font-bold rounded-full transition"
                    >
                      ← Back
                    </button>
                    <span className="text-xs text-slate-500"><span className="text-[#E01A8A] font-bold">*</span> Generates single REQ-ID on submit</span>
                  </div>
                  <button type="button" disabled={!isDemandValid() || submitting} onClick={handleSubmit} className={`w-full sm:w-auto px-10 py-3 rounded-full text-xs font-bold transition-all ${
                    isDemandValid() && !submitting ? 'bg-gradient-to-r from-[#E01A8A] to-[#9000FF] text-white shadow-[0_0_18px_rgba(224,26,138,0.4)] hover:scale-105 cursor-pointer' : 'bg-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                  }`}>
                    {submitting ? 'Submitting...' : currentSection === 'pipeline_demand' ? 'Submit Full Request' : 'Submit Demand Request'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MULTI-POSITION DEMAND MATRIX MODAL (Fix #3: Sub Stream & Track Removed) */}
      {isMatrixOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-[1100px] w-full rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900">
            
            {/* Modal Header Ribbon */}
            <div className="bg-gradient-to-r from-[#E01A8A] to-[#9000FF] px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Multi-Position Demand Matrix</h2>
                <div className="text-xs text-purple-100 mt-0.5">
                  Batch Submission: Multiple resource requests under unified project context
                </div>
              </div>
              <button onClick={() => setIsMatrixOpen(false)} className="text-white hover:text-[#00F0FF] font-bold text-xl leading-none">✕</button>
            </div>

            {/* Consolidated Batch Metadata Banner */}
            <div className="px-6 py-3 bg-[#F8FAFC] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-700">
                <span><strong>SBU / Domain:</strong> {formData.domain || 'Technology'}</span>
                <span className="text-slate-300">|</span>
                <span><strong>Requestor:</strong> {formData.clientRequestorName || 'Naresh Kumar Nayak'}</span>
                <span className="text-slate-300">|</span>
                <span><strong>Project:</strong> {formData.projectName || 'PEPSICO_DPA_PLM'}</span>
                <span className="text-slate-300">|</span>
                <span><strong>SOW:</strong> {formData.isSowActive || 'Yes'}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 border border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/10 rounded-lg text-xs font-bold hover:bg-[#00F0FF]/20 transition flex items-center gap-1.5"
                >
                  📥 Bulk Import (XLSX/CSV)
                </button>
                <button
                  type="button"
                  onClick={handleAddMatrixRow}
                  className="px-3.5 py-1.5 bg-[#E01A8A] text-white rounded-lg text-xs font-bold hover:bg-[#C91780] shadow-sm transition flex items-center gap-1.5"
                >
                  + Add Position Row
                </button>
              </div>
            </div>

            {/* Matrix Data Grid */}
            <div className="overflow-x-auto overflow-y-auto flex-1 p-6 bg-white min-h-[300px]">
              <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                <thead className="bg-[#1E293B] text-white sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3 rounded-tl-lg font-semibold">Pos # (Sub-ID)</th>
                    <th className="py-2.5 px-3 font-semibold">Stream <span className="text-[#E01A8A]">*</span></th>
                    <th className="py-2.5 px-3 font-semibold">Level <span className="text-[#E01A8A]">*</span></th>
                    <th className="py-2.5 px-3 font-semibold">No. Pos <span className="text-[#E01A8A]">*</span></th>
                    <th className="py-2.5 px-3 font-semibold">Primary Skills <span className="text-[#E01A8A]">*</span></th>
                    <th className="py-2.5 px-3 font-semibold">Secondary Skills</th>
                    <th className="py-2.5 px-3 font-semibold">SOW</th>
                    <th className="py-2.5 px-3 font-semibold">Forecast</th>
                    <th className="py-2.5 px-3 rounded-tr-lg font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {formData.matrixPositions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                        No positions configured. Click "+ Add Position Row" or "Bulk Import" to start.
                      </td>
                    </tr>
                  ) : (
                    formData.matrixPositions.map((row, idx) => {
                      const posNumber = String(idx + 1).padStart(2, '0');
                      return (
                        <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-3 font-mono">
                            <span className="font-bold text-[#0F172A]">Pos {posNumber}</span>
                            <span className="block text-[10px] text-slate-400">REQ-XXXX_{posNumber}</span>
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={row.stream}
                              onChange={(e) => handleUpdateMatrixRow(row.id, 'stream', e.target.value)}
                              className={`w-40 p-1.5 border rounded outline-none bg-white text-slate-900 ${
                                !row.stream && touchedFields ? 'border-[#E01A8A]' : 'border-slate-200 focus:border-[#00F0FF]'
                              }`}
                            >
                              <option value="" className="text-slate-900 bg-white">Select Stream...</option>
                              {masterStreamsList.map(s => <option key={s} value={s} className="text-slate-900 bg-white">{s}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={row.level}
                              onChange={(e) => handleUpdateMatrixRow(row.id, 'level', e.target.value)}
                              className={`w-16 p-1.5 border rounded outline-none bg-white text-slate-900 font-bold ${
                                !row.level && touchedFields ? 'border-[#E01A8A]' : 'border-slate-200 focus:border-[#00F0FF]'
                              }`}
                            >
                              {['A1', 'A2', 'L1', 'L2', 'M1', 'M2', 'AD+'].map(l => <option key={l} value={l} className="text-slate-900 bg-white">{l}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number" min="1" value={row.noPos}
                              onChange={(e) => handleUpdateMatrixRow(row.id, 'noPos', e.target.value)}
                              className={`w-16 p-1.5 border rounded outline-none bg-white text-center font-mono font-bold text-slate-900 ${
                                row.noPos <= 0 && touchedFields ? 'border-[#E01A8A]' : 'border-slate-200 focus:border-[#00F0FF]'
                              }`}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text" placeholder="React, Python..." value={row.primarySkills}
                              onChange={(e) => handleUpdateMatrixRow(row.id, 'primarySkills', e.target.value)}
                              className={`w-48 p-1.5 border rounded outline-none bg-white text-slate-900 ${
                                !row.primarySkills.trim() && touchedFields ? 'border-[#E01A8A]' : 'border-slate-200 focus:border-[#00F0FF]'
                              }`}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text" placeholder="Secondary skills..." value={row.secondarySkills}
                              onChange={(e) => handleUpdateMatrixRow(row.id, 'secondarySkills', e.target.value)}
                              className="w-36 p-1.5 border border-slate-200 rounded outline-none bg-white text-slate-900 focus:border-[#00F0FF]"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={row.sow}
                              onChange={(e) => handleUpdateMatrixRow(row.id, 'sow', e.target.value)}
                              className="w-16 p-1.5 border border-slate-200 rounded outline-none bg-white text-slate-900 focus:border-[#00F0FF]"
                            >
                              <option value="Yes" className="text-slate-900 bg-white">Yes</option>
                              <option value="No" className="text-slate-900 bg-white">No</option>
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={row.forecast}
                              onChange={(e) => handleUpdateMatrixRow(row.id, 'forecast', e.target.value)}
                              className="w-32 p-1.5 border border-slate-200 rounded outline-none bg-white text-slate-900 focus:border-[#00F0FF]"
                            >
                              <option value="Not Forecasted" className="text-slate-900 bg-white">Not Forecasted</option>
                              <option value="Forecasted" className="text-slate-900 bg-white">Forecasted</option>
                              <option value="Pipeline Reserved" className="text-slate-900 bg-white">Pipeline Reserved</option>
                            </select>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteMatrixRow(row.id)}
                              className="text-slate-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded transition"
                              title="Delete position"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer with Batch Split Notification */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-slate-600">
                Submitting <strong>{totalMatrixHeadcount} Positions</strong> across {formData.matrixPositions.length} role combinations (Batch Parent ID will split into <code className="bg-slate-200 text-[#0F172A] px-1.5 py-0.5 rounded font-mono">REQ-XXXX_01 to _{String(formData.matrixPositions.length).padStart(2, '0')}</code> on submit)
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsMatrixOpen(false)}
                  className="px-5 py-2.5 bg-white border border-slate-300 text-[#1E293B] text-xs font-bold rounded-lg hover:bg-slate-50 transition"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setIsMatrixOpen(false)}
                  className="px-6 py-2.5 bg-[#00F0FF] text-[#05050A] text-xs font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition"
                >
                  Save & Attach Matrix
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}