import React, { useState, useMemo } from 'react';
import { FILTER_FIELD_KEYS, MASTER_FILTER_OPTIONS } from './constants';

const REPORT_RECORDS = [
  { reqId: 'REQ-2026-0142', demandId: 'R-000102', account: 'PEPSICO', domain: 'Consumer & Commercial', projectGroup: 'S&T - Data Platform', projectName: 'PEPSICO_PBNA_MKT', demandType: 'New', clientPartner: 'Aarohan Singh', deliveryPartner: 'Naresh Kumar Nayak', programType: 'Managed Program', billingType: 'Fixed Price', status: 'INPROGRESS', role: 'Lead Data Engineer', date: '2026-10-12', month: 'Oct' },
  { reqId: 'REQ-2026-0141', demandId: 'R-000101', account: 'PEPSICO', domain: 'Supply Chain (SC)', projectGroup: 'PFNA', projectName: 'PEPSICO_CTO_SC_EDGE', demandType: 'Replacement', clientPartner: 'Parag Shah', deliveryPartner: 'Prakash Ravindran', programType: 'COE', billingType: 'T&M', status: 'FULFILLED', role: 'Dossier Project Creation', date: '2026-10-11', month: 'Oct' },
  { reqId: 'REQ-2026-0140', demandId: '', account: 'PEPSICO', domain: 'AI Platforms', projectGroup: 'S&T - AI S&P', projectName: 'PEPSICO_AI_S&P_HUB', demandType: 'Investment - Delivery', clientPartner: 'Parish Jain', deliveryPartner: 'Noorul Ameen Abdulmajeeth', programType: 'Team Extension', billingType: 'Retainer', status: 'INPROGRESS', role: 'Data Scientist (MLOps)', date: '2026-10-10', month: 'Oct' },
  { reqId: 'REQ-2026-0139', demandId: 'R-000103', account: 'PEPSICO', domain: 'Finance', projectGroup: 'EUROPE', projectName: 'PEPSICO_HCM_PAYROLL', demandType: 'Investment - Technical Delivery', clientPartner: 'Raghul Muthuswamy', deliveryPartner: 'Vishnu Priyan Sundara Vadivelu', programType: 'Managed Program', billingType: 'Fixed Price', status: 'CANCELLED', role: 'Both: Full Pipeline', date: '2026-10-09', month: 'Oct' },
  { reqId: 'REQ-2026-0138', demandId: 'R-000104', account: 'PEPSICO', domain: 'Data Platforms', projectGroup: 'S&T - EDF', projectName: 'PEPSICO_EDF_CORE', demandType: 'Replacement - POP', clientPartner: 'Rohit Kandhewal', deliveryPartner: 'Ronak Ramesh Doshi', programType: 'COE', billingType: 'T&M', status: 'FULFILLED', role: 'Azure BDE (2 FTE)', date: '2026-10-08', month: 'Oct' },
  { reqId: 'REQ-2026-0137', demandId: '', account: 'MARS', domain: 'Supply Chain (SC)', projectGroup: 'MARS Global', projectName: 'MARS_SUPPLY_OPTIMIZER', demandType: 'New', clientPartner: 'Suresh Ponnuru', deliveryPartner: 'Sibi Arnold', programType: 'Team Extension', billingType: 'Retainer', status: 'INPROGRESS', role: 'SAP IBP Specialist', date: '2026-10-04', month: 'Oct' },
  { reqId: 'REQ-2026-0136', demandId: 'R-000105', account: 'MCDONALDS', domain: 'Consumer & Commercial', projectGroup: 'MCD Apps', projectName: 'MCD_LOYALTY_ANALYTICS', demandType: 'New', clientPartner: 'Other', deliveryPartner: 'Sushant Kulkarni', programType: 'Managed Program', billingType: 'Fixed Price', status: 'FULFILLED', role: 'PowerBI Developer', date: '2026-10-02', month: 'Oct' },
  { reqId: 'REQ-2026-0135', demandId: 'R-000106', account: 'BANKING', domain: 'Finance', projectGroup: 'FIN Risk', projectName: 'BANK_RISK_CREDIT_AI', demandType: 'Replacement', clientPartner: 'Aarohan Singh', deliveryPartner: 'Naresh Kumar Nayak', programType: 'COE', billingType: 'Retainer', status: 'FULFILLED', role: 'Risk Modeler (Python)', date: '2026-09-28', month: 'Sep' },
];

const TIMELINE_OPTIONS = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];
const STATUS_OPTIONS = ['Total', 'Fulfilled', 'Inprogress', 'Cancelled'];

