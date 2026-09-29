import { drizzleAdapter } from "@better-auth/drizzle-adapter"
import { type Auth } from "better-auth"
import { betterAuth } from "better-auth/minimal"
import { nextCookies } from "better-auth/next-js"

import { authSchema } from "./auth-schema"
import { db } from "./db"

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins: [baseURL],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [nextCookies()],
}) as unknown as Auth
