export default function FloCard({ 
  name, 
  target, 
  done, 
  fileTarget, 
  fileDone 
}: { 
  name: string, target: number, done: number, fileTarget: number, fileDone: number 
}) {
  const disbPct = Math.min((done / target) * 100, 100) || 0;
  const filePct = Math.min((fileDone / fileTarget) * 100, 100) || 0;
  const gap = target - done;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all">
      <h3 className="text-xl font-bold mb-4">{name}</h3>
      
      {/* Disbursement Progress (The Money) */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] mb-1 text-blue-400 uppercase font-bold tracking-wider">
          <span>Disbursement Ach.</span>
          <span>{disbPct.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-1000" 
            style={{ width: `${disbPct}%` }}
          />
        </div>
      </div>

      {/* File Progress (The Volume) */}
      <div className="mb-6">
        <div className="flex justify-between text-[10px] mb-1 text-emerald-400 uppercase font-bold tracking-wider">
          <span>Files Ach. ({fileDone}/{fileTarget})</span>
          <span>{filePct.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-1000" 
            style={{ width: `${filePct}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
        <div className="text-center">
          <p className="text-[9px] text-slate-500 uppercase">Target</p>
          <p className="font-bold text-xs text-slate-300">₹{(target/100000).toFixed(1)}L</p>
        </div>
        <div className="text-center border-x border-white/5">
          <p className="text-[9px] text-slate-500 uppercase">Done</p>
          <p className="font-bold text-xs text-blue-400">₹{(done/100000).toFixed(1)}L</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-slate-500 uppercase">Gap</p>
          <p className="font-bold text-xs text-red-500">₹{(gap > 0 ? gap/100000 : 0).toFixed(1)}L</p>
        </div>
      </div>
    </div>
  );
}