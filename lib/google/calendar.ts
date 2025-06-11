import { getAuthClient } from './auth';
import { google, calendar_v3 } from 'googleapis';

export async function listUserEvents(
  calendarId: string,
  timeMin: string,
  timeMax?: string
): Promise<calendar_v3.Schema$Event[]> {
  const auth = await getAuthClient();
  const cal = google.calendar('v3');
  const res = await cal.events.list({
    auth,
    calendarId,
    timeMin,
    timeMax,
  });
  return res.data.items || [];
}

export interface CreateEventParams {
  calendarId: string;
  event: calendar_v3.Schema$Event;
}

export async function createEvent(params: CreateEventParams) {
  const auth = await getAuthClient();
  const cal = google.calendar('v3');
  const res = await cal.events.insert({
    auth,
    calendarId: params.calendarId,
    requestBody: params.event,
  });
  return res.data;
}

export interface UpdateEventParams {
  calendarId: string;
  eventId: string;
  event: calendar_v3.Schema$Event;
}

export async function updateEvent(params: UpdateEventParams) {
  const auth = await getAuthClient();
  const cal = google.calendar('v3');
  const res = await cal.events.update({
    auth,
    calendarId: params.calendarId,
    eventId: params.eventId,
    requestBody: params.event,
  });
  return res.data;
}

export interface DeleteEventParams {
  calendarId: string;
  eventId: string;
}

export async function deleteEvent(params: DeleteEventParams) {
  const auth = await getAuthClient();
  const cal = google.calendar('v3');
  await cal.events.delete({
    auth,
    calendarId: params.calendarId,
    eventId: params.eventId,
  });
}
