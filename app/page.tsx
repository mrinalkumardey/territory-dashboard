import { getSheetData } from "@/components/dataFetcher";
import MonthSelector from "@/components/MonthSelector";

export const dynamic = 'force-dynamic';

interface SheetRow {
  "FLO Name": string;
  "Branch": string;
  "Disb. Target": any;
  "Disb. Done": any;
  "File Target": any;
  "File Done": any;
  [key: string]: any;
}

interface ConfigRow {
  Parameter: string;
  Value: any;
}

// Next.js 15: searchParams is a Promise
export default async function Home({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const resolvedSearchParams = await searchParams;

  // 1. Determine active cycle (defaults to current month)
  const todayDate = new Date();
  const currentMonthDefault = todayDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }).replace(' ', '-');
  const activeMonth = resolvedSearchParams.month || currentMonthDefault;

  // 2. Fetch data with safety fallbacks to prevent crashes
  const [rawData, configData] = await Promise.all([
    getSheetData(activeMonth).catch(() => []),
    getSheetData("Config").catch(() => [])
  ]);

  // Ensure variables are always arrays even if fetch fails
  const data = (Array.isArray(rawData) ? rawData : []) as SheetRow[];
  const config = (Array.isArray(configData) ? configData : []) as ConfigRow[];

  const clean = (val: any): number => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const parseSheetDate = (dateVal: any) => {
    if (!dateVal) return null;
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d;
    const dateStr = dateVal.toString();
    const parts = dateStr.split(/[/.-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return null;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rawDeadline = config.find(c => c.Parameter === "Target Deadline")?.Value;
  const deadline = parseSheetDate(rawDeadline) || new Date(2026, 1, 26);
  deadline.setHours(0, 0, 0, 0);
  
  const offDays = config
    .filter(c => c.Parameter === "Off Day")
    .map(c => {
      const d = parseSheetDate(c.Value);
      if (d) {
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }
      return 0;
    }).filter(t => t !== 0);

  let workingDaysLeft = 0;
  let tempDate = new Date(today);
  while (tempDate <= deadline) {
    if (!offDays.includes(tempDate.getTime())) {
      workingDaysLeft++;
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }
  const daysToDisplay = workingDaysLeft > 0 ? workingDaysLeft : 1;

  // SAFE FILTERING: Prevents the "cannot read property filter of undefined" error
  const validRows = data.filter(row => row && row["FLO Name"] && !row["FLO Name"].toString().toLowerCase().includes("total"));

  const totalTarget = validRows.reduce((sum, row) => sum + clean(row["Disb. Target"]), 0);
  const totalDone = validRows.reduce((sum, row) => sum + clean(row["Disb. Done"]), 0);
  const totalGap = totalTarget - totalDone;
  const territoryPct = totalTarget > 0 ? (totalDone / totalTarget) * 100 : 0;

  const totalFileTarget = validRows.reduce((sum, row) => sum + clean(row["File Target"]), 0);
  const totalFileDone = validRows.reduce((sum, row) => sum + clean(row["File Done"]), 0);
  const totalFileGap = totalFileTarget - totalFileDone;
  const filePct = totalFileTarget > 0 ? (totalFileDone / totalFileTarget) * 100 : 0;

  const uniqueBranches = Array.from(new Set(validRows.map(row => row.Branch))).filter(Boolean);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      <div className="h-2 w-full bg-blue-600" />
      
      <div className="max-w-6xl mx-auto px-6 py-12 flex-grow w-full">
        {/* REFINED HEADER */}
        <header className="mb-12 border-b border-slate-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Tezpur Territory <span className="text-blue-600">Dashboard</span>
            </h1>
            <div className="flex items-center gap-4 mt-2">
               <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest border-r border-slate-300 pr-4">
                 Closing: {deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {daysToDisplay} Days Left
               </p>
               <a href="/trends" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors flex items-center gap-1">
                 View Trend Analysis <span className="text-xs font-light">↗</span>
               </a>
            </div>
          </div>

          {/* ARCHIVE SELECTOR */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 pl-4 pr-1 py-1 rounded-2xl shadow-sm">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cycle:</span>
            <MonthSelector activeMonth={activeMonth} />
          </div>
        </header>

        {/* Hero Scorecard */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-blue-600 text-[10px] font-bold uppercase tracking-widest">Disbursement Achievement</p>
                    <h2 className="text-5xl font-black text-slate-800 mt-1">{territoryPct.toFixed(1)}<span className="text-xl text-blue-600">%</span></h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Target</p>
                    <p className="text-lg font-bold text-slate-700">₹{(totalTarget/100000).toFixed(1)}L</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(territoryPct, 100)}%` }} />
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold uppercase">
                  <div><span className="text-slate-400">Done:</span> <span className="text-blue-600">₹{(totalDone/100000).toFixed(1)}L</span></div>
                  <div><span className="text-slate-400">Gap:</span> <span className="text-red-500">₹{(totalGap/100000).toFixed(1)}L</span></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">File Achievement</p>
                    <h2 className="text-5xl font-black text-slate-800 mt-1">{filePct.toFixed(1)}<span className="text-xl text-emerald-600">%</span></h2>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Target Files</p>
                    <p className="text-lg font-bold text-slate-700">{totalFileTarget}</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(filePct, 100)}%` }} />
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold uppercase">
                  <div><span className="text-slate-400">Done:</span> <span className="text-emerald-600">{totalFileDone} Nos</span></div>
                  <div><span className="text-slate-400">Gap:</span> <span className="text-orange-500">{totalFileGap} Nos</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {uniqueBranches.map((branchName: any) => {
            const bRows = validRows.filter(row => row.Branch === branchName);
            const amtT = bRows.reduce((s, r) => s + clean(r["Disb. Target"]), 0);
            const amtD = bRows.reduce((s, r) => s + clean(r["Disb. Done"]), 0);
            const filT = bRows.reduce((s, r) => s + clean(r["File Target"]), 0);
            const filD = bRows.reduce((s, r) => s + clean(r["File Done"]), 0);
            
            const fGap = filT - filD;
            const fDRR = fGap > 0 ? (fGap / daysToDisplay).toFixed(1) : "0.0";
            const bAchv = amtT > 0 ? (amtD / amtT) * 100 : 0;

            return (
              <div key={branchName} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{branchName}</h3>
                  <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 text-right">
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Req. File DRR</p>
                    <p className="text-xl font-black text-emerald-700">{fDRR}<span className="text-[10px]"> /Day</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Amount Stats</p>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold text-nowrap">Target / Done</p>
                      <p className="text-sm font-bold text-slate-700">₹{(amtT/100000).toFixed(1)}L / <span className="text-blue-600">₹{(amtD/100000).toFixed(1)}L</span></p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold text-nowrap">Gap / Achv%</p>
                      <p className="text-sm font-bold text-slate-700"><span className="text-red-500">₹{((amtT-amtD)/100000).toFixed(1)}L</span> / {bAchv.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">File Stats</p>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Target / Done</p>
                      <p className="text-sm font-bold text-slate-700">{filT} / <span className="text-emerald-600">{filD}</span></p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Gap / Achv%</p>
                      <p className="text-sm font-bold text-slate-700"><span className="text-orange-500">{filT-filD}</span> / {filT > 0 ? ((filD/filT)*100).toFixed(1) : 0}%</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${Math.min(bAchv, 100)}%` }} />
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(filT > 0 ? (filD/filT)*100 : 0, 100)}%` }} />
                  </div>
                </div>
                
                <a href={`/branch/${branchName.toLowerCase()}`} className="mt-8 block text-center py-4 rounded-2xl bg-slate-50 text-blue-600 font-bold text-[11px] hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest border border-slate-100">
                  Full Branch Details →
                </a>
              </div>
            );
          })}
        </div>

        <div className="mb-12">
          <a href="/rankings" className="flex items-center justify-between p-8 bg-slate-900 rounded-[2.5rem] text-white hover:bg-slate-800 transition-all shadow-xl group">
            <div>
              <h4 className="text-2xl font-black uppercase tracking-tighter">🏆 Full Rankings</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Leaderboard Analysis</p>
            </div>
            <span className="text-3xl">→</span>
          </a>
        </div>
      </div>

      <footer className="w-full py-8 text-center bg-white border-t border-slate-100 mt-auto">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          Developed by <a href="https://www.linkedin.com/in/mrinal-kumar-dey/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-black">Mrinal Kumar</a>
        </p>
      </footer>
    </main>
  );
}