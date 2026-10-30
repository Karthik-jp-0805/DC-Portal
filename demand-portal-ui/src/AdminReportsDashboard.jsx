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
  const [timeline, setTimeline] = useState('Timeline: Monthly');
  const [selectedAccount, setSelectedAccount] = useState('Account: All Accounts');

  // Filtered dataset for real-time recalculations
  const filteredData = useMemo(() => {
    return rawReportRecords.filter((item) => {
      const matchAccount = selectedAccount === 'Account: All Accounts' || item.account.toUpperCase() === selectedAccount.replace('Account: ', '').toUpperCase();
      return matchAccount;
    });
  }, [selectedAccount]);

  // Scaled dynamic summary values to match high-volume operations
  const baseMultiplier = selectedAccount === 'Account: All Accounts' ? 7.5 : selectedAccount === 'PEPSICO' ? 4.2 : 2.0;

  const totalDemands = Math.round((filteredData.length || 1) * baseMultiplier);
  const convertedCount = Math.round(filteredData.filter(d => d.status === 'CONVERTED').length * baseMultiplier);
  const inProgressCount = Math.round(filteredData.filter(d => d.status === 'IN PROGRESS').length * baseMultiplier);
  const cancelledCount = Math.max(1, Math.round(filteredData.filter(d => d.status === 'CANCELLED').length * baseMultiplier));

  // Time-series intervals based on active Timeline filter
  const timelineIntervals = useMemo(() => {
    if (timeline.includes('Daily')) {
      return [
        { label: 'Mon', total: 24, converted: 14, inProgress: 8, cancelled: 2 },
        { label: 'Tue', total: 28, converted: 18, inProgress: 7, cancelled: 3 },
        { label: 'Wed', total: 22, converted: 12, inProgress: 9, cancelled: 1 },
        { label: 'Thu', total: 31, converted: 20, inProgress: 9, cancelled: 2 },
        { label: 'Fri', total: 27, converted: 16, inProgress: 8, cancelled: 3 },
        { label: 'Sat', total: 10, converted: 5, inProgress: 4, cancelled: 1 },
      ];
    } else if (timeline.includes('Weekly')) {
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
    { name: 'Pepsi (PEPSICO)', val: 64, color: 'bg-[#E01A8A]', w: '90%' },
    { name: 'Mars', val: 38, color: 'bg-[#00F0FF]', w: '65%' },
    { name: 'McDonalds', val: 28, color: 'bg-emerald-400', w: '45%' },
    { name: 'Banking', val: 22, color: 'bg-amber-400', w: '35%' },
    { name: 'Finance', val: 15, color: 'bg-purple-500', w: '25%' },
    { name: 'Insurance', val: 10, color: 'bg-blue-400', w: '15%' },
  ];

  return (
    <div className="w-full h-full bg-[#05050A] absolute inset-0 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6 md:p-8 space-y-6 font-sans text-white pb-12">
        
        {/* View Title */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Demand Management Portal
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 font-medium">
            Executive Reports & Analytics Hub - Conversion & Account Insights
          </p>
        </div>

        {/* Standardized KPI Tiles (Mirrored from Admin Dashboard) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0F172A] border-t-4 border-[#00F0FF] rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">TOTAL</span>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-white">{totalDemands}</span>
              <span className="text-[10px] text-slate-500 mb-1.5 uppercase font-semibold">Total Demands (Request)</span>
            </div>
          </div>

          <div className="bg-[#0F172A] border-t-4 border-emerald-400 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">FULFILLED</span>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-white">{convertedCount}</span>
              <span className="text-[10px] text-slate-500 mb-1.5 uppercase font-semibold">Converted & Staffed</span>
            </div>
          </div>

          <div className="bg-[#0F172A] border-t-4 border-amber-400 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">INPROGRESS</span>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-white">{inProgressCount}</span>
              <span className="text-[10px] text-slate-500 mb-1.5 uppercase font-semibold">Active in Pipeline</span>
            </div>
          </div>

          <div className="bg-[#0F172A] border-t-4 border-rose-400 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider">CANCELLED</span>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-black text-white">0{cancelledCount}</span>
              <span className="text-[10px] text-slate-500 mb-1.5 uppercase font-semibold">Updated / Retracted</span>
            </div>
          </div>
        </div>

        {/* Filters & Export Ribbon (Markup #16) */}
        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
          
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold text-[#00F0FF] tracking-wider uppercase min-w-[120px]">Filters & Slicing:</span>
            
            <select className="bg-[#05050A] border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none w-48 cursor-pointer">
              <option>Filter By: Timeline Wise</option>
              <option>Filter By: Account Wise</option>
            </select>
            
            <select 
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="bg-[#05050A] border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none w-48 cursor-pointer"
            >
              <option value="Timeline: Monthly">Timeline: Monthly</option>
              <option value="Timeline: Weekly">Timeline: Weekly</option>
              <option value="Timeline: Daily">Timeline: Daily</option>
            </select>

            <select 
              value={selectedAccount === 'All' ? 'Account: All Accounts' : selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value === 'Account: All Accounts' ? 'All' : e.target.value)}
              className="bg-[#05050A] border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white outline-none w-48 cursor-pointer"
            >
              <option value="Account: All Accounts">Account: All Accounts</option>
              <option value="PEPSICO">PEPSICO</option>
              <option value="MARS">Mars</option>
              <option value="MCDONALDS">McDonalds</option>
              <option value="BANKING">Banking</option>
              <option value="FINANCE">Finance</option>
              <option value="INSURANCE">Insurance</option>
            </select>
          </div>

          {/* New Export Dump Ribbon */}
          <div className="flex items-center gap-3 ml-auto">
            <button className="bg-transparent border border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/10 px-5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
              Export Dump (.xlsx) <span className="text-[10px]">▼</span>
            </button>
            <div className="flex bg-[#05050A] border border-[#E01A8A] rounded-lg overflow-hidden">
              <button className="px-3.5 py-2 text-[10px] font-bold text-white bg-[#E01A8A] hover:bg-[#C91780] transition border-r border-[#C91780]">XLSX</button>
              <button className="px-3.5 py-2 text-[10px] font-bold text-white hover:bg-slate-800 transition border-r border-slate-700">CSV</button>
              <button className="px-3.5 py-2 text-[10px] font-bold text-white hover:bg-slate-800 transition">PDF</button>
            </div>
          </div>
        </div>

        {/* Charts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Demand vs Fulfillment Trend */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 shadow-lg min-h-[380px] relative flex flex-col justify-between">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-white">Demand vs Fulfillment Trend (Total, Fulfilled, Inprogress, Cancelled)</h3>
              <div className="flex gap-4 text-[10px] font-bold">
                <span className="text-[#00F0FF] flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#00F0FF] rounded-sm inline-block"></span> Total</span>
                <span className="text-emerald-400 flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm inline-block"></span> Fulfilled</span>
                <span className="text-amber-400 flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-400 rounded-sm inline-block"></span> Inprogress</span>
                <span className="text-rose-400 flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-400 rounded-sm inline-block"></span> Cancelled</span>
              </div>
            </div>
            
            {/* Visual Bars */}
            <div className="relative h-64 flex items-end justify-around border-b border-slate-700 pb-2">
              {timelineIntervals.map((interval) => {
                const maxHeight = 45;
                const hTotal = Math.round((interval.total / maxHeight) * 100);
                const hConv = Math.round((interval.converted / maxHeight) * 100);
                const hProg = Math.round((interval.inProgress / maxHeight) * 100);
                const hCanc = Math.round((interval.cancelled / maxHeight) * 100);

                return (
                  <div key={interval.label} className="flex-1 flex flex-col items-center h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full px-1.5">
                      <div style={{ height: `${hTotal}%` }} className="w-4 bg-[#00F0FF] rounded-t-sm shadow-[0_0_8px_rgba(0,240,255,0.4)]" title={`Total: ${interval.total}`} />
                      <div style={{ height: `${hConv}%` }} className="w-4 bg-emerald-400 rounded-t-sm shadow-[0_0_8px_rgba(16,185,129,0.4)]" title={`Fulfilled: ${interval.converted}`} />
                      <div style={{ height: `${hProg}%` }} className="w-4 bg-amber-400 rounded-t-sm" title={`In Progress: ${interval.inProgress}`} />
                      <div style={{ height: `${hCanc}%` }} className="w-4 bg-rose-400 rounded-t-sm" title={`Cancelled: ${interval.cancelled}`} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-around text-[11px] text-slate-400 font-semibold pt-3">
              {timelineIntervals.map(i => <span key={i.label} className="flex-1 text-center">{i.label}</span>)}
            </div>
          </div>

          {/* Chart 2: Account Volume Mockup */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 shadow-lg min-h-[380px]">
            <h3 className="text-sm font-bold text-white mb-8">Account-wise Volume Distribution</h3>
            <div className="space-y-6">
              {accountDistribution.map((acc, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-2.5">
                    <span className="text-white tracking-wide">{acc.name}</span>
                    <span className="text-[11px]" style={{color: acc.color.replace('bg-', '')}}>{acc.val} Demands</span>
                  </div>
                  <div className="w-full bg-[#05050A] rounded-full h-3.5 overflow-hidden">
                    <div className={`h-full ${acc.color} rounded-full transition-all duration-1000 ease-out`} style={{width: acc.w}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}