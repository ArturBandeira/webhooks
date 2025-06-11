import { google } from 'googleapis';
import { getAuthClient } from './auth';

const sheetsApi = google.sheets('v4');

export async function findEmailByPhone(
  spreadsheetId: string,
  phoneColumn: string,
  emailColumn: string,
  phone: string
): Promise<string | null> {
  const auth = await getAuthClient();
  const phonesRes = await sheetsApi.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: phoneColumn,
  });
  const emailsRes = await sheetsApi.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: emailColumn,
  });
  const phones = phonesRes.data.values || [];
  const emails = emailsRes.data.values || [];
  for (let i = 0; i < phones.length; i++) {
    if (phones[i][0] === phone) {
      return emails[i]?.[0] || null;
    }
  }
  return null;
}

export interface EditSheetParams {
  spreadsheetId: string;
  range: string;
  values: any[][];
}

export async function editSheet(params: EditSheetParams) {
  const { spreadsheetId, range, values } = params;
  const auth = await getAuthClient();
  const res = await sheetsApi.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
  return res.data;
}
