import { NextRequest } from 'next/server';
import { wrapConteudo, authorize } from '../../../lib/moveo/helpers';
import { listUserEvents } from '../../../lib/google/calendar';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const unauth = authorize(req);
  if (unauth) return unauth;

  let body: any;
  try { body = await req.json(); }
  catch { return wrapConteudo('Invalid JSON', 400); }

  const { email, timeMin = new Date().toISOString(), timeMax } = body;
  if (!email) {
    return wrapConteudo('Missing email parameter', 400);
  }

  try {
    const events = await listUserEvents(email, timeMin, timeMax);
    if (events.length === 0) {
      return wrapConteudo(`Nenhum evento encontrado para ${email}.`);
    }
    return wrapConteudo({ events });
  } catch (err) {
    console.error(err);
    return wrapConteudo('Erro interno ao buscar eventos.', 500);
  }
}
