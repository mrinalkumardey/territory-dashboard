// Version 1.1.0 - Multi-Tab Support for Google Sheets
export async function getSheetData(tabName: string = "Sheet1") {
  // Use your deployed Google Apps Script URL here
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwdxSnBxXug2nZVCv3R519e1_heBE0_k0Cg933cTK6ZI2REBRyq6GUxRH2NWKnrdtDW/exec"; 
  
  try {
    // We pass the tab name as a URL parameter
    const response = await fetch(`${WEB_APP_URL}?tab=${tabName}`, {
      cache: 'no-store', // Ensures we always get fresh data for DRR calculations
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`Error fetching tab "${tabName}" from Google Sheets:`, error);
    // Return an empty array so the app can still render other parts
    return [];
  }
}