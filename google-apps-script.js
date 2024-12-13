// Replace these with your values
const SUPABASE_FUNCTION_URL = 'https://jcdfnkuocpnvniqvqcjm.supabase.co/functions/v1/sync-sheet-data';
const WEBHOOK_SECRET = ''; // You'll set this in Supabase secrets

// This function runs when the sheet is edited
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const sheetName = sheet.getName().toLowerCase();
  
  // Only process 'candidates' or 'results' sheets
  if (!['candidates', 'results'].includes(sheetName)) return;
  
  // Get all data from the sheet
  const data = getSheetData(sheet);
  
  // Send to Supabase
  sendToSupabase(sheetName, data);
}

// Get sheet data as array of objects
function getSheetData(sheet) {
  const [headers, ...rows] = sheet.getDataRange().getValues();
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
}

// Send data to Supabase Edge Function
function sendToSupabase(sheetType, data) {
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      sheetType,
      data,
      secret: WEBHOOK_SECRET
    })
  };
  
  try {
    const response = UrlFetchApp.fetch(SUPABASE_FUNCTION_URL, options);
    console.log('Sync response:', response.getContentText());
  } catch (error) {
    console.error('Sync error:', error);
  }
}

// Add this menu item to manually trigger sync
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Sync')
    .addItem('Sync Now', 'manualSync')
    .addToUi();
}

// Manual sync function
function manualSync() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sync candidates
  const candidatesSheet = ss.getSheetByName('Candidates');
  if (candidatesSheet) {
    sendToSupabase('candidates', getSheetData(candidatesSheet));
  }
  
  // Sync results
  const resultsSheet = ss.getSheetByName('Results');
  if (resultsSheet) {
    sendToSupabase('results', getSheetData(resultsSheet));
  }
  
  SpreadsheetApp.getUi().alert('Sync completed!');
}