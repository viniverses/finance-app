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
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  ChevronRight,
  CreditCard,
  Landmark,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  WalletCards,
} from "lucide-react"

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
const time = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
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

function CreditCardVisual({ account }: { account: FinanceAccount }) {
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

function TransactionRow({ transaction }: { transaction: FinanceTransaction }) {
  const isCredit = transaction.type === "CREDIT"
  const category = getTransactionCategory(transaction)
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
        <a href="#transacoes">Ver transações</a>
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
  let lastDay = ""

  return (
    <div className="st-window">
      <aside className="st-sidebar">
        <div className="st-workspace">
          <span aria-hidden="true" className="st-brand-mark">
            <Landmark size={17} strokeWidth={2.25} />
          </span>
          <span>
            <strong>Finanças</strong>
            <small>{data.item.connectorName}</small>
          </span>
          <Landmark
            aria-hidden="true"
            className="st-workspace-trail"
            size={14}
          />
        </div>
        <nav aria-label="Navegação principal" className="st-nav">
          <a className="is-active" href="#resumo">
            <Banknote aria-hidden="true" size={16} />
            Visão geral
          </a>
          <a href="#transacoes">
            <ArrowUpRight aria-hidden="true" size={16} />
            Transações
          </a>
          <a href="#cartoes">
            <CreditCard aria-hidden="true" size={16} />
            Cartões
          </a>
        </nav>
        <div className="st-sidebar-bottom">
          <div className="st-protection">
            <ShieldCheck aria-hidden="true" size={17} />
            <span>
              <strong>Dados protegidos</strong>
              <small>Conexão Open Finance criptografada</small>
            </span>
          </div>
          <Button
            className="st-signout"
            onClick={onSignOut}
            type="button"
            variant="ghost"
          >
            <LogOut aria-hidden="true" size={16} />
            Sair da conta
          </Button>
        </div>
      </aside>
      <div className="st-main">
        <header className="st-header">
          <div className="st-breadcrumb">
            <span>{data.item.connectorName}</span>
            <i>/</i>
            <strong>Visão geral</strong>
          </div>
          <div className="st-header-actions">
            <span className="st-updated">
              Atualizado às {time.format(new Date(data.updatedAt))}
            </span>
            <Button
              aria-label="Atualizar dados"
              className="st-icon-button"
              disabled={isRefreshing}
              onClick={onRefresh}
              size="icon"
              type="button"
              variant="outline"
            >
              <RefreshCw
                aria-hidden="true"
                className={isRefreshing ? "animate-spin" : ""}
                size={16}
              />
            </Button>
            <Button
              aria-label="Sair"
              className="st-icon-button st-mobile-signout"
              onClick={onSignOut}
              size="icon"
              type="button"
              variant="outline"
            >
              <LogOut aria-hidden="true" size={16} />
            </Button>
          </div>
        </header>
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
                        <li
                          className="st-transaction-group"
                          key={transaction.id}
                        >
                          {showDay ? (
                            <h3>
                              {fullDate.format(
                                transactionDate(transaction.date)
                              )}
                            </h3>
                          ) : null}
                          <ul>
                            <TransactionRow transaction={transaction} />
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
                      Assim que sua instituição disponibilizar os movimentos,
                      eles aparecerão aqui.
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
                              {Math.round(slice.percentage)}% dos gastos
                              recentes
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
            <a className="st-section-link" href="#transacoes">
              Ver todas as movimentações{" "}
              <ChevronRight aria-hidden="true" size={16} />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function DashboardLoading({
  title = "Preparando seu painel",
  message = "Sua instituição foi conectada. Estamos buscando os cartões e as transações mais recentes.",
}: {
  title?: string
  message?: string
}) {
  return (
    <main className="st-state-page">
      <Card as="section" className="st-state-card">
        <span className="st-state-icon">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={22} />
        </span>
        <h1>{title}</h1>
        <p>{message}</p>
      </Card>
    </main>
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
