import React, { useState, useEffect, useMemo } from 'react';

// Production master ledger records
const masterDemands = [
  {
    id: 'REQ-2026-0142',
    demandId: 'R-000102',
    domain: 'Consumer & Commercial',
    projectName: 'PEPSICO_PBNA_MKT',
    submittedBy: 'Karthikeyan Jayaprakash',
    email: 'Sample@tigeranalytics.com',
    serviceRole: 'Demand: Lead Data Engineer',
    submittedOn: '12 Oct 2026',
    status: 'IN PROGRESS',
    notes: 'Awaiting candidate technical screening with CP.'
  },
  {
    id: 'REQ-2026-0141',
    demandId: 'R-000101',
    domain: 'Supply Chain (SC)',
    projectName: 'PEPSICO_CTO_SC_EDGE',
    submittedBy: 'Sarah Jenkins',
    email: 'sarah.j@tigeranalytics.com',
    serviceRole: 'Dossier Project Creation',
    submittedOn: '11 Oct 2026',
    status: 'COMPLETED',
    notes: 'Project code established in Dossier system.'
  },
  {
    id: 'REQ-2026-0140',
    demandId: '[Pending Input]',
    domain: 'AI Platforms',
    projectName: 'PEPSICO_AI_S&P_HUB',
    submittedBy: 'Karthikeyan Jayaprakash',
    email: 'Sample@tigeranalytics.com',
    serviceRole: 'Demand: Data Scientist (MLOps)',
    submittedOn: '10 Oct 2026',
    status: 'IN PROGRESS',
    notes: 'Client interview scheduled for 15 Oct 2026.'
  },
  {
    id: 'REQ-2026-0139',
    demandId: 'R-000099',
    domain: 'Finance',
    projectName: 'PEPSICO_HCM_PAYROLL',
    submittedBy: 'Elena Rostova',
    email: 'elena.r@tigeranalytics.com',
    serviceRole: 'Both: Full Pipeline',
    submittedOn: '09 Oct 2026',
    status: 'ACTION REQ',
    notes: 'SOW signature pending client partner review.'
  },
  {
    id: 'REQ-2026-0138',
    demandId: 'R-000098',
    domain: 'Data Platforms',
    projectName: 'PEPSICO_EDF_CORE',
    submittedBy: 'Michael Chen',
    email: 'michael.c@tigeranalytics.com',
    serviceRole: 'Demand: Azure BDE (2 FTE)',
    submittedOn: '08 Oct 2026',
    status: 'COMPLETED',
    notes: 'Onboarding finalized. Resource billing active.'
  },
  {
    id: 'REQ-2026-0137',
    demandId: '[Pending Input]',
    domain: 'Agro',
    projectName: 'PEPSICO_APAC_AGRO',
    submittedBy: 'Karthikeyan Jayaprakash',
    email: 'Sample@tigeranalytics.com',
    serviceRole: 'Demand: Full Stack Developer',
    submittedOn: '07 Oct 2026',
    status: 'OFFLINE F/U',
    notes: 'Requires PM assignment & APAC rate alignment.'
  },
  {
    id: 'REQ-2026-0136',
    demandId: 'R-000095',
    domain: 'ESG & EHS',
    projectName: 'PEPSICO_SUSTAINABILITY',
    submittedBy: 'Robert Miller',
    email: 'robert.m@tigeranalytics.com',
    serviceRole: 'Dossier Project Creation',
    submittedOn: '05 Oct 2026',
    status: 'COMPLETED',
    notes: 'Tenure approved for Mid Term Extensible.'
  }
];

