'use client';

import React, { useState } from 'react';

export default function BranchClient({ branchRows, configData, branchName, activeMonth }: any) {
  const [view, setView] = useState<'files' | 'amount'>('files');

  const clean = (val: any) => parseFloat(val?.toString().replace(/[^0-9.]/g, '')) || 0;

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

  const today = new Date(); today.setHours(0,0,0,0);
  const deadlineVal = configData.find((c: any) => c.Parameter === "Target Deadline")?.Value;
  const deadline = parseSheetDate(deadlineVal) || new Date(2026, 1, 26);
  deadline.setHours(0,0,0,0);
  
  const offDays = configData.filter((c: any) => c.Parameter === "Off Day").map((c: any) => {
    const d = parseSheetDate(c.Value);
    return d ? d.setHours(0,0,0,0) : 0;
  });

  let workingDays = 0;
  let tempDate = new Date(today);
  while (tempDate <= deadline) {
    if (!offDays.includes(tempDate.getTime())) workingDays++;
    tempDate.setDate(tempDate.getDate() + 1);
  }
  const daysLeft = workingDays > 0 ? workingDays : 1;

  const tAmt = branchRows.reduce((s: any, r: any) => s + clean(r["Disb. Target"]), 0);
  const dAmt = branchRows.reduce((s: any, r: any) => s + clean(r["Disb. Done"]), 0);
  const gAmt = tAmt - dAmt;
  const aPct = tAmt > 0 ? (dAmt / tAmt) * 100 : 0;

  const tFil = branchRows.reduce((s: any, r: any) => s + clean(r["File Target"]), 0);
  const dFil = branchRows.reduce((s: any, r: any) => s + clean(r["File Done"]), 0);
  const gFil = tFil - dFil;
  const fPct = tFil > 0 ? (dFil / tFil) * 100 : 0;

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 md:p-12 font-sans antialiased flex flex-col">
      <div className="h-2 w-full bg-blue-600 fixed top-0 left-0 z-50" />
      
      <div className="max-w-6xl mx-auto w-full pt-4">
        <header className="mb-12 border-b border-slate-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <nav className="mb-6">
              <a 
                href={`/?month=${activeMonth}`} 
                className="inline-flex items-center text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] hover:opacity-70 transition-all"
              >
                <span className="mr-2 text-sm">←</span> Return to {activeMonth} Dashboard
              </a>
            </nav>
            <h1 className="text-5xl font-black tracking-tight text-slate-800 uppercase leading-none">{branchName}</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4">
              Loan Performance Analytics • {daysLeft} Days Remaining
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Cycle</p>
            <p className="text-sm font-bold text-slate-800 uppercase">{activeMonth}</p>
          </div>
        </header>

        {/* PRIMARY PERFORMANCE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Loan Summary */}
          <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Target Done</p>
                <h2 className="text-4xl font-black text-slate-800">{aPct.toFixed(1)}%</h2>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Target</p>
                <p className="text-lg font-bold text-slate-700 uppercase">₹{(tAmt/100000).toFixed(1)}L</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-[11px] font-bold uppercase"><span className="text-slate-400">Disbursed</span><span className="text-blue-600">₹{(dAmt/100000).toFixed(1)}L</span></div>
              <div className="flex justify-between text-[11px] font-bold uppercase"><span className="text-slate-400">Gap</span><span className="text-red-500">₹{(gAmt/100000).toFixed(1)}L</span></div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(aPct, 100)}%` }} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
               <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Required DRR</p>
                 <p className="text-2xl font-black text-slate-800">₹{(gAmt > 0 ? gAmt/daysLeft/100000 : 0).toFixed(2)}L <span className="text-[10px] text-slate-400 font-bold uppercase">/ day</span></p>
               </div>
            </div>
          </div>

          {/* File Summary */}
          <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">File Achievement</p>
                <h2 className="text-4xl font-black text-slate-800">{fPct.toFixed(1)}%</h2>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Target</p>
                <p className="text-lg font-bold text-slate-700 uppercase">{tFil} Nos</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between text-[11px] font-bold uppercase"><span className="text-slate-400">Done</span><span className="text-emerald-600">{dFil} Nos</span></div>
              <div className="flex justify-between text-[11px] font-bold uppercase"><span className="text-slate-400">Gap</span><span className="text-orange-500">{gFil} Nos</span></div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(fPct, 100)}%` }} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
               <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Required DRR</p>
                 <p className="text-2xl font-black text-slate-800">{(gFil > 0 ? gFil/daysLeft : 0).toFixed(1)} <span className="text-[10px] text-slate-400 font-bold uppercase">/ day</span></p>
               </div>
            </div>
          </div>
        </div>

        {/* FLO LIST */}
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <h3 className="text-sm font-black text-slate-800 tracking-widest uppercase">FLO Wise Performance</h3>
            
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setView('files')} 
                className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'files' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                File View
              </button>
              <button 
                onClick={() => setView('amount')} 
                className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'amount' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Amount View
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-[0.2em] bg-slate-50/50">
                  <th className="p-8">FLO Name</th>
                  <th className="p-6 text-center">Achievement</th>
                  <th className="p-6 text-center">Target / Done</th>
                  <th className="p-8 text-right">Required DRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchRows.sort((a: any, b: any) => {
                  const valA = view === 'amount' ? (clean(a["Disb. Done"])/clean(a["Disb. Target"])) : (clean(a["File Done"])/clean(a["File Target"]));
                  const valB = view === 'amount' ? (clean(b["Disb. Done"])/clean(b["Disb. Target"])) : (clean(b["File Done"])/clean(b["File Target"]));
                  return valB - valA;
                }).map((flo: any, i: number) => {
                  const target = view === 'amount' ? clean(flo["Disb. Target"]) : clean(flo["File Target"]);
                  const done = view === 'amount' ? clean(flo["Disb. Done"]) : clean(flo["File Done"]);
                  const pct = target > 0 ? (done / target) * 100 : 0;
                  const gap = target - done;
                  const drr = gap > 0 ? (gap / daysLeft) : 0;

                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <span className="text-[11px] font-black text-slate-300">{(i+1).toString().padStart(2,'0')}</span>
                          <p className="font-bold text-slate-700 uppercase tracking-tight">{flo["FLO Name"]}</p>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-tighter ${pct >= 100 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                          {pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                          {view === 'amount' ? `₹${(target/100000).toFixed(1)}L` : target} / 
                          <span className="text-slate-800 ml-1">{view === 'amount' ? `₹${(done/100000).toFixed(1)}L` : done}</span>
                        </p>
                      </td>
                      <td className="p-8 text-right">
                        <p className={`text-base font-black ${view === 'amount' ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {view === 'amount' ? `₹${(drr/100000).toFixed(2)}L` : drr.toFixed(1)}
                        </p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">/ day</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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