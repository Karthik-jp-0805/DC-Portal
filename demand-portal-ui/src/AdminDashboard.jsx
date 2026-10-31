import React, { useState, useMemo } from 'react';

// Seed master demands with R-000101 standardized demand ID sequences
const INITIAL_DEMANDS = [
  {
    reqId: 'REQ-2026-0142',
    demandId: 'R-000102',
    domain: 'Consumer & Commercial',
    projectGroup: 'S&T - Data Platform',
    projectName: 'PEPSICO_PBNA_MKT',
    requesterName: 'Karthikeyan Jayaprakash',
    requesterEmail: 'karthikeyan.j@tigeranalytics.com',
    serviceRole: 'Lead Data Engineer',
    demandType: 'New',
    clientPartner: 'Abhishek Mishra',
    deliveryPartner: 'Naresh Kumar Nayak',
    programType: 'Managed Program',
    billingType: 'Fixed Price',
    submittedOn: '12 Oct 2026',
    status: 'INPROGRESS',
    operationalRemarks: 'Candidate technical screening scheduled with CP.'
  },
  {
    reqId: 'REQ-2026-0141',
    demandId: 'R-000101',
    domain: 'Supply Chain (SC)',
    projectGroup: 'PFNA',
    projectName: 'PEPSICO_CTO_SC_EDGE',
    requesterName: 'Sarah Jenkins',
    requesterEmail: 'sarah.j@tigeranalytics.com',
    serviceRole: 'Dossier Project Creation',
    demandType: 'New',
    clientPartner: 'Anu Narayan',
    deliveryPartner: 'Naresh Kumar Nayak',
    programType: 'COE',
    billingType: 'T&M',
    submittedOn: '11 Oct 2026',
    status: 'FULFILLED',
    operationalRemarks: 'Demand ID mapped in Xcelarate.'
  },
  {
    reqId: 'REQ-2026-0140',
    demandId: '',
    domain: 'AI Platforms',
    projectGroup: 'S&T - AI S&P',
    projectName: 'PEPSICO_AI_S&P_HUB',
    requesterName: 'David K. Vance',
    requesterEmail: 'david.v@tigeranalytics.com',
    serviceRole: 'Data Scientist (MLOps)',
    demandType: 'Replacement',
    clientPartner: 'Shravani N',
    deliveryPartner: 'Karthikeyan Jayaprakash',
    programType: 'Team Extension',
    billingType: 'Fixed Price',
    submittedOn: '10 Oct 2026',
    status: 'INPROGRESS',
    operationalRemarks: ''
  },
  {
    reqId: 'REQ-2026-0139',
    demandId: 'R-000103',
    domain: 'Finance',
    projectGroup: 'EUROPE',
    projectName: 'PEPSICO_HCM_PAYROLL',
    requesterName: 'Elena Rostova',
    requesterEmail: 'elena.r@tigeranalytics.com',
    serviceRole: 'Both: Full Pipeline',
    demandType: 'Investment - Delivery',
    clientPartner: 'Graham',
    deliveryPartner: 'Naresh Kumar Nayak',
    programType: 'Managed Program',
    billingType: 'Retainer',
    submittedOn: '09 Oct 2026',
    status: 'CANCELLED',
    operationalRemarks: 'Cancelled due to budget redistribution.'
  },
  {
    reqId: 'REQ-2026-0138',
    demandId: 'R-000104',
    domain: 'Data Platforms',
    projectGroup: 'S&T - EDF',
    projectName: 'PEPSICO_EDF_CORE',
    requesterName: 'Michael Chen',
    requesterEmail: 'michael.c@tigeranalytics.com',
    serviceRole: 'Azure BDE (2 FTE)',
    demandType: 'New',
    clientPartner: 'Abhishek Mishra',
    deliveryPartner: 'Naresh Kumar Nayak',
    programType: 'Managed Program',
    billingType: 'Fixed Price',
    submittedOn: '08 Oct 2026',
    status: 'FULFILLED',
    operationalRemarks: 'Onboarding complete.'
  },
  {
    reqId: 'REQ-2026-0137',
    demandId: '',
    domain: 'Agro',
    projectGroup: 'PFNA',
    projectName: 'PEPSICO_APAC_AGRO',
    requesterName: 'Priya Sharma',
    requesterEmail: 'priya.s@tigeranalytics.com',
    serviceRole: 'Full Stack Developer',
    demandType: 'New',
    clientPartner: 'Anu Narayan',
    deliveryPartner: 'Karthikeyan Jayaprakash',
    programType: 'Team Extension',
    billingType: 'T&M',
    submittedOn: '07 Oct 2026',
    status: 'INPROGRESS',
    operationalRemarks: ''
  },
  {
    reqId: 'REQ-2026-0136',
    demandId: 'R-000105',
    domain: 'ESG & EHS',
    projectGroup: 'GLOBAL',
    projectName: 'PEPSICO_SUSTAINABILITY',
    requesterName: 'Robert Miller',
    requesterEmail: 'robert.m@tigeranalytics.com',
    serviceRole: 'Dossier Project Creation',
    demandType: 'New',
    clientPartner: 'Abhishek Mishra',
    deliveryPartner: 'Naresh Kumar Nayak',
    programType: 'Managed Program',
    billingType: 'Fixed Price',
    submittedOn: '05 Oct 2026',
    status: 'FULFILLED',
    operationalRemarks: 'Dossier creation approved.'
  }
];

