import { node } from '@elysiajs/node';
import { Elysia } from 'elysia';

import { env } from '@/env';
import { corsPlugin } from '@/shared/http/plugins/cors.ts';
import { errorResponses, httpPlugin } from '@/shared/http/plugins/http.ts';
import { swaggerPlugin } from '@/shared/http/plugins/swagger.ts';
import { privateRoutes } from '@/shared/http/routes/private.ts';
import { publicRoutes } from '@/shared/http/routes/public.ts';

const app = new Elysia({ adapter: node() })
  .use(swaggerPlugin)
  .use(corsPlugin)
  .use(httpPlugin)
  .guard({
    response: errorResponses,
  })
  .use(publicRoutes)
  .use(privateRoutes);

app.listen(env.PORT, ({ hostname, port }) => {
  console.log(`🦊 Elysia is running at ${hostname}:${port}`);
});

export { app };
