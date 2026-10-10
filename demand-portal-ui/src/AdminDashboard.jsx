import React, { useState, useEffect } from 'react';

export default function AdminDashboard({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [newStatus, setNewStatus] = useState('Completed');
  const [reason, setReason] = useState('');

  const fetchDemands = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/v1/demands', {
      headers: {
        'X-User-Type': currentUser.user_type,
        'X-User-Email': currentUser.email
      }
    })
      .then(res => res.json())
      .then(data => setRequests(data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDemands(); }, [currentUser]);

  const handleUpdateStatus = async () => {
    if (!reason) return alert('Please enter a reason for updating the status.');
    
    try {
      const res = await fetch(`http://localhost:8000/api/v1/demands/${selectedReq.requirement_id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason, updated_by: currentUser.name })
      });
      if (res.ok) {
        setSelectedReq(null);
        setReason('');
        fetchDemands();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // KPIs for PowerBI style dashboard
  const total = requests.length;
  const inProgress = requests.filter(r => r.overall_status === 'In Progress').length;
  const completed = requests.filter(r => r.overall_status === 'Completed').length;

  return (
    <div className="max-w-6xl mx-auto my-6 p-6 bg-white rounded-2xl shadow border border-slate-200 font-sans">
      
      {/* Dashboard Header */}
      <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Demand Request Dashboard</h2>
          <p className="text-xs text-slate-500">Live analytics for Requirement IDs and Status</p>
        </div>
      </div>

      {/* PowerBI Style KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">Total Demands</h3>
          <p className="text-3xl font-black text-blue-900">{total}</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">In Progress</h3>
          <p className="text-3xl font-black text-amber-900">{inProgress}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Completed</h3>
          <p className="text-3xl font-black text-emerald-900">{completed}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500 py-8 text-center">Loading live data...</p>
      ) : requests.length === 0 ? (
        <p className="text-xs text-slate-500 py-8 text-center bg-slate-50 rounded-xl border border-dashed">No demand requests logged yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b">
                <th className="p-3">Req ID</th>
                <th className="p-3">Service Type</th>
                <th className="p-3">Project / Group</th>
                <th className="p-3">Requestor</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">Status</th>
                {currentUser.user_type === 'admin' && <th className="p-3">Action</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.requirement_id} className="border-b hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-tiger-vivid">{r.requirement_id}</td>
                  <td className="p-3 font-semibold">{r.data.serviceRequired}</td>
                  <td className="p-3 text-slate-600">{r.data.projectName || r.data.newProjectName || 'N/A'}</td>
                  <td className="p-3">{r.data.clientRequestorName}</td>
                  <td className="p-3 text-slate-500">{r.submitted_at}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded font-bold text-[10px] uppercase tracking-wide ${r.overall_status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {r.overall_status}
                    </span>
                  </td>
                  {currentUser.user_type === 'admin' && (
                    <td className="p-3">
                      <button onClick={() => setSelectedReq(r)} className="px-3 py-1.5 bg-slate-800 hover:bg-black text-white rounded text-[10px] font-bold transition">
                        Update
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Update Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">Update Status: {selectedReq.requirement_id}</h3>
            <div>
              <label className="block text-xs font-bold mb-1">New Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full p-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-tiger-vivid">
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Audit Reason *</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 border rounded-lg text-xs h-20 focus:ring-2 focus:ring-tiger-vivid" placeholder="Mandatory explanation for status change..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedReq(null)} className="px-4 py-2 bg-slate-200 text-xs font-bold rounded-lg hover:bg-slate-300">Cancel</button>
              <button onClick={handleUpdateStatus} className="px-4 py-2 bg-tiger-vivid text-white text-xs font-bold rounded-lg hover:bg-fuchsia-900 shadow">Save Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}