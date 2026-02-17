"use client"; // Required for search functionality

import { useState, useEffect } from "react";
import { getSheetData } from "@/components/dataFetcher";

// Type definition to keep the build safe
interface SheetRow {
  "FLO Name": string;
  "Branch": string;
  "Disb. Target": any;
  "Disb. Done": any;
  [key: string]: any;
}

export default function RankingsPage() {
  const [data, setData] = useState<SheetRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch data on component load
  useEffect(() => {
    async function loadData() {
      const rawData = await getSheetData();
      setData(rawData as SheetRow[]);
      setLoading(false);
    }
    loadData();
  }, []);

  const clean = (val: any): number => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Filter and Sort Logic
  const filteredData = data
    .filter((row) => row["FLO Name"]) // Remove empty rows
    .map((row) => {
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
    .filter((flo) => 
      flo["FLO Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
      flo["Branch"].toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.pct - a.pct);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
      <p className="animate-pulse">Loading Rankings...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <a href="/" className="text-blue-400 hover:underline mb-8 inline-block">← Back to Overview</a>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <h1 className="text-4xl font-black">🏆 Territory <span className="text-blue-500">Rankings</span></h1>
          
          {/* SEARCH BAR */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Search Name or Branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 w-full md:w-80 text-sm focus:outline-none focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-3 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
          <div className="w-full overflow-x-auto">
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
                {filteredData.map((flo, i) => (
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
        </div>
        
        <p className="md:hidden text-center text-slate-500 text-[10px] mt-4 uppercase tracking-widest">
          ← Swipe to view more details →
        </p>
      </div>
    </main>
  );
}