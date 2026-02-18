'use client';

import React, { useState } from 'react';

export default function BranchClient({ branchRows, configData, branchName }: any) {
  const [view, setView] = useState<'files' | 'amount'>('files');

  const clean = (val: any) => parseFloat(val?.toString().replace(/[^0-9.]/g, '')) || 0;

  // --- SYNCED DATE LOGIC ---
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

  // Branch Totals
  const tAmt = branchRows.reduce((s: any, r: any) => s + clean(r["Disb. Target"]), 0);
  const dAmt = branchRows.reduce((s: any, r: any) => s + clean(r["Disb. Done"]), 0);
  const gAmt = tAmt - dAmt;
  const aPct = tAmt > 0 ? (dAmt / tAmt) * 100 : 0;

  const tFil = branchRows.reduce((s: any, r: any) => s + clean(r["File Target"]), 0);
  const dFil = branchRows.reduce((s: any, r: any) => s + clean(r["File Done"]), 0);
  const gFil = tFil - dFil;
  const fPct = tFil > 0 ? (dFil / tFil) * 100 : 0;

  const deadlineStr = deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-12 font-sans antialiased">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <nav className="mb-8">
            <a href="/" className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] hover:text-white transition-colors">
              ← Territory Business Dashboard
            </a>
          </nav>
          <h1 className="text-6xl font-black tracking-tighter uppercase text-white leading-none">{branchName}</h1>
          <p className="text-slate-500 text-sm font-medium mt-4">Branch Performance Analytics • {daysLeft} Days Remaining</p>
        </header>

        {/* KPI CARDS (RESTRUCTURED) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Disbursement Card */}
          <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2.5rem] backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Disbursement Amount</p>
              <span className="text-2xl font-black text-white">{aPct.toFixed(1)}%</span>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Target Amount</span><span className="text-slate-200">₹{(tAmt/100000).toFixed(1)}L</span></div>
              <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Done Amount</span><span className="text-indigo-400">₹{(dAmt/100000).toFixed(1)}L</span></div>
              <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Gap Amount</span><span className="text-red-500">₹{(gAmt/100000).toFixed(1)}L</span></div>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-8">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${Math.min(aPct, 100)}%` }} />
            </div>
            <div className="pt-6 border-t border-slate-800/60">
               <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Required DRR to achieve by {deadlineStr}</p>
               <p className="text-2xl font-black text-white">₹{(gAmt > 0 ? gAmt/daysLeft/100000 : 0).toFixed(2)}L <span className="text-xs text-slate-500 font-medium">/ Day</span></p>
            </div>
          </div>

          {/* File Number Card */}
          <div className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2.5rem] backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">File Processing</p>
              <span className="text-2xl font-black text-white">{fPct.toFixed(1)}%</span>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Target Files</span><span className="text-slate-200">{tFil} Nos</span></div>
              <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Done Files</span><span className="text-emerald-400">{dFil} Nos</span></div>
              <div className="flex justify-between text-sm font-medium"><span className="text-slate-500">Gap Files</span><span className="text-orange-500">{gFil} Nos</span></div>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-8">
              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(fPct, 100)}%` }} />
            </div>
            <div className="pt-6 border-t border-slate-800/60">
               <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Required DRR to achieve by {deadlineStr}</p>
               <p className="text-2xl font-black text-white">{(gFil > 0 ? gFil/daysLeft : 0).toFixed(1)} <span className="text-xs text-slate-500 font-medium">/ Day</span></p>
            </div>
          </div>
        </div>

        {/* FLO LIST */}
        <div className="bg-slate-900/20 border border-slate-800/50 rounded-[2.5rem] overflow-hidden backdrop-blur-sm shadow-inner">
          <div className="p-8 border-b border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40">
            <h3 className="text-xl font-bold text-white tracking-tight uppercase">FLO Wise Performance</h3>
            
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button onClick={() => setView('files')} className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'files' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Files</button>
              <button onClick={() => setView('amount')} className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'amount' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Amount</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase text-slate-500 font-bold tracking-widest bg-slate-950/20">
                  <th className="p-8">Rank & FLO Name</th>
                  <th className="p-6 text-center">Achievement</th>
                  <th className="p-6 text-center">Target / Done</th>
                  <th className="p-8 text-right">Required DRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
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
                    <tr key={i} className="hover:bg-white/[0.02] transition-all">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <span className={`text-[11px] font-black ${i < 3 ? 'text-indigo-500' : 'text-slate-700'}`}>{(i+1).toString().padStart(2,'0')}</span>
                          <p className="font-bold text-slate-200">{flo["FLO Name"]}</p>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black shadow-inner ${pct >= 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                          {pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <p className="text-[11px] font-bold text-slate-400">
                          {view === 'amount' ? `₹${(target/100000).toFixed(1)}L` : target} / 
                          <span className="text-white ml-1">{view === 'amount' ? `₹${(done/100000).toFixed(1)}L` : done}</span>
                        </p>
                      </td>
                      <td className="p-8 text-right">
                        <p className={`text-base font-black ${view === 'amount' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                          {view === 'amount' ? `₹${(drr/100000).toFixed(2)}L` : drr.toFixed(1)}
                        </p>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">/ Day</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}