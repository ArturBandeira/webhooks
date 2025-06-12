// app/api/edit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { run } from '../../../lib/openai/openai'
import {
  createEvent,
  updateEvent,
  deleteEvent
} from '../../../lib/google/calendar'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: any
  try { body = await req.json() }
  catch {
    return NextResponse.json({
      output: { live_instructions: { conteudo: 'Invalid JSON' } }
    }, { status: 400 })
  }

  const email = body.context.user.email;
  const userCommand = body.trigger?.text ?? body.input?.text
  if (!userCommand) {
    return NextResponse.json({
      output: { live_instructions: { conteudo: 'Missing trigger.text in request' } }
    }, { status: 400 })
  }

  let payload: any
  try {
    payload = await run(userCommand)
  } catch (err) {
    console.error('GPT error:', err)
    return NextResponse.json({
      output: { live_instructions: { conteudo: 'Erro ao processar comando.' } }
    }, { status: 500 })
  }
  
  /*
  return NextResponse.json({
    output: { live_instructions: payload }
  })
  */
 /////
 const target = 'calendar';
 const action = 'create'
 /////
  if (target !== 'calendar') {
    return NextResponse.json({
      output: { live_instructions: { conteudo: 'Comando não é de calendário.' } }
    }, { status: 400 })
  }

  try {
    /*
    const { action, calendarId, event, eventId } = params;
    const timeZone = 'America/Sao_Paulo'
    if (event.start && !('timeZone' in event.start)) {
      (event.start as any).timeZone = timeZone
    }
    if (event.end   && !('timeZone' in event.end)) {
      (event.end   as any).timeZone = timeZone
    }
    */
    if (action === 'create') {
      const calendarId = email;
      const created = await createEvent({ calendarId, payload })

      const startRaw = created.start?.dateTime || created.start?.date || ''
      const endRaw   = created.end?.dateTime   || created.end?.date   || ''
      const [datePart, timeRaw] = startRaw.split('T')
      const startTime = timeRaw?.substring(0,5) || 'Dia inteiro'
      const endTime   = endRaw.includes('T')
        ? endRaw.split('T')[1].substring(0,5)
        : 'Dia inteiro'

      const conteudo = `Evento criado com sucesso!
- ID: ${created.id}
- Título: "${created.summary}"
- Data: ${datePart}
- Início: ${startTime}
- Fim: ${endTime}`

      return NextResponse.json({
        output: { live_instructions: { conteudo } }
      })
    }

    /*if (action === 'update') {
      if (!eventId) {
        return NextResponse.json({
          output: { live_instructions: { conteudo: 'Faltando eventId para update.' } }
        }, { status: 400 })
      }
      const updated = await updateEvent({ calendarId, eventId, event })

      const startRaw = updated.start?.dateTime || updated.start?.date || ''
      const endRaw   = updated.end?.dateTime   || updated.end?.date   || ''
      const [datePart, timeRaw] = startRaw.split('T')
      const startTime = timeRaw?.substring(0,5) || 'Dia inteiro'
      const endTime   = endRaw.includes('T')
        ? endRaw.split('T')[1].substring(0,5)
        : 'Dia inteiro'

      const conteudo = `Evento atualizado!
- ID: ${updated.id}
- Título: "${updated.summary}"
- Data: ${datePart}
- Novo início: ${startTime}
- Novo fim: ${endTime}`

      return NextResponse.json({
        output: { live_instructions: { conteudo } }
      })
    }*/

    /*if (action === 'delete') {
      if (!eventId) {
        return NextResponse.json({
          output: { live_instructions: { conteudo: 'Faltando eventId para delete.' } }
        }, { status: 400 })
      }

      const title = event?.summary || '(sem título)'
      await deleteEvent({ calendarId, eventId })

      const conteudo = `Evento deletado com sucesso!
- ID: ${eventId}
- Título: "${title}"`

      return NextResponse.json({
        output: { live_instructions: { conteudo } }
      })
    }*/

    return NextResponse.json({
      output: { live_instructions: { conteudo: `Ação '${action}' não suportada.` } }
    }, { status: 400 })

  } catch (err) {
    console.error('Calendar API error:', err)
    return NextResponse.json({
      output: { live_instructions: { conteudo: 'Erro interno ao editar calendário.' } }
    }, { status: 500 })
  }
}
