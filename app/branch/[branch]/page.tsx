import { getSheetData } from "@/components/dataFetcher";
import { notFound } from "next/navigation";
import BranchClient from "./BranchClient"; // We'll create this to handle the toggle

export const dynamic = 'force-dynamic';

export default async function BranchDetailPage({ params }: { params: Promise<{ branch: string }> }) {
  const [rawData, configData] = await Promise.all([
    getSheetData("Sheet1"),
    getSheetData("Config")
  ]);

  const resolvedParams = await params;
  const branchSlug = decodeURIComponent(resolvedParams.branch).toLowerCase();
  
  const branchRows = (rawData as any[]).filter(
    row => row.Branch && row.Branch.toString().toLowerCase() === branchSlug
  );

  if (branchRows.length === 0) return notFound();

  // Pass everything to the Client component for the Toggle and Search features
  return (
    <BranchClient 
      branchRows={branchRows} 
      configData={configData} 
      branchName={branchRows[0].Branch}
    />
  );
}