"use client"

import { Button } from "@workspace/ui/components/button"
import {
  ArrowUpRight,
  Banknote,
  CreditCard,
  Landmark,
  LogOut,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

const navItems = [
  { id: "overview", href: "/", label: "Visão geral", icon: Banknote },
  {
    id: "transactions",
    href: "/transactions",
    label: "Transações",
    icon: ArrowUpRight,
  },
  { id: "cards", href: "/cards", label: "Cartões", icon: CreditCard },
] as const

const time = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
})

export function FinanceShell({
  activePage,
  connectorName,
  updatedAt,
  isRefreshing,
  onRefresh,
  onSignOut,
  children,
}: {
  activePage: (typeof navItems)[number]["id"]
  connectorName: string
  updatedAt: string
  isRefreshing: boolean
  onRefresh: () => void
  onSignOut: () => void
  children: ReactNode
}) {
  return (
    <div className="st-window">
      <aside className="st-sidebar">
        <div className="st-workspace">
          <span aria-hidden="true" className="st-brand-mark">
            <Landmark size={17} strokeWidth={2.25} />
          </span>
          <span>
            <strong>Finanças</strong>
            <small>{connectorName}</small>
          </span>
          <Landmark
            aria-hidden="true"
            className="st-workspace-trail"
            size={14}
          />
        </div>
        <nav aria-label="Navegação principal" className="st-nav">
          {navItems.map(({ id, href, label, icon: Icon }) => (
            <Link
              aria-current={activePage === id ? "page" : undefined}
              className={activePage === id ? "is-active" : undefined}
              href={href}
              key={id}
            >
              <Icon aria-hidden="true" size={16} />
              {label}
            </Link>
          ))}
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
      <main className="st-main">
        <header className="st-header">
          <div className="st-breadcrumb">
            <span>{connectorName}</span>
            <i>/</i>
            <strong>
              {navItems.find((item) => item.id === activePage)?.label}
            </strong>
          </div>
          <div className="st-header-actions">
            <span className="st-updated">
              Atualizado às {time.format(new Date(updatedAt))}
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
        <nav aria-label="Navegação principal" className="st-mobile-nav">
          {navItems.map(({ id, href, label, icon: Icon }) => (
            <Link
              aria-current={activePage === id ? "page" : undefined}
              className={activePage === id ? "is-active" : undefined}
              href={href}
              key={id}
            >
              <Icon aria-hidden="true" size={15} />
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </main>
    </div>
  )
}
