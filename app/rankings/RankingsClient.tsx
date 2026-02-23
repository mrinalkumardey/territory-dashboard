'use client';

import React, { useState } from 'react';

export default function RankingsClient({ initialData, configData, activeMonth }: any) {
  const [view, setView] = useState<'files' | 'amount'>('files');
  const [searchTerm, setSearchTerm] = useState("");

  const safeConfig = Array.isArray(configData) ? configData : [];
  const safeData = Array.isArray(initialData) ? initialData : [];

  const clean = (val: any): number => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const parseSheetDate = (dateVal: any) => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;
    const parts = dateVal.toString().split(/[/.-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return null;
  };

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const rawDeadline = safeConfig.find((c: any) => c?.Parameter === "Target Deadline")?.Value;
  const deadline = parseSheetDate(rawDeadline) || new Date(2026, 1, 26);
  deadline.setHours(0, 0, 0, 0);
  
  const offDays = safeConfig.filter((c: any) => c?.Parameter === "Off Day").map((c: any) => {
    const d = parseSheetDate(c.Value);
    return d ? (d.setHours(0, 0, 0, 0), d.getTime()) : 0;
  }).filter(t => t !== 0);

  let workingDaysLeft = 0;
  let tempDate = new Date(today);
  while (tempDate <= deadline) {
    if (!offDays.includes(tempDate.getTime())) workingDaysLeft++;
    tempDate.setDate(tempDate.getDate() + 1);
  }
  const daysToDisplay = workingDaysLeft > 0 ? workingDaysLeft : 1;

  const filteredData = safeData
    .filter((row: any) => row["FLO Name"] && !row["FLO Name"].toString().toLowerCase().includes("total"))
    .map((row: any) => {
      const targetAmt = clean(row["Disb. Target"]);
      const doneAmt = clean(row["Disb. Done"]);
      const targetFil = clean(row["File Target"]);
      const doneFil = clean(row["File Done"]);

      return {
        ...row,
        targetAmt, doneAmt, gapAmt: targetAmt - doneAmt,
        targetFil, doneFil, gapFil: targetFil - doneFil,
        pct: view === 'amount' 
             ? (targetAmt > 0 ? (doneAmt / targetAmt) * 100 : 0)
             : (targetFil > 0 ? (doneFil / targetFil) * 100 : 0)
      };
    })
    .filter((flo) => 
      flo["FLO Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
      flo["Branch"].toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.pct - a.pct);

  // Helper to render badge icons
  const renderBadge = (index: number) => {
    if (index === 0) return <span className="ml-2 text-xl" title="Diamond Rank">💎</span>;
    if (index === 1) return <span className="ml-2 text-xl" title="Gold Rank">🥇</span>;
    if (index === 2) return <span className="ml-2 text-xl" title="Platinum Rank">🎖️</span>;
    return null;
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased font-sans p-6 md:p-10 flex flex-col">
      <div className="h-2 w-full bg-blue-600 fixed top-0 left-0 z-50" />
      
      <div className="max-w-6xl mx-auto w-full pt-4">
        <header className="mb-12 border-b border-slate-200 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            <div>
              <nav className="mb-4">
                <a href={`/?month=${activeMonth}`} className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] hover:opacity-70 transition-all">
                  ← Back to {activeMonth} Dashboard
                </a>
              </nav>
              <h1 className="text-4xl font-black tracking-tight uppercase text-slate-800">
                Territory <span className="text-blue-600">Rankings</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase mt-2 tracking-widest">
                Cycle: {activeMonth} • {daysToDisplay} Production Days Left
              </p>
            </div>

            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setView('files')} className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'files' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>Files View</button>
              <button onClick={() => setView('amount')} className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'amount' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>Value View</button>
            </div>
          </div>

          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="Search FLO or branch..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </header>

        {/* MOBILE SWIPE HINT */}
        <div className="md:hidden flex items-center justify-center gap-2 mb-4 animate-pulse">
           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Swipe Left to view full table</span>
           <span className="text-slate-400">→</span>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="w-full overflow-x-auto">
            {/* TABLE CONTAINER WITH INTEGRATED OVERLAY HINT */}
<div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
  
  {/* MOBILE ONLY: Floating Hint Overlay */}
  <div className="md:hidden absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none flex items-center justify-end pr-2">
    <div className="bg-white/90 shadow-[-10px_0_15px_rgba(0,0,0,0.05)] h-16 w-6 rounded-l-full flex items-center justify-center border-y border-l border-slate-200 animate-pulse">
      <span className="text-slate-400 text-xs">→</span>
    </div>
  </div>

  <div className="w-full overflow-x-auto scroll-smooth">
   {/* TABLE CONTAINER */}
<div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
  
  {/* MOBILE FLOATING HINT */}
  <div className="md:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-30 pointer-events-none flex items-center justify-end pr-1">
    <div className="animate-pulse flex flex-col items-center">
      <span className="text-[9px] font-black text-blue-600 vertical-text tracking-[0.2em] uppercase" style={{ writingMode: 'vertical-rl' }}>
        Swipe
      </span>
      <span className="text-blue-600 mt-1 text-xs">→</span>
    </div>
  </div>

  <div className="w-full overflow-x-auto scrollbar-hide">
    <table className="w-full text-left min-w-[850px] border-collapse">
      <thead>
        <tr className="text-[10px] uppercase text-slate-900 font-black tracking-[0.1em] bg-slate-50">
          <th className="p-4 md:p-8 sticky left-0 bg-slate-50 z-20 w-16 md:w-24">Rank</th>
          <th className="p-4 md:p-6 sticky left-16 md:left-24 bg-slate-50 z-20 border-r border-slate-100 w-32 md:w-48">FLO Name</th>
          
          <th className="p-6">Branch</th>
          <th className="p-6 text-right">Total Target</th>
          <th className="p-6 text-right">Disbursed</th>
          <th className="p-6 text-right">Gap</th>
          <th className="p-6 text-center">Required DRR</th>
          <th className="p-6 text-center">Achievement</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {filteredData.map((flo, i) => {
          const target = view === 'amount' ? flo.targetAmt : flo.targetFil;
          const done = view === 'amount' ? flo.doneAmt : flo.doneFil;
          const gap = target - done;
          const drr = gap > 0 ? (gap / daysToDisplay) : 0;

          return (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
              {/* Sticky Rank */}
              <td className="p-4 md:p-8 font-black text-slate-400 text-base md:text-lg sticky left-0 bg-white group-hover:bg-slate-50 z-10 w-16 md:w-24">
                <div className="flex items-center">
                  {(i + 1).toString().padStart(2, '0')}
                  {renderBadge(i)}
                </div>
              </td>
              
              {/* Sticky FLO Name */}
              <td className="p-4 md:p-6 sticky left-16 md:left-24 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 w-32 md:w-48">
                <p className="font-bold text-slate-700 uppercase tracking-tight text-[11px] md:text-sm truncate max-w-[100px] md:max-w-none">
                  {flo["FLO Name"]}
                </p>
              </td>

              {/* RESTORED: Branch Badge Effect */}
              <td className="p-6">
                <span className="inline-block px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-wider whitespace-nowrap group-hover:bg-white group-hover:border-blue-200 group-hover:text-blue-600 transition-all">
                  {flo["Branch"]}
                </span>
              </td>

              <td className="p-6 text-right text-[11px] font-bold text-slate-600 uppercase">
                {view === 'amount' ? `₹${(target/100000).toFixed(1)}L` : target}
              </td>
              <td className="p-6 text-right text-[11px] text-blue-600 font-black uppercase">
                {view === 'amount' ? `₹${(done/100000).toFixed(1)}L` : done}
              </td>
              <td className="p-6 text-right text-[11px] text-red-500 font-bold uppercase">
                {view === 'amount' ? `₹${(gap/100000).toFixed(1)}L` : gap}
              </td>
              
              <td className="p-6 text-center">
                <div className="inline-flex flex-col items-center">
                  <p className={`text-sm font-black ${view === 'amount' ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {view === 'amount' ? `₹${(drr/100000).toFixed(2)}L` : drr.toFixed(1)}
                  </p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">/ day</p>
                </div>
              </td>
              
              <td className="p-6 text-center">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-tighter shadow-sm border ${
                  flo.pct >= 100 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  flo.pct >= 80 ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                  'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {flo.pct.toFixed(1)}%
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>
  </div>
</div>
          </div>
        </div>
      </div>

      <footer className="mt-auto py-16 text-center border-t border-slate-100">
        <p className="text-slate-300 text-[9px] font-bold uppercase tracking-[0.5em]">
           Territory Analytics Suite • <span className="text-blue-600">Mrinal Kumar</span>
        </p>
      </footer>
    </main>
  );
}