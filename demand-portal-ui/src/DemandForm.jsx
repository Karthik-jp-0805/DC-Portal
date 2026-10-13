import React, { useState, useMemo } from 'react';
import {
  DOMAINS, SERVICES, PROJECT_GROUPS, PROJECT_NAMES, DEMAND_TYPES,
  ROLES_LIST, STREAMS, PRIORITIES, PROBABILITIES, BILL_RATES,
  REPLACEMENT_REASONS, NEW_PROJECT_GROUPS, DELIVERY_PARTNERS, CLIENT_PARTNERS
} from './constants';

export default function DemandForm({ currentUser, onSubmitted }) {
  // Current high-level section: 1 = Service/Domain Selection, 2 = Standalone Demand, 5 = Standalone Dossier, 'pipeline_dossier' = Both Stage 1, 'pipeline_demand' = Both Stage 2
  const [currentSection, setCurrentSection] = useState(1);
  const [historyStack, setHistoryStack] = useState([1]);
  const [submitting, setSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState(false);

  // Sub-navigation tab for Demand Creation (Tabs 1 to 4)
  const [activeDemandTab, setActiveDemandTab] = useState(1);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Unified Form State for all workflows
  const [formData, setFormData] = useState({
    // Step 1: Context & Service
    requestorEmail: currentUser?.email || 'Sample@tigeranalytics.com',
    domain: '',
    otherDomain: '',
    serviceRequired: '',

    // Stage 1: Dossier / New Project Code Creation (13 Fields)
    newProjectGroup: '',
    newProjectName: '',
    projectDescription: '',
    customer: 'PEPSICO',
    currency: '$',
    deliveryPartner: '',
    clientPartner: '',
    techPartner: '',
    engineeringPartner: '',
    programType: 'Managed Program',
    billingType: 'Fixed Price',
    projectTenure: 'Mid Term (up to 6 months)',
    sowApplicability: 'New SOW',

    // Stage 2: Demand Creation Fields (29 Fields)
    projectGroup: '',
    projectName: '',
    clientRequestorName: currentUser?.name || 'Karthikeyan Jayaprakash',
    demandType: 'New',
    numPositions: '1',
    moreThanOneDemand: '',
    selectedRoles: [],
    customRole: '',
    stream: '',
    primarySkills: '',
    secondarySkills: '',
    jobDescriptionName: '',
    customerRequestedDate: '',
    customerExpectedFulfillmentDate: '',
    demandStartDate: '',
    demandEndDate: '',
    billingStartDate: '',
    priority: 'P1',
    probability: '100%',
    billRate: '32',
    otherBillRate: '',
    clientInterview: 'Yes',
    isSowActive: 'Yes',
    contractorAllowed: 'No',

    // Conditional Fields
    investmentBusinessCase: '',
    investmentFromDate: '',
    investmentToDate: '',
    replacementName: '',
    replacementEmpId: '',
    resourceIdentified: '',
    replacementReason: '',
    additionalComments: ''
  });

  const handleChange = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  // Master lists
  const masterRolesList = useMemo(() => {
    return ROLES_LIST && ROLES_LIST.length > 0 ? ROLES_LIST : [
      'Data Engineer', 'Lead Data Scientist', 'Senior Data Scientist', 'Data Scientist',
      'UI/UX Engineer', 'Frontend Engineer (React)', 'Backend Engineer (Python/FastAPI)',
      'Full Stack Engineer', 'Cloud Solutions Architect', 'DevOps / MLOps Engineer',
      'Data Architect', 'Big Data Developer', 'Azure BDE Specialist', 'Snowflake Developer',
      'Databricks Specialist', 'PowerBI Developer', 'Tableau Specialist', 'QA Automation Engineer',
      'Business Analyst', 'Delivery Manager', 'Scrum Master', 'Product Owner', 'Other'
    ];
  }, []);

  const masterStreamsList = useMemo(() => {
    return STREAMS && STREAMS.length > 0 ? STREAMS : [
      'Analytics Consulting', 'Data Science - MLOPS', 'Engineering - Azure BDE',
      'Engineering - Data Warehouse', 'Production Support', 'Cloud & Platform Engineering',
      'Business Intelligence & Reporting', 'GenAI & Cognitive Solutions'
    ];
  }, []);

  const masterProjectGroups = useMemo(() => {
    return PROJECT_GROUPS && PROJECT_GROUPS.length > 0 ? PROJECT_GROUPS : [
      'S&T - Data Platform', 'PFNA', 'EUROPE', 'S&T - Managed Program',
      'S&T - EDF', 'S&T - AI S&P', 'S&T - DG', 'Sector'
    ];
  }, []);

  const masterProjectNames = useMemo(() => {
    return PROJECT_NAMES && PROJECT_NAMES.length > 0 ? PROJECT_NAMES : [
      'PEPSICO_CTO', 'PEPSICO_PBNA', 'PEPSICO_HCM', 'PEPSICO_EDAP', 'PEPSICO_CV_LABEL_RIGHT'
    ];
  }, []);

  const filteredRoles = useMemo(() => {
    return masterRolesList.filter(r => r.toLowerCase().includes(roleSearchTerm.toLowerCase()));
  }, [masterRolesList, roleSearchTerm]);

  const handleToggleRole = (role) => {
    setFormData(prev => {
      const exists = prev.selectedRoles.includes(role);
      const updated = exists
        ? prev.selectedRoles.filter(r => r !== role)
        : [...prev.selectedRoles, role];
      return { ...prev, selectedRoles: updated };
    });
  };

  // Section 1 Validation
  const isSection1Valid = () => {
    if (!formData.domain) return false;
    if (formData.domain === 'Other' && !formData.otherDomain.trim()) return false;
    if (!formData.serviceRequired) return false;
    return true;
  };

  // Dossier Validation (Stage 1)
  const isDossierValid = () => {
    return (
      Boolean(formData.newProjectGroup) &&
      Boolean(formData.newProjectName.trim()) &&
      Boolean(formData.customer) &&
      Boolean(formData.currency) &&
      Boolean(formData.deliveryPartner) &&
      Boolean(formData.clientPartner) &&
      Boolean(formData.techPartner.trim()) &&
      Boolean(formData.engineeringPartner.trim()) &&
      Boolean(formData.programType) &&
      Boolean(formData.billingType) &&
      Boolean(formData.projectTenure) &&
      Boolean(formData.sowApplicability)
    );
  };

  // Demand Validation (Stage 2)
  const isDemandValid = () => {
    return (
      Boolean(formData.clientRequestorName.trim()) &&
      Boolean(formData.demandType) &&
      formData.selectedRoles.length > 0 &&
      Boolean(formData.clientInterview) &&
      Boolean(formData.isSowActive) &&
      Boolean(formData.contractorAllowed)
    );
  };

  // Handle Forward Stepping
  const handleNext = () => {
    if (currentSection === 1) {
      if (!isSection1Valid()) {
        setTouchedFields(true);
        return;
      }
      setTouchedFields(false);
      let nextStep = 2;
      if (formData.serviceRequired === 'Dossier Project Creation') nextStep = 5;
      else if (formData.serviceRequired === 'Demand Creation') nextStep = 2;
      else if (formData.serviceRequired === 'Both') nextStep = 'pipeline_dossier';

      setHistoryStack(prev => [...prev, nextStep]);
      setCurrentSection(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Cascade Dossier details into Demand Creation (Both workflow Stage 1 -> Stage 2)
  const handleContinueToDemand = () => {
    if (!isDossierValid()) {
      setTouchedFields(true);
      return;
    }
    setTouchedFields(false);

    // Auto-cascade Stage 1 Project values into Stage 2
    setFormData(prev => ({
      ...prev,
      projectGroup: prev.newProjectGroup,
      projectName: prev.newProjectName
    }));

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

  const handleSubmit = async () => {
    const isBothFlow = currentSection === 'pipeline_demand';
    if (isBothFlow && !isDemandValid()) {
      setTouchedFields(true);
      return;
    }
    if (currentSection === 5 && !isDossierValid()) {
      setTouchedFields(true);
      return;
    }
    if (currentSection === 2 && !isDemandValid()) {
      setTouchedFields(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      const generatedId = result.requirement_id || `REQ-2026-0${Math.floor(140 + Math.random() * 850)}`;
      onSubmitted(generatedId);
    } catch (err) {
      alert('Error submitting demand request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const isBothWorkflow = currentSection === 'pipeline_dossier' || currentSection === 'pipeline_demand';
  const isInvestmentDemand = formData.demandType.includes('Investment');
  const isReplacementDemand = formData.demandType.includes('Replacement');

  return (
    <div className="max-w-5xl mx-auto my-6 font-sans">
      
      {/* ========================================================================= */}
      {/* INTERACTIVE WORKFLOW STEPPER (FOR "BOTH" PIPELINE) */}
      {/* ========================================================================= */}
      {isBothWorkflow && (
        <div className="mb-6 bg-[#120F1F] border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Step 1: Service Type (Completed) */}
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                ✓
              </span>
              <div>
                <div className="text-xs font-bold text-white tracking-wide">Step 1: Service Type</div>
                <div className="text-xs text-emerald-400 font-medium">Selected: Both</div>
              </div>
            </div>

            <div className="hidden md:block h-0.5 w-12 bg-emerald-500" />

            {/* Step 2: Dossier Creation */}
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentSection === 'pipeline_dossier'
                  ? 'bg-[#E01A8A] text-white shadow-[0_0_15px_rgba(224,26,138,0.7)]'
                  : 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
              }`}>
                {currentSection === 'pipeline_demand' ? '✓' : '2'}
              </span>
              <div>
                <div className="text-xs font-bold text-white tracking-wide">Step 2: Dossier Creation</div>
                <div className="text-xs text-slate-400">13 Required Fields</div>
              </div>
            </div>

            <div className={`hidden md:block h-0.5 w-12 ${currentSection === 'pipeline_demand' ? 'bg-[#00F0FF]' : 'bg-slate-700'}`} />

            {/* Step 3: Demand Creation */}
            <div className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentSection === 'pipeline_demand'
                  ? 'bg-[#00F0FF] text-[#05050A] shadow-[0_0_15px_rgba(0,240,255,0.7)]'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                3
              </span>
              <div>
                <div className="text-xs font-bold text-white tracking-wide">Step 3: Demand Creation</div>
                <div className="text-xs text-slate-400">29 Resourcing Fields</div>
              </div>
            </div>

            <div className="hidden md:block h-0.5 w-12 bg-slate-700" />

            {/* Step 4: Submission & ID */}
            <div className="flex items-center gap-3 opacity-60">
              <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <div>
                <div className="text-xs font-bold text-slate-300 tracking-wide">Step 4: Submit & ID</div>
                <div className="text-xs text-slate-500">Auto-Generates REQ-ID</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main Form Surface */}
      <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-r from-[#00F0FF] via-[#8F00FF]/50 to-[#E01A8A] shadow-[0_0_35px_rgba(0,240,255,0.2)]">
        <div className="bg-[#161224] rounded-[23px] overflow-hidden border border-[#E01A8A]/30 shadow-2xl">

          {/* ========================================================================= */}
          {/* STEP 1: SERVICE & DOMAIN SELECTION */}
          {/* ========================================================================= */}
          {currentSection === 1 && (
            <div className="p-8 md:p-10 space-y-7">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Demand/Project Code Creation Request
              </h2>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Domain <span className="text-[#E01A8A]">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {['Consumer and Commercial (C&C)', 'Supply Chain (SC)', 'Finance', 'Agro', 'ESG & EHS', 'IBP', 'AI Platforms', 'Data Platforms', 'EDF', 'Sector'].map((d) => {
                    const isSelected = formData.domain === d;
                    return (
                      <label
                        key={d}
                        onClick={() => handleChange('domain', d)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#00F0FF] text-[#05050A] font-bold border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                            : 'bg-[#0A0814] text-white border-slate-800 hover:border-[#E01A8A]/60'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#05050A] bg-[#05050A]' : 'border-slate-500'
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />}
                        </span>
                        <span>{d}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-semibold text-white mb-3">
                  Service Required <span className="text-[#E01A8A]">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-6 md:gap-10">
                  {['Dossier Project Creation', 'Demand Creation', 'Both'].map((svc) => {
                    const isChecked = formData.serviceRequired === svc;
                    return (
                      <label
                        key={svc}
                        onClick={() => handleChange('serviceRequired', svc)}
                        className="flex items-center gap-2.5 text-xs font-medium text-white cursor-pointer hover:text-[#00F0FF] transition"
                      >
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isChecked ? 'border-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.6)]' : 'border-slate-500'
                        }`}>
                          {isChecked && <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />}
                        </span>
                        <span>{svc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-800 mt-8">
                <button
                  type="button"
                  disabled={!isSection1Valid()}
                  onClick={handleNext}
                  className={`px-8 py-3 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                    isSection1Valid()
                      ? 'bg-gradient-to-r from-[#E01A8A] to-[#9000FF] text-white shadow-[0_0_20px_rgba(224,26,138,0.4)] hover:scale-105 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span>Next Step</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 1: DOSSIER PROJECT CODE CREATION (13 FIELDS) */}
          {/* ========================================================================= */}
          {(currentSection === 5 || currentSection === 'pipeline_dossier') && (
            <div>
              <div className="bg-gradient-to-r from-[#E01A8A] to-[#9000FF] px-8 py-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-wide text-white">
                    {currentSection === 'pipeline_dossier' ? 'STAGE 1: Dossier Project Code Creation' : 'New Project Code Creation'}
                  </h2>
                  <p className="text-sm text-slate-200 mt-1">
                    Fill in the below details in case of new project code creation
                  </p>
                </div>
                {currentSection === 'pipeline_dossier' && (
                  <span className="text-xs bg-black/25 text-white px-3 py-1.5 rounded-full font-bold">
                    Sequential Step 1 of 2
                  </span>
                )}
              </div>

              <div className="p-8 space-y-7">
                {/* 1. Project Group */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3">
                    Project Group_New Project <span className="text-[#E01A8A]">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['S&T - Data Platform', 'S&T - Managed Program', 'S&T - EDF', 'S&T - AI S&P', 'PFNA', 'EUROPE', 'S&T - DG'].map((group) => (
                      <label
                        key={group}
                        onClick={() => handleChange('newProjectGroup', group)}
                        className={`flex items-center p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition ${
                          formData.newProjectGroup === group
                            ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                            : 'border-slate-800 bg-[#0A0814] text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center mr-3 ${
                          formData.newProjectGroup === group ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                        }`} />
                        {group}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. Project Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-1">
                    Project Name_New <span className="text-[#E01A8A]">*</span>
                  </label>
                  <p className="text-xs text-[#00F0FF] mb-2 font-medium">
                    (Project name should always start with PEPSICO_Group Name e.g., PEPSICO_CTO, PEPSICO_PBNA, PEPSICO_HCM, etc…)
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. PEPSICO_CTO_Analytics_Engine"
                    value={formData.newProjectName}
                    onChange={(e) => handleChange('newProjectName', e.target.value)}
                    className="w-full bg-transparent border-b-2 border-slate-700 focus:border-[#00F0FF] text-white py-2 outline-none text-sm placeholder-slate-600"
                  />
                </div>

                {/* 3. Project Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">Project Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter brief scope overview..."
                    value={formData.projectDescription}
                    onChange={(e) => handleChange('projectDescription', e.target.value)}
                    className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-3 text-white focus:border-[#00F0FF] outline-none text-xs placeholder-slate-600"
                  />
                </div>

                {/* 4. Customer & 5. Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      Customer <span className="text-[#E01A8A]">*</span>
                    </label>
                    <div className="flex gap-4">
                      {['PEPSICO', 'PEPSICO_APAC'].map((cust) => (
                        <label
                          key={cust}
                          onClick={() => handleChange('customer', cust)}
                          className={`flex items-center px-4 py-2 rounded-xl border text-xs cursor-pointer ${
                            formData.customer === cust
                              ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                              : 'border-slate-800 bg-[#0A0814] text-slate-300'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
                            formData.customer === cust ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                          }`} />
                          {cust}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      Currency <span className="text-[#E01A8A]">*</span>
                    </label>
                    <div className="flex gap-4">
                      {['$', '₹'].map((curr) => (
                        <label
                          key={curr}
                          onClick={() => handleChange('currency', curr)}
                          className={`flex items-center px-5 py-2 rounded-xl border text-sm font-bold cursor-pointer ${
                            formData.currency === curr
                              ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                              : 'border-slate-800 bg-[#0A0814] text-slate-300'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
                            formData.currency === curr ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                          }`} />
                          {curr}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 6. Delivery Partner & 7. Client Partner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Delivery Partner <span className="text-[#E01A8A]">*</span>
                    </label>
                    <select
                      value={formData.deliveryPartner}
                      onChange={(e) => handleChange('deliveryPartner', e.target.value)}
                      className="w-full p-3 bg-[#0A0814] border border-slate-800 rounded-xl text-xs text-white focus:border-[#00F0FF] outline-none"
                    >
                      <option value="">Select Delivery Partner</option>
                      {(DELIVERY_PARTNERS || ['Karthikeyan Jayaprakash', 'Parag Shah', 'Rohit Sen', 'Arvind Mahishi R']).map(dp => (
                        <option key={dp} value={dp} className="bg-[#161224]">{dp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">
                      Client Partner <span className="text-[#E01A8A]">*</span>
                    </label>
                    <select
                      value={formData.clientPartner}
                      onChange={(e) => handleChange('clientPartner', e.target.value)}
                      className="w-full p-3 bg-[#0A0814] border border-slate-800 rounded-xl text-xs text-white focus:border-[#00F0FF] outline-none"
                    >
                      <option value="">Select Client Partner</option>
                      {(CLIENT_PARTNERS || ['Parag Shah', 'Sandeep Sharma', 'Rohit Sen', 'Arvind Mahishi R']).map(cp => (
                        <option key={cp} value={cp} className="bg-[#161224]">{cp}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 8. Tech Partner & 9. Engineering Partner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-1">
                      Tech Partner <span className="text-[#E01A8A]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Given Name"
                      value={formData.techPartner}
                      onChange={(e) => handleChange('techPartner', e.target.value)}
                      className="w-full bg-transparent border-b-2 border-slate-700 focus:border-[#00F0FF] text-white py-2 outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-1">
                      Engineering Partner <span className="text-[#E01A8A]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Given Name"
                      value={formData.engineeringPartner}
                      onChange={(e) => handleChange('engineeringPartner', e.target.value)}
                      className="w-full bg-transparent border-b-2 border-slate-700 focus:border-[#00F0FF] text-white py-2 outline-none text-xs"
                    />
                  </div>
                </div>

                {/* 10. Program Type & 11. Billing Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      Program Type <span className="text-[#E01A8A]">*</span>
                    </label>
                    <div className="flex flex-col gap-2">
                      {['Managed Program', 'COE', 'Team Extension'].map((type) => (
                        <label
                          key={type}
                          onClick={() => handleChange('programType', type)}
                          className="flex items-center text-xs text-slate-300 cursor-pointer"
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
                            formData.programType === type ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                          }`} />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      Billing Type <span className="text-[#E01A8A]">*</span>
                    </label>
                    <div className="flex flex-col gap-2">
                      {['Fixed Price', 'T&M', 'Retainer'].map((type) => (
                        <label
                          key={type}
                          onClick={() => handleChange('billingType', type)}
                          className="flex items-center text-xs text-slate-300 cursor-pointer"
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
                            formData.billingType === type ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                          }`} />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 12. Project Tenure */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3">
                    Project Tenure <span className="text-[#E01A8A]">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {[
                      'Short Term (<= 3 months)',
                      'Short Term Extensible',
                      'Mid Term (up to 6 months)',
                      'Mid Term Extensible',
                      'Retainer (more than 6 months)',
                      'Retainer Extensible',
                      'No Visibility'
                    ].map((tenure) => (
                      <label
                        key={tenure}
                        onClick={() => handleChange('projectTenure', tenure)}
                        className="flex items-center text-xs text-slate-300 cursor-pointer"
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
                          formData.projectTenure === tenure ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                        }`} />
                        {tenure}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 13. SOW Applicability */}
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-3">
                    SOW Applicability <span className="text-[#E01A8A]">*</span>
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {['New SOW', 'Existing SOW', 'Not Applicable'].map((sow) => (
                      <label
                        key={sow}
                        onClick={() => handleChange('sowApplicability', sow)}
                        className={`flex items-center px-4 py-2 rounded-xl border text-xs cursor-pointer ${
                          formData.sowApplicability === sow
                            ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                            : 'border-slate-800 bg-[#0A0814] text-slate-300'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
                          formData.sowApplicability === sow ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                        }`} />
                        {sow}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Navigation Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-800 mt-8">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-[#CBD5E1] hover:text-white text-xs font-bold rounded-full transition"
                    >
                      ← Back
                    </button>
                    <span className="text-xs text-slate-400">
                      <span className="text-[#E01A8A]">*</span> All required fields must be filled
                    </span>
                  </div>

                  {currentSection === 'pipeline_dossier' ? (
                    <button
                      type="button"
                      disabled={!isDossierValid()}
                      onClick={handleContinueToDemand}
                      className={`w-full sm:w-auto px-8 py-3 rounded-full text-xs font-bold transition-all ${
                        isDossierValid()
                          ? 'bg-[#00F0FF] text-[#05050A] shadow-[0_0_20px_rgba(0,240,255,0.5)] hover:scale-105 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      Continue to Demand Details →
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!isDossierValid() || submitting}
                      onClick={handleSubmit}
                      className={`w-full sm:w-auto px-10 py-3 rounded-full text-xs font-semibold transition-all ${
                        isDossierValid() && !submitting
                          ? 'bg-gradient-to-r from-[#E01A8A] to-[#9000FF] text-white shadow-[0_0_20px_rgba(224,26,138,0.4)] hover:scale-105 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAGE 2: DEMAND CREATION REQUEST (29 FIELDS WITH AUTO-SYNCED BANNER) */}
          {/* ========================================================================= */}
          {(currentSection === 2 || currentSection === 'pipeline_demand') && (
            <div>
              <div className="bg-gradient-to-r from-[#00F0FF] to-[#0090FF] px-8 py-5 flex items-center justify-between text-[#05050A]">
                <div>
                  <h2 className="text-2xl font-bold tracking-wide">
                    {currentSection === 'pipeline_demand' ? 'STAGE 2: Demand Creation Request' : 'Demand Creation Request'}
                  </h2>
                  <p className="text-sm font-semibold opacity-90 mt-1">
                    Fill in the below details in case of new demand creation
                  </p>
                </div>
                {currentSection === 'pipeline_demand' && (
                  <span className="text-xs bg-black/15 text-[#05050A] px-3 py-1.5 rounded-full font-extrabold">
                    Sequential Step 2 of 2
                  </span>
                )}
              </div>

              {/* Seamless Cascaded Context Banner */}
              {currentSection === 'pipeline_demand' && (
                <div className="mx-8 mt-6 p-4 bg-[#0D0B18] border border-[#00F0FF]/40 rounded-xl flex items-center justify-between shadow-inner">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 block tracking-wider uppercase">
                      CASCADED PROJECT CONTEXT
                    </span>
                    <span className="text-sm font-mono text-[#00F0FF] font-bold">
                      {formData.projectGroup} → {formData.projectName}
                    </span>
                  </div>
                  <span className="text-xs text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 rounded-full font-semibold">
                    ✓ Auto-Synced from Dossier
                  </span>
                </div>
              )}

              {/* 4 Logical Subtabs */}
              <div className="bg-[#0D0B18] border-b border-slate-800 px-6 pt-3 mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                {[
                  { id: 1, label: '1. Project & Demand Context' },
                  { id: 2, label: '2. Role & Skills' },
                  { id: 3, label: '3. Timelines & Commercials' },
                  { id: 4, label: '4. Conditional Details' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDemandTab(tab.id)}
                    className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer ${
                      activeDemandTab === tab.id
                        ? 'bg-[#161224] text-[#00F0FF] border-t-2 border-[#00F0FF] font-bold'
                        : 'text-slate-400 hover:text-white bg-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8 space-y-8">
                
                {/* SUBSECTION 1: PROJECT & DEMAND CONTEXT */}
                {activeDemandTab === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#00F0FF] border-b border-slate-800 pb-2">
                      1. Project & Demand Context
                    </h3>

                    {/* Only show selector if not in combined pipeline */}
                    {currentSection !== 'pipeline_demand' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Project Group <span className="text-[#E01A8A]">*</span>
                          </label>
                          <select
                            value={formData.projectGroup}
                            onChange={(e) => handleChange('projectGroup', e.target.value)}
                            className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-3 text-white focus:border-[#00F0FF] outline-none text-xs"
                          >
                            <option value="">Select Project Group</option>
                            {masterProjectGroups.map(g => (
                              <option key={g} value={g} className="bg-[#161224]">{g}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-200 mb-2">
                            Project Name <span className="text-[#E01A8A]">*</span>
                          </label>
                          <select
                            value={formData.projectName}
                            onChange={(e) => handleChange('projectName', e.target.value)}
                            className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-3 text-white focus:border-[#00F0FF] outline-none text-xs"
                          >
                            <option value="">Select Project Name</option>
                            {masterProjectNames.map(p => (
                              <option key={p} value={p} className="bg-[#161224]">{p}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Client Requestor Name <span className="text-[#E01A8A]">*</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Type client requestor name..."
                        value={formData.clientRequestorName}
                        onChange={(e) => handleChange('clientRequestorName', e.target.value)}
                        className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-3 text-white focus:border-[#00F0FF] outline-none text-xs placeholder-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Demand Type <span className="text-[#E01A8A]">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {[
                          'New',
                          'Replacement',
                          'Replacement - POP',
                          'Investment - Delivery',
                          'Investment - Technical Delivery'
                        ].map((type) => (
                          <label
                            key={type}
                            onClick={() => handleChange('demandType', type)}
                            className={`flex items-center p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                              formData.demandType === type
                                ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                                : 'border-slate-800 bg-[#0A0814] text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full border mr-2.5 flex items-center justify-center ${
                              formData.demandType === type ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                            }`} />
                            <span className="truncate">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2"># of Positions</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.numPositions}
                          onChange={(e) => handleChange('numPositions', e.target.value)}
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-3 text-white focus:border-[#00F0FF] outline-none text-xs"
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">More than 1 Demand Request</label>
                        <p className="text-[11px] text-slate-400 mb-2">
                          (Sample: A1: 3, A2: 3, L1: 1, L2: 1, M1: 0, M2: 0, AD+: 0)
                        </p>
                        <textarea
                          rows={2}
                          value={formData.moreThanOneDemand}
                          onChange={(e) => handleChange('moreThanOneDemand', e.target.value)}
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-2.5 text-white focus:border-[#00F0FF] outline-none text-xs placeholder-slate-600"
                          placeholder="A1: 0, A2: 0..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveDemandTab(2)}
                        className="px-6 py-2.5 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-xs font-bold rounded-full hover:bg-[#00F0FF] hover:text-[#05050A] transition"
                      >
                        Continue to Role & Skills →
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBSECTION 2: ROLES & SKILLS */}
                {activeDemandTab === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#00F0FF] border-b border-slate-800 pb-2">
                      2. Role & Skill Requirements
                    </h3>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-200">
                          Roles <span className="text-[#E01A8A]">*</span>
                        </label>
                        <span className="text-xs text-slate-400">
                          (Choose from multiple choices for FP projects)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2 min-h-[36px] p-2 bg-[#0A0814] border border-slate-800 rounded-xl">
                        {formData.selectedRoles.length === 0 ? (
                          <span className="text-xs text-slate-500 italic">No roles selected yet. Type to search and select below...</span>
                        ) : (
                          formData.selectedRoles.map(role => (
                            <span
                              key={role}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF] rounded-lg text-xs font-medium"
                            >
                              {role}
                              <button
                                type="button"
                                onClick={() => handleToggleRole(role)}
                                className="text-white hover:text-[#E01A8A] font-bold"
                              >
                                ✕
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search & Select from 40+ Roles (e.g., Data Engineer, Lead Data Scientist)..."
                          value={roleSearchTerm}
                          onFocus={() => setIsRoleDropdownOpen(true)}
                          onChange={(e) => {
                            setRoleSearchTerm(e.target.value);
                            setIsRoleDropdownOpen(true);
                          }}
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-3 text-white focus:border-[#00F0FF] outline-none text-xs"
                        />

                        {isRoleDropdownOpen && (
                          <div className="absolute z-20 w-full mt-2 bg-[#161224] border border-slate-700 rounded-xl shadow-2xl max-h-56 overflow-y-auto p-2">
                            <div className="flex justify-between items-center px-2 py-1 text-[11px] text-slate-400 border-b border-slate-700">
                              <span>Showing {filteredRoles.length} matching roles</span>
                              <button
                                type="button"
                                onClick={() => setIsRoleDropdownOpen(false)}
                                className="text-[#00F0FF] font-semibold"
                              >
                                Close
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-2">
                              {filteredRoles.map(role => {
                                const isChecked = formData.selectedRoles.includes(role);
                                return (
                                  <label
                                    key={role}
                                    onClick={() => handleToggleRole(role)}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer ${
                                      isChecked ? 'bg-[#00F0FF]/15 text-[#00F0FF]' : 'hover:bg-slate-800 text-slate-200'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {}}
                                      className="accent-[#00F0FF]"
                                    />
                                    <span className="truncate">{role}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Stream</label>
                      <select
                        value={formData.stream}
                        onChange={(e) => handleChange('stream', e.target.value)}
                        className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-3 text-white focus:border-[#00F0FF] outline-none text-xs"
                      >
                        <option value="">Select Stream</option>
                        {masterStreamsList.map(s => (
                          <option key={s} value={s} className="bg-[#161224]">{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Primary Skills (Must-have)</label>
                        <p className="text-xs text-[#00F0FF] mb-2">Example: Python, PySpark, Databricks</p>
                        <textarea
                          rows={2}
                          value={formData.primarySkills}
                          onChange={(e) => handleChange('primarySkills', e.target.value)}
                          placeholder="Type primary skills..."
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-3 text-white focus:border-[#00F0FF] outline-none text-xs placeholder-slate-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-1">Secondary Skills (Good-to-have)</label>
                        <p className="text-xs text-[#00F0FF] mb-2">Example: Excel, SQL, Program Management</p>
                        <textarea
                          rows={2}
                          value={formData.secondarySkills}
                          onChange={(e) => handleChange('secondarySkills', e.target.value)}
                          placeholder="Type secondary skills..."
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-3 text-white focus:border-[#00F0FF] outline-none text-xs placeholder-slate-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Job Description Upload</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0A0814] border border-dashed border-slate-700 p-4 rounded-xl">
                        <input
                          type="file"
                          id="jd-input-pipeline"
                          className="hidden"
                          onChange={(e) => handleChange('jobDescriptionName', e.target.files[0]?.name || '')}
                        />
                        <label
                          htmlFor="jd-input-pipeline"
                          className="px-5 py-2.5 bg-gradient-to-r from-[#E01A8A] to-[#9000FF] hover:scale-105 text-white rounded-full font-semibold text-xs cursor-pointer transition shadow-md"
                        >
                          + Add File
                        </label>
                        <span className="text-xs text-slate-300">
                          {formData.jobDescriptionName ? (
                            <strong className="text-[#00F0FF]">{formData.jobDescriptionName}</strong>
                          ) : (
                            'Upload supporting PDF/DOC (Max 100 MB)'
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveDemandTab(1)}
                        className="px-5 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                      >
                        ← Back to Context
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDemandTab(3)}
                        className="px-6 py-2.5 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-xs font-bold rounded-full hover:bg-[#00F0FF] hover:text-[#05050A] transition"
                      >
                        Continue to Timelines & Commercials →
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBSECTION 3: TIMELINES & COMMERCIALS */}
                {activeDemandTab === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#00F0FF] border-b border-slate-800 pb-2">
                      3. Timelines, Priority & Commercials
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Customer Requested Date</label>
                        <input
                          type="date"
                          value={formData.customerRequestedDate}
                          onChange={(e) => handleChange('customerRequestedDate', e.target.value)}
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-2.5 text-white focus:border-[#00F0FF] outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Fulfillment Date</label>
                        <input
                          type="date"
                          value={formData.customerExpectedFulfillmentDate}
                          onChange={(e) => handleChange('customerExpectedFulfillmentDate', e.target.value)}
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-2.5 text-white focus:border-[#00F0FF] outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Demand Start Date <span className="text-[#00F0FF] text-[10px]">(≥ 2 wks)</span>
                        </label>
                        <input
                          type="date"
                          value={formData.demandStartDate}
                          onChange={(e) => handleChange('demandStartDate', e.target.value)}
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-2.5 text-white focus:border-[#00F0FF] outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Demand End Date</label>
                        <input
                          type="date"
                          value={formData.demandEndDate}
                          onChange={(e) => handleChange('demandEndDate', e.target.value)}
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-2.5 text-white focus:border-[#00F0FF] outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Billing Start Date</label>
                        <input
                          type="date"
                          value={formData.billingStartDate}
                          onChange={(e) => handleChange('billingStartDate', e.target.value)}
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-2.5 text-white focus:border-[#00F0FF] outline-none text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">Priority</label>
                        <div className="flex flex-wrap gap-3">
                          {['P1 - Existing SOW', 'P2 - SOW in Progress', 'P3 - RFP / Outreach'].map(p => (
                            <label
                              key={p}
                              onClick={() => handleChange('priority', p)}
                              className={`flex items-center px-3 py-2 rounded-xl border text-xs cursor-pointer transition ${
                                formData.priority === p
                                  ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-white font-semibold'
                                  : 'border-slate-800 bg-[#0A0814] text-slate-300'
                              }`}
                            >
                              <span className={`w-3 h-3 rounded-full border mr-2 flex items-center justify-center ${
                                formData.priority === p ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                              }`} />
                              {p}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">Probability</label>
                        <div className="flex gap-3">
                          {['25%', '50%', '75%', '100%'].map(prob => (
                            <label
                              key={prob}
                              onClick={() => handleChange('probability', prob)}
                              className={`flex-1 text-center py-2 rounded-xl border text-xs cursor-pointer font-bold transition ${
                                formData.probability === prob
                                  ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF]'
                                  : 'border-slate-800 bg-[#0A0814] text-slate-400'
                              }`}
                            >
                              {prob}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Bill Rate</label>
                      <div className="flex flex-wrap items-center gap-3">
                        {['28', '30', '32', '35', '36', 'Other'].map(rate => (
                          <label
                            key={rate}
                            onClick={() => handleChange('billRate', rate)}
                            className={`px-4 py-2 rounded-xl border text-xs cursor-pointer font-medium transition ${
                              formData.billRate === rate
                                ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold'
                                : 'border-slate-800 bg-[#0A0814] text-slate-300'
                            }`}
                          >
                            {rate === 'Other' ? 'Other' : `$${rate}`}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-slate-800">
                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-2">
                          Client Interview <span className="text-[#E01A8A]">*</span>
                        </label>
                        <div className="flex gap-4">
                          {['Yes', 'No'].map(val => (
                            <label
                              key={val}
                              onClick={() => handleChange('clientInterview', val)}
                              className="flex items-center text-xs text-slate-300 cursor-pointer"
                            >
                              <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
                                formData.clientInterview === val ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                              }`} />
                              {val}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-2">
                          Is SOW Active? <span className="text-[#E01A8A]">*</span>
                        </label>
                        <div className="flex gap-4">
                          {['Yes', 'No'].map(val => (
                            <label
                              key={val}
                              onClick={() => handleChange('isSowActive', val)}
                              className="flex items-center text-xs text-slate-300 cursor-pointer"
                            >
                              <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
                                formData.isSowActive === val ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                              }`} />
                              {val}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-200 mb-2">
                          Contractor Allowed <span className="text-[#E01A8A]">*</span>
                        </label>
                        <div className="flex gap-4">
                          {['Yes', 'No'].map(val => (
                            <label
                              key={val}
                              onClick={() => handleChange('contractorAllowed', val)}
                              className="flex items-center text-xs text-slate-300 cursor-pointer"
                            >
                              <span className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
                                formData.contractorAllowed === val ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                              }`} />
                              {val}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveDemandTab(2)}
                        className="px-5 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                      >
                        ← Back to Roles
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDemandTab(4)}
                        className="px-6 py-2.5 bg-[#00F0FF]/15 border border-[#00F0FF] text-[#00F0FF] text-xs font-bold rounded-full hover:bg-[#00F0FF] hover:text-[#05050A] transition"
                      >
                        Continue to Conditional Details →
                      </button>
                    </div>
                  </div>
                )}

                {/* SUBSECTION 4: CONDITIONAL DETAILS */}
                {activeDemandTab === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#00F0FF] border-b border-slate-800 pb-2">
                      4. Conditional Details (Investment / Replacement)
                    </h3>

                    <div className={`p-4 rounded-2xl border transition-all ${
                      isInvestmentDemand ? 'border-[#00F0FF] bg-[#00F0FF]/5' : 'border-slate-800 bg-[#0A0814]/40 opacity-70'
                    }`}>
                      <h4 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider mb-2">
                        Investment Details {isInvestmentDemand && '★'}
                      </h4>
                      <p className="text-[11px] text-slate-400 mb-3">(Applicable only for Investment requests)</p>
                      <textarea
                        rows={2}
                        value={formData.investmentBusinessCase}
                        onChange={(e) => handleChange('investmentBusinessCase', e.target.value)}
                        placeholder="Type business case justification..."
                        className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#00F0FF]"
                      />
                    </div>

                    <div className={`p-4 rounded-2xl border transition-all ${
                      isReplacementDemand ? 'border-[#E01A8A] bg-[#E01A8A]/5' : 'border-slate-800 bg-[#0A0814]/40 opacity-70'
                    }`}>
                      <h4 className="text-xs font-bold text-[#E01A8A] uppercase tracking-wider mb-2">
                        Replacement Details {isReplacementDemand && '★'}
                      </h4>
                      <p className="text-[11px] text-slate-400 mb-3">(Applicable only for Replacement demands)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={formData.replacementName}
                          onChange={(e) => handleChange('replacementName', e.target.value)}
                          placeholder="Resource Name"
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#E01A8A]"
                        />
                        <input
                          type="text"
                          value={formData.replacementEmpId}
                          onChange={(e) => handleChange('replacementEmpId', e.target.value)}
                          placeholder="Emp ID"
                          className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-[#E01A8A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-1">Additional Comments</label>
                      <textarea
                        rows={2}
                        value={formData.additionalComments}
                        onChange={(e) => handleChange('additionalComments', e.target.value)}
                        placeholder="Enter any additional notes..."
                        className="w-full bg-[#0A0814] border border-slate-800 rounded-xl p-3 text-white text-xs outline-none focus:border-[#00F0FF]"
                      />
                    </div>
                  </div>
                )}

                {/* Final Submission Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-800 mt-8">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-[#CBD5E1] hover:text-white text-xs font-bold rounded-full transition"
                    >
                      ← Back
                    </button>
                    <span className="text-xs text-slate-400">
                      <span className="text-[#E01A8A]">*</span> Generates single REQ-ID on submit
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={!isDemandValid() || submitting}
                    onClick={handleSubmit}
                    className={`w-full sm:w-auto px-10 py-3 rounded-full text-xs font-bold transition-all ${
                      isDemandValid() && !submitting
                        ? 'bg-gradient-to-r from-[#E01A8A] to-[#9000FF] text-white shadow-[0_0_20px_rgba(224,26,138,0.5)] hover:scale-105 hover:shadow-[0_0_30px_rgba(224,26,138,0.7)] cursor-pointer'
                        : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    {submitting ? 'Submitting...' : currentSection === 'pipeline_demand' ? 'Submit Full Request' : 'Submit Demand Request'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}