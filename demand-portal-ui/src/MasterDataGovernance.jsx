import React, { useState } from 'react';

const AUTHORIZED_SUPER_ADMINS = [
  'SuperAdmin@tigeranalytics.com',
  'admin.lead@tigeranalytics.com',
  'ops.director@tigeranalytics.com',
];

const INITIAL_MASTER_DATA = [
  { id: 'PRJ-01', category: 'Project Name', name: 'PEPSICO_PBNA_MKT', associatedGroup: 'S&T - Data Platform', status: 'ACTIVE' },
  { id: 'PRJ-02', category: 'Project Name', name: 'PEPSICO_CTO_SC_EDGE', associatedGroup: 'Supply Chain (SC)', status: 'ACTIVE' },
  { id: 'PRJ-03', category: 'Project Name', name: 'PEPSICO_AI_S&P_HUB', associatedGroup: 'AI Platforms', status: 'ACTIVE' },
  { id: 'PRJ-04', category: 'Project Name', name: 'PEPSICO_HCM_PAYROLL', associatedGroup: 'Finance', status: 'ACTIVE' },
  { id: 'PRJ-05', category: 'Project Name', name: 'PEPSICO_EDF_CORE', associatedGroup: 'Data Platforms', status: 'ACTIVE' },
  { id: 'DOM-01', category: 'Domain', name: 'Consumer & Commercial (C&C)', status: 'ACTIVE' },
  { id: 'DOM-02', category: 'Domain', name: 'Supply Chain (SC)', status: 'ACTIVE' },
  { id: 'DOM-03', category: 'Domain', name: 'AI Platforms', status: 'ACTIVE' },
  { id: 'DOM-04', category: 'Domain', name: 'Finance', status: 'ACTIVE' },
  { id: 'ROL-01', category: 'Roles', name: 'Lead Data Engineer', status: 'ACTIVE' },
  { id: 'ROL-02', category: 'Roles', name: 'Data Scientist (MLOps)', status: 'ACTIVE' },
  { id: 'ROL-03', category: 'Roles', name: 'Full Stack Developer', status: 'ACTIVE' },
  { id: 'CP-01', category: 'Client Partner', name: 'Abhishek Mishra', status: 'ACTIVE' },
  { id: 'CP-02', category: 'Client Partner', name: 'Anu Narayan', status: 'ACTIVE' },
  { id: 'DP-01', category: 'Delivery Partner', name: 'Naresh Kumar Nayak', status: 'ACTIVE' },
  { id: 'DP-02', category: 'Delivery Partner', name: 'Karthikeyan Jayaprakash', status: 'ACTIVE' },
  { id: 'PROG-01', category: 'Program Type', name: 'Managed Program', status: 'ACTIVE' },
  { id: 'PROG-02', category: 'Program Type', name: 'COE', status: 'ACTIVE' },
  { id: 'PROG-03', category: 'Program Type', name: 'Team Extension', status: 'ACTIVE' },
  { id: 'BILL-01', category: 'Billing Type', name: 'Fixed Price', status: 'ACTIVE' },
  { id: 'BILL-02', category: 'Billing Type', name: 'T&M', status: 'ACTIVE' },
  { id: 'BILL-03', category: 'Billing Type', name: 'Retainer', status: 'ACTIVE' },
];