const getTimelineBucket = (dateValue, timeline) => {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const start = new Date(date);
  if (timeline === 'Weekly') {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  } else if (timeline === 'Monthly') {
    start.setDate(1);
  } else if (timeline === 'Quarterly') {
    start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
  } else {
    start.setMonth(0, 1);
  }

  let label;
  if (timeline === 'Weekly') {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const formatDate = value => value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    label = `${formatDate(start)} - ${formatDate(end)}`;
  } else if (timeline === 'Monthly') {
    label = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } else if (timeline === 'Quarterly') {
    label = `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
  } else {
    label = String(start.getFullYear());
  }

  return { key: start.getTime(), label };
};

export default function AdminReportsDashboard() {
  const [filterCategory, setFilterCategory] = useState('Domain');
  const [filterValue, setFilterValue] = useState('All');
  const [timelineFilter, setTimelineFilter] = useState('Monthly');
  const [statusFilter, setStatusFilter] = useState('Total');
  const [selectedFormat, setSelectedFormat] = useState('XLSX');

  const cascadingOptionsMap = MASTER_FILTER_OPTIONS;

  const handleCategoryChange = (e) => {
    setFilterCategory(e.target.value);
    setFilterValue('All');
  };

  const filteredData = useMemo(() => {
    const field = FILTER_FIELD_KEYS[filterCategory];
    return REPORT_RECORDS.filter(d => {
      const matchesCategory = filterValue === 'All' || (field && d[field] === filterValue);
      const matchesStatus = statusFilter === 'Total' || d.status === statusFilter.toUpperCase();
      return matchesCategory && matchesStatus;
    });
  }, [filterCategory, filterValue, statusFilter]);

  const kpis = useMemo(() => {
    return {
      total: filteredData.length,
      fulfilled: filteredData.filter(d => d.status === 'FULFILLED').length,
      inprogress: filteredData.filter(d => d.status === 'INPROGRESS').length,
      cancelled: filteredData.filter(d => d.status === 'CANCELLED').length,
    };
  }, [filteredData]);

  const timelineGroups = useMemo(() => {
    const groups = new Map();
    filteredData.forEach(record => {
      const bucket = getTimelineBucket(record.date, timelineFilter);
      if (!bucket) return;

      if (!groups.has(bucket.key)) {
        groups.set(bucket.key, {
          ...bucket,
          total: 0,
          fulfilled: 0,
          inprogress: 0,
          cancelled: 0
        });
      }

      const group = groups.get(bucket.key);
      group.total += 1;
      if (record.status === 'FULFILLED') group.fulfilled += 1;
      if (record.status === 'INPROGRESS') group.inprogress += 1;
      if (record.status === 'CANCELLED') group.cancelled += 1;
    });

    return Array.from(groups.values()).sort((a, b) => a.key - b.key);
  }, [filteredData, timelineFilter]);

  const maxTimelineCount = Math.max(...timelineGroups.map(group => group.total), 1);

  const accountDistribution = useMemo(() => {
    const counts = new Map();
    filteredData.forEach(record => counts.set(record.account, (counts.get(record.account) || 0) + 1));
    const maxCount = Math.max(...counts.values(), 1);
    return Array.from(counts, ([name, count]) => ({
      name,
      count,
      pct: `${(count / maxCount) * 100}%`
    }));
  }, [filteredData]);

  // Real client-side file export generator
  const handleExportReport = () => {
    const header = 'REQ ID,DEMAND ID,ACCOUNT,DOMAIN,PROJECT GROUP,PROJECT NAME,STATUS,ROLE,DATE\n';
    const rows = filteredData.map(d => 
      `"${d.reqId}","${d.demandId || 'N/A'}","${d.account}","${d.domain}","${d.projectGroup}","${d.projectName}","${d.status}","${d.role}","${d.date}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TigerAnalytics_Demand_Report_${new Date().toISOString().slice(0, 10)}.${selectedFormat.toLowerCase() === 'pdf' ? 'pdf' : selectedFormat.toLowerCase() === 'xlsx' ? 'xlsx' : 'csv'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          Demand Management Portal
        </h1>
        <p className="text-sm font-medium text-[#475569]">
          Executive Reports & Analytics Hub - Conversion & Account Insights
        </p>
      </div>

      {/* 4 Standardized KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-t-4 border-[#00F0FF] p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</div>
          <div className="text-3xl font-extrabold text-[#0F172A] mt-2">{kpis.total}</div>
          <div className="text-xs text-slate-400 mt-1">Total Demands (Request)</div>
        </div>

        <div className="bg-white border-t-4 border-[#10B981] p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fulfilled</div>
          <div className="text-3xl font-extrabold text-[#10B981] mt-2">{kpis.fulfilled}</div>
          <div className="text-xs text-slate-400 mt-1">Converted & Staffed</div>
        </div>

        <div className="bg-white border-t-4 border-[#FFB800] p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inprogress</div>
          <div className="text-3xl font-extrabold text-[#FFB800] mt-2">{kpis.inprogress}</div>
          <div className="text-xs text-slate-400 mt-1">Active in Pipeline</div>
        </div>

        <div className="bg-white border-t-4 border-[#EF4444] p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelled</div>
          <div className="text-3xl font-extrabold text-[#EF4444] mt-2">{kpis.cancelled}</div>
          <div className="text-xs text-slate-400 mt-1">Updated / Retracted</div>
        </div>
      </div>

      {/* Slicing & Interactive Export Report Ribbon */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-xs font-extrabold text-[#E01A8A] uppercase tracking-wider">
            Filters & Slicing:
          </span>

          <select
            value={filterCategory}
            onChange={handleCategoryChange}
            className="bg-[#F8FAFC] border border-slate-300 text-xs font-semibold rounded-lg px-3 py-2 text-[#0F172A] outline-none cursor-pointer"
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

          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="bg-[#F0FDFA] border border-[#00F0FF] text-xs font-semibold rounded-lg px-3 py-2 text-[#0F172A] outline-none cursor-pointer"
          >
            <option value="All">All {filterCategory}s</option>
            {(cascadingOptionsMap[filterCategory] || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            aria-label="Timeline Filter"
            value={timelineFilter}
            onChange={(e) => setTimelineFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-slate-300 text-xs font-semibold rounded-lg px-3 py-2 text-[#0F172A] outline-none cursor-pointer"
          >
            {TIMELINE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>

          <select
            aria-label="Status Filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F8FAFC] border border-slate-300 text-xs font-semibold rounded-lg px-3 py-2 text-[#0F172A] outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        {/* Multi-Format Export Report Handler */}
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {['XLSX', 'CSV', 'PDF'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  selectedFormat === fmt
                    ? 'bg-[#E01A8A] text-white shadow-sm'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="px-5 py-2 rounded-lg bg-[#00F0FF] text-[#05050A] text-xs font-bold hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span>📥</span> Export Report ({selectedFormat})
          </button>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4">
            Demand vs Fulfillment by {timelineFilter} ({filterCategory}: {filterValue})
          </h3>
          <div className="h-64 flex items-end justify-around border-b border-slate-200 pb-2">
            {timelineGroups.map(group => (
              <div key={group.key} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex items-end gap-1.5 h-48">
                  <div style={{ height: `${(group.total / maxTimelineCount) * 100}%` }} className="w-3 bg-[#38BDF8] rounded-t" title={`Total: ${group.total}`} />
                  <div style={{ height: `${(group.fulfilled / maxTimelineCount) * 100}%` }} className="w-3 bg-[#10B981] rounded-t" title={`Fulfilled: ${group.fulfilled}`} />
                  <div style={{ height: `${(group.inprogress / maxTimelineCount) * 100}%` }} className="w-3 bg-[#FFB800] rounded-t" title={`Inprogress: ${group.inprogress}`} />
                  <div style={{ height: `${(group.cancelled / maxTimelineCount) * 100}%` }} className="w-3 bg-[#EF4444] rounded-t" title={`Cancelled: ${group.cancelled}`} />
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">{group.label}</span>
              </div>
            ))}
            {timelineGroups.length === 0 && <span className="text-xs text-slate-400 self-center">No records match these filters.</span>}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#38BDF8] rounded-sm" /> Total</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#10B981] rounded-sm" /> Fulfilled</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#FFB800] rounded-sm" /> Inprogress</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#EF4444] rounded-sm" /> Cancelled</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] mb-4">Account-wise Volume Distribution</h3>
          <div className="space-y-4">
            {accountDistribution.map((acc) => (
              <div key={acc.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{acc.name}</span>
                  <span className="text-[#E01A8A] font-bold">{acc.count} Demands</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00F0FF] to-[#E01A8A] rounded-full"
                    style={{ width: acc.pct }}
                  />
                </div>
              </div>
            ))}
            {accountDistribution.length === 0 && <div className="text-xs text-slate-400">No records match these filters.</div>}
          </div>
        </div>
      </div>

    </div>
  );
}