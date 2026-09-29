"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@workspace/ui/components/sidebar"
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
    <SidebarProvider>
      <FinanceShellContent
        activePage={activePage}
        connectorName={connectorName}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
        onSignOut={onSignOut}
        updatedAt={updatedAt}
      >
        {children}
      </FinanceShellContent>
    </SidebarProvider>
  )
}

function FinanceShellContent({
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
  const { open } = useSidebar()
  return (
    <div
      className="st-window"
      data-sidebar-state={open ? "expanded" : "collapsed"}
    >
      <Sidebar aria-label="Barra lateral principal" collapsible="icon">
        <SidebarHeader>
          <div className="st-workspace">
            <span aria-hidden="true" className="st-brand-mark">
              <Landmark size={17} strokeWidth={2.25} />
            </span>
            <span className="st-workspace-label">
              <strong>Finanças</strong>
              <small>{connectorName}</small>
            </span>
            <SidebarTrigger title={open ? "Recolher menu" : "Expandir menu"} />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <nav aria-label="Navegação principal" className="st-nav">
              <SidebarMenu>
                {navItems.map(({ id, href, label, icon: Icon }) => (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      asChild
                      isActive={activePage === id}
                      aria-label={label}
                    >
                      <Link href={href} title={label}>
                        <Icon aria-hidden="true" size={16} />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="st-sidebar-bottom">
          <div className="st-protection">
            <ShieldCheck aria-hidden="true" size={17} />
            <span>
              <strong>Dados protegidos</strong>
              <small>Conexão Open Finance criptografada</small>
            </span>
          </div>
          <Button
            aria-label="Sair da conta"
            className="st-signout"
            onClick={onSignOut}
            type="button"
            variant="ghost"
          >
            <LogOut aria-hidden="true" size={16} />
            <span>Sair da conta</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="st-main">
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
      </SidebarInset>
    </div>
  )
}
