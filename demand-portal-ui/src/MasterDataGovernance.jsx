import React from 'react';

export default function MasterDataGovernance() {
  const cards = [
    {
      title: "Domains & Project Groups",
      sub: "Manage corporate domains, project naming prefixes & customer mappings",
      color: "border-[#00F0FF]",
      items: ["Consumer & Commercial (C&C)", "Supply Chain (SC)", "AI Platforms", "Finance", "Data Platforms"],
      total: 10
    },
    {
      title: "Roles, Streams & Tracks",
      sub: "Manage 40+ engineering roles, talent levels (A1 to AD+) & skill requirements",
      color: "border-[#E01A8A]",
      items: ["Lead Data Engineer", "Data Scientist (MLOps)", "Full Stack Developer", "Application Architect", "Cloud DevOps Azure"],
      total: 7
    },
    {
      title: "Delivery & Client Partners",
      sub: "Authorized Client Partners & Delivery leadership for project alignment",
      color: "border-emerald-400",
      items: ["Abhishek Mishra (CP)", "Anu Narayan (CP)", "Shravani N (CP)", "Graham (CP)", "Naresh Kumar Nayak (DP)"],
      total: 6
    },
    {
      title: "Commercials & Form Controls",
      sub: "Billing types, program types, SOW statuses, and default drop-down settings",
      color: "border-amber-400",
      items: ["Fixed Price (FP)", "Time & Material (T&M)", "Retainer Model", "Managed Program", "Center of Excellence (COE)"],
      total: 6
    }
  ];

  return (
    <div className="p-6 md:p-8 bg-[#05050A] min-h-[calc(100vh-120px)] w-full absolute inset-0 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto space-y-6 pt-4 pb-12">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Master Data Governance Hub</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">Configure core system lists, project groups, streams, partners & form metadata in production</p>
          </div>
          <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] font-bold text-[#00F0FF] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse"></span>
              Authorized Admins Only
            </span>
          </div>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {cards.map((card, idx) => (
            <div key={idx} className={`bg-[#0F172A] border-t-4 ${card.color} border-x border-b border-x-slate-800 border-b-slate-800 rounded-xl p-6 shadow-lg flex flex-col`}>
              
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="text-base font-bold text-white">{card.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
                <button className={`px-4 py-2 border border-[#E01A8A] text-[#E01A8A] hover:bg-[#E01A8A] hover:text-white text-xs font-bold rounded-lg transition-all whitespace-nowrap ml-4`}>
                  + Add Entry
                </button>
              </div>

              <div className="flex-1 space-y-1.5">
                {card.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-800/50 hover:bg-slate-800/50 px-3 rounded-lg transition group">
                    <span className="text-sm text-slate-300 font-medium group-hover:text-white transition">{item}</span>
                    <div className="flex gap-3 text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                      <button className="hover:text-[#00F0FF] transition-colors">[Edit]</button>
                      <button className="hover:text-[#E01A8A] transition-colors">[Toggle Active]</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-medium flex justify-between items-center">
                <span>Showing {card.items.length} of {card.total} configured items</span>
                <span className="flex items-center gap-1.5"><span className="w-1 h-1 bg-slate-500 rounded-full"></span> Audit logged</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}