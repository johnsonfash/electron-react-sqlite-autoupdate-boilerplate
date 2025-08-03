import type { dbClient } from '../../main/database/client';

type DBClient = typeof dbClient;

type DbCall = {
  model: string;
  method: string;
  args: any[];
};

async function callDb(payload: DbCall) {
  const res = await (window as any).db.call(payload);
  if (res?.__dbError) {
    const err = new Error(res.message || 'DB operation failed');
    (err as any).name = res.name || 'DbClientError';
    (err as any).stack = res.stack;
    throw err;
  }
  return res;
}

function createDbProxy<T extends object>(): T {
  return new Proxy({}, {
    get(_, modelName: string) {
      return new Proxy({}, {
        get(_, methodName: string) {
          return async (...args: any[]) => {
            return await callDb({
              model: modelName,
              method: methodName,
              args,
            });
          };
        },
      });
    },
  }) as T;
}

export const prisma: DBClient = createDbProxy();
