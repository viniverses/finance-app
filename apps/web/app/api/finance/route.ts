import { eq } from "drizzle-orm"
import { PluggyClient } from "pluggy-sdk"

import { pluggyConnections } from "@/lib/app-schema"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const runtime = "nodejs"

function isDateOnly(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

export async function GET(request: Request): Promise<Response> {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return Response.json(
      { error: "Você precisa estar autenticado." },
      { status: 401 }
    )
  }

  const [connection] = await db
    .select()
    .from(pluggyConnections)
    .where(eq(pluggyConnections.userId, session.user.id))
    .limit(1)

  if (!connection) {
    return Response.json(
      { connected: false },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  const searchParams = new URL(request.url).searchParams
  const requestedFrom = searchParams.get("dateFrom")
  const requestedTo = searchParams.get("dateTo")
  const usesDateRange = requestedFrom !== null || requestedTo !== null
  const today = new Date().toISOString().slice(0, 10)
  const defaultFrom = new Date()
  defaultFrom.setDate(defaultFrom.getDate() - 90)
  const dateFrom = requestedFrom ?? defaultFrom.toISOString().slice(0, 10)
  const dateTo = requestedTo ?? today

  if (
    (requestedFrom !== null && !isDateOnly(requestedFrom)) ||
    (requestedTo !== null && !isDateOnly(requestedTo)) ||
    dateFrom > dateTo
  ) {
    return Response.json(
      { error: "Informe um intervalo de datas válido." },
      { status: 400 }
    )
  }

  const clientId = process.env.PLUGGY_CLIENT_ID
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return Response.json(
      { error: "A integração com a Pluggy não está configurada no servidor." },
      { status: 503 }
    )
  }

  try {
    const pluggy = new PluggyClient({ clientId, clientSecret })
    const item = await pluggy.fetchItem(connection.itemId)
    const accountsPage = await pluggy.fetchAccounts(connection.itemId)
    const accounts = accountsPage.results
    const accountTransactions = await Promise.all(
      accounts.map(async (account) => {
        try {
          return await pluggy.fetchAllTransactions(account.id, {
            dateFrom,
            dateTo,
          })
        } catch {
          return []
        }
      })
    )

    const sortedTransactions = accountTransactions
      .flat()
      .sort(
        (first, second) =>
          new Date(second.date).getTime() - new Date(first.date).getTime()
      )
    const transactions = usesDateRange
      ? sortedTransactions
      : sortedTransactions.slice(0, 30)

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
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return Response.json(
      {
        error:
          "A instituição foi conectada, mas ainda não conseguimos carregar seus dados.",
      },
      { status: 502 }
    )
  }
}
