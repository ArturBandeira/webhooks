import { NextRequest } from 'next/server';
import { wrapConteudo, authorize } from '../../../lib/moveo/helpers';
import { editSheet } from '../../../lib/google/sheets';
import {
  createEvent,
  updateEvent,
  deleteEvent
} from '../../../lib/google/calendar';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const unauth = authorize(req);
  if (unauth) return unauth;

  let body: any;
  try { body = await req.json(); }
  catch { return wrapConteudo('Invalid JSON', 400); }

  const { target, params } = body;

  if (target === 'sheet') {
    try {
      await editSheet(params); 
      return wrapConteudo('Planilha atualizada.');
    } catch (err) {
      console.error(err);
      return wrapConteudo('Erro ao atualizar planilha.', 500);
    }
  }
  else if (target === 'calendar') {
    try {
      const { action, calendarId, event, eventId } = params;
      if (action === 'create') {
        await createEvent({ calendarId, event });
        return wrapConteudo('Evento criado.');
      }
      else if (action === 'update') {
        if (!eventId) return wrapConteudo('Missing eventId for update.', 400);
        await updateEvent({ calendarId, eventId, event });
        return wrapConteudo('Evento atualizado.');
      }
      else if (action === 'delete') {
        if (!eventId) return wrapConteudo('Missing eventId for delete.', 400);
        await deleteEvent({ calendarId, eventId });
        return wrapConteudo('Evento deletado.');
      }
      else {
        return wrapConteudo('Parâmetro action inválido.', 400);
      }
    } catch (err) {
      console.error(err);
      return wrapConteudo('Erro ao editar calendário.', 500);
    }
  }

  return wrapConteudo('Target inválido.', 400);
}
