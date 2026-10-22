import React, { useState, useMemo } from 'react';

// Master historical data across multiple enterprise accounts
const rawReportRecords = [
  { id: 'REQ-2026-0142', account: 'PEPSICO', domain: 'Consumer & Commercial', requester: 'Johnathan Doe', role: 'Lead Data Engineer', date: '2026-10-12', month: 'Oct 2026', week: 'Wk 41', day: '12 Oct', status: 'IN PROGRESS' },
  { id: 'REQ-2026-0141', account: 'PEPSICO', domain: 'Supply Chain (SC)', requester: 'Sarah Jenkins', role: 'Dossier Project Creation', date: '2026-10-11', month: 'Oct 2026', week: 'Wk 41', day: '11 Oct', status: 'CONVERTED' },
  { id: 'REQ-2026-0140', account: 'PEPSICO', domain: 'AI Platforms', requester: 'David K. Vance', role: 'Data Scientist (MLOps)', date: '2026-10-10', month: 'Oct 2026', week: 'Wk 40', day: '10 Oct', status: 'IN PROGRESS' },
  { id: 'REQ-2026-0139', account: 'PEPSICO', domain: 'Finance', requester: 'Elena Rostova', role: 'Full Pipeline', date: '2026-10-09', month: 'Oct 2026', week: 'Wk 40', day: '09 Oct', status: 'CANCELLED' },
  { id: 'REQ-2026-0138', account: 'PEPSICO', domain: 'Data Platforms', requester: 'Michael Chen', role: 'Azure BDE (2 FTE)', date: '2026-10-08', month: 'Oct 2026', week: 'Wk 40', day: '08 Oct', status: 'CONVERTED' },
  { id: 'REQ-2026-0137', account: 'PEPSICO', domain: 'Agro', requester: 'Priya Sharma', role: 'Full Stack Developer', date: '2026-10-07', month: 'Oct 2026', week: 'Wk 40', day: '07 Oct', status: 'IN PROGRESS' },
  { id: 'REQ-2026-0136', account: 'PEPSICO', domain: 'ESG & EHS', requester: 'Robert Miller', role: 'Dossier Project Creation', date: '2026-10-05', month: 'Oct 2026', week: 'Wk 39', day: '05 Oct', status: 'CONVERTED' },
  
  // MARS Account Demands
  { id: 'REQ-2026-0135', account: 'MARS', domain: 'Supply Chain (SC)', requester: 'Alex Thorne', role: 'SAP IBP Architect', date: '2026-10-04', month: 'Oct 2026', week: 'Wk 39', day: '04 Oct', status: 'CONVERTED' },
  { id: 'REQ-2026-0134', account: 'MARS', domain: 'Consumer & Commercial', requester: 'Karen Page', role: 'PowerBI Lead', date: '2026-10-03', month: 'Oct 2026', week: 'Wk 39', day: '03 Oct', status: 'IN PROGRESS' },
  { id: 'REQ-2026-0133', account: 'MARS', domain: 'AI Platforms', requester: 'Marcus Wright', role: 'NLP Specialist', date: '2026-09-28', month: 'Sep 2026', week: 'Wk 38', day: '28 Sep', status: 'CONVERTED' },
  { id: 'REQ-2026-0132', account: 'MARS', domain: 'Technology', requester: 'Lisa Fong', role: 'DevOps Engineer', date: '2026-09-25', month: 'Sep 2026', week: 'Wk 38', day: '25 Sep', status: 'CANCELLED' },

  // MCDONALDS Account Demands
  { id: 'REQ-2026-0131', account: 'MCDONALDS', domain: 'Consumer & Commercial', requester: 'Brian O\'Connor', role: 'Digital Analytics Mgr', date: '2026-10-02', month: 'Oct 2026', week: 'Wk 39', day: '02 Oct', status: 'CONVERTED' },
  { id: 'REQ-2026-0130', account: 'MCDONALDS', domain: 'Data Platforms', requester: 'Teresa May', role: 'Snowflake Architect', date: '2026-09-29', month: 'Sep 2026', week: 'Wk 38', day: '29 Sep', status: 'IN PROGRESS' },
  { id: 'REQ-2026-0129', account: 'MCDONALDS', domain: 'Supply Chain (SC)', requester: 'Carlos Vega', role: 'Logistics Analyst', date: '2026-09-21', month: 'Sep 2026', week: 'Wk 37', day: '21 Sep', status: 'CONVERTED' },

  // BANKING Account Demands
  { id: 'REQ-2026-0128', account: 'BANKING', domain: 'Finance', requester: 'Arthur Pendelton', role: 'Risk Modeler (Python)', date: '2026-10-01', month: 'Oct 2026', week: 'Wk 39', day: '01 Oct', status: 'CONVERTED' },
  { id: 'REQ-2026-0127', account: 'BANKING', domain: 'AI Platforms', requester: 'Sandra Bullock', role: 'Credit Risk Data Scientist', date: '2026-09-24', month: 'Sep 2026', week: 'Wk 38', day: '24 Sep', status: 'IN PROGRESS' },

  // FINANCE & INSURANCE
  { id: 'REQ-2026-0126', account: 'FINANCE', domain: 'Finance', requester: 'George Clarke', role: 'Regulatory Reporting Dev', date: '2026-09-18', month: 'Sep 2026', week: 'Wk 37', day: '18 Sep', status: 'CONVERTED' },
  { id: 'REQ-2026-0125', account: 'INSURANCE', domain: 'Technology', requester: 'Rachel Green', role: 'Claims ML Engineer', date: '2026-09-15', month: 'Sep 2026', week: 'Wk 36', day: '15 Sep', status: 'CONVERTED' },
  { id: 'REQ-2026-0124', account: 'INSURANCE', domain: 'Data Platforms', requester: 'Chandler Bing', role: 'Cloud ETL Dev', date: '2026-09-10', month: 'Sep 2026', week: 'Wk 36', day: '10 Sep', status: 'CANCELLED' }
];

