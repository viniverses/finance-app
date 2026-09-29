import { eq } from "drizzle-orm"
import { PluggyClient } from "pluggy-sdk"

import { pluggyConnections } from "@/lib/app-schema"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request): Promise<Response> {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return Response.json({ error: "Você precisa estar autenticado." }, { status: 401 })
  }

  const [connection] = await db
    .select()
    .from(pluggyConnections)
    .where(eq(pluggyConnections.userId, session.user.id))
    .limit(1)

  if (!connection) {
    return Response.json({ connected: false }, { headers: { "Cache-Control": "no-store" } })
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
    const item = await pluggy.fetchItem(connection.itemId)
    const accountsPage = await pluggy.fetchAccounts(connection.itemId)
    const accounts = accountsPage.results
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - 90)

    const transactionPages = await Promise.all(
      accounts.map(async (account) => {
        try {
          return await pluggy.fetchTransactionsCursor(account.id, {
            dateFrom: dateFrom.toISOString().slice(0, 10),
          })
        } catch {
          return { results: [] }
        }
      }),
    )

    const transactions = transactionPages
      .flatMap((page) => page.results)
      .sort(
        (first, second) =>
          new Date(second.date).getTime() - new Date(first.date).getTime(),
      )
      .slice(0, 30)

    return Response.json(
      {
        item: {
          id: item.id,
          connectorName: item.connector.name,
          connectorLogo: item.connector.imageUrl,
          lastUpdatedAt: item.lastUpdatedAt,
        },
        accounts,
        transactions,
        updatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch {
    return Response.json(
      {
        error:
          "A instituição foi conectada, mas ainda não conseguimos carregar seus dados.",
      },
      { status: 502 },
    )
  }
}
