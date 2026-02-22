import { getSheetData } from "@/components/dataFetcher";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trend Analysis | Territory Dashboard",
};

export const dynamic = 'force-dynamic';

export default async function TrendsPage() {
  // Fetching live data and the history snapshots
  const [currentData, historyData] = await Promise.all([
    getSheetData("Sheet1"),
    getSheetData("History")
  ]);

  const clean = (val: any) => parseFloat(val?.toString().replace(/[^0-9.]/g, '')) || 0;

  // 1. Current State Calculations
  const validCurrent = (currentData as any[]).filter(r => r["FLO Name"] && !r["FLO Name"].toLowerCase().includes("total"));
  const totalDoneNow = validCurrent.reduce((s, r) => s + clean(r["Disb. Done"]), 0);
  const totalFilesNow = validCurrent.reduce((s, r) => s + clean(r["File Done"]), 0);

  // 2. Historical Analysis (Comparing vs Yesterday)
  const history = historyData as any[];
  const yesterday = new Date(); 
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const yesterdayRows = history.filter(r => {
    const d = new Date(r.Date);
    return d.toDateString() === yesterdayStr;
  });

  const totalDonePrev = yesterdayRows.reduce((s, r) => s + clean(r["Disb Done"]), 0);
  const variance = totalDonePrev > 0 ? ((totalDoneNow - totalDonePrev) / totalDonePrev) * 100 : 0;

  // 3. Efficiency Metric: Disbursement per File
  const efficiency = totalFilesNow > 0 ? (totalDoneNow / totalFilesNow) : 0;

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* NAV & HEADER */}
        <header className="mb-12">
          <nav className="mb-8">
            <a href="/" className="inline-flex items-center text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] hover:opacity-70 transition-all">
              <span className="mr-2 text-sm">←</span> Return to Live Dashboard
            </a>
          </nav>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                Trend & <span className="text-blue-600">Variance</span>
              </h1>
              <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">
                Historical Performance Intelligence
              </p>
            </div>
            
            <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm border-l-4 border-l-emerald-500">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">System Status</p>
              <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                History Recording Active
              </p>
            </div>
          </div>
        </header>

        {/* ANALYTICAL KPI GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Main Growth Card */}
          <div className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between min-h-[350px]">
            <div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Momentum Tracker</p>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Territory Volume Velocity</h3>
            </div>
            
            <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl my-6 bg-slate-50/50">
               <p className="text-slate-400 text-xs font-medium uppercase tracking-widest text-center px-8 leading-relaxed">
                 Establishing Performance Baseline... <br/>
                 <span className="text-[10px] font-normal lowercase mt-2 block text-slate-300 italic">
                   Daily snapshots are being recorded to generate trajectory lines
                 </span>
               </p>
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day-over-Day Variance</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-3xl font-black ${variance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                  </p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">vs Yesterday</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Snapshot Date</p>
                <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
              </div>
            </div>
          </div>

          {/* Efficiency Sidebar */}
          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-6">Efficiency Matrix</p>
            
            <div className="space-y-10">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Yield per File</p>
                <p className="text-4xl font-black text-slate-800 tracking-tighter italic">₹{(efficiency / 100000).toFixed(2)}L</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase mt-2 tracking-wider">Average Disbursement Value</p>
              </div>
              
              <div className="pt-8 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Territory Contribution</p>
                <p className="text-4xl font-black text-slate-800 tracking-tighter">
                  {validCurrent.length} <span className="text-lg text-slate-400 uppercase font-black">Active FLOs</span>
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[9px] text-blue-700 font-bold leading-relaxed uppercase tracking-wide text-center">
                Efficiency is calculated by dividing total disbursement by total files logged.
              </p>
            </div>
          </div>
        </div>

        {/* CONTRIBUTION TABLE */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Branch Impact Analysis</h3>
            <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">Weightage %</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-[0.2em] bg-slate-50/50">
                  <th className="p-6">Branch Name</th>
                  <th className="p-6">Performance Mix</th>
                  <th className="p-6 text-right">Volume Done</th>
                  <th className="p-6 text-right">Market Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Array.from(new Set(validCurrent.map(r => r.Branch))).map(branchName => {
                  const bRows = validCurrent.filter(r => r.Branch === branchName);
                  const bDone = bRows.reduce((s, r) => s + clean(r["Disb. Done"]), 0);
                  const share = (bDone / totalDoneNow) * 100;

                  return (
                    <tr key={branchName} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6">
                        <p className="font-black text-slate-700 uppercase tracking-tight">{branchName}</p>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-xs font-black text-slate-400">{share.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <p className="font-bold text-slate-800 text-sm italic">₹{(bDone / 100000).toFixed(1)}L</p>
                      </td>
                      <td className="p-6 text-right">
                         <span className={`text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${share > 30 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                           {share > 30 ? 'High Impact' : 'Support'}
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

      <footer className="mt-20 py-12 text-center bg-white border-t border-slate-100 -mx-6 md:-mx-12">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">
          Territory Intelligence Suite • MRINAL KUMAR
        </p>
      </footer>
    </main>
  );
}