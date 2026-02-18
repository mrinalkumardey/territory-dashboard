import { getSheetData } from "@/components/dataFetcher";
import RankingsClient from "./RankingsClient";

export const dynamic = 'force-dynamic';

export default async function RankingsPage() {
  // Dual fetch for Performance and Strategy data
  const [rawData, configData] = await Promise.all([
    getSheetData("Sheet1"),
    getSheetData("Config")
  ]);

  return (
    <RankingsClient 
      initialData={rawData} 
      configData={configData} 
    />
  );
}