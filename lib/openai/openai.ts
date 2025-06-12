import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  
  export const CREATE_EVENT_FN = {
    name: "create_event",
    description: "Retorna apenas o JSON para criar um novo evento no Google Calendar",
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "Título do evento"
        },
        location: {
          type: "string",
          description: "Localização do evento"
        },
        description: {
          type: "string",
          description: "Descrição (opcional)"
        },
        start: {
          type: "object",
          properties: {
            dateTime: {
              type: "string",
              description: "Data e hora de início em ISO 8601, incluindo offset (ex: 2025-06-12T14:30:00-03:00)"
            },
            timeZone: {
              type: "string",
              description: "Time zone, ex: America/Sao_Paulo"
            }
          },
          required: ["dateTime","timeZone"]
        },
        end: {
          type: "object",
          properties: {
            dateTime: {
              type: "string",
              description: "Data e hora de término em ISO 8601"
            },
            timeZone: {
              type: "string",
              description: "Time zone, ex: America/Sao_Paulo"
            }
          },
          required: ["dateTime","timeZone"]
        }
      },
      required: ["summary","start","end"]
    }
  }
  
  export async function run(prompt: string) {
    const chatRes = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "Você converte comandos de usuário em payloads que irá como um json para nosso webhook de calendário, sabendo que este recebe um json nos moldes da API de calendario do google e sabendo que estamos em 2025 e em junho. O calendarId deve ser igual a arturbchanj@gmail.com" },
        { role: "user",   content: prompt }
      ],
      functions: [CREATE_EVENT_FN],
      function_call: { name: "create_event" }
    })
  
    const fnCall = chatRes.choices[0]?.message?.function_call
    if (!fnCall || !fnCall.arguments) {
      throw new Error("Model não retornou argumentos de função.")
    }
  
    const payload = JSON.parse(fnCall.arguments)
    return payload;
  }
    /*
    const webhookRes = await fetch(process.env.WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    })
  
    if (!webhookRes.ok) {
      const text = await webhookRes.text()
      throw new Error(`Webhook retornou ${webhookRes.status}: ${text}`)
    }
  
    const result = await webhookRes.json()
    console.log("Resposta do webhook:", JSON.stringify(result, null, 2))
  }*/