export default function AdminDashboard({ currentUser }) {
  const [demands, setDemands] = useState(INITIAL_DEMANDS);
  const [activeTrackModal, setActiveTrackModal] = useState(null);

  // 8 Dimensions Slicer State
  const [filterCategory, setFilterCategory] = useState('Project Group');
  const [filterValue, setFilterValue] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Slicer mapping dictionary for all 8 requested dimensions
  const cascadingOptionsMap = useMemo(() => ({
    'Domain': Array.from(new Set(demands.map(d => d.domain).filter(Boolean))),
    'Project Group': Array.from(new Set(demands.map(d => d.projectGroup).filter(Boolean))),
    'Project Name': Array.from(new Set(demands.map(d => d.projectName).filter(Boolean))),
    'Demand Type': Array.from(new Set(demands.map(d => d.demandType).filter(Boolean))),
    'Client Partner': Array.from(new Set(demands.map(d => d.clientPartner).filter(Boolean))),
    'Delivery Partner': Array.from(new Set(demands.map(d => d.deliveryPartner).filter(Boolean))),
    'Program Type': Array.from(new Set(demands.map(d => d.programType).filter(Boolean))),
    'Billing Type': Array.from(new Set(demands.map(d => d.billingType).filter(Boolean))),
  }), [demands]);

  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value);
    setFilterValue('All');
  };

  // Filtered dataset application
  const filteredDemands = useMemo(() => {
    return demands.filter((d) => {
      let matchesCategory = true;
      if (filterValue !== 'All') {
        switch (filterCategory) {
          case 'Domain': matchesCategory = d.domain === filterValue; break;
          case 'Project Group': matchesCategory = d.projectGroup === filterValue; break;
          case 'Project Name': matchesCategory = d.projectName === filterValue; break;
          case 'Demand Type': matchesCategory = d.demandType === filterValue; break;
          case 'Client Partner': matchesCategory = d.clientPartner === filterValue; break;
          case 'Delivery Partner': matchesCategory = d.deliveryPartner === filterValue; break;
          case 'Program Type': matchesCategory = d.programType === filterValue; break;
          case 'Billing Type': matchesCategory = d.billingType === filterValue; break;
          default: matchesCategory = true;
        }
      }

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        d.reqId.toLowerCase().includes(q) ||
        (d.demandId && d.demandId.toLowerCase().includes(q)) ||
        d.projectName.toLowerCase().includes(q) ||
        d.requesterName.toLowerCase().includes(q) ||
        d.serviceRole.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [demands, filterCategory, filterValue, searchQuery]);

  const kpis = useMemo(() => {
    return {
      total: demands.length,
      fulfilled: demands.filter(d => d.status === 'FULFILLED').length,
      inprogress: demands.filter(d => d.status === 'INPROGRESS').length,
      cancelled: demands.filter(d => d.status === 'CANCELLED').length,
    };
  }, [demands]);

  const handleSaveTrackDetails = (updated) => {
    setDemands(prev => prev.map(item => item.reqId === updated.reqId ? updated : item));
    setActiveTrackModal(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Demand Management Portal
        </h1>
        <p className="text-sm font-medium text-[#475569]">
          Admin / Partner Live Operations & Follow-up Hub
        </p>
      </div>

      {/* 4 Standardized KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-t-4 border-[#00F0FF] p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</div>
          <div className="text-3xl font-extrabold text-[#0F172A] mt-2">{kpis.total}</div>
          <div className="text-xs text-slate-400 mt-1">Active Demands Logged</div>
        </div>

        <div className="bg-white border-t-4 border-[#10B981] p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfilled</div>
          <div className="text-3xl font-extrabold text-[#10B981] mt-2">{kpis.fulfilled}</div>
          <div className="text-xs text-slate-400 mt-1">Demand ID Mapped & Staffed</div>
        </div>

        <div className="bg-white border-t-4 border-[#FFB800] p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inprogress</div>
          <div className="text-3xl font-extrabold text-[#FFB800] mt-2">{kpis.inprogress}</div>
          <div className="text-xs text-slate-400 mt-1">Under Review & Staffing</div>
        </div>

        <div className="bg-white border-t-4 border-[#EF4444] p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelled</div>
          <div className="text-3xl font-extrabold text-[#EF4444] mt-2">{kpis.cancelled}</div>
          <div className="text-xs text-slate-400 mt-1">Retracted / Archived</div>
        </div>
      </div>

      {/* 8 Dimensions Cascading Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
        <span className="text-xs font-extrabold text-[#E01A8A] uppercase tracking-wider">
          Filters & Slicing:
        </span>

        {/* 1st Filter: 8 Dimensions */}
        <select
          value={filterCategory}
          onChange={handleCategoryChange}
          className="bg-[#F8FAFC] border border-slate-300 text-xs font-semibold rounded-lg px-3 py-2 text-[#0F172A] outline-none focus:border-[#E01A8A] cursor-pointer"
        >
          <option value="Domain">Filter By: Domain</option>
          <option value="Project Group">Filter By: Project Group</option>
          <option value="Project Name">Filter By: Project Name</option>
          <option value="Demand Type">Filter By: Demand Type</option>
          <option value="Client Partner">Filter By: Client Partner</option>
          <option value="Delivery Partner">Filter By: Delivery Partner</option>
          <option value="Program Type">Filter By: Program Type</option>
          <option value="Billing Type">Filter By: Billing Type</option>
        </select>

        {/* 2nd Filter: Matched Values from Portal */}
        <select
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          className="bg-[#F0FDFA] border border-[#00F0FF] text-xs font-semibold rounded-lg px-3 py-2 text-[#0F172A] outline-none focus:ring-1 focus:ring-[#00F0FF] cursor-pointer"
        >
          <option value="All">All {filterCategory}s</option>
          {(cascadingOptionsMap[filterCategory] || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {/* Global Search */}
        <div className="flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search REQ ID, DEMAND ID, Project, or Role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-slate-300 text-xs rounded-lg px-3 py-2 text-[#0F172A] outline-none focus:border-[#00F0FF]"
          />
        </div>

        <button
          onClick={() => { setFilterValue('All'); setSearchQuery(''); }}
          className="px-4 py-2 bg-[#E01A8A] hover:bg-[#C91780] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Reset Filter
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#F1F5F9] text-slate-500 uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="py-4 px-5">REQ ID</th>
              <th className="py-4 px-5 text-[#E01A8A]">DEMAND ID *</th>
              <th className="py-4 px-5">Domain</th>
              <th className="py-4 px-5">Project Name</th>
              <th className="py-4 px-5">Requester</th>
              <th className="py-4 px-5">Service / Role</th>
              <th className="py-4 px-5">Submitted On</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Action / Log</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#0F172A]">
            {filteredDemands.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No demand records found matching criteria.
                </td>
              </tr>
            ) : (
              filteredDemands.map((row) => (
                <tr key={row.reqId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-[#00F0FF]">{row.reqId}</td>
                  <td className="py-4 px-5 font-mono font-bold">
                    {row.demandId ? (
                      <span className="text-[#0F172A]">{row.demandId}</span>
                    ) : (
                      <span className="text-[#E01A8A] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded text-[11px]">
                        [ Pending Input ]
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5">{row.domain}</td>
                  <td className="py-4 px-5 font-semibold text-slate-700">{row.projectName}</td>
                  <td className="py-4 px-5">{row.requesterName}</td>
                  <td className="py-4 px-5 text-slate-600">{row.serviceRole}</td>
                  <td className="py-4 px-5 text-slate-500">{row.submittedOn}</td>
                  <td className="py-4 px-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        row.status === 'FULFILLED'
                          ? 'border-[#10B981] text-[#10B981] bg-[#10B981]/10'
                          : row.status === 'INPROGRESS'
                          ? 'border-[#FFB800] text-[#FFB800] bg-[#FFB800]/10'
                          : 'border-[#EF4444] text-[#EF4444] bg-[#EF4444]/10'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => setActiveTrackModal(row)}
                      className="font-bold text-[#E01A8A] hover:text-[#00F0FF] transition-colors cursor-pointer"
                    >
                      Track Details →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Track Details (Cleaned UI, No Paste Button, Concise Notice) */}
      {activeTrackModal && (
        <TrackDetailsModal
          demand={activeTrackModal}
          onClose={() => setActiveTrackModal(null)}
          onSave={handleSaveTrackDetails}
        />
      )}

    </div>
  );
}

// Track Details Sub-Component
function TrackDetailsModal({ demand, onClose, onSave }) {
  const [demandIdInput, setDemandIdInput] = useState(demand.demandId || '');
  const [statusInput, setStatusInput] = useState(demand.status);
  const [remarksInput, setRemarksInput] = useState(demand.operationalRemarks || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = () => {
    if (!demandIdInput.trim()) {
      setErrorMsg('Xcelarate Demand ID is mandatory.');
      return;
    }

    onSave({
      ...demand,
      demandId: demandIdInput.trim(),
      status: statusInput,
      operationalRemarks: remarksInput.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-[#120F1F] border border-[#00F0FF] text-white w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-5">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Demand Details: <span className="text-[#00F0FF]">{demand.reqId}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {demand.projectName} • {demand.domain}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold">
            ✕
          </button>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Service & Role Scope
          </label>
          <div className="bg-[#0A0814] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300">
            {demand.serviceRole}
          </div>
        </div>

        {/* Xcelarate Demand ID (Cleaned Input, No Paste Button) */}
        <div>
          <label className="block text-xs font-bold text-[#E01A8A] mb-1">
            Xcelarate Demand ID <span className="text-[#E01A8A]">*</span>
          </label>
          <input
            type="text"
            placeholder="Type or enter Xcelarate Demand ID (e.g. R-000101)..."
            value={demandIdInput}
            onChange={(e) => {
              setDemandIdInput(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
            className={`w-full bg-[#161224] border ${
              errorMsg ? 'border-red-500' : 'border-[#E01A8A] focus:border-[#00F0FF]'
            } rounded-lg p-2.5 text-sm font-mono text-[#00F0FF] outline-none focus:ring-1 focus:ring-[#00F0FF] transition-all`}
          />
          {errorMsg && <p className="text-[11px] text-red-400 mt-1">{errorMsg}</p>}
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Update Operational Status *
          </label>
          <select
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            className="w-full bg-[#0A0814] border border-slate-700 rounded-lg p-2.5 text-xs font-semibold text-white outline-none focus:border-[#00F0FF]"
          >
            <option value="INPROGRESS">INPROGRESS</option>
            <option value="FULFILLED">FULFILLED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Operational Remarks / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Add update remarks..."
            value={remarksInput}
            onChange={(e) => setRemarksInput(e.target.value)}
            className="w-full bg-[#0A0814] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#00F0FF]"
          />
        </div>

        {/* Concise Stakeholder Notification Notice */}
        <div className="bg-[#08182B] border border-[#00F0FF]/40 rounded-xl p-3 text-xs">
          <div className="font-bold text-[#00F0FF] uppercase text-[10px] flex items-center gap-1.5">
            <span>ℹ</span> Stakeholder Automated Dispatch
          </div>
          <div className="text-white text-xs font-semibold mt-1">
            Every update you will be notifying the respective stakeholder
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-full bg-[#E01A8A] text-white text-xs font-bold hover:shadow-[0_0_15px_#E01A8A] transition-all cursor-pointer"
          >
            Save & Notify
          </button>
        </div>
      </div>
    </div>
  );
}