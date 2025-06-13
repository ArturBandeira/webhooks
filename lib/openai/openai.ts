import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  
  export const CREATE_EVENT = {
    name: "create_event",
    description: "Cria evento",
    parameters: {
      type: "object",
      properties: {
        calendarId: { type: "string" },
        event: {
          type: "object",
          properties: {
            summary:  { type: "string" },
            location: { type: "string" },
            description: { type: "string" },
            start: {
              type: "object",
              properties: {
                dateTime: { type: "string" },
                timeZone: { type: "string" }
              },
              required: ["dateTime","timeZone"]
            },
            end: {
              type: "object",
              properties: {
                dateTime: { type: "string" },
                timeZone: { type: "string" }
              },
              required: ["dateTime","timeZone"]
            }
          },
          required: ["summary","start","end"]
        }
      },
      required: ["calendarId","event"]
    }
  }

  export const UPDATE_EVENT = {
    name: "update_event",
    description: "Atualiza evento",
    parameters: {
      type: "object",
      properties: {
        calendarId: { type: "string" },
        eventId:   { type: "string" },
        event: {
          type: "object",
          properties: {
            summary:     { type: "string", description: "Título do evento" },
            location:    { type: "string", description: "Localização (opcional)" },
            description: { type: "string", description: "Descrição (opcional)" },
            start: {
              type: "object",
              properties: {
                dateTime: { type: "string", description: "Início ISO-8601" },
                timeZone: { type: "string", description: "Time zone, ex: America/Sao_Paulo" }
              },
              required: ["dateTime","timeZone"]
            },
            end: {
              type: "object",
              properties: {
                dateTime: { type: "string", description: "Término ISO-8601" },
                timeZone: { type: "string", description: "Time zone, ex: America/Sao_Paulo" }
              },
              required: ["dateTime","timeZone"]
            }
          },
          required: ["summary","start","end"]
        }
      },
      required: ["calendarId","eventId","event"]
    }
  }

  export const DELETE_EVENT = {
    name: "delete_event",
    description: "Remove evento",
    parameters: {
      type: "object",
      properties: {
        calendarId:{ type:"string" },
        eventIds: {
          type: "array",
          description: "Lista de eventIds a serem removidos",
          items: { type: "string" }
        }
      },
      required: ["calendarId","eventId"]
    }
  }  

  export async function run(prompt: string, email : string, events : any) {
    const chatRes = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "Você converte comandos de usuário em payloads que irá como um json para nosso webhook de calendário, sabendo que este recebe um json nos moldes da API de calendario do google e sabendo que estamos em 2025 e em junho. O calendarId deve ser igual a " + email + ". Além disso, caso a função escolhida seja a de deletar ou atualizar um evento, percorra o json a seguir para preencher a função com os eventIds que correspondem à descrição do evento pelo usuário: " + JSON.stringify(events) + ". Para as funções de deletar e atualizar, adicione os eventIds somente se você possuir quase certeza que a descrição de fato se refere ao evento, para evitar deletar eventos que não forem os solicitados. Caso não tenha essa certeza, deixe o array de eventIds vazio" },
        { role: "user",   content: prompt }
      ],
      functions: [CREATE_EVENT, UPDATE_EVENT, DELETE_EVENT],
      function_call: "auto"
    })
  
    const fc = chatRes.choices[0].message.function_call!
    return {
    name: fc.name,
    args: JSON.parse(fc.arguments!)
  }
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