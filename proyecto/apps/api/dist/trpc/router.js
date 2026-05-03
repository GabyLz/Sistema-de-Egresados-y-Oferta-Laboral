"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const server_1 = require("@trpc/server");
const t = server_1.initTRPC.create();
exports.appRouter = t.router({
    healthCheck: t.procedure.query(() => ({ status: 'ok' })),
    api: t.router({
        health: t.procedure.query(() => ({ status: 'healthy' })),
    }),
});
