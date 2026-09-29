import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import { appSchema } from "./app-schema"
import { authSchema } from "./auth-schema"

const sql = neon(process.env.DATABASE_URL ?? "")

export const db = drizzle({
  client: sql,
  schema: { ...authSchema, ...appSchema },
})
