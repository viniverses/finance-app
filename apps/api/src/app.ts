import { node } from '@elysiajs/node';
import { Elysia } from 'elysia';

import { env } from '@/env';
import { authenticationRoutes } from '@/features/authentication/http/authenticate.routes.ts';
import { corsPlugin } from '@/shared/http/plugins/cors.plugin.ts';
import { errorResponses, httpPlugin } from '@/shared/http/plugins/http.plugin.ts';
import { swaggerPlugin } from '@/shared/http/plugins/swagger.plugin.ts';

const app = new Elysia({ adapter: node() })
  .use(swaggerPlugin)
  .use(corsPlugin)
  .use(httpPlugin)
  .guard({
    response: errorResponses,
  })
  .use(authenticationRoutes);

app.listen(env.PORT, ({ hostname, port }) => {
  console.log(`🦊 Elysia is running at ${hostname}:${port}`);
});

export { app };
