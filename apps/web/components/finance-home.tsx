"use client"

import "./finance-dashboard.css"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import { Card } from "@workspace/ui/components/card"
import {
  ArrowRight,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useState } from "react"

import {
  DashboardError,
  DashboardLoading,
  FinanceDashboard,
  type FinanceData,
} from "@/components/finance-dashboard"
import { authClient } from "@/lib/auth-client"

const PluggyConnect = dynamic(
  () => import("react-pluggy-connect").then((module) => module.PluggyConnect),
  { ssr: false }
)

type FinanceHomeProps = {
  userName: string
}

type FinanceResponse = FinanceData | { connected: false }

async function requestConnectToken() {
  const response = await fetch("/api/connect-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  const result = (await response.json()) as {
    accessToken?: string
    error?: string
  }

  if (!response.ok || !result.accessToken) {
    throw new Error(result.error ?? "Não foi possível iniciar a conexão.")
  }

  return result.accessToken
}

async function savePluggyConnection(itemId: string) {
  const response = await fetch("/api/finance/connection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId }),
  })
  const result = (await response.json()) as {
    connected?: boolean
    error?: string
  }

  if (!response.ok || !result.connected) {
    throw new Error(result.error ?? "Não foi possível salvar a conexão.")
  }
}

async function requestFinanceData(): Promise<FinanceResponse> {
  const response = await fetch("/api/finance", {
    headers: { "Cache-Control": "no-cache" },
  })
  const result = (await response.json()) as FinanceResponse & {
    error?: string
  }

  if (!response.ok) {
    throw new Error(result.error ?? "Não foi possível carregar seus dados.")
  }

  return result
}

export function FinanceHome({ userName }: FinanceHomeProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [widgetError, setWidgetError] = useState<string | null>(null)
  const financeQuery = useQuery({
    queryKey: ["finance"],
    queryFn: requestFinanceData,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const connectTokenMutation = useMutation({
    mutationFn: requestConnectToken,
    onMutate: () => {
      setWidgetError(null)
    },
  })

  const saveConnectionMutation = useMutation({
    mutationFn: savePluggyConnection,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["finance"] })
    },
  })

  function handleConnectionSuccess(itemId: string) {
    setWidgetError(null)
    saveConnectionMutation.mutate(itemId)
  }

  async function handleSignOut() {
    await authClient.signOut()
    queryClient.clear()
    router.push("/sign-in")
    router.refresh()
  }

  if (financeQuery.isPending || saveConnectionMutation.isPending) {
    return (
      <DashboardLoading
        title="Carregando seu painel"
        message="Verificando sua conexão e preparando seus dados financeiros."
      />
    )
  }

  if (financeQuery.isError) {
    return (
      <DashboardError
        message={
          financeQuery.error instanceof Error
            ? financeQuery.error.message
            : "Não foi possível carregar seus dados."
        }
        onRetry={() => void financeQuery.refetch()}
      />
    )
  }

  if (financeQuery.data && !("connected" in financeQuery.data)) {
    return (
      <FinanceDashboard
        data={financeQuery.data}
        isRefreshing={financeQuery.isFetching}
        onRefresh={() => void financeQuery.refetch()}
        onSignOut={() => void handleSignOut()}
      />
    )
  }

  const connectToken = connectTokenMutation.data
  const isConnecting = connectTokenMutation.isPending
  const error =
    widgetError ??
    connectTokenMutation.error?.message ??
    saveConnectionMutation.error?.message

  return (
    <main className="st-auth-page">
      <Card as="section" className="st-auth-card">
        <div className="st-auth-brand">
          <div className="st-brand-mark st-auth-mark">
            <Landmark aria-hidden="true" size={21} />
          </div>
          <span>Finanças</span>
        </div>

        <div className="st-greeting">
          <span />
          Olá, {userName}
        </div>
        <h1>Conecte sua instituição.</h1>
        <p className="st-auth-intro">
          A conexão fica vinculada à sua conta para você não precisar autorizar
          novamente a cada acesso.
        </p>

        <div className="st-connect-note">
          <ShieldCheck aria-hidden="true" size={20} />
          <div>
            <strong>Acesso protegido</strong>
            <p>
              Seus dados são compartilhados com segurança e você controla a
              autorização.
            </p>
          </div>
        </div>

        <Button
          className="st-auth-submit st-connect-button"
          disabled={isConnecting || Boolean(connectToken)}
          onClick={() => connectTokenMutation.mutate()}
          type="button"
        >
          {isConnecting ? (
            <LoaderCircle
              aria-hidden="true"
              className="animate-spin"
              size={17}
            />
          ) : (
            <LockKeyhole aria-hidden="true" size={16} />
          )}
          {isConnecting
            ? "Preparando conexão..."
            : "Conectar minha instituição"}
          {!isConnecting && <ArrowRight aria-hidden="true" size={17} />}
        </Button>

        {error && (
          <p className="st-form-alert" role="alert">
            {error}
          </p>
        )}
        <p className="st-connect-hint">
          Você será direcionado ao ambiente seguro da Pluggy para autorizar o
          acesso.
        </p>
        <div className="st-auth-footer">
          <LockKeyhole aria-hidden="true" size={12} />
          Conexão criptografada e protegida
        </div>
      </Card>

      {connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={process.env.NODE_ENV !== "production"}
          language="pt"
          onClose={() => connectTokenMutation.reset()}
          onError={(error) => {
            setWidgetError(error.message || "A conexão não foi concluída.")
            connectTokenMutation.reset()
          }}
          onLoadError={(error) => {
            setWidgetError(
              error.message || "Não foi possível carregar a Pluggy."
            )
            connectTokenMutation.reset()
          }}
          onSuccess={(data) => {
            void handleConnectionSuccess(data.item.id)
          }}
        />
      )}
    </main>
  )
}
