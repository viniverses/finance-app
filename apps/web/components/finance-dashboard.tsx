"use client"

import "./finance-dashboard.css"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  ChevronRight,
  CreditCard,
  RefreshCw,
  TriangleAlert,
  WalletCards,
} from "lucide-react"

import { FinanceShell } from "@/components/finance-shell"

export type FinanceAccount = {
  id: string
  type: "BANK" | "CREDIT"
  subtype: string
  number: string
  balance: number
  name: string
  marketingName: string | null
  currencyCode: string
  creditData: {
    brand: string | null
    availableCreditLimit: number | null
    creditLimit: number | null
    balanceCloseDate: string | null
    balanceDueDate: string | null
    status: "ACTIVE" | "BLOCKED" | "CANCELLED" | null
  } | null
}

export type FinanceTransaction = {
  id: string
  accountId: string
  date: string
  description: string
  type: "DEBIT" | "CREDIT"
  amount: number
  currencyCode: string
  category: string | null
  status?: "PENDING" | "POSTED"
  merchant?: { name?: string; category?: string } | null
  creditCardMetadata: {
    installmentNumber?: number
    totalInstallments?: number
    cardNumber?: string
  } | null
}

export type FinanceData = {
  item: {
    id: string
    connectorName: string
    connectorLogo: string
    lastUpdatedAt: string | null
  }
  accounts: FinanceAccount[]
  transactions: FinanceTransaction[]
  updatedAt: string
}

type FinanceDashboardProps = {
  data: FinanceData
  isRefreshing: boolean
  onRefresh: () => void
  onSignOut: () => void
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})
const compactBrl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})
const shortDate = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
})
const fullDate = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
})
function formatMoney(value: number | null | undefined, compact = false) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—"
  return (compact ? compactBrl : brl).format(value)
}

function formatDate(value: string) {
  return shortDate.format(transactionDate(value)).replace(".", "")
}

function transactionDate(value: string) {
  return new Date(value.length === 10 ? `${value}T12:00:00` : value)
}

function maskAccount(number: string) {
  const digits = number.replace(/\D/g, "")
  return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : "•••• 0000"
}

export function getTransactionCardLabel(
  transaction: FinanceTransaction,
  account?: FinanceAccount
) {
  const metadataNumber = transaction.creditCardMetadata?.cardNumber
  const accountIsCreditCard =
    account?.type === "CREDIT" && account.subtype === "CREDIT_CARD"
  if (!metadataNumber && !accountIsCreditCard) return null

  const number = metadataNumber || account?.number
  const digits = number?.replace(/\D/g, "")
  const maskedNumber = digits && digits.length >= 4
    ? `•••• ${digits.slice(-4)}`
    : null
  const name = account?.marketingName || account?.name
  return [name || "Cartão de crédito", maskedNumber]
    .filter(Boolean)
    .join(" · ")
}

function getTransactionName(transaction: FinanceTransaction) {
  return transaction.merchant?.name || transaction.description || "Movimentação"
}

function getTransactionCategory(transaction: FinanceTransaction) {
  return transaction.merchant?.category || transaction.category || "Outros"
}

function getCardUsage(account: FinanceAccount) {
  const limit = account.creditData?.creditLimit
  const available = account.creditData?.availableCreditLimit
  if (!limit || available === null || available === undefined) return 0
  return Math.min(100, Math.max(0, ((limit - available) / limit) * 100))
}

function categoryColor(category: string) {
  const value = category.toLowerCase()
  if (/food|aliment|restaurante/.test(value)) return "var(--st-category-food)"
  if (/transport|transporte|uber|carro/.test(value))
    return "var(--st-category-transport)"
  if (/utilit|contas|serviços/.test(value))
    return "var(--st-category-utilities)"
  if (/shopping|compras/.test(value)) return "var(--st-category-shopping)"
  if (/subscription|assinatura/.test(value))
    return "var(--st-category-subscriptions)"
  return "var(--st-category-entertainment)"
}

