# InSightify - Data Ingestion Testing Guide

## 🎯 Overview
This guide covers testing all data ingestion methods to ensure they work correctly with the InSightify application.

## 📊 Current Status
- ✅ **CSV**: Working perfectly (67 KPIs stored)
- ✅ **PDF**: Working perfectly (57 KPIs stored)
- ❓ **XLS/XLSX**: Need to test
- ❓ **Google Drive**: Need to test
- ❓ **Direct PDF Links**: Need to test

## 🧪 Testing Steps

### 1. Excel Files (XLS/XLSX) - HIGH PRIORITY

**Test Files Created:**
- `test-kpis.xlsx` - Modern Excel format
- `test-kpis.xls` - Legacy Excel format

**Testing Steps:**
1. Go to the upload page
2. Select **"Excel"** as source type
3. Upload `test-kpis.xlsx` first
4. Check browser console for processing logs
5. Verify data appears on dashboard
6. Repeat with `test-kpis.xls`

**Expected Result:**
- 12 KPIs should be ingested
- Data should appear on dashboard across departments
- Console should show Excel processing logs

**What to Look For:**
```
🔍 Ingest: Processing Excel file: test-kpis.xlsx
🔍 Ingest: Excel validation result: {...}
🔍 Ingest: Excel validation successful, storing data...
🔍 Ingest: About to call parseExcelForStorage...
✅ Ingest: Excel storage result: {...}
```

### 2. Google Drive Links - MEDIUM PRIORITY

**Testing Steps:**
1. Upload `test-kpis.xlsx` to Google Drive
2. Get sharing link (make it publicly accessible)
3. Go to upload page
4. Select **"Google Drive"** as source type
5. Paste the Google Drive link
6. Check if file is downloaded and processed

**Expected Result:**
- File should be downloaded from Google Drive
- Same processing as direct file upload
- Data should appear on dashboard

**What to Look For:**
```
🔍 Ingest: Processing Google Drive link: {...}
🔍 Ingest: File downloaded successfully
🔍 Ingest: Processing Excel file: test-kpis.xlsx
✅ Ingest: Excel storage result: {...}
```

### 3. Direct PDF Links - MEDIUM PRIORITY

**Testing Steps:**
1. Host `comprehensive-test-report.pdf` on a web server
2. Get direct download URL
3. Go to upload page
4. Select **"PDF"** as source type
5. Paste the direct PDF URL
6. Check if PDF is downloaded and processed

**Expected Result:**
- PDF should be downloaded from URL
- Same processing as direct file upload
- 57 KPIs should be ingested

**What to Look For:**
```
🔍 Ingest: Processing PDF link: {...}
🔍 Ingest: File downloaded successfully
🔍 Ingest: Starting PDF processing for file: comprehensive-test-report.pdf
✅ Ingest: PDF parsed successfully. Pages: 1 Tables: 0
🔍 Ingest: Calling processPDFData...
✅ Ingest: Data processing successful. Extracted metrics: {...}
🔍 Ingest: Calling ReportStorageService.storeProcessedDataAsReport...
✅ Ingest: Report storage result: {...}
```

## 🔍 Console Monitoring

**Always check the browser console (F12 → Console) during testing for:**
- Processing logs
- Error messages
- Success confirmations
- Data extraction details

## 📋 Test Checklist

### Excel Testing
- [ ] Upload `test-kpis.xlsx` - Should ingest 12 KPIs
- [ ] Upload `test-kpis.xls` - Should ingest 12 KPIs
- [ ] Verify data appears on dashboard
- [ ] Check console logs for processing details

### Google Drive Testing
- [ ] Upload Excel file to Google Drive
- [ ] Test with sharing link
- [ ] Verify file download and processing
- [ ] Check data appears on dashboard

### Direct Link Testing
- [ ] Host PDF file on web server
- [ ] Test with direct URL
- [ ] Verify file download and processing
- [ ] Check data appears on dashboard

## 🚨 Troubleshooting

### If Excel Upload Fails
1. Check if `xlsx` package is installed
2. Verify file format (XLSX vs XLS)
3. Check console for error messages
4. Ensure file has correct column structure

### If Google Drive Fails
1. Verify link is publicly accessible
2. Check if file is too large
3. Ensure link format is correct
4. Check console for download errors

### If Direct Links Fail
1. Verify URL is accessible
2. Check if file requires authentication
3. Ensure URL points to direct file download
4. Check console for fetch errors

## 📊 Success Metrics

**All tests should result in:**
- Files processed successfully
- Data extracted and stored
- Dashboard updated with new KPIs
- No error messages in console
- Proper department assignment

## 🎯 Next Steps

1. **Start with Excel testing** (highest priority)
2. **Test Google Drive** if Excel works
3. **Test direct links** if both above work
4. **Report any failures** with console logs
5. **Verify dashboard updates** after each test

## 📞 Support

If any test fails:
1. Share the console logs
2. Describe what happened
3. Include any error messages
4. Note the file type and size

---

**Happy Testing! 🚀**
