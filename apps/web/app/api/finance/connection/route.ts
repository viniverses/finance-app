import { PluggyClient } from "pluggy-sdk"

import { pluggyConnections } from "@/lib/app-schema"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const runtime = "nodejs"

type ConnectionRequest = {
  itemId?: unknown
}

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return Response.json({ error: "Você precisa estar autenticado." }, { status: 401 })
  }

  let body: ConnectionRequest

  try {
    body = (await request.json()) as ConnectionRequest
  } catch {
    return Response.json({ error: "Requisição inválida." }, { status: 400 })
  }

  if (typeof body.itemId !== "string" || body.itemId.length === 0) {
    return Response.json({ error: "itemId é obrigatório." }, { status: 400 })
  }

  const clientId = process.env.PLUGGY_CLIENT_ID
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return Response.json(
      { error: "A integração com a Pluggy não está configurada no servidor." },
      { status: 503 },
    )
  }

  try {
    const pluggy = new PluggyClient({ clientId, clientSecret })
    const item = await pluggy.fetchItem(body.itemId)

    if (item.clientUserId !== session.user.id) {
      return Response.json(
        { error: "Essa conexão não pertence ao usuário autenticado." },
        { status: 403 },
      )
    }

    await db
      .insert(pluggyConnections)
      .values({
        userId: session.user.id,
        itemId: item.id,
        institutionName: item.connector.name,
        institutionLogo: item.connector.imageUrl,
      })
      .onConflictDoUpdate({
        target: pluggyConnections.userId,
        set: {
          itemId: item.id,
          institutionName: item.connector.name,
          institutionLogo: item.connector.imageUrl,
          updatedAt: new Date(),
        },
      })

    return Response.json(
      { connected: true },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return Response.json(
      { error: "Não foi possível salvar a conexão da instituição." },
      { status: 502 },
    )
  }
}
