import Papa from 'papaparse';

export async function getSheetData() {
  const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQWueOTwFfnzQ_z0S7giQVxC61fGKSzuvR-Cj8t8akMH_fX0CUVeOeF6TU7IrbXicWr-6jc35HAG7Ga/pub?output=csv";
  
  const response = await fetch(url, { next: { revalidate: 60 } });
  const csvData = await response.text();
  
  const results = Papa.parse(csvData, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true, // This is important!
  });

  return results.data;
}