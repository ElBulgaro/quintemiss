const SUPABASE_FUNCTION_URL = 'https://jcdfnkuocpnvniqvqcjm.supabase.co/functions/v1/sync-sheet-data';
const WEBHOOK_SECRET = 'your-secret-here';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjZGZua3VvY3Budm5pcXZxY2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MDk4MzMsImV4cCI6MjA0OTA4NTgzM30.JibNC9wcS1n4au1u0eaCTBGhQw5W8uZw2c_Pvw5bvfE';

function formatRanking(value) {
  return value ? value.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') 
    : 'inconnu';
}

function getSheetData(sheet) {
  const range = sheet.getDataRange();
  const [headers, ...rows] = range.getValues();
  
  return rows.map(row => {
    const candidate = {};
    headers.forEach((header, i) => {
      const value = row[i];
      
      switch(header) {
        case 'Age':
          candidate[header] = value ? Number(value) : null;
          break;
        case 'Classement':
          candidate[header] = formatRanking(value);
          break;
        case 'ID':
          candidate[header] = value || null;
          break;
        default:
          candidate[header] = value === '' ? null : value;
      }
    });
    return candidate;
  });
}

function sendToSupabase(sheetType, data) {
  if (!data?.length) {
    console.error('No data to sync');
    return false;
  }

  const response = UrlFetchApp.fetch(SUPABASE_FUNCTION_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'apikey': ANON_KEY
    },
    payload: JSON.stringify({ sheetType, data, secret: WEBHOOK_SECRET }),
    muteHttpExceptions: true
  });

  const success = response.getResponseCode() >= 200 && response.getResponseCode() < 300;
  console.log(success ? 'Sync successful' : `Sync failed: ${response.getContentText()}`);
  return success;
}

function manualSync() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Candidates');
  if (!sheet) {
    console.error('Candidates sheet not found');
    return;
  }
  
  const data = getSheetData(sheet);
  const success = sendToSupabase('candidates', data);
  console.log(`Sync ${success ? 'completed successfully' : 'completed with errors'}`);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Sync')
    .addItem('Sync Now', 'manualSync')
    .addToUi();
}