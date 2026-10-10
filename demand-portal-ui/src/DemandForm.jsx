import React, { useState } from 'react';
import {
  DOMAINS, SERVICES, PROJECT_GROUPS, PROJECT_NAMES, DEMAND_TYPES,
  ROLES_LIST, STREAMS, PRIORITIES, PROBABILITIES, BILL_RATES,
  REPLACEMENT_REASONS, NEW_PROJECT_GROUPS, DELIVERY_PARTNERS, CLIENT_PARTNERS
} from './constants';

export default function DemandForm({ currentUser, onSubmitted }) {
  const [currentSection, setCurrentSection] = useState(1);
  const [historyStack, setHistoryStack] = useState([1]);
  const [submitting, setSubmitting] = useState(false);
  const [dateError, setDateError] = useState('');

  const [formData, setFormData] = useState({
    requestorEmail: currentUser.email,
    domain: '', otherDomain: '', serviceRequired: '',
    projectGroup: '', projectName: '', clientRequestorName: currentUser.name, demandType: '',
    selectedRoles: [], otherRole: '', stream: '', primarySkills: '', secondarySkills: '',
    numPositions: '', jobDescriptionName: '',
    levelCounts: { A1: '', A2: '', L1: '', L2: '', M1: '', M2: '', ADPlus: '' },
    customerRequestedDate: '', customerExpectedFulfillmentDate: '', demandStartDate: '',
    demandEndDate: '', billingStartDate: '', priority: '', probability: '',
    billRate: '', otherBillRate: '', clientInterview: '', isSowActive: '', contractorAllowed: '',
    investmentBusinessCase: '', investmentFromDate: '', investmentToDate: '',
    replacementName: '', replacementEmpId: '', resourceIdentified: '',
    replacementReason: '', otherReplacementReason: '', additionalComments: '',
    newProjectCreationRequired: '',
    newProjectGroup: '', newProjectName: '', projectDescription: '', customer: '',
    currency: '', deliveryPartner: '', otherDeliveryPartner: '', clientPartner: '',
    otherClientPartner: '', techPartner: '', engineeringPartner: '', programType: '',
    billingType: '', projectTenure: '', sowApplicability: ''
  });

  const handleChange = (field, val) => setFormData(prev => ({ ...prev, [field]: val }));

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter(r => r !== role)
        : [...prev.selectedRoles, role]
    }));
  };

  const validateDates = () => {
    if (formData.customerRequestedDate && formData.demandStartDate) {
      const reqDate = new Date(formData.customerRequestedDate);
      const startDate = new Date(formData.demandStartDate);
      const diffDays = (startDate - reqDate) / (1000 * 3600 * 24);
      if (diffDays < 14) {
        setDateError('Demand Start Date must be at least 14 days after Customer Requested Date.');
        return false;
      }
    }
    setDateError('');
    return true;
  };

  // Dynamic Google Form Routing Logic
  const handleNext = () => {
    if (currentSection === 2 && !validateDates()) return;

    let next = currentSection;

    if (currentSection === 1) {
      if (formData.serviceRequired === 'Dossier Project Creation') next = 5;
      else next = 2;
    } 
    else if (currentSection === 2) {
      if (formData.demandType.includes('Investment')) next = 3;
      else if (formData.demandType.includes('Replacement')) next = 4;
      else if (formData.serviceRequired === 'Both') next = 5;
      else return handleSubmit();
    } 
    else if (currentSection === 3) {
      if (formData.demandType.includes('Replacement')) next = 4;
      else if (formData.serviceRequired === 'Both') next = 5;
      else return handleSubmit();
    } 
    else if (currentSection === 4) {
      if (formData.newProjectCreationRequired === 'Yes' || formData.serviceRequired === 'Both') next = 5;
      else return handleSubmit();
    } 
    else if (currentSection === 5) {
      return handleSubmit();
    }

    setHistoryStack(prev => [...prev, next]);
    setCurrentSection(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (historyStack.length > 1) {
      const updated = [...historyStack];
      updated.pop();
      setHistoryStack(updated);
      setCurrentSection(updated[updated.length - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      onSubmitted(result.requirement_id);
    } catch (err) {
      alert('Error submitting demand request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden font-sans">
      <div className="bg-blue-900 text-white p-6">
        <h2 className="text-2xl font-bold">Demand / Project Code Creation Form</h2>
        <p className="text-blue-200 text-xs mt-1">Logged in as {currentUser.name} ({currentUser.email})</p>
      </div>

      <div className="p-8 space-y-6">
        {dateError && <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold">{dateError}</div>}

        {/* SECTION 1 */}
        {currentSection === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Section 1 of 5: Demand/Project Code Creation Request</h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Domain *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {DOMAINS.map(d => (
                  <label key={d} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-slate-50 cursor-pointer text-xs">
                    <input type="radio" name="domain" value={d} checked={formData.domain === d} onChange={(e) => handleChange('domain', e.target.value)} />
                    <span>{d}</span>
                  </label>
                ))}
              </div>
              {formData.domain === 'Other' && (
                <input type="text" placeholder="Please specify domain..." value={formData.otherDomain} onChange={(e) => handleChange('otherDomain', e.target.value)} className="mt-2 w-full p-2 border rounded-lg text-xs" />
              )}
            </div>

            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-3">
              <p className="text-xs text-blue-900 font-medium">For raising demands in the system, kindly fill in the form.</p>
              <label className="block text-xs font-bold text-slate-800">Service Required *</label>
              <div className="space-y-2">
                {SERVICES.map(s => (
                  <label key={s} className="flex items-center gap-2 p-2 bg-white rounded-lg border cursor-pointer text-xs">
                    <input type="radio" name="serviceRequired" value={s} checked={formData.serviceRequired === s} onChange={(e) => handleChange('serviceRequired', e.target.value)} />
                    <span className="font-semibold text-slate-800">{s}</span>
                    {s === 'Dossier Project Creation' && <span className="text-slate-500 text-[10px]">(Routes to Section 5)</span>}
                    {s === 'Demand Creation' && <span className="text-slate-500 text-[10px]">(Routes to Section 2)</span>}
                    {s === 'Both' && <span className="text-slate-500 text-[10px]">(Full Pipeline)</span>}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2 */}
        {currentSection === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Section 2 of 5: Demand Creation Request</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Group *</label>
                <select value={formData.projectGroup} onChange={(e) => handleChange('projectGroup', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Project Group</option>
                  {PROJECT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name * (128 Options)</label>
                <select value={formData.projectName} onChange={(e) => handleChange('projectName', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Project Name</option>
                  {PROJECT_NAMES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client Requestor Name *</label>
                <input type="text" value={formData.clientRequestorName} onChange={(e) => handleChange('clientRequestorName', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Demand Type *</label>
                <select value={formData.demandType} onChange={(e) => handleChange('demandType', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Demand Type</option>
                  {DEMAND_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roles * (Choose multiple)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border p-3 rounded-lg bg-slate-50 text-xs">
                {ROLES_LIST.map(role => (
                  <label key={role} className="flex items-center gap-1.5">
                    <input type="checkbox" checked={formData.selectedRoles.includes(role)} onChange={() => handleRoleToggle(role)} />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stream *</label>
                <select value={formData.stream} onChange={(e) => handleChange('stream', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Stream</option>
                  {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1"># of Positions *</label>
                <input type="number" value={formData.numPositions} onChange={(e) => handleChange('numPositions', e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="Count" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Skills *</label>
                <input type="text" value={formData.primarySkills} onChange={(e) => handleChange('primarySkills', e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="Python, Databricks..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Secondary Skills *</label>
                <input type="text" value={formData.secondarySkills} onChange={(e) => handleChange('secondarySkills', e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="SQL, PowerBI..." />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Job Description Attachment *</label>
              <input type="file" onChange={(e) => handleChange('jobDescriptionName', e.target.files[0]?.name || '')} className="w-full text-xs p-2 border rounded-lg bg-slate-50" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border-t pt-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requested Date *</label>
                <input type="date" value={formData.customerRequestedDate} onChange={(e) => handleChange('customerRequestedDate', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Demand Start Date *</label>
                <input type="date" value={formData.demandStartDate} onChange={(e) => handleChange('demandStartDate', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
                <span className="text-[10px] text-amber-700">Must be ≥ 14 days after request date</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Billing Start Date *</label>
                <input type="date" value={formData.billingStartDate} onChange={(e) => handleChange('billingStartDate', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3 */}
        {currentSection === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Section 3 of 5: Investment Details</h3>
            <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">Applicable only for Investment demands.</p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Investment - Business Case *</label>
              <textarea value={formData.investmentBusinessCase} onChange={(e) => handleChange('investmentBusinessCase', e.target.value)} className="w-full p-2 border rounded-lg text-xs h-20" placeholder="Business justification..." />
            </div>
          </div>
        )}

        {/* SECTION 4 */}
        {currentSection === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Section 4 of 5: Resource to be Replaced</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resource Name *</label>
                <input type="text" value={formData.replacementName} onChange={(e) => handleChange('replacementName', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee ID *</label>
                <input type="text" value={formData.replacementEmpId} onChange={(e) => handleChange('replacementEmpId', e.target.value)} className="w-full p-2 border rounded-lg text-xs" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Project Creation Required *</label>
              <div className="flex gap-4 text-xs font-semibold">
                {['Yes', 'No'].map(v => (
                  <label key={v} className="flex items-center gap-1">
                    <input type="radio" name="newProjReq" value={v} checked={formData.newProjectCreationRequired === v} onChange={(e) => handleChange('newProjectCreationRequired', e.target.value)} /> {v}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5 */}
        {currentSection === 5 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Section 5 of 5: New Project Code Creation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Group_New *</label>
                <select value={formData.newProjectGroup} onChange={(e) => handleChange('newProjectGroup', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Group</option>
                  {NEW_PROJECT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Name_New *</label>
                <input type="text" value={formData.newProjectName} onChange={(e) => handleChange('newProjectName', e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="PEPSICO_..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Partner *</label>
                <select value={formData.deliveryPartner} onChange={(e) => handleChange('deliveryPartner', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Delivery Partner</option>
                  {DELIVERY_PARTNERS.map(dp => <option key={dp} value={dp}>{dp}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client Partner *</label>
                <select value={formData.clientPartner} onChange={(e) => handleChange('clientPartner', e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white">
                  <option value="">Select Client Partner</option>
                  {CLIENT_PARTNERS.map(cp => <option key={cp} value={cp}>{cp}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex justify-between border-t pt-5">
          {historyStack.length > 1 ? (
            <button type="button" onClick={handleBack} className="px-5 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300">← Back</button>
          ) : <div />}
          
          <button type="button" onClick={handleNext} disabled={submitting} className="px-6 py-2.5 bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg hover:bg-blue-800">
            {submitting ? 'Submitting...' : currentSection === 5 ? 'Submit Final Request' : 'Next Step →'}
          </button>
        </div>
      </div>
    </div>
  );
}