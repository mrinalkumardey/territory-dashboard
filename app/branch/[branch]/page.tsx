import FloCard from "@/components/FloCard";
import { getSheetData } from "@/components/dataFetcher";

export default async function BranchPage({ params }: { params: Promise<{ branch: string }> }) {
  const resolvedParams = await params;
  const currentBranch = resolvedParams.branch;

  async function displayBranchData() {
    const allData: any[] = await getSheetData();
    return allData.filter((row) => {
      if (row && row.Branch) {
        return row.Branch.toString().toLowerCase() === currentBranch.toLowerCase();
      }
      return false;
    });
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-10 font-sans">
      <a href="/" className="text-blue-400 hover:text-blue-300 transition-colors mb-8 inline-block font-medium">
        ← Back to Territory Overview
      </a>
      
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold capitalize tracking-tight">
          {currentBranch} <span className="text-slate-500 font-light">Branch Performance</span>
        </h1>
        <p className="text-slate-400 mt-2">Live synchronization with Google Sheets active.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        <BranchContent fetcher={displayBranchData()} />
      </div>
    </main>
  );
}

async function BranchContent({ fetcher }: { fetcher: Promise<any[]> }) {
  const branchRows = await fetcher;

  const cleanNumber = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const cleaned = val.toString().replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  if (branchRows.length === 0) {
    return (
      <div className="col-span-full p-10 border border-dashed border-white/10 rounded-2xl text-center">
        <p className="text-slate-500">No data found for this branch.</p>
      </div>
    );
  }

  return (
    <>
      {branchRows.map((flo, index) => {
        // Cleaning all 4 metrics at once
        const doneValue = cleanNumber(flo["Disb. Done"] ?? flo["Disb Done"]);
        const targetValue = cleanNumber(flo["Disb. Target"] ?? flo["Disb Target"]);
        const fDone = cleanNumber(flo["File Done"] ?? flo["File. Done"]); 
        const fTarget = cleanNumber(flo["File Target"] ?? flo["File. Target"]);

        return (
          <FloCard 
            key={index}
            name={flo["FLO Name"] || "Unknown FLO"} 
            target={targetValue} 
            done={doneValue}
            fileTarget={fTarget}
            fileDone={fDone}
          />
        );
      })}
    </>
  );
}