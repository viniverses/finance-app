import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().default('3000').transform(Number),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  API_VERSION: z.string().min(1, 'API_VERSION is required'),
  API_DOCS_PATH: z.string().min(1, 'API_DOCS_PATH is required'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Invalid environment variables');
    console.error(z.treeifyError(result.error));
    throw new Error('Invalid environment variables');
  }

  return result.data;
};

export const env = parseEnv();