function EmptyCardsState() {
  return (
    <div className="st-empty">
      <WalletCards aria-hidden="true" size={24} />
      <strong>Nenhum cartão encontrado</strong>
      <span>
        Quando sua instituição disponibilizar os cartões, eles aparecerão aqui.
      </span>
    </div>
  )
}

export function CreditCardVisual({ account }: { account: FinanceAccount }) {
  const credit = account.creditData
  const limit = credit?.creditLimit
  const available = credit?.availableCreditLimit
  const cardName = account.marketingName || account.name || "Cartão principal"
  return (
    <article className="st-credit-card">
      <div className="st-credit-card-top">
        <div>
          <span className="st-kicker">{credit?.brand || "Cartão"}</span>
          <strong>{cardName}</strong>
        </div>
        <CreditCard aria-hidden="true" size={22} />
      </div>
      <p className="st-card-number">{maskAccount(account.number)}</p>
      <div className="st-credit-card-bottom">
        <div>
          <span>Disponível</span>
          <strong>{formatMoney(available, true)}</strong>
        </div>
        <div>
          <span>Limite total</span>
          <strong>{formatMoney(limit, true)}</strong>
        </div>
      </div>
      {limit ? (
        <div
          aria-label={`${Math.round(getCardUsage(account))}% do limite utilizado`}
          className="st-card-progress"
        >
          <span style={{ width: `${getCardUsage(account)}%` }} />
        </div>
      ) : null}
    </article>
  )
}

function TransactionRow({
  transaction,
  account,
}: {
  transaction: FinanceTransaction
  account?: FinanceAccount
}) {
  const isCredit = transaction.type === "CREDIT"
  const category = getTransactionCategory(transaction)
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
        <strong>{getTransactionName(transaction)}</strong>
        <small>
          {formatDate(transaction.date)}
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
        <i style={{ backgroundColor: categoryColor(category) }} />
        {category}
      </span>
      <strong
        className={`st-transaction-amount ${isCredit ? "is-credit" : ""}`}
      >
        {isCredit ? "+" : "−"} {formatMoney(transaction.amount)}
      </strong>
    </li>
  )
}

type CategorySlice = {
  label: string
  amount: number
  percentage: number
  color: string
}

function ExpenseDonut({
  slices,
  total,
}: {
  slices: CategorySlice[]
  total: number
}) {
  let offset = 0
  return (
    <div className="st-donut-wrap">
      <svg
        aria-label="Distribuição dos gastos por categoria"
        className="st-donut"
        role="img"
        viewBox="0 0 220 220"
      >
        <defs>
          <linearGradient id="st-donut-pink" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#f05b9d" />
            <stop offset="1" stopColor="#c51f6b" />
          </linearGradient>
          <linearGradient id="st-donut-teal" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#72d2cd" />
            <stop offset="1" stopColor="#4bb8b2" />
          </linearGradient>
          <linearGradient id="st-donut-blue" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#6e93e5" />
            <stop offset="1" stopColor="#3b5fc4" />
          </linearGradient>
        </defs>
        <circle
          cx="110"
          cy="110"
          fill="none"
          r="88"
          stroke="var(--st-border)"
          strokeWidth="1"
        />
        {slices.map((slice) => {
          const start = offset
          offset += slice.percentage
          const arcLength = Math.max(0, slice.percentage - 2)
          const midAngle =
            ((start + slice.percentage / 2) / 100) * Math.PI * 2 - Math.PI / 2
          const bubbleX = 110 + Math.cos(midAngle) * 88
          const bubbleY = 110 + Math.sin(midAngle) * 88
          return (
            <g key={slice.label}>
              <circle
                cx="110"
                cy="110"
                fill="none"
                pathLength="100"
                r="72"
                stroke={`url(#st-donut-${slice.color})`}
                strokeDasharray={`${arcLength} 100`}
                strokeDashoffset={-start}
                strokeLinecap="round"
                strokeWidth="22"
                transform="rotate(-90 110 110)"
              />
              <circle
                className="st-donut-bubble"
                cx={bubbleX}
                cy={bubbleY}
                r="17"
              />
              <text
                className="st-donut-percent"
                dominantBaseline="central"
                textAnchor="middle"
                x={bubbleX}
                y={bubbleY}
              >
                {Math.round(slice.percentage)}%
              </text>
            </g>
          )
        })}
      </svg>
      <div className="st-donut-center">
        <strong>{formatMoney(total, true)}</strong>
        <span>em gastos recentes</span>
        <a href="/transactions">Ver transações</a>
      </div>
    </div>
  )
}

