import { getSheetData } from "@/components/dataFetcher";
import { notFound } from "next/navigation";
import BranchClient from "./BranchClient";

export const dynamic = 'force-dynamic';

export default async function BranchDetailPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ branch: string }>,
  searchParams: Promise<{ month?: string }> 
}) {
  // 1. Resolve params and searchParams (Next.js 15 requirement)
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams
  ]);

  const branchSlug = decodeURIComponent(resolvedParams.branch).toLowerCase();

  // 2. Determine the Month (Matches Home Page logic)
  const todayDate = new Date();
  const currentMonthDefault = todayDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }).replace(' ', '-');
  const activeMonth = resolvedSearchParams.month || currentMonthDefault;

  // 3. Fetch data from the Dynamic Tab (e.g., Feb-26)
  const [rawData, configData] = await Promise.all([
    getSheetData(activeMonth).catch(() => []),
    getSheetData("Config").catch(() => [])
  ]);

  // 4. Safe Data Handling
  const data = (Array.isArray(rawData) ? rawData : []) as any[];
  
  // 5. Filter for the specific branch
  const branchRows = data.filter(
    row => row && row.Branch && row.Branch.toString().trim().toLowerCase() === branchSlug
  );

  // 6. Final safety check
  if (branchRows.length === 0) return notFound();

  return (
    <BranchClient 
      branchRows={branchRows} 
      configData={configData} 
      branchName={branchRows[0].Branch}
      activeMonth={activeMonth} // We pass this so the back button knows where to go
    />
  );
}