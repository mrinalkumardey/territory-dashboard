'use client';

import React, { useState } from 'react';

export default function RankingsClient({ initialData, configData }: any) {
  const [view, setView] = useState<'files' | 'amount'>('files');
  const [searchTerm, setSearchTerm] = useState("");

  const safeConfig = Array.isArray(configData) ? configData : [];
  const safeData = Array.isArray(initialData) ? initialData : [];

  const clean = (val: any): number => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

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

  // --- FILTER & SORT LOGIC ---
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

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 antialiased font-sans p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex justify-between items-start mb-8">
            <div>
              <a href="/" className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em] hover:text-white transition-colors">← Back to Overview</a>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase mt-2 text-white">
                🏆 Territory <span className="text-indigo-500 text-normal not-italic">Rankings</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase mt-1 tracking-widest">
                Cycle: {deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {daysToDisplay} Production Days Left
              </p>
            </div>

            <div className="hidden md:flex flex-col gap-2">
               {/* TOGGLE */}
               <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button onClick={() => setView('files')} className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'files' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Files</button>
                <button onClick={() => setView('amount')} className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'amount' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Amount</button>
              </div>
            </div>
          </div>

          {/* SEARCH & MOBILE TOGGLE */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Search FLO or Branch..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all text-white placeholder:text-slate-600"
              />
            </div>
            <div className="md:hidden flex w-full bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button onClick={() => setView('files')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'files' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Files</button>
                <button onClick={() => setView('amount')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${view === 'amount' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>Amount</button>
            </div>
          </div>
        </header>

        <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-slate-800/60 overflow-hidden shadow-2xl">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-900/60 border-b border-slate-800">
                <tr className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">
                  <th className="p-6">Rank</th>
                  <th className="p-6">FLO Name</th>
                  <th className="p-6">Branch</th>
                  <th className="p-6 text-right">Target</th>
                  <th className="p-6 text-right">Done</th>
                  <th className="p-6 text-right">Gap</th>
                  <th className="p-6 text-center">Required DRR</th>
                  <th className="p-6 text-center">Ach %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredData.map((flo, i) => {
                  const target = view === 'amount' ? flo.targetAmt : flo.targetFil;
                  const done = view === 'amount' ? flo.doneAmt : flo.doneFil;
                  const gap = target - done;
                  const drr = gap > 0 ? (gap / daysToDisplay) : 0;

                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6 font-black text-indigo-500 text-lg">
                        {(i + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="p-6">
                        <p className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">{flo["FLO Name"]}</p>
                      </td>
                      <td className="p-6 text-slate-400">
                        <span className="text-[10px] font-bold border border-slate-700 px-2 py-1 rounded bg-slate-800/40 uppercase tracking-wider">
                          {flo["Branch"]}
                        </span>
                      </td>
                      <td className="p-6 text-right text-xs">
                        {view === 'amount' ? `₹${(target/100000).toFixed(1)}L` : target}
                      </td>
                      <td className="p-6 text-right text-xs text-indigo-400 font-bold">
                        {view === 'amount' ? `₹${(done/100000).toFixed(1)}L` : done}
                      </td>
                      <td className="p-6 text-right text-xs text-red-500">
                        {view === 'amount' ? `₹${(gap/100000).toFixed(1)}L` : gap}
                      </td>
                      <td className="p-6 text-center">
                        <div className="inline-flex flex-col items-center">
                           <p className={`text-sm font-black ${view === 'amount' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                             {view === 'amount' ? `₹${(drr/100000).toFixed(2)}L` : drr.toFixed(1)}
                           </p>
                           <p className="text-[8px] font-bold text-slate-600 uppercase">/ Day</p>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black italic shadow-inner ${
                          flo.pct >= 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                          flo.pct >= 80 ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                          'bg-slate-800 text-slate-500'
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
    </main>
  );
}