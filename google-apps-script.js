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
    }),
    muteHttpExceptions: true, // This prevents the script from failing on HTTP errors
    timeout: 30000 // 30 second timeout
  };
  
  try {
    const response = UrlFetchApp.fetch(SUPABASE_FUNCTION_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (responseCode >= 200 && responseCode < 300) {
      console.log('Sync successful:', responseText);
      return true;
    } else {
      console.error('Sync failed with status:', responseCode, responseText);
      return false;
    }
  } catch (error) {
    console.error('Sync error:', error);
    return false;
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
      SpreadsheetApp.getUi().alert('Error: Could not access spreadsheet');
      return;
    }
    
    // Show progress dialog
    SpreadsheetApp.getUi().showModalDialog(
      HtmlService.createHtmlOutput('<p>Syncing data... Please wait.</p>')
        .setWidth(300)
        .setHeight(100),
      'Sync Progress'
    );
    
    let syncSuccess = true;
    
    // Sync candidates
    const candidatesSheet = ss.getSheetByName('Candidates');
    if (candidatesSheet) {
      const candidatesData = getSheetData(candidatesSheet);
      if (candidatesData.length > 0) {
        syncSuccess = syncSuccess && sendToSupabase('candidates', candidatesData);
      }
    }
    
    // Sync results
    const resultsSheet = ss.getSheetByName('Results');
    if (resultsSheet) {
      const resultsData = getSheetData(resultsSheet);
      if (resultsData.length > 0) {
        syncSuccess = syncSuccess && sendToSupabase('results', resultsData);
      }
    }
    
    // Show completion message
    if (syncSuccess) {
      SpreadsheetApp.getUi().alert('Sync completed successfully!');
    } else {
      SpreadsheetApp.getUi().alert('Sync completed with errors. Check logs for details.');
    }
  } catch (error) {
    console.error('Error in manual sync:', error);
    SpreadsheetApp.getUi().alert('Error during sync. Check logs for details.');
  }
}