// Version 1.0.7 - Smart Filtering & Auto-Branch Detection
import { getSheetData } from "@/components/dataFetcher";

interface SheetRow {
  "FLO Name": string;
  "Branch": string;
  "Disb. Target": any;
  "Disb. Done": any;
  "File Target": any; 
  "File Done": any;
  [key: string]: any;
}

export default async function Home() {
  const rawData = await getSheetData();
  const data = rawData as SheetRow[];
  
  const clean = (val: any): number => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // --- SMART FILTERING ---
  // Only include rows that have an FLO Name and are NOT "Total" summary rows
  const validRows = data.filter(row => 
    row["FLO Name"] && 
    !row["FLO Name"].toString().toLowerCase().includes("total")
  );

  // --- DISBURSEMENT CALCULATIONS ---
  const totalTarget = validRows.reduce((sum: number, row: SheetRow) => sum + clean(row["Disb. Target"]), 0);
  const totalDone = validRows.reduce((sum: number, row: SheetRow) => sum + clean(row["Disb. Done"]), 0);
  const totalGap = totalTarget - totalDone;
  const territoryPct = totalTarget > 0 ? (totalDone / totalTarget) * 100 : 0;

  // --- FILE CALCULATIONS ---
  const totalFileTarget = validRows.reduce((sum: number, row: SheetRow) => sum + clean(row["File Target"]), 0);
  const totalFileDone = validRows.reduce((sum: number, row: SheetRow) => sum + clean(row["File Done"]), 0);
  const totalFileGap = totalFileTarget - totalFileDone;
  const filePct = totalFileTarget > 0 ? (totalFileDone / totalFileTarget) * 100 : 0;

  // --- AUTO-DETECT BRANCHES ---
  const uniqueBranches = Array.from(new Set(validRows.map(row => row.Branch))).filter(Boolean);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      <div className="h-2 w-full bg-blue-600" />

      <div className="max-w-6xl mx-auto px-6 py-12 flex-grow">
        
        <header className="mb-12 border-b border-slate-200 pb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Tezpur Territory <span className="text-blue-600">Dashboard</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">Operational Performance Analytics</p>
          </div>
          <div className="hidden md:block text-right">
            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
              February 2026 Cycle
            </span>
          </div>
        </header>

        {/* Hero Scorecard Section */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* BLOCK 1: AMOUNT DISBURSEMENT */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest">Disbursement Achievement</p>
                    <h2 className="text-5xl font-black text-slate-800 mt-1">
                      {territoryPct.toFixed(1)}<span className="text-xl text-blue-600">%</span>
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Target</p>
                    <p className="text-lg font-bold text-slate-700">₹{(totalTarget/100000).toFixed(1)}L</p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(territoryPct, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Disb. Done</p>
                    <p className="text-sm font-bold text-blue-600">₹{(totalDone/100000).toFixed(1)}L</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Disb. Gap</p>
                    <p className="text-sm font-bold text-red-500">₹{(totalGap/100000).toFixed(1)}L</p>
                  </div>
                </div>
              </div>

              {/* BLOCK 2: FILE TARGETS */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">File Achievement</p>
                    <h2 className="text-5xl font-black text-slate-800 mt-1">
                      {filePct.toFixed(1)}<span className="text-xl text-emerald-600">%</span>
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Target Files</p>
                    <p className="text-lg font-bold text-slate-700">{totalFileTarget}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(filePct, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between mt-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Files Done</p>
                    <p className="text-sm font-bold text-emerald-600">{totalFileDone} Nos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Files Gap</p>
                    <p className="text-sm font-bold text-orange-500">{totalFileGap} Nos</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Territory Stars */}
        <div className="mb-12">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Top 3 Performers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {validRows
              .map((row: SheetRow) => ({
                name: row["FLO Name"],
                branch: row["Branch"],
                pct: (clean(row["Disb. Done"]) / clean(row["Disb. Target"])) * 100
              }))
              .sort((a, b) => b.pct - a.pct)
              .slice(0, 3)
              .map((flo, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl border border-blue-50 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-blue-300 transition-all">
                  <div className="absolute top-0 right-0 p-2 text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {flo.name ? String(flo.name).charAt(0) : "F"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm leading-tight">{flo.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">{flo.branch}</p>
                    <p className="text-xs font-black text-blue-600 mt-1">{flo.pct.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Branch Analysis - NOW AUTO-DETECTING BRANCHES */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-12">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Branch Analysis (Achievement)</h3>
          <div className="space-y-6">
            {uniqueBranches.map((branchName: any) => {
              const branchData = validRows.filter((row: SheetRow) => 
                row && row.Branch && row.Branch.toString().toLowerCase() === branchName.toString().toLowerCase()
              );
              const bTarget = branchData.reduce((sum: number, row: SheetRow) => sum + clean(row["Disb. Target"]), 0);
              const bDone = branchData.reduce((sum: number, row: any) => sum + clean(row["Disb. Done"]), 0);
              const bPct = bTarget > 0 ? Math.min((bDone / bTarget) * 100, 100) : 0;

              return (
                <div key={branchName}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">{branchName}</span>
                    <span className="text-sm font-mono font-bold text-blue-600">{bPct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        bPct >= 90 ? 'bg-emerald-500' : bPct >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${bPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <a href="/rankings" className="flex items-center justify-between p-6 bg-slate-900 rounded-3xl text-white hover:bg-slate-800 transition-all">
              <div>
                <h4 className="text-lg font-bold italic uppercase tracking-tighter">🏆 Full Rankings</h4>
                <p className="text-slate-400 text-xs">Hall of Fame</p>
              </div>
              <span className="text-2xl">→</span>
            </a>
            <div className="p-6 bg-white border border-slate-200 rounded-3xl">
               <div className="grid grid-cols-2 gap-4 w-full">
                  {uniqueBranches.map((b: any) => (
                    <a key={b} href={`/branch/${b}`} className="text-xs font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest">
                      {b} →
                    </a>
                  ))}
               </div>
            </div>
        </div>
      </div>

      <footer className="w-full py-8 border-t border-slate-200 text-center bg-white">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          Developed by{" "}
          <a 
            href="https://www.linkedin.com/in/mrinal-kumar-dey/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 font-bold hover:underline"
          >
            Mrinal Kumar
          </a>
        </p>
      </footer>
    </main>
  );
}