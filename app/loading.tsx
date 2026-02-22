export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
      {/* This is a simple CSS-only animated loader */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
      
      <div className="text-center">
        <h2 className="text-white text-lg font-bold uppercase tracking-[0.3em] animate-pulse">
          Synchronizing Data
        </h2>
        <p className="text-slate-500 text-[10px] font-medium uppercase tracking-widest mt-2">
          Please wait a moment....
        </p>
      </div>
    </div>
  );
}
