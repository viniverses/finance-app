import { defineConfig } from 'drizzle-kit';

import { env } from '@/env';

export default defineConfig({
  out: './db/migrations',
  schema: './db/schemas',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
