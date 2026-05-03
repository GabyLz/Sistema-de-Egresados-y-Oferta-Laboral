import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const appRouter = t.router({
  healthCheck: t.procedure.query(() => ({ status: 'ok' })),
  api: t.router({
    health: t.procedure.query(() => ({ status: 'healthy' })),
  }),
});

export type AppRouter = typeof appRouter;
