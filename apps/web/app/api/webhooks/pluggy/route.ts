import { after } from "next/server"

export const runtime = "nodejs"

type PluggyWebhookEvent = {
  event: string
  eventId: string
  itemId?: string
  error?: unknown
}

function isPluggyWebhookEvent(value: unknown): value is PluggyWebhookEvent {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  const event = value as Record<string, unknown>

  return (
    typeof event.event === "string" &&
    event.event.length > 0 &&
    typeof event.eventId === "string" &&
    event.eventId.length > 0 &&
    (event.itemId === undefined || typeof event.itemId === "string")
  )
}

async function processPluggyEvent(event: PluggyWebhookEvent) {
  switch (event.event) {
    case "item/created":
      console.info("Pluggy item created", {
        eventId: event.eventId,
        itemId: event.itemId,
      })
      break
    case "item/updated":
      console.info("Pluggy item updated", {
        eventId: event.eventId,
        itemId: event.itemId,
      })
      break
    case "item/error":
      console.error("Pluggy item error", {
        eventId: event.eventId,
        itemId: event.itemId,
        error: event.error,
      })
      break
    default:
      console.info("Pluggy webhook received", {
        event: event.event,
        eventId: event.eventId,
        itemId: event.itemId,
      })
  }
}

export async function POST(request: Request): Promise<Response> {
  console.log('WEBHOOK');

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: "Payload JSON inválido." }, { status: 400 })
  }

  if (!isPluggyWebhookEvent(payload)) {
    return Response.json({ error: "Evento Pluggy inválido." }, { status: 400 })
  }

  const event = payload

  after(async () => {
    try {
      await processPluggyEvent(event)
    } catch (error) {
      console.error("Failed to process Pluggy webhook", {
        eventId: event.eventId,
        error,
      })
    }
  })

  return Response.json({ received: true }, { status: 202 })
}
