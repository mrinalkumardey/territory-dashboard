import { getSheetData } from "@/components/dataFetcher";
import RankingsClient from "./RankingsClient";

export const dynamic = 'force-dynamic';

export default async function RankingsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ month?: string }> 
}) {
  // 1. Resolve searchParams for Next.js 15
  const resolvedSearchParams = await searchParams;

  // 2. Determine active month (Defaults to current cycle)
  const todayDate = new Date();
  const currentMonthDefault = todayDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }).replace(' ', '-');
  const activeMonth = resolvedSearchParams.month || currentMonthDefault;

  // 3. Fetch data with safety fallbacks
  const [rawData, configData] = await Promise.all([
    getSheetData(activeMonth).catch(() => []),
    getSheetData("Config").catch(() => [])
  ]);

  // 4. Ensure data is always an array to prevent .filter() crashes
  const data = (Array.isArray(rawData) ? rawData : []) as any[];
  
  return (
    <RankingsClient 
      initialData={data} 
      configData={configData} 
      activeMonth={activeMonth}
    />
  );
}