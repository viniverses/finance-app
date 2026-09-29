"use client"

import { useQuery } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CreditCard,
  Search,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { type FormEvent, useEffect, useMemo, useState } from "react"

import {
  CreditCardVisual,
  DashboardError,
  DashboardLoading,
  type FinanceAccount,
  type FinanceData,
  type FinanceTransaction,
  getTransactionCardLabel,
} from "@/components/finance-dashboard"
import { FinanceShell } from "@/components/finance-shell"
import { authClient } from "@/lib/auth-client"

type PageKind = "transactions" | "cards"
type FinanceResponse = FinanceData | { connected: false }

function localDate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function initialRange() {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 29)
  return { from: localDate(start), to: localDate(end) }
}

function validRange(from: string, to: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(from) &&
    /^\d{4}-\d{2}-\d{2}$/.test(to) &&
    from <= to
  )
}

async function requestRange(
  from: string,
  to: string
): Promise<FinanceResponse> {
  const query = new URLSearchParams({ dateFrom: from, dateTo: to })
  const response = await fetch(`/api/finance?${query}`, {
    headers: { "Cache-Control": "no-cache" },
  })
  const result = (await response.json()) as FinanceResponse & {
    error?: string
  }
  if (!response.ok) {
    throw new Error(result.error ?? "Não foi possível carregar os dados.")
  }
  return result
}

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})
const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatTransactionDate(value: string) {
  return dateFormat.format(
    new Date(value.length === 10 ? `${value}T12:00:00` : value)
  )
}

function transactionLabel(transaction: FinanceTransaction) {
  return transaction.merchant?.name || transaction.description || "Movimentação"
}

function TransactionLine({
  transaction,
  account,
}: {
  transaction: FinanceTransaction
  account?: FinanceAccount
}) {
  const isCredit = transaction.type === "CREDIT"
  const cardLabel = getTransactionCardLabel(transaction, account)
  return (
    <li className="st-transaction-row">
      <span className={`st-transaction-icon ${isCredit ? "is-credit" : ""}`}>
        {isCredit ? (
          <ArrowDownLeft aria-hidden="true" size={16} />
        ) : (
          <ArrowUpRight aria-hidden="true" size={16} />
        )}
      </span>
      <span className="st-transaction-name">
        <strong>{transactionLabel(transaction)}</strong>
        <small>
          {formatTransactionDate(transaction.date)}
          {transaction.status === "PENDING" ? " · Pendente" : ""}
        </small>
        {cardLabel ? (
          <small className="st-transaction-card">
            <CreditCard aria-hidden="true" size={11} />
            {cardLabel}
          </small>
        ) : null}
      </span>
      <span className="st-transaction-category">
        <i />
        {transaction.merchant?.category || transaction.category || "Outros"}
      </span>
      <strong
        className={`st-transaction-amount ${isCredit ? "is-credit" : ""}`}
      >
        {isCredit ? "+" : "−"} {money.format(Math.abs(transaction.amount))}
      </strong>
    </li>
  )
}

function RangeControls({
  draftFrom,
  draftTo,
  setDraftFrom,
  setDraftTo,
  onSubmit,
}: {
  draftFrom: string
  draftTo: string
  setDraftFrom: (value: string) => void
  setDraftTo: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form className="st-range-toolbar" onSubmit={onSubmit}>
      <div className="st-range-heading">
        <CalendarDays aria-hidden="true" size={17} />
        <span>Período</span>
      </div>
      <div className="st-range-fields">
        <div className="st-range-field">
          <Label htmlFor="date-from">De</Label>
          <Input
            id="date-from"
            max={draftTo || undefined}
            onChange={(event) =>
              setDraftFrom(
                (event.currentTarget as unknown as { value: string }).value
              )
            }
            required
            type="date"
            value={draftFrom}
          />
        </div>
        <div className="st-range-field">
          <Label htmlFor="date-to">Até</Label>
          <Input
            id="date-to"
            min={draftFrom || undefined}
            onChange={(event) =>
              setDraftTo(
                (event.currentTarget as unknown as { value: string }).value
              )
            }
            required
            type="date"
            value={draftTo}
          />
        </div>
        <Button disabled={!validRange(draftFrom, draftTo)} type="submit">
          Aplicar período
        </Button>
      </div>
    </form>
  )
}

