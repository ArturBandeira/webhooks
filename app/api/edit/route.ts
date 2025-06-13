// app/api/edit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { run } from '../../../lib/openai/openai'
import {
  createEvent,
  updateEvent,
  deleteEvent
} from '../../../lib/google/calendar'
import { listUserEvents }            from '../../../lib/google/calendar'
import { wrapConteudo }              from '../../../lib/moveo/helpers'

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

  const now     = new Date()
  const timeMin = now.toISOString()

  const oneMonthLater = new Date(now)
  oneMonthLater.setMonth(now.getMonth() + 1)
  const timeMax       = oneMonthLater.toISOString()
  var events : any
  try {
    events = await listUserEvents(email, timeMin, timeMax)
  }
  catch{
    return NextResponse.json({
      output: { live_instructions: { conteudo: 'Erro ao listar eventos' } }
    }, { status: 500 })
  }
  if (events.length === 0) {
      return NextResponse.json({
        output: {
          live_instructions: {
            conteudo: `Nenhum evento encontrado para ${email} entre ${timeMin} e ${timeMax}.`
          }
        }
      })
    }

  var payload: any
  try {
    payload = await run(userCommand, email, events);
  } catch (err) {
    console.error('GPT error:', err)
    return NextResponse.json({
      output: { live_instructions: { conteudo: 'Erro ao processar comando.' } }
    }, { status: 500 })
  }

  /////////////////
 /* return NextResponse.json({
    output: {live_instructions : {payload }}
  })*/
  /////////////////
  /////////////////
  
   if(payload.name == "create_event"){
    const event = payload.args.event;
    const created = await createEvent({ calendarId : email,  payload : event })

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
    else if(payload.name == "delete_event"){
      const eventIds: string[] = payload.args.eventIds;
      let ids_deleted : string[] = [];
      for(const id of eventIds){
        try{
          const deleted = await deleteEvent({calendarId : email, eventId : id});
          ids_deleted.push(id);
        }
        catch{
          return NextResponse.json({
            output: { live_instructions: { conteudo: 'Erro ao deletar evento de id ${id}' } }
          }, { status: 500 })
        }
      }
      let text : string;
      if(ids_deleted.length != 0) text = 'deleting the events with ids ' + ids_deleted.join(', ') + ' from agenda';
      else text = "";
      return NextResponse.json({
        output : { live_instructions : { conteudo: text } }
      })
    }
}
  /////////////////
  /*} catch (err) {
    console.error(err)
    return wrapConteudo('Internal server error while fetching next-30-days events.', 500)
  }*/



  
  
  /*
  return NextResponse.json({
    output: { live_instructions: payload }
  })
  */
/*

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
    /*
    if (action === 'create') {
      const calendarId = email;
      const created = await createEvent({ calendarId,  })

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
/*
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
*/