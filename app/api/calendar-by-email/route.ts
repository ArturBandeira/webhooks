import { NextRequest, NextResponse } from 'next/server'
import { wrapConteudo }              from '../../../lib/moveo/helpers'
import { listUserEvents }            from '../../../lib/google/calendar'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({
      output: {
        live_instructions: { conteudo: 'Invalid JSON' }
      }
    }, { status: 400 })
  }

  const email = body.context?.user?.email
  if (!email) {
    return NextResponse.json({
      output: {
        live_instructions: { conteudo: 'Missing email' }
      }
    }, { status: 400 })
  }

  const now     = new Date()
  const timeMin = now.toISOString()

  const oneMonthLater = new Date(now)
  oneMonthLater.setMonth(now.getMonth() + 1)
  const timeMax       = oneMonthLater.toISOString()

  try {
    const events = await listUserEvents(email, timeMin, timeMax)

    if (events.length === 0) {
      return NextResponse.json({
        output: {
          live_instructions: {
            conteudo: `Nenhum evento encontrado para ${email} entre ${timeMin} e ${timeMax}.`
          }
        }
      })
    }

    const eventLines = events.map(ev => {
      const startRaw = ev.start?.dateTime ?? ev.start?.date  ?? ''
      const endRaw   = ev.end?.dateTime   ?? ev.end?.date    ?? ''
      const datePart  = startRaw.split('T')[0]
      const startTime = startRaw.includes('T') ? startRaw.split('T')[1].substr(0,5) : 'Dia inteiro'
      const endTime   = endRaw  .includes('T') ? endRaw  .split('T')[1].substr(0,5) : 'Dia inteiro'
      return `- ${datePart}: "${ev.summary}" das ${startTime} às ${endTime}`
    }).join('\n')

    const conteudo = `1. Eventos de ${email} nos próximos 30 dias (de ${datePart(timeMin)} a ${datePart(timeMax)}):\n${eventLines}`

   /* return NextResponse.json({
      output: {
        events,
        live_instructions: { conteudo }
      }
    })*/

    ////
    return NextResponse.json({
      output: {
        events,
        live_instructions: { events }
      }
    })
    ////
    
  } catch (err) {
    console.error(err)
    return wrapConteudo('Internal server error while fetching next-30-days events.', 500)
  }
}
function datePart(iso: string) {
  return iso.split('T')[0]
}
