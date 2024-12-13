// Replace these with your values
const SUPABASE_FUNCTION_URL = 'https://jcdfnkuocpnvniqvqcjm.supabase.co/functions/v1/sync-sheet-data';
const WEBHOOK_SECRET = ''; // You'll set this in Supabase secrets

// Get sheet data as array of objects
function getSheetData(sheet) {
  try {
    const range = sheet.getDataRange();
    if (!range) {
      console.error('No data range found in sheet');
      return [];
    }

    const values = range.getValues();
    if (!values || values.length === 0) {
      console.error('No data found in sheet');
      return [];
    }

    const [headers, ...rows] = values;
    return rows.map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
  } catch (error) {
    console.error('Error getting sheet data:', error);
    return [];
  }
}

// Send data to Supabase Edge Function
function sendToSupabase(sheetType, data) {
  if (!data || data.length === 0) {
    console.error('No data to sync');
    return;
  }

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
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Sync')
      .addItem('Sync Now', 'manualSync')
      .addToUi();
  } catch (error) {
    console.error('Error creating menu:', error);
  }
}

// Manual sync function
function manualSync() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      console.error('Could not get active spreadsheet');
      return;
    }
    
    // Sync candidates
    const candidatesSheet = ss.getSheetByName('Candidates');
    if (candidatesSheet) {
      const candidatesData = getSheetData(candidatesSheet);
      if (candidatesData.length > 0) {
        sendToSupabase('candidates', candidatesData);
      }
    }
    
    // Sync results
    const resultsSheet = ss.getSheetByName('Results');
    if (resultsSheet) {
      const resultsData = getSheetData(resultsSheet);
      if (resultsData.length > 0) {
        sendToSupabase('results', resultsData);
      }
    }
    
    SpreadsheetApp.getUi().alert('Sync completed!');
  } catch (error) {
    console.error('Error in manual sync:', error);
    SpreadsheetApp.getUi().alert('Error during sync. Check logs for details.');
  }
}