export default function MasterDataGovernance({ currentUser }) {
  const [masterData, setMasterData] = useState(INITIAL_MASTER_DATA);
  const [selectedEntity, setSelectedEntity] = useState('Project Name');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Form State
  const [entryName, setEntryName] = useState('');
  const [associatedGroup, setAssociatedGroup] = useState('S&T - Data Platform');
  const [justification, setJustification] = useState('');
  const [validationError, setValidationError] = useState('');

  const userEmail = currentUser?.email || 'SuperAdmin@tigeranalytics.com';
  const isAuthorized = AUTHORIZED_SUPER_ADMINS.includes(userEmail) || currentUser?.role === 'Super Admin';

  // 403 Forbidden Gate
  if (!isAuthorized) {
    return (
      <div className="p-8">
        <div className="bg-white border border-red-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-xl font-bold text-slate-800">403 - Access Forbidden</h2>
          <p className="text-xs text-slate-500">
            The Master Data configuration console is restricted strictly to designated Super
            Admins. Your current identity (<span className="font-mono text-slate-700">{userEmail}</span>) does not possess Level 0 privileges.
          </p>
        </div>
      </div>
    );
  }

  const visibleEntries = masterData.filter(item => item.category === selectedEntity);

  const openAddModal = () => {
    setEditingEntry(null);
    setEntryName('');
    setJustification('');
    setValidationError('');
    setIsModalOpen(true);
  };

  const openEditModal = (entry) => {
    setEditingEntry(entry);
    setEntryName(entry.name);
    setAssociatedGroup(entry.associatedGroup || 'S&T - Data Platform');
    setJustification(entry.justification || '');
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this master data entry?')) {
      setMasterData(prev => prev.filter(item => item.id !== id));
    }
  };

  // Pre-submission validation
  const handleSaveEntry = () => {
    const trimmed = entryName.trim();
    if (!trimmed) {
      setValidationError('Entry name cannot be empty.');
      return;
    }

    // Project Name must begin with PEPSICO_
    if (selectedEntity === 'Project Name' && !trimmed.startsWith('PEPSICO_')) {
      setValidationError('Project name must begin with PEPSICO_ (e.g., PEPSICO_CTO_GENAI)');
      return;
    }

    // Duplicate Check
    const isDuplicate = masterData.some(
      item => item.category === selectedEntity &&
        item.name.toLowerCase() === trimmed.toLowerCase() &&
        item.id !== editingEntry?.id
    );

    if (isDuplicate) {
      setValidationError(`An entry with name "${trimmed}" already exists in ${selectedEntity}.`);
      return;
    }

    if (editingEntry) {
      setMasterData(prev => prev.map(item =>
        item.id === editingEntry.id
          ? { ...item, name: trimmed, associatedGroup, justification }
          : item
      ));
    } else {
      const newEntry = {
        id: `ENT-${Date.now().toString().slice(-4)}`,
        category: selectedEntity,
        name: trimmed,
        associatedGroup: selectedEntity === 'Project Name' ? associatedGroup : undefined,
        status: 'ACTIVE',
        justification,
      };
      setMasterData(prev => [newEntry, ...prev]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Master Data Governance Hub
        </h1>
        <p className="text-sm font-medium text-[#475569]">
          Super Admin Console: Live Configuration for All Demand Portal Dropdown Entities
        </p>
      </div>

      {/* Entity Selector Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#E01A8A] uppercase tracking-wider">
            Select Master Data Entity:
          </label>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="bg-[#F8FAFC] border border-[#00F0FF] text-xs font-bold rounded-lg px-4 py-2 text-[#0F172A] outline-none cursor-pointer"
          >
            <option value="Project Name">Project Name (PEPSICO)</option>
            <option value="Project Group">Project Group</option>
            <option value="Domain">Domain</option>
            <option value="Roles">Roles</option>
            <option value="Streams & Tracks">Streams & Tracks</option>
            <option value="Client Partner">Client Partner</option>
            <option value="Delivery Partner">Delivery Partner</option>
            <option value="Program Type">Program Type</option>
            <option value="Billing Type">Billing Type</option>
          </select>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2 bg-[#E01A8A] text-white text-xs font-bold rounded-lg hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>+</span> Add Entry
        </button>
      </div>

      {/* Entity Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold uppercase text-slate-600">
            Active Entries for: <span className="text-[#0F172A]">{selectedEntity}</span>
          </span>
          <span className="text-xs text-slate-400">Total: {visibleEntries.length} Items</span>
        </div>

        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#F1F5F9] text-slate-500 uppercase font-bold border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-6">Entry ID</th>
              <th className="py-3.5 px-6">Entry Value / Name</th>
              {selectedEntity === 'Project Name' && <th className="py-3.5 px-6">Associated Group</th>}
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[#0F172A]">
            {visibleEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No records exist for this category. Click "+ Add Entry" to create one.
                </td>
              </tr>
            ) : (
              visibleEntries.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-[#00F0FF]">{row.id}</td>
                  <td className="py-3.5 px-6 font-semibold">{row.name}</td>
                  {selectedEntity === 'Project Name' && (
                    <td className="py-3.5 px-6 text-slate-500">{row.associatedGroup || '--'}</td>
                  )}
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500 text-emerald-600 bg-emerald-50">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right space-x-3">
                    <button
                      onClick={() => openEditModal(row)}
                      className="font-bold text-[#00F0FF] hover:underline cursor-pointer"
                    >
                      [Edit]
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(row.id)}
                      className="font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      [Delete]
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Validated Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-[#120F1F] border border-[#E01A8A] text-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">
                  {editingEntry ? 'Edit Entry' : '+ Add New Entry'}
                </h2>
                <p className="text-xs text-[#00F0FF] mt-0.5">Target Category: {selectedEntity}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {selectedEntity === 'Project Name' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Associated Project Group *
                </label>
                <select
                  value={associatedGroup}
                  onChange={(e) => setAssociatedGroup(e.target.value)}
                  className="w-full bg-[#0A0814] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#00F0FF]"
                >
                  <option value="S&T - Data Platform">S&T - Data Platform</option>
                  <option value="Supply Chain (SC)">Supply Chain (SC)</option>
                  <option value="AI Platforms">AI Platforms</option>
                  <option value="Finance">Finance</option>
                  <option value="Data Platforms">Data Platforms</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#E01A8A] mb-1">
                New Entry Value / Name *
              </label>
              <input
                type="text"
                placeholder={
                  selectedEntity === 'Project Name'
                    ? 'e.g., PEPSICO_CTO_GENAI'
                    : `Enter new ${selectedEntity} name...`
                }
                value={entryName}
                onChange={(e) => {
                  setEntryName(e.target.value);
                  if (validationError) setValidationError('');
                }}
                className={`w-full bg-[#0A0814] border ${
                  validationError ? 'border-red-500' : 'border-[#00F0FF]'
                } rounded-lg p-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-[#00F0FF]`}
              />
              {validationError && (
                <p className="text-[11px] text-red-400 mt-1 font-semibold">⚠ {validationError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Business Justification / Governance Note
              </label>
              <textarea
                rows={3}
                placeholder="Enter justification for audit log..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="w-full bg-[#0A0814] border border-slate-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div className="bg-[#08182B] border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400">
              <span className="text-[#00F0FF] font-bold">SUPER ADMIN AUDIT TRAIL LOGGING:</span>
              <div className="mt-0.5">Author: {userEmail} • Recorded on save</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-full border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEntry}
                className="px-6 py-2 rounded-full bg-[#E01A8A] text-white text-xs font-bold hover:shadow-[0_0_15px_#E01A8A] transition-all cursor-pointer"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}