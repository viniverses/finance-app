import { PluggyClient } from "pluggy-sdk"

import { auth } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: Request): Promise<Response> {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return Response.json({ error: "Você precisa estar autenticado." }, { status: 401 })
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
    const connectToken = await pluggy.createConnectToken(undefined, {
      clientUserId: session.user.id,
    })

    return Response.json(
      { accessToken: connectToken.accessToken },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return Response.json(
      { error: "Não foi possível iniciar a conexão com a Pluggy." },
      { status: 502 },
    )
  }
}
