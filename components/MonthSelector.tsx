'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';

export default function MonthSelector({ activeMonth }: { activeMonth: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isManualLoading, setIsManualLoading] = useState(false);

  // WATCHER: When activeMonth updates from the server, stop the loading screen
  useEffect(() => {
    setIsManualLoading(false);
  }, [activeMonth]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedMonth = e.target.value;
    
    // Only trigger if the month is actually different
    if (selectedMonth !== activeMonth) {
      setIsManualLoading(true);
      startTransition(() => {
        router.push(`/?month=${selectedMonth}`);
      });
    }
  };

  return (
    <>
      {/* FULL-SCREEN OVERLAY */}
      {(isManualLoading || isPending) && (
        <div className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col items-center justify-center">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          <div className="text-center text-white">
            <h2 className="text-lg font-bold uppercase tracking-[0.3em] animate-pulse">
              Synchronizing Data
            </h2>
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest mt-2">
              Loading {activeMonth === "Feb-26" ? "New" : "Archived"} Cycle...
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 bg-white border border-slate-200 pl-4 pr-1 py-1 rounded-2xl shadow-sm">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cycle:</span>
        <select 
          value={activeMonth}
          disabled={isManualLoading || isPending}
          onChange={handleChange}
          className="bg-transparent text-slate-700 text-[11px] font-bold uppercase tracking-wider px-2 py-1.5 outline-none cursor-pointer disabled:opacity-50"
        >
          <option value="Feb-26">February 2026</option>
          <option value="Jan-26">January 2026</option>
          <option value="Mar-26">March 2026</option>
        </select>
      </div>
    </>
  );
}