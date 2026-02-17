import { getSheetData } from "@/components/dataFetcher";

export default async function RankingsPage() {
  const data: any[] = await getSheetData();
  
  const clean = (val: any) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  const sortedData = data
    .filter((row: any) => row && row["FLO Name"]) // Explicitly typed as any
    .map((row: any) => {
        const target = clean(row["Disb. Target"]);
        const done = clean(row["Disb. Done"]);
        return {
            ...row,
            target,
            done,
            gap: target - done,
            pct: target > 0 ? (done / target) * 100 : 0
        };
    })
    .sort((a, b) => b.pct - a.pct);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="text-blue-400 hover:underline mb-8 inline-block">← Back to Overview</a>
        <h1 className="text-4xl font-black mb-10">🏆 Territory <span className="text-blue-500">Rankings</span></h1>
        
        {/* Outer Rounded Container */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
          
          {/* THE RESPONSIVE WRAPPER: This allows swiping on mobile */}
          <div className="w-full overflow-x-auto">
            
            {/* Added min-width to prevent squishing */}
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-white/10 text-[10px] uppercase text-slate-400">
                <tr>
                  <th className="p-5">Rank</th>
                  <th className="p-5">FLO Name</th>
                  <th className="p-5">Branch</th>
                  <th className="p-5 text-right">Target</th>
                  <th className="p-5 text-right">Done</th>
                  <th className="p-5 text-right">Gap</th>
                  <th className="p-5 text-center">Ach %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedData.map((flo: any, i: number) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-5 font-bold text-blue-500 text-lg">#{i + 1}</td>
                    <td className="p-5 font-semibold">{flo["FLO Name"]}</td>
                    <td className="p-5 text-slate-400 text-sm">{flo["Branch"]}</td>
                    <td className="p-5 text-right text-xs">₹{(flo.target/100000).toFixed(1)}L</td>
                    <td className="p-5 text-right text-xs text-blue-400 font-bold">₹{(flo.done/100000).toFixed(1)}L</td>
                    <td className="p-5 text-right text-xs text-red-500">₹{(flo.gap/100000).toFixed(1)}L</td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        flo.pct >= 100 ? 'bg-green-500/20 text-green-400' : 
                        flo.pct >= 80 ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {flo.pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* End of Responsive Wrapper */}

        </div>
        
        {/* Mobile Swipe Hint */}
        <p className="md:hidden text-center text-slate-500 text-[10px] mt-4 uppercase tracking-widest">
          ← Swipe to view more details →
        </p>
      </div>
    </main>
  );
}