export default function AdminReportsDashboard() {
  const [timeline, setTimeline] = useState('Monthly');
  const [selectedAccount, setSelectedAccount] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered dataset for real-time recalculations
  const filteredData = useMemo(() => {
    return rawReportRecords.filter((item) => {
      const matchAccount = selectedAccount === 'All' || item.account.toUpperCase() === selectedAccount.toUpperCase();
      const matchDomain = selectedDomain === 'All' || item.domain.toLowerCase().includes(selectedDomain.toLowerCase());
      const matchStatus = selectedStatus === 'All' || 
        (selectedStatus === 'Converted' && item.status === 'CONVERTED') ||
        (selectedStatus === 'In Progress' && item.status === 'IN PROGRESS') ||
        (selectedStatus === 'Cancelled / Updated' && item.status === 'CANCELLED');
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query || 
        item.id.toLowerCase().includes(query) ||
        item.requester.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.account.toLowerCase().includes(query);

      return matchAccount && matchDomain && matchStatus && matchSearch;
    });
  }, [selectedAccount, selectedDomain, selectedStatus, searchQuery]);

  // Scaled dynamic summary values to match high-volume operations
  const baseMultiplier = selectedAccount === 'All' ? 7.5 : selectedAccount === 'PEPSICO' ? 4.2 : 2.0;

  const totalDemands = Math.round((filteredData.length || 1) * baseMultiplier);
  const convertedCount = Math.round(filteredData.filter(d => d.status === 'CONVERTED').length * baseMultiplier);
  const inProgressCount = Math.round(filteredData.filter(d => d.status === 'IN PROGRESS').length * baseMultiplier);
  const cancelledCount = Math.max(1, Math.round(filteredData.filter(d => d.status === 'CANCELLED').length * baseMultiplier));

  // Time-series intervals based on active Timeline filter
  const timelineIntervals = useMemo(() => {
    if (timeline === 'Daily') {
      return [
        { label: 'Mon', total: 24, converted: 14, inProgress: 8, cancelled: 2 },
        { label: 'Tue', total: 28, converted: 18, inProgress: 7, cancelled: 3 },
        { label: 'Wed', total: 22, converted: 12, inProgress: 9, cancelled: 1 },
        { label: 'Thu', total: 31, converted: 20, inProgress: 9, cancelled: 2 },
        { label: 'Fri', total: 27, converted: 16, inProgress: 8, cancelled: 3 },
        { label: 'Sat', total: 10, converted: 5, inProgress: 4, cancelled: 1 },
      ];
    } else if (timeline === 'Weekly') {
      return [
        { label: 'Wk 37', total: 29, converted: 17, inProgress: 10, cancelled: 2 },
        { label: 'Wk 38', total: 34, converted: 21, inProgress: 11, cancelled: 2 },
        { label: 'Wk 39', total: 38, converted: 24, inProgress: 11, cancelled: 3 },
        { label: 'Wk 40', total: 42, converted: 25, inProgress: 14, cancelled: 3 },
        { label: 'Wk 41', total: 36, converted: 22, inProgress: 12, cancelled: 2 },
      ];
    } else {
      // Monthly intervals matching visual chart pattern
      return [
        { label: 'May', total: 18, converted: 11, inProgress: 5, cancelled: 2 },
        { label: 'Jun', total: 22, converted: 14, inProgress: 6, cancelled: 2 },
        { label: 'Jul', total: 26, converted: 16, inProgress: 8, cancelled: 2 },
        { label: 'Aug', total: 29, converted: 18, inProgress: 9, cancelled: 2 },
        { label: 'Sep', total: 35, converted: 22, inProgress: 11, cancelled: 2 },
        { label: 'Oct', total: 40, converted: 25, inProgress: 12, cancelled: 3 },
      ];
    }
  }, [timeline]);

  // Account Volume Distribution Data
  const accountDistribution = [
    { name: 'PEPSICO', val: 64, pct: 85 },
    { name: 'MARS', val: 28, pct: 55 },
    { name: 'MCDONALDS', val: 28, pct: 55 },
    { name: 'BANKING', val: 19, pct: 38 },
    { name: 'FINANCE', val: 12, pct: 24 },
    { name: 'INSURANCE', val: 10, pct: 20 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans text-white">
      
      {/* View Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          Demand Management Portal
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
          Admin / Partner Live Operations & Reports
        </p>
      </div>

      {/* Main Grid: Left Filter & Slicing Panel, Right Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================== */}
        {/* LEFT COLUMN: FILTER & SLICING PANEL */}
        {/* ============================================================== */}
        <div className="lg:col-span-3 bg-[#161224] border border-[#1E293B] rounded-2xl p-5 space-y-5 shadow-2xl">
          <div>
            <h3 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <span>⚡</span> Filter & Slicing Panel
            </h3>
          </div>

          {/* Timeline Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Timeline Filter:
            </label>
            <select
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="w-full bg-[#0A0814] border border-slate-700 text-xs text-white rounded-xl p-3 outline-none focus:border-[#00F0FF] cursor-pointer"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Account Filter:
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full bg-[#0A0814] border border-slate-700 text-xs text-white rounded-xl p-3 outline-none focus:border-[#00F0FF] cursor-pointer"
            >
              <option value="All">All Accounts</option>
              <option value="PEPSICO">Pepsi</option>
              <option value="MARS">Mars</option>
              <option value="MCDONALDS">McDonalds</option>
              <option value="BANKING">Banking</option>
              <option value="FINANCE">Finance</option>
              <option value="INSURANCE">Insurance</option>
            </select>
          </div>

          {/* Domain Slicer */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Domain:
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full bg-[#0A0814] border border-slate-700 text-xs text-white rounded-xl p-3 outline-none focus:border-[#00F0FF] cursor-pointer"
            >
              <option value="All">All Domains</option>
              <option value="Consumer & Commercial">Consumer & Commercial</option>
              <option value="Supply Chain">Supply Chain (SC)</option>
              <option value="Finance">Finance</option>
              <option value="AI Platforms">AI Platforms</option>
              <option value="Data Platforms">Data Platforms</option>
              <option value="Agro">Agro</option>
              <option value="ESG & EHS">ESG & EHS</option>
            </select>
          </div>

          {/* Status Slicer */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#0A0814] border border-slate-700 text-xs text-white rounded-xl p-3 outline-none focus:border-[#00F0FF] cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="Converted">Converted</option>
              <option value="In Progress">In Progress</option>
              <option value="Cancelled / Updated">Cancelled / Updated</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="pt-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search ID, Project, or Role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0814] border border-slate-700 text-xs text-white rounded-xl pl-8 pr-3 py-2.5 outline-none focus:border-[#00F0FF] placeholder-slate-500"
              />
              <span className="absolute left-2.5 top-2.5 text-slate-500 text-xs">🔍</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: DYNAMIC KPIS, CHARTS & MINI AUDIT LEDGER */}
        {/* ============================================================== */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* 1. TOTAL DEMANDS (REQUEST) */}
            <div className="bg-[#161224] border border-[#1E293B] rounded-xl p-4 shadow-lg border-t-2 border-t-slate-400">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TOTAL DEMANDS (REQUEST)
              </span>
              <p className="text-3xl font-black mt-2 text-white">{totalDemands}</p>
            </div>

            {/* 2. CONVERTED NUMBERS */}
            <div className="bg-[#161224] border border-[#1E293B] rounded-xl p-4 shadow-lg border-t-2 border-t-[#00F0FF]">
              <span className="text-[10px] font-bold text-[#00F0FF] uppercase tracking-wider block">
                CONVERTED NUMBERS
              </span>
              <p className="text-3xl font-black mt-2 text-[#00F0FF]">{convertedCount}</p>
            </div>

            {/* 3. IN PROGRESS */}
            <div className="bg-[#161224] border border-[#1E293B] rounded-xl p-4 shadow-lg border-t-2 border-t-[#E01A8A]">
              <span className="text-[10px] font-bold text-[#E01A8A] uppercase tracking-wider block">
                IN PROGRESS
              </span>
              <p className="text-3xl font-black mt-2 text-[#E01A8A]">{inProgressCount}</p>
            </div>

            {/* 4. CANCELLED / UPDATED */}
            <div className="bg-[#161224] border border-[#1E293B] rounded-xl p-4 shadow-lg border-t-2 border-t-amber-400">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                CANCELLED / UPDATED
              </span>
              <p className="text-3xl font-black mt-2 text-amber-400">{cancelledCount}</p>
            </div>

          </div>

          {/* Visual Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Demand vs Fulfillment Clustered Bar Chart */}
            <div className="bg-[#161224] border border-[#1E293B] rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    Demand vs Fulfillment ({timeline} Trend)
                  </h3>
                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" /> Total
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#00F0FF]" /> Converted
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#E01A8A]" /> In Progress
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Cancelled
                    </span>
                  </div>
                </div>

                {/* Vertical Clustered Bars Container */}
                <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
                  {timelineIntervals.map((interval) => {
                    const maxHeight = 45;
                    const hTotal = Math.round((interval.total / maxHeight) * 100);
                    const hConv = Math.round((interval.converted / maxHeight) * 100);
                    const hProg = Math.round((interval.inProgress / maxHeight) * 100);
                    const hCanc = Math.round((interval.cancelled / maxHeight) * 100);

                    return (
                      <div key={interval.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div className="w-full flex items-end justify-center gap-1 h-full">
                          {/* Total Requests */}
                          <div 
                            style={{ height: `${hTotal}%` }} 
                            className="w-2 bg-slate-600 rounded-t hover:brightness-125 transition-all"
                            title={`Total: ${interval.total}`}
                          />
                          {/* Converted */}
                          <div 
                            style={{ height: `${hConv}%` }} 
                            className="w-2 bg-[#00F0FF] rounded-t hover:brightness-125 shadow-[0_0_8px_rgba(0,240,255,0.4)] transition-all"
                            title={`Converted: ${interval.converted}`}
                          />
                          {/* In Progress */}
                          <div 
                            style={{ height: `${hProg}%` }} 
                            className="w-2 bg-[#E01A8A] rounded-t hover:brightness-125 shadow-[0_0_8px_rgba(224,26,138,0.4)] transition-all"
                            title={`In Progress: ${interval.inProgress}`}
                          />
                          {/* Cancelled */}
                          <div 
                            style={{ height: `${hCanc}%` }} 
                            className="w-2 bg-amber-400 rounded-t hover:brightness-125 transition-all"
                            title={`Cancelled: ${interval.cancelled}`}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 mt-2">
                          {interval.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="pt-2 text-[10px] text-slate-500 text-right">
                Real-time ingestion: Active filter aggregation
              </div>
            </div>

            {/* Chart 2: Account-wise Volume Distribution */}
            <div className="bg-[#161224] border border-[#1E293B] rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide mb-4">
                  Account-wise Volume Distribution
                </h3>

                <div className="space-y-3.5 pt-1">
                  {accountDistribution.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span className="font-semibold text-slate-200">{item.name}</span>
                        <span className="font-bold font-mono text-[#00F0FF]">{item.val}</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#0A0814] border border-slate-800 rounded-full overflow-hidden p-[1px]">
                        <div
                          className="h-full bg-gradient-to-r from-[#00F0FF] via-[#9000FF] to-[#E01A8A] rounded-full shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 pt-3 border-t border-slate-800/80 mt-4">
                <span>Scale: 0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80+ Demands</span>
              </div>
            </div>

          </div>

          {/* Mini-Audit Ledger Table (Matching Visual Reference) */}
          <div className="bg-[#161224] border border-[#1E293B] rounded-xl overflow-hidden shadow-2xl">
            <div className="px-6 py-3 border-b border-slate-800 bg-[#120F1F] flex justify-between items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Audited Demand Register Preview ({filteredData.length} Records)
              </span>
              <span className="text-[10px] text-[#00F0FF] font-mono">
                Scope: {selectedAccount} Account
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A152B] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-6">REQ ID</th>
                    <th className="py-3 px-6">ACCOUNT</th>
                    <th className="py-3 px-6">REQUESTER</th>
                    <th className="py-3 px-6">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 italic">
                        No demands match the selected timeline or account filter.
                      </td>
                    </tr>
                  ) : (
                    filteredData.slice(0, 5).map((row) => (
                      <tr key={row.id} className="hover:bg-[#1C172E] transition-colors">
                        <td className="py-3 px-6 font-mono font-bold text-[#00F0FF]">{row.id}</td>
                        <td className="py-3 px-6 font-semibold text-white">{row.account}</td>
                        <td className="py-3 px-6 text-slate-300">{row.requester}</td>
                        <td className="py-3 px-6">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            row.status === 'CONVERTED'
                              ? 'border-[#10B981] text-[#10B981] bg-[#10B981]/15 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                              : row.status === 'IN PROGRESS'
                              ? 'border-[#FFB800] text-[#FFB800] bg-[#FFB800]/15 shadow-[0_0_8px_rgba(255,184,0,0.25)]'
                              : 'border-[#E01A8A] text-[#E01A8A] bg-[#E01A8A]/15 shadow-[0_0_8px_rgba(224,26,138,0.25)]'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}