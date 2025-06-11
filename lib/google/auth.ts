import { google } from 'googleapis';

let authClient: InstanceType<typeof google.auth.GoogleAuth>;

export function getAuthClient() {
  if (!authClient) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS!);
    authClient = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar',
      ],
    });
  }
  return authClient;
}
