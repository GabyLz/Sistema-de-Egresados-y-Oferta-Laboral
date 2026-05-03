import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<any>();

export const createTRPCClient = () => {
  throw new Error('tRPC client is not used in this build; use the REST API helpers instead.');
};