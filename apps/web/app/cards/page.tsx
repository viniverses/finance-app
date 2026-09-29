import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { FinanceDataPage } from "@/components/finance-data-page"
import { auth } from "@/lib/auth"

export default async function CardsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  return <FinanceDataPage kind="cards" />
}