function BudgetSegments({ ratio }: { ratio: number }) {
  const filled = Math.round(ratio * 40)
  return (
    <svg
      aria-label={`${Math.round(ratio * 100)}% do limite utilizado`}
      className="st-budget-segments"
      preserveAspectRatio="none"
      role="img"
      viewBox="0 0 240 18"
    >
      <defs>
        <linearGradient id="st-budget-gradient">
          <stop stopColor="#3b5fc4" />
          <stop offset="0.55" stopColor="#7c4dba" />
          <stop offset="1" stopColor="#d6357f" />
        </linearGradient>
      </defs>
      {Array.from({ length: 40 }, (_, index) => (
        <rect
          fill={index < filled ? "url(#st-budget-gradient)" : "#ddebfa"}
          height="18"
          key={index}
          rx="1.5"
          width="3"
          x={index * 6}
        />
      ))}
    </svg>
  )
}

export function FinanceDashboard({
  data,
  isRefreshing,
  onRefresh,
  onSignOut,
}: FinanceDashboardProps) {
  const cards = data.accounts.filter(
    (account) => account.subtype === "CREDIT_CARD"
  )
  const totalBalance = data.accounts
    .filter((account) => account.type === "BANK")
    .reduce((sum, account) => sum + account.balance, 0)
  const credits = data.transactions.filter(
    (transaction) => transaction.type === "CREDIT"
  )
  const debits = data.transactions.filter(
    (transaction) => transaction.type === "DEBIT"
  )
  const totalIncome = credits.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  )
  const monthSpend = debits.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  )
  const incomeCategories = new Map<string, number>()
  const expenseCategories = new Map<string, number>()
  credits.forEach((transaction) => {
    const category = getTransactionCategory(transaction)
    incomeCategories.set(
      category,
      (incomeCategories.get(category) ?? 0) + transaction.amount
    )
  })
  debits.forEach((transaction) => {
    const category = getTransactionCategory(transaction)
    expenseCategories.set(
      category,
      (expenseCategories.get(category) ?? 0) + transaction.amount
    )
  })
  const incomeBreakdown = [...incomeCategories]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  const expenseSorted = [...expenseCategories].sort((a, b) => b[1] - a[1])
  const expenseTop = expenseSorted.slice(0, 2)
  const otherExpenses = expenseSorted
    .slice(2)
    .reduce((sum, [, amount]) => sum + amount, 0)
  if (otherExpenses > 0) expenseTop.push(["Outros", otherExpenses])
  const expenseSlices: CategorySlice[] = expenseTop.map(
    ([label, amount], index) => ({
      label,
      amount,
      percentage: monthSpend > 0 ? (amount / monthSpend) * 100 : 0,
      color: ["pink", "teal", "blue"][index] ?? "blue",
    })
  )
  const limitedCards = cards.filter(
    (account) =>
      account.creditData?.creditLimit &&
      account.creditData.availableCreditLimit !== null
  )
  const totalLimit = limitedCards.reduce(
    (sum, account) => sum + (account.creditData?.creditLimit ?? 0),
    0
  )
  const usedLimit = limitedCards.reduce(
    (sum, account) =>
      sum +
      Math.max(
        0,
        (account.creditData?.creditLimit ?? 0) -
          (account.creditData?.availableCreditLimit ?? 0)
      ),
    0
  )
  const limitRatio = totalLimit > 0 ? Math.min(1, usedLimit / totalLimit) : 0
  const recent = data.transactions.slice(0, 7)
  const accountsById = new Map(
    data.accounts.map((account) => [account.id, account])
  )
  let lastDay = ""

  return (
    <FinanceShell
      activePage="overview"
      connectorName={data.item.connectorName}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      onSignOut={onSignOut}
      updatedAt={data.updatedAt}
    >
      <div className="st-dashboard-grid" id="resumo">
        <div className="st-column">
          <Card
            as="section"
            aria-labelledby="income-title"
            className="st-panel st-income-panel"
          >
            <CardHeader className="st-panel-heading">
              <div>
                <CardTitle as="h1" id="income-title">
                  Entradas e saldo
                </CardTitle>
                <CardDescription>
                  Resumo das movimentações recentes
                </CardDescription>
              </div>
              <span className="st-period">Últimos 90 dias</span>
            </CardHeader>
            <CardContent>
              <div className="st-income-total">
                <strong>{formatMoney(totalIncome)}</strong>
                <span>em entradas</span>
              </div>
              <div className="st-panel-divider" />
              <div className="st-breakdown-label">Entradas por categoria</div>
              <div className="st-income-breakdown">
                {incomeBreakdown.length > 0 ? (
                  incomeBreakdown.map(([label, amount], index) => (
                    <div className="st-income-part" key={label}>
                      <span>{label}</span>
                      <strong>{formatMoney(amount)}</strong>
                      <i className={`st-income-bar st-income-bar-${index}`} />
                    </div>
                  ))
                ) : (
                  <p className="st-no-data">
                    Nenhuma entrada nas movimentações recentes.
                  </p>
                )}
              </div>
              <div className="st-balance-note">
                Saldo em contas <strong>{formatMoney(totalBalance)}</strong>
              </div>
            </CardContent>
          </Card>
          <Card
            as="section"
            aria-labelledby="transactions-title"
            className="st-panel st-transactions-panel"
            id="transacoes"
          >
            <CardHeader className="st-panel-heading">
              <div>
                <CardTitle as="h2" id="transactions-title">
                  Transações recentes
                </CardTitle>
                <CardDescription>
                  Movimentações das contas conectadas
                </CardDescription>
              </div>
              <Banknote
                aria-hidden="true"
                className="st-heading-icon"
                size={20}
              />
            </CardHeader>
            <CardContent>
              {recent.length > 0 ? (
                <ul className="st-transactions">
                  {recent.map((transaction) => {
                    const day = transaction.date.slice(0, 10)
                    const showDay = day !== lastDay
                    lastDay = day
                    return (
                      <li className="st-transaction-group" key={transaction.id}>
                        {showDay ? (
                          <h3>
                            {fullDate.format(transactionDate(transaction.date))}
                          </h3>
                        ) : null}
                        <ul>
                          <TransactionRow
                            account={accountsById.get(transaction.accountId)}
                            transaction={transaction}
                          />
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="st-empty">
                  <Banknote aria-hidden="true" size={24} />
                  <strong>Ainda sem transações</strong>
                  <span>
                    Assim que sua instituição disponibilizar os movimentos, eles
                    aparecerão aqui.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="st-column">
          <Card
            as="section"
            aria-labelledby="budget-title"
            className="st-panel st-budget-panel"
          >
            <CardHeader className="st-panel-heading">
              <CardTitle as="h2" id="budget-title">
                Controle de limite
              </CardTitle>
              <CreditCard
                aria-hidden="true"
                className="st-heading-icon"
                size={19}
              />
            </CardHeader>
            <CardContent>
              <p className="st-budget-label">Limite dos cartões conectados</p>
              <div className="st-budget-amount">
                <strong>{formatMoney(totalLimit ? usedLimit : null)}</strong>
                <span> de {formatMoney(totalLimit || null)}</span>
              </div>
              <BudgetSegments ratio={limitRatio} />
              {totalLimit > 0 ? (
                limitRatio >= 0.74 ? (
                  <p className="st-budget-alert">
                    <TriangleAlert aria-hidden="true" size={14} />O uso do
                    limite está próximo do total
                  </p>
                ) : (
                  <p className="st-budget-helper">
                    {Math.round(limitRatio * 100)}% do limite utilizado
                  </p>
                )
              ) : (
                <p className="st-budget-helper">
                  Limite não informado pela instituição
                </p>
              )}
            </CardContent>
          </Card>
          <Card
            as="section"
            aria-labelledby="expense-title"
            className="st-panel st-expense-panel"
          >
            <CardHeader className="st-panel-heading">
              <CardTitle as="h2" id="expense-title">
                Resumo de gastos
              </CardTitle>
              <span className="st-period">90 dias</span>
            </CardHeader>
            <CardContent>
              {monthSpend > 0 ? (
                <>
                  <ExpenseDonut slices={expenseSlices} total={monthSpend} />
                  <h3>Por categoria</h3>
                  <ul className="st-expense-list">
                    {expenseSlices.map((slice) => (
                      <li key={slice.label}>
                        <span
                          className="st-expense-symbol"
                          style={{
                            backgroundColor: categoryColor(slice.label),
                          }}
                        />
                        <span className="st-expense-name">
                          <strong>{slice.label}</strong>
                          <small>
                            {Math.round(slice.percentage)}% dos gastos recentes
                          </small>
                        </span>
                        <strong className="st-expense-value">
                          {formatMoney(slice.amount)}
                        </strong>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="st-empty">
                  <Banknote aria-hidden="true" size={24} />
                  <strong>Sem gastos recentes</strong>
                  <span>
                    As despesas aparecerão aqui quando a instituição enviar
                    movimentações.
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Card
        as="section"
        aria-labelledby="cards-title"
        className="st-panel st-cards-panel"
        id="cartoes"
      >
        <CardHeader className="st-panel-heading">
          <div>
            <CardTitle as="h2" id="cards-title">
              Seus cartões
            </CardTitle>
            <CardDescription>
              Limite e crédito disponível em um só lugar
            </CardDescription>
          </div>
          <span className="st-count">
            {cards.length} {cards.length === 1 ? "cartão" : "cartões"}
          </span>
        </CardHeader>
        <CardContent>
          {cards.length > 0 ? (
            <div className="st-cards-grid">
              {cards.map((account) => (
                <CreditCardVisual account={account} key={account.id} />
              ))}
            </div>
          ) : (
            <EmptyCardsState />
          )}
          <a className="st-section-link" href="/transactions">
            Ver todas as movimentações{" "}
            <ChevronRight aria-hidden="true" size={16} />
          </a>
        </CardContent>
      </Card>
    </FinanceShell>
  )
}

export function DashboardLoading({
  title = "Preparando seu painel",
  message = "Sua instituição foi conectada. Estamos buscando os cartões e as transações mais recentes.",
  variant = "dashboard",
}: {
  title?: string
  message?: string
  variant?: "dashboard" | "transactions" | "cards"
}) {
  const rows = Array.from({ length: 6 })
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="st-loading-page"
      role="status"
    >
      <span className="sr-only">
        {title}. {message}
      </span>
      <div className="st-window st-loading-window">
        <aside aria-hidden="true" className="st-sidebar st-loading-sidebar">
          <div className="st-loading-brand">
            <Skeleton className="st-sk-brand-mark" />
            <div>
              <Skeleton className="st-sk-brand-name" />
              <Skeleton className="st-sk-brand-subtitle" />
            </div>
            <Skeleton className="st-sk-brand-action" />
          </div>
          <div className="st-loading-nav">
            {rows.slice(0, 3).map((_, index) => (
              <div className="st-loading-nav-row" key={index}>
                <Skeleton className="st-sk-nav-icon" />
                <Skeleton className="st-sk-nav-label" />
              </div>
            ))}
          </div>
          <div className="st-loading-sidebar-footer">
            <Skeleton className="st-sk-footer-icon" />
            <Skeleton className="st-sk-footer-label" />
          </div>
        </aside>
        <div className="st-main st-loading-main">
          <header className="st-header st-loading-header" aria-hidden="true">
            <Skeleton className="st-sk-breadcrumb" />
            <div>
              <Skeleton className="st-sk-header-meta" />
              <Skeleton className="st-sk-header-action" />
            </div>
          </header>
          {variant === "dashboard" ? (
            <div className="st-dashboard-grid st-loading-dashboard">
              <div className="st-column">
                <Card className="st-panel st-loading-panel" aria-hidden="true">
                  <Skeleton className="st-sk-panel-title" />
                  <Skeleton className="st-sk-panel-caption" />
                  <Skeleton className="st-sk-total" />
                  <Skeleton className="st-sk-divider" />
                  <div className="st-sk-breakdown">
                    <Skeleton />
                    <Skeleton />
                    <Skeleton />
                  </div>
                </Card>
                <Card className="st-panel st-loading-panel" aria-hidden="true">
                  <Skeleton className="st-sk-panel-title" />
                  <Skeleton className="st-sk-panel-caption" />
                  <LoadingRows rows={rows.slice(0, 4)} />
                </Card>
              </div>
              <div className="st-column">
                <Card className="st-panel st-loading-panel" aria-hidden="true">
                  <Skeleton className="st-sk-panel-title" />
                  <Skeleton className="st-sk-total" />
                  <Skeleton className="st-sk-chart" />
                </Card>
                <Card className="st-panel st-loading-panel" aria-hidden="true">
                  <Skeleton className="st-sk-panel-title" />
                  <Skeleton className="st-sk-donut" />
                </Card>
              </div>
            </div>
          ) : (
            <div className="st-loading-page-content" aria-hidden="true">
              <div className="st-loading-page-title">
                <Skeleton className="st-sk-page-title" />
                <Skeleton className="st-sk-page-description" />
              </div>
              <Card className="st-panel st-loading-toolbar">
                <Skeleton className="st-sk-toolbar-label" />
                <Skeleton className="st-sk-date-field" />
                <Skeleton className="st-sk-date-field" />
                <Skeleton className="st-sk-toolbar-button" />
              </Card>
              {variant === "transactions" ? (
                <div className="st-range-summary st-loading-summary">
                  <Card className="st-range-stat">
                    <Skeleton className="st-sk-stat-label" />
                    <Skeleton className="st-sk-stat-value" />
                  </Card>
                  <Card className="st-range-stat">
                    <Skeleton className="st-sk-stat-label" />
                    <Skeleton className="st-sk-stat-value" />
                  </Card>
                  <Card className="st-range-stat">
                    <Skeleton className="st-sk-stat-label" />
                    <Skeleton className="st-sk-stat-value" />
                  </Card>
                </div>
              ) : (
                <div className="st-cards-grid st-loading-card-grid">
                  {rows.slice(0, 3).map((_, index) => (
                    <Card className="st-loading-credit-card" key={index}>
                      <Skeleton className="st-sk-card-label" />
                      <Skeleton className="st-sk-card-name" />
                      <Skeleton className="st-sk-card-number" />
                      <Skeleton className="st-sk-card-limit" />
                    </Card>
                  ))}
                </div>
              )}
              <Card className="st-panel st-loading-list">
                <Skeleton className="st-sk-panel-title" />
                <Skeleton className="st-sk-search" />
                <LoadingRows rows={rows} />
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function LoadingRows({ rows }: { rows: unknown[] }) {
  return (
    <div className="st-loading-rows">
      {rows.map((_, index) => (
        <div className="st-loading-row" key={index}>
          <Skeleton className="st-sk-row-icon" />
          <div>
            <Skeleton className="st-sk-row-title" />
            <Skeleton className="st-sk-row-subtitle" />
          </div>
          <Skeleton className="st-sk-row-amount" />
        </div>
      ))}
    </div>
  )
}

export function DashboardError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <main className="st-state-page">
      <Card as="section" className="st-state-card">
        <span className="st-state-icon is-error">
          <RefreshCw aria-hidden="true" size={21} />
        </span>
        <h1>A conexão precisa de mais um instante</h1>
        <p>{message}</p>
        <Button className="st-primary-button" onClick={onRetry} type="button">
          <RefreshCw aria-hidden="true" size={16} />
          Tentar novamente
        </Button>
      </Card>
    </main>
  )
}