export default function AdminDashboard({ currentUser }) {
  const [demands, setDemands] = useState(masterDemands);
  const [loading, setLoading] = useState(false);

  // Slicer States
  const [selectedDimension, setSelectedDimension] = useState('Filter By: Domain Wise');
  const [selectedValue, setSelectedValue] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Follow-up modal
  const [activeFollowUpItem, setActiveFollowUpItem] = useState(null);
  const [updateForm, setUpdateForm] = useState({ demandId: '', status: '', remarks: '' });

  const isAdmin = currentUser?.user_type === 'admin' || currentUser?.role === 'Portal Admin' || currentUser?.role === 'Super Admin';

  // Ingest live demands from backend
  useEffect(() => {
    const fetchDemands = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:8000/api/v1/demands');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((item, idx) => ({
              id: item.requirement_id || `REQ-2026-0${143 + idx}`,
              demandId: '[Pending Input]',
              domain: item.domain || 'Consumer & Commercial',
              projectName: item.project_name || item.new_project_name || 'PEPSICO_CTO',
              submittedBy: item.client_requestor_name || item.requestor_email || (currentUser?.name || 'Karthikeyan Jayaprakash'),
              email: item.requestor_email || currentUser?.email || 'Sample@tigeranalytics.com',
              serviceRole: item.service_required 
                ? `${item.service_required}: ${item.selected_roles?.join(', ') || 'Lead Engineer'}`
                : 'Demand Creation',
              submittedOn: item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '13 Oct 2026',
              status: item.status || 'IN PROGRESS',
              notes: item.additional_comments || 'Under active operational review.'
            }));

            setDemands(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const novel = mapped.filter(m => !existingIds.has(m.id));
              return [...novel, ...prev];
            });
          }
        }
      } catch (err) {
        console.warn('Backend offline; using local mock database:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDemands();
  }, [currentUser]);

  // Scope records strictly to current user if non-admin
  const scopedDemands = useMemo(() => {
    if (isAdmin) return demands;
    
    // For "My Requests": Filter exclusively to the logged-in employee
    const userEmail = (currentUser?.email || 'sample@tigeranalytics.com').toLowerCase();
    const userName = (currentUser?.name || 'karthikeyan').toLowerCase();

    return demands.filter(d => 
      (d.email && d.email.toLowerCase() === userEmail) ||
      (d.submittedBy && d.submittedBy.toLowerCase().includes(userName))
    );
  }, [demands, isAdmin, currentUser]);

  // Cascading values based on selected dimension
  const dimensionValues = useMemo(() => {
    if (selectedDimension === 'Filter By: Domain Wise') {
      return ['All', 'Consumer & Commercial', 'Supply Chain (SC)', 'Finance', 'AI Platforms', 'Data Platforms', 'Agro', 'ESG & EHS'];
    }
    if (selectedDimension === 'Filter By: Project Group') {
      return ['All', 'PEPSICO', 'MARS', 'MCDONALDS'];
    }
    if (selectedDimension === 'Filter By: Status') {
      return ['All', 'IN PROGRESS', 'COMPLETED', 'ACTION REQ', 'OFFLINE F/U', 'CANCELLED'];
    }
    return ['All'];
  }, [selectedDimension]);

  // Ensure selected value resets if it doesn't belong to the new dimension
  useEffect(() => {
    if (!dimensionValues.includes(selectedValue)) {
      setSelectedValue('All');
    }
  }, [selectedDimension, dimensionValues, selectedValue]);

  // Apply slicers & query search
  const filteredDemands = useMemo(() => {
    return scopedDemands.filter((item) => {
      let matchesSlicer = true;
      if (selectedValue !== 'All') {
        if (selectedDimension === 'Filter By: Domain Wise') {
          matchesSlicer = item.domain.toLowerCase().includes(selectedValue.toLowerCase());
        } else if (selectedDimension === 'Filter By: Project Group') {
          matchesSlicer = item.projectName.toLowerCase().includes(selectedValue.toLowerCase());
        } else if (selectedDimension === 'Filter By: Status') {
          matchesSlicer = item.status.toUpperCase() === selectedValue.toUpperCase();
        }
      }

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        item.id.toLowerCase().includes(query) ||
        item.demandId.toLowerCase().includes(query) ||
        item.submittedBy.toLowerCase().includes(query) ||
        item.projectName.toLowerCase().includes(query) ||
        item.serviceRole.toLowerCase().includes(query);

      return matchesSlicer && matchesSearch;
    });
  }, [scopedDemands, selectedDimension, selectedValue, searchQuery]);

  // Compute live KPI counters
  const totalCount = scopedDemands.length;
  const inProgressCount = scopedDemands.filter(d => d.status === 'IN PROGRESS' || d.status === 'ACTION REQ' || d.status === 'OFFLINE F/U').length;
  const completedCount = scopedDemands.filter(d => d.status === 'COMPLETED').length;
  const cancelledCount = scopedDemands.filter(d => d.status === 'CANCELLED').length;

  const handleOpenFollowUp = (record) => {
    setActiveFollowUpItem(record);
    setUpdateForm({
      demandId: record.demandId !== '[Pending Input]' ? record.demandId : '',
      status: record.status === 'COMPLETED' ? 'FULFILLED' : (record.status === 'IN PROGRESS' || record.status === 'ACTION REQ' || record.status === 'OFFLINE F/U') ? 'INPROGRESS' : record.status,
      remarks: record.notes || ''
    });
  };

  const handleSaveFollowUp = () => {
    if (!activeFollowUpItem) return;
    
    // Convert status back for internal storage if needed, or update to new standard
    const mappedStatus = updateForm.status === 'FULFILLED' ? 'COMPLETED' : updateForm.status === 'INPROGRESS' ? 'IN PROGRESS' : updateForm.status;

    setDemands(prev => prev.map(d => {
      if (d.id === activeFollowUpItem.id) {
        return { 
          ...d, 
          status: mappedStatus, 
          notes: updateForm.remarks,
          demandId: updateForm.demandId || '[Pending Input]'
        };
      }
      return d;
    }));
    setActiveFollowUpItem(null);
  };

  return (
    <div className="p-6 md:p-8 bg-[#F8FAFC] h-full overflow-y-auto w-full absolute inset-0">
      <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
        
        {/* Contrast Fixed Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] tracking-tight">
            {isAdmin ? 'Demand Management Portal' : 'My Requests'}
          </h1>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            {isAdmin 
              ? 'Admin / Partner Live Operations & Follow-up Hub' 
              : `Track status, timelines, and operational milestones for requests submitted by ${currentUser?.name || 'Karthikeyan Jayaprakash'}`}
          </p>
        </div>

        {/* Standardized KPI Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border-t-4 border-[#00F0FF] rounded-xl p-5 shadow-sm border-x border-b border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider">
              {isAdmin ? 'TOTAL' : 'MY TOTAL'}
            </span>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-[#0F172A]">{totalCount}</span>
              <span className="text-[10px] text-slate-400 mb-1.5 uppercase font-semibold">Active demands logged</span>
            </div>
          </div>

          <div className="bg-white border-t-4 border-emerald-400 rounded-xl p-5 shadow-sm border-x border-b border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider">FULFILLED</span>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-[#0F172A]">{completedCount}</span>
              <span className="text-[10px] text-slate-400 mb-1.5 uppercase font-semibold">Demand ID Mapped & Staffed</span>
            </div>
          </div>

          <div className="bg-white border-t-4 border-amber-400 rounded-xl p-5 shadow-sm border-x border-b border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider">INPROGRESS</span>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-[#0F172A]">{inProgressCount}</span>
              <span className="text-[10px] text-slate-400 mb-1.5 uppercase font-semibold">Under Review & Staffing</span>
            </div>
          </div>

          <div className="bg-white border-t-4 border-rose-400 rounded-xl p-5 shadow-sm border-x border-b border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider">CANCELLED</span>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-[#0F172A]">{cancelledCount}</span>
              <span className="text-[10px] text-slate-400 mb-1.5 uppercase font-semibold">Retracted / Archived</span>
            </div>
          </div>
        </div>

        {/* Cascading Slicers & Global Search */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap items-center gap-4 shadow-sm">
          <span className="text-[11px] font-bold text-[#E01A8A] tracking-wider uppercase min-w-[120px]">Filters & Slicing:</span>
          
          <select 
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#00F0FF] w-48 bg-white cursor-pointer"
          >
            <option value="Filter By: Domain Wise">Filter By: Domain Wise</option>
            <option value="Filter By: Project Group">Filter By: Project Group</option>
            <option value="Filter By: Status">Filter By: Status</option>
          </select>
          
          <select 
            value={selectedValue}
            onChange={(e) => setSelectedValue(e.target.value)}
            className="border border-[#00F0FF] bg-[#00F0FF]/5 rounded-lg px-3 py-2 text-xs font-bold text-[#0F172A] outline-none w-56 cursor-pointer"
          >
            {dimensionValues.map(val => (
              <option key={val} value={val}>
                {val === 'All' ? `Select: All` : val}
              </option>
            ))}
          </select>

          <input 
            type="text" 
            placeholder="Search REQ ID, DEMAND ID, Project, or Role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-xs outline-none focus:border-[#E01A8A] placeholder-slate-400"
          />
          
          <button className="bg-[#E01A8A] hover:bg-[#C91780] text-white px-6 py-2 rounded-lg text-xs font-bold transition shadow-sm">
            Apply Filter
          </button>
        </div>

        {/* Ledger Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#F1F5F9] border-b border-slate-200 text-slate-500 font-bold tracking-wider uppercase text-[10px]">
                <tr>
                  <th className="p-4">REQ ID</th>
                  <th className="p-4 text-[#E01A8A]">DEMAND ID *</th>
                  <th className="p-4">DOMAIN</th>
                  <th className="p-4">PROJECT NAME</th>
                  <th className="p-4">REQUESTER</th>
                  <th className="p-4">SERVICE / ROLE</th>
                  <th className="p-4">SUBMITTED ON</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-center">ACTION / LOG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDemands.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 italic">
                      {isAdmin ? 'No records matching filters.' : 'You have not submitted any demands matching these criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredDemands.map((row, idx) => {
                    const displayStatus = row.status === 'COMPLETED' ? 'FULFILLED' : (row.status === 'IN PROGRESS' || row.status === 'ACTION REQ' || row.status === 'OFFLINE F/U') ? 'INPROGRESS' : row.status;
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-mono font-semibold text-[#00F0FF] drop-shadow-sm cursor-pointer hover:underline" onClick={() => handleOpenFollowUp(row)}>
                          {row.id}
                        </td>
                        <td className={`p-4 font-mono font-bold ${row.demandId === '[Pending Input]' ? 'text-slate-400 italic font-normal' : 'text-[#0F172A]'}`}>
                          {row.demandId}
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{row.domain}</td>
                        <td className="p-4 font-bold text-slate-800">{row.projectName}</td>
                        <td className="p-4 text-slate-600">{row.submittedBy}</td>
                        <td className="p-4 text-slate-700 max-w-[200px] truncate" title={row.serviceRole}>{row.serviceRole}</td>
                        <td className="p-4 text-slate-500 font-mono text-[11px]">{row.submittedOn}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                            displayStatus === 'FULFILLED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            displayStatus === 'INPROGRESS' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {displayStatus}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleOpenFollowUp(row)} className="text-[#E01A8A] font-bold hover:underline text-xs">
                            Track Details →
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Xcelarate Track Details Modal - Dark Theme Blur */}
      {activeFollowUpItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#05050A] w-full max-w-lg rounded-2xl border border-[#00F0FF] shadow-[0_0_30px_rgba(0,240,255,0.15)] p-6 relative">
            
            <button onClick={() => setActiveFollowUpItem(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white font-bold text-lg leading-none transition">✕</button>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                Demand Details: {activeFollowUpItem.id}
                <span className="text-[9px] bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF] px-2 py-0.5 rounded font-black tracking-widest uppercase">Update Sync</span>
              </h3>
              <p className="text-slate-400 text-xs mt-1">{activeFollowUpItem.projectName} * {activeFollowUpItem.domain}</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Service & Role Scope</label>
                <div className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-3 text-xs text-slate-300">
                  {activeFollowUpItem.serviceRole}
                </div>
              </div>

              {isAdmin ? (
                <>
                  <div>
                    <label className="flex justify-between items-end text-xs font-bold text-[#E01A8A] mb-1.5">
                      <span>Xcelarate Demand ID *</span>
                      <span className="text-[10px] text-slate-500 font-normal">Mandatory - enter ID created in Xcelarate</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={updateForm.demandId}
                        onChange={(e) => setUpdateForm({...updateForm, demandId: e.target.value})}
                        placeholder="e.g. R-000101"
                        className="w-full bg-[#0F172A] border border-[#E01A8A] focus:ring-1 focus:ring-[#E01A8A] rounded-lg px-4 py-3 text-sm font-mono font-bold text-white outline-none transition"
                      />
                      <button className="absolute right-3 top-3 text-[10px] text-[#E01A8A] font-bold hover:text-white transition">
                        [Paste]
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Update Operational Status *</label>
                    <select 
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                      className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-3 text-xs font-bold text-amber-400 outline-none appearance-none cursor-pointer"
                    >
                      <option value="INPROGRESS">INPROGRESS</option>
                      <option value="FULFILLED">FULFILLED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Xcelarate Demand ID</label>
                      <div className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-3 text-sm font-mono font-bold text-[#00F0FF]">
                        {activeFollowUpItem.demandId}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Current Status</label>
                      <div className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-3 text-xs font-bold text-amber-400 uppercase tracking-wide">
                        {updateForm.status}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Operational Remarks / Notes</label>
                <textarea 
                  rows="2" 
                  disabled={!isAdmin}
                  value={updateForm.remarks}
                  onChange={(e) => setUpdateForm({...updateForm, remarks: e.target.value})}
                  placeholder="Type any internal notes here..."
                  className={`w-full bg-[#0F172A] border border-slate-700 rounded-lg px-4 py-3 text-xs text-white outline-none ${isAdmin ? 'focus:border-[#00F0FF]' : 'opacity-70'}`}
                ></textarea>
              </div>

              {/* Stakeholder Email Dispatch Block */}
              {isAdmin && (
                <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/50 rounded-lg p-4">
                  <h4 className="text-[11px] font-bold text-[#00F0FF] mb-1.5 uppercase tracking-wide">Automated Stakeholder Email Dispatch On Save</h4>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Upon saving, notification emails with Demand ID ({updateForm.demandId || '...'}) & status will be sent to:<br/>
                    <strong className="text-white">1. Requestor: {activeFollowUpItem.submittedBy} | 2. Delivery Partner | 3. Client Partner | 4. Staffing Ops</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button onClick={() => setActiveFollowUpItem(null)} className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 transition">
                {isAdmin ? 'Cancel' : 'Close'}
              </button>
              {isAdmin && (
                <button onClick={handleSaveFollowUp} className="px-6 py-2.5 bg-[#E01A8A] hover:bg-[#C91780] text-white rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(224,26,138,0.4)] transition">
                  Save & Notify
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}