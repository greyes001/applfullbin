function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entries");
    const data = JSON.parse(e.postData.contents);

    const timestamp = new Date();
    const entryId =
      data.entryId ||
      Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");

    const rows = data.entries.map((entry) => [
      timestamp,
      entryId,
      entry.orchard || "",
      entry.block || "",
      entry.variety || "",
      entry.bins || "",
      data.user || "",
      data.notes || "",
    ]);

    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, rowsSaved: rows.length })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Entries");
    const action = (e.parameter.action || "").toLowerCase();

    if (action !== "today") {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          message: "Apps Script is running",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, entries: [] })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const tz = Session.getScriptTimeZone();
    const todayKey = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");

    const entries = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const timestamp = row[0];
      if (!timestamp) continue;

      const rowDateKey = Utilities.formatDate(new Date(timestamp), tz, "yyyy-MM-dd");
      if (rowDateKey !== todayKey) continue;

      entries.push({
        timestamp: row[0],
        entryId: row[1],
        orchard: row[2],
        block: row[3],
        variety: row[4],
        bins: Number(row[5]) || 0,
        user: row[6] || "",
        notes: row[7] || "",
      });
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, entries })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
