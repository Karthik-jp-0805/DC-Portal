import React, { useState, useEffect, useMemo } from 'react';

// Production master ledger records
const masterDemands = [
  {
    id: 'REQ-2026-0142',
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
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Follow-up modal
  const [activeFollowUpItem, setActiveFollowUpItem] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [updatedNotes, setUpdatedNotes] = useState('');

  const isAdmin = currentUser?.user_type === 'admin' || currentUser?.role === 'Portal Admin';

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

  // Apply slicers & query search
  const filteredDemands = useMemo(() => {
    return scopedDemands.filter((item) => {
      const matchesDomain = selectedDomain === 'All' || item.domain.toLowerCase().includes(selectedDomain.toLowerCase());
      const matchesProject = selectedProject === 'All' || item.projectName.toLowerCase().includes(selectedProject.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || item.status.toUpperCase() === selectedStatus.toUpperCase();
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        item.id.toLowerCase().includes(query) ||
        item.submittedBy.toLowerCase().includes(query) ||
        item.projectName.toLowerCase().includes(query) ||
        item.serviceRole.toLowerCase().includes(query);

      return matchesDomain && matchesProject && matchesStatus && matchesSearch;
    });
  }, [scopedDemands, selectedDomain, selectedProject, selectedStatus, searchQuery]);

  // Compute live KPI counters
  const totalCount = scopedDemands.length;
  const inProgressCount = scopedDemands.filter(d => d.status === 'IN PROGRESS').length;
  const completedCount = scopedDemands.filter(d => d.status === 'COMPLETED').length;
  const followUpCount = scopedDemands.filter(d => d.status === 'OFFLINE F/U' || d.status === 'ACTION REQ').length;

  const handleOpenFollowUp = (record) => {
    setActiveFollowUpItem(record);
    setUpdatedStatus(record.status);
    setUpdatedNotes(record.notes || '');
  };

  const handleSaveFollowUp = () => {
    if (!activeFollowUpItem) return;
    setDemands(prev => prev.map(d => {
      if (d.id === activeFollowUpItem.id) {
        return { ...d, status: updatedStatus, notes: updatedNotes };
      }
      return d;
    }));
    setActiveFollowUpItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          {isAdmin ? 'Demand Management Portal' : 'My Requests'}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
          {isAdmin 
            ? 'Admin / Partner Live Operations & Follow-up Hub' 
            : `Track status, timelines, and operational milestones for requests submitted by ${currentUser?.name || 'Karthikeyan Jayaprakash'}`}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#120F1F] border-t-4 border-[#00F0FF] p-5 rounded-xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {isAdmin ? 'TOTAL DEMANDS LOGGED' : 'MY TOTAL REQUESTS'}
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-white">{totalCount}</span>
            <span className="text-xs text-slate-400 font-medium">Active in Portal</span>
          </div>
        </div>

        <div className="bg-[#120F1F] border-t-4 border-[#FFB800] p-5 rounded-xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">IN PROGRESS</div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-white">{inProgressCount}</span>
            <span className="text-xs text-slate-400 font-medium">Under active review</span>
          </div>
        </div>

        <div className="bg-[#120F1F] border-t-4 border-[#10B981] p-5 rounded-xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">COMPLETED / FULFILLED</div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-white">{completedCount}</span>
            <span className="text-xs text-slate-400 font-medium">SOW / Project Active</span>
          </div>
        </div>

        <div className="bg-[#120F1F] border-t-4 border-[#E01A8A] p-5 rounded-xl border border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {isAdmin ? 'PENDING OFFLINE FOLLOW-UP' : 'ACTION / OFFLINE LOG'}
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-black text-white">{followUpCount}</span>
            <span className="text-xs text-slate-400 font-medium">Milestone Pending</span>
          </div>
        </div>
      </div>

      {/* Slicers & High-Level Filters Bar */}
      <div className="bg-[#161224] border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-lg">
        <span className="text-xs font-bold text-[#00F0FF] tracking-wider uppercase whitespace-nowrap">
          FILTERS & SLICING:
        </span>

        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          className="bg-[#0A0814] border border-slate-700 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-[#00F0FF] cursor-pointer"
        >
          <option value="All">Domain: All Domains</option>
          <option value="Consumer & Commercial">Consumer & Commercial</option>
          <option value="Supply Chain">Supply Chain (SC)</option>
          <option value="Finance">Finance</option>
          <option value="AI Platforms">AI Platforms</option>
          <option value="Data Platforms">Data Platforms</option>
          <option value="Agro">Agro</option>
          <option value="ESG & EHS">ESG & EHS</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#0A0814] border border-slate-700 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-[#00F0FF] cursor-pointer"
        >
          <option value="All">Status: All Status</option>
          <option value="IN PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ACTION REQ">Action Required</option>
          <option value="OFFLINE F/U">Offline Follow-up</option>
        </select>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="🔍 Search Req ID, Project, or Role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0814] border border-slate-700 text-xs text-white rounded-lg px-3.5 py-2.5 outline-none focus:border-[#00F0FF] placeholder-slate-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#120F1F] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A152B] text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">REQ ID</th>
                <th className="py-4 px-6">DOMAIN</th>
                <th className="py-4 px-6">PROJECT NAME</th>
                <th className="py-4 px-6">REQUESTER</th>
                <th className="py-4 px-6">SERVICE REQUIRED / ROLE</th>
                <th className="py-4 px-6">SUBMITTED ON</th>
                <th className="py-4 px-6">STATUS</th>
                <th className="py-4 px-6 text-right">ACTION / LOG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredDemands.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {isAdmin ? 'No records matching filters.' : 'You have not submitted any demands matching these criteria.'}
                  </td>
                </tr>
              ) : (
                filteredDemands.map((row) => (
                  <tr key={row.id} className="hover:bg-[#161224] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#00F0FF] hover:underline cursor-pointer" onClick={() => handleOpenFollowUp(row)}>
                      {row.id}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-300">{row.domain}</td>
                    <td className="py-4 px-6 font-semibold text-white">{row.projectName}</td>
                    <td className="py-4 px-6 text-slate-300">{row.submittedBy}</td>
                    <td className="py-4 px-6 text-slate-300 max-w-xs truncate" title={row.serviceRole}>{row.serviceRole}</td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">{row.submittedOn}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                        row.status === 'COMPLETED'
                          ? 'border-[#10B981] text-[#10B981] bg-[#10B981]/15 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                          : row.status === 'IN PROGRESS'
                          ? 'border-[#FFB800] text-[#FFB800] bg-[#FFB800]/15 shadow-[0_0_8px_rgba(255,184,0,0.25)]'
                          : row.status === 'OFFLINE F/U'
                          ? 'border-[#00F0FF] text-[#00F0FF] bg-[#00F0FF]/15 shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                          : 'border-[#E01A8A] text-[#E01A8A] bg-[#E01A8A]/15 shadow-[0_0_8px_rgba(224,26,138,0.25)]'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenFollowUp(row)}
                        className="text-xs font-bold text-[#E01A8A] hover:text-[#00F0FF] transition-colors cursor-pointer"
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
      </div>

      {/* Modal for Details Tracking */}
      {activeFollowUpItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161224] border border-[#00F0FF]/50 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_40px_rgba(0,240,255,0.25)] space-y-5">
            <div className="flex justify-between items-center border-b border-slate-700/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Demand Details:</span>
                  <code className="text-[#00F0FF] font-mono">{activeFollowUpItem.id}</code>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeFollowUpItem.projectName} • {activeFollowUpItem.domain}</p>
              </div>
              <button onClick={() => setActiveFollowUpItem(null)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Service & Role Scope</label>
                <div className="p-2.5 bg-[#0A0814] rounded-lg text-slate-200 border border-slate-800">
                  {activeFollowUpItem.serviceRole}
                </div>
              </div>

              {isAdmin ? (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Update Operational Status</label>
                  <select
                    value={updatedStatus}
                    onChange={(e) => setUpdatedStatus(e.target.value)}
                    className="w-full bg-[#0A0814] border border-slate-700 rounded-lg p-2.5 text-white outline-none focus:border-[#00F0FF]"
                  >
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ACTION REQ">ACTION REQ</option>
                    <option value="OFFLINE F/U">OFFLINE F/U</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Current Status</label>
                  <div className="p-2.5 bg-[#0A0814] rounded-lg text-[#00F0FF] font-bold border border-slate-800">
                    {activeFollowUpItem.status}
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Operational Remarks / Notes</label>
                <textarea
                  rows={3}
                  disabled={!isAdmin}
                  value={updatedNotes}
                  onChange={(e) => setUpdatedNotes(e.target.value)}
                  placeholder="Notes from leadership..."
                  className={`w-full bg-[#0A0814] border border-slate-700 rounded-lg p-2.5 text-white outline-none ${isAdmin ? 'focus:border-[#00F0FF]' : 'opacity-70'}`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-700/60">
              <button
                type="button"
                onClick={() => setActiveFollowUpItem(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold text-xs"
              >
                Close
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleSaveFollowUp}
                  className="px-6 py-2 bg-gradient-to-r from-[#E01A8A] to-[#9000FF] hover:scale-105 text-white font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(224,26,138,0.4)] transition"
                >
                  Save Update
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}