function EmptyState({
  kind,
  hasCards = false,
}: {
  kind: PageKind
  hasCards?: boolean
}) {
  const isCards = kind === "cards"
  const Icon = isCards ? CreditCard : Banknote
  return (
    <div className="st-empty st-range-empty">
      <Icon aria-hidden="true" size={25} />
      <strong>
        {isCards
          ? hasCards
            ? "Sem compras no período"
            : "Nenhum cartão conectado"
          : "Nenhuma transação no período"}
      </strong>
      <span>
        {isCards
          ? hasCards
            ? "As compras dos cartões aparecerão aqui quando a instituição disponibilizar movimentações no intervalo escolhido."
            : "Os cartões de crédito da sua instituição aparecerão aqui quando estiverem disponíveis."
          : "Tente ampliar o intervalo para incluir outras movimentações."}
      </span>
    </div>
  )
}

export function FinanceDataPage({ kind }: { kind: PageKind }) {
  const router = useRouter()
  const defaultRange = useMemo(initialRange, [])
  const [draftFrom, setDraftFrom] = useState(defaultRange.from)
  const [draftTo, setDraftTo] = useState(defaultRange.to)
  const [range, setRange] = useState(defaultRange)
  const [search, setSearch] = useState("")
  const query = useQuery({
    queryKey: ["finance-range", range.from, range.to],
    queryFn: () => requestRange(range.from, range.to),
    enabled: validRange(range.from, range.to),
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (query.data && "connected" in query.data) router.replace("/")
  }, [query.data, router])

  function applyRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (validRange(draftFrom, draftTo)) {
      setRange({ from: draftFrom, to: draftTo })
    }
  }

  async function signOut() {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  if (query.isError) {
    return (
      <DashboardError
        message={
          query.error instanceof Error
            ? query.error.message
            : "Não foi possível carregar os dados."
        }
        onRetry={() => void query.refetch()}
      />
    )
  }

  if (query.isPending || !query.data || "connected" in query.data) {
    return (
      <DashboardLoading
        title={
          kind === "cards" ? "Carregando seus cartões" : "Carregando transações"
        }
        message="Buscando as movimentações da sua instituição para o período selecionado."
        variant={kind}
      />
    )
  }

  const data = query.data
  const creditCards = data.accounts.filter(
    (account: FinanceAccount) =>
      account.type === "CREDIT" && account.subtype === "CREDIT_CARD"
  )
  const accountsById = new Map(
    data.accounts.map((account) => [account.id, account])
  )
  const cardAccountIds = new Set(creditCards.map((account) => account.id))
  const transactions =
    kind === "cards"
      ? data.transactions.filter((transaction) =>
          cardAccountIds.has(transaction.accountId)
        )
      : data.transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const haystack = [
      transactionLabel(transaction),
      transaction.category,
      transaction.merchant?.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("pt-BR")
    return haystack.includes(search.trim().toLocaleLowerCase("pt-BR"))
  })
  const debits = transactions.filter(
    (transaction) => transaction.type === "DEBIT"
  )
  const credits = transactions.filter(
    (transaction) => transaction.type === "CREDIT"
  )
  const totalDebits = debits.reduce(
    (total, transaction) => total + Math.abs(transaction.amount),
    0
  )
  const totalCredits = credits.reduce(
    (total, transaction) => total + Math.abs(transaction.amount),
    0
  )

  return (
    <FinanceShell
      activePage={kind}
      connectorName={data.item.connectorName}
      isRefreshing={query.isFetching}
      onRefresh={() => void query.refetch()}
      onSignOut={() => void signOut()}
      updatedAt={data.updatedAt}
    >
      <section className="st-data-page">
        <div className="st-data-page-heading">
          <div>
            <h1>{kind === "cards" ? "Cartões de crédito" : "Transações"}</h1>
            <p>
              {kind === "cards"
                ? `Acompanhe ${creditCards.length === 1 ? "o cartão" : "seus cartões"} e as compras do período.`
                : "Consulte as entradas e saídas das suas contas conectadas."}
            </p>
          </div>
          <span className="st-count">
            {kind === "cards"
              ? `${creditCards.length} ${creditCards.length === 1 ? "cartão" : "cartões"}`
              : `${transactions.length} ${transactions.length === 1 ? "movimentação" : "movimentações"}`}
          </span>
        </div>

        <RangeControls
          draftFrom={draftFrom}
          draftTo={draftTo}
          onSubmit={applyRange}
          setDraftFrom={setDraftFrom}
          setDraftTo={setDraftTo}
        />

        {kind === "transactions" ? (
          <div className="st-range-summary">
            <Card as="section" className="st-range-stat">
              <span>Entradas no período</span>
              <strong className="is-positive">
                {money.format(totalCredits)}
              </strong>
            </Card>
            <Card as="section" className="st-range-stat">
              <span>Saídas no período</span>
              <strong>{money.format(totalDebits)}</strong>
            </Card>
            <Card as="section" className="st-range-stat">
              <span>Movimentações</span>
              <strong>{transactions.length.toLocaleString("pt-BR")}</strong>
            </Card>
          </div>
        ) : creditCards.length > 0 ? (
          <div className="st-cards-grid st-range-cards-grid">
            {creditCards.map((account) => (
              <div className="st-range-card-item" key={account.id}>
                <CreditCardVisual account={account} />
                <span className="st-range-card-spend">
                  {money.format(
                    transactions
                      .filter(
                        (transaction) =>
                          transaction.accountId === account.id &&
                          transaction.type === "DEBIT"
                      )
                      .reduce(
                        (total, transaction) =>
                          total + Math.abs(transaction.amount),
                        0
                      )
                  )}{" "}
                  em compras no período
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Card as="section" className="st-panel">
            <EmptyState kind="cards" />
          </Card>
        )}

        {kind === "transactions" || creditCards.length > 0 ? (
          <Card as="section" className="st-panel st-range-list-panel">
            <CardHeader className="st-panel-heading">
              <div>
                <CardTitle as="h2">
                  {kind === "cards" ? "Compras dos cartões" : "Movimentações"}
                </CardTitle>
                <CardDescription>
                  {dateFormat.format(new Date(`${range.from}T12:00:00`))} a{" "}
                  {dateFormat.format(new Date(`${range.to}T12:00:00`))}
                </CardDescription>
              </div>
              <span className="st-count">
                {filteredTransactions.length} itens
              </span>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <>
                  <label className="st-range-search">
                    <Search aria-hidden="true" size={15} />
                    <span className="sr-only">Buscar transações</span>
                    <input
                      onChange={(event) =>
                        setSearch(
                          (event.currentTarget as unknown as { value: string })
                            .value
                        )
                      }
                      placeholder="Buscar movimentação"
                      type="search"
                      value={search}
                    />
                  </label>
                  {filteredTransactions.length > 0 ? (
                    <ul className="st-transactions st-range-transactions">
                      {filteredTransactions.map((transaction) => (
                        <TransactionLine
                          account={accountsById.get(transaction.accountId)}
                          key={transaction.id}
                          transaction={transaction}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="st-range-no-results">
                      Nenhuma movimentação corresponde à busca.
                    </p>
                  )}
                </>
              ) : (
                <EmptyState kind={kind} hasCards={creditCards.length > 0} />
              )}
            </CardContent>
          </Card>
        ) : null}
      </section>
    </FinanceShell>
  )
}
