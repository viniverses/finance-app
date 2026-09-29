"use client"

import "./finance-dashboard.css"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { ArrowRight, Landmark, LoaderCircle, LockKeyhole } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"

type AuthFormProps = {
  mode: "sign-in" | "sign-up"
}

const authFormSchema = z.object({
  name: z.string().trim().max(80, "O nome deve ter no máximo 80 caracteres."),
  email: z.string().trim().email("Digite um email válido."),
  password: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(128, "A senha deve ter no máximo 128 caracteres."),
})

type AuthFormValues = z.infer<typeof authFormSchema>

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const isSignUp = mode === "sign-up"
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<AuthFormValues>({
    defaultValues: { email: "", name: "", password: "" },
    resolver: zodResolver(authFormSchema),
  })

  async function handleAuth(values: AuthFormValues) {
    setError(null)

    const result = isSignUp
      ? await authClient.signUp.email(values)
      : await authClient.signIn.email({
          email: values.email,
          password: values.password,
        })

    if (result.error) {
      setError(
        result.error.message ||
          (isSignUp
            ? "Não foi possível criar sua conta."
            : "Email ou senha inválidos.")
      )
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <main className="st-auth-page">
      <section className="st-auth-card">
        <div className="st-auth-brand">
          <div className="st-brand-mark st-auth-mark">
            <Landmark aria-hidden="true" size={21} />
          </div>
          <span>Finanças</span>
        </div>

        <h1>
          {isSignUp ? "Crie seu espaço financeiro." : "Bem-vindo de volta."}
        </h1>
        <p className="st-auth-intro">
          {isSignUp
            ? "Crie sua conta para guardar sua conexão e acompanhar tudo em um só lugar."
            : "Entre para acessar seus cartões e suas transações recentes."}
        </p>

        <form
          className="st-auth-form"
          onSubmit={handleSubmit(handleAuth)}
          noValidate
        >
          {isSignUp && (
            <div className="st-field">
              <Label htmlFor="name">Nome</Label>
              <Input
                aria-invalid={Boolean(errors.name)}
                autoComplete="name"
                className="st-auth-input"
                id="name"
                placeholder="Como podemos chamar você?"
                {...register("name")}
              />
              {errors.name && <FieldError message={errors.name.message} />}
            </div>
          )}

          <div className="st-field">
            <Label htmlFor="email">Email</Label>
            <Input
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className="st-auth-input"
              id="email"
              placeholder="voce@email.com"
              type="email"
              {...register("email")}
            />
            {errors.email && <FieldError message={errors.email.message} />}
          </div>

          <div className="st-field">
            <Label htmlFor="password">Senha</Label>
            <Input
              aria-invalid={Boolean(errors.password)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="st-auth-input"
              id="password"
              placeholder="Mínimo de 8 caracteres"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <FieldError message={errors.password.message} />
            )}
          </div>

          {error && (
            <p className="st-form-alert" role="alert">
              {error}
            </p>
          )}

          <Button
            className="st-auth-submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <LoaderCircle
                aria-hidden="true"
                className="animate-spin"
                size={17}
              />
            ) : (
              <LockKeyhole aria-hidden="true" size={16} />
            )}
            {isSubmitting
              ? "Aguarde..."
              : isSignUp
                ? "Criar minha conta"
                : "Entrar"}
            {!isSubmitting && (
              <ArrowRight aria-hidden="true" className="ml-auto" size={17} />
            )}
          </Button>
        </form>

        <p className="st-auth-switch">
          {isSignUp ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
          <Link href={isSignUp ? "/sign-in" : "/sign-up"}>
            {isSignUp ? "Entrar" : "Criar conta"}
          </Link>
        </p>
      </section>
    </main>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null

  return <p className="st-field-error">{message}</p